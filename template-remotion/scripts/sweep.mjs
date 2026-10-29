// Usage: node scripts/sweep.mjs <video id>   (npm run sweep -- <video id>)
// Renders the <id>-sweep composition (src/proto/kit.tsx protoReel): 6 frames of every scene at
// quarter scale on one image, safe area drawn in red. One bundle, one still, instead of a still per beat.
import { spawnSync } from "child_process";

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/sweep.mjs <video id>");
  process.exit(1);
}
const out = `out/stills/${id}-sweep.png`;
const r = spawnSync("npx", ["remotion", "still", `${id}-sweep`, out, "--log=error"], { shell: true, stdio: "inherit" });
if (r.status === 0) console.log(`wrote ${out}`);
process.exit(r.status ?? 1);
