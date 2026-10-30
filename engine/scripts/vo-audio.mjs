// Audio helpers shared by prepare-vo.mjs (a recorded take) and tts-vo.mjs (an ElevenLabs take): stereo
// 16-bit WAV editing in place, high-pass, loudness, level and fades. Remotion's bundled ffmpeg has no
// highpass, limiter or fade filter, so these run in plain Node.
import fs from "fs";
import { execSync, spawnSync } from "child_process";

export const ffmpeg = (args) => execSync(`ffmpeg -y -loglevel error ${args}`, { stdio: "inherit" });

export const duration = (file) =>
  Number(
    spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], {
      shell: true,
      encoding: "utf8",
    }).stdout.trim().split(/\s+/).pop(),
  );

// A 16-bit PCM WAV, edited in place: Remotion's bundled ffmpeg has no highpass, limiter or fade filter.
export const pcm = (file) => {
  const buf = fs.readFileSync(file);
  let at = 12, channels = 1, rate = 48000, bits = 16, data = null;
  while (at < buf.length - 8) {
    const id = buf.toString("ascii", at, at + 4);
    const size = buf.readUInt32LE(at + 4);
    if (id === "fmt ") { channels = buf.readUInt16LE(at + 10); rate = buf.readUInt32LE(at + 12); bits = buf.readUInt16LE(at + 22); }
    if (id === "data") { data = { start: at + 8, size: Math.min(size, buf.length - at - 8) }; break; }
    at += 8 + size + (size % 2);
  }
  if (!data || bits !== 16) throw new Error(`${file}: expected 16-bit PCM, got ${bits}-bit`);
  const pos = (i, c) => data.start + (i * channels + c) * 2;
  return {
    channels, rate, n: Math.floor(data.size / 2 / channels),
    get: (i, c) => buf.readInt16LE(pos(i, c)),
    set: (i, c, v) => buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v))), pos(i, c)),
    save: () => fs.writeFileSync(file, buf),
  };
};

// 4th-order high-pass (two RBJ biquads, Q 0.707).
export const highpass = (file, hz = 90) => {
  const w0 = pcm(file);
  const w = (2 * Math.PI * hz) / w0.rate, alpha = Math.sin(w) / (2 * Math.SQRT1_2), cos = Math.cos(w), a0 = 1 + alpha;
  const b = [(1 + cos) / 2 / a0, -(1 + cos) / a0, (1 + cos) / 2 / a0], a = [(-2 * cos) / a0, (1 - alpha) / a0];
  for (let c = 0; c < w0.channels; c++) {
    const st = [[0, 0, 0, 0], [0, 0, 0, 0]]; // x1 x2 y1 y2 per stage
    for (let i = 0; i < w0.n; i++) {
      let x = w0.get(i, c);
      for (const s of st) {
        const y = b[0] * x + b[1] * s[0] + b[2] * s[1] - a[0] * s[2] - a[1] * s[3];
        s[1] = s[0]; s[0] = x; s[3] = s[2]; s[2] = y; x = y;
      }
      w0.set(i, c, x);
    }
  }
  w0.save();
};

// Integrated loudness (LUFS) of a file, from ffmpeg's loudnorm measurement.
export const loudness = (file) => {
  const res = spawnSync("ffmpeg", ["-hide_banner", "-i", `"${file}"`, "-af", "loudnorm=print_format=json", "-f", "null", "-"], {
    shell: true,
    encoding: "utf8",
  });
  return Number(/"input_i" : "(-?[\d.]+)"/.exec(res.stderr)[1]);
};

// One fixed gain to -16 LUFS for the whole take, with a look-ahead peak limiter at -3.5 dBFS (about
// -3 dBTP) on the loudest syllables. Single-pass loudnorm is dynamic instead: it lifts the
// room noise before the first word by 30 dB, heard as a burst when the first clip starts.
// The limiter takes back about 1 dB on a peaky take (an ElevenLabs take landed at -17.1), so the
// residual is measured and applied again, up to three passes, until the take is within 0.2 dB.
export const level = (file, lufs = -16, ceilingDb = -3.5) => {
  for (let pass = 0; pass < 3; pass++) {
    const off = lufs - loudness(file);
    if (pass && Math.abs(off) <= 0.2) break;
    limitTo(file, off, ceilingDb);
  }
};

const limitTo = (file, offDb, ceilingDb) => {
  const w0 = pcm(file);
  const gain = 10 ** (offDb / 20), ceiling = 32767 * 10 ** (ceilingDb / 20);
  const look = Math.round(w0.rate * 0.005), release = 1 - Math.exp(-1 / (w0.rate * 0.08));
  const g = new Float32Array(w0.n).fill(1);
  for (let i = 0; i < w0.n; i++) {
    let peak = 0;
    for (let c = 0; c < w0.channels; c++) peak = Math.max(peak, Math.abs(w0.get(i, c)) * gain);
    if (peak <= ceiling) continue;
    const need = ceiling / peak;
    // Ramp down over the 5 ms before the peak so the limiter never clicks.
    for (let j = Math.max(0, i - look); j <= i; j++) g[j] = Math.min(g[j], need + ((1 - need) * (i - j)) / look);
  }
  let env = 1;
  for (let i = 0; i < w0.n; i++) {
    env = Math.min(g[i], env + (1 - env) * release);
    for (let c = 0; c < w0.channels; c++) w0.set(i, c, w0.get(i, c) * gain * env);
  }
  w0.save();
};

// 30 ms fade at both ends of a clip, so no clip starts or stops with a step.
export const fade = (file, seconds = 0.03) => {
  const w0 = pcm(file);
  const len = Math.min(Math.round(w0.rate * seconds), Math.floor(w0.n / 2));
  for (let i = 0; i < len; i++)
    for (let c = 0; c < w0.channels; c++) {
      w0.set(i, c, (w0.get(i, c) * i) / len);
      w0.set(w0.n - 1 - i, c, (w0.get(w0.n - 1 - i, c) * i) / len);
    }
  w0.save();
};
