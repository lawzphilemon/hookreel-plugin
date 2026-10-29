// Usage: node scripts/word-times.mjs <video id> [--estimate]   (npm run words -- <video id>, after npm run vo)
// --estimate: no recording yet; every word at 2.1 words per second, so a prototype scene can be built
// before recording. Rerun without it after npm run vo and the scenes follow the real voice.
// Writes reels/<video id>/words.json: every script word with the second it is spoken in its clip,
// for the custom motion scenes (kit/kit.js wordsOf). Aligns characters, not words: Whisper
// splits words ("K", "laim") and writes numbers its own way ("900 juta" for "Rp900 juta"), which
// makes whole-word matching slip by up to a second. Each script word gets the start of the heard
// fragment holding its first matched character; words with no match are interpolated.
// Plain Node, no dependencies (no Python or numpy needed).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const norm = (x) => x.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

// Longest common subsequence of two strings: map from index in a to index in b. On ties it skips
// characters of b first, so a word lands on its own fragment rather than a stray letter of an extra
// heard word before it ("rupiah hilang" for "Rp120 juta hilang").
export const lcsMap = (a, b) => {
  const n = a.length, m = b.length, w = m + 1;
  const L = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      L[i * w + j] = a[i] === b[j] ? L[(i + 1) * w + j + 1] + 1 : Math.max(L[(i + 1) * w + j], L[i * w + j + 1]);
  const map = new Map();
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (L[i * w + j + 1] === L[i * w + j]) j++;
    else if (a[i] === b[j]) map.set(i++, j++);
    else i++;
  }
  return map;
};

// script: the scene's vo line; frags: [{ text, start, end }] from <scene>.words.json; secs: clip length.
export const wordTimes = (script, frags, secs) => {
  let heard = "";
  const owner = [];
  frags.forEach((f, i) => {
    const n = norm(f.text);
    heard += n;
    owner.push(...Array(n.length).fill(i));
  });
  const words = script.split(/\s+/).filter(Boolean);
  let said = "";
  const first = words.map((w) => {
    const at = said.length;
    said += norm(w);
    return at;
  });
  const map = lcsMap(said, heard);
  const times = words.map((w, i) => {
    for (let c = first[i]; c < first[i] + norm(w).length; c++) if (map.has(c)) return frags[owner[map.get(c)]].start;
    return null;
  });
  times.forEach((x, i) => {
    if (x !== null) return;
    const prev = times.slice(0, i).reverse().find((y) => y !== null) ?? 0;
    const next = times.slice(i + 1).find((y) => y !== null) ?? secs;
    times[i] = (prev + next) / 2;
  });
  return words.map((w, i) => [w, Math.round(times[i] * 100) / 100]);
};

// Length of a PCM WAV in seconds, from its header.
const wavSeconds = (file) => {
  const b = fs.readFileSync(file);
  let byteRate = 0;
  for (let p = 12; p + 8 <= b.length; p += 8 + b.readUInt32LE(p + 4) + (b.readUInt32LE(p + 4) % 2)) {
    const id = b.toString("ascii", p, p + 4);
    if (id === "fmt ") byteRate = b.readUInt32LE(p + 16);
    if (id === "data") return Math.min(b.readUInt32LE(p + 4), b.length - p - 8) / byteRate;
  }
  throw new Error(`${file}: no data chunk`);
};

const main = (id, estimate) => {
  const video = JSON.parse(fs.readFileSync(`videos/${id}.json`, "utf8"));
  const out = { video: id, scenes: {} };
  for (const s of video.scenes) {
    if (estimate) {
      const words = s.vo.split(/\s+/).filter(Boolean);
      out.scenes[s.id] = { secs: Math.round((words.length / 2.1) * 100) / 100, words: words.map((w, i) => [w, Math.round((i / 2.1) * 100) / 100]) };
      continue;
    }
    const base = `public/vo/${id}/${s.id}`;
    if (!fs.existsSync(`${base}.words.json`)) throw new Error(`${s.id}: not recorded (run npm run vo first)`);
    const secs = Math.round(wavSeconds(`${base}.wav`) * 100) / 100;
    const words = wordTimes(s.vo, JSON.parse(fs.readFileSync(`${base}.words.json`, "utf8")), secs);
    out.scenes[s.id] = { secs, words };
    console.log(s.id, `${secs}s`, words.map(([w, t]) => `${w}@${t}`).join(" "));
  }
  const file = `reels/${id}/words.json`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(out));
  console.log(`wrote ${file}${estimate ? " (estimated: rerun without --estimate after npm run vo)" : ""}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--self-test") {
    // Whisper split "Klaim" and wrote the number its own way; every word must still land on its fragment.
    const frags = [["K", 0.1], ["laim", 0.3], ["900", 1.0], ["juta", 1.7], ["rupiah", 2.0], ["dibayar", 2.5]].map(([text, start]) => ({ text, start, end: start + 0.2 }));
    const got = wordTimes("Klaim Rp900 juta dibayar.", frags, 3);
    const want = [["Klaim", 0.1], ["Rp900", 1.0], ["juta", 1.7], ["dibayar.", 2.5]];
    if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`self-test failed: ${JSON.stringify(got)}`);
    console.log("self-test ok");
  } else if (!process.argv[2]) {
    console.error("Usage: node scripts/word-times.mjs <video id>");
    process.exit(1);
  } else main(process.argv[2], process.argv.includes("--estimate"));
}
