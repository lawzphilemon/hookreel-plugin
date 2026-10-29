// Usage: npm run lib-sfx -- "<hookreel-library>/<pack>/sfx"
// Copies the private library's sound effects (every .wav under that folder) into public/sfx/lib/
// (git-ignored with the rest of public/sfx), each peak-normalised to -6 dBFS like the synthesised
// set, so `<Sfx name="lib/…" volume={…} />` means the same as for any other sound. Unnormalised
// library effects peaked the mix near 0 dBTP even at volume 0.3. Never commit what this writes.
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error('Usage: npm run lib-sfx -- "<hookreel-library>/<pack>/sfx"');
  process.exit(1);
}
const outDir = path.join("public", "sfx", "lib");
fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(src, { recursive: true }).filter((f) => f.toLowerCase().endsWith(".wav"));
for (const f of files) {
  const out = path.join(outDir, path.basename(f));
  // 16-bit PCM at 48 kHz, channels kept, so the samples can be scaled in place.
  execSync(`npx remotion ffmpeg -y -loglevel error -i "${path.join(src, f)}" -ar 48000 -c:a pcm_s16le "${out}"`, { stdio: "inherit" });
  const buf = fs.readFileSync(out);
  let at = 12;
  while (at < buf.length - 8 && buf.toString("ascii", at, at + 4) !== "data") at += 8 + buf.readUInt32LE(at + 4);
  const start = at + 8, end = Math.min(buf.length, start + buf.readUInt32LE(at + 4));
  let peak = 1;
  for (let i = start; i + 1 < end; i += 2) peak = Math.max(peak, Math.abs(buf.readInt16LE(i)));
  const gain = (32767 * 0.5) / peak;
  for (let i = start; i + 1 < end; i += 2) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(buf.readInt16LE(i) * gain))), i);
  fs.writeFileSync(out, buf);
}
console.log(`${files.length} library sounds → ${outDir} (peaks at -6 dBFS)`);
