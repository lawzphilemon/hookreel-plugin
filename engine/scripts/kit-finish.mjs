// Usage: hookreel kit-finish <kit.mp4> <brand studio> <out.mp4> --end-card-at <s>
//        hookreel kit-finish --self-test
// Brand finish for a video-3d-kit MP4 (looks `3d dialog` / `3d toons`), which has neither a watermark nor
// a loudness target. One ffmpeg encode: the studio's brand.json "watermark" drawn with the same values as
// `npm run assemble` (tile or corner, fades in at inAt, steps aside at the end card), and the audio brought
// to -16.5 LUFS integrated (true peak -1.5 dB) with linear loudnorm, measured first in an audio-only pass.
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { WATERMARK } from "./assemble.mjs";

const W = 1080, H = 1920;
export const TARGET = { I: -16.5, TP: -1.5, LRA: 11 };

const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", "-y", ...args], { encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`ffmpeg failed:\n${(r.stderr || "").split("\n").slice(-15).join("\n")}`);
  return r.stderr;
};

// Integrated loudness, true peak, LRA and threshold of a file's audio (loudnorm's JSON summary).
export const measureLoudness = (file, filter = `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}:print_format=json`) => {
  const err = ff(["-i", file, "-vn", "-af", filter, "-f", "null", "-"]);
  return JSON.parse(err.slice(err.lastIndexOf("{"), err.lastIndexOf("}") + 1));
};

// Logo positions on the 1080x1920 frame, the same grid as assemble.mjs watermarkHtml.
export const tiles = (w) => {
  if (w.mode === "corner") return [{ right: 80, y: 132 }];
  const rows = Math.ceil(H / w.stepY) + 1, cols = Math.ceil(W / w.stepX) + 1, out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ x: c * w.stepX + (r % 2 ? w.offset : 0) - w.margin, y: r * w.stepY + w.margin });
  return out;
};

export const filterGraph = (wm, { duration, endCardAt, loud }) => {
  const w = { ...WATERMARK, ...wm };
  const pos = tiles(w), peak = w.mode === "corner" ? 0.55 : w.opacity;
  const g = [`[1:v]scale=-1:${w.height},format=rgba,split=${pos.length}${pos.map((_, i) => `[l${i}]`).join("")}`, `color=c=black@0:s=${W}x${H}:d=${duration},format=rgba[c0]`];
  pos.forEach((p, i) => g.push(`[c${i}][l${i}]overlay=x=${p.right != null ? `W-w-${p.right}` : p.x}:y=${p.y}[c${i + 1}]`));
  // ponytail: opacity via alpha multiply on the finished canvas, one fade in and one fade out like the HyperFrames timeline
  g.push(`[c${pos.length}]colorchannelmixer=aa=${peak},fade=t=in:st=${w.inAt}:d=0.5:alpha=1,fade=t=out:st=${endCardAt}:d=0.3:alpha=1[wm]`);
  g.push(`[0:v]scale=${W}:${H},setsar=1[v0]`, `[v0][wm]overlay=0:0:shortest=1,format=yuv420p[v]`);
  g.push(`[0:a]loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}:measured_I=${loud.input_i}:measured_TP=${loud.input_tp}:measured_LRA=${loud.input_lra}:measured_thresh=${loud.input_thresh}:offset=${loud.target_offset}:linear=true,aresample=48000[a]`);
  return g.join(";");
};

const duration = (file) => Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout.trim());

export const finish = (input, studio, out, endCardAt) => {
  const brand = JSON.parse(fs.readFileSync(path.join(studio, "brand.json"), "utf8"));
  if (!brand.watermark?.src) throw new Error(`no "watermark": { "src": ... } in ${path.join(studio, "brand.json")}`);
  const logo = path.join(studio, "public", brand.watermark.src);
  if (!fs.existsSync(logo)) throw new Error(`watermark not found: ${logo}`);
  const secs = duration(input);
  if (!(endCardAt > 0 && endCardAt < secs)) throw new Error(`--end-card-at ${endCardAt}: give the end card's start in seconds, below the video's ${secs.toFixed(2)} s`);
  const loud = measureLoudness(input);
  ff(["-i", input, "-loop", "1", "-i", logo, "-filter_complex", filterGraph(brand.watermark, { duration: secs, endCardAt, loud }), "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", String(secs), out]);
  const after = measureLoudness(out);
  console.log(`kit-finish ${out}: watermark ${brand.watermark.mode ?? WATERMARK.mode} (off at ${endCardAt} s), ${Number(loud.input_i).toFixed(1)} → ${Number(after.input_i).toFixed(1)} LUFS, true peak ${Number(after.input_tp).toFixed(1)} dB`);
  return after;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] === "--self-test") {
    // A 4 s test clip with a quiet tone (about -30 LUFS) and a tiny studio: the result must be watermarked,
    // as long as the input, and within 1 LU of the target.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kit-finish-"));
    fs.mkdirSync(path.join(dir, "studio", "public", "brand"), { recursive: true });
    fs.writeFileSync(path.join(dir, "studio", "brand.json"), JSON.stringify({ watermark: { src: "brand/logo.png", mode: "tile" } }));
    ff(["-f", "lavfi", "-i", "color=c=white:s=120x60", "-frames:v", "1", path.join(dir, "studio", "public", "brand", "logo.png")]);
    const src = path.join(dir, "in.mp4"), out = path.join(dir, "out.mp4");
    ff(["-f", "lavfi", "-i", "color=c=black:s=720x1280:r=30:d=4", "-f", "lavfi", "-i", "sine=f=440:d=4,volume=-30dB", "-c:v", "libx264", "-c:a", "aac", "-shortest", src]);
    const after = finish(src, path.join(dir, "studio"), out, 3);
    if (Math.abs(Number(after.input_i) - TARGET.I) > 1) throw new Error(`self-test loudness ${after.input_i}`);
    if (Math.abs(duration(out) - 4) > 0.2) throw new Error(`self-test duration ${duration(out)}`);
    const ymax = (t) => Number(/YMAX=([\d.]+)/.exec(ff(["-ss", String(t), "-i", out, "-frames:v", "1", "-vf", "signalstats,metadata=print", "-f", "null", "-"]))?.[1]);
    if (!(ymax(2.5) > ymax(0.5) + 20)) throw new Error("self-test watermark not visible at 2.5 s");
    if (!(ymax(3.8) < ymax(2.5) - 20)) throw new Error("self-test watermark still on the end card");
    if (tiles({ ...WATERMARK, mode: "tile" }).length !== 40) throw new Error("self-test tile grid");
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("kit-finish self-test OK");
  } else {
    const i = args.indexOf("--end-card-at"), at = i >= 0 ? Number(args[i + 1]) : NaN;
    const [input, studio, out] = args.filter((_, k) => i < 0 || (k !== i && k !== i + 1));
    if (!input || !studio || !out || !(at > 0)) {
      console.error("Usage: hookreel kit-finish <kit.mp4> <brand studio> <out.mp4> --end-card-at <s>");
      process.exit(1);
    }
    try { finish(input, studio, out, at); } catch (e) { console.error(`error: ${e.message}`); process.exit(1); }
  }
}
