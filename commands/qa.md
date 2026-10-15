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

1. **Layout:** a half-scale still at the end of every beat of `<id>-motion` (`npx remotion still <id>-motion out/stills/<id>-<frame>.png --frame=<frame> --scale=0.5 --log=error`); one idea per screen, text inside x 80–1000 and above y 1500, nothing clipped or overlapping, every beat's animation finished before the next starts.
2. **Sync:** `src/proto/<id>/words.json` comes from the recording (`npm run words -- <id>`, not `--estimate`); every beat lands on its spoken word (allow about 0.15 s); the render's length matches the sum of the scene lengths.
3. **Sources and labels:** every number on screen has its source label, matching `02-facts.md`; every hypothetical amount or example carries the illustration label (for example "Ilustrasi"); the required disclaimers are on the end card.
4. **Stale facts:** if `02-facts.md` lists claims that go stale and the check date is older than about 30 days, recheck them before rendering.
5. **Audio:** `npx remotion render <id>-motion out/<id>-mix.wav --codec=wav --log=error`, then `npm run loudness -- out/<id>-mix.wav`: true peak at or below -0.5 dBTP, integrated about -16 to -17 LUFS; voice clearly above the music everywhere; every sound effect synthesised or with a commercial licence note (no meme or lifted sounds).
6. **Licences:** music source and licence noted; credit line ready if required. Recordings and licensed tracks are not committed to a public repository. AI-generated characters or scenes: the tool is noted in `credit`, its terms allow commercial use, and the post will carry the platform's AI label (Instagram "AI info", TikTok "AI-generated") when the platform requires it.
7. **Rules:** every ban in `CLAUDE_<CODE>.md` checked one by one (claims, words, visuals, sound); fixed rules respected (60 fps, frame = f(t), every value a function of the frame, safe area).
8. **Look:** the video is the custom motion approved at the prototype, not the template's infographic slides (unless the user asked for the template look).

Fix what fails before rendering.

## Step 2 — Render

```bash
npx remotion render <id>-motion out/<id>.mp4 --log=error
```

(For a template-look video: `npm run render -- <id> out/<id>.mp4`.)

## Step 3 — Report

Save the checklist with its evidence as `<project>/07-qa-<id>.md`. Update `<project>/project.json` (`stages.qa.<id>`) and `PROJECTS.md`. The file is `out/<id>.mp4`, so the project code is in its name.

Send the user the MP4.

End: "Watch it once more. When it is right, start a new session for the cover and the caption: /hookreel:resume <CODE>, then /hookreel:publish."
