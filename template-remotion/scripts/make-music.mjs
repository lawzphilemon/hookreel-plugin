// Usage: node scripts/make-music.mjs <video id> [--mood energetic|cheerful|chill|dramatic] [--bpm N] [--seed N]
//   (npm run music -- <video id> --mood chill, after npm run words)
// Original background music synthesised from code, so no track needs a licence: kick, clap, hats, bass,
// plucked arpeggio and pad on a four-chord loop, with sidechain ducking on the kick. The length and the
// lift come from src/proto/<id>/words.json: one sparse intro bar, the full groove, a riser into the last
// scene and a closing chord. Writes public/music/<id>-synth.wav (48 kHz stereo, about -14 LUFS, peaks at
// most -1.5 dBFS). It is not ducked here: the kit's `Music` (or the template's BackgroundMusic) dips it
// under the voice, so after a new recording run `npm run words`, then this again.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { measure } from "./loudness.mjs";
import { sceneOffsets } from "./fresh-check.mjs";

const RATE = 48000, TAU = Math.PI * 2;

export const MOODS = {
  energetic: { bpm: 120, chords: ["Am", "F", "C", "G"], kick: "four", clap: true, hats: 16, arp: 16, riser: true, bright: 1 },
  cheerful: { bpm: 112, chords: ["C", "G", "Am", "F"], kick: "four", clap: true, hats: 8, arp: 8, riser: true, bright: 1 },
  chill: { bpm: 88, chords: ["Dm", "Am", "C", "G"], kick: "half", clap: false, hats: 8, arp: 8, riser: false, bright: 0.45 },
  dramatic: { bpm: 96, chords: ["Am", "F", "Dm", "E"], kick: "pulse", clap: false, hats: 0, arp: 8, riser: true, bright: 0.7 },
};

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// Triad of a chord name ("Am", "F#", "Bb") as three frequencies around the octave below middle C.
export const chord = (name) => {
  let r = NOTE[name[0]], rest = name.slice(1);
  if (rest[0] === "#") { r++; rest = rest.slice(1); } else if (rest[0] === "b") { r--; rest = rest.slice(1); }
  const minor = rest.startsWith("m") && !rest.startsWith("maj");
  let root = 48 + r;
  while (root > 52) root -= 12;
  return [root, root + (minor ? 3 : 4), root + 7].map((m) => 440 * 2 ** ((m - 69) / 12));
};

