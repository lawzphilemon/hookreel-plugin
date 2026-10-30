// Usage: node scripts/assemble.mjs <video id>        (npm run assemble -- <video id>)
//
// Builds the HyperFrames project of one video in reels/<id>/ from what the studio already has:
//   reels/<id>/compositions/<scene id>.html   the scenes, written by hand per video (/hookreel:build)
//   reels/<id>/words.json                     scene lengths and spoken-word times (npm run words / tts / vo)
//   videos/<id>.json                          scene order, and `music` (a file in public/, optional)
// and writes:
//   reels/<id>/index.html     the root: one host per scene, back to back (scene = leadIn + speech + tail),
//                             the voiceover clip of every scene, the music bed; loads the kit and the words
//   reels/<id>/assets/        kit.js, kit.css, fonts, words.js, vo/<scene>.wav, music.wav (ducked under
//                             the voice), and every file under public/ the scenes reference as assets/<path>
// Run it after every change to the words, the scene list or the music; scene files are never touched.
// Scene hosts and timelines are keyed "s<scene id>" (an id cannot start with a digit in a CSS selector).
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { TIME } from "../src/motion.mjs";
import { pcm } from "./vo-audio.mjs";

// The engine folder (kit/, scripts/), wherever the studio installed it.
export const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const r3 = (n) => Math.round(n * 1000) / 1000;
export const key = (scene) => `s${scene}`;
// The clips are levelled to -16 LUFS for a stereo mix; at 0.9 (-0.9 dB) the mix with music and effects
// lands near -16.7 LUFS. `voiceGain` in videos/<id>.json overrides it for one video (a take that is off).
export const VO_GAIN = 0.9;

// Scene layout on the video timeline: [{ id, start, secs }] and the total length, in seconds.
export const layout = (words) => {
  let at = 0;
  const scenes = Object.entries(words.scenes).map(([id, s]) => {
    const row = { id, start: r3(at), secs: r3(s.secs + TIME.leadIn + TIME.tail) };
    at += row.secs;
    return row;
  });
  return { scenes, total: r3(at) };
};

// Spoken phrases on the video timeline, merged across short breaths (the old kit Music component).
export const phrases = (words) => {
  const M = TIME.music, spans = [];
  let at = 0;
  for (const s of Object.values(words.scenes)) {
    const starts = s.words.map(([, t]) => at + TIME.leadIn + Number(t));
    starts.forEach((t, i) => {
      const end = i + 1 < starts.length ? starts[i + 1] : at + TIME.leadIn + s.secs;
      const last = spans[spans.length - 1];
      if (last && t - last[1] < M.mergeGap) last[1] = Math.max(last[1], end);
      else spans.push([t, end]);
    });
    at += s.secs + TIME.leadIn + TIME.tail;
  }
  return spans;
};

// Music gain at second t: underVoice while a phrase is spoken, rising to inPauses between phrases, faded in and out.
export const duckGain = (t, spans, total) => {
  const M = TIME.music;
  const gap = spans.reduce((g, [a, b]) => (t >= a && t <= b ? 0 : Math.min(g, t < a ? a - t : t - b)), Infinity);
  const level = M.underVoice + (M.inPauses - M.underVoice) * Math.min(1, gap / M.ramp);
  const fade = Math.min(1, t / M.fadeIn, Math.max(0, (total - t) / M.fadeOut));
  return level * fade;
};

const duck = (src, out, spans, total) => {
  execSync(`ffmpeg -y -loglevel error -i "${src}" -t ${total} -ar 48000 -ac 2 -c:a pcm_s16le "${out}"`, { stdio: "inherit" });
  const w = pcm(out);
  let g = 0, next = 0;
  for (let i = 0; i < w.n; i++) {
    if (i >= next) { g = duckGain(i / w.rate, spans, total); next = i + 480; } // gain every 10 ms
    for (let c = 0; c < w.channels; c++) w.set(i, c, w.get(i, c) * g);
  }
  w.save();
};

const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (!fs.existsSync(to) || fs.statSync(to).mtimeMs < fs.statSync(from).mtimeMs || fs.statSync(to).size !== fs.statSync(from).size) fs.copyFileSync(from, to);
};

