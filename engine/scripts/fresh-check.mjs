// Usage: node scripts/fresh-check.mjs <video id>   (npm run fresh -- <video id>)
// Freshness log check. reels/<id>/moves.json lists every beat's move and every scene change:
//   [{ "scene": "01-hook", "at": 1.35, "move": "counter assembled from dots", "shot": "close" },
//    { "scene": "01-hook", "at": 4.2, "move": "stamp lands on receipt", "transition": "circle wipe", "shot": "wide", "special": true }, …]
// `at` is scene seconds; `transition` marks a background or camera change (wipe, flood, zoom-through, cut to
// a new colour); `shot` is the camera's shot size on that beat (wide, medium, close); `special` marks the one
// beat that gets the most expensive effect. reels/<id>/style.json is the video's style brief:
//   { "background": "<background motion>", "surface": ["<layer>", "<layer>"], "render": "<object render family>",
//     "signature": "<signature move>", "opener": "<first 3 s>", "closing": "<closing>" }
// Fails on a move or transition used twice in this video, a background or camera held longer than 5.5 s, a
// beat without a shot size, three beats in a row at the same shot size, more than one special beat, a
// missing or incomplete style.json (surface needs 2+ layers), or a style brief that shares 3+ of its 6 lines
// with one of the last 3 other videos in reels/. Warns on moves, transitions and style lines also used
// there, on a video with no special beat, and on a figure (a number or percentage in a beat's on-screen text)
// that a sibling video of the same project also shows: the reels of one series never share a scene design,
// and the same figure is where they drift into the same idea (an umbrella and a canopy for "105%").
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { camAt, frameOn, SHOT } from "../src/motion.mjs";

const MAX_HOLD = 5.5; // seconds a background or camera may hold (rule: about 5 s)
const SHOTS = ["wide", "medium", "close"];
const STYLE = ["background", "surface", "render", "signature", "opener", "closing"];
const key = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();

// moves: the log; offsets: scene id → start second in the video; length: video seconds; others: logs of
// the last videos. Returns { errors, warnings }.
export const check = (moves, offsets, length, others = []) => {
  const errors = [], warnings = [];
  const seen = new Map();
  for (const m of moves) {
    for (const [kind, name] of [["move", m.move], ["transition", m.transition]]) {
      if (!name) continue;
      const k = `${kind}:${key(name)}`;
      if (seen.has(k)) errors.push(`${kind} "${name}" repeats (${seen.get(k)} and ${m.scene} @${m.at}s)`);
      else seen.set(k, `${m.scene} @${m.at}s`);
    }
  }
  // Only logged transitions count as a change; a hard cut to the same background is not one.
  const changes = moves.filter((m) => m.transition).map((m) => offsets[m.scene] + m.at);
  [0, ...changes.sort((a, b) => a - b), length].reduce((prev, t) => {
    if (t - prev > MAX_HOLD) errors.push(`background or camera holds ${(t - prev).toFixed(1)} s from ${prev.toFixed(1)} s (max ${MAX_HOLD} s)`);
    return t;
  });
  // Shot sizes, in video order: a size held for three beats reads as a still camera.
  const order = [...moves].sort((a, b) => offsets[a.scene] + a.at - (offsets[b.scene] + b.at));
  order.forEach((m, i) => {
    if (!SHOTS.includes(m.shot)) errors.push(`${m.scene} "${m.move}" @${m.at}s: needs "shot" (${SHOTS.join(", ")})`);
    else if (i >= 2 && order[i - 1].shot === m.shot && order[i - 2].shot === m.shot) errors.push(`${m.scene} @${m.at}s: third beat in a row at shot "${m.shot}"; change the shot size`);
  });
  const special = moves.filter((m) => m.special);
  if (special.length > 1) errors.push(`${special.length} special beats (${special.map((m) => `${m.scene} @${m.at}s`).join(", ")}); the most expensive effect is used once`);
  if (!special.length) warnings.push(`no beat is marked "special": true; pick the one moment that gets the most expensive effect`);
  for (const o of others)
    for (const m of moves)
      for (const [kind, name] of [["move", m.move], ["transition", m.transition]])
        if (name && o.moves.some((x) => x[kind] && key(x[kind]) === key(name))) warnings.push(`${kind} "${name}" was also used in ${o.id}`);
  return { errors, warnings };
};

