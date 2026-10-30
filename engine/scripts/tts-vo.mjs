// Usage: node scripts/tts-vo.mjs <video id> [--dry] [--voice <id>] [--model <id>] [--allow-drift]
//   npm run tts -- <video id>
//
// An ElevenLabs voiceover with exact word times: no Whisper, no pause hunting, no hand-picked ranges.
//   1. joins every scene's `say` (or `vo`) from videos/<id>.json into one take (one request keeps the
//      delivery consistent) and asks ElevenLabs' with-timestamps endpoint for it, which returns the
//      audio and the start and end time of every character,
//   2. levels the take for the stereo mix (-16 LUFS, peak limiter; the same as prepare-vo.mjs),
//   3. cuts it at the middle of the silence between the last character of one scene and the first of
//      the next, and writes public/vo/<id>/<scene>.wav plus <scene>.words.json from the character times,
//   4. runs the pace gate (scripts/pace.mjs). Then `npm run words -- <id>`.
//
// Numbers and abbreviations: put the spoken form in the scene's `say`, as {shown|spoken} spans, e.g.
//   "vo":  "Klaim Rp900 juta dibayar."
//   "say": "Klaim {Rp900 juta|sembilan ratus juta rupiah} dibayar."
// The shown text becomes the word in words.json, so cues on "Rp900" land where it is spoken.
//
// Key: ELEVENLABS_API_KEY in .env.local or .env (never in code or in videos/). Voice: --voice, `tts.voice` in
// videos/<id>.json, or ELEVENLABS_VOICE_ID; there is no fallback voice on purpose (only the
// account owner's own or a licensed voice). Model: --model, `tts.model`, ELEVENLABS_MODEL_ID, else
// eleven_multilingual_v2. `tts.settings` is passed as voice_settings (e.g. { "stability": 0.5, "speed": 1 }).
// `tts.prefix` (eleven_v3 and eleven_v4 only, e.g. "[warm, calm, like explaining to a friend]") is an
// audio tag put in front of the take; its characters are dropped from the alignment before the cut, so
// the word times do not move. Other models would read the tag aloud, so it is skipped there with a warning.
// The take and its character times are cached in out/<id>-tts.*: an unchanged script costs no credits.
// --dry prints what would be sent and spends nothing.
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { splitWords } from "../src/align.mjs";
import { TIME } from "../src/motion.mjs";
import { paceAudit } from "./pace.mjs";
import { ffmpeg, duration, level, fade } from "./vo-audio.mjs";
import { lcsMap } from "./word-times.mjs";

const PLANNED_WPS = 2.1; // the same plan rate as prepare-vo.mjs

// "Klaim {Rp900 juta|sembilan ratus juta rupiah} dibayar." → the spoken text, plus its words, each
// with the text words.json gets (the shown form for a span) and its character range in the spoken text.
export const parseSay = (say) => {
  let spoken = "";
  const words = [];
  for (const m of say.matchAll(/\{([^|}]*)\|([^}]*)\}|(\S+)|(\s+)/g)) {
    const [, shown, said, word, space] = m;
    const from = spoken.length;
    spoken += said ?? word ?? space;
    if (space === undefined) words.push({ text: shown ?? word, from, to: spoken.length });
  }
  return { spoken, words };
};

// Character times on the spoken text: alignment = { characters, character_start_times_seconds,
// character_end_times_seconds }. ElevenLabs may normalise a character or two, so the two strings are
// matched by longest common subsequence; an unmatched character takes its nearest matched neighbour.
export const charTimes = (spoken, alignment) => {
  const heard = alignment.characters.join("");
  const map = lcsMap(spoken, heard);
  const at = (i, which) => {
    for (let d = 0; d < spoken.length; d++) {
      for (const k of [i - d, i + d]) if (map.has(k)) return alignment[which][map.get(k)];
    }
    return 0;
  };
  return { start: (i) => at(i, "character_start_times_seconds"), end: (i) => at(i, "character_end_times_seconds") };
};

// The prefix's characters at the head of the alignment, removed so it lines up with the script text
// again. An alignment that already leaves the tag out is returned unchanged.
export const dropPrefix = (alignment, head) => {
  if (!head || !alignment.characters.join("").startsWith(head)) return alignment;
  const n = head.length;
  return {
    characters: alignment.characters.slice(n),
    character_start_times_seconds: alignment.character_start_times_seconds.slice(n),
    character_end_times_seconds: alignment.character_end_times_seconds.slice(n),
  };
};

