---
name: voice
description: Put a recorded voiceover take into a video — normalise, transcribe, cut per scene at the pauses, sync visuals and captions to the spoken words — then check the mix for clipping
allowed-tools: Read, Write, Bash
---

# HKR-7 — Voice

**Mission:** One recorded take per video in, word-synced scenes and a clean mix out. Run inside `hookreel-studio/<brand-slug>/`. Read the project's `<project>/CLAUDE_<CODE>.md` and the studio's `CLAUDE_<CODE>.md` first. Follow the `hookreel-rules` skill.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Which video is this?

If the user did not say, identify the take: transcribe it once (the `vo` script prints what it heard) or ask. Copy the file into `out/` so the original stays untouched.

## Step 2 — Cut and sync

```bash
npm run vo -- <video id> "<recording>"
```

It normalises the take (-16 LUFS, peaks at -3 dBTP), transcribes it locally with Whisper (English model for `language: "en"`, multilingual otherwise; the first run downloads the model), cuts each scene at the pause nearest its boundary, and writes `public/vo/<id>/<scene>.wav` plus `<scene>.words.json`.

Read the printed `heard:` line for every scene against its script line:
- A line split across two clips, or words missing at a clip edge: check the pauses around that boundary and rerun with explicit ranges in seconds, `npm run vo -- <id> "<recording>" "1.7-6.9,7.7-14.0,…"`.
- Misheard words ("Google Tech Manager") are fine: transcripts only drive timing; captions use the script.
- The speaker changed a line: either update `vo` in `videos/<id>.json` (and any cue that no longer matches), or ask for a retake of that line.

Then `npm run align -- <id>` and confirm the cue words land where they are spoken.

## Step 3 — Storyboard as recorded

Regenerate the storyboard from the recording, so it is exact to the frame:

```bash
npm run storyboard -- <id>
```

Copy `storyboard/<id>.md` to `<project>/05-storyboard-<id>.recorded.md`, keep the director's layer from the approved storyboard on top of each scene, and report how much each scene moved against the plan (start and length in seconds). If a scene now runs long enough to push content past its fade-out, or a cue lands on the wrong word, fix it before going on.

## Step 4 — Mix check

Render the audio alone and measure it:

```bash
npx remotion render <id> out/<id>-mix.wav --codec=wav
npx remotion ffmpeg -hide_banner -i out/<id>-mix.wav -af loudnorm=print_format=summary -f null -
```

Update `<project>/project.json` (`stages.voice.<id>`) and `PROJECTS.md`.

Targets: integrated about -16 to -17 LUFS, true peak at or below -0.5 dBTP. If the peak is higher, find when it happens (scan the WAV samples) and lower the sound effect or music level at that moment rather than the voice. Send the user the mix file to listen to.

End: "Listen to the mix. When it sounds right, run /hookreel:qa."
