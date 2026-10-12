# CLAUDE.md · [brand] studio

Fixed rules for every video made in this Remotion studio. Written by `/hookreel:build` from the brand context profile; each video project also has its own `hookreel-output/<slug>/CLAUDE.md` with the rules for that video.

## Brand voice
- [Speaks like / never sounds like / person / casing / punctuation / language]

## Look
- Colours: `brand.json` (semantic tokens). Accent: [hex], rationed to [..].
- Typeface: [..]; logo: [..]; signature elements: [..]

## Time and motion
- 60 fps. Every time in seconds, frame = f(t) = round(t × 60) (`src/motion.ts`). Never hard-code frame counts.
- Every animated property is a function of the frame via `interpolate` with clamped input and the brand ease-out. No CSS transitions or keyframe animations.
- Timing and sounds come from `src/plan.ts` only; components read their times from the planners, and `npm run storyboard` prints the same plan.
- Entrances fade + rise, no bounce, no loops, no story-style progress bar. Safe area y 330–1300, captions at y 1340.

## Sound
- Voiceover -16 LUFS / -3 dBTP via `npm run vo`. Sound effects synthesised (`npm run sfx`). Music ducked, licence noted. Final mix true peak ≤ -0.5 dBTP.

## Bans
- Claims: [hard rules from the profile]
- Words: [brand never-say list] plus generic filler ("game-changer", "unlock", "supercharge", "let's dive in", "seamless", "cutting-edge", …)
- Visuals: [brand dislikes], stock photos, emoji decoration, decorative gradients, more than one accent per scene
- Sound: meme sound effects, unlicensed music
- Files: recordings (`public/vo/`) and music (`public/music/`) are never committed to a public repository