// style: style.json of this video (or null); others: [{ id, style }] of the last videos. Returns { errors, warnings }.
const line = (v) => (Array.isArray(v) ? v.map(key).sort().join(" + ") : key(v));
export const checkStyle = (style, others = []) => {
  const errors = [], warnings = [];
  if (!style) return { errors: [`style.json missing: write the style brief (${STYLE.join(", ")})`], warnings };
  for (const k of STYLE) if (!style[k] || (Array.isArray(style[k]) && !style[k].length)) errors.push(`style.json: "${k}" is empty`);
  if (Array.isArray(style.surface) ? style.surface.length < 2 : style.surface) errors.push(`style.json: "surface" needs 2 or more layers (never a flat background)`);
  for (const o of others) {
    if (!o.style) continue;
    const same = STYLE.filter((k) => style[k] && o.style[k] && line(style[k]) === line(o.style[k]));
    if (same.length >= 3) errors.push(`style brief shares ${same.length} of ${STYLE.length} lines with ${o.id} (${same.join(", ")}); change at least ${same.length - 2}`);
    else same.forEach((k) => warnings.push(`style "${k}" was also used in ${o.id}`));
  }
  return { errors, warnings };
};

// Sibling videos (same project code, the first 15 characters of the id): one warning per figure this video
// shows that a sibling shows too, naming both beats so the props can be compared. Returns warnings.
// A figure is a percentage or an amount with separators (105%, 1,6%, 20.000); years and counts are left out.
const figures = (m) => (m.text ?? []).join(" ").match(/\d[\d.,]*%|\d{1,3}(?:\.\d{3})+|\d+,\d+/g) ?? [];
export const checkSiblings = (moves, siblings = []) => {
  const warnings = [];
  for (const m of moves)
    for (const fig of new Set(figures(m)))
      for (const o of siblings)
        for (const x of o.moves.filter((x) => figures(x).includes(fig)))
          warnings.push(`figure "${fig}" in ${m.scene} ("${m.move}") is also in ${o.id} ${x.scene} ("${x.move}"): make sure the prop and the idea differ`);
  return warnings;
};

// Scene id → start second in the video, and the video's length, from reels/<id>/words.json.
export const sceneOffsets = (words) => {
  const offsets = {};
  let at = 0;
  for (const [sid, s] of Object.entries(words.scenes)) {
    offsets[sid] = at;
    at += s.secs + 1; // TIME.leadIn + TIME.tail
  }
  return { offsets, length: at };
};

