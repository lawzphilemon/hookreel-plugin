// Usage: node scripts/check-video.mjs [video id] [--no-files]
// Checks brand.json and videos/*.json before anything renders: every cue must appear in its
// scene's vo, colours must be 6-digit hex, referenced files must exist. Exits 1 on errors.
import fs from "fs";
import path from "path";

const errors = [];
const warnings = [];

const brand = JSON.parse(fs.readFileSync("brand.json", "utf8"));
for (const [k, v] of Object.entries(brand.colors ?? {})) {
  if (!/^#[0-9a-fA-F]{6}$/.test(v)) errors.push(`brand.json colors.${k} must be a 6-digit hex like #1E1E1E (got "${v}")`);
}
// --no-files: check a draft (cues and colours only), before logo and music are in a studio.
const checkFiles = !process.argv.includes("--no-files");
if (checkFiles && brand.logo && !fs.existsSync(path.join("public", brand.logo))) errors.push(`brand.json logo not found: public/${brand.logo}`);

const only = process.argv.slice(2).find((a) => !a.startsWith("--"));
const files = fs.readdirSync("videos").filter((f) => f.endsWith(".json") && (!only || f === `${only}.json`));
if (!files.length) errors.push(only ? `videos/${only}.json not found` : "no videos/*.json yet");

// Every key that holds a cue phrase, anywhere in a visual.
const CUE_KEYS = new Set(["cue", "highlightCue", "dimCue", "strikeCue", "footerCue", "at"]);
const collectCues = (node, out, where) => {
  if (Array.isArray(node)) node.forEach((n, i) => collectCues(n, out, `${where}[${i}]`));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (CUE_KEYS.has(k) && typeof v === "string") out.push({ phrase: v, where: `${where}.${k}` });
      else collectCues(v, out, `${where}.${k}`);
    }
  }
};

for (const file of files) {
  const video = JSON.parse(fs.readFileSync(path.join("videos", file), "utf8"));
  const tag = `videos/${file}`;
  if (`${video.id}.json` !== file) errors.push(`${tag}: id "${video.id}" must match the file name`);
  if (checkFiles && video.audio?.music?.src && !fs.existsSync(path.join("public", video.audio.music.src))) {
    errors.push(`${tag}: music not found: public/${video.audio.music.src}`);
  }
  const ids = new Set();
  let words = 0;
  for (const scene of video.scenes ?? []) {
    if (ids.has(scene.id)) errors.push(`${tag}: duplicate scene id ${scene.id}`);
    ids.add(scene.id);
    if (!/^\d\d-[a-z0-9-]+$/.test(scene.id)) errors.push(`${tag}: scene id "${scene.id}" should look like 01-hook`);
    words += scene.vo.trim().split(/\s+/).length;
    const cues = [];
    collectCues(scene.visual, cues, "visual");
    collectCues(scene.note, cues, "note");
    for (const c of cues) {
      if (!scene.vo.includes(c.phrase)) errors.push(`${tag} ${scene.id}: ${c.where} "${c.phrase}" is not in the vo`);
    }
    if (scene.visual?.type === "cta" && !video.cta) errors.push(`${tag} ${scene.id}: a cta visual needs video.cta`);
    // Character files, also inside a swap.
    for (const v of [scene.visual, scene.visual?.first, scene.visual?.second]) {
      if (v?.type === "character" && checkFiles && !fs.existsSync(path.join("public", v.src))) errors.push(`${tag} ${scene.id}: character not found: public/${v.src}`);
    }
  }
  const seconds = Math.round(words / 2.5 + (video.scenes?.length ?? 0));
  if (seconds > 90) warnings.push(`${tag}: about ${seconds}s at a normal pace; most Reels land under 90s`);
  console.log(`${tag}: ${video.scenes?.length ?? 0} scenes, ${words} words, about ${seconds}s before recording`);
}

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
if (errors.length) process.exit(1);
console.log("OK");
