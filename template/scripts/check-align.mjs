// Usage: node scripts/check-align.mjs <video id>
// Prints each script word with the time it is spoken in the recording, to sanity-check cues.
import fs from "fs";
import { scriptWordTimes, splitWords } from "../src/align.ts";

const reel = process.argv[2] ?? "teaser";
const { scenes } = JSON.parse(fs.readFileSync(`videos/${reel}.json`, "utf8"));
for (const s of scenes) {
  const file = `public/vo/${reel}/${s.id}.words.json`;
  if (!fs.existsSync(file)) {
    console.log(s.id, "(not recorded)");
    continue;
  }
  const heard = JSON.parse(fs.readFileSync(file, "utf8"));
  const t = scriptWordTimes(s.vo, heard, heard[heard.length - 1].end);
  console.log(s.id, splitWords(s.vo).map((w, i) => `${w.word}@${t[i].start.toFixed(1)}`).join(" "));
}