// length: seconds; last: second the last scene starts (the riser lands there). Returns [L, R] Float64Arrays.
export const compose = ({ length, last, mood, bpm, seed = 7 }) => {
  const M = { ...MOODS[mood], ...(bpm ? { bpm } : {}) };
  const beat = 60 / M.bpm, bar = beat * 4, n = Math.ceil(length * RATE);
  let s = seed >>> 0;
  const noise = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
  const music = [new Float64Array(n), new Float64Array(n)], drums = [new Float64Array(n), new Float64Array(n)];
  const place = (buf, secs, t0, fn, pan = 0, gain = 1) => {
    const a = Math.round(t0 * RATE), len = Math.round(secs * RATE);
    const l = Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2 * gain, r = Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2 * gain;
    for (let i = Math.max(0, -a); i < len && a + i < n; i++) {
      const v = fn(i / RATE, i / len);
      buf[0][a + i] += v * l;
      buf[1][a + i] += v * r;
    }
  };
  // State-variable filter: returns { low, band, high } per sample.
  const svf = () => {
    let low = 0, band = 0;
    return (x, f, q = 0.7) => {
      const k = 2 * Math.sin((Math.PI * Math.min(f, 18000)) / RATE), high = x - low - q * band;
      band += k * high;
      low += k * band;
      return { low, band, high };
    };
  };
  const kick = (t0, g) => { let ph = 0; place(drums, 0.45, t0, (t) => ((ph += (TAU * (46 + 130 * Math.exp(-t * 30))) / RATE), Math.sin(ph) * Math.exp(-t * 8)), 0, g); };
  const clap = (t0, g) => { const f = svf(); place(drums, 0.25, t0, (t) => f(noise(), 1700, 1.2).band * (0.5 * Math.exp(-t * 20) + [0, 0.011, 0.022].reduce((e, o) => e + (t >= o ? Math.exp(-(t - o) * 120) : 0), 0)) * 1.4, 0, g); };
  const hat = (t0, pan, g) => { const f = svf(); place(drums, 0.07, t0, (t) => f(noise(), 7500).high * Math.exp(-t * 70) * 0.5, pan, g); };
  const bass = (fq, t0, d, g) => place(music, d, t0, (t) => (Math.sin(TAU * fq * t) + 0.45 * Math.sin(TAU * 2 * fq * t) * Math.exp(-t * 10)) * Math.min(1, t / 0.004) * Math.exp(-t * 4), 0, g);
  const pluck = (fq, t0, pan, g) => place(music, 0.45, t0, (t) => { let v = 0; for (let h = 1; h <= 6; h++) v += (Math.sin(TAU * fq * h * t) / h ** (1.4 + (1 - M.bright) * 1.5)) * Math.exp(-t * (9 + 4 * h)); return v; }, pan, g);
  const pad = (freqs, t0, d, det, pan, g) => place(music, d, t0, (t) => { let v = 0; for (const fq of freqs) for (let h = 1; h <= 5; h++) v += Math.sin(TAU * fq * det * h * t) / h ** 1.6; return (v / freqs.length) * Math.min(1, t / 0.6, (d - t) / 0.6); }, pan, g);
  const riser = (t0, d, g) => { const f = svf(); let ph = 0; place(drums, d, t0, (t, p) => ((ph += (TAU * (180 + 1300 * p * p)) / RATE), (f(noise(), 300 + 5800 * p ** 1.8, 0.5).band + Math.sin(ph) * 0.25) * p ** 2.2), 0, g); };

  const liftFrom = M.riser && last - bar > bar ? last - bar : null; // the bar before the last scene
  const end = length - 1.6; // closing chord from here
  const kicks = [];
  for (let b = 0, t = 0; t < end; b++, t = b * beat) {
    const inBar = b % 4, intro = t < bar, lift = liftFrom !== null && t >= liftFrom && t < last;
    if (!intro && !lift && (M.kick === "four" || (M.kick === "half" && inBar % 2 === 0 && b % 8 !== 6) || (M.kick === "pulse" && inBar % 2 === 0))) { kick(t, M.kick === "pulse" ? 0.7 : 0.95); kicks.push(t); }
    if (!intro && !lift && M.clap && inBar % 2 === 1) clap(t, 0.75);
    if (M.hats) for (let k = 0; k < M.hats / 4; k++) hat(t + (k * beat * 4) / M.hats, k % 2 ? 0.3 : -0.3, (intro ? 0.35 : 0.55) * (k % 2 ? 0.6 : 1));
  }
  if (liftFrom !== null) {
    riser(liftFrom, last - liftFrom, 0.55);
    for (let x = liftFrom + bar / 2, gap = beat / 2; x < last; x += gap, gap = Math.max(beat / 8, gap * 0.8)) clap(x, 0.3 + (0.5 * (x - liftFrom)) / bar);
  }
  for (let b = 0; b * bar < end; b++) {
    const t0 = b * bar, ch = chord(M.chords[b % M.chords.length]), full = t0 >= bar;
    if (full) for (let k = 0; k < 8 && t0 + (k * beat) / 2 < end; k++) bass(ch[0] / 2, t0 + (k * beat) / 2, beat / 2, 0.8);
    const notes = [ch[0] * 2, ch[1] * 2, ch[2] * 2, ch[1] * 4, ch[2] * 2, ch[1] * 2, ch[0] * 4, ch[2] * 4];
    if (full) for (let k = 0; k < M.arp && t0 + (k * bar) / M.arp < end; k++) pluck(notes[k % 8], t0 + (k * bar) / M.arp, ((k % 4) - 1.5) * 0.3, 0.3);
    const d = Math.min(bar, end - t0), pf = ch.map((x) => x * 2);
    pad(pf, t0, d, 1.003, -0.5, full ? 0.3 : 0.45);
    pad(pf, t0, d, 0.997, 0.5, full ? 0.3 : 0.45);
  }
  const fc = chord(M.chords[0]).map((x) => x * 2);
  pad([...fc, fc[0] * 2], end, length - end, 1.003, -0.5, 0.5);
  pad([...fc, fc[0] * 2], end, length - end, 0.997, 0.5, 0.5);
  // Sidechain: the tonal parts dip after every kick, so the groove breathes.
  const duck = new Float64Array(n).fill(1);
  for (const k of kicks) for (let i = Math.round(k * RATE), j = 0; j < 0.4 * RATE && i + j < n; j++) duck[i + j] = Math.min(duck[i + j], 1 - 0.55 * Math.exp((-j / RATE) * 9));
  const out = [0, 1].map((c) => Float64Array.from({ length: n }, (_, i) => Math.tanh((music[c][i] * duck[i] * 0.55 + drums[c][i] * 0.8) * 0.9)));
  // To about -14 LUFS, never above -1.5 dBFS.
  const { integrated } = measure({ rate: RATE, chans: out });
  const peak = Math.max(...out.map((c) => c.reduce((m, v) => Math.max(m, Math.abs(v)), 0)));
  const gain = Math.min(10 ** ((-14 - integrated) / 20), 10 ** (-1.5 / 20) / peak);
  const fadeOut = Math.round(0.8 * RATE);
  for (const c of out) for (let i = 0; i < n; i++) c[i] *= gain * Math.min(1, (n - i) / fadeOut);
  return out;
};

