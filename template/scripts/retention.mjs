// Usage: node scripts/retention.mjs <video id>   (npm run retention -- <video id>, after npm run words)
// Retention lint for a custom motion video in src/proto/<id>/. Fails the build on:
//   - dead air: more than 1.2 s of voice with no beat's hero on screen, from moves.json. A beat is on
//     screen from its `at` until its `until` (scene seconds, when its hero leaves); that is where viewers skip.
//   - a beat without a numeric `until`, or one before its `at`: without it a gap cannot be seen.
//   - a slow hook: the video's first beat lands later than 1.0 s (something must move in the first second).
//   - a silent beat: every beat names its sound in `sfx` (a file in public/sfx/ without .wav, or "none"
//     for a deliberate silence); every transition needs a real sound, and so does at least one beat per
//     scene. A beat with no `sfx` key at all is an error, so a sound cannot be forgotten.
//   - a stretched image: an <Img> given both a width and a height without objectFit, drawn at a ratio
//     other than its file's (read from the PNG, JPEG or WebP header in public/).
// Warns on an objectFit "cover" that crops more than 10 % of an image (a screenshot loses the rows the
// beat is about) and an objectFit "contain" that leaves empty bands in its box.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TIME } from "../src/motion.ts";
import { sceneOffsets } from "./fresh-check.mjs";

const MAX_GAP = 1.2;
const HOOK = 1.0;

// moves: moves.json; words: words.json. Returns errors, in video seconds.
export const deadAir = (moves, words) => {
  const errors = [];
  const { offsets } = sceneOffsets(words);
  const first = moves.find((m) => m.scene === Object.keys(words.scenes)[0]);
  if (!first || first.at > HOOK) errors.push(`slow hook: the first beat lands at ${first ? first.at.toFixed(2) : "—"} s; something must move in the first ${HOOK} s`);
  for (const [sid, s] of Object.entries(words.scenes)) {
    const beats = moves.filter((m) => m.scene === sid).sort((a, b) => a.at - b.at);
    const end = s.secs + TIME.leadIn + TIME.tail, voiceEnd = TIME.leadIn + s.secs;
    let cursor = TIME.leadIn;
    const gap = (from, to) => {
      if (to - from > MAX_GAP) errors.push(`dead air ${(offsets[sid] + from).toFixed(2)}–${(offsets[sid] + to).toFixed(2)} s in ${sid} (${(to - from).toFixed(1)} s of voice with no hero on screen)`);
    };
    // A scene with a beat missing "until" reports only that: its gaps would be guesses.
    const open = beats.filter((b) => typeof b.until !== "number" || b.until < b.at);
    if (open.length) {
      open.forEach((b) => errors.push(`${sid} beat "${b.move}" @${b.at}s: needs "until" (scene second its hero leaves, not before "at")`));
      continue;
    }
    for (const b of beats) {
      gap(cursor, Math.min(b.at, voiceEnd));
      cursor = Math.max(cursor, Math.min(b.until, end));
    }
    gap(cursor, voiceEnd);
  }
  return errors;
};

// moves: moves.json; words: words.json; has(name) → the sound file exists. Returns errors.
export const sfxAudit = (moves, words, has) => {
  const errors = [];
  for (const m of moves) {
    const at = `${m.scene} "${m.move ?? m.transition}" @${m.at}s`;
    if (typeof m.sfx !== "string") errors.push(`${at}: needs "sfx" (a sound in public/sfx/, or "none")`);
    else if (m.sfx !== "none" && !has(m.sfx)) errors.push(`${at}: sfx "${m.sfx}" not found in public/sfx/`);
    else if (m.transition && m.sfx === "none") errors.push(`${at}: transition "${m.transition}" has no sound; every transition needs one`);
  }
  for (const sid of Object.keys(words.scenes))
    if (!moves.some((m) => m.scene === sid && typeof m.sfx === "string" && m.sfx !== "none")) errors.push(`${sid}: no sound effect in the whole scene`);
  return errors;
};

