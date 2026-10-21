---
name: build
description: Turn the approved script into new, custom motion design in the brand's Remotion studio, invented from the user's reference reels — one prototype scene for approval first, then every scene, timed on the spoken words at 30 fps (frame = f(t))
allowed-tools: Read, Write, Edit, Bash, Glob
---

# HKR-6 — Build

**Mission:** From the approved script to a video that looks like nothing the template has made before. Every video gets **its own motion design, invented per beat from the user's reference reels**, never the template's infographic-slide look (cards stacked top-left, header and logo on every scene, one layout held for 10–17 s). Read `<project>/CLAUDE_<CODE>.md` first and follow it. Follow the `hookreel-rules` skill (section **Custom motion**: the creative mandate, the dropped style rules and the rules that stay). The mandate, the motion library and the font library are the same for every brand. The only brand-specific visual is a 3D character: opt-in per brand, from that brand's own character sheet; character images of a real person never go into a public repository.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

The template is **tooling only** here: voiceover prep (`npm run vo`), word times (`npm run words`), sound effect synthesis (`npm run sfx`), loudness (`npm run loudness`) and render. Use its data-driven visuals (`videos/<id>.json` visuals, `plan.ts`, the visual catalog) only when the user explicitly asks for the template look.

## Step 0 — Gate

Stop unless `04-script.md` starts with `Status: approved`. A storyboard is not required; if one was approved, use it as a plan, not as a layout to copy.

## Step 1 — Studio project

One studio per brand: `hookreel-studio/<brand-slug>/` in the working directory.

- **Does not exist:** copy `${CLAUDE_PLUGIN_ROOT}/template` (all files, including dotfiles) into it and run `npm install` there (Node 22.18+). The install generates the sound effects and registers the videos.
- **Exists:** keep it. Never overwrite files the user may have edited (`src/`, `scripts/`); only add files. If it predates this version, copy in `src/proto/kit.tsx`, `scripts/word-times.mjs`, `loudness.mjs`, `sweep.mjs`, `fresh-check.mjs`, `contrast.mjs`, `preview.mjs` and their `package.json` scripts (`words`, `loudness`, `sweep`, `fresh`, `contrast`, `preview`) when they are missing. Studios from before 0.13.0: replace `scripts/fresh-check.mjs` and `scripts/retention.mjs` with the plugin's (tooling, not user code), add `SHOT`, `Shot`, `camAt` and `frameOn` to `src/motion.ts`, and add `Camera`, `life` and the `object` transition to `src/proto/kit.tsx` from the plugin's template without touching the rest of the user's kit. Older videos' `moves.json` need not change; the new fields are checked only on the video being built.

## Step 2 — Release the script