// Kit and fonts into <dir>/assets, plus every assets/<path> the HTML files in `htmlDir` name, copied
// from public/<path>. Returns what is missing.
export const syncAssets = (dir, htmlDir) => {
  const assets = path.join(dir, "assets"), missing = new Set();
  for (const f of ["kit.js", "kit.css"]) copy(path.join(ENGINE, "kit", f), path.join(assets, f));
  for (const f of fs.readdirSync(path.join(ENGINE, "kit", "fonts"))) copy(path.join(ENGINE, "kit", "fonts", f), path.join(assets, "fonts", f));
  for (const f of fs.readdirSync(htmlDir).filter((f) => f.endsWith(".html"))) {
    const html = fs.readFileSync(path.join(htmlDir, f), "utf8");
    for (const [, rel] of html.matchAll(/assets\/([\w\-./]+\.\w+)/g)) {
      if (/^(kit\.|fonts\/|vo\/|words\.js|music\.wav)/.test(rel)) continue;
      const src = path.join("public", rel);
      if (fs.existsSync(src)) copy(src, path.join(assets, rel));
      else missing.add(`${f}: public/${rel}`);
    }
  }
  return [...missing];
};

// Brand watermark over every scene, from brand.json "watermark" (a video can say "watermark": "off" only
// when the brand allows it). "tile": the logo in offset rows across the whole frame, so cropping one corner
// does not remove it; "corner": one small logo top right. Fades in after the hook (inAt) and steps aside
// for the end card (the last scene, which carries the real logo). Defaults are the Truemission values:
// 0.10 vanished after Instagram's re-encode, 0.13 survives.
export const WATERMARK = { mode: "tile", opacity: 0.13, height: 58, stepX: 330, stepY: 300, offset: 165, margin: 40, inAt: 1.2 };
export const watermarkHtml = (wm, { scenes, total }) => {
  if (!wm?.src) return { html: "", js: "" };
  const w = { ...WATERMARK, ...wm };
  const outAt = r3(scenes.length > 1 ? scenes[scenes.length - 1].start : total - 0.3);
  const img = (x, y) => `<img src="assets/${w.src}" style="position:absolute;left:${x}px;top:${y}px;height:${w.height}px;width:auto" />`;
  let tiles;
  if (w.mode === "corner") tiles = `<img src="assets/${w.src}" style="position:absolute;right:80px;top:132px;height:${w.height}px;width:auto" />`;
  else {
    const rows = Math.ceil(1920 / w.stepY) + 1, cols = Math.ceil(1080 / w.stepX) + 1, out = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push(img(c * w.stepX + (r % 2 ? w.offset : 0) - w.margin, r * w.stepY + w.margin));
    tiles = out.join("");
  }
  const peak = w.mode === "corner" ? 0.55 : w.opacity;
  return {
    html: `\n      <div id="wm" class="clip" data-start="0" data-duration="${total}" data-track-index="4" data-layout-ignore style="position:absolute;inset:0;z-index:${scenes.length + 10};pointer-events:none"><div id="wm-in" style="position:absolute;inset:0;opacity:0">${tiles}</div></div>`,
    js: `\n      tl.fromTo("#wm-in", { opacity: 0 }, { opacity: ${peak}, duration: 0.5, ease: "none" }, ${w.inAt});\n      tl.to("#wm-in", { opacity: 0, duration: 0.3, ease: "none" }, ${outAt});`,
  };
};