// Width and height of a PNG, JPEG or WebP from its header, or null.
export const imageSize = (b) => {
  if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let p = 2; p + 9 < b.length; p += 2 + b.readUInt16BE(p + 2)) {
      const m = b[p + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: b.readUInt16BE(p + 7), h: b.readUInt16BE(p + 5) };
    }
    return null;
  }
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (kind === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (kind === "VP8L") { const v = b.readUInt32LE(21); return { w: 1 + (v & 0x3fff), h: 1 + ((v >> 14) & 0x3fff) }; }
  }
  return null;
};

// Every <Img …> / <img …> element in a source file: its text and line.
// shortcut: a JSX scan (braces and quotes), not a parser; props spread from a variable are not seen.
export const imgElements = (src) => {
  const out = [];
  const re = /<(Img|img)\b/g;
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + 1, depth = 0, quote = null;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (quote) { if (ch === quote && src[i - 1] !== "\\") quote = null; continue; }
      if (ch === '"' || ch === "'" || ch === "`") quote = ch;
      else if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (ch === ">" && depth === 0) break;
    }
    out.push({ text: src.slice(m.index, i + 1), line: src.slice(0, m.index).split("\n").length });
  }
  return out;
};

// One <Img> element → { error } | { warn } | null. sizeOf(file in public/) → { w, h } | null.
export const checkImg = (text, sizeOf) => {
  const prop = (name) => new RegExp(`\\b${name}\\s*[:=]\\s*\\{?\\s*(["'\`]?)([^,}\\s"'\`]+)\\1`).exec(text)?.[2];
  const w = prop("width"), h = prop("height"), fit = prop("objectFit");
  if (!w || !h) return null; // one side auto keeps the image's ratio
  const file = /staticFile\(\s*(["'`])([^"'`$]+)\1\s*\)/.exec(text)?.[2];
  const num = (x) => (/^\d+(\.\d+)?(px)?$/.test(x) ? parseFloat(x) : null);
  const size = file ? sizeOf(file) : null;
  const box = num(w) && num(h) ? num(w) / num(h) : null;
  const known = ["contain", "cover", "scale-down", "none", "fill"];
  if (fit && !known.includes(fit)) return null; // objectFit from a variable: cannot tell
  if (!box || !size) {
    return !fit || fit === "fill" ? { warn: `width and height both set without objectFit: stretched unless the box has the image's ratio; set objectFit "contain" or "cover"` } : null;
  }
  const img = size.w / size.h, off = Math.abs(box / img - 1);
  if (off <= 0.02) return null;
  const at = `${w}×${h} (ratio ${box.toFixed(3)}) but ${file} is ${size.w}×${size.h} (ratio ${img.toFixed(3)})`;
  if (!fit || fit === "fill") return { error: `stretched: drawn at ${at}; set objectFit or match the box to the image` };
  const crop = 1 - Math.min(box / img, img / box);
  if (fit === "cover" && crop > 0.1) return { warn: `cover crops ${Math.round(crop * 100)} % of the image: ${at}; check the part the beat is about is still in` };
  if (fit === "contain") return { warn: `contain leaves empty bands (${Math.round(crop * 100)} % of the box): ${at}` };
  return null;
};

const main = (id) => {
  const dir = path.join("src", "proto", id);
  const errors = [], warnings = [];
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (!fs.existsSync(path.join(dir, "moves.json")) || !fs.existsSync(path.join(dir, "words.json"))) errors.push(`${dir}: moves.json and words.json are needed (npm run words -- ${id})`);
  else {
    const has = (name) => ["", "brand/"].some((d) => fs.existsSync(path.join("public", "sfx", `${d}${name}.wav`)));
    errors.push(...deadAir(read("moves.json"), read("words.json")), ...sfxAudit(read("moves.json"), read("words.json"), has));
  }
  const sizeOf = (f) => {
    const p = path.join("public", f);
    return fs.existsSync(p) ? imageSize(fs.readFileSync(p)) : null;
  };
  for (const f of fs.readdirSync(dir, { recursive: true }).filter((f) => /\.(tsx|jsx)$/.test(f))) {
    for (const el of imgElements(fs.readFileSync(path.join(dir, f), "utf8"))) {
      const r = checkImg(el.text, sizeOf);
      if (r?.error) errors.push(`${f}:${el.line} ${r.error}`);
      if (r?.warn) warnings.push(`${f}:${el.line} ${r.warn}`);
    }
  }
  warnings.forEach((w) => console.log(`warn: ${w}`));
  errors.forEach((e) => console.log(`FAIL: ${e}`));
  console.log(errors.length ? `${errors.length} retention error(s)` : "retention: every beat has until and a sound, no dead air, hook moves in time, no stretched image");
  process.exit(errors.length ? 1 : 0);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--self-test") {
    const words = { scenes: { a: { secs: 5 }, b: { secs: 3 } } };
    // a: beat 2 leaves at 2 s, beat 3 only at 4 s → one gap; b: nothing until 2.5 s → a second gap.
    const air = deadAir([{ scene: "a", at: 0.3, until: 1.5 }, { scene: "a", at: 1.5, until: 2 }, { scene: "a", at: 4, until: 6 }, { scene: "b", at: 2.5, until: 4 }], words);
    const slow = deadAir([{ scene: "a", at: 1.4, until: 2.5 }, { scene: "a", at: 2.5, until: 3.6 }, { scene: "a", at: 3.6, until: 6 }, { scene: "b", at: 0.3, until: 4 }], words);
    const open = deadAir([{ scene: "a", at: 0.3, move: "dots" }, { scene: "a", at: 1, until: 0.5, move: "ring" }, { scene: "b", at: 0.3, until: 4 }], words);
    const sizeOf = () => ({ w: 540, h: 660 });
    const ok = [
      air.length === 2 && air[0].includes("2.00–4.00") && air[1].includes("b"),
      slow.length === 1 && slow[0].startsWith("slow hook"),
      open.length === 2 && open.every((e) => e.includes('needs "until"')),
      sfxAudit([{ scene: "a", at: 0.3, move: "dots", sfx: "pop" }, { scene: "a", at: 1, move: "flood", transition: "flood", sfx: "none" }, { scene: "a", at: 2, move: "ring" }, { scene: "b", at: 0.3, move: "dial", sfx: "none" }, { scene: "b", at: 1, move: "x", sfx: "boing" }], words, (n) => n === "pop").length === 3,
      sfxAudit([{ scene: "a", at: 0.3, move: "dots", sfx: "pop" }, { scene: "b", at: 0.3, move: "dial", sfx: "none" }], words, () => true).join() === "b: no sound effect in the whole scene",
      checkImg(`<Img src={staticFile("esim.png")} style={{ width: 300, height: 300 }} />`, sizeOf)?.error?.startsWith("stretched"),
      checkImg(`<Img src={staticFile("esim.png")} style={{ width: 300, height: 300, objectFit: "cover" }} />`, sizeOf)?.warn?.includes("18 %"),
      checkImg(`<Img src={staticFile("esim.png")} style={{ height: 70 }} />`, sizeOf) === null,
      checkImg(`<Img src={staticFile("esim.png")} style={{ width: 540, height: 660 }} />`, sizeOf) === null,
      imgElements(`a\n<Img src={x} style={{ w: a > b ? 1 : 2 }} />`)[0]?.line === 2,
      JSON.stringify(imageSize(Buffer.from("89504e470d0a1a0a0000000d494844520000021c00000294", "hex"))) === '{"w":540,"h":660}',
    ];
    if (ok.includes(false) || ok.includes(undefined)) throw new Error(`self-test failed: ${JSON.stringify({ ok, air, slow })}`);
    console.log("self-test ok");
  } else if (!process.argv[2]) {
    console.error("Usage: node scripts/retention.mjs <video id>");
    process.exit(1);
  } else main(process.argv[2]);
}
