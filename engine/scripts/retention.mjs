// Usage: node scripts/retention.mjs <video id>   (npm run retention -- <video id>, after npm run words)
// Retention lint for a custom motion video in reels/<id>/. Fails the build on:
//   - dead air: more than 1.2 s of voice with no beat's hero on screen, from moves.json. A beat is on
//     screen from its `at` until its `until` (scene seconds, when its hero leaves); that is where viewers skip.
//   - a beat without a numeric `until`, or one before its `at`: without it a gap cannot be seen.
//   - a slow hook: the video's first beat lands later than 1.0 s (something must move in the first second).
//   - a silent beat: every beat names its sound in `sfx` (a file in public/sfx/ without .wav, or "none"
//     for a deliberate silence); every transition needs a real sound, and so does at least one beat per
//     scene. A beat with no `sfx` key at all is an error, so a sound cannot be forgotten.
//   - a stretched image: an <Img> given both a width and a height without objectFit, drawn at a ratio
//     other than its file's (read from the PNG, JPEG or WebP header in public/).
//   - a slide: every beat lists its on-screen text in `text`, one string per tier (headline, label), or []
//     for none; source lines, illustration labels, disclaimers and text inside a UI mockup do not count.
//     More than 2 tiers (kicker + title + body), or a tier over 6 words, is a slide, not a video.
//   - a late ask: the scene whose id contains "cta" must open before 55 % of the runtime, and so must
//     the spoken keyword. Declare the keyword in `videos/<id>.json` as
//     `"cta": { "keyword": "PROSPER", "reward": "RIPLAY" }`; without it the same check only warns,
//     because guessing a keyword is worse than not checking. A real reel at 91.8 s put its ask at
//     81.0 s — 88.2 % in — where the retention curve had about 8 % of viewers left, 25 s after the
//     guarantee that made the ask worth answering.
//   - an unearned ask: with a `cta.reward`, at least one beat of the CTA scene must carry that reward in
//     its on-screen `text`. A reward that exists only in the voiceover is invisible in a muted feed.
// Warns on an objectFit "cover" that crops more than 10 % of an image (a screenshot loses the rows the
// beat is about), an objectFit "contain" that leaves empty bands in its box, a short phrase (4 words or
// fewer) ending in a full stop, all-caps text on more than one beat, and a reel with no save or share
// ask anywhere in its on-screen text.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TIME } from "../src/motion.mjs";
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

const MAX_TIERS = 2, MAX_WORDS = 6;
const CURRENCY = /\b(USD|IDR|SGD|MYR|EUR|GBP|JPY|AUD|CNY|HKD)\b/g;
// moves: moves.json. Returns { errors, warnings } for the on-screen text of every beat.
export const slideCheck = (moves) => {
  const errors = [], warnings = [];
  const caps = [];
  for (const m of moves) {
    const at = `${m.scene} "${m.move}" @${m.at}s`;
    if (!Array.isArray(m.text)) {
      errors.push(`${at}: needs "text" (its on-screen text, one string per tier, or [])`);
      continue;
    }
    if (m.text.length > MAX_TIERS) errors.push(`${at}: ${m.text.length} text tiers; at most ${MAX_TIERS} (one line + one label), a third tier is a slide`);
    for (const x of m.text) {
      const n = String(x).trim().split(/\s+/).filter(Boolean).length;
      if (n > MAX_WORDS) errors.push(`${at}: "${x}" is ${n} words; at most ${MAX_WORDS} on screen, split it over two beats or show it`);
      if (n <= 4 && /[^.]\.$/.test(String(x).trim())) warnings.push(`${at}: "${x}" ends in a full stop; short phrases go without one unless the style brief chose it`);
      // Currency codes (USD 1.000) are written in caps; they are not shouting.
      const y = String(x).replace(CURRENCY, "");
      if (/\p{Lu}{3}/u.test(y) && y === y.toUpperCase()) caps.push(at);
    }
  }
  if (caps.length > 1) warnings.push(`all-caps text on ${caps.length} beats (${caps.join(", ")}); sentence case, caps for one emphasis beat at most`);
  return { errors, warnings };
};

const MAX_CTA_AT = 0.55; // the ask has to land before 55 % of the runtime
const ASK = /\b(simpan|simpan ini|bagikan|kirim ke|share|save)\b/i;
const bare = (x) => String(x).replace(/[^\p{L}\p{N}]/gu, "").toUpperCase();

