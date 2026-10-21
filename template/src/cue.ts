// When things happen inside a scene. Plain TypeScript, shared by the render and scripts/storyboard.mjs.
import { splitWords, type WordTime } from "./align.ts";
import { f, FPS, TIME } from "./motion.ts";

export type SceneTiming = {
  voSrc: string | null; // null = no recording yet, timing is estimated
  voFrames: number;
  duration: number;
  words: WordTime[] | null; // per script word, from the recording's transcript; null = estimate
};

export const LEAD_IN = f(TIME.leadIn);
export const TAIL = f(TIME.tail);
// Fallback pace until a recording exists (~150 words per minute).
const WORDS_PER_SECOND = 2.1;

export const estimateSeconds = (vo: string) => vo.trim().split(/\s+/).length / WORDS_PER_SECOND;

export const toTiming = (voSeconds: number, voSrc: string | null, words: WordTime[] | null = null): SceneTiming => {
  const voFrames = Math.ceil(voSeconds * FPS);
  return { voSrc, voFrames, duration: LEAD_IN + voFrames + TAIL, words };
};

export type SceneCtx = { vo: string; voFrames: number; duration: number; words: WordTime[] | null };

// Frame (relative to the scene) at which the narration reaches character `charIdx` of the script.
// With a transcript this is when that word is actually spoken; without one it assumes an even pace.
export const charToFrame = ({ vo, voFrames, words }: SceneCtx, charIdx: number) => {
  if (words) {
    const offsets = splitWords(vo).map((w) => w.offset);
    let i = 0;
    while (i + 1 < offsets.length && offsets[i + 1] <= charIdx) i++;
    return LEAD_IN + words[i].start * FPS;
  }
  return LEAD_IN + (charIdx / vo.length) * voFrames;
};

export const cueFrame = (scene: SceneCtx, phrase: string, offsetFrames = -f(TIME.cueLead)) => {
  const idx = scene.vo.indexOf(phrase);
  if (idx === -1) throw new Error(`Cue "${phrase}" not found in voiceover: ${scene.vo}`);
  return Math.max(0, Math.round(charToFrame(scene, idx) + offsetFrames));
};

// cue(phrase, fallbackFrame): the cue's frame, or the fallback when the phrase is omitted.
export type CueFn = (phrase: string | undefined, fallback?: number) => number;
export const makeCue = (scene: SceneCtx): CueFn => (phrase, fallback = 0) =>
  phrase ? cueFrame(scene, phrase) : fallback;

// Split narration into short caption lines: by sentence, then at commas or every ~`maxWords` words
// (8 by default; word-by-word captions use 4 so a centred line stays short and on one row).
export const captionChunks = (vo: string, maxWords = 8) => {
  const chunks: { text: string; start: number }[] = [];
  // Sentence ends only where punctuation is followed by a space, so "wa.me" stays whole.
  let cursor = 0;
  for (const sentence of vo.split(/(?<=[.?!:])\s+/)) {
    const base = vo.indexOf(sentence, cursor);
    cursor = base + sentence.length;
    const words = sentence.split(/(\s+)/);
    let buf = "";
    let bufStart = base;
    let pos = base;
    let count = 0;
    for (const w of words) {
      if (!buf.trim()) bufStart = pos;
      buf += w;
      pos += w.length;
      if (w.trim()) count++;
      const breakHere = count >= maxWords || (count >= 2 && /,$/.test(w));
      if (breakHere) {
        chunks.push({ text: buf.trim(), start: bufStart });
        buf = "";
        count = 0;
      }
    }
    if (buf.trim()) {
      if (count <= 2 && chunks.length && chunks[chunks.length - 1].start >= base) {
        chunks[chunks.length - 1].text += " " + buf.trim();
      } else {
        chunks.push({ text: buf.trim(), start: bufStart });
      }
    }
  }
  return chunks;
};
