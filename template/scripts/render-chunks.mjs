// Usage: node scripts/render-chunks.mjs <video id> [--dry] [--audio-only] [--force] [--check] [--crf=<n>]   (npm run chunks -- <video id>)
//
// The full MP4 of a custom-motion video (<id>-motion), rendered scene by scene and cached, so a fix costs
// the scenes it touched, not a whole render (about 25 min for 90 s). Every frame is a pure function of
// time (frame = f(t)), so a scene rendered on its own is the same picture as that scene inside a full
// render, and the pieces join without a seam.
//   1. scans src/proto/<id>/ for anything that breaks that (Math.random, Date, timers, React state and
//      effects, CSS transitions) and stops on it,
//   2. bundles the studio once (out/bundle) and renders the audio as one WAV (cached by its own hash; also
//      copied to out/<id>-mix.wav for `npm run loudness`),
//   3. renders each scene's frame range to out/chunks/<id>/<scene>-<hash>.mp4 without audio, skipping a
//      scene whose hash has not changed, and joins the scenes and the audio into out/<id>.mp4 without
//      re-encoding the video.
// A scene's hash covers its own file (src/proto/<id>/scenes/<scene>.tsx), its words, its frame range, the
// shared code (kit, motion, brand, the video's other files except moves/style/words), the non-audio files
// in public/, the lock file and the render flags. With all scenes in one file, any change re-renders every
// scene: split them into scenes/<scene>.tsx (/hookreel:build Step 5) to get the speed.
// --dry prints every scene's hash and whether it would be rendered or reused, and renders nothing.
// --audio-only stops after the WAV (check the loudness before any picture is rendered). --force renders
// every scene again. --check renders three frames twice and fails if any two differ. Other flags (--crf=12)
// go to every chunk render and into the hash.
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { FPS, TIME } from "../src/motion.ts";

const run = (args, opts = {}) => {
  const r = spawnSync("npx", args, { shell: true, stdio: "inherit", ...opts });
  if (r.status !== 0) throw new Error(`failed: npx ${args.join(" ")}`);
  return r;
};
const sha = (x) => crypto.createHash("sha1").update(x).digest("hex");
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).map((f) => path.join(dir, f)).filter((f) => fs.statSync(f).isFile()).sort() : []);
const AUDIO = /\.(wav|mp3|m4a|aac|ogg|flac)$/i;

