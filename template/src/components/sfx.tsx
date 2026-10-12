import React, { createContext, useContext } from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { sfxVolume, type SfxLevel, type SoundName } from "../motion.ts";
import type { PlanEvent } from "../plan.ts";

export type { SfxLevel, SoundName };
export const SfxLevelContext = createContext<SfxLevel>("medium");

// Plays a sound at frame `at` of the current scene. `length` cuts it short (used for typing).
export const Sfx: React.FC<{ name: SoundName; at: number; length?: number; volume?: number }> = ({ name, at, length, volume }) => {
  const level = useContext(SfxLevelContext);
  const v = sfxVolume(name, level, volume);
  if (v === null || v <= 0 || at > 1e8) return null;
  return (
    <Sequence from={Math.max(0, Math.round(at))} durationInFrames={length} layout="none" name={`sfx: ${name}`}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={v} />
    </Sequence>
  );
};

// Every sound a plan lists, and nothing else: the storyboard prints the same list.
export const PlanSfx: React.FC<{ events: PlanEvent[] }> = ({ events }) => (
  <>
    {events.map((e, i) =>
      e.sfx ? <Sfx key={i} name={e.sfx.name} at={e.at} length={e.sfx.length} volume={e.sfx.volume} /> : null,
    )}
  </>
);
