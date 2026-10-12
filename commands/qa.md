---
name: qa
description: Final quality gate before posting — layout, sync, sources, stale facts, audio, licences — then render the MP4 and write the post caption
allowed-tools: Read, Write, Bash
---

# HKR-7 — QA and Render

**Mission:** Nothing ships with an overlap, an unsourced number, a stale fact or a clipped peak. Run inside `hookreel-studio/<brand-slug>/` after `/hookreel:voice`. Follow the `hookreel-rules` skill.

## Step 1 — Checklist

Go through every item and report pass or fail with evidence:

1. **Layout:** a still near the end of every scene; content ends above the caption zone; nothing overlaps; text fits its box.
2. **Sync:** `npm run align -- <id>`; every cue lands on its word (allow about 0.3 s).
3. **Sources:** every number on screen has its source label, matching `02-facts.md`.
4. **Stale facts:** if `02-facts.md` lists claims that go stale and the check date is older than about 30 days, recheck them before rendering.
5. **Audio:** true peak at or below -0.5 dBTP, integrated about -16 to -17 LUFS, voice clearly above the music everywhere.
6. **Licences:** music source and licence noted; credit line ready if required. Recordings and licensed tracks are not committed to a public repository.
7. **Brand:** no forbidden claims, voice rules respected, the brief's dislikes absent.

Fix what fails before rendering.

## Step 2 — Render

```bash
npm run render -- <id> out/<id>.mp4
```

## Step 3 — Post caption

Write the post caption in the brand voice: the hook line, two or three lines of value, the CTA exactly as in the video, the sources for the numbers shown, and the music credit if the licence requires one. Save it with the QA report as `hookreel-output/<slug>/06-qa-<id>.md`.

Send the user the MP4 and the caption.