const writeWav = (file, chans) => {
  const n = chans[0].length, buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, chans[c][i])) * 32767), 44 + (i * 2 + c) * 2);
  fs.writeFileSync(file, buf);
};

const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : undefined; };

const main = (id) => {
  const mood = arg("mood") ?? "energetic";
  if (!MOODS[mood]) throw new Error(`mood "${mood}": pick ${Object.keys(MOODS).join(", ")}`);
  const words = JSON.parse(fs.readFileSync(path.join("src", "proto", id, "words.json"), "utf8"));
  const { offsets, length } = sceneOffsets(words);
  const last = Object.values(offsets).pop();
  const chans = compose({ length, last, mood, bpm: Number(arg("bpm")) || undefined, seed: Number(arg("seed")) || 7 });
  const file = path.join("public", "music", `${id}-synth.wav`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  writeWav(file, chans);
  const m = measure({ rate: RATE, chans });
  console.log(`wrote ${file}: ${mood}, ${Number(arg("bpm")) || MOODS[mood].bpm} BPM, ${length.toFixed(2)} s, ${m.integrated.toFixed(1)} LUFS, true peak ${m.truePeak.toFixed(1)} dBTP`);
  console.log(`play it with <Music words={WORDS} src="music/${id}-synth.wav" /> (or protoReel's music argument)`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--self-test") {
    const a = compose({ length: 10, last: 6, mood: "energetic" }), b = compose({ length: 10, last: 6, mood: "energetic" });
    const m = measure({ rate: RATE, chans: a });
    const ok = [
      JSON.stringify(chord("Am").map(Math.round)) === "[110,131,165]",
      a[0].length === 480000 && a[0].every((v, i) => v === b[0][i]), // deterministic
      m.integrated > -15.5 && m.integrated < -13.5 && m.samplePeak <= -1.49,
      Object.keys(MOODS).every((mood) => compose({ length: 6, last: 4, mood })[0].some((v) => Math.abs(v) > 0.05)),
    ];
    if (ok.includes(false)) throw new Error(`self-test failed: ${JSON.stringify({ ok, m })}`);
    console.log("self-test ok");
  } else if (!process.argv[2]) {
    console.error("Usage: node scripts/make-music.mjs <video id> [--mood energetic|cheerful|chill|dramatic] [--bpm N] [--seed N]");
    process.exit(1);
  } else main(process.argv[2]);
}
