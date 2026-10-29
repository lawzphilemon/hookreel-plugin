// Usage: node scripts/covers.mjs <video id>     (npm run cover -- <video id>)
//
// Cover variants are still HyperFrames pages, one folder each: reels/<id>-cover-<n>/index.html
// (1080×1920, data-no-timeline on the root, the kit linked as assets/kit.css; written per video by
// /hookreel:publish). This copies the kit and every public/ file they name into their assets/, takes
// the still, and writes out/<id>-cover-<n>.png plus out/<id>-cover-<n>-grid.png: the centre 1080×1440
// that Instagram's profile grid shows (3:4).
import fs from "fs";
import path from "path";
import { execSync, spawnSync } from "child_process";
import { syncAssets } from "./assemble.mjs";

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/covers.mjs <video id>");
  process.exit(1);
}
const dirs = fs.readdirSync("reels").filter((d) => new RegExp(`^${id}-cover-\\d+$`).test(d)).sort();
if (!dirs.length) throw new Error(`no reels/${id}-cover-<n>/ folders yet`);
fs.mkdirSync("out", { recursive: true });
for (const d of dirs) {
  const dir = path.join("reels", d);
  const missing = syncAssets(dir, dir);
  if (missing.length) throw new Error(`not found: ${missing.join(", ")}`);
  const shots = path.join("out", "covers", d);
  const r = spawnSync("npx", ["--yes", "hyperframes@0.8.188", "snapshot", dir, "--at", "0", "--no-end", "--keep", "-o", shots], { shell: true, stdio: ["ignore", "ignore", "inherit"] });
  if (r.status !== 0) process.exit(r.status ?? 1);
  const png = path.join("out", `${d}.png`), grid = path.join("out", `${d}-grid.png`);
  fs.copyFileSync(path.join(shots, "at-0s.png"), png);
  execSync(`ffmpeg -y -loglevel error -i "${png}" -vf crop=1080:1440:0:240 "${grid}"`, { stdio: "inherit" });
  console.log(`${png}  (grid preview ${grid})`);
}
