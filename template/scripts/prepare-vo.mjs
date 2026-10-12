// Usage: node scripts/prepare-vo.mjs <video id> <full recording> [start-end,start-end,...]
//
// Turns one voiceover take for a whole reel into per-scene clips:
//   1. loudness-normalises the take (-16 LUFS, peaks at -3 dBTP to leave room for music and SFX),
//   2. transcribes it with Whisper (local) and lines the words up with the script,
//   3. cuts at the pause nearest each scene boundary (or at the ranges you pass, in seconds),
//   4. writes public/vo/<reel>/<scene>.wav plus <scene>.words.json for word-accurate cues and captions.
import fs from "fs";
import path from "path";
import { execSync, spawnSync } from "child_process";
import { downloadWhisperModel, installWhisperCpp, transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { scriptWordTimes, splitWords } from "../src/align.ts";

const [reelId, input, ranges] = process.argv.slice(2);
if (!reelId || !input) {
  console.error("Usage: node scripts/prepare-vo.mjs <video id> <recording> [start-end,...]");
  process.exit(1);
}

const ffmpeg = (args) => execSync(`npx remotion ffmpeg -y -loglevel error ${args}`, { stdio: "inherit" });

// Scenes, in order, straight from the video file so it stays the single source of truth.
const { scenes, language = "en" } = JSON.parse(fs.readFileSync(path.join("videos", `${reelId}.json`), "utf8"));

// Whisper: the small English model for English takes, the multilingual "small" model otherwise
// (better for Indonesian and mixed-language voiceovers). Only used for timing; captions use the script.
const whisperDir = path.join(process.cwd(), "whisper.cpp");
const english = language.toLowerCase().startsWith("en");
const model = english ? "base.en" : "small";
await installWhisperCpp({ to: whisperDir, version: "1.5.5" });
await downloadWhisperModel({ model, folder: whisperDir });
const hear = async (file) => {
  const wav16 = path.resolve("out", "whisper-input.wav");
  // 1s of trailing silence: without it Whisper tends to drop the last words of a clip.
  ffmpeg(`-i "${file}" -af apad=pad_dur=1 -ar 16000 -ac 1 "${wav16}"`);
  const whisperCppOutput = await transcribe({
    model,
    whisperPath: whisperDir,
    whisperCppVersion: "1.5.5",
    inputPath: wav16,
    tokenLevelTimestamps: true,
    language: english ? undefined : language.toLowerCase().slice(0, 2),
  });
  // Drop anything Whisper "hears" in the padding (e.g. its [BLANK_AUDIO] marker, split into pieces).
  const length = duration(file);
  const words = toCaptions({ whisperCppOutput }).captions.filter((c) => c.startMs / 1000 < length - 0.02);
  const marker = words.findIndex((c) => c.text.includes("["));
  return (marker === -1 ? words : words.slice(0, marker)).map((c) => ({
    text: c.text.trim(),
    start: c.startMs / 1000,
    end: c.endMs / 1000,
  }));
};

const duration = (file) =>
  Number(
    spawnSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], {
      shell: true,
      encoding: "utf8",
    }).stdout.trim().split(/\s+/).pop(),
  );

const silences = (file) => {
  const res = spawnSync("npx", ["remotion", "ffmpeg", "-hide_banner", "-i", `"${file}"`, "-af", "silencedetect=noise=-30dB:d=0.2", "-f", "null", "-"], {
    shell: true,
    encoding: "utf8",
  });
  const out = [];
  const re = /silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g;
  let m;
  while ((m = re.exec(res.stderr))) out.push({ start: Number(m[1]), end: Number(m[2]) });
  return out;
};

fs.mkdirSync("out", { recursive: true });
const normalised = path.join("out", `${reelId}-normalised.wav`);
ffmpeg(`-i "${input}" -af loudnorm=I=-16:TP=-3:LRA=11 -ar 48000 "${normalised}"`);
const total = duration(normalised);

let segments;
if (ranges) {
  segments = ranges.split(",").map((r) => r.split("-").map(Number));
} else {
  const heard = await hear(normalised);
  const fullScript = scenes.map((s) => s.vo).join(" ");
  const times = scriptWordTimes(fullScript, heard, total);
  // Detect pauses on the original take: normalising lifts the room noise between sentences.
  const gaps = silences(input);
  let w = 0;
  const bounds = scenes.map((s) => {
    const n = splitWords(s.vo).length;
    const b = { first: times[w].start, last: times[w + n - 1].end };
    w += n;
    return b;
  });
  // Longest pause near the hand-over from scene k to k+1. Whisper's word times drift by a few
  // hundred ms, so look up to 0.8s either side.
  const pauseBetween = (a, b) => {
    let best = null;
    for (const g of gaps) {
      const near = Math.min(g.end, b + 0.8) > Math.max(g.start, a - 0.8);
      if (near && (!best || g.end - g.start > best.end - best.start)) best = g;
    }
    if (!best) console.warn(`  no pause found between ${a.toFixed(2)}s and ${b.toFixed(2)}s, cutting in the middle`);
    return best ?? { start: (a + b) / 2, end: (a + b) / 2 };
  };
  // Silence before the first word / after the last, ignoring clicks shorter than 150ms
  // (only at the edges: mid-take, a short burst can be a real word).
  let leadEnd = 0;
  for (const g of gaps) if (g.start - leadEnd < 0.15) leadEnd = g.end;
  let trailStart = total;
  for (const g of [...gaps].reverse()) if (trailStart - g.end < 0.15) trailStart = g.start;
  segments = bounds.map((b, k) => {
    const before = k === 0 ? { start: 0, end: leadEnd } : pauseBetween(bounds[k - 1].last, b.first);
    const after = k === bounds.length - 1 ? { start: trailStart, end: total } : pauseBetween(b.last, bounds[k + 1].first);
    // Room tone either side: 0.1s before the first word, up to 0.25s after the last (a word that
    // ends right at the cut tends to get dropped by the transcript), never past the pause's middle.
    const start = Math.max(0, before.end - 0.1, (before.start + before.end) / 2);
    const end = Math.min(total, after.start + 0.25, (after.start + after.end) / 2);
    return [Math.min(start, before.end), Math.max(end, after.start)];
  });
}

for (let k = 1; k < segments.length; k++) {
  if (segments[k][0] < segments[k - 1][1]) {
    const mid = (segments[k][0] + segments[k - 1][1]) / 2;
    segments[k - 1][1] = mid;
    segments[k][0] = mid;
  }
}

if (segments.length !== scenes.length) {
  throw new Error(`${segments.length} segments for ${scenes.length} scenes (${scenes.map((s) => s.id).join(", ")})`);
}

const outDir = path.join("public", "vo", reelId);
fs.mkdirSync(outDir, { recursive: true });
for (const [i, [start, end]] of segments.entries()) {
  const scene = scenes[i];
  const clip = path.join(outDir, `${scene.id}.wav`);
  ffmpeg(`-ss ${start.toFixed(3)} -t ${(end - start).toFixed(3)} -i "${normalised}" "${clip}"`);
  const words = await hear(clip);
  fs.writeFileSync(path.join(outDir, `${scene.id}.words.json`), JSON.stringify(words, null, 2));
  console.log(`\n${scene.id}  ${start.toFixed(2)}s → ${end.toFixed(2)}s`);
  console.log(`  script: ${scene.vo}`);
  console.log(`  heard:  ${words.map((x) => x.text).join(" ")}`);
}