const main = (id) => {
  const dir = "reels";
  const moves = JSON.parse(fs.readFileSync(`${dir}/${id}/moves.json`, "utf8"));
  const words = JSON.parse(fs.readFileSync(`${dir}/${id}/words.json`, "utf8"));
  const { offsets, length: at } = sceneOffsets(words);
  const json = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null);
  const others = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== id && fs.existsSync(`${dir}/${d.name}/moves.json`))
    .map((d) => ({ id: d.name, file: `${dir}/${d.name}/moves.json` }))
    .sort((a, b) => fs.statSync(b.file).mtimeMs - fs.statSync(a.file).mtimeMs)
    .slice(0, 3)
    .map((o) => ({ id: o.id, moves: json(o.file), style: json(`${dir}/${o.id}/style.json`) }));
  const siblings = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== id && d.name.slice(0, 15) === id.slice(0, 15) && fs.existsSync(`${dir}/${d.name}/moves.json`))
    .map((d) => ({ id: d.name, moves: json(`${dir}/${d.name}/moves.json`) }));
  const a = check(moves, offsets, at, others), b = checkStyle(json(`${dir}/${id}/style.json`), others);
  const errors = [...a.errors, ...b.errors], warnings = [...a.warnings, ...b.warnings, ...checkSiblings(moves, siblings)];
  warnings.forEach((w) => console.log(`warn: ${w}`));
  errors.forEach((e) => console.log(`FAIL: ${e}`));
  console.log(errors.length ? `${errors.length} freshness error(s)` : `fresh: ${moves.length} beats, no repeats, no hold over ${MAX_HOLD} s, shot sizes change, style brief new`);
  process.exit(errors.length ? 1 : 0);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--self-test") {
    const offsets = { a: 0, b: 5 };
    const ok = check([{ scene: "a", at: 0, move: "dots", transition: "flood", shot: "close" }, { scene: "a", at: 3, move: "stamp", shot: "wide", special: true }, { scene: "b", at: 0, move: "dial", transition: "circle wipe", shot: "wide" }, { scene: "b", at: 4, move: "ring", transition: "swipe", shot: "medium" }], offsets, 12);
    // repeat, hold, missing shot, two special beats
    const bad = check([{ scene: "a", at: 0, move: "dots", special: true }, { scene: "b", at: 1, move: "Dots", shot: "close", special: true }], offsets, 12, [{ id: "old", moves: [{ move: "dots" }] }]);
    const flat = check([{ scene: "a", at: 0, move: "x", shot: "close", transition: "t1" }, { scene: "a", at: 2, move: "y", shot: "close" }, { scene: "b", at: 0, move: "z", shot: "close", transition: "t2", special: true }, { scene: "b", at: 4, move: "w", shot: "wide", transition: "t3" }], offsets, 12);
    const st = { background: "blobs", surface: ["horizon glow", "grain"], render: "clay", signature: "stamp", opener: "in media res", closing: "loop" };
    const fine = checkStyle(st, [{ id: "old", style: { ...st, render: "flat", signature: "fold", opener: "sound first", closing: "freeze", background: "grid" } }]);
    const close = checkStyle({ ...st, surface: ["grain", "Horizon glow"] }, [{ id: "old", style: { ...st, render: "flat", signature: "fold", opener: "x" } }]);
    const thin = checkStyle({ ...st, surface: ["flat"] });
    const results = [
      ok.errors.length === 0 && ok.warnings.length === 0,
      bad.errors.length === 4 && bad.errors.some((e) => e.includes('needs "shot"')) && bad.errors.some((e) => e.includes("2 special")) && bad.warnings.length === 2,
      flat.errors.length === 1 && flat.errors[0].includes("third beat") && flat.warnings.length === 0,
      fine.errors.length === 0 && fine.warnings.length === 1,
      close.errors.length === 1 && close.errors[0].includes("3 of 6"),
      thin.errors.length === 1 && checkStyle(null).errors.length === 1,
      // camera: wide at 0, halfway into a close-up on (900, 300) at 0.35 s, edges clamped at the corner
      camAt(0, []).s >= 1 && camAt(0, []).tx === 0,
      camAt(0.35, [{ at: 0, s: SHOT.close, x: 900, y: 300 }]).s > 1.4 && camAt(0.35, [{ at: 0, s: SHOT.close, x: 900, y: 300 }]).s < 1.7,
      ((c) => c.tx === 1080 - 1080 * c.s && c.ty === 0)(camAt(2, [{ at: 0, s: SHOT.close, x: 1080, y: 0, cut: true }])),
      frameOn({ x: 440, y: 860, w: 200, h: 200 }, 0.5).s === 2.7,
      // siblings: the shared figure warns once per matching beat; a lone digit or another figure does not
      checkSiblings([{ scene: "07", move: "umbrella opens", text: ["hingga 105% dari premi", "tahun 1"] }], [{ id: "X-kuliah", moves: [{ scene: "06", move: "canopy", text: ["Hingga 105%"] }, { scene: "05", move: "block", text: ["113%"] }] }]).length === 1,
    ];
    if (results.includes(false)) throw new Error(`self-test failed: ${JSON.stringify({ results, ok, bad, flat, fine, close, thin })}`);
    console.log("self-test ok");
  } else if (!process.argv[2]) {
    console.error("Usage: node scripts/fresh-check.mjs <video id>");
    process.exit(1);
  } else main(process.argv[2]);
}
