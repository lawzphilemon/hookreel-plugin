// Usage: node scripts/trim-pauses.mjs "<recording>" [max pause in s, default 0.3]   (npm run trim -- "<recording>")
// Caps every pause inside a finished take, so a loose or too-long video gets tighter without a retake
// and without speeding the voice up. Writes out/<name>-trimmed.wav next to an untouched original; run
// `npm run vo` on the trimmed file, then `npm run words`, and every scene re-times itself.
// A pause is a stretch below -30 dBFS (the same threshold `npm run vo` cuts at) longer than the cap; its
// middle is removed, so cap/2 of room tone stays after the last word and before the next one, joined
// with a 10 ms crossfade. Silence before the first and after the last word is left to `npm run vo`.
// Below about 0.18 s the speech starts to sound clipped, so that is the floor.
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { readWav } from "./loudness.mjs";

const THRESHOLD = 10 ** (-30 / 20);
const XFADE = 0.01;

// Pauses longer than `cap` seconds: [{ start, end }] in seconds, from the loudest channel per sample.
export const pauses = (chans, rate, cap) => {
  const out = [];
  const n = chans[0].length, min = Math.round(cap * rate);
  let run = -1;
  for (let i = 0; i <= n; i++) {
    const quiet = i < n && chans.every((c) => Math.abs(c[i]) < THRESHOLD);
    if (quiet && run < 0) run = i;
    if (!quiet && run >= 0) {
      // Edges stay: the lead-in and tail belong to `npm run vo`.
      if (i - run > min && run > 0 && i < n) out.push({ start: run / rate, end: i / rate });
      run = -1;
    }
  }
  return out;
};

// Sample ranges to remove: the middle of each pause, keeping cap/2 on both sides.
export const cuts = (list, rate, cap) =>
  list.map((p) => [Math.round((p.start + cap / 2) * rate), Math.round((p.end - cap / 2) * rate)]).filter(([a, b]) => b > a);

// The take without the cut ranges, each join crossfaded over `x` samples (taken from the removed part).
export const splice = (chans, ranges, x) =>
  chans.map((c) => {
    const keep = [];
    let from = 0;
    for (const [a, b] of ranges) {
      keep.push(c.subarray(from, a));
      from = b;
    }
    keep.push(c.subarray(from));
    const out = new Float64Array(keep.reduce((s, k) => s + k.length, 0));
    let at = 0;
    keep.forEach((k, i) => {
      out.set(k, at);
      // Fade the removed audio that followed the join out over the first `x` samples of the next part.
      if (i > 0) {
        const tail = c.subarray(ranges[i - 1][0], ranges[i - 1][0] + x);
        for (let j = 0; j < tail.length && j < k.length; j++) out[at + j] = (tail[j] * (x - j) + k[j] * j) / x;
      }
      at += k.length;
    });
    return out;
  });

const writeWav = (file, chans, rate) => {
  const ch = chans.length, n = chans[0].length, buf = Buffer.alloc(44 + n * ch * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * ch * 2, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(ch, 22); buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * ch * 2, 28); buf.writeUInt16LE(ch * 2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * ch * 2, 40);
  for (let i = 0; i < n; i++)
    for (let c = 0; c < ch; c++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(chans[c][i] * 32768))), 44 + (i * ch + c) * 2);
  fs.writeFileSync(file, buf);
};

const main = (input, cap) => {
  if (!(cap >= 0.18)) throw new Error(`max pause ${cap} s is below 0.18 s, where speech starts to sound clipped`);
  fs.mkdirSync("out", { recursive: true });
  const name = path.basename(input, path.extname(input));
  const pcm = path.join("out", `${name}-pcm.wav`);
  execSync(`npx remotion ffmpeg -y -loglevel error -i "${input}" -ar 48000 -c:a pcm_s16le "${pcm}"`, { stdio: "inherit" });
  const { rate, chans } = readWav(fs.readFileSync(pcm));
  const list = pauses(chans, rate, cap);
  const ranges = cuts(list, rate, cap);
  // A cut must sit in room tone: warn when the 30 ms either side of it is louder than 10 % of the take's peak.
  const peak = Math.max(...chans.map((c) => c.reduce((m, v) => Math.max(m, Math.abs(v)), 0)));
  const win = Math.round(0.03 * rate);
  for (const [a, b] of ranges) {
    const near = Math.max(...chans.map((c) => [...c.subarray(a - win, a), ...c.subarray(b, b + win)].reduce((m, v) => Math.max(m, Math.abs(v)), 0)));
    if (near > peak * 0.1) console.warn(`  warn: cut at ${(a / rate).toFixed(2)} s is near speech (${Math.round((near / peak) * 100)} % of peak); listen there`);
  }
  const out = path.join("out", `${name}-trimmed.wav`);
  const trimmed = splice(chans, ranges, Math.round(XFADE * rate));
  writeWav(out, trimmed, rate);
  fs.rmSync(pcm);
  const before = chans[0].length / rate, after = trimmed[0].length / rate;
  console.log(`${ranges.length} pauses capped at ${cap} s: ${before.toFixed(2)} s → ${after.toFixed(2)} s (−${(before - after).toFixed(2)} s)`);
  console.log(`wrote ${out}; next: npm run vo -- <video id> "${out}", then npm run words -- <video id>`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--self-test") {
    // 0.5 s tone, 1 s silence, 0.5 s tone at a 1 kHz sample rate: the 1 s pause shrinks to 0.3 s.
    const rate = 1000, tone = (n) => Array.from({ length: n }, (_, i) => (i % 2 ? 0.5 : -0.5));
    const c = Float64Array.from([...tone(500), ...Array(1000).fill(0), ...tone(500)]);
    const list = pauses([c], rate, 0.3);
    const got = splice([c], cuts(list, rate, 0.3), 10)[0].length;
    if (list.length !== 1 || got !== 1300) throw new Error(`self-test failed: ${JSON.stringify(list)} → ${got} samples`);
    // Leading and trailing silence is not a pause.
    if (pauses([Float64Array.from([...Array(800).fill(0), ...tone(200), ...Array(800).fill(0)])], rate, 0.3).length) throw new Error("self-test failed: edges trimmed");
    console.log("self-test ok");
  } else if (!process.argv[2]) {
    console.error('Usage: node scripts/trim-pauses.mjs "<recording>" [max pause s, default 0.3]');
    process.exit(1);
  } else main(process.argv[2], Number(process.argv[3] ?? 0.3));
}
