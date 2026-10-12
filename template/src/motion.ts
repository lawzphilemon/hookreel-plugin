// Time model: every duration and offset is written in seconds and turned into frames by f(t).
// frame = f(t) = round(t × FPS). Plain TypeScript (no React, no Remotion) so the storyboard
// script uses exactly the same numbers as the render.

export const FPS = 60;
export const f = (seconds: number) => Math.round(seconds * FPS);
export const t = (frames: number) => frames / FPS;

export const EASE = { name: "ease-out cubic-bezier(0.16, 1, 0.3, 1)", bezier: [0.16, 1, 0.3, 1] as const };

// Seconds. Changing a value here changes the render and the storyboard together.
export const TIME = {
  leadIn: 0.27, // silence before the voiceover starts in each scene
  tail: 0.73, // after the voiceover ends, before the next scene
  cueLead: 0.13, // elements land slightly before their cue word is spoken
  sceneFadeOut: 0.2,
  sceneHit: 0.17, // soft impact after the whoosh at each scene start
  rise: 28, // px an entering element travels upward (not seconds)
  captionIn: 0.17,
  highlight: 0, // highlights use the entrance length
  toggle: 0.2,
  stat: { at: 0.13, dots: 0.27, dotsStart: 0.33, dotsPerSecond: 48, chips: 0.67 },
  ranking: { first: 0.13, step: 0.1, hot: 1.2, riserLead: 1.2, dim: 0.33 },
  tiles: { first: 0.27, step: 0.33, source: 0.2, text: 0.33, chips: 0.53 },
  timeline: { first: 0.2, step: 0.33, lineDelay: 0.13, line: 0.47, chip: 0.33 },
  bars: { first: 0.27, step: 0.33, grow: 0.6, text: 0.33 },
  flow: { tools: 0.13, toolStep: 0.27, first: 0.2, firstAfterTools: 0.67, step: 0.33, linkLead: 0.2, link: 0.33, split: 0.47, splitStep: 0.2, break: 0.33, results: 0.33, resultStep: 0.27, chip: 0.53 },
  chat: { panel: 0.2, sponsored: 1.0, highlight: 0.2, chip: 0.67 },
  journey: { first: 0.27, step: 0.47, press: 0.27, chat: 0.27 },
  ui: { panel: 0.2, firstRow: 0.2, rowStep: 0.27, typeDelay: 0.13, toggleDelay: 0.2, checkDelay: 0.2, codeStep: 0.3, pathStep: 0.33, after: 1.0 },
  list: { first: 0.33, step: 0.2, strikeStep: 0.13, strike: 0.27, answer: 0.67 },
  logo: { headline: 0.4, chip: 0.53 },
  headline: { sub: 0.4, chips: 0.67 },
  chips: { step: 0.13 },
  cta: { card: 1.0, riserLead: 1.2, footer: 1.0 },
  swap: { fadeStart: 0.33, fadeEnd: 0.07 },
  note: { at: 1.33 },
  music: { ramp: 0.27, fadeIn: 0.5, fadeOut: 1.5, mergeGap: 0.4, underVoice: 0.085, inPauses: 0.16 },
  typing: { cps: 40, cpsLong: 70 },
} as const;

// Sound effects (synthesised by scripts/make-sfx.mjs). Base volumes sit under a voiceover
// normalised to -16 LUFS with -3 dBTP peaks.
export const SOUNDS = {
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

export const LEVELS: Record<SfxLevel, { gain: number; mute: SoundName[]; impactTrim: number }> = {
  off: { gain: 0, mute: Object.keys(SOUNDS) as SoundName[], impactTrim: 0 },
  subtle: { gain: 0.7, mute: ["impact", "riser", "typing"], impactTrim: 1 },
  medium: { gain: 1, mute: ["riser"], impactTrim: 0.6 },
  dramatic: { gain: 1, mute: [], impactTrim: 1 },
};

// Final volume of a sound at a given intensity, or null when that intensity mutes it.
export const sfxVolume = (name: SoundName, level: SfxLevel, volume?: number) => {
  const l = LEVELS[level];
  if (l.mute.includes(name)) return null;
  return (volume ?? SOUNDS[name]) * l.gain * (name === "impact" ? l.impactTrim : 1);
};
