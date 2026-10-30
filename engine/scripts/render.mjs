// Usage: node scripts/render.mjs <video id> [--draft]     (npm run render -- <video id>)
//
// The MP4 of one video: npm run assemble, then `hyperframes render` of reels/<id>/ (parallel Chrome
// workers, lint errors fail the render), a frame-count check against words.json, and the mix pulled
// out to out/<id>-mix.wav with its loudness printed (target about -16 to -17 LUFS, true peak at or
// below -0.5 dBTP). --draft renders at draft quality for a quick look; never post a draft.
import fs from "fs";
import path from "path";
import { execSync, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { FPS } from "../src/motion.mjs";
import { layout } from "./assemble.mjs";
import { measure, readWav } from "./loudness.mjs";

const id = process.argv[2];
if (!id || id.startsWith("--")) {
  console.error("Usage: node scripts/render.mjs <video id> [--draft]");
  process.exit(1);
}
const draft = process.argv.includes("--draft");
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { shell: true, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run("node", ["--no-warnings", `"${path.join(path.dirname(fileURLToPath(import.meta.url)), "assemble.mjs")}"`, id]);
fs.mkdirSync("out", { recursive: true });
const mp4 = path.join("out", `${id}${draft ? "-draft" : ""}.mp4`);
const t0 = Date.now();
run("npx", ["--yes", "hyperframes@0.8.188", "render", path.join("reels", id), "-o", mp4, "--strict", "--quiet", ...(draft ? ["--quality", "draft"] : [])]);
const minutes = ((Date.now() - t0) / 60000).toFixed(1);

const words = JSON.parse(fs.readFileSync(path.join("reels", id, "words.json"), "utf8"));
const want = Math.round(layout(words).total * FPS);
const got = Number(spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", mp4], { shell: true, encoding: "utf8" }).stdout.trim());
if (Math.abs(got - want) > 1) {
  console.error(`error: ${mp4} has ${got} frames, words.json needs ${want}`);
  process.exit(1);
}

const mix = path.join("out", `${id}-mix.wav`);
execSync(`ffmpeg -y -loglevel error -i "${mp4}" -vn -ac 2 -ar 48000 -c:a pcm_s16le "${mix}"`, { stdio: "inherit" });
const r = measure(readWav(fs.readFileSync(mix)));
console.log(`rendered ${mp4} in ${minutes} min: ${got} frames | mix ${r.integrated.toFixed(1)} LUFS, true peak ${r.truePeak.toFixed(2)} dBTP`);
if (r.truePeak > -0.5 || r.integrated > -15 || r.integrated < -18) console.log("warn: mix outside -16 to -17 LUFS / -0.5 dBTP: set voiceGain in videos/<id>.json (default 0.9; +1 dB = x1.12), or data-volume on the music or effects, and render again");
