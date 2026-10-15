// Usage: node scripts/preview.mjs <video id>   (npm run preview -- <video id>, after rendering out/<id>.mp4)
// out/<id>-preview.mp4: crf 27, small enough to send for review.
// out/<id>-ig-test.mp4: about what Instagram re-encodes to (3.5 Mbps, 30 fps), to check that grain,
// gradients and thin lines survive before posting. Post the original out/<id>.mp4, never these.
import { spawnSync } from "child_process";

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/preview.mjs <video id>");
  process.exit(1);
}
const ff = (args) => spawnSync("npx", ["remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", `out/${id}.mp4`, ...args], { shell: true, stdio: "inherit" }).status;
const a = ff(["-c:v", "libx264", "-crf", "27", "-preset", "slow", "-c:a", "copy", `out/${id}-preview.mp4`]);
const b = ff(["-c:v", "libx264", "-b:v", "3500k", "-maxrate", "3500k", "-bufsize", "7000k", "-r", "30", "-c:a", "aac", "-b:a", "128k", `out/${id}-ig-test.mp4`]);
if (a || b) process.exit(1);
console.log(`wrote out/${id}-preview.mp4 and out/${id}-ig-test.mp4`);
