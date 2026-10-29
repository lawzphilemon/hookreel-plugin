// Time model: every duration and offset is written in seconds and turned into frames by f(t).
// frame = f(t) = round(t × FPS). Plain JavaScript (no React, no renderer) so the storyboard
// script uses exactly the same numbers as the render.

export const FPS = 30; // half the render time of 60; every motion is in seconds, so speeds do not change
export const f = (seconds        ) => Math.round(seconds * FPS);
export const t = (frames        ) => frames / FPS;

export const EASE = { name: "ease-out cubic-bezier(0.16, 1, 0.3, 1)", bezier: [0.16, 1, 0.3, 1]          };

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
  split: { total: 0.27, split: 0.6, grow: 0.36, fade: 0.5, fadeLength: 0.4, text: 0.33 },
  months: { first: 0.27, step: 0.6, cell: 0.12, grow: 0.36, source: 0.2, text: 0.33 },
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
  kinetic: { wordStep: 0.06 }, // headline words, one after another
  focus: { blur: 14 }, // px of blur a focus entrance starts from (not seconds)
  camera: { push: 0.025 }, // scale gained over a scene (not seconds)
  // Style "playful": pop entrance = a spring from `scale` to 1 with a small overshoot, settling in
  // about `settle` seconds; float = every element bobs `amp` px up and down once per `period` seconds.
  pop: { damping: 10, stiffness: 160, mass: 0.7, scale: 0.6, settle: 0.7 },
  float: { period: 2.4, amp: 6, characterAmp: 14 },
  character: { at: 0.13, bubble: 0.6, chips: 0.67, push: 0.06 },
}         ;

// Spring presets for custom scenes (kit spr and glide): motion with mass, which accelerates, overshoots a
// little and settles. Measured at 30 fps (settled within 1 %, highest point):
//   snappy  0.30 s, 1.02: buttons, toggles, leading edges
//   default 0.53 s, 1.05: cards, containers, camera
//   heavy   0.93 s, 1.00: big type, 3D objects, logo lockups
//   playful 0.60 s, 1.19: mascots and stickers, overshoot meant to be seen
export const SPRING = {
  snappy: { damping: 22, stiffness: 320, mass: 0.6 },
  default: { damping: 18, stiffness: 170, mass: 1 },
  heavy: { damping: 28, stiffness: 90, mass: 2.6 },
  playful: { damping: 10, stiffness: 160, mass: 0.7 },
}         ;
                                             

// Shot sizes for custom scenes (world scale): wide shows the whole composition, medium fills about a
// third to half of the frame with the element that speaks, close lets it fill most of the frame.
// A breathing push of a few percent is not a shot change; it reads as a still camera.
export const SHOT = { wide: 1, medium: 1.45, close: 2.1 }         ;
                                         
// One camera move: from scene second `at`, over `dur` seconds, to scale `s` centred on world point
// (x, y). `cut: true` jumps there at `at` (a scene may be born in a close-up and pull back).
                                                                                                  

// Camera at scene second t: scale and translate for a top-left-origin wrapper. Ease in-out between
// shots, a 1 % breath on top, and clamped so the edge of the world never shows.
export const camAt = (t        , shots        , W = 1080, H = 1920) => {
  let s = 1, x = W / 2, y = H / 2;
  for (const sh of shots) {
    if (t < sh.at) break;
    const d = sh.dur ?? 0.7;
    const q = sh.cut || d <= 0 ? 1 : Math.min(1, (t - sh.at) / d);
    const p = q * q * (3 - 2 * q);
    s += (sh.s - s) * p;
    x += ((sh.x ?? W / 2) - x) * p;
    y += ((sh.y ?? H / 2) - y) * p;
  }
  s = Math.max(1, s * (1 + 0.01 * Math.sin(t * 0.7)));
  return { s, tx: Math.min(0, Math.max(W - W * s, W / 2 - x * s)), ty: Math.min(0, Math.max(H - H * s, H / 2 - y * s)) };
};

// A shot that frames a box in world pixels so it fills `fill` of the frame (close ≈ 0.7, medium ≈ 0.45).
export const frameOn = (box                                                , fill = 0.45, W = 1080, H = 1920) => ({
  s: Math.max(1, Math.min((W * fill) / box.w, (H * fill) / box.h)),
  x: box.x + box.w / 2,
  y: box.y + box.h / 2,
});

                                                
                                     

// Brand style presets. "clean" (default): fade + rise, nothing loops. "playful": pop entrances with
// overshoot, elements float, made for illustrated or AI-generated 3D cartoon characters.
// Explicit brand.motion.entrance / motion.idle values win over the preset.
export const styleMotion = (style         , motion                                       ) => ({
  entrance: motion?.entrance ?? (style === "playful" ? "pop" : "rise"),
  idle: motion?.idle ?? (style === "playful" ? "float" : "still"),
});

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
  snip: 0.5,
  drop: 0.45,
  stamp: 0.5,
  note: 0.32,
  hit: 0.45,
  crack: 0.42,
  powerdown: 0.38,
  check: 0.35,
  resolve: 0.42,
}         ;

                                            
                                                                

export const LEVELS                                                                            = {
  off: { gain: 0, mute: Object.keys(SOUNDS)               , impactTrim: 0 },
  subtle: { gain: 0.7, mute: ["impact", "riser", "typing"], impactTrim: 1 },
  medium: { gain: 1, mute: ["riser"], impactTrim: 0.6 },
  dramatic: { gain: 1, mute: [], impactTrim: 1 },
};

// Final volume of a sound at a given intensity, or null when that intensity mutes it.
export const sfxVolume = (name           , level          , volume         ) => {
  const l = LEVELS[level];
  if (l.mute.includes(name)) return null;
  return (volume ?? SOUNDS[name]) * l.gain * (name === "impact" ? l.impactTrim : 1);
};
