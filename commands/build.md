---
name: build
description: Release the approved draft into the brand's Remotion studio (brand.json, videos/<id>.json, the studio CLAUDE_<CODE>.md), validate, check every scene visually; on request, write a standalone Remotion prompt built on frame = f(t) at 60 fps
allowed-tools: Read, Write, Edit, Bash, Glob
---

# HKR-6 — Build

**Mission:** From the approved storyboard to a video you can play in Remotion Studio. Read `<project>/CLAUDE_<CODE>.md` first and follow it. Follow the `hookreel-rules` skill.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 0 — Gates

Stop and say which one is missing unless **both** are true:
- `04-script.md` starts with `Status: approved`.
- Every `05-storyboard-<id>.md` starts with `Status: approved`.

If the draft JSON changed after the storyboard was approved, regenerate the storyboard and get it approved again first.

## Step 1 — Studio project

One studio per brand: `hookreel-studio/<brand-slug>/` in the working directory.

- **Does not exist:** copy `${CLAUDE_PLUGIN_ROOT}/template` (all files, including dotfiles) into it and run `npm install` there (Node 22.18+). The install generates the sound effects and registers the videos.
- **Exists:** keep it. Never overwrite files the user may have edited (`src/`, `scripts/`); only add or update `brand.json`, `videos/*.json`, assets, `CLAUDE_<CODE>.md` and the import lines in `CLAUDE.md`.

## Step 2 — Release the draft

- Copy `<project>/draft/brand.json` to the studio's `brand.json` (if the studio already has a different `brand.json` for the same brand, show the difference and ask before replacing it).
- Copy each approved `draft/videos/<id>.json` to the studio's `videos/`, and `draft/director/<id>.json` to the studio's `director/` (the storyboard's director layer, merged in by `npm run storyboard`).
- Music in a music folder shared by the brand is fine; recordings stay per video in `public/vo/<id>/` (the id carries the project code).
- Logo: copy the file into `public/brand/` and make sure `logo` points to it.
- Characters (any `character` visual, usually with `brand.style: "playful"`): the images or clips come from the user. If they are not made yet, write `<project>/characters.md` first: one character sheet description (body, colours, face, outfit, art style, e.g. "glossy 3D cartoon, soft studio light, Pixar-like"), then one prompt per file with pose, expression and background (transparent or plain for `card`, a full 9:16 scene for `full`), so every image shows the same character. The user generates them in the AI tool they have the rights to use and drops them into `public/characters/`. Note the tool in each visual's `credit`. `npm run check` fails until every file exists.
- Music (if any): normalise it into the project and point `audio.music.src` at the result:

```bash
npx remotion ffmpeg -y -i "<track>" -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 public/music/<name>.wav
```

## Step 3 — Studio CLAUDE files

The studio is shared by every project of this brand, so its rules are split by project code:

- **`hookreel-studio/<brand-slug>/CLAUDE_<CODE>.md`**: written from `${CLAUDE_PLUGIN_ROOT}/claude-md/brand.md`, filled from the project's `CLAUDE_<CODE>.md` (fixed rules and bans), plus a **This project** section: the code, the project folder, its video ids (`<CODE>-…`), and the bans that apply only to those videos.
- **`hookreel-studio/<brand-slug>/CLAUDE.md`**: the index Claude Code loads automatically. Create it if missing with a one-line title, then keep one import line per project, never removing older ones:

```text
# <Brand> studio
Each project's rules live in its coded file; all are imported so they load automatically.
@CLAUDE_HKR-261012-7QF3.md
@CLAUDE_<CODE>.md
```

If a brand-level ban appears in a new project, add it to that project's coded file; never edit or delete another project's file.

Update `<project>/project.json` (`stages.build`, `studio`) and the Status column in `hookreel-output/PROJECTS.md`.

## Step 4 — Validate and look

In the studio: `npm run check` and `npx tsc --noEmit`; fix every error. Then render the contact sheet, every scene 0.5 s before its end on one image:

```bash
npx remotion still <id>-sheet out/stills/<id>-sheet.png --log=error
```

Read it against each scene's Composition block: same elements, same order, inside y 330–1300 (y 165–650 in the half-scale still), nothing overlapping, sources visible. For a scene that looks wrong, render that frame alone (`npx remotion still <id> out/stills/<id>-<frame>.png --frame=<frame> --scale=0.5`). Fix and repeat until clean. Also run `npm run storyboard -- <id>` and confirm its timeline matches the approved storyboard.

## Step 5 — Remotion prompt (only when asked)

Skip this step unless the user asks for a standalone prompt, for example to rebuild the video outside this template. The studio already holds everything needed to re-render, and the prompt costs a long write. When asked, write `<project>/06-remotion-prompt.md`, a self-contained prompt that would let any developer or model rebuild the video in a fresh Remotion project. It must state, in this order:

1. **Time model.** `fps = 60`. Every time is given in seconds `t` and converted with `frame = f(t) = round(t × 60)`. Scene-local frame `f_s = F − F_sceneStart`. No frame number is hard-coded anywhere; durations live in one constants table in seconds.
2. **Animation law.** Every animated property is a pure function of the current frame: `value(F) = from + (to − from) · ease(clamp((F − F0) / D, 0, 1))` with `ease = cubic-bezier(0.16, 1, 0.3, 1)`, implemented with `interpolate()` and clamped extrapolation. No CSS transitions, no keyframe animations, no `setTimeout`, no state that depends on wall-clock time. Style `clean`: no bounce, no overshoot, no loops. Style `playful`: entrances are a `spring()` of the frame (damping, stiffness, mass from `TIME.pop`, scale 0.6 → 1 with a small overshoot) and idle elements float with `amp · sin(2π · (F − F0) / (period · fps))`; both still pure functions of the frame.
3. **Format and safe area.** 1080×1920; header, content (y 330–1300), caption (y 1340) zones; platform UI zones to avoid.
4. **Brand tokens.** Every colour token with its hex, fonts, radius, entrance length, logo treatment.
5. **Scenes.** For each scene: its voiceover line, start and length in seconds and frames, and every event from the approved storyboard as `t (s) | F | element | property: from → to | D (s) | sound`.
6. **Audio.** Voiceover placement (lead-in 0.27 s), loudness targets, each sound effect with its time and final volume, music ducking rules.
7. **Bans.** Copied from `CLAUDE_<CODE>.md`.

## Step 6 — Hand over

Start the studio (`npm run dev`, or the host's preview tool), list the compositions with their estimated lengths, and remind the user that times become exact after recording.

End: "Play it in Studio. When the voiceover is recorded, start a new session: /hookreel:resume <CODE>, then /hookreel:voice."
