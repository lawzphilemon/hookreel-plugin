---
name: build
description: Turn the confirmed script into a Remotion studio project (brand.json from the context profile, one videos/<id>.json per video), validate it, check every scene visually, and write a standalone Remotion prompt
allowed-tools: Read, Write, Edit, Bash, Glob
---

# HKR-5 — Build

**Mission:** From the confirmed script to a video you can play in Remotion Studio. Requires confirmed `04-script.md`. Follow the `hookreel-rules` skill.

## Step 1 — Studio project

One studio per brand: `hookreel-studio/<brand-slug>/` in the working directory.

- **Does not exist:** copy the template from `${CLAUDE_PLUGIN_ROOT}/template` (all files, including dotfiles) into it, then run `npm install` there. Node 20+ is required. The install also generates the sound effects and registers the videos.
- **Exists:** keep it. Never overwrite files the user may have edited (`src/`, `scripts/`); only add or update `brand.json`, `videos/*.json` and assets.

## Step 2 — brand.json

Write `brand.json` from the context profile (or the brief's brand block), following `src/schema.ts`:
- Map the brand palette to the semantic tokens: `bg` is the brand's main background (dark or light), `text`/`muted` are readable on it, `surface` and `track` are one and two steps off `bg`, `accent` is the single highlight colour with `onAccent` readable on it, `panel*` are the light UI mockup colours, `error`/`errorText` for broken states. All colours as 6-digit hex.
- Fonts: the brand's typeface as a Google Fonts family name; a monospace family for code. If the brand font is not on Google Fonts, pick the closest Google font and say so.
- Logo: copy the file into `public/brand/` and set `logo`. For a one-colour logo on a contrasting background use `logoTreatment` `"white"` or `"black"`. No file: `null` (the brand name is shown as text).

## Step 3 — videos/<id>.json

One file per video from `04-script.md`, following `src/schema.ts`. `${CLAUDE_PLUGIN_ROOT}/reference/all-visuals.json` shows every visual type in use, and `${CLAUDE_PLUGIN_ROOT}/examples/` has a complete brand and video.
- `vo` copied exactly from the script. Cues copied exactly from `vo`.
- `cta` from the brief; the last scene is usually a `cta` visual.
- `audio.sfx` from the brief. `language` from the brief (it picks the transcription model).
- `audio.music`: if the brief has a track, normalise it into the project (the source may be very loud) and reference the result:

```bash
npx remotion ffmpeg -y -i "<track>" -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 public/music/<name>.wav
```

## Step 4 — Validate

In the studio folder run `npm run check` (cues, colours, files) and `npx tsc --noEmit`. Fix every error, usually a cue that does not match the line exactly.

## Step 5 — Look at every scene

Render one still near the end of each scene (scene length before recording ≈ 8 + words ÷ 2.5 × 30 + 22 frames):

```bash
npx remotion still <id> out/stills/<id>-<frame>.png --frame=<frame> --scale=0.5
```

Read the stills. Content must end above the caption zone (about y = 1300 of 1920; y = 650 in the half-scale still), nothing may overlap, and numbers must show their source. Fix by shortening text, lowering a headline size, or splitting a crowded scene. Repeat until clean.

## Step 6 — Standalone prompt

Write `hookreel-output/<slug>/05-remotion-prompt.md`: a self-contained prompt that would let someone rebuild the video in any Remotion project. It includes format and safe area, brand tokens, motion rules, each scene's voiceover, visual, cues and sources, the audio plan, and the dislikes from the brief. Useful for custom scenes the catalog does not cover.

## Step 7 — Hand over

Start the studio (`npm run dev` in the studio folder, or the host's preview tool), tell the user which compositions exist, and give the estimated length per video.

End: "Play it in Studio. When the voiceover is recorded, run /hookreel:voice."
