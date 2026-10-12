import { createContext, useContext } from "react";
import { FPS } from "./brand";
import { splitWords, WordTime } from "./align";

export type SceneTiming = {
  voSrc: string | null; // null = no recording yet, timing is estimated
  voFrames: number;
  duration: number;
  words: WordTime[] | null; // per script word, from the recording's transcript; null = estimate
};

// Breathing room around each voiceover clip.
export const LEAD_IN = 8;
export const TAIL = 22;
// Fallback pace until a recording exists (~150 words per minute).
const WORDS_PER_SECOND = 2.5;

export const estimateSeconds = (vo: string) =>
  vo.trim().split(/\s+/).length / WORDS_PER_SECOND;

export const toTiming = (
  voSeconds: number,
  voSrc: string | null,
  words: WordTime[] | null = null,
): SceneTiming => {
  const voFrames = Math.ceil(voSeconds * FPS);
  return { voSrc, voFrames, duration: LEAD_IN + voFrames + TAIL, words };
};

type SceneCtx = { vo: string; voFrames: number; duration: number; words: WordTime[] | null };
export const SceneContext = createContext<SceneCtx>({ vo: "", voFrames: 0, duration: 0, words: null });
export const useScene = () => useContext(SceneContext);

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

const cueFrame = (scene: SceneCtx, phrase: string, offset: number) => {
  const idx = scene.vo.indexOf(phrase);
  if (idx === -1) {
    throw new Error(`Cue "${phrase}" not found in voiceover: ${scene.vo}`);
  }
  return Math.max(0, Math.round(charToFrame(scene, idx) + offset));
};

export const useCue = (phrase: string, offset = -4) => cueFrame(useScene(), phrase, offset);

export const useCues = (phrases: string[], offset = -4) => {
  const scene = useScene();
  return phrases.map((p) => cueFrame(scene, p, offset));
};

// One hook call, then resolve any number of optional cues: `cue(phrase, fallbackFrame)`.
// Used by the data-driven visuals, where cues come from JSON and may be omitted.
export const useCueFn = () => {
  const scene = useScene();
  return (phrase: string | undefined, fallback = 0, offset = -4) =>
    phrase ? cueFrame(scene, phrase, offset) : fallback;
};

// Split narration into short caption lines: by sentence, then at commas or every ~8 words.
export const captionChunks = (vo: string) => {
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
      const breakHere = count >= 8 || (count >= 2 && /,$/.test(w));
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
