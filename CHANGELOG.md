# Changelog

## 0.13.0 — 2026-10-20

Ideas from the Motion Format skill v1.0.0 (MIT, built on Bang Motion by Bang Tutorial, MIT), rewritten for Remotion and vertical reels.

- **Shot sizes.** The camera changes shot size on the beat (wide, medium, close) instead of a 1.00 → 1.06 push that reads as still. Kit: `Camera`, `SHOT`, `frameOn` (math in `src/motion.ts` `camAt`, clamped so the world's edge never shows). `moves.json` beats need `shot`; `npm run fresh` fails on three in a row at one size. UI demos move close to the tap (1.4–2.2).
- **Not a slide.** `moves.json` beats need `text` (on-screen text per tier); `npm run retention` fails on 3 tiers or a line over 6 words, warns on a full stop after a short phrase and on all caps across beats. Rules: attention order, sentence case, no template skeleton, every thing the voice names is on screen (motion library H).
- **Style brief per video.** `06-motion-<id>.md` opens with it and `src/proto/<id>/style.json` holds six lines (background motion, surface with 2+ layers, render family, signature move, opener, closing) from the new menus in motion library G; `npm run fresh` fails on a missing or flat brief and on 3 lines shared with one of the brand's last 3 videos. One `special` beat gets the most expensive effect; more than one fails.
- **Menus:** background motion (12), surfaces, object render families, the first 3 seconds, closings, several points without three tiles (motion library G).
- **Transitions:** `Transition kind="object"` (an object passes the lens, the next stage behind it), a list of transitions carried by objects, and craft rules (no stage edge showing, no preset spin or blur on every cut). Kit `life(t, at, until)`: slow, firm entrances (0.7–1.3 s) and fast exits (0.35–0.55 s).
- **One-line revisions** in `/hookreel:resume`: change only the target, shift what follows, re-render only the changed seconds, report in one sentence with numbers.
- **Taste check** (four questions) on every sweep in `/hookreel:build` and `/hookreel:qa`; grainy or gradient-heavy videos that band in the Instagram test encode render again with `--crf=12`.
- Existing studios: `/hookreel:build` Step 1 says what to copy in (the two lint scripts, the camera math, `Camera`, `life` and the object transition); older videos' `moves.json` are only compared, not failed.

## 0.12.3 — 2026-10-20

- `/hookreel:publish` Step 4: once the user picks a cover, one posting folder per project at `hookreel-output/<CODE>_<slug>/publish/` with `<id>.mp4`, `<id>-cover.png` and `<id>-caption.txt` (copies of the studio render, the chosen cover and the caption code block), recorded as `stages.publish.<id>.folder` in `project.json` and in `PROJECTS.md`. No more fetching the MP4 from the studio's `out/` and the caption from a markdown file.
- `/hookreel:resume`: the status table shows the posting folder per video.

## 0.12.2 — 2026-10-19

Patch release from the self-critique of HKR-261019-3JH5.

- `/hookreel:script`: scene ids are written `01-hook`, `02-…` (the format `npm run check` enforces), never `s01-…`.
- `npm run vo` (`prepare-vo.mjs`): saves the full-take Whisper transcript with absolute word times to `out/<id>-take.json`, so explicit ranges can be picked without a second Whisper pass.
- `npm run vo`: warns when a scene's clip is longer than 2× its script estimate (words ÷ 2.5), a sign of a retake or false starts inside it.
- `/hookreel:build` Step 3: one background or camera change per ≤ 5 s in `06-motion`; write `moves.json` from the plan and pass `npm run fresh` before coding scenes.
- `/hookreel:brief`: a screen recording of a real account is scanned frame by frame for personal data (notifications, lock screen, names, policy numbers), each recorded as a ban.
