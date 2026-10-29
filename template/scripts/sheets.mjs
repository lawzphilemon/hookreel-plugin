// Usage: node scripts/sheets.mjs <video id>                     (npm run sheets -- <video id>)
//        node scripts/sheets.mjs <video id> --gate <critique.md>   (npm run sheets -- <video id> --gate <file>)
//
//        node scripts/sheets.mjs <video id> --sweep               (npm run sweep -- <video id>)
//
// Critique sheets: what a director looks at before a full render, as stills. The frames come from
// `hyperframes snapshot` on reels/<id>/ (run npm run assemble first); the pages are laid out as HTML and
// snapshotted too, so no font or filter depends on the local ffmpeg:
//   contact-NN.png  every half second of the video, 24 frames a page (pacing, variety, dead beats),
//   strip-NN.png    12 consecutive frames around every transition in moves.json, two a page (pops,
//                   overlaps, a wipe that leaves a gap, sliding instead of easing),
//   phone-NN.png    every beat at 360 px wide, at the moment its hero is complete (readability on a phone).
// Written to out/sheets/<id>/. The safe area is drawn in red on every tile.
// --sweep: 6 frames of every scene on one page at quarter scale, out/<id>-sweep.png (the layout check).
//
// --gate reads the scored critique (/hookreel:qa Step 1b) and fails unless it is newer than the sheets,
// the sheets are newer than every file in reels/<id>/, and every criterion scores 8 or more:
//   | Hook | 8 | …   one table row per criterion in CRITERIA, the score in the second column.
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { FPS, TIME } from "../src/motion.ts";

export const CRITERIA = ["Hook", "Phone readability", "Motion quality", "Variety", "Composition", "Brand accuracy", "Sound sync"];
const PASS = 8;

const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

// moves: moves.json; words: words.json. Returns the sheet pages ({ title, cols, w, frames }).
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
  const code = fs.readdirSync(path.join("reels", id), { recursive: true }).map((f) => path.join("reels", id, f)).filter((f) => fs.statSync(f).isFile() && !/(moves|style)\.json$/.test(f) && !/(^|[\\/])\.hyperframes[\\/]/.test(f));
  const errors = [];
  if (!sheets.length) errors.push(`no sheets in ${out}: run npm run sheets -- ${id}`);
  else if (Math.min(...sheets.map((f) => fs.statSync(f).mtimeMs)) < newest([...code, path.join("kit", "kit.js")])) errors.push("the scenes changed after the sheets were made: run npm run sheets again and score the new sheets");
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

