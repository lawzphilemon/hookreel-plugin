// Kit for custom motion scenes (the default look): every video gets its own per-beat motion in
// src/proto/<video id>/, built from the user's reference reels and the motion library
// (hookreel-rules references/motion-library.md). This file holds only the shared pieces: the font
// library, time helpers, focus-in words, grain, glow, sound effects, voiceover clips, source lines,
// spoken-word times and the reel wrapper. Every value is a function of the frame.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, Series, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadOpenSans } from "@remotion/google-fonts/OpenSans";
import { loadFont as loadRubik } from "@remotion/google-fonts/Rubik";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { C, FPS } from "../brand";
import { TIME } from "../motion.ts";

export { C };

// Font library, the same for every brand: Open Sans 800 for headlines and big numbers, Rubik
// 500–700 for supporting text, labels and UI mockups, Instrument Serif italic for the key word.
const openSans = loadOpenSans("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;
const rubik = loadRubik("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;
const instrument = loadSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const FONT = { display: `${openSans}, sans-serif`, sans: `${rubik}, sans-serif`, serif: `${instrument}, serif` };
export const { display, sans, serif } = FONT;

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene time in seconds.
export const useT = () => useCurrentFrame() / FPS;
// 0 → 1 from `start` over `dur` seconds.
export const prog = (t: number, start: number, dur: number, easing = EASE) => interpolate(t, [start, start + dur], [0, 1], { ...clamp, easing });
export const mix = (p: number, a: number, b: number) => a + (b - a) * p;

// A word that focuses in from a blur, rising a little.
export const Word: React.FC<{ t: number; at: number; style?: React.CSSProperties; children: React.ReactNode; dur?: number; from?: number }> = ({ t, at, style, children, dur = 0.45, from = 1.25 }) => {
  const p = prog(t, at, dur);
  return (
    <span style={{ display: "inline-block", opacity: p, filter: p < 1 ? `blur(${(1 - p) * 18}px)` : undefined, transform: `translateY(${(1 - p) * 30}px) scale(${mix(p, from, 1)})`, ...style }}>
      {children}
    </span>
  );
};

// Paper grain: SVG noise, reseeded every 3 frames so it lives like film. Put it above the content.
export const Grain: React.FC<{ opacity: number }> = ({ opacity }) => {
  const seed = Math.floor(useCurrentFrame() / 3) % 50;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "multiply", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={seed} />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 1.4 -0.35" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// Background: flat colour plus a slow drifting glow.
export const Glow: React.FC<{ t: number; color: string; base: string }> = ({ t, color, base }) => (
  <AbsoluteFill style={{ background: `radial-gradient(950px 950px at ${540 + Math.sin(t * 0.7) * 170}px ${820 + Math.cos(t * 0.5) * 140}px, ${color}, transparent 70%), ${base}` }} />
);

// A sound effect at scene second `at` (files from `npm run sfx` or the studio's licensed sounds).
export const Sfx: React.FC<{ at: number; name: string; volume: number }> = ({ at, name, volume }) => (
  <Sequence from={Math.round(at * FPS)} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

// Small source line, centred, above the platform UI. Every number on screen needs one.
export const SourceLine: React.FC<{ t: number; at: number; children: React.ReactNode; color?: string; top?: number }> = ({ t, at, children, color = C.muted, top = 1440 }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top, textAlign: "center", fontFamily: sans, fontSize: 28, fontWeight: 500, color, opacity: prog(t, at, 0.4) }}>{children}</div>
);

// src/proto/<video id>/words.json, written by `npm run words -- <video id>` after `npm run vo`.
// Each word is [text, seconds into the clip]; typed loosely so the JSON imports without a cast.
export type Words = { video: string; scenes: Record<string, { secs: number; words: (string | number)[][] }> };

// Each clip starts TIME.leadIn into its scene; a scene lasts its clip + leadIn + tail.
export const sceneSeconds = (words: Words, id: string) => words.scenes[id].secs + TIME.leadIn + TIME.tail;

// Scene-time of a spoken word: `w("but")`, or the nth time it is said: `w("for", 1)`.
const norm = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}%]/gu, "");
export const wordsOf = (words: Words, id: string) => {
  const list = words.scenes[id].words;
  return (word: string, nth = 0) => {
    const hits = list.filter(([x]) => norm(String(x)) === norm(word));
    if (!hits[nth]) throw new Error(`"${word}" (#${nth}) is not spoken in ${id}`);
    return Number(hits[nth][1]) + TIME.leadIn;
  };
};

export const Vo: React.FC<{ words: Words; id: string }> = ({ words, id }) => (
  <Sequence from={Math.round(TIME.leadIn * FPS)} layout="none">
    <Audio src={staticFile(`vo/${words.video}/${id}.wav`)} />
  </Sequence>
);

// The whole video: scenes in order, hard cuts (put transitions inside the scenes).
// Register it in Root.tsx: const r = protoReel(WORDS, SCENES);
// <Composition id="<video id>-v2" component={r.component} durationInFrames={r.frames} fps={FPS} width={1080} height={1920} />
export const protoReel = (words: Words, scenes: [string, React.FC][]) => {
  const frames = (id: string) => Math.round(sceneSeconds(words, id) * FPS);
  const component: React.FC = () => (
    <AbsoluteFill style={{ background: "#000" }}>
      <Series>
        {scenes.map(([id, Scene]) => (
          <Series.Sequence key={id} name={id} durationInFrames={frames(id)}>
            <Scene />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
  return { component, frames: scenes.reduce((n, [id]) => n + frames(id), 0) };
};
