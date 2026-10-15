// Usage:
//   node scripts/storyboard.mjs <video id>                       (inside a studio)
//   node scripts/storyboard.mjs --video <file.json> [--brand <brand.json>] [--vo <dir>] [--out <file.md>] [--director <file.json>]
//
// The director's layer (video header, and per scene Intent / Composition / Transition) lives in
// director/<id>.json next to the videos/ folder and is merged in on every run, so a revision only
// edits the scenes that changed: { "header": "…", "scenes": { "<scene id>": { "intent", "composition", "transition" } } }.
// Any text may be a string or an array of lines.
//
// Writes a frame-exact storyboard from the same planners the render uses (src/plan.ts), so what
// it says is what the video does: every element, movement, sound effect, caption and spoken
// word, with times in seconds and frames, frame = round(t × FPS). Before a voiceover exists the
// times are estimates at 2.5 words per second; after `npm run vo` they follow the recording.
// Needs only Node 22.18+ (no npm install).
import fs from "fs";
import path from "path";
import { scriptWordTimes, splitWords } from "../src/align.ts";
import { captionChunks, charToFrame, estimateSeconds, LEAD_IN, makeCue, toTiming } from "../src/cue.ts";
import { f, FPS, sfxVolume, styleMotion, TIME } from "../src/motion.ts";
import { planShell, planVisual } from "../src/plan.ts";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const id = args[0] && !args[0].startsWith("--") ? args[0] : undefined;
const videoPath = opt("video") ?? (id ? path.join("videos", `${id}.json`) : undefined);
if (!videoPath) {
  console.error("Usage: node scripts/storyboard.mjs <video id> | --video <file.json> [--brand <brand.json>] [--vo <dir>] [--out <file.md>]");
  process.exit(1);
}
const video = JSON.parse(fs.readFileSync(videoPath, "utf8"));
const brandPath = opt("brand") ?? "brand.json";
const brand = fs.existsSync(brandPath) ? JSON.parse(fs.readFileSync(brandPath, "utf8")) : {};
const voDir = opt("vo") ?? path.join("public", "vo", video.id);
const outPath = opt("out") ?? path.join("storyboard", `${video.id}.md`);
const directorPath = opt("director") ?? path.join(path.dirname(videoPath), "..", "director", `${video.id}.json`);
const director = fs.existsSync(directorPath) ? JSON.parse(fs.readFileSync(directorPath, "utf8")) : null;
const text = (x) => (Array.isArray(x) ? x.join("\n") : (x ?? ""));
const enter = f((brand.motion?.entranceMs ?? 360) / 1000);
const motion = styleMotion(brand.style, brand.motion);
const level = video.audio?.sfx ?? "medium";

// Duration of a PCM WAV from its header.
const wavSeconds = (file) => {
  const b = fs.readFileSync(file);
  let p = 12;
  let byteRate = 0;
  while (p < b.length) {
    const id = b.toString("ascii", p, p + 4);
    const size = b.readUInt32LE(p + 4);
    if (id === "fmt ") byteRate = b.readUInt32LE(p + 16);
    if (id === "data") return size / byteRate;
    p += 8 + size + (size % 2);
  }
  return null;
};

const s = (frames) => (frames / FPS).toFixed(2);
const clean = (x) => String(x).replace(/\|/g, "\\|");
let recorded = 0;
const timings = video.scenes.map((scene) => {
  const wav = path.join(voDir, `${scene.id}.wav`);
  const words = path.join(voDir, `${scene.id}.words.json`);
  if (fs.existsSync(wav)) {
    recorded++;
    const seconds = wavSeconds(wav) ?? estimateSeconds(scene.vo);
    const heard = fs.existsSync(words) ? JSON.parse(fs.readFileSync(words, "utf8")) : null;
    return toTiming(seconds, wav, heard ? scriptWordTimes(scene.vo, heard, seconds) : null);
  }
  return toTiming(estimateSeconds(scene.vo), null);
});
const total = timings.reduce((a, t) => a + t.duration, 0);
const status =
  recorded === video.scenes.length ? "AS RECORDED — times follow the voiceover" : recorded ? `PARTLY RECORDED (${recorded}/${video.scenes.length} scenes)` : "PLANNED — times are estimates (2.5 words/s) until the voiceover is recorded";

const lines = [];
lines.push(`# Storyboard · ${video.title} (\`${video.id}\`)`, "");
lines.push(`- Status: **${status}**`);
lines.push(`- Format: ${video.width ?? 1080}×${video.height ?? 1920}, **${FPS} fps**, frame = round(t × ${FPS})`);
lines.push(`- Length: ${s(total)} s = ${total} frames · ${video.scenes.length} scenes`);
const entranceText = { rise: `fade + rise ${TIME.rise}px, ease-out`, focus: `fade in from a ${TIME.focus.blur}px blur + rise ${TIME.rise / 2}px, ease-out`, pop: `pop: spring scale ${TIME.pop.scale}→1 with a small overshoot (bounce), settles in ≈${TIME.pop.settle} s` }[motion.entrance];
lines.push(`- Style: ${brand.style ?? "clean"} · Entrance: ${Math.round((enter / FPS) * 1000)} ms, ${entranceText} · ${motion.idle === "float" ? `elements float ±${TIME.float.amp}px (characters ±${TIME.float.characterAmp}px) every ${TIME.float.period} s, looping` : "nothing loops"}`);
lines.push(`- Sound effects: ${level} · Music: ${video.audio?.music ? `${video.audio.music.src} from ${video.audio.music.startAt ?? 0}s, ducked under the voice (${video.audio.music.underVoice ?? TIME.music.underVoice}) and up in pauses (${video.audio.music.inPauses ?? TIME.music.inPauses}), fade in ${TIME.music.fadeIn}s, fade out ${TIME.music.fadeOut}s` : "none"}`);
const capStyle = [brand.captions?.align === "center" ? "centred at the bottom" : "left-aligned", brand.captions?.reveal === "word" ? "each word appears as it is spoken" : "one line at a time"].join(", ");
lines.push(`- Captions: ${video.captions === false ? "off" : `on, from the voiceover text, at y≈1340, ${capStyle}`}`, "");
if (director?.header) lines.push("## Video header (director)", "", text(director.header), "");
lines.push("Times: **t** = seconds from the start of the video, **F** = frame from the start of the video, **f** = frame inside the scene.", "");