// Clip ranges and word fragments for every scene of the take. `parts` = parseSay per scene, `offsets` =
// where each scene's spoken text starts in the take, `total` = take length in seconds.
export const cutTake = (parts, offsets, times, total) => {
  const bounds = parts.map((p, k) => {
    const first = p.words[0], last = p.words[p.words.length - 1];
    return { first: times.start(offsets[k] + first.from), last: times.end(offsets[k] + last.to - 1) };
  });
  return parts.map((p, k) => {
    // Room tone: 0.1 s before the first word and up to 0.25 s after the last, never past the middle of the
    // silence to the next scene (the same margins prepare-vo.mjs uses on a recorded take).
    const start = k === 0 ? Math.max(0, bounds[0].first - 0.1) : Math.max((bounds[k - 1].last + bounds[k].first) / 2, bounds[k].first - 0.25);
    const end = k === parts.length - 1 ? Math.min(total, bounds[k].last + 0.25) : Math.min((bounds[k].last + bounds[k + 1].first) / 2, bounds[k].last + 0.25);
    const r = (x) => Math.round(x * 1000) / 1000;
    const words = p.words.map((w) => ({ text: w.text, start: r(times.start(offsets[k] + w.from) - start), end: r(times.end(offsets[k] + w.to - 1) - start) }));
    return { start, end, words };
  });
};

