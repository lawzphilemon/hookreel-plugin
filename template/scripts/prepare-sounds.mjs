// Usage: npm run sounds
// Turns a brand's own sound files (listed in sounds.json) into public/sfx/brand/<name>.wav, which
// replace the synthesised sound of the same name. Each file is decoded, trimmed so it starts on
// the sound, faded out, and peak-normalised to -6 dBFS like the synthesised set. "note" is also
// pitched into note-0 … note-23 (semitones up from the file's own pitch) for rising scales.
//
// sounds.json: { "whoosh": { "src": "C:/…/whoosh.mp3", "licence": "Pixabay Content License, https://…", "maxSeconds": 0.8 }, … }
// maxSeconds (optional) keeps only the start of a long file, e.g. the first snip of a recording.
// Sounds without a clear commercial licence are listed as warnings: replace them before posting.
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const RATE = 48000;
const outDir = path.join("public", "sfx", "brand");
if (!fs.existsSync("sounds.json")) {
  console.log("No sounds.json: the synthesised sounds are used.");
  process.exit(0);
}
const sounds = JSON.parse(fs.readFileSync("sounds.json", "utf8"));
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const decode = (src) => {
  const tmp = path.join(os.tmpdir(), `hookreel-sound-${process.pid}.wav`);
  execSync(`ffmpeg -y -loglevel error -i "${src}" -ac 1 -ar ${RATE} -c:a pcm_s16le "${tmp}"`, { stdio: "inherit" });
  const buf = fs.readFileSync(tmp);
  fs.rmSync(tmp, { force: true });
  let at = 12;
  while (at < buf.length - 8) {
    const id = buf.toString("ascii", at, at + 4);
    const size = buf.readUInt32LE(at + 4);
    if (id === "data") {
      const out = new Float32Array(size / 2);
      for (let i = 0; i < out.length; i++) out[i] = buf.readInt16LE(at + 8 + i * 2) / 32768;
      return out;
    }
    at += 8 + size + (size % 2);
  }
  throw new Error(`no audio data in ${src}`);
};

// Start on the sound (5 ms before it passes 10% of the peak), end when it falls under -40 dB, fade 30 ms.
const tidy = (s) => {
  const peak = s.reduce((m, x) => Math.max(m, Math.abs(x)), 0) || 1;
  let a = s.findIndex((x) => Math.abs(x) > peak * 0.1);
  a = Math.max(0, a - Math.round(0.005 * RATE));
  let b = s.length - 1;
  while (b > a && Math.abs(s[b]) < peak * 0.01) b--;
  const out = s.slice(a, b + 1);
  const fade = Math.min(out.length, Math.round(0.03 * RATE));
  for (let i = 0; i < fade; i++) out[out.length - 1 - i] *= i / fade;
  const gain = 0.5 / peak;
  return out.map((x) => x * gain);
};

const write = (name, samples) => {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((x, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(outDir, `${name}.wav`), buf);
  console.log(`brand/${name}.wav  ${(samples.length / RATE).toFixed(2)}s`);
};

// Pitch up by resampling (speed and pitch change together, which suits a single note).
const pitch = (s, semitones) => {
  const r = 2 ** (semitones / 12);
  const out = new Float32Array(Math.floor(s.length / r));
  for (let i = 0; i < out.length; i++) {
    const x = i * r;
    const j = Math.floor(x);
    out[i] = s[j] + (s[Math.min(j + 1, s.length - 1)] - s[j]) * (x - j);
  }
  return out;
};

const warnings = [];
for (const [name, entry] of Object.entries(sounds)) {
  let samples = tidy(decode(entry.src));
  if (entry.maxSeconds) {
    samples = samples.slice(0, Math.round(entry.maxSeconds * RATE));
    const fade = Math.min(samples.length, Math.round(0.03 * RATE));
    for (let i = 0; i < fade; i++) samples[samples.length - 1 - i] *= i / fade;
  }
  if (name === "note") for (let st = 0; st < 24; st++) write(`note-${st}`, pitch(samples, st));
  else write(name, samples);
  if (!entry.licence || /myinstants|unverified|unknown/i.test(entry.licence)) warnings.push(`${name}: ${entry.licence || "no licence noted"}`);
}
for (const w of warnings) console.warn(`warning: replace before posting (no clear commercial licence): ${w}`);
