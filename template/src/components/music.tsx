import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";
import type { MusicSpec } from "../schema";
import { LEAD_IN, SceneTiming } from "../timing";

// Background bed with ducking: under speech it sits ~13 dB below the voice, in pauses it comes
// up to ~8 dB below. Defaults assume a track loudness-normalised to about -14 to -16 LUFS.
const DUCK = { underVoice: 0.085, inPauses: 0.16, ramp: 8, fadeIn: 15, fadeOut: 45 };

// Frames (on the reel timeline) where the voice is speaking.
const speechSpans = (timings: SceneTiming[], fps: number) => {
  const spans: [number, number][] = [];
  let sceneStart = 0;
  for (const t of timings) {
    const base = sceneStart + LEAD_IN;
    if (t.words) {
      for (const w of t.words) spans.push([base + w.start * fps, base + w.end * fps]);
    } else if (t.voSrc) {
      spans.push([base, base + t.voFrames]);
    }
    sceneStart += t.duration;
  }
  // Merge words closer than a short breath into phrases, so the bed doesn't pump between words.
  const merged: [number, number][] = [];
  for (const s of spans.sort((a, b) => a[0] - b[0])) {
    const last = merged[merged.length - 1];
    if (last && s[0] - last[1] < 12) last[1] = Math.max(last[1], s[1]);
    else merged.push([...s]);
  }
  return merged;
};

export const BackgroundMusic: React.FC<{ timings: SceneTiming[]; music: MusicSpec }> = ({ timings, music }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const spans = speechSpans(timings, fps);

  const volume = (f: number) => {
    // Distance to the nearest phrase decides how far the bed is ducked.
    let gap = Infinity;
    for (const [a, b] of spans) {
      if (f >= a && f <= b) {
        gap = 0;
        break;
      }
      gap = Math.min(gap, f < a ? a - f : f - b);
    }
    const level = interpolate(gap, [0, DUCK.ramp], [music.underVoice ?? DUCK.underVoice, music.inPauses ?? DUCK.inPauses], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fade = interpolate(
      f,
      [0, DUCK.fadeIn, durationInFrames - DUCK.fadeOut, durationInFrames],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return level * fade;
  };

  return (
    <Audio
      src={staticFile(music.src)}
      trimBefore={(music.startAt ?? 0) * fps}
      volume={volume}
      name="Background music"
    />
  );
};
