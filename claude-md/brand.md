# CLAUDE_[CODE] · [brand] studio · project [CODE]

Rules for building project **[CODE]** in this studio, written by `/hookreel:build`. Imported by the studio's `CLAUDE.md` together with every other project's coded file. The project's full rulebook is `hookreel-output/[CODE]_[slug]/CLAUDE_[CODE].md`.

## This project
- Code: [CODE] · slug: [slug] · folder: `hookreel-output/[CODE]_[slug]/`
- Videos: [CODE]-[name], … (compositions `<id>-motion` from `src/proto/<id>/`, `videos/*.json` for the voiceover lines, `public/vo/<id>/`, `out/<id>.mp4`)
- Reference reels: [files or links]; approved prototype: [file, date]
- Bans that apply only to these videos: [..]

## Brand voice
- [Speaks like / never sounds like / person / casing / punctuation / language]

## Look
- Colours: `brand.json` (semantic tokens, read in scenes as `C.<token>`). Brand colours: [hex].
- Typeface: [..]; logo: [..]; signature elements: [..]

## Time and motion
- 60 fps. Every time in seconds, frame = f(t) = round(t × 60) (`src/motion.ts`). Never hard-code frame counts.
- Every animated property is a function of the frame via `interpolate` with clamped input and the brand ease-out. No CSS transitions or keyframe animations.
- Custom motion per video (default): new per-beat scenes in `src/proto/<id>/`, invented from the reference reels, built on `src/proto/kit.tsx`. Beats time from `src/proto/<id>/words.json` (`npm run words -- <id>`) via `wordsOf()`; never guessed. Each beat finishes before the next. Never the template's infographic slides unless the project chose the template look (then timing comes from `src/plan.ts`).
- Safe area: text inside x 80–1000 and above y 1500.

## Sound
- Voiceover -16 LUFS / -3 dBTP via `npm run vo`. Sound effects synthesised (`npm run sfx`) or licence noted. Music synthesised (`npm run music`) or licence noted, ducked under the voice. Final mix -16 to -17 LUFS, true peak ≤ -0.5 dBTP (`npm run loudness -- out/<id>-mix.wav`).

## Evidence
- Every number on screen has its source line; hypotheticals carry "[Illustration | Ilustrasi]"; end card disclaimers: [exact text, or none].

## Bans
- Claims: [hard rules from the profile]
- Words: [brand never-say list] plus generic filler ("game-changer", "unlock", "supercharge", "let's dive in", "seamless", "cutting-edge", …)
- Visuals: [brand dislikes], stock photos, emoji decoration
- Sound: meme sound effects, sounds lifted from songs, films, cartoons or games, unlicensed music
- Files: recordings (`public/vo/`) and music (`public/music/`) are never committed to a public repository
