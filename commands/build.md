---
name: build
description: Turn the approved script into new, custom motion design in the brand's HyperFrames studio, invented from the user's reference reels — one prototype scene for approval first, then every scene, timed on the spoken words at 30 fps (frame = f(t))
allowed-tools: Read, Write, Edit, Bash, Glob, Agent
---

# HKR-6 — Build

**Mission:** From the approved script to a video that looks like nothing the template has made before. Every video gets **its own motion design, invented per beat from the user's reference reels**, never the template's infographic-slide look (cards stacked top-left, header and logo on every scene, one layout held for 10–17 s). Read `<project>/CLAUDE_<CODE>.md` first and follow it. Follow the `hookreel-rules` skill (section **Custom motion**: the creative mandate, the dropped style rules and the rules that stay; section **Renderer: HyperFrames**: the scene contract and the kit) and the `hyperframes` skill (composition contract). The mandate, the motion library and the font library are the same for every brand. The only brand-specific visual is a 3D character: opt-in per brand, from that brand's own character sheet; character images of a real person never go into a public repository.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

The studio is **tooling** plus one HyperFrames project per video: voiceover prep (`npm run vo`, `npm run tts`), word times (`npm run words`), sound effect synthesis (`npm run sfx`), the assembler (`npm run assemble`), checks, sheets and render. The template look (data-driven infographic slides, `videos/<id>.json` visuals, `plan.ts`, the visual catalog) lives only in the legacy Remotion template (`template-remotion/`) and is used only when the user explicitly asks for it.

## Step 0 — Gate

Stop unless `04-script.md` starts with `Status: approved`. A storyboard is not required; if one was approved, use it as a plan, not as a layout to copy.

## Step 1 — Studio project

One studio per brand: `hookreel-studio/<brand-slug>/` in the working directory. Requirements: Node 22.18+, FFmpeg and FFprobe on `PATH` (Windows: `winget install --id Gyan.FFmpeg -e`); HyperFrames fetches its own Chrome (`npx hyperframes doctor` checks all three).

- **Does not exist:** copy `${CLAUDE_PLUGIN_ROOT}/template` (all files, including dotfiles) into it and run `npm install` there. The install generates the sound effects.
- **Exists, with `kit/kit.js`** (a HyperFrames studio, 0.18.0 or later): keep it. Never overwrite files the user may have edited (`kit/`, `scripts/`, `reels/`); only add plugin scripts and `package.json` scripts that are missing.
- **Exists, without `kit/kit.js`:** a Remotion studio made before 0.18.0; its videos in `src/proto/` keep working with its own Remotion tooling. Leave it as it is for those videos. A new video goes in a new HyperFrames studio beside it, `hookreel-studio/<brand-slug>-hf/` (copy `template/` and `npm install` as above). Mixing the two in one folder breaks both, because their scripts share names and paths. Copy across what the brand already owns: `brand.json`, `public/brand/`, `public/sfx/lib/`, licensed tracks in `public/music/` and `.env.local`. Copy the studio's `CLAUDE.md` and its `CLAUDE_<CODE>.md` files too. Only on the user's request, and with their yes, does the old studio keep being used for new videos (Remotion steps per `${CLAUDE_PLUGIN_ROOT}/template-remotion/README.md`).

## Step 2 — Release the script

- `brand.json`: colours and logo from the context profile, 6-digit hex (if the studio already has a different `brand.json` for the same brand, show the difference and ask before replacing it). Custom scenes use the kit's font library and take their colours from here.
- `videos/<id>.json`: one scene per script scene (`id` like `01-hook`) with its `vo` copied exactly, and `language`. This file drives `npm run check`, `npm run vo`, `npm run tts`, `npm run words` and the scene order of `npm run assemble`.
- `videos/<id>.json` → `cta`: write `"cta": { "keyword": "PROSPER", "reward": "RIPLAY" }` — the keyword viewers type and what they get back, copied from the approved script. `npm run retention` reads it to fail a video whose ask lands after 55 % of the runtime or whose reward never reaches the screen; without the block those two checks only warn. Order the scenes so the ask lands early: on a real reel the ask at 88 % reached about 8 % of viewers.
- Logo in `public/brand/` if the video uses it. Music: synthesised music is made after the word times (Step 4); a licensed track is normalised into the project and named in `videos/<id>.json` as `"music": "music/<name>.wav"`:

```bash
ffmpeg -y -i "<track>" -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 public/music/<name>.wav
```

Run `npm run check` and fix every error.