// moves: moves.json; words: words.json; cta: the video's `cta` block (keyword, reward) or null.
// Returns { errors, warnings }.
export const ctaAudit = (moves, words, cta) => {
  const errors = [], warnings = [];
  const { offsets, length } = sceneOffsets(words);
  const keyword = typeof cta?.keyword === "string" ? cta.keyword.trim() : null;
  const reward = typeof cta?.reward === "string" ? cta.reward.trim() : null;
  const at = (t) => `${t.toFixed(2)} s = ${((t / length) * 100).toFixed(1)} % of ${length.toFixed(1)} s`;
  // Held to the same limit with or without a declared keyword; only the severity changes.
  const limit = (msg) => (keyword ? errors : warnings).push(`${msg} (add cta.keyword to videos/<id>.json to make this an error)`);
  const sceneId = Object.keys(words.scenes).find((s) => /cta/i.test(s));
  const max = `${(MAX_CTA_AT * 100).toFixed(0)} % of the runtime`;
  if (!sceneId) warnings.push('no scene id containing "cta": the ask cannot be located');
  else {
    const beats = moves.filter((m) => m.scene === sceneId).sort((a, b) => a.at - b.at);
    const textOf = (b) => (b.text ?? []).join(" ");
    const kwRe = keyword ? new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i") : null;
    // Where the ask is on screen, not where its scene starts: the scene may open on a price chip.
    const askBeat = kwRe ? beats.find((b) => kwRe.test(textOf(b))) : null;
    const first = offsets[sceneId] + ((askBeat ?? beats[0])?.at ?? 0);
    if (first / length > MAX_CTA_AT) limit(`the ask is on screen at ${at(first)}; it must land before ${max}`);
    if (keyword) {
      const said = (words.scenes[sceneId]?.words ?? []).find(([w]) => bare(w) === bare(keyword));
      if (said) {
        const spoken = offsets[sceneId] + TIME.leadIn + said[1];
        if (spoken / length > MAX_CTA_AT) errors.push(`"${keyword}" is first spoken at ${at(spoken)}; the ask must land before ${max}`);
      }
      const onScreen = beats.map(textOf).join(" ");
      if (!kwRe.test(onScreen)) warnings.push(`${sceneId} never shows "${keyword}" on screen: a muted feed hears nothing of the ask`);
      if (!reward) warnings.push(`${sceneId}: no cta.reward in videos/<id>.json, so the CTA screen text was not checked for what the viewer gets`);
      else if (!onScreen.toLowerCase().includes(reward.toLowerCase())) errors.push(`${sceneId} never shows the reward ("${reward}") on screen: the ask tells the viewer to act without telling them what they get`);
    }
  }
  if (!ASK.test(moves.flatMap((m) => m.text ?? []).join(" | "))) warnings.push("no save or share ask anywhere in the on-screen text: the behaviour that actually spreads a reel is left unnamed");
  return { errors, warnings };
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
  const prop = (name) => new RegExp(`\\b${name}\\s*[:=]\\s*\\{?\\s*(["'\`]?)([^,;}\\s"'\`]+)\\1`).exec(text)?.[2];
  const w = prop("width"), h = prop("height"), fit = prop("objectFit") ?? prop("object-fit");
  if (!w || !h) return null; // one side auto keeps the image's ratio
  // a Remotion staticFile("x") or a HyperFrames src="assets/x" (npm run assemble copies public/x there)
  const file = /staticFile\(\s*(["'`])([^"'`$]+)\1\s*\)/.exec(text)?.[2] ?? /\bsrc\s*=\s*["']assets\/([^"']+)["']/.exec(text)?.[1];
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
  const dir = path.join("reels", id);
  const errors = [], warnings = [];
  let askClean = false;
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (!fs.existsSync(dir)) errors.push(`${dir} not found: a template-look video has no beats to lint (retention covers custom motion only)`);
  else if (!fs.existsSync(path.join(dir, "moves.json")) || !fs.existsSync(path.join(dir, "words.json"))) errors.push(`${dir}: moves.json and words.json are needed (npm run words -- ${id})`);
  else {
    const has = (name) => ["", "brand/"].some((d) => fs.existsSync(path.join("public", "sfx", `${d}${name}.wav`)));
    errors.push(...deadAir(read("moves.json"), read("words.json")), ...sfxAudit(read("moves.json"), read("words.json"), has));
    const slide = slideCheck(read("moves.json"));
    errors.push(...slide.errors);
    warnings.push(...slide.warnings);
    const videoFile = path.join("videos", `${id}.json`);
    const cta = fs.existsSync(videoFile) ? JSON.parse(fs.readFileSync(videoFile, "utf8")).cta : null;
    const ask = ctaAudit(read("moves.json"), read("words.json"), cta ?? null);
    errors.push(...ask.errors);
    warnings.push(...ask.warnings);
    askClean = !ask.errors.length && !ask.warnings.length;
  }
  const sizeOf = (f) => {
    const p = path.join("public", f);
    return fs.existsSync(p) ? imageSize(fs.readFileSync(p)) : null;
  };
  for (const f of (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }) : []).filter((f) => /\.(tsx|jsx|html)$/.test(f) && !/(^|[\\/])assets[\\/]/.test(f))) {
    for (const el of imgElements(fs.readFileSync(path.join(dir, f), "utf8"))) {
      const r = checkImg(el.text, sizeOf);
      if (r?.error) errors.push(`${f}:${el.line} ${r.error}`);
      if (r?.warn) warnings.push(`${f}:${el.line} ${r.warn}`);
    }
  }
  warnings.forEach((w) => console.log(`warn: ${w}`));
  errors.forEach((e) => console.log(`FAIL: ${e}`));
  console.log(errors.length ? `${errors.length} retention error(s)` : `retention: every beat has until and a sound, no dead air, hook moves in time, no stretched image, no slide text${askClean ? ", the ask lands in time and carries its reward" : ""}`);
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
      checkImg(`<img src="assets/esim.png" style="width: 300px; height: 300px" />`, sizeOf)?.error?.startsWith("stretched"),
      checkImg(`<img src="assets/esim.png" style="width: 300px; height: 300px; object-fit: cover" />`, sizeOf)?.warn?.includes("18 %"),
      checkImg(`<Img src={staticFile("esim.png")} style={{ width: 540, height: 660 }} />`, sizeOf) === null,
      imgElements(`a\n<Img src={x} style={{ w: a > b ? 1 : 2 }} />`)[0]?.line === 2,
      JSON.stringify(imageSize(Buffer.from("89504e470d0a1a0a0000000d494844520000021c00000294", "hex"))) === '{"w":540,"h":660}',
      JSON.stringify(slideCheck([{ scene: "a", at: 0, move: "x", text: ["Premi naik", "sumber: OJK"] }, { scene: "a", at: 1, move: "y", text: [] }])) === '{"errors":[],"warnings":[]}',
      slideCheck([{ scene: "a", at: 0, move: "x", text: ["01 — FITUR", "Satu", "Dua"] }, { scene: "a", at: 1, move: "y" }, { scene: "a", at: 2, move: "z", text: ["ini kalimat yang terlalu panjang untuk layar"] }]).errors.length === 3,
      slideCheck([{ scene: "a", at: 0, move: "x", text: ["Bayar dulu."] }, { scene: "a", at: 1, move: "y", text: ["STOP"] }, { scene: "a", at: 2, move: "z", text: ["GRATIS"] }, { scene: "a", at: 3, move: "w", text: ["Rp1,5 jt"] }]).warnings.length === 2,
      slideCheck([{ scene: "a", at: 0, move: "x", text: ["USD 10.000"] }, { scene: "a", at: 1, move: "y", text: ["Premi USD"] }, { scene: "a", at: 2, move: "z", text: ["USD"] }]).warnings.length === 0,
      // CTA gates: an ask at 82 % is an error with a keyword and only a warning without one; an early
      // ask carrying its reward is clean; a reward that never reaches the screen is an error.
      ctaAudit([{ scene: "02-cta", at: 0.3, text: ["Komentar PROSPER"] }], { scenes: { a: { secs: 20 }, "02-cta": { secs: 4 } } }, { keyword: "PROSPER" }).errors.length === 1,
      ctaAudit([{ scene: "02-cta", at: 0.3, text: ["Komentar PROSPER"] }], { scenes: { a: { secs: 20 }, "02-cta": { secs: 4 } } }, null).errors.length === 0,
      ctaAudit([{ scene: "02-cta", at: 0.3, text: ["Komentar PROSPER"] }, { scene: "02-cta", at: 1, text: ["RIPLAY lewat DM"] }], { scenes: { a: { secs: 2 }, "02-cta": { secs: 4 } } }, { keyword: "PROSPER", reward: "RIPLAY" }).errors.length === 0,
      ctaAudit([{ scene: "02-cta", at: 0.3, text: ["Komentar PROSPER"] }], { scenes: { a: { secs: 2 }, "02-cta": { secs: 4 } } }, { keyword: "PROSPER", reward: "RIPLAY" }).errors.some((e) => e.includes("RIPLAY")),
      ctaAudit([{ scene: "02-cta", at: 0.3, text: ["Simpan ini"] }], { scenes: { a: { secs: 2 }, "02-cta": { secs: 4 } } }, null).warnings.every((w) => !w.includes("save or share")),
      // A spoken keyword only counts where it is said: same late scene, keyword 20 s into it.
      ctaAudit([{ scene: "02-cta", at: 0.3, text: ["Komentar PROSPER"] }], { scenes: { a: { secs: 20 }, "02-cta": { secs: 40, words: [["PROSPER", 20]] } } }, { keyword: "PROSPER" }).errors.some((e) => e.includes("first spoken")),
    ];
    if (ok.includes(false) || ok.includes(undefined)) throw new Error(`self-test failed: ${JSON.stringify({ ok, air, slow })}`);
    console.log("self-test ok");
  } else if (!process.argv[2]) {
    console.error("Usage: node scripts/retention.mjs <video id>");
    process.exit(1);
  } else main(process.argv[2]);
}
