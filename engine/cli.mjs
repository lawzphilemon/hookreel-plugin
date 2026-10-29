#!/usr/bin/env node
// hookreel engine CLI. A brand studio depends on this package and runs every tool through it, from the
// studio folder (paths like reels/, public/, videos/, out/ are the studio's):
//   npx hookreel <command> [args]     or the studio's npm scripts (npm run render -- <id>)
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ENGINE = path.dirname(fileURLToPath(import.meta.url));
export const HYPERFRAMES = "hyperframes@0.8.188";

// command → [script in engine/scripts, args put before the user's]
const COMMANDS = {
  assemble: ["assemble"],
  render: ["render"],
  check: ["check-video"],
  sfx: ["make-sfx"],
  sounds: ["prepare-sounds"],
  vo: ["prepare-vo"],
  tts: ["tts-vo"],
  words: ["word-times"],
  trim: ["trim-pauses"],
  music: ["make-music"],
  loudness: ["loudness"],
  fresh: ["fresh-check"],
  retention: ["retention"],
  contrast: ["contrast"],
  pace: ["pace", "--self-test"],
  refcuts: ["ref-cuts"],
  "lib-sfx": ["lib-sfx"],
  sheets: ["sheets"],
  sweep: ["sheets", "--sweep"],
  preview: ["preview"],
  cover: ["covers"],
};

const [cmd, ...args] = process.argv.slice(2);
const version = () => JSON.parse(fs.readFileSync(path.join(ENGINE, "..", "package.json"), "utf8")).version;

if (cmd === "hf") {
  // the pinned HyperFrames CLI: npx hookreel hf check reels/<id>
  process.exit(spawnSync("npx", ["--yes", HYPERFRAMES, ...args], { shell: true, stdio: "inherit" }).status ?? 1);
} else if (cmd === "version" || cmd === "--version") {
  console.log(`hookreel engine ${version()} (${ENGINE})`);
} else if (COMMANDS[cmd]) {
  const [script, ...pre] = COMMANDS[cmd];
  const r = spawnSync(process.execPath, ["--no-warnings", path.join(ENGINE, "scripts", `${script}.mjs`), ...pre, ...args], { stdio: "inherit" });
  process.exit(r.status ?? 1);
} else {
  console.error(`hookreel engine ${version()}\nUsage: hookreel <command> [args]\nCommands: ${[...Object.keys(COMMANDS), "hf", "version"].join(", ")}`);
  process.exit(cmd ? 1 : 0);
}