// Things that make a frame depend on more than its time. CSS transitions are matched by a duration
// ("opacity 0.3s"), so a `transition: "flood"` field in data is not flagged.
const NONDETERMINISTIC = [
  [/Math\.random\(/, "Math.random (use a seeded noise of t)"],
  [/Date\.now\(|new Date\(|performance\.now\(/, "wall-clock time"],
  [/setTimeout|setInterval|requestAnimationFrame/, "timers"],
  [/\buse(State|Effect|LayoutEffect|Reducer)\b/, "React state or effects"],
  [/transition\s*:\s*["'`][^"'`]*\d(\.\d+)?m?s\b/, "a CSS transition"],
];
export const scanDeterminism = (files) =>
  files.flatMap((f) =>
    fs.readFileSync(f, "utf8").split(/\r?\n/).flatMap((line, i) => NONDETERMINISTIC.filter(([re]) => re.test(line)).map(([, why]) => `${f}:${i + 1}: ${why}`)),
  );

// Frame ranges per scene, in the order of words.json (the order of videos/<id>.json).
export const sceneRanges = (words) => {
  let from = 0;
  return Object.entries(words.scenes).map(([id, s]) => {
    const n = Math.round((s.secs + TIME.leadIn + TIME.tail) * FPS);
    const r = { id, from, to: from + n - 1 };
    from += n;
    return r;
  });
};

const main = (id, argv) => {
  const dir = path.join("src", "proto", id);
  const words = JSON.parse(fs.readFileSync(path.join(dir, "words.json"), "utf8"));
  const code = walk(dir).filter((f) => /\.(tsx?|jsx?)$/.test(f));
  const bad = scanDeterminism(code);
  if (bad.length) {
    bad.forEach((b) => console.error(`error: ${b}`));
    console.error("Every frame must be a pure function of time; fix these before a chunked render.");
    process.exit(1);
  }

  const audioOnly = argv.includes("--audio-only");
  const flags = argv.filter((a) => a.startsWith("--") && !["--force", "--check", "--audio-only", "--dry"].includes(a));
  // Content, not mtime: a copied studio, a checkout or a sync touches mtimes without changing a pixel.
  const stat = (f) => `${f}:${sha(fs.readFileSync(f))}`;
  const own = (scene) => path.join(dir, "scenes", `${scene}.tsx`);
  const shared = [
    ...walk("src").filter((f) => !f.startsWith(path.join("src", "proto") + path.sep) && f !== path.join("src", "Root.tsx")),
    ...walk(path.join("src", "proto")).filter((f) => path.dirname(f) === path.join("src", "proto")),
    ...walk(dir).filter((f) => !f.startsWith(path.join(dir, "scenes") + path.sep) && !/(moves|style|words)\.json$/.test(f)),
  ];
  const lock = fs.existsSync("package-lock.json") ? fs.readFileSync("package-lock.json") : "";
  const sharedHash = sha([...shared.map((f) => fs.readFileSync(f)), ...walk("public").filter((f) => !AUDIO.test(f)).map(stat), lock, flags.join(" ")].join("\n"));
  const ranges = sceneRanges(words).map((r) => {
    const file = fs.existsSync(own(r.id)) ? fs.readFileSync(own(r.id)) : "";
    return { ...r, hash: sha([sharedHash, file, JSON.stringify(words.scenes[r.id]), r.from, r.to].join("\n")).slice(0, 12) };
  });
  const audioHash = sha([sharedHash, ...code.map((f) => fs.readFileSync(f)), JSON.stringify(words), ...walk("public").filter((f) => AUDIO.test(f)).map(stat)].join("\n")).slice(0, 12);

  const out = path.join("out", "chunks", id);
  fs.mkdirSync(out, { recursive: true });
  const chunk = (r) => path.join(out, `${r.id}-${r.hash}.mp4`);
  const mix = path.join(out, `mix-${audioHash}.wav`);
  const todo = audioOnly ? [] : ranges.filter((r) => argv.includes("--force") || !fs.existsSync(chunk(r)));
  if (argv.includes("--dry")) {
    for (const r of ranges) console.log(`${r.id}  ${r.hash}  ${todo.includes(r) ? "render" : "reuse"}`);
    console.log(`audio  ${audioHash}  ${fs.existsSync(mix) ? "reuse" : "render"}`);
    return;
  }
  const needAudio = !fs.existsSync(mix);
  const bundle = path.join("out", "bundle");
  const started = Date.now();

  if (todo.length || needAudio || argv.includes("--check")) {
    console.log("bundling once for every chunk …");
    run(["remotion", "bundle", "--out-dir", bundle, "--log=error"]);
  }
  const comp = `${id}-motion`;
  if (argv.includes("--check")) {
    const total = ranges[ranges.length - 1].to;
    for (const f of [Math.round(total * 0.2), Math.round(total * 0.5), Math.round(total * 0.8)]) {
      const pics = [0, 1].map((k) => {
        const file = path.join(out, `check-${f}-${k}.png`);
        run(["remotion", "still", bundle, comp, file, `--frame=${f}`, "--log=error"]);
        return sha(fs.readFileSync(file));
      });
      if (pics[0] !== pics[1]) throw new Error(`frame ${f} renders differently twice: something depends on more than time`);
      console.log(`frame ${f}: identical twice`);
    }
  }
  // Audio first: a loudness fix found now costs a minute, not a video render.
  if (needAudio) {
    for (const old of fs.readdirSync(out).filter((f) => f.startsWith("mix-"))) fs.rmSync(path.join(out, old));
    console.log("audio: one WAV for the whole video");
    run(["remotion", "render", bundle, comp, mix, "--codec=wav", "--log=error"]);
  }
  fs.copyFileSync(mix, path.join("out", `${id}-mix.wav`));
  if (audioOnly) {
    console.log(`wrote out/${id}-mix.wav${needAudio ? "" : " (cached)"}: npm run loudness -- out/${id}-mix.wav`);
    return;
  }
  for (const r of todo) {
    for (const old of fs.readdirSync(out).filter((f) => f.startsWith(`${r.id}-`) && f.endsWith(".mp4"))) fs.rmSync(path.join(out, old));
    console.log(`${r.id}: frames ${r.from}–${r.to} (${((r.to - r.from + 1) / FPS).toFixed(1)} s)`);
    run(["remotion", "render", bundle, comp, chunk(r), `--frames=${r.from}-${r.to}`, "--muted", "--log=error", ...flags]);
  }

  const list = path.join(out, "list.txt");
  fs.writeFileSync(list, ranges.map((r) => `file '${path.resolve(chunk(r)).replace(/\\/g, "/")}'`).join("\n") + "\n");
  const file = path.join("out", `${id}.mp4`);
  run(["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", `"${list}"`, "-i", `"${mix}"`, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", `"${file}"`]);

  const probe = spawnSync("npx", ["remotion", "ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", `"${file}"`], { shell: true, encoding: "utf8" });
  const frames = Number((probe.stdout.match(/\d+/g) ?? []).pop()); // csv prints "2534," on some builds
  const want = ranges[ranges.length - 1].to + 1;
  if (frames !== want) throw new Error(`${file} has ${frames} frames, the scenes add up to ${want}`);
  const secs = ((Date.now() - started) / 1000).toFixed(0);
  console.log(`wrote ${file}: ${frames} frames, ${ranges.length - todo.length} scene(s) reused, ${todo.length} rendered${needAudio ? ", audio rendered" : ", audio reused"}, ${secs} s`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  if (argv[0] === "--self-test") {
    const r = sceneRanges({ scenes: { "01-hook": { secs: 2 }, "02-why": { secs: 3 } } });
    const n1 = Math.round((2 + TIME.leadIn + TIME.tail) * FPS);
    if (r[0].from !== 0 || r[0].to !== n1 - 1 || r[1].from !== n1) throw new Error(`self-test ranges: ${JSON.stringify(r)}`);
    const tmp = path.join("out", "determinism-self-test.tsx");
    fs.mkdirSync("out", { recursive: true });
    fs.writeFileSync(tmp, 'const a = Math.random();\nconst t = { transition: "flood" };\nconst s = { transition: "opacity 0.3s" };\n');
    const hits = scanDeterminism([tmp]);
    fs.rmSync(tmp);
    if (hits.length !== 2 || !hits[0].includes(":1:") || !hits[1].includes(":3:")) throw new Error(`self-test scan: ${JSON.stringify(hits)}`);
    console.log("self-test ok");
  } else if (!argv[0] || argv[0].startsWith("--")) {
    console.error("Usage: node scripts/render-chunks.mjs <video id> [--force] [--check] [--crf=<n>]");
    process.exit(1);
  } else main(argv[0], argv);
}
