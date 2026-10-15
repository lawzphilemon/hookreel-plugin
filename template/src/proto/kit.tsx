// Kit for custom motion scenes (the default look): every video gets its own per-beat motion in
// src/proto/<video id>/, built from the user's reference reels and the motion library
// (hookreel-rules references/motion-library.md). This file holds only the shared pieces: the font
// library, time helpers, focus-in words, grain, glow, sound effects, voiceover clips, source lines,
// spoken-word times and the reel wrapper. Every value is a function of the frame.
import React from "react";
import { AbsoluteFill, Easing, Freeze, interpolate, Sequence, Series, staticFile, useCurrentFrame } from "remotion";
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

// Transition set: reveals `children` (the next background or camera) over what is underneath, from
// scene second `at` over `dur`. Pick a different one per scene change and log it in moves.json; no
// background or camera should hold longer than about 5 s.
//   circle: grows from (x, y) · flood: a colour sweeps up, then uncovers the new stage · swipe: slides in
//   from the right · zoom: the new stage zooms through from small · mask: a soft diagonal wipe
export type TransitionKind = "circle" | "flood" | "swipe" | "zoom" | "mask";
export const Transition: React.FC<{ t: number; at: number; kind: TransitionKind; dur?: number; color?: string; x?: number; y?: number; children: React.ReactNode }> = ({ t, at, kind, dur = 0.45, color = C.accent, x = 540, y = 960, children }) => {
  const p = prog(t, at, dur, Easing.bezier(0.5, 0, 0.2, 1));
  if (p <= 0) return null;
  if (kind === "flood") {
    const cover = prog(t, at, dur * 0.5, Easing.bezier(0.5, 0, 0.75, 0));
    const open = prog(t, at + dur * 0.5, dur * 0.5);
    return (
      <AbsoluteFill>
        {open > 0 ? <AbsoluteFill style={{ clipPath: `inset(${(1 - open) * 100}% 0 0 0)` }}>{children}</AbsoluteFill> : null}
        <AbsoluteFill style={{ background: color, clipPath: `inset(${(1 - cover) * 100}% 0 ${open * 100}% 0)` }} />
      </AbsoluteFill>
    );
  }
  const style: React.CSSProperties =
    kind === "circle" ? { clipPath: `circle(${p * 2300}px at ${x}px ${y}px)` }
    : kind === "swipe" ? { transform: `translateX(${(1 - p) * 1080}px)` }
    : kind === "zoom" ? { transform: `scale(${mix(p, 0.2, 1)})`, opacity: Math.min(1, p * 3), borderRadius: (1 - p) * 120, overflow: "hidden" }
    : { maskImage: `linear-gradient(135deg, #000 ${p * 140 - 20}%, transparent ${p * 140}%)`, WebkitMaskImage: `linear-gradient(135deg, #000 ${p * 140 - 20}%, transparent ${p * 140}%)` };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

// Kinetic captions (optional, for muted viewing): the spoken sentence in chunks of up to `max` words,
// each word rising in as it is said, the word being said in `active`. Style it into the motion.
export const KineticCaption: React.FC<{ words: Words; id: string; t: number; top?: number; max?: number; color?: string; active?: string; size?: number }> = ({ words, id, t, top = 1330, max = 4, color = C.text, active = C.accent, size = 54 }) => {
  const list = words.scenes[id].words.map(([w, s]) => ({ w: String(w), at: Number(s) + TIME.leadIn }));
  const chunks: (typeof list)[] = [[]];
  for (const x of list) {
    const cur = chunks[chunks.length - 1];
    cur.push(x);
    if (cur.length >= max || /[.,!?;:]$/.test(x.w)) chunks.push([]);
  }
  const chunk = chunks.filter((c) => c.length && c[0].at <= t).pop();
  if (!chunk) return null;
  const said = chunk.filter((x) => x.at <= t);
  const last = said[said.length - 1];
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16, fontFamily: sans, fontWeight: 700, fontSize: size, lineHeight: 1.15 }}>
      {said.map((x) => {
        const p = prog(t, x.at, 0.25);
        return (
          <span key={`${x.at}-${x.w}`} style={{ display: "inline-block", color: x === last ? active : color, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
            {x.w}
          </span>
        );
      })}
    </div>
  );
};

// The whole video: scenes in order, hard cuts (put transitions inside the scenes with `Transition`).
// Register both in Root.tsx:
//   const REEL = protoReel(WORDS, SCENES);
//   <Composition id="<video id>-motion" component={REEL.component} durationInFrames={REEL.frames} fps={FPS} width={1080} height={1920} />
//   <Composition id="<video id>-sweep" component={REEL.sweep} durationInFrames={REEL.frames} fps={FPS} {...REEL.sweepSize} />
// `npm run sweep -- <video id>` renders the sweep: `perScene` frames of every scene at quarter scale on one
// image, with the safe area drawn (text inside x 80–1000 and above y 1500).
export const protoReel = (words: Words, scenes: [string, React.FC][], perScene = 6) => {
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
  const W = 270, H = 480, LABEL = 28;
  let start = 0;
  const grid = scenes.map(([id]) => {
    const n = frames(id);
    const row = { id, frames: Array.from({ length: perScene }, (_, k) => start + Math.round(((k + 0.5) / perScene) * n)) };
    start += n;
    return row;
  });
  const line = "rgba(255,40,40,0.85)";
  const Reel = component;
  const sweep: React.FC = () => (
    <AbsoluteFill style={{ background: "#222" }}>
      {grid.map((row, r) => (
        <div key={row.id} style={{ position: "absolute", top: r * (H + LABEL), left: 0, display: "flex" }}>
          {row.frames.map((f) => (
            <div key={f} style={{ width: W, height: H + LABEL, position: "relative", overflow: "hidden" }}>
              <div style={{ width: 1080, height: 1920, transform: "scale(0.25)", transformOrigin: "top left" }}>
                <Freeze frame={f}>
                  <Reel />
                </Freeze>
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 375, height: 2, background: line }} />
              <div style={{ position: "absolute", top: 0, height: H, left: 20, width: 1, background: line }} />
              <div style={{ position: "absolute", top: 0, height: H, left: 250, width: 1, background: line }} />
              <div style={{ position: "absolute", left: 6, top: H, color: "#fff", fontFamily: sans, fontSize: 15, lineHeight: `${LABEL}px` }}>
                {row.id} · {(f / FPS).toFixed(2)} s
              </div>
            </div>
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
  return { component, sweep, sweepSize: { width: W * perScene, height: grid.length * (H + LABEL) }, frames: scenes.reduce((n, [id]) => n + frames(id), 0) };
};
