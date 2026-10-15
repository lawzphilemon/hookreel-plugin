// Usage: node scripts/loudness.mjs <file.wav>   (npm run loudness -- out/<id>-mix.wav)
// Integrated loudness (ITU-R BS.1770-4: K-weighted, 400 ms blocks, absolute and relative gates),
// sample peak and an estimated true peak of a 48 kHz 16-bit or 32-bit float WAV, such as
// `npx remotion render <id> out/<id>-mix.wav --codec=wav`. Plain Node: Remotion's ffmpeg has no
// ebur128 filter. True peak uses 4x Catmull-Rom interpolation (not the BS.1770 FIR), which can be off by a few
// tenths of a dB, so keep the target margin.
import fs from "fs";
import { fileURLToPath } from "url";

// Channels as Float64Arrays in -1..1.
export const readWav = (buf) => {
  let fmt = null;
  for (let p = 12; p + 8 <= buf.length; p += 8 + buf.readUInt32LE(p + 4) + (buf.readUInt32LE(p + 4) % 2)) {
    const id = buf.toString("ascii", p, p + 4);
    if (id === "fmt ") fmt = { format: buf.readUInt16LE(p + 8), ch: buf.readUInt16LE(p + 10), rate: buf.readUInt32LE(p + 12), bits: buf.readUInt16LE(p + 22) };
    if (id !== "data") continue;
    if (!fmt) throw new Error("no fmt chunk");
    const { ch, rate, bits } = fmt;
    const float = fmt.format === 3 || (fmt.format === 0xfffe && bits === 32);
    if (!(bits === 16 || (bits === 32 && float))) throw new Error(`unsupported WAV: ${bits}-bit format ${fmt.format}`);
    const size = bits / 8, n = Math.floor(Math.min(buf.readUInt32LE(p + 4), buf.length - p - 8) / (size * ch));
    const chans = Array.from({ length: ch }, () => new Float64Array(n));
    for (let i = 0; i < n; i++)
      for (let c = 0; c < ch; c++) {
        const o = p + 8 + (i * ch + c) * size;
        chans[c][i] = bits === 16 ? buf.readInt16LE(o) / 32768 : buf.readFloatLE(o);
      }
    return { rate, chans };
  }
  throw new Error("no data chunk");
};

// K-weighting at 48 kHz (BS.1770 table values): high shelf, then high pass.
const SHELF = [[1.53512485958697, -2.69169618940638, 1.19839281085285], [-1.69065929318241, 0.73248077421585]];
const HIGHPASS = [[1.0, -2.0, 1.0], [-1.99004745483398, 0.99007225036621]];
const biquad = (x, [[b0, b1, b2], [a1, a2]]) => {
  const y = new Float64Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const o = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = o;
    y[i] = o;
  }
  return y;
};

const lufs = (z) => (z > 0 ? -0.691 + 10 * Math.log10(z) : -Infinity);
const db = (x) => (x > 0 ? 20 * Math.log10(x) : -Infinity);

export const measure = ({ rate, chans }) => {
  if (rate !== 48000) throw new Error(`needs 48 kHz, got ${rate} Hz (render with --codec=wav, or resample first)`);
  const kw = chans.slice(0, 2).map((c) => biquad(biquad(c, SHELF), HIGHPASS)); // L and R (surround channels are not weighted here)
  const n = chans[0].length, block = 19200, hop = 4800; // 400 ms, 75 % overlap
  const ms = [];
  for (let s = 0; s + block <= n; s += hop) {
    let z = 0;
    for (const k of kw) {
      let sum = 0;
      for (let i = s; i < s + block; i++) sum += k[i] * k[i];
      z += sum / block;
    }
    ms.push(z);
  }
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const g1 = ms.filter((z) => lufs(z) > -70);
  const g2 = g1.length ? g1.filter((z) => lufs(z) > lufs(mean(g1)) - 10) : [];
  let peak = 0, tp = 0;
  for (const c of chans)
    for (let i = 0; i < n; i++) {
      peak = Math.max(peak, Math.abs(c[i]));
      if (i < 1 || i + 2 >= n) continue;
      const [p0, p1, p2, p3] = [c[i - 1], c[i], c[i + 1], c[i + 2]];
      for (const k of [0.25, 0.5, 0.75]) tp = Math.max(tp, Math.abs(p1 + 0.5 * k * (p2 - p0 + k * (2 * p0 - 5 * p1 + 4 * p2 - p3 + k * (3 * (p1 - p2) + p3 - p0)))));
    }
  return { integrated: g2.length ? lufs(mean(g2)) : -Infinity, samplePeak: db(peak), truePeak: db(Math.max(peak, tp)), seconds: n / rate };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--self-test") {
    // A 1 kHz sine at -20 dBFS in both channels reads -20 LUFS (BS.1770: 0 dBFS stereo sine = 0 LUFS).
    const n = 48000 * 5, s = Float64Array.from({ length: n }, (_, i) => 0.1 * Math.sin((2 * Math.PI * 1000 * i) / 48000));
    const r = measure({ rate: 48000, chans: [s, s] });
    if (Math.abs(r.integrated + 20) > 0.1 || Math.abs(r.samplePeak + 20) > 0.05) throw new Error(`self-test failed: ${JSON.stringify(r)}`);
    console.log("self-test ok");
  } else if (!process.argv[2]) {
    console.error("Usage: node scripts/loudness.mjs <file.wav>");
    process.exit(1);
  } else {
    const r = measure(readWav(fs.readFileSync(process.argv[2])));
    console.log(`integrated ${r.integrated.toFixed(1)} LUFS | sample peak ${r.samplePeak.toFixed(2)} dBFS | est. true peak ${r.truePeak.toFixed(2)} dBTP | ${r.seconds.toFixed(2)} s`);
  }
}