const main = async (reelId, argv) => {
  const opt = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
  for (const f of [".env.local", ".env"]) if (fs.existsSync(f)) process.loadEnvFile(f);
  const video = JSON.parse(fs.readFileSync(path.join("videos", `${reelId}.json`), "utf8"));
  const { scenes } = video;
  const voice = opt("--voice") ?? video.tts?.voice ?? process.env.ELEVENLABS_VOICE_ID;
  const model = opt("--model") ?? video.tts?.model ?? process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
  const settings = video.tts?.settings;
  const tags = /^eleven_v[34]/.test(model);
  if (video.tts?.prefix && !tags) console.warn(`warn: tts.prefix skipped: ${model} reads audio tags aloud (eleven_v3 or eleven_v4 only)`);
  const head = video.tts?.prefix && tags ? `${video.tts.prefix} ` : "";

  const parts = scenes.map((s) => parseSay(s.say ?? s.vo));
  const offsets = [];
  let text = "";
  parts.forEach((p, k) => {
    if (k) text += "\n\n";
    offsets.push(text.length);
    text += p.spoken;
  });
  console.log(`${reelId}: ${scenes.length} scenes, ${text.length} characters, model ${model}, voice ${voice ?? "(none)"}`);
  if (!voice) throw new Error("No voice: set tts.voice in videos/<id>.json, ELEVENLABS_VOICE_ID in .env.local, or pass --voice <id>.");
  if (argv.includes("--dry")) {
    console.log(`\n--dry: nothing sent.\n${head}${text}`);
    return;
  }

  // Cached take: the same text, voice, model and settings cost nothing the second time.
  fs.mkdirSync("out", { recursive: true });
  const hash = crypto.createHash("sha1").update(JSON.stringify({ text, voice, model, settings, ...(head ? { head } : {}) })).digest("hex").slice(0, 12);
  const cacheFile = path.join("out", `${reelId}-tts.json`);
  const takeFile = path.join("out", `${reelId}-tts.mp3`);
  let cached = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : null;
  if (cached?.hash !== hash || !fs.existsSync(takeFile)) {
    if (!process.env.ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY missing: put it in .env.local (never in code).");
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ text: head + text, model_id: model, ...(settings ? { voice_settings: settings } : {}) }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const body = await res.json();
    fs.writeFileSync(takeFile, Buffer.from(body.audio_base64, "base64"));
    cached = { hash, voice, model, settings, characterCost: res.headers.get("character-cost"), alignment: body.alignment };
    fs.writeFileSync(cacheFile, JSON.stringify(cached));
    console.log(`wrote ${takeFile}, character-cost ${cached.characterCost ?? "?"}`);
  } else console.log(`${takeFile} is current (no request, no credits)`);

  // Stereo before levelling, so -16 LUFS is what the stereo mix hears (see prepare-vo.mjs).
  const take = path.join("out", `${reelId}-tts.wav`);
  ffmpeg(`-i "${takeFile}" -ac 2 -ar 48000 -c:a pcm_s16le "${take}"`);
  level(take);
  const cuts = cutTake(parts, offsets, charTimes(text, dropPrefix(cached.alignment, head)), duration(take));

  const outDir = path.join("public", "vo", reelId);
  fs.mkdirSync(outDir, { recursive: true });
  const paced = [];
  cuts.forEach(({ start, end, words }, k) => {
    const scene = scenes[k];
    const clip = path.join(outDir, `${scene.id}.wav`);
    ffmpeg(`-ss ${start.toFixed(3)} -t ${(end - start).toFixed(3)} -i "${take}" "${clip}"`);
    fade(clip);
    fs.writeFileSync(path.join(outDir, `${scene.id}.words.json`), JSON.stringify(words, null, 2));
    console.log(`${scene.id}  ${start.toFixed(2)}s → ${end.toFixed(2)}s  ${words.map((w) => `${w.text}@${w.start}`).join(" ")}`);
    paced.push({ id: scene.id, actual: end - start, est: splitWords(scene.vo).length / PLANNED_WPS });
  });

  const pace = paceAudit({ paced, wordCount: scenes.reduce((n, s) => n + splitWords(s.vo).length, 0), sceneCount: scenes.length, wps: PLANNED_WPS, pad: TIME.leadIn + TIME.tail });
  if (pace.fail.length && !argv.includes("--allow-drift")) {
    pace.fail.forEach((line) => console.error(line));
    process.exit(1);
  }
  console.log(`\n${pace.message}`);
  console.log(`\nNext: npm run words -- ${reelId}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  if (argv[0] === "--self-test") {
    // Two scenes, a spoken number, and an alignment where ElevenLabs dropped one character.
    const parts = [parseSay("Klaim {Rp900 juta|sembilan ratus juta} dibayar."), parseSay("Cek polis.")];
    const text = `${parts[0].spoken}\n\n${parts[1].spoken}`;
    const chars = [...text];
    const alignment = { characters: chars.filter((_, i) => i !== 3), character_start_times_seconds: [], character_end_times_seconds: [] };
    alignment.characters.forEach((_, i) => {
      const gap = i >= text.indexOf("\n") - 1 ? 0.6 : 0; // a pause between the scenes
      alignment.character_start_times_seconds.push(i * 0.05 + gap);
      alignment.character_end_times_seconds.push(i * 0.05 + 0.05 + gap);
    });
    const cuts = cutTake(parts, [0, text.indexOf("Cek")], charTimes(text, alignment), 10);
    const got = cuts.map((c) => c.words.map((w) => w.text));
    if (JSON.stringify(got) !== JSON.stringify([["Klaim", "Rp900 juta", "dibayar."], ["Cek", "polis."]])) throw new Error(`self-test words: ${JSON.stringify(got)}`);
    if (!(cuts[0].end <= cuts[1].start && cuts[0].end > cuts[0].words[2].end)) throw new Error(`self-test cut: ${JSON.stringify(cuts.map((c) => [c.start, c.end]))}`);
    if (cuts[1].words[0].start < 0 || cuts[0].words[1].start <= cuts[0].words[0].start) throw new Error("self-test times");
    // A prefix in the alignment: dropped, the same cuts as without it; absent: unchanged.
    const head = "[warm, calm] ";
    const late = { characters: alignment.characters }; // the same take, 1.5 s later behind the tag
    for (const k of ["character_start_times_seconds", "character_end_times_seconds"]) late[k] = alignment[k].map((x) => x + 1.5);
    const tagged = { characters: [...head, ...late.characters] };
    for (const k of ["character_start_times_seconds", "character_end_times_seconds"]) tagged[k] = [...[...head].map((_, i) => i * 0.1), ...late[k]];
    const words = (a) => JSON.stringify(cutTake(parts, [0, text.indexOf("Cek")], charTimes(text, a), 10).map((c) => c.words));
    if (words(dropPrefix(tagged, head)) !== words(late)) throw new Error("self-test prefix");
    if (dropPrefix(alignment, head) !== alignment) throw new Error("self-test prefix absent");
    console.log("self-test ok");
  } else if (!argv[0] || argv[0].startsWith("--")) {
    console.error("Usage: node scripts/tts-vo.mjs <video id> [--dry] [--voice <id>] [--model <id>] [--allow-drift]");
    process.exit(1);
  } else await main(argv[0], argv);
}
