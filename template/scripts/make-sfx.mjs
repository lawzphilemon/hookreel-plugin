// Usage: node scripts/make-sfx.mjs
// Synthesises the reels' sound effects into public/sfx/*.wav. No samples, no licences:
// short, quiet UI sounds that sit under the voiceover rather than compete with it.
import fs from "fs";
import path from "path";

const RATE = 48000;
const outDir = path.join("public", "sfx");
fs.mkdirSync(outDir, { recursive: true });

// Deterministic noise so the files are identical on every run.
let seed = 12345;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 2 ** 32) * 2 - 1;
};

const render = (seconds, fn) => {
  const n = Math.round(seconds * RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / RATE, i / n);
  return out;
};

// Peak-normalise to -6 dBFS and write 16-bit mono PCM.
const write = (name, samples) => {
  const peak = samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0) || 1;
  const gain = 0.5 / peak;
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
  samples.forEach((s, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s * gain)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(outDir, `${name}.wav`), buf);
  console.log(`${name}.wav  ${(samples.length / RATE).toFixed(2)}s`);
};

// State-variable band-pass, for shaping noise.
const bandpass = () => {
  let low = 0;
  let band = 0;
  return (x, freq, q) => {
    const f = 2 * Math.sin((Math.PI * freq) / RATE);
    const high = x - low - q * band;
    band += f * high;
    low += f * band;
    return band;
  };
};

const TAU = Math.PI * 2;

// Feedback echo for a short room tail, so hits and whooshes don't stop dead.
const withTail = (samples, delay = 0.06, feedback = 0.42, seconds = 0.5) => {
  const d = Math.round(delay * RATE);
  const out = new Float32Array(samples.length + Math.round(seconds * RATE));
  out.set(samples);
  for (let i = d; i < out.length; i++) out[i] += out[i - d] * feedback;
  return out;
};

// Whoosh: noise swept up then down through a band-pass, with a short tail. Scene changes.
{
  const bp = bandpass();
  write("whoosh", withTail(render(0.75, (t, p) => {
    const freq = 300 + 3200 * Math.sin(Math.PI * Math.min(1, p * 1.1)) ** 1.5;
    const env = Math.sin(Math.PI * p) ** 2.2;
    return bp(noise(), freq, 0.55) * env;
  }), 0.05, 0.35, 0.3));
}

// Impact: low cinematic hit (pitch-dropping sub, rumble, soft transient). Big numbers and reveals.
{
  const rumble = bandpass();
  const snap = bandpass();
  let phase = 0;
  write("impact", withTail(render(1.4, (t) => {
    phase += (TAU * (42 + 90 * Math.exp(-t * 16))) / RATE;
    const sub = Math.sin(phase) * Math.exp(-t * 3) * Math.min(1, t / 0.004);
    const low = rumble(noise(), 110, 0.8) * Math.exp(-t * 5) * 1.4;
    const hit = snap(noise(), 1400, 0.6) * Math.exp(-t * 90) * 0.7;
    return sub + low + hit;
  }), 0.08, 0.3, 0.6));
}

// Riser: filtered noise and a sine sweeping up over 1.2s, builds into a reveal.
{
  const bp = bandpass();
  let phase = 0;
  write("riser", render(1.2, (t, p) => {
    phase += (TAU * (180 + 1100 * p ** 2)) / RATE;
    const env = p ** 2.4 * (p > 0.97 ? (1 - p) / 0.03 : 1);
    return (bp(noise(), 400 + 5200 * p ** 1.8, 0.5) * 0.9 + Math.sin(phase) * 0.25) * env;
  }));
}

// Click: crisp UI tap. Highlights.
{
  const bp = bandpass();
  write("click", render(0.05, (t) => {
    const env = Math.exp(-t * 160);
    return (bp(noise(), 3200, 0.5) * 0.6 + Math.sin(TAU * 1900 * t) * 0.5) * env;
  }));
}

// Tick: soft wooden tick. List items appearing.
write("tick", render(0.08, (t) => {
  const env = Math.exp(-t * 70);
  return (Math.sin(TAU * 1250 * t) + 0.35 * Math.sin(TAU * 2600 * t)) * env;
}));

// Pop: rounded drop in pitch. Cards and notes appearing.
write("pop", render(0.14, (t) => {
  const freq = 620 - 330 * Math.min(1, t / 0.08);
  const env = Math.min(1, t / 0.004) * Math.exp(-t * 32);
  return Math.sin(TAU * freq * t) * env;
}));

// Switch: two quick mechanical clicks. Toggles and checkboxes.
{
  const bp = bandpass();
  write("switch", render(0.09, (t) => {
    const a = t < 0.03 ? Math.exp(-t * 220) : 0;
    const b = t >= 0.045 ? Math.exp(-(t - 0.045) * 260) * 0.8 : 0;
    return bp(noise(), 2400, 0.4) * (a + b) + Math.sin(TAU * 1500 * t) * (a + b) * 0.4;
  }));
}

// Ding: small bell, inharmonic partials with long decay. The call to action.
write("ding", withTail(render(1.4, (t) => {
  const attack = Math.min(1, t / 0.003);
  return attack * (
    Math.sin(TAU * 1318.5 * t) * Math.exp(-t * 3.2) +
    0.45 * Math.sin(TAU * 1318.5 * 2.76 * t) * Math.exp(-t * 6) +
    0.2 * Math.sin(TAU * 1318.5 * 5.4 * t) * Math.exp(-t * 11) +
    0.12 * Math.sin(TAU * 1318.5 * 8.1 * t) * Math.exp(-t * 16)
  );
}), 0.09, 0.3, 0.6));

// Typing: light key taps at an uneven ~13 per second. Text typing itself in.
{
  const bp = bandpass();
  const taps = [];
  for (let t = 0.01; t < 2.4; t += 0.06 + ((noise() + 1) / 2) * 0.03) taps.push({ t, level: 0.6 + 0.4 * Math.abs(noise()) });
  write("typing", render(2.4, (t) => {
    let s = 0;
    for (const k of taps) {
      const d = t - k.t;
      if (d >= 0 && d < 0.03) s += k.level * Math.exp(-d * 260);
    }
    return bp(noise(), 2800, 0.55) * s;
  }));
}
