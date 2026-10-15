---
name: qa
description: Final quality gate before posting — layout, sync, sources, stale facts, audio, licences — then render the MP4
allowed-tools: Read, Write, Bash
---

# HKR-8 — QA and Render

**Mission:** Nothing ships with an overlap, an unsourced number, a stale fact or a clipped peak. Run inside `hookreel-studio/<brand-slug>/` after `/hookreel:voice`. Read the project's `CLAUDE_<CODE>.md` first; every item in its Bans section is a QA check. Follow the `hookreel-rules` skill.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Checklist

Go through every item and report pass or fail with evidence:

1. **Layout:** the contact sheet (`npx remotion still <id>-sheet out/stills/<id>-sheet.png --log=error`), every scene 0.5 s before its end, compared with the storyboard's Composition block; content ends above the caption zone; nothing overlaps; text fits its box.
2. **Sync:** `npm run align -- <id>` and the recorded storyboard; every cue lands on its word (allow about 0.3 s); the render's length in frames equals the recorded storyboard's.
3. **Sources:** every number on screen has its source label, matching `02-facts.md`.
4. **Stale facts:** if `02-facts.md` lists claims that go stale and the check date is older than about 30 days, recheck them before rendering.
5. **Audio:** true peak at or below -0.5 dBTP, integrated about -16 to -17 LUFS, voice clearly above the music everywhere.
6. **Licences:** music source and licence noted; credit line ready if required. Recordings and licensed tracks are not committed to a public repository. AI-generated characters or scenes: the tool is noted in `credit`, its terms allow commercial use, and the post will carry the platform's AI label (Instagram "AI info", TikTok "AI-generated") when the platform requires it.
7. **Rules:** every ban in `CLAUDE_<CODE>.md` checked one by one (claims, words, visuals, sound); fixed rules respected (60 fps, frame = f(t), motion, safe area).

Fix what fails before rendering.

## Step 2 — Render

```bash
npm run render -- <id> out/<id>.mp4
```

## Step 3 — Report

Save the checklist with its evidence as `<project>/07-qa-<id>.md`. Update `<project>/project.json` (`stages.qa.<id>`) and `PROJECTS.md`. The file is `out/<id>.mp4`, so the project code is in its name.

Send the user the MP4.

End: "Watch it once more. When it is right, start a new session for the cover and the caption: /hookreel:resume <CODE>, then /hookreel:publish."