const sec = (f) => Math.round((f / FPS) * 1000) / 1000;
const hf = (args) => {
  const r = spawnSync("npx", ["--yes", "hyperframes@0.8.188", ...args], { shell: true, stdio: ["ignore", "ignore", "inherit"] });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// Stills of reels/<id> at the given frames → { frame: png } (snapshot --keep names them at-<s>s.png).
const shoot = (id, frames, out) => {
  const uniq = [...new Set(frames)].sort((a, b) => a - b);
  for (let i = 0; i < uniq.length; i += 40) hf(["snapshot", path.join("reels", id), "--at", uniq.slice(i, i + 40).map(sec).join(","), "--no-end", "--keep", "-o", out]);
  const files = {};
  for (const f of uniq) {
    const file = path.join(out, `at-${sec(f)}s.png`);
    if (!fs.existsSync(file)) throw new Error(`snapshot missing ${file}`);
    files[f] = file;
  }
  return files;
};

// The pages as one HyperFrames composition, one page per second, snapshotted; returns the PNGs in order.
const layoutPages = (pages, files, sceneAt, out, size) => {
  const proj = path.join(out, "pages"), LABEL = 28, line = "rgba(255,40,40,0.85)";
  fs.rmSync(proj, { recursive: true, force: true });
  fs.mkdirSync(path.join(proj, "assets"), { recursive: true });
  for (const [f, file] of Object.entries(files)) fs.copyFileSync(file, path.join(proj, "assets", `f${f}.png`));
  const body = pages.map((p, i) => {
    const k = p.w / 1080, h = Math.round(1920 * k);
    const tiles = p.frames.map((f) => [
      `<div style="position:relative;width:${p.w}px;height:${h + LABEL}px;overflow:hidden">`,
      `<img src="assets/f${f}.png" style="width:${p.w}px;height:${h}px;display:block">`,
      `<div style="position:absolute;left:0;right:0;top:${Math.round(1500 * k)}px;height:2px;background:${line}"></div>`,
      `<div style="position:absolute;top:0;height:${h}px;left:${Math.round(80 * k)}px;width:1px;background:${line}"></div>`,
      `<div style="position:absolute;top:0;height:${h}px;left:${Math.round(1000 * k)}px;width:1px;background:${line}"></div>`,
      `<div style="position:absolute;left:6px;top:${h}px;color:#fff;font:15px/${LABEL}px Inter">${sceneAt(f)} · ${(f / FPS).toFixed(2)} s · f${f}</div></div>`,
    ].join("")).join("");
    return `<div id="page-${i}" class="clip" data-start="${i}" data-duration="1" style="position:absolute;inset:0;background:#222"><div style="height:60px;color:#fff;font:30px/60px Inter;padding-left:12px">${p.title}</div><div style="display:flex;flex-wrap:wrap;width:${p.w * p.cols}px">${tiles}</div></div>`;
  }).join("\n");
  fs.writeFileSync(path.join(proj, "index.html"), `<!doctype html>
<html><head><meta charset="UTF-8"><script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>*{margin:0;box-sizing:border-box}html,body{width:${size.width}px;height:${size.height}px;overflow:hidden;background:#222}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="${pages.length}" data-width="${size.width}" data-height="${size.height}">
${body}
</div><script>window.__timelines["main"] = gsap.timeline({ paused: true });</script></body></html>
`);
  const shots = path.join(proj, "shots");
  hf(["snapshot", proj, "--at", pages.map((_, i) => i + 0.5).join(","), "--no-end", "--keep", "-o", shots]);
  return pages.map((_, i) => path.join(shots, `at-${i + 0.5}s.png`));
};

const main = (id, sweep) => {
  const dir = path.join("reels", id);
  if (!fs.existsSync(path.join(dir, "index.html"))) throw new Error(`${dir}/index.html missing: run npm run assemble -- ${id}`);
  const words = JSON.parse(fs.readFileSync(path.join(dir, "words.json"), "utf8"));
  const starts = [];
  let total = 0;
  for (const [sid, s] of Object.entries(words.scenes)) {
    starts.push({ sid, from: total });
    total += Math.round((s.secs + TIME.leadIn + TIME.tail) * FPS);
  }
  const sceneAt = (f) => starts.filter((s) => s.from <= f).pop()?.sid ?? "";
  let pages, files, size;
  if (sweep) {
    const frames = starts.flatMap((s, i) => {
      const n = (starts[i + 1]?.from ?? total) - s.from;
      return Array.from({ length: 6 }, (_, k) => s.from + Math.round(((k + 0.5) / 6) * n));
    });
    pages = [{ title: `${id} · sweep · 6 frames per scene`, cols: 6, w: 270, frames }];
    files = [`${id}-sweep.png`];
    size = { width: 270 * 6, height: 60 + starts.length * (480 + 28) };
  } else {
    pages = sheetPages(JSON.parse(fs.readFileSync(path.join(dir, "moves.json"), "utf8")), words);
    files = names(pages);
    size = { width: 1620, height: 2100 };
  }
  const out = path.join("out", sweep ? "sweep" : "sheets", id);
  fs.rmSync(out, { recursive: true, force: true });
  const shots = shoot(id, pages.flatMap((p) => p.frames), path.join(out, "frames"));
  const pngs = layoutPages(pages, shots, sceneAt, out, size);
  const dest = sweep ? "out" : out;
  files.forEach((name, i) => fs.copyFileSync(pngs[i], path.join(dest, name)));
  if (!sweep) for (const d of ["frames", "pages"]) fs.rmSync(path.join(out, d), { recursive: true, force: true });
  console.log(`wrote ${files.length} ${sweep ? "sweep" : "sheets"} to ${dest}: ${files.join(", ")}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  // npm run sweep -- <id> passes --sweep first
  if (argv[0] === "--sweep") argv.push(argv.shift());
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
  else main(argv[0], argv.includes("--sweep"));
}
