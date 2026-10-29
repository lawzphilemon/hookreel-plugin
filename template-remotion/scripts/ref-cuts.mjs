// Usage: node scripts/ref-cuts.mjs "<reference video>"   (npm run refcuts -- "<reference video>")
// Measures a reference reel's cut rhythm (how long one shot holds) and saves one frame per shot to look at.
// Remotion's bundled ffmpeg has no scene-detect, fps or tile filter, so this reads small grey frames at
// 10 fps and calls a cut where a frame differs from the one before by more than both 12 % and 4× the
// median change. Writes out/refs/<name>/shot-NN.png (270 px wide, from the middle of each shot) and
// out/refs/<name>/cuts.json. A fast move or flash can count as a cut and a slow dissolve can be missed:
// check the shots against the frames.
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const RATE = 10;

// Pixels of an 8-bit greyscale PNG (as ffmpeg writes with -pix_fmt gray).
export const readGrayPng = (buf) => {
  let at = 8, w = 0, h = 0;
  const idat = [];
  while (at < buf.length) {
    const len = buf.readUInt32BE(at), type = buf.toString("ascii", at + 4, at + 8), data = buf.subarray(at + 8, at + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 0 || data[12] !== 0) throw new Error("expected an 8-bit greyscale, non-interlaced PNG");
    }
    if (type === "IDAT") idat.push(data);
    at += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), px = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (w + 1)], row = raw.subarray(y * (w + 1) + 1, (y + 1) * (w + 1));
    for (let x = 0; x < w; x++) {
      const a = x ? px[y * w + x - 1] : 0, b = y ? px[(y - 1) * w + x] : 0, c = x && y ? px[(y - 1) * w + x - 1] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f];
      px[y * w + x] = (row[x] + pred) & 255;
    }
  }
  return px;
};

// frames: greyscale pixel arrays at `rate` fps. Returns shot start times in seconds (the first is 0).
export const cuts = (frames, rate = RATE) => {
  const diff = frames.slice(1).map((f, i) => f.reduce((s, v, k) => s + Math.abs(v - frames[i][k]), 0) / f.length / 255);
  const median = [...diff].sort((a, b) => a - b)[Math.floor(diff.length / 2)] ?? 0;
  const starts = [0];
  diff.forEach((d, i) => {
    const t = (i + 1) / rate;
    if (d > 0.12 && d > 4 * median && t - starts[starts.length - 1] >= 0.2) starts.push(t);
  });
  return starts;
};

const main = (input) => {
  const name = path.basename(input, path.extname(input)).replace(/[^\w-]+/g, "-");
  const dir = path.join("out", "refs", name), tmp = path.join(dir, "tmp");
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const ff = (args) => execSync(`npx remotion ffmpeg -hide_banner -loglevel error -y -i "${input}" ${args}`, { stdio: ["ignore", "ignore", "inherit"] });
  ff(`-r ${RATE} -vf scale=72:128 -pix_fmt gray "${tmp}/g%05d.png"`);
  ff(`-r ${RATE} -vf scale=270:-2 "${tmp}/c%05d.png"`);
  const files = fs.readdirSync(tmp).filter((f) => f.startsWith("g")).sort();
  const starts = cuts(files.map((f) => readGrayPng(fs.readFileSync(path.join(tmp, f)))));
  const length = files.length / RATE, ends = [...starts.slice(1), length];
  const shots = starts.map((s, i) => ({ start: s, seconds: Math.round((ends[i] - s) * 10) / 10 }));
  shots.forEach((s, i) => {
    const frame = Math.min(files.length, Math.round((s.start + s.seconds / 2) * RATE) + 1);
    fs.copyFileSync(path.join(tmp, `c${String(frame).padStart(5, "0")}.png`), path.join(dir, `shot-${String(i + 1).padStart(2, "0")}.png`));
  });
  fs.rmSync(tmp, { recursive: true, force: true });
  const holds = shots.map((s) => s.seconds).sort((a, b) => a - b);
  const summary = { video: input, seconds: length, shots: shots.length, cutsPer10s: Math.round((shots.length / length) * 100) / 10, medianShot: holds[Math.floor(holds.length / 2)], longestShot: holds[holds.length - 1], list: shots };
  fs.writeFileSync(path.join(dir, "cuts.json"), JSON.stringify(summary, null, 2));
  console.log(`${name}: ${length.toFixed(1)} s, ${shots.length} shots, ${summary.cutsPer10s} cuts per 10 s, median shot ${summary.medianShot} s, longest ${summary.longestShot} s`);
  console.log(`  shots: ${shots.map((s) => `${s.start.toFixed(1)}s(${s.seconds})`).join(" ")}`);
  console.log(`  wrote ${dir}/shot-NN.png and cuts.json`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--self-test") {
    // 2 s dark, 1 s bright, 1 s dark again with a little noise: three shots, at 0, 2 and 3 s.
    const frame = (v, i) => Uint8Array.from({ length: 64 }, (_, k) => v + ((i * 7 + k) % 5));
    const frames = [...Array(20)].map((_, i) => frame(20, i)).concat([...Array(10)].map((_, i) => frame(200, i)), [...Array(10)].map((_, i) => frame(20, i)));
    const got = cuts(frames);
    // A real 2×2 greyscale PNG: filter 0 row [10, 20], filter 2 (up) row [+5, +5] → [15, 25].
    const raw = zlib.deflateSync(Buffer.from([0, 10, 20, 2, 5, 5]));
    const chunk = (type, data) => { const b = Buffer.alloc(12 + data.length); b.writeUInt32BE(data.length, 0); b.write(type, 4); data.copy(b, 8); return b; };
    const ihdr = Buffer.from([0, 0, 0, 2, 0, 0, 0, 2, 8, 0, 0, 0, 0]);
    const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", raw), chunk("IEND", Buffer.alloc(0))]);
    const px = [...readGrayPng(png)];
    if (JSON.stringify(got) !== "[0,2,3]" || JSON.stringify(px) !== "[10,20,15,25]") throw new Error(`self-test failed: ${JSON.stringify({ got, px })}`);
    console.log("self-test ok");
  } else if (!process.argv[2]) {
    console.error('Usage: node scripts/ref-cuts.mjs "<reference video>"');
    process.exit(1);
  } else main(process.argv[2]);
}
