---
name: voice
description: Put a voiceover into a video — an ElevenLabs take with exact character times (no Whisper), or a recording normalised, transcribed and cut at the pauses — re-time every beat on the spoken words (character-aligned), then check the mix loudness and peaks
allowed-tools: Read, Write, Bash
---

# HKR-7 — Voice

**Mission:** One recorded take per video in, word-synced scenes and a clean mix out. Run inside `hookreel-studio/<brand-slug>/`. Read the project's `<project>/CLAUDE_<CODE>.md` and the studio's `CLAUDE_<CODE>.md` first. Follow the `hookreel-rules` skill.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Which video is this?

If the user did not say, identify the take: transcribe it once (the `vo` script prints what it heard) or ask. Copy the file into `out/` so the original stays untouched.

### TTS instead of a recording (a voice clone)

When the user chooses a synthetic voice (for example their own ElevenLabs voice clone) over recording:

**ElevenLabs with an API key (the fast path).** `ELEVENLABS_API_KEY` in the studio's `.env.local` (ask the user to put it there; never in code, `videos/` or chat), the voice in `videos/<id>.json` → `"tts": { "voice": "<voice id>", "model": "eleven_multilingual_v2", "settings": { … } }` or `ELEVENLABS_VOICE_ID` in `.env.local`. For every number, date, amount or short form, add the scene's `say`: the `vo` with `{shown|spoken}` spans from the pronunciation table in `04-script.md`, e.g. `"say": "Premi mulai {USD 2.500|dua ribu lima ratus dolar} per tahun."` (`npm run check` fails when `say` does not read as the `vo` once each span is replaced by its shown text). Then:

```bash
npm run tts -- <id> --dry
npm run tts -- <id>
npm run words -- <id>
```

`--dry` prints the text and its character count and spends nothing. The real run asks for the whole video as one take (one delivery) with a time for every character, levels it like a recording, cuts every scene at the middle of the silence between scenes, and writes `public/vo/<id>/` with exact word times: no Whisper, no pause detection, no ranges. Each shown form becomes the word in `words.json`, so a cue on "USD 2.500" lands where it is spoken. The take and its times are cached in `out/<id>-tts.*`; a rerun of an unchanged script costs no credits. The pace gate runs as in Step 2. Go on with Step 2's re-time check and music, then Step 4.