export const rootHtml = (id, { scenes, total }, music, voiced = true, wm = null, voGain = VO_GAIN) => {
  const mark = watermarkHtml(wm, { scenes, total });
  const hosts = scenes
    .map((s, i) => `      <div id="${key(s.id)}" data-composition-id="${key(s.id)}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.secs}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index: ${i + 1}"></div>`)
    .join("\n");
  const vo = (voiced ? scenes : [])
    .map((s) => `      <audio id="vo-${s.id}" class="clip" data-start="${r3(s.start + TIME.leadIn)}" data-track-index="2" data-volume="${voGain}" src="assets/vo/${s.id}.wav"></audio>`)
    .join("\n");
  const bed = music ? `\n      <audio id="music" class="clip" data-start="0" data-duration="${total}" data-track-index="3" data-volume="1" src="assets/music.wav"></audio>` : "";
  return `<!doctype html>
<!-- generated by npm run assemble -- ${id}; edit the scenes in compositions/, not this file -->
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="stylesheet" href="assets/kit.css" />
    <script src="assets/words.js"></script>
    <script src="assets/kit.js"></script>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
${hosts}
${vo}${bed}${mark.html}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });${mark.js}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
};

const main = (id) => {
  const dir = path.join("reels", id), assets = path.join(dir, "assets");
  const words = JSON.parse(fs.readFileSync(path.join(dir, "words.json"), "utf8"));
  const video = fs.existsSync(`videos/${id}.json`) ? JSON.parse(fs.readFileSync(`videos/${id}.json`, "utf8")) : {};
  const plan = layout(words);
  const errors = [];

  for (const s of plan.scenes) if (!fs.existsSync(path.join(dir, "compositions", `${s.id}.html`))) errors.push(`missing reels/${id}/compositions/${s.id}.html`);
  if (video.scenes) {
    const ids = video.scenes.map((s) => s.id).join(",");
    if (ids !== Object.keys(words.scenes).join(",")) errors.push(`words.json scenes (${Object.keys(words.scenes)}) differ from videos/${id}.json (${ids}): rerun npm run words -- ${id}`);
  }

  syncAssets(dir, path.join(dir, "compositions")).forEach((m) => errors.push(`not found: ${m}`));
  fs.writeFileSync(path.join(assets, "words.js"), `window.HR_WORDS = ${JSON.stringify(words)};\n`);

  // Voiceover clips; estimated word times before recording have none, so the scenes play silent.
  let vo = 0;
  for (const s of plan.scenes) {
    const src = path.join("public", "vo", id, `${s.id}.wav`);
    if (fs.existsSync(src)) { copy(src, path.join(assets, "vo", `${s.id}.wav`)); vo++; }
  }
  const voiced = vo === plan.scenes.length;
  if (vo && !voiced) errors.push(`only ${vo} of ${plan.scenes.length} voiceover clips in public/vo/${id}/`);

  const musicSrc = video.music ? path.join("public", video.music) : null;
  if (musicSrc && !fs.existsSync(musicSrc)) errors.push(`music not found: ${musicSrc}`);
  if (musicSrc && fs.existsSync(musicSrc)) duck(musicSrc, path.join(assets, "music.wav"), phrases(words), plan.total);

  const brand = fs.existsSync("brand.json") ? JSON.parse(fs.readFileSync("brand.json", "utf8")) : {};
  const wm = video.watermark === "off" ? null : video.watermark && typeof video.watermark === "object" ? { ...brand.watermark, ...video.watermark } : brand.watermark;
  if (wm?.src) {
    const src = path.join("public", wm.src);
    if (fs.existsSync(src)) copy(src, path.join(assets, wm.src));
    else errors.push(`watermark not found: ${src}`);
  }
  const voGain = video.voiceGain ?? VO_GAIN;
  if (!(voGain > 0 && voGain <= 2)) errors.push(`voiceGain ${video.voiceGain} in videos/${id}.json: use a number above 0, at most 2`);
  fs.writeFileSync(path.join(dir, "index.html"), rootHtml(id, plan, musicSrc, voiced, wm, voGain));
  errors.forEach((e) => console.error(`error: ${e}`));
  if (errors.length) process.exit(1);
  console.log(`assembled reels/${id}: ${plan.scenes.length} scenes, ${plan.total} s${voiced ? "" : " (no voiceover yet)"}${musicSrc ? ", music ducked" : ""}${wm?.src ? `, watermark ${wm.mode ?? WATERMARK.mode}` : video.watermark === "off" ? ", watermark off (videos json)" : ""}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const id = process.argv[2];
  if (id === "--self-test") {
    const words = { scenes: { "01-hook": { secs: 2, words: [["a", 0], ["b", 1.5]] }, "02-why": { secs: 1, words: [["c", 0.2]] } } };
    const plan = layout(words);
    if (plan.scenes[1].start !== r3(2 + TIME.leadIn + TIME.tail) || plan.total !== r3(3 + 2 * (TIME.leadIn + TIME.tail))) throw new Error(`self-test layout: ${JSON.stringify(plan)}`);
    const sp = phrases(words);
    if (sp.length !== 2 || sp[0][0] !== TIME.leadIn) throw new Error(`self-test phrases: ${JSON.stringify(sp)}`);
    if (Math.abs(duckGain(1, sp, plan.total) - TIME.music.underVoice) > 1e-9) throw new Error("self-test duck under voice");
    if (!rootHtml("x", plan, "m").includes('data-composition-id="s02-why"')) throw new Error("self-test root");
    const tiled = rootHtml("x", plan, null, true, { src: "brand/logo.png" });
    if ((tiled.match(/assets\/brand\/logo\.png/g) || []).length < 20 || !tiled.includes(`}, ${plan.scenes[1].start});`)) throw new Error("self-test watermark tile");
    if (rootHtml("x", plan, null, true, null).includes('id="wm"')) throw new Error("self-test watermark off");
    if (!rootHtml("x", plan, null, true, null, 1.2).includes('data-volume="1.2" src="assets/vo/')) throw new Error("self-test voiceGain");
    console.log("self-test ok");
  } else if (!id) {
    console.error("Usage: node scripts/assemble.mjs <video id>");
    process.exit(1);
  } else main(id);
}
