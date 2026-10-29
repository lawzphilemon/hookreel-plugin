# CLAUDE_[CODE] · [brand] studio · project [CODE]

Rules for building project **[CODE]** in this studio, written by `/hookreel:build`. Imported by the studio's `CLAUDE.md` after `@BRAND.md` (the brand's voice, compliance rules, disclaimers, CTA shape and pacing) and together with every other project's coded file. Brand-wide rules stay in `BRAND.md`; this file holds only what this project adds. The project's full rulebook is `hookreel-output/[CODE]_[slug]/CLAUDE_[CODE].md`.

## This project
- Code: [CODE] · slug: [slug] · folder: `hookreel-output/[CODE]_[slug]/`
- Videos: [CODE]-[name], … (HyperFrames projects in `reels/<id>/`, `videos/*.json` for the voiceover lines, `public/vo/<id>/`, `out/<id>.mp4`)
- Reference reels: [files or links]; approved prototype: [file, date]
- Bans that apply only to these videos: [..]

## Brand voice
- `BRAND.md`. Only this project's differences: [.. or none]

## Look
- Colours: `brand.json` (semantic tokens, 6-digit hex, used in the scenes' CSS). Brand colours: [hex]. Watermark: `brand.json` → `watermark` [tile | corner | none]; `"watermark": "off"` in `videos/<id>.json` only where `BRAND.md` allows it.
- Typeface: [..]; logo: [..]; signature elements: [..]

## Time and motion
- 30 fps. Every time in seconds, frame = f(t) = round(t × 30) (`engine/src/motion.mjs`). Never hard-code frame counts.
- Every animated property is a function of timeline time: one paused GSAP timeline per scene (`window.__timelines["s<scene id>"]`), `fromTo` tweens with the kit's ease-out (`HR.EASE`) or `HR.drive`. No CSS transitions or keyframe animations, `Date`, `Math.random` or timers.
- Custom motion per video (default): new per-beat scenes in `reels/<id>/compositions/`, invented from the reference reels, built on the kit `HR` (the engine's `engine/kit/kit.js`). Beats time from `reels/<id>/words.json` (`npm run words -- <id>`) via `HR.at()`; never guessed. Each beat finishes before the next. Never the template's infographic slides unless the project chose the template look (a Remotion studio; timing then comes from `src/plan.ts`).
- Safe area: text inside x 80–1000 and above y 1500.

## Sound
- Voiceover -16 LUFS / -3 dBTP via `npm run vo`. Sound effects synthesised (`npm run sfx`) or licence noted. Music synthesised (`npm run music`) or licence noted, ducked under the voice. Final mix -16 to -17 LUFS, true peak ≤ -0.5 dBTP (printed by `npm run render`; `npm run loudness -- out/<id>-mix.wav`).

## Evidence
- Every number on screen has its source line; hypotheticals carry "[Illustration | Ilustrasi]"; end card disclaimers: [exact text, or none].

## Bans
- Claims: [hard rules from the profile]
- Words: [brand never-say list] plus generic filler ("game-changer", "unlock", "supercharge", "let's dive in", "seamless", "cutting-edge", …)
- Visuals: [brand dislikes], stock photos, emoji decoration
- Sound: meme sound effects, sounds lifted from songs, films, cartoons or games, unlicensed music
- Files: recordings (`public/vo/`) and music (`public/music/`) are never committed to a public repository
