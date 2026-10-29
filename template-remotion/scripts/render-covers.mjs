// Usage: node scripts/render-covers.mjs <video id>
// Renders every cover variant in videos/<id>.json to out/<id>-cover-<n>.png, plus out/<id>-cover-<n>-grid.png:
// the centre 1080×1440 crop that Instagram shows in the profile grid.
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const [id] = process.argv.slice(2);
if (!id) {
  console.error("Usage: node scripts/render-covers.mjs <video id>");
  process.exit(1);
}
const { cover = [], width = 1080, height = 1920 } = JSON.parse(fs.readFileSync(path.join("videos", `${id}.json`), "utf8"));
if (!cover.length) throw new Error(`videos/${id}.json has no "cover" variants`);
execSync("node scripts/register-videos.mjs", { stdio: "inherit" });
const gridHeight = Math.round((width * 4) / 3);
for (let n = 1; n <= cover.length; n++) {
  const png = path.join("out", `${id}-cover-${n}.png`);
  execSync(`npx remotion still ${id}-cover-${n} "${png}" --log=error`, { stdio: "inherit" });
  const grid = png.replace(/\.png$/, "-grid.png");
  execSync(`npx remotion ffmpeg -y -loglevel error -i "${png}" -vf crop=${width}:${gridHeight}:0:${Math.round((height - gridHeight) / 2)} "${grid}"`, { stdio: "inherit" });
  console.log(`${png}  (grid preview ${grid})`);
}
