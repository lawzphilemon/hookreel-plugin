import React, { createContext, useContext } from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

// Synthesised by scripts/make-sfx.mjs (no samples, no licences). Base levels sit under a
// voiceover normalised to -16 LUFS with -3 dBTP peaks.
const SOUNDS = {
  whoosh: 0.4,
  impact: 0.42,
  riser: 0.3,
  click: 0.4,
  tick: 0.3,
  pop: 0.4,
  switch: 0.45,
  ding: 0.4,
  typing: 0.2,
} as const;

export type SoundName = keyof typeof SOUNDS;
export type SfxLevel = "off" | "subtle" | "medium" | "dramatic";

// What each intensity plays, and how loud relative to the base level.
const LEVELS: Record<SfxLevel, { gain: number; mute: SoundName[] }> = {
  off: { gain: 0, mute: Object.keys(SOUNDS) as SoundName[] },
  subtle: { gain: 0.7, mute: ["impact", "riser", "typing"] },
  medium: { gain: 1, mute: ["riser"] },
  dramatic: { gain: 1, mute: [] },
};

export const SfxLevelContext = createContext<SfxLevel>("medium");

// Plays a sound at frame `at` of the current scene. `length` cuts it short (used for typing).
export const Sfx: React.FC<{ name: SoundName; at: number; length?: number; volume?: number }> = ({
  name,
  at,
  length,
  volume,
}) => {
  const levelName = useContext(SfxLevelContext);
  const level = LEVELS[levelName];
  if (level.mute.includes(name) || at > 1e8) return null;
  const impactTrim = name === "impact" && levelName === "medium" ? 0.6 : 1;
  return (
    <Sequence from={Math.max(0, Math.round(at))} durationInFrames={length} layout="none" name={`sfx: ${name}`}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={(volume ?? SOUNDS[name]) * level.gain * impactTrim} />
    </Sequence>
  );
};
