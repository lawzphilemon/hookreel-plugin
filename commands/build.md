---
name: build
description: Turn the approved script into new, custom motion design in the brand's Remotion studio, invented from the user's reference reels — one prototype scene for approval first, then every scene, timed on the spoken words at 60 fps (frame = f(t))
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
- **Exists:** keep it. Never overwrite files the user may have edited (`src/`, `scripts/`); only add files. If it predates this version, copy in `src/proto/kit.tsx`, `scripts/word-times.mjs`, `loudness.mjs`, `sweep.mjs`, `fresh-check.mjs`, `contrast.mjs`, `preview.mjs` and their `package.json` scripts (`words`, `loudness`, `sweep`, `fresh`, `contrast`, `preview`) when they are missing.

## Step 2 — Release the script

- `brand.json`: colours, fonts (used by the template look; custom scenes use the kit's font library) and logo from the context profile, following `src/schema.ts` (if the studio already has a different `brand.json` for the same brand, show the difference and ask before replacing it).
- `videos/<id>.json`: one scene per script scene with its `vo` copied exactly, `language`, and a plain `headline` visual per scene. This file drives `npm run vo` and `npm run words`; the template composition `<id>` is only a timing preview.
- Logo in `public/brand/` if the video uses it. Music: synthesised music is made after the word times (Step 4); a licensed track is normalised into the project:

```bash
npx remotion ffmpeg -y -i "<track>" -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 public/music/<name>.wav
```

Run `npm run check` and fix every error.

## Step 3 — Study the references

**First read `references/motion-library.md` of the `hookreel-rules` skill in full** (the core reference moves, the Instagram motion library, the transition set, the font library). It is the same for every brand. Then the user's reference reels for this video, which are the source of the look. Find them in `CLAUDE_<CODE>.md` (brief question 16); if none are listed, ask for them before designing anything (screen recordings or files of reels they like; links are fine if you can open them). Look at **all** of them, not just one:

```bash
npm run refcuts -- "<reference>"
```

It measures the cut rhythm (shots, cuts per 10 s, median and longest shot; Remotion's ffmpeg has no scene-detect or tile filter, so this is done in Node) and saves one frame per shot in `out/refs/<name>/`. Look at those frames. A slow wipe can hide a cut and a flash can add one, so read the numbers against the frames. Write the median shot length into `06-motion-<id>.md` as the pacing target.

Write down what the reels and the library share and what each does that the others do not: pacing (how long one idea stays), type (sizes, weights, the italic or serif word), background (paper, grain, glow, colour per scene), transitions (wipes, circle reveals, push), props (receipts, stamps, calendars, toggles, notifications, chat boxes, dials, counters, progress rings), and how elements enter, act and leave. Never copy their assets, brands or sounds.

Then write `<project>/06-motion-<id>.md`, one block per beat (about every 1.5–3 s of speech): the spoken words, the register (threat → photoreal, screen → real screenshot, concept → drawn; see `hookreel-rules` → Custom motion), the one idea on screen, the library move or reel it starts from and how this version differs, the props and how they move, the transition out, and the sound. **Always fresh** (mandatory): a new idea per beat, never a previous video's scene design reused as it is. Read the `moves.json` of the brand's last 3 videos in `src/proto/*/` and do not repeat their moves or transitions; inside this video no move and no transition twice. Plan one background or camera change per 5 s of speech or less (pick from the transition set in the motion library). Propose bold ideas; the user can pull them back.

Then write `src/proto/<id>/moves.json` (format in Step 4) from this plan and run `npm run fresh -- <id>` on it **before coding any scene**; fix the plan until it passes, so freshness and hold failures never surface only after the build.

## Step 4 — Prototype one scene (approval gate)

Build the hook scene first, in `src/proto/<id>/`:

1. Word times: `npm run words -- <id>` after recording, or `npm run words -- <id> --estimate` before (2.5 words per second; rerun after `/hookreel:voice`).
2. `src/proto/<id>/scenes.tsx` with the scene components, using `src/proto/kit.tsx`: the font library `FONT` (`display` Open Sans 800, `sans` Rubik 500–700, `serif` Instrument Serif italic; the same for every brand), `useT`, `prog`, `mix`, `squash`, `shake`, `Word`, `Glow`, `Grain`, `Sfx`, `Vo`, `Music`, `SourceLine`, `Transition` (circle, flood, swipe, zoom, mask), `KineticCaption` (optional captions for muted viewing, styled into the motion), `wordsOf(WORDS, sceneId)` for "when is this word spoken", `sceneSeconds`. Everything else (props, layouts) is written new for this video.
3. `src/proto/<id>/moves.json`, the freshness log: one entry per beat, `{ "scene", "at" (scene seconds), "move", "transition" (only where the background or camera changes), "until" (required: scene second the beat's hero leaves the screen), "sfx" (required: the sound on that beat, a file name in `public/sfx/` without `.wav`, or `"none"`; every transition needs a real one) }`, named in plain words ("counter assembled from dots", "colour flood"). Keep it in step with the scenes; `npm run fresh -- <id>` and `npm run retention -- <id>` check it.
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

`npx tsc --noEmit`, `npm run lint`, `npm run fresh -- <id>` and `npm run retention -- <id>` (dead air over 1.2 s, first beat after 1 s, a beat or transition without its sound, a scene with no sound, stretched images); fix every error. Check every text colour pair with `npm run contrast` (4.5:1 below 84 px, 3:1 above). Then `npm run sweep -- <id>` (6 frames per scene on one image, safe area in red) and read it: one idea per screen, no background or camera held longer than about 5 s, nothing clipped or overlapping, text inside x 80–1000 and above y 1500 (the platform UI covers the bottom and right edge), every source line and label readable, each beat's animation finished before the next starts. Fix and repeat until clean.

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

Skip unless the user asks for a standalone prompt to rebuild the video elsewhere. Then write `<project>/06-remotion-prompt.md`: the time model (`fps = 60`, `frame = f(t) = round(t × 60)`, every value a pure function of the frame via clamped `interpolate()` and ease-out cubic-bezier(0.16, 1, 0.3, 1), no CSS transitions or wall-clock state), format 1080×1920 and the platform UI zones, brand tokens, per beat the spoken words with their times and every element's movement (`t (s) | F | element | property: from → to | D (s) | sound`), the audio (voiceover lead-in 0.27 s, loudness targets, each sound with its time and volume), and the bans from `CLAUDE_<CODE>.md`.

## Step 9 — Hand over

Start the studio (`npm run dev`, or the host's preview tool) and point to the `<id>-motion` composition.

End: "Play `<id>-motion` in Studio. When the voiceover is recorded, start a new session: /hookreel:resume <CODE>, then /hookreel:voice."
