// Usage: node scripts/fresh-check.mjs <video id>   (npm run fresh -- <video id>)
// Freshness log check. src/proto/<id>/moves.json lists every beat's move and every scene change:
//   [{ "scene": "01-hook", "at": 1.35, "move": "counter assembled from dots" },
//    { "scene": "01-hook", "at": 4.2, "move": "stamp lands on receipt", "transition": "circle wipe" }, …]
// `at` is scene seconds; `transition` marks a background or camera change (wipe, flood, zoom-through, cut to
// a new colour). Fails on a move or transition used twice in this video, or on a background or camera held
// longer than 5.5 s. Warns on moves or transitions also used in the last 3 other videos in src/proto/.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const MAX_HOLD = 5.5; // seconds a background or camera may hold (rule: about 5 s)
const key = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

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
  for (const o of others)
    for (const m of moves)
      for (const [kind, name] of [["move", m.move], ["transition", m.transition]])
        if (name && o.moves.some((x) => x[kind] && key(x[kind]) === key(name))) warnings.push(`${kind} "${name}" was also used in ${o.id}`);
  return { errors, warnings };
};

// Scene id → start second in the video, and the video's length, from src/proto/<id>/words.json.
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
  const dir = "src/proto";
  const moves = JSON.parse(fs.readFileSync(`${dir}/${id}/moves.json`, "utf8"));
  const words = JSON.parse(fs.readFileSync(`${dir}/${id}/words.json`, "utf8"));
  const { offsets, length: at } = sceneOffsets(words);
  const others = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== id && fs.existsSync(`${dir}/${d.name}/moves.json`))
    .map((d) => ({ id: d.name, file: `${dir}/${d.name}/moves.json` }))
    .sort((a, b) => fs.statSync(b.file).mtimeMs - fs.statSync(a.file).mtimeMs)
    .slice(0, 3)
    .map((o) => ({ id: o.id, moves: JSON.parse(fs.readFileSync(o.file, "utf8")) }));
  const { errors, warnings } = check(moves, offsets, at, others);
  warnings.forEach((w) => console.log(`warn: ${w}`));
  errors.forEach((e) => console.log(`FAIL: ${e}`));
  console.log(errors.length ? `${errors.length} freshness error(s)` : `fresh: ${moves.length} beats, no repeats, no hold over ${MAX_HOLD} s`);
  process.exit(errors.length ? 1 : 0);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--self-test") {
    const offsets = { a: 0, b: 5 };
    const ok = check([{ scene: "a", at: 0, move: "dots", transition: "flood" }, { scene: "a", at: 3, move: "stamp" }, { scene: "b", at: 0, move: "dial", transition: "circle wipe" }, { scene: "b", at: 4, move: "ring", transition: "swipe" }], offsets, 12);
    const bad = check([{ scene: "a", at: 0, move: "dots" }, { scene: "b", at: 1, move: "Dots" }], offsets, 12, [{ id: "old", moves: [{ move: "dots" }] }]);
    if (ok.errors.length || bad.errors.length !== 2 || bad.warnings.length !== 2) throw new Error(`self-test failed: ${JSON.stringify({ ok, bad })}`);
    console.log("self-test ok");
  } else if (!process.argv[2]) {
    console.error("Usage: node scripts/fresh-check.mjs <video id>");
    process.exit(1);
  } else main(process.argv[2]);
}