let start = 0;
video.scenes.forEach((scene, i) => {
  const timing = timings[i];
  const ctx = { vo: scene.vo, voFrames: timing.voFrames, duration: timing.duration, words: timing.words };
  const planCtx = { cue: makeCue(ctx), enter, ...motion };
  const events = [...planShell(scene, planCtx, timing.duration, i === 0).events, ...planVisual(scene.visual, planCtx, Boolean(video.cta)).events];

  // Spoken words and caption lines, as events too.
  const words = splitWords(scene.vo).map((w) => ({ word: w.word, at: Math.round(charToFrame(ctx, w.offset)) }));
  const captions = captionChunks(scene.vo, brand.captions?.reveal === "word" ? 4 : 8).map((c) => ({ text: c.text, at: Math.round(charToFrame(ctx, c.start)) }));
  events.push({ at: LEAD_IN, layer: "voiceover", action: `starts: "${scene.vo}"`, until: LEAD_IN + timing.voFrames });
  for (const c of captions) events.push({ at: c.at, layer: "caption", action: `shows "${c.text}"`, motion: brand.captions?.reveal === "word" ? `words fade in one by one as they are spoken, ${Math.round(TIME.captionIn * 1000)} ms each` : `fade in over ${Math.round(TIME.captionIn * 1000)} ms` });
  events.sort((a, b) => a.at - b.at);

  lines.push(`## Scene ${i + 1} · \`${scene.id}\` · ${scene.visual.type}`, "");
  const d = director?.scenes?.[scene.id];
  if (d) lines.push(`**Intent:** ${text(d.intent)}`, "", "**Composition:**", text(d.composition), "", `**Transition in and out:** ${text(d.transition)}`, "");
  lines.push(`- From **${s(start)} s** to **${s(start + timing.duration)} s** (F ${start}–${start + timing.duration}, ${s(timing.duration)} s)`);
  lines.push(`- Voiceover from f ${LEAD_IN} (${s(start + LEAD_IN)} s), ${s(timing.voFrames)} s long: "${scene.vo}"`, "");
  lines.push("| t (s) | F | f | Layer | What happens | Movement | Ends (t) | Sound (final volume) |");
  lines.push("|---:|---:|---:|---|---|---|---:|---|");
  for (const e of events) {
    if (e.at >= timing.duration) continue;
    const sound = e.sfx ? (() => {
      const v = sfxVolume(e.sfx.name, level, e.sfx.volume);
      const n = `${e.sfx.name}${e.sfx.pitch !== undefined ? ` +${e.sfx.pitch}` : ""}`;
      if (scene.mute === true || (Array.isArray(scene.mute) && scene.mute.includes(e.sfx.name))) return `${n} (muted in this scene)`;
      if ((video.audio?.mute ?? []).includes(e.sfx.name)) return `${n} (muted in this video)`;
      return v === null ? `${n} (muted at ${level})` : `${n} ${v.toFixed(2)}${e.sfx.length ? `, ${s(e.sfx.length)} s` : ""}`;
    })() : "";
    lines.push(`| ${s(start + e.at)} | ${start + e.at} | ${e.at} | ${clean(e.layer)} | ${clean(e.action)} | ${clean(e.motion ?? "")} | ${e.until !== undefined ? s(start + e.until) : ""} | ${sound} |`);
  }

  // Second by second: what is said, which caption shows, what moves.
  lines.push("", "Second by second:", "", "| Second | Said | Caption on screen | Moving or entering |", "|---|---|---|---|");
  for (let sec = Math.floor(start / FPS); sec * FPS < start + timing.duration; sec++) {
    const a = sec * FPS - start;
    const b = a + FPS;
    const said = words.filter((w) => w.at >= a && w.at < b).map((w) => w.word).join(" ");
    const cap = [...captions].reverse().find((c) => c.at <= b - 1);
    const moving = events
      .filter((e) => e.layer !== "caption" && e.layer !== "voiceover" && (e.at < b && (e.until ?? e.at + 1) > Math.max(0, a)))
      .map((e) => e.layer)
      .filter((v, k, arr) => arr.indexOf(v) === k);
    lines.push(`| ${sec}–${sec + 1} s | ${clean(said)} | ${clean(cap?.text ?? "")} | ${clean(moving.join("; "))} |`);
  }
  lines.push("");
  start += timing.duration;
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join("\n"));
const missing = director ? video.scenes.filter((sc) => !director.scenes?.[sc.id]).map((sc) => sc.id) : [];
if (missing.length) console.warn(`director's layer missing for: ${missing.join(", ")}`);
console.log(`${status}${director ? " · director's layer merged" : ""}\n${outPath}: ${video.scenes.length} scenes, ${s(total)} s, ${total} frames at ${FPS} fps`);
