---
name: voice
description: Put a recorded voiceover take into a video — normalise, transcribe, cut per scene at the pauses, re-time every beat on the spoken words (character-aligned) — then check the mix loudness and peaks
allowed-tools: Read, Write, Bash
---

# HKR-7 — Voice

**Mission:** One recorded take per video in, word-synced scenes and a clean mix out. Run inside `hookreel-studio/<brand-slug>/`. Read the project's `<project>/CLAUDE_<CODE>.md` and the studio's `CLAUDE_<CODE>.md` first. Follow the `hookreel-rules` skill.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Which video is this?

If the user did not say, identify the take: transcribe it once (the `vo` script prints what it heard) or ask. Copy the file into `out/` so the original stays untouched.

## Step 2 — Cut and sync

If the video runs long or the take sounds loose, cap its pauses first; no retake needed:

```bash
npm run trim -- "<recording>" 0.3
```

It writes `out/<name>-trimmed.wav` (every pause inside the take capped at 0.3 s, 10 ms crossfades; lead-in and tail left to `npm run vo`) and warns on a cut that lands near speech: listen there. Use the trimmed file below. Not below 0.18 s, where speech sounds clipped. Never speed the voice up to hit a length. Then:

```bash
npm run vo -- <video id> "<recording>"
```

It normalises the take (-16 LUFS, peaks at -3 dBTP), transcribes it locally with Whisper (English model for `language: "en"`, multilingual otherwise; the first run downloads the model), cuts each scene at the pause nearest its boundary, and writes `public/vo/<id>/<scene>.wav` plus `<scene>.words.json`.

Read the printed `heard:` line for every scene against its script line:
- A line split across two clips, or words missing at a clip edge: check the pauses around that boundary and rerun with explicit ranges in seconds, `npm run vo -- <id> "<recording>" "1.7-6.9,7.7-14.0,…"`.
- Misheard words ("Google Tech Manager") are fine: transcripts only drive timing; captions use the script.
- The speaker changed a line: either update `vo` in `videos/<id>.json` (and any cue that no longer matches), or ask for a retake of that line.

Then write the word times the custom scenes run on:

```bash
npm run words -- <id>
```

It aligns each script word to the Whisper fragments character by character (so "K" + "laim" still gives "Klaim" its time, and "900 juta rupiah" still finds "Rp900 juta") and writes `src/proto/<id>/words.json`, replacing any `--estimate` version. Read the printed times against the recording for the beat words; every scene re-times itself through `wordsOf()`. Then check each beat still has time to finish its animation before the next one (scenes may now be shorter or longer than estimated) and adjust the scenes that are too tight. If the video uses synthesised music, make it again so its length and riser follow the recording: `npm run music -- <id> --mood <mood>`.

## Step 3 — Storyboard as recorded (only if a storyboard was made)

Skip unless the project has an approved `05-storyboard-<id>.md`. Regenerate it from the recording, so it is exact to the frame:

```bash
npm run storyboard -- <id>
```

The director's layer is merged in from `director/<id>.json`. Copy `storyboard/<id>.md` to `<project>/05-storyboard-<id>.recorded.md`. Report how much each scene moved against the plan (start and length in seconds) from a diff against the approved storyboard, not by reading both files whole. On a re-cut of the same take, compare with the previous recorded storyboard the same way. If a scene now runs long enough to push content past its fade-out, or a cue lands on the wrong word, fix it before going on.

## Step 4 — Mix check

Render the audio alone and measure it:

```bash
npx remotion render <id>-motion out/<id>-mix.wav --codec=wav --log=error
npm run loudness -- out/<id>-mix.wav
```

(`<id>-motion` is the custom composition; use `<id>` only for a template-look video. `npm run loudness` measures BS.1770 integrated loudness and peaks in plain Node, because Remotion's ffmpeg has no ebur128 filter.)

Update `<project>/project.json` (`stages.voice.<id>`), `PROJECTS.md`, and the Status table in `<project>/VOICEOVER_<CODE>.md` (recorded, date, file).

Targets: integrated about -16 to -17 LUFS, true peak at or below -0.5 dBTP. If the peak is higher, find when it happens (scan the WAV samples) and lower the sound effect or music level at that moment rather than the voice. Send the user the mix file to listen to.

End: "Listen to the mix. When it sounds right, run /hookreel:qa."
