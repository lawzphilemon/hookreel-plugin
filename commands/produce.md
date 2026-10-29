---
name: produce
description: One unattended run after the prototype is approved — every remaining scene (built in parallel), the voice (ElevenLabs take with exact word times, or a recording), every check, the critique loop on stills until every score is 8+, the render, preview, QA report and self-critique, then the cover variants, caption and posting folder
argument-hint: "<video id> [recording]"
allowed-tools: Read, Write, Edit, Bash, Glob, Agent, Skill
---

# HKR-6+ — Produce

**Mission:** The same video as `/hookreel:build` Step 5 → `/hookreel:voice` → `/hookreel:qa` → `/hookreel:publish` give, in one run and in the same session, without waiting for the user between stages, and with the first full render as the final one. This is the last of the four stops: the user gets the preview, the covers and the caption together. Nothing a gate protects changes: the script, the claims and the approved look stay exactly as approved. Run inside `hookreel-studio/<brand>-studio/`. Read `<project>/CLAUDE_<CODE>.md` and the studio's `CLAUDE_<CODE>.md` first; follow the `hookreel-rules` skill.

Argument: $ARGUMENTS (the video id, and the path of a recording if there is one).

## Step 0 — Gates

Stop and say which is missing unless all hold:
- `04-script.md` starts with `Status: approved`.
- `CLAUDE_<CODE>.md` records **Prototype approved on** for this video.
- A voice source: a recording path in the argument, or a synthetic voice the user chose for this project (`CLAUDE_<CODE>.md` → sound) with `tts` in `videos/<id>.json` or `ELEVENLABS_VOICE_ID` in `.env.local`. With neither, build every scene on estimated word times (Step 1), then stop and ask for the recording or the voice.

Effort: if the host lets you set it, high for building scenes, medium for fix rounds.

## Step 1 — Every scene, in parallel

`/hookreel:build` Step 5 (one composition file per scene, parallel subagents), then its Step 6 checks and its Step 7 (the studio's CLAUDE files). Keep `--estimate` word times until Step 2.

## Step 2 — Voice

- **Synthetic voice:** `npm run tts -- <id> --dry` once to show the text and character count, then `npm run tts -- <id>`. Numbers and short forms go in `say` as `{shown|spoken}` spans (`/hookreel:voice` Step 1). The take is cached: an unchanged script costs no credits.
- **Recording:** `/hookreel:voice` Step 2 (`npm run trim` if the pauses are loose, `npm run vo`).

Then `npm run words -- <id>`, `npm run music -- <id> --mood <mood>` if the video has synthesised music, and re-check that every beat finishes before the next one (`npm run retention -- <id>`). A failed pace gate, a heard line that differs from the script, or a retake inside a clip: stop and ask, as `/hookreel:voice` does.

## Step 3 — Critique loop (before any full render)

`/hookreel:qa` Step 1b: sheets, scores, fixes, at most three rounds. If a criterion is still under 8 after the third round, stop: send the sheets and the scores and ask.

## Step 4 — QA and render

`/hookreel:qa` Steps 1, 2 and 3: the checklist, then `npm run render -- <id>` (it prints the mix loudness; out of range, adjust `data-volume` and render again; no listening stop, the user hears the mix in the final preview), the preview and the encoded-frame check. A fix found here simply re-renders (minutes).

## Step 5 — Self-critique

`/hookreel:qa` Step 4, with the time each step of this run took.

## Step 6 — Cover and caption

`/hookreel:publish` Steps 1–3: three cover variants rendered with their grid previews, the caption, `08-publish-<id>.md`.

**Stop and ask** only for what is the user's call: a new or changed line, claim, number or timing; a ban that cannot be met; the voice problems in Step 2; a critique that does not pass. Layout, motion and sound inside the approved script and look are the agent's call.

End: one message with the preview MP4, the cover PNGs (full and grid) and the caption from `08-publish-<id>.md`, then: "Self-critique is in 07b-critique-<id>.md. Pick a cover (or ask for fixes); the posting folder follows." When the user picks, run `/hookreel:publish` Step 4 (posting folder). A fix request re-renders (`npm run render -- <id>`) and re-sends what changed.
