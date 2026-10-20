# Changelog

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