**Any other TTS (no API key, or another tool):** generate one take per video and treat it like a recording from Step 2 on:
- **Prompt:** the approved lines in order, unchanged, with the spoken forms from the pronunciation table in `04-script.md`: numbers, dates and amounts written as words ("dua puluh lima ribu dolar", not "USD 25.000"), acronyms spelled the way they should be heard. Put `[pause]` (or the model's own break tag) between scenes: pause detection then cuts every scene without ranges.
- **Expect expansions:** TTS reads short forms in full ("AS" → "Amerika Serikat"). Write the form you want heard in the prompt; if the audio still differs from the script, keep the meaning, set `vo` in `videos/<id>.json` to what is said (so cues and word times match) and keep the on-screen text from the script. Record the change in `DECISIONS.md`.
- **Pace:** TTS can read slower than the 2.1 words a second estimate (1.9–2.15 measured): check the length against the target before syncing, then `npm run trim` or the model's speed setting (about 1.1), with the user's OK since both change the voice.
- **Files:** a restricted connector may generate the audio but expose no download; ask the user to save each take (MP3 or WAV) and give you the paths. Log the tool, voice and model in `CLAUDE_<CODE>.md` (voice ids stay in the project, never in a public repository).
- **Label:** a cloned or synthetic voice is AI-generated: the post carries the platform's AI label (Instagram "AI info", TikTok "AI-generated"), noted in `CLAUDE_<CODE>.md` for `/hookreel:qa` and `/hookreel:publish`. Clone only a voice the user owns or has written permission for.

## Step 2 — Cut and sync

If the video runs long or the take sounds loose, cap its pauses first; no retake needed:

```bash
npm run trim -- "<recording>" 0.3
```

It writes `out/<name>-trimmed.wav` (every pause inside the take capped at 0.3 s, 10 ms crossfades; lead-in and tail left to `npm run vo`) and warns on a cut that lands near speech: listen there. Use the trimmed file below. Not below 0.18 s, where speech sounds clipped. Never speed the voice up to hit a length. Then:

```bash
npm run vo -- <video id> "<recording>"
```

It upmixes a mono take to stereo and normalises it (-16 LUFS as heard in the stereo mix, peaks at -3 dBTP; a mono clip levelled on its own measured about 3 dB louder in the mix), transcribes it locally with Whisper (English model for `language: "en"`, multilingual otherwise; the first run downloads the model), cuts each scene at the pause nearest its boundary, and writes `public/vo/<id>/<scene>.wav` plus `<scene>.words.json`, and `out/<id>-take.json` (the full take's words in absolute seconds, a JSON array of `{ text, start, end }`; a rerun with ranges keeps it).

Read the printed `heard:` line for every scene against its script line:
- A line split across two clips, or words missing at a clip edge: check the pauses around that boundary and rerun with explicit ranges in seconds, `npm run vo -- <id> "<recording>" "1.7-6.9,7.7-14.0,…"`. Pick the ranges from `out/<id>-take.json` (the full take's words in absolute seconds, saved by the first run). A clip flagged as over 2× its estimate usually holds a retake or false starts: cut around them the same way.
- Misheard words ("Google Tech Manager") are fine: transcripts only drive timing; captions use the script.
- The speaker changed a line: either update `vo` in `videos/<id>.json` (and any cue that no longer matches), or ask for a retake of that line.

Then write the word times the custom scenes run on:

```bash
npm run words -- <id>
```

It aligns each script word to the Whisper fragments character by character (so "K" + "laim" still gives "Klaim" its time, and "900 juta rupiah" still finds "Rp900 juta") and writes `reels/<id>/words.json`, replacing any `--estimate` version. Read the printed times against the recording for the beat words; every scene re-times itself through `HR.at()` once `npm run assemble -- <id>` has written the new words and voice clips into the reel. Then check each beat still has time to finish its animation before the next one (scenes may now be shorter or longer than estimated) and adjust the scenes that are too tight. If the video uses synthesised music, make it again so its length and riser follow the recording: `npm run music -- <id> --mood <mood>`.

## Step 3 — Storyboard as recorded (only if a storyboard was made)

Skip unless the project has an approved `05-storyboard-<id>.md` (template look, in a Remotion studio from `template-remotion/`). Regenerate it from the recording, so it is exact to the frame:

```bash
npm run storyboard -- <id>
```

The director's layer is merged in from `director/<id>.json`. Copy `storyboard/<id>.md` to `<project>/05-storyboard-<id>.recorded.md`. Report how much each scene moved against the plan (start and length in seconds) from a diff against the approved storyboard, not by reading both files whole. On a re-cut of the same take, compare with the previous recorded storyboard the same way. If a scene now runs long enough to push content past its fade-out, or a cue lands on the wrong word, fix it before going on.

## Step 4 — Mix check

There is no separate audio render: the mix is measured from the video render, which takes minutes.

```bash
npm run render -- <id> --draft
```

It assembles the reel (voice clips at `data-volume` 0.8, music ducked under the voice), renders, writes `out/<id>-mix.wav` and prints its integrated loudness and true peak (BS.1770, measured in plain Node; `npm run loudness -- <file.wav>` measures any WAV). For a template-look video in a Remotion studio, use that studio's own audio render (`template-remotion/README.md`).

Update `<project>/project.json` (`stages.voice.<id>`), `PROJECTS.md`, and, when a human recorded, the Status table in `<project>/VOICEOVER_<CODE>.md` (recorded, date, file).

Targets: integrated about -16 to -17 LUFS, true peak at or below -0.5 dBTP. If the mix is too loud or too quiet, adjust `data-volume` (the voice clips' gain is `VO_GAIN` in `scripts/assemble.mjs`, sound effects on their `<audio>` in the scene) rather than re-levelling the clips, then render again. If the peak is higher, find when it happens (scan the WAV samples) and lower the sound effect or music level at that moment rather than the voice. Inside `/hookreel:make` or `/hookreel:produce` these checks run automatically and the user hears the mix in the final preview; there is no separate listening stop.

End: go straight on to `/hookreel:qa`. Run alone, send the mix file and end with: "Mix checked. Next: /hookreel:qa."