- `brand.json`: colours, fonts (used by the template look; custom scenes use the kit's font library) and logo from the context profile, following `src/schema.ts` (if the studio already has a different `brand.json` for the same brand, show the difference and ask before replacing it).
- `videos/<id>.json`: one scene per script scene with its `vo` copied exactly, `language`, and a plain `headline` visual per scene. This file drives `npm run vo` and `npm run words`; the template composition `<id>` is only a timing preview.
- Logo in `public/brand/` if the video uses it. Music: synthesised music is made after the word times (Step 4); a licensed track is normalised into the project:

```bash
npx remotion ffmpeg -y -i "<track>" -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 public/music/<name>.wav
```

Run `npm run check` and fix every error.

**Private library:** if `hookreel-library/LIBRARY.md` exists in the working directory, copy its sound effects into the studio (`mkdir -p public/sfx/lib && cp "<working dir>/hookreel-library/motion-format/sfx/"*/*.wav public/sfx/lib/`, or the command `LIBRARY.md` gives) when `public/sfx/lib/` is missing or older than the library, and add the library's licence line to `CLAUDE_<CODE>.md` under sound.

## Step 3 — Study the references

**First read `references/motion-library.md` of the `hookreel-rules` skill in full** (the core reference moves, the Instagram motion library, the transition set, the font library, shot sizes (F), the style brief menus (G) and the not-a-slide checks (H)). It is the same for every brand. If `hookreel-library/LIBRARY.md` exists, read it too: its templates are references like the reels (timing, easing, where the sounds land), never layouts to render, and its sound effects (`lib/<name>`) can be picked per beat. Then the user's reference reels for this video, which are the source of the look. Find them in `CLAUDE_<CODE>.md` (brief question 16); if none are listed, ask for them before designing anything (screen recordings or files of reels they like; links are fine if you can open them). Look at **all** of them, not just one:

```bash
npm run refcuts -- "<reference>"
```

It measures the cut rhythm (shots, cuts per 10 s, median and longest shot; Remotion's ffmpeg has no scene-detect or tile filter, so this is done in Node) and saves one frame per shot in `out/refs/<name>/`. Look at those frames. A slow wipe can hide a cut and a flash can add one, so read the numbers against the frames. Write the median shot length into `06-motion-<id>.md` as the pacing target.

Write down what the reels and the library share and what each does that the others do not: pacing (how long one idea stays), type (sizes, weights, the italic or serif word), background (paper, grain, glow, colour per scene), transitions (wipes, circle reveals, push), props (receipts, stamps, calendars, toggles, notifications, chat boxes, dials, counters, progress rings), and how elements enter, act and leave. Never copy their assets, brands or sounds.

Then write `<project>/06-motion-<id>.md`. It opens with the **style brief** (menus in motion library G), one line each: background motion (G1), background surface with 2+ layers (G2), object render family (G3), signature move, opener for the first 3 s (G4), closing (G5), the way several points are shown if the voice lists any (G6), the punctuation style, and the **special moment** (which beat gets the most expensive effect, once). Read the `style.json` of the brand's last 3 videos in `src/proto/*/` and differ from each in at least 4 of the 6 lines. Then one block per beat (about every 1.5–3 s of speech): the spoken words, the register (threat → photoreal, screen → real screenshot, concept → drawn; see `hookreel-rules` → Custom motion), the one idea on screen and its on-screen text (at most two tiers, up to 6 words a line), the shot size (wide, medium or close; never three in a row the same), the things the voice names and where each appears, the library move or reel it starts from and how this version differs, the props and how they move, the transition out, and the sound. **Always fresh** (mandatory): a new idea per beat, never a previous video's scene design reused as it is. Read the `moves.json` of the brand's last 3 videos in `src/proto/*/` and do not repeat their moves or transitions; inside this video no move and no transition twice. Plan one background or camera change per 5 s of speech or less (pick from the transition set in the motion library). Propose bold ideas; the user can pull them back.

Then write `src/proto/<id>/style.json` (`{ "background", "surface": [2+ layers], "render", "signature", "opener", "closing" }`) and `src/proto/<id>/moves.json` (format in Step 4) from this plan and run `npm run fresh -- <id>` and `npm run retention -- <id>` on them **before coding any scene** (with `--estimate` word times, before the recording); fix the plan until it passes, so freshness and hold failures never surface only after the build.

## Step 4 — Prototype one scene (approval gate)

Build the hook scene first, in `src/proto/<id>/`:

1. Word times: `npm run words -- <id>` after recording, or `npm run words -- <id> --estimate` before (2.1 words per second; rerun after `/hookreel:voice`).
2. `src/proto/<id>/scenes.tsx` with the scene components, using `src/proto/kit.tsx`: the font library `FONT` (`display` Open Sans 800, `sans` Rubik 500–700, `serif` Instrument Serif italic; the same for every brand), `useT`, `prog`, `mix`, `squash`, `shake`, `Word`, `Glow`, `Grain`, `Sfx`, `Vo`, `Music`, `SourceLine`, `Transition` (circle, flood, swipe, zoom, mask, object), `KineticCaption` (optional captions for muted viewing, styled into the motion), `wordsOf(WORDS, sceneId)` for "when is this word spoken", `sceneSeconds`, `Camera` with `SHOT` and `frameOn` for shot sizes (the world inside, labels and source lines outside), `life(t, at, until)` for slow-in, fast-out elements. Everything else (props, layouts) is written new for this video.
3. `src/proto/<id>/moves.json`, the freshness log: one entry per beat, `{ "scene", "at" (scene seconds), "move", "transition" (only where the background or camera changes), "until" (required: scene second the beat's hero leaves the screen), "shot" (required: `wide`, `medium` or `close`), "text" (required: the on-screen text, one string per tier, `[]` for none; source lines, labels, disclaimers and text inside a mockup are left out), "special" (`true` on the one special beat), "sfx" (required: the sound on that beat, a file name in `public/sfx/` without `.wav`, or `"none"`; every transition needs a real one) }`, named in plain words ("counter assembled from dots", "colour flood"). Keep it in step with the scenes; `npm run fresh -- <id>` and `npm run retention -- <id>` check it.
4. Music (if the brief chose synthesised music): `npm run music -- <id> --mood <mood>` writes `public/music/<id>-synth.wav` (about -14 LUFS, the length of the video, a riser into the last scene). Pass it as `protoReel`'s fourth argument; the kit's `Music` ducks it under the voice. Rerun it whenever the word times change.
5. `src/proto/<id>/Reel.tsx`: `export const REEL = protoReel(WORDS, [["<scene id>", Scene], …], 6, "music/<id>-synth.wav")` (leave the music out if there is none), and register the video and its layout sweep in `src/Root.tsx`:

```tsx
<Composition id="<id>-motion" component={REEL.component} durationInFrames={REEL.frames} fps={FPS} width={1080} height={1920} />
<Composition id="<id>-sweep" component={REEL.sweep} durationInFrames={REEL.frames} fps={FPS} {...REEL.sweepSize} />
```

6. Render only the prototype scene (`--frames=0-<last frame of the scene>`) and send it:

```bash
npx remotion render <id>-motion out/<id>-proto.mp4 --frames=0-<n> --log=error
```

Ask for approval or changes. **Build no other scene until the user approves the prototype**; this is where the look is decided. Record the approval (date, file) in `CLAUDE_<CODE>.md` under **Prototype approved on**.

## Step 5 — Every scene

Build the remaining scenes in the approved look, with a new idea per beat (rules in `hookreel-rules` → Custom motion). The binding rules hold in every scene:

- Every number on screen has its source line (`SourceLine`, wording from `02-facts.md`); hypothetical amounts and examples carry the illustration label from `CLAUDE_<CODE>.md` (for example "Ilustrasi" / "Illustration").
- Only allowed claims; required disclaimers on the end card; every ban in `CLAUDE_<CODE>.md`.
- Sound effects synthesised (`npm run sfx`) or with a licence note; no meme or lifted sounds.

## Step 6 — Validate and look

`npx tsc --noEmit`, `npm run lint`, `npm run fresh -- <id>` and `npm run retention -- <id>` (dead air over 1.2 s, first beat after 1 s, a beat or transition without its sound, a scene with no sound, stretched images); fix every error. Check every text colour pair the new scenes use with `npm run contrast` (4.5:1 below 84 px, 3:1 above), all of them before the first full render: list each text colour and the surface it sits on (stage, prop face, card, chip) from the scene code. A pair found failing after the MP4 costs a whole render. Then `npm run sweep -- <id>` (6 frames per scene on one image, safe area in red) and read it with the taste check of motion library H (could this frame be a corporate slide? does the eye know where to look in 0.2 s? is the background alive but quiet with the text hidden? does the camera move at each change?): one idea per screen, the shot size changing as planned, no background or camera held longer than about 5 s, nothing clipped or overlapping, text inside x 80–1000 and above y 1500 (the platform UI covers the bottom and right edge), every source line and label readable, each beat's animation finished before the next starts. Fix and repeat until clean.

## Step 7 — Studio CLAUDE files

The studio is shared by every project of this brand, so its rules are split by project code:

- **`hookreel-studio/<brand-slug>/CLAUDE_<CODE>.md`**: written from `${CLAUDE_PLUGIN_ROOT}/claude-md/brand.md`, filled from the project's `CLAUDE_<CODE>.md` (fixed rules and bans), plus a **This project** section: the code, the project folder, its video ids (`<CODE>-…`), the composition `<id>-motion` and its folder `src/proto/<id>/`, and the bans that apply only to those videos.
- **`hookreel-studio/<brand-slug>/CLAUDE.md`**: the index Claude Code loads automatically. Create it if missing with a one-line title, then keep one import line per project, never removing older ones:

```text
# <Brand> studio
Each project's rules live in its coded file; all are imported so they load automatically.
@CLAUDE_HKR-261012-7QF3.md
@CLAUDE_<CODE>.md
```

If a brand-level ban appears in a new project, add it to that project's coded file; never edit or delete another project's file.

Update `<project>/project.json` (`stages.build`, `studio`) and the Status column in `hookreel-output/PROJECTS.md`.

## Step 8 — Remotion prompt (only when asked)

Skip unless the user asks for a standalone prompt to rebuild the video elsewhere. Then write `<project>/06-remotion-prompt.md`: the time model (`fps = 30`, `frame = f(t) = round(t × 30)`, every value a pure function of the frame via clamped `interpolate()` and ease-out cubic-bezier(0.16, 1, 0.3, 1), no CSS transitions or wall-clock state), format 1080×1920 and the platform UI zones, brand tokens, per beat the spoken words with their times and every element's movement (`t (s) | F | element | property: from → to | D (s) | sound`), the audio (voiceover lead-in 0.27 s, loudness targets, each sound with its time and volume), and the bans from `CLAUDE_<CODE>.md`.

## Step 9 — Hand over

Start the studio (`npm run dev`, or the host's preview tool) and point to the `<id>-motion` composition.

End: "Play `<id>-motion` in Studio. When the voiceover is recorded, start a new session: /hookreel:resume <CODE>, then /hookreel:voice."