**Private library:** if `hookreel-library/LIBRARY.md` exists in the working directory, install its sound effects into the studio with `npm run lib-sfx -- "<working dir>/hookreel-library/<pack>/sfx"` (or the command `LIBRARY.md` gives) when `public/sfx/lib/` is missing or older than the library, and add the library's licence line to `CLAUDE_<CODE>.md` under sound.

## Step 3 — Study the references

**First read `references/motion-library.md` of the `hookreel-rules` skill in full** (the core reference moves, the Instagram motion library, the transition set, the font library, shot sizes (F), the style brief menus (G) and the not-a-slide checks (H)). It is the same for every brand. If `hookreel-library/LIBRARY.md` exists, read it too: its templates are references like the reels (timing, easing, where the sounds land), never layouts to render, and its sound effects (`lib/<name>`) can be picked per beat. Then the user's reference reels for this video, which are the source of the look. Find them in `CLAUDE_<CODE>.md` (brief question 16); if none are listed, ask for them before designing anything (screen recordings or files of reels they like; links are fine if you can open them). Look at **all** of them, not just one:

```bash
npm run refcuts -- "<reference>"
```

It measures the cut rhythm (shots, cuts per 10 s, median and longest shot; done in Node, so no ffmpeg scene-detect filter is needed) and saves one frame per shot in `out/refs/<name>/`. Look at those frames. A slow wipe can hide a cut and a flash can add one, so read the numbers against the frames. Write the median shot length into `06-motion-<id>.md` as the pacing target.

Write down what the reels and the library share and what each does that the others do not: pacing (how long one idea stays), type (sizes, weights, the italic or serif word), background (paper, grain, glow, colour per scene), transitions (wipes, circle reveals, push), props (receipts, stamps, calendars, toggles, notifications, chat boxes, dials, counters, progress rings), and how elements enter, act and leave. Never copy their assets, brands or sounds.

Then write `<project>/06-motion-<id>.md`. It opens with the **style brief** (menus in motion library G), one line each: background motion (G1), background surface with 2+ layers (G2), object render family (G3), signature move, opener for the first 3 s (G4), closing (G5), the way several points are shown if the voice lists any (G6), the punctuation style, and the **special moment** (which beat gets the most expensive effect, once). Read the `style.json` of the brand's last 3 videos in `reels/*/` (and `src/proto/*/` in an older studio) and differ from each in at least 4 of the 6 lines. Then one block per beat (about every 1.5–3 s of speech): the spoken words, the register (threat → photoreal, screen → real screenshot, concept → drawn; see `hookreel-rules` → Custom motion), the one idea on screen and its on-screen text (at most two tiers, up to 6 words a line), the shot size (wide, medium or close; never three in a row the same), the things the voice names and where each appears, the library move or reel it starts from and how this version differs, the props and how they move, the transition out, and the sound. **Always fresh** (mandatory): a new idea per beat, never a previous video's scene design reused as it is. Read the `moves.json` of the brand's last 3 videos and do not repeat their moves or transitions; inside this video no move and no transition twice. Plan one background or camera change per 5 s of speech or less (pick from the transition set in the motion library). Propose bold ideas; the user can pull them back.

Then write `reels/<id>/style.json` (`{ "background", "surface": [2+ layers], "render", "signature", "opener", "closing" }`) and `reels/<id>/moves.json` (format in Step 4) from this plan and run `npm run fresh -- <id>` and `npm run retention -- <id>` on them **before coding any scene** (with `--estimate` word times, before the recording); fix the plan until it passes, so freshness and hold failures never surface only after the build.

## Step 4 — Prototype one scene (approval gate)

Build the hook scene first, in `reels/<id>/`:

1. Word times: `npm run words -- <id>` after recording, or `npm run words -- <id> --estimate` before (2.1 words per second; rerun after `/hookreel:voice`). Writes `reels/<id>/words.json`.
2. One file per scene, `reels/<id>/compositions/<scene id>.html`, written by hand. The contract (`hookreel-rules` → Renderer, `hyperframes` skill): everything inside `<template>`; the root `<div id="root" data-composition-id="s<scene id>" data-width="1080" data-height="1920">`, styled as `#root`; every element id prefixed per scene (`#hook-…`); one paused GSAP timeline registered as `window.__timelines["s<scene id>"]`; `fromTo`, never `from`; no `Date`, `Math.random` or timers. Sound effects are clips in the scene: `<audio id="hook-sfx-1" class="clip" data-start="<scene second>" data-volume="0.5" src="assets/sfx/<name>.wav">`; images and other files are named `assets/<path>` and copied from `public/<path>` by assemble. The scenes use the kit `HR` (`kit/kit.js`): `HR.at(scene, word, n)` for "when is this word spoken" (scene seconds, throws on a typo), `HR.secs`, `HR.life(tl, sel, at, until)` for slow-in, fast-out elements, `HR.word` (focus-in), `HR.spr(tl, sel, at, vars, preset)` for motion with mass (presets `snappy`, `default`, `heavy`, `playful` in `HR.SPRING`: pick by the element's weight instead of tuning an easing per scene), `HR.drive(tl, a, b, fn)` for values that must be a pure function of t, `HR.camera` with `HR.SHOT` and `HR.frameOn` for shot sizes (the world inside, labels and source lines outside), `HR.shake`, `HR.squash`, `HR.grain` (a `.hr-grain` layer) and `HR.transition` (`circle`, `flood` with `o.cover`, `swipe`, `zoom`, `mask`, `object` with `o.shape`); and the CSS of `kit/kit.css`: the font library (`var(--display)` Open Sans 800, `var(--sans)` Rubik, `var(--serif)` Instrument Serif italic; the same for every brand; classes `hr-display`, `hr-sans`, `hr-serif`), `hr-fill`, `hr-source` (a source line on its backing). Kinetic captions, if wanted, come from the HyperFrames captions registry (`/hyperframes-registry`), styled into the motion. Everything else (props, layouts) is written new for this video.
3. `reels/<id>/moves.json`, the freshness log: one entry per beat, `{ "scene", "at" (scene seconds), "move", "transition" (only where the background or camera changes), "until" (required: scene second the beat's hero leaves the screen), "shot" (required: `wide`, `medium` or `close`), "text" (required: the on-screen text, one string per tier, `[]` for none; source lines, labels, disclaimers and text inside a mockup are left out), "special" (`true` on the one special beat), "sfx" (required: the sound on that beat, a file name in `public/sfx/` without `.wav`, or `"none"`; every transition needs a real one) }`, named in plain words ("counter assembled from dots", "colour flood"). Keep it in step with the scenes; `npm run fresh -- <id>` and `npm run retention -- <id>` check it.
4. Music (if the brief chose synthesised music): `npm run music -- <id> --mood <mood>` writes `public/music/<id>-synth.wav` (about -14 LUFS, the length of the video, a riser into the last scene); name it in `videos/<id>.json` as `"music": "music/<id>-synth.wav"`. `npm run assemble` ducks it under the voice. Rerun it whenever the word times change.
5. Give every other scene a minimal placeholder composition (the same contract, a plain background, an empty paused timeline) so the reel assembles, then render a draft and check it:

```bash
npm run assemble -- <id>
npm run hf -- check reels/<id> --json
npm run render -- <id> --draft
ffmpeg -y -loglevel error -i out/<id>-draft.mp4 -t <hook seconds> -c:v libx264 -crf 18 -c:a aac out/<id>-proto.mp4
```

Fix every `check` error before rendering. `<hook seconds>` is the hook scene's length (`HR.secs`: its speech plus 1 s of lead-in and tail). Send `out/<id>-proto.mp4` (or the whole draft, saying only scene 1 is real). Ask for approval or changes. **Build no other scene until the user approves the prototype**; this is where the look is decided. Record the approval (date, file) in `CLAUDE_<CODE>.md` under **Prototype approved on**.

## Step 5 — Every scene

Build the remaining scenes in the approved look, replacing the placeholders, with a new idea per beat (rules in `hookreel-rules` → Custom motion).

**In parallel.** When the host can run subagents, split the remaining scenes into up to four groups of neighbouring scenes and give each group to one subagent at once. Each brief holds: the video id and the scene ids it owns; the path of `06-motion-<id>.md` (its beat blocks are the spec: words, register, text, shot, move, transition, sound) and of `style.json` and `moves.json` (moves are already assigned per beat, so groups never pick the same one); the approved prototype scene file as the reference for the look (read it, never copy its layout); `kit/kit.js`, `kit/kit.css`, the scene contract and `CLAUDE_<CODE>.md` (bans, labels, disclaimers); and the rule that it writes only `compositions/<its scene ids>.html`, never `index.html`, `assets/`, `moves.json` or another scene, and reports anything it needs in `public/` or the kit instead of adding it. When all are back: add what they asked for, run `npm run assemble -- <id>`, then Step 6 on the whole video. Without subagents, build the scenes one after another.

The binding rules hold in every scene:

- Every number on screen has its source line (`.hr-source`, wording from `02-facts.md`); hypothetical amounts and examples carry the illustration label from `CLAUDE_<CODE>.md` (for example "Ilustrasi" / "Illustration").
- Only allowed claims; required disclaimers on the end card; every ban in `CLAUDE_<CODE>.md`.
- Sound effects synthesised (`npm run sfx`) or with a licence note; no meme or lifted sounds.

## Step 6 — Validate and look

`npm run assemble -- <id>`, then `npm run hf -- check reels/<id> --json` (lint, runtime and layout: fix every error, weigh every warning), `npm run fresh -- <id>` and `npm run retention -- <id>` (dead air over 1.2 s, first beat after 1 s, a beat or transition without its sound, a scene with no sound, stretched `<img>`); fix every error. Check every text colour pair the new scenes use with `npm run contrast` (4.5:1 below 84 px, 3:1 above), all of them before the first full render: list each text colour and the surface it sits on (stage, prop face, card, chip) from the scene code. Then `npm run sweep -- <id>` (`out/<id>-sweep.png`: 6 frames per scene on one image, safe area in red) and read it with the taste check of motion library H (could this frame be a corporate slide? does the eye know where to look in 0.2 s? is the background alive but quiet with the text hidden? does the camera move at each change?): one idea per screen, the shot size changing as planned, no background or camera held longer than about 5 s, nothing clipped or overlapping, text inside x 80–1000 and above y 1500 (the platform UI covers the bottom and right edge), every source line and label readable, each beat's animation finished before the next starts. Fix and repeat until clean.

## Step 7 — Studio CLAUDE files

The studio is shared by every project of this brand, so its rules are split by project code:

- **`hookreel-studio/<brand-slug>/CLAUDE_<CODE>.md`**: written from `${CLAUDE_PLUGIN_ROOT}/claude-md/brand.md`, filled from the project's `CLAUDE_<CODE>.md` (fixed rules and bans), plus a **This project** section: the code, the project folder, its video ids (`<CODE>-…`) and their folders `reels/<id>/`, and the bans that apply only to those videos.
- **`hookreel-studio/<brand-slug>/CLAUDE.md`**: the index Claude Code loads automatically. Create it if missing with a one-line title, then keep one import line per project, never removing older ones:

```text
# <Brand> studio
Each project's rules live in its coded file; all are imported so they load automatically.
@CLAUDE_HKR-261012-7QF3.md
@CLAUDE_<CODE>.md
```

If a brand-level ban appears in a new project, add it to that project's coded file; never edit or delete another project's file.

Update `<project>/project.json` (`stages.build`, `studio`) and the Status column in `hookreel-output/PROJECTS.md`.

## Step 8 — Motion prompt (only when asked)

Skip unless the user asks for a standalone prompt to rebuild the video elsewhere. Then write `<project>/06-motion-prompt.md` for HyperFrames (HTML + GSAP): the time model (`fps = 30`, `frame = f(t) = round(t × 30)`, one paused GSAP timeline per scene seeked by the renderer, `fromTo` tweens with ease-out `power4.out` ≈ cubic-bezier(0.16, 1, 0.3, 1), every value a pure function of timeline time, no CSS transitions, `Date`, `Math.random` or timers), the composition contract (scene files in `<template>`, scene root and host ids, element ids prefixed per scene), format 1080×1920 and the platform UI zones, brand tokens and the three fonts, per beat the spoken words with their times and every element's movement (`t (s) | F | element | property: from → to | D (s) | sound`), the audio (voiceover lead-in 0.27 s, loudness targets, each sound with its time and `data-volume`), and the bans from `CLAUDE_<CODE>.md`.

## Step 9 — Hand over

Start the preview with `npm run dev -- reels/<id>` (HyperFrames Studio), or use the host's preview tool. The HyperFrames desktop app (`npx hyperframes open`) is optional.

End: go straight on to `/hookreel:produce <id>` in the same session (the rest of the scenes, voice, checks, critique loop, render, QA, cover and caption in one run), or `/hookreel:voice` and `/hookreel:qa` one at a time. With a human voiceover not yet recorded, end with: "Play `reels/<id>` in the HyperFrames preview. Once the take is recorded, send its path (/hookreel:produce <id> <recording>)." If the context runs low, continue later with /hookreel:resume <CODE>.
