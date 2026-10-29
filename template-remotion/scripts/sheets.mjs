// Usage: node scripts/sheets.mjs <video id>                     (npm run sheets -- <video id>)
//        node scripts/sheets.mjs <video id> --gate <critique.md>   (npm run sheets -- <video id> --gate <file>)
//
// Critique sheets: what a director looks at before a full render, as stills, in one bundle and one render
// (the <id>-critique composition: protoReel(…).sheet in src/proto/kit.tsx; one page per output frame):
//   contact-NN.png  every half second of the video, 24 frames a page (pacing, variety, dead beats),
//   strip-NN.png    12 consecutive frames around every transition in moves.json, two a page (pops,
//                   overlaps, a wipe that leaves a gap, sliding instead of easing),
//   phone-NN.png    every beat at 360 px wide, at the moment its hero is complete (readability on a phone).
// Written to out/sheets/<id>/. The safe area is drawn in red on every tile.
//
// --gate reads the scored critique (/hookreel:qa Step 1b) and fails unless it is newer than the sheets,
// the sheets are newer than every file in src/proto/<id>/, and every criterion scores 8 or more:
//   | Hook | 8 | …   one table row per criterion in CRITERIA, the score in the second column.
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { FPS, TIME } from "../src/motion.ts";

export const CRITERIA = ["Hook", "Phone readability", "Motion quality", "Variety", "Composition", "Brand accuracy", "Sound sync"];
const PASS = 8;

const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

// moves: moves.json; words: words.json. Returns the sheet pages (see kit.tsx SheetPage).
export const sheetPages = (moves, words) => {
  const start = {};
  let total = 0;
  for (const [id, s] of Object.entries(words.scenes)) {
    start[id] = total;
    total += Math.round((s.secs + TIME.leadIn + TIME.tail) * FPS);
  }
  const at = (m, sec) => Math.min(total - 1, Math.max(0, start[m.scene] + Math.round(sec * FPS)));
  const contact = Array.from({ length: Math.ceil(total / (FPS / 2)) }, (_, i) => Math.round((i * FPS) / 2)).filter((f) => f < total);
  const pages = chunk(contact, 24).map((frames, i) => ({ title: `contact ${i + 1} · every 0.5 s`, cols: 6, w: 270, frames }));
  const cuts = moves.filter((m) => m.transition);
  chunk(cuts, 2).forEach((pair, i) => {
    const frames = pair.flatMap((m) => Array.from({ length: 12 }, (_, k) => at(m, m.at) - 2 + k).map((f) => Math.min(total - 1, Math.max(0, f))));
    pages.push({ title: `strip ${i + 1} · ${pair.map((m) => `${m.scene} @${m.at}s`).join(" · ")}`, cols: 6, w: 270, frames });
  });
  // The hero is complete just before it starts to leave (life() exits over about 0.45 s).
  const heroes = moves.map((m) => at(m, Math.max(m.at + 0.3, (m.until ?? m.at + 1) - 0.5)));
  chunk(heroes, 12).forEach((frames, i) => pages.push({ title: `phone ${i + 1} · 360 px wide`, cols: 4, w: 360, frames }));
  return pages;
};

const names = (pages) => {
  const n = {};
  return pages.map((p) => {
    const kind = p.title.split(" ")[0];
    n[kind] = (n[kind] ?? 0) + 1;
    return `${kind}-${String(n[kind]).padStart(2, "0")}.png`;
  });
};

// The critique's scores: { criterion: score } from markdown table rows.
export const readScores = (md) => {
  const scores = {};
  for (const line of md.split(/\r?\n/)) {
    const cells = line.split("|").map((c) => c.trim());
    const name = CRITERIA.find((c) => c.toLowerCase() === (cells[1] ?? "").toLowerCase());
    if (name && /^\d+(\.\d+)?$/.test(cells[2] ?? "")) scores[name] = Number(cells[2]);
  }
  return scores;
};

const newest = (files) => Math.max(0, ...files.map((f) => fs.statSync(f).mtimeMs));

