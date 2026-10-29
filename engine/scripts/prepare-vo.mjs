// Usage: node scripts/prepare-vo.mjs <video id> <full recording> [start-end,start-end,...]
//
// Turns one voiceover take for a whole reel into per-scene clips:
//   1. upmixes a mono take to stereo (the reel's mix is stereo: a mono clip levelled alone lands about
//      3 dB louder there), removes rumble and mic thumps below 90 Hz (phone recordings pop on "p", "b",
//      "k"), then brings it to -16 LUFS with one fixed gain and a peak limiter (about -3 dBTP, room for music and SFX),
//   2. transcribes it with Whisper (local) and lines the words up with the script,
//   3. cuts at the pause nearest each scene boundary (or at the ranges you pass, in seconds),
//   4. writes public/vo/<reel>/<scene>.wav (30 ms fades at both ends) plus <scene>.words.json for word-accurate cues and captions,
//      and out/<reel>-take.json with the full take's words in absolute seconds, for picking ranges.
import fs from "fs";
import path from "path";
import { execSync, spawnSync } from "child_process";
import { downloadWhisperModel, installWhisperCpp, transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { scriptWordTimes, splitWords } from "../src/align.mjs";
import { TIME } from "../src/motion.mjs";
import { paceAudit } from "./pace.mjs";
import { ffmpeg, duration, highpass, level, fade } from "./vo-audio.mjs";

// The rate the script planned at (2.1 words/s since 0.14.0). A slower take stretches every scene and
// pushes the CTA later without changing a word — see scripts/pace.mjs for why that gate exists.
const PLANNED_WPS = 2.1;

const [reelId, input, ranges] = process.argv.slice(2);
if (!reelId || !input) {
  console.error("Usage: node scripts/prepare-vo.mjs <video id> <recording> [start-end,...]");
  process.exit(1);
}

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

const silences = (file) => {
  const res = spawnSync("ffmpeg", ["-hide_banner", "-i", `"${file}"`, "-af", "silencedetect=noise=-30dB:d=0.2", "-f", "null", "-"], {
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
// High-pass first, then level, so the peak limit holds on the filtered voice. Stereo before measuring,
// so -16 LUFS is what the stereo mix hears.
const filtered = path.join("out", `${reelId}-highpassed.wav`);
ffmpeg(`-i "${input}" -ac 2 -ar 48000 -c:a pcm_s16le "${filtered}"`);
highpass(filtered);
const normalised = path.join("out", `${reelId}-normalised.wav`);
fs.copyFileSync(filtered, normalised);
level(normalised);
const total = duration(normalised);

// Full-take words with absolute times (the format /hookreel:voice documents): pick explicit ranges from
// this file. A rerun with ranges keeps the one the first run saved, so there is no second full pass.
const takeFile = path.join("out", `${reelId}-take.json`);
const heard = ranges && fs.existsSync(takeFile) ? null : await hear(normalised);
if (heard) {
  fs.writeFileSync(takeFile, JSON.stringify(heard, null, 2));
  console.log(`Full-take transcript (absolute seconds): ${takeFile}`);
}

let segments;
if (ranges) {
  segments = ranges.split(",").map((r) => r.split("-").map(Number));
} else {
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
const paced = [];
for (const [i, [start, end]] of segments.entries()) {
  const scene = scenes[i];
  const clip = path.join(outDir, `${scene.id}.wav`);
  ffmpeg(`-ss ${start.toFixed(3)} -t ${(end - start).toFixed(3)} -i "${normalised}" "${clip}"`);
  fade(clip);
  const words = await hear(clip);
  fs.writeFileSync(path.join(outDir, `${scene.id}.words.json`), JSON.stringify(words, null, 2));
  console.log(`\n${scene.id}  ${start.toFixed(2)}s → ${end.toFixed(2)}s`);
  console.log(`  script: ${scene.vo}`);
  console.log(`  heard:  ${words.map((x) => x.text).join(" ")}`);
  // Against the planned pace; a clip twice as long hides a retake or false starts.
  const estimate = splitWords(scene.vo).length / PLANNED_WPS;
  paced.push({ id: scene.id, actual: end - start, est: estimate });
  if (end - start > 2 * estimate)
    console.warn(`  WARNING: clip is ${(end - start).toFixed(1)}s, over 2× the ${estimate.toFixed(1)}s estimate; check for a retake or false starts and cut it with explicit ranges (see out/${reelId}-take.json)`);
}

// Pace gate (scripts/pace.mjs): a take slower than the plan re-times the whole reel, and the CTA leaves
// the part of the runtime where viewers still are. The clips are written either way; this stops the
// build so the scene times are fixed before any motion work.
const pace = paceAudit({
  paced,
  wordCount: scenes.reduce((n, s) => n + splitWords(s.vo).length, 0),
  sceneCount: scenes.length,
  wps: PLANNED_WPS,
  pad: TIME.leadIn + TIME.tail,
});
if (pace.fail.length && !process.argv.includes("--allow-drift")) {
  pace.fail.forEach((line) => console.error(line));
  process.exit(1);
}
console.log(`\n${pace.message}`);

// Let the studio know about the new clips.
execSync("node scripts/register-videos.mjs", { stdio: "inherit" });
