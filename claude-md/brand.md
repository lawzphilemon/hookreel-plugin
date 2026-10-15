# CLAUDE_[CODE] · [brand] studio · project [CODE]

Rules for building project **[CODE]** in this studio, written by `/hookreel:build`. Imported by the studio's `CLAUDE.md` together with every other project's coded file. The project's full rulebook is `hookreel-output/[CODE]_[slug]/CLAUDE_[CODE].md`.

## This project
- Code: [CODE] · slug: [slug] · folder: `hookreel-output/[CODE]_[slug]/`
- Videos: [CODE]-[name], … (compositions, `videos/*.json`, `public/vo/<id>/`, `out/<id>.mp4`)
- Bans that apply only to these videos: [..]

## Brand voice
- [Speaks like / never sounds like / person / casing / punctuation / language]

## Look
- Colours: `brand.json` (semantic tokens). Accent: [hex], rationed to [..].
- Typeface: [..]; logo: [..]; signature elements: [..]

## Time and motion
- 60 fps. Every time in seconds, frame = f(t) = round(t × 60) (`src/motion.ts`). Never hard-code frame counts.
- Every animated property is a function of the frame via `interpolate` with clamped input and the brand ease-out. No CSS transitions or keyframe animations.
- Timing and sounds come from `src/plan.ts` only; components read their times from the planners, and `npm run storyboard` prints the same plan.
- Style: [clean | playful]. clean = entrances fade + rise, no bounce, no loops; playful = pop entrances with overshoot, elements float, `character` visuals (AI 3D cartoon, mascot) from `public/characters/`. No story-style progress bar either way. Safe area y 330–1300, captions at y 1340.

## Sound
- Voiceover -16 LUFS / -3 dBTP via `npm run vo`. Sound effects synthesised (`npm run sfx`). Music ducked, licence noted. Final mix true peak ≤ -0.5 dBTP.

## Bans
- Claims: [hard rules from the profile]
- Words: [brand never-say list] plus generic filler ("game-changer", "unlock", "supercharge", "let's dive in", "seamless", "cutting-edge", …)
- Visuals: [brand dislikes], stock photos, emoji decoration, decorative gradients, more than one accent per scene
- Sound: meme sound effects, unlicensed music
- Files: recordings (`public/vo/`) and music (`public/music/`) are never committed to a public repository
