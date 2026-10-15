---
name: storyboard
description: After the script is approved, produce a perfectionist-grade storyboard per video — composition of every element, every movement, every sound effect, captions and spoken words, timed in seconds and frames (60 fps, frame = f(t)), second by second — then publish it for review and approval
allowed-tools: Read, Write, Edit, Bash
---

# HKR-5 — Storyboard

**Mission:** Before any Remotion JSON is released, the user sees and approves exactly what will happen on screen and in the ear, to the frame. Requires `04-script.md` with `Status: approved`. Read `<project>/CLAUDE_<CODE>.md` first and follow it. Follow the `hookreel-rules` skill and `references/visual-catalog.md` (including its layout specs).

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

The storyboard is written for a perfectionist: nothing is left to "and then it animates in". Every element has a place, a size, a colour token, a moment, a movement and, when it has one, a sound.

## Step 1 — Draft spec (not released yet)

Write the draft that the storyboard is computed from, inside the project folder (this is not the studio, and not yet the released JSON):

- `<project>/draft/brand.json` from the context profile, following the template's `src/schema.ts` (semantic colour tokens as 6-digit hex, Google Fonts names, logo path, `motion.entranceMs`, and `style` from the brief: `clean` or `playful`).
- `<project>/draft/videos/<id>.json` per video from the approved script: `vo` copied exactly, the visual and its cues, `cta`, `language`, `audio.sfx`, `audio.music`.

Validate the draft from its folder:

```bash
cd <project>/draft && node "${CLAUDE_PLUGIN_ROOT}/template/scripts/check-video.mjs" --no-files
```

Fix every error. Every cue must be an exact phrase from its line.

## Step 2 — Compute the timeline

Generate the timed storyboard from the same planners the render uses (Node 22.18+, no install needed):

```bash
node --no-warnings "${CLAUDE_PLUGIN_ROOT}/template/scripts/storyboard.mjs" --video <project>/draft/videos/<id>.json --brand <project>/draft/brand.json --out <project>/05-storyboard-<id>.md
```

It writes, per scene: start and end in seconds and frames; a row for every event (element entering, highlight, typing, strike, swap, dim, scene fade, caption line, voiceover start) with its movement, end time and sound effect at its final volume; and a second-by-second table of what is said, which caption is showing and what is moving. Times are **estimates at 2.5 words per second** until the voiceover is recorded; the file says so at the top.

Never edit the generated tables by hand: change the draft JSON and regenerate, so the storyboard always equals what will render.

## Step 3 — Director's layer

Write it as data in `<project>/draft/director/<id>.json`; the generator merges it into the storyboard on every run (right under each `## Scene` heading, and the header at the top), so a revision edits only the scenes that changed:

```json
{ "header": ["- **Length:** …", "- **Sound effects:** …"],
  "scenes": { "<scene id>": { "intent": "…", "composition": ["- Headline …", "- Bars …"], "transition": "…" } } }
```

Per scene:

- **Intent:** what the viewer must feel or understand by the end of the scene, in one or two sentences, tied to its beat in `03-story.md`.
- **Composition:** every element on screen at the end of the scene, top to bottom: what it is, its zone and approximate y range, size in px and weight, colour token, alignment, and its exact text. Use the layout specs; name the accent element and confirm it is the only accent.
- **Transition in and out:** how the scene arrives (cut with whoosh, soft low hit) and leaves (fade over 0.2 s), and anything that carries over (header, captions, music state).

The **header**: total length, fps and frame = f(t), sound effect intensity, music plan with where it ducks, caption style, and the list of bans from `CLAUDE_<CODE>.md` that the storyboard was checked against.

## Step 4 — Check

Before publishing, confirm and report:
- Content stays inside y 330–1300; nothing overlaps; the caption never covers content.
- Every number shows its source label.
- No two sounds hit within 0.1 s of each other in a way that would stack loudly (call it out if they do, with a proposed offset).
- No element appears after its scene has started fading out.
- Nothing banned in `CLAUDE_<CODE>.md` appears.

## Step 5 — Publish for review (mandatory)

Generate the review page, do not write it by hand:

```bash
node <hookreel-rules skill folder>/scripts/review-page.mjs <project>/05-storyboard-<id>.md --title "Storyboard <short topic>"
```

Publish it where the user can read and comment on it (a hosted page if the host offers one, otherwise the file), and ask for approval or changes. For changes: edit the draft JSON or the director's layer, edit only the affected scenes in the draft JSON or the director file, regenerate the storyboard and the page, and diff the new storyboard against the previous one to report what moved; republish. Only an explicit approval counts.

On approval, put `Status: approved — [date]` as the first line of each `05-storyboard-<id>.md` and fill **Storyboard approved on** in `CLAUDE_<CODE>.md`.

Update `<project>/project.json` (`stages.storyboard`) and the Status column in `hookreel-output/PROJECTS.md`.

End: "Storyboard approved. To save tokens, start a new session for production: /hookreel:resume <CODE>, then /hookreel:build."

## Rules
- No Remotion JSON in a studio until both the script and the storyboard are approved.
- The generated timeline is the truth; the director's layer explains it, never contradicts it.
- 60 fps; every time in seconds and frames, frame = round(t × 60).