const gate = (id, critique) => {
  const out = path.join("out", "sheets", id);
  const sheets = fs.existsSync(out) ? fs.readdirSync(out).filter((f) => f.endsWith(".png")).map((f) => path.join(out, f)) : [];
  const code = fs.readdirSync(path.join("src", "proto", id), { recursive: true }).map((f) => path.join("src", "proto", id, f)).filter((f) => fs.statSync(f).isFile() && !/(moves|style)\.json$/.test(f));
  const errors = [];
  if (!sheets.length) errors.push(`no sheets in ${out}: run npm run sheets -- ${id}`);
  else if (Math.min(...sheets.map((f) => fs.statSync(f).mtimeMs)) < newest([...code, path.join("src", "proto", "kit.tsx")])) errors.push("the scenes changed after the sheets were made: run npm run sheets again and score the new sheets");
  if (!fs.existsSync(critique)) errors.push(`${critique} not found`);
  else {
    if (sheets.length && fs.statSync(critique).mtimeMs < newest(sheets)) errors.push("the critique is older than the sheets: score the current sheets");
    const scores = readScores(fs.readFileSync(critique, "utf8"));
    for (const c of CRITERIA) {
      if (scores[c] === undefined) errors.push(`no score for "${c}"`);
      else if (scores[c] < PASS) errors.push(`${c}: ${scores[c]} (needs ${PASS}+)`);
    }
  }
  errors.forEach((e) => console.error(`error: ${e}`));
  if (errors.length) process.exit(1);
  console.log(`gate ok: every criterion ${PASS}+ on the current sheets; the full render may start`);
};

const main = (id) => {
  const dir = path.join("src", "proto", id);
  const words = JSON.parse(fs.readFileSync(path.join(dir, "words.json"), "utf8"));
  const moves = JSON.parse(fs.readFileSync(path.join(dir, "moves.json"), "utf8"));
  const pages = sheetPages(moves, words);
  const out = path.join("out", "sheets", id);
  fs.rmSync(out, { recursive: true, force: true });
  const seq = path.join(out, "seq");
  fs.mkdirSync(seq, { recursive: true });
  const props = path.join(out, "pages.json");
  fs.writeFileSync(props, JSON.stringify({ pages }));
  const r = spawnSync("npx", ["remotion", "render", `${id}-critique`, seq, "--sequence", "--image-format=png", `--frames=0-${pages.length - 1}`, `--props=${props}`, "--log=error"], { shell: true, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
  const files = fs.readdirSync(seq).filter((f) => f.endsWith(".png")).sort();
  if (files.length !== pages.length) throw new Error(`${files.length} images for ${pages.length} pages`);
  names(pages).forEach((name, i) => fs.renameSync(path.join(seq, files[i]), path.join(out, name)));
  fs.rmSync(seq, { recursive: true });
  console.log(`wrote ${pages.length} sheets to ${out}: ${names(pages).join(", ")}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  if (argv[0] === "--self-test") {
    const words = { scenes: { "01-hook": { secs: 3 }, "02-why": { secs: 2 } } };
    const moves = [{ scene: "01-hook", at: 0, until: 2 }, { scene: "02-why", at: 0.5, until: 2, transition: "flood" }];
    const pages = sheetPages(moves, words);
    const kinds = pages.map((p) => p.title.split(" ")[0]);
    if (JSON.stringify(kinds) !== JSON.stringify(["contact", "strip", "phone"])) throw new Error(`self-test pages: ${kinds}`);
    const start2 = Math.round((3 + TIME.leadIn + TIME.tail) * FPS);
    if (pages[1].frames[2] !== start2 + Math.round(0.5 * FPS)) throw new Error(`self-test strip: ${pages[1].frames}`);
    const md = "| Criterion | Score |\n|---|---|\n| Hook | 9 |\n| phone readability | 7 |";
    const s = readScores(md);
    if (s.Hook !== 9 || s["Phone readability"] !== 7) throw new Error(`self-test scores: ${JSON.stringify(s)}`);
    console.log("self-test ok");
  } else if (!argv[0] || argv[0].startsWith("--")) {
    console.error("Usage: node scripts/sheets.mjs <video id> [--gate <critique.md>]");
    process.exit(1);
  } else if (argv.includes("--gate")) gate(argv[0], argv[argv.indexOf("--gate") + 1]);
  else main(argv[0]);
}
