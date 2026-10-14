---
name: publish
description: Last stage before posting — reel cover variants rendered as stills (grid-safe), and the post caption written with the creator-os skill, both checked against the project's bans
allowed-tools: Read, Write, Edit, Bash
---

# HKR-9 — Cover and Caption

**Mission:** The reel goes out with a cover that still reads in the profile grid and a caption that earns the "more" tap. Run inside `hookreel-studio/<brand-slug>/` after `/hookreel:qa`. Read the project's `CLAUDE_<CODE>.md` first: every ban applies to the cover and the caption too. Follow the `hookreel-rules` skill, and the `creator-os` skill (bundled with this plugin) for hooks and captions.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Cover variants

Read `creator-os` `references/hook-frameworks.md` (Simplify Method, 8 Human Desire Triggers, rubric in §12). Write three cover variants for each video, each a different mechanism, for example:
1. the video's hook as a headline,
2. one big number (`big`) with a short headline,
3. an open loop the video pays off.

Rules: headline at most about 10 words, one message, one emotion; accent words marked `*like this*`, one accent colour; every number carries `source`; no claim, number or word the script did not already approve (the facts gate still holds); the brand's bans apply.

Score each with the creator-os rubric (Pattern, Relevansi, Janji, Spesifik, Ringkas, 0–2 each). Below 8, fix the weakest criterion before rendering.

Add them to `videos/<id>.json` as `cover` (see `CoverSpec` in `src/schema.ts`) and render:

```bash
npm run cover -- <id>
```

This writes `out/<id>-cover-<n>.png` (1080×1920) and `out/<id>-cover-<n>-grid.png`, the centre 1080×1440 that Instagram's profile grid shows (3:4; 240 px off the top and bottom). The template keeps cover content inside y 420–1500. Read every grid preview: nothing cut off, nothing broken mid-word, text fits.

## Step 2 — Caption

Follow `creator-os` Workflow B (`references/script-structures.md`, caption format):
- **First two lines: a second hook**, a different mechanism from the spoken hook (the viewer already heard that one). It must work alone in the preview before "more" (about 125 characters). Score it with the same rubric.
- Two to four sentences of value, in the brand voice from `CLAUDE_<CODE>.md`.
- The CTA exactly as in the video.
- Three to five relevant hashtags.

Then add what the project requires: the sources for every number shown, the disclaimers from `CLAUDE_<CODE>.md`, and the music credit (always when the licence requires it; as a courtesy otherwise). Run the bundled humanizer as a last pass (`humanizer-id` for Indonesian, `humanizer-en` for English), then re-check the bans.

Check the caption line by line against `CLAUDE_<CODE>.md` (claims, words, punctuation, person) and `02-facts.md` (every number and its source).

## Step 3 — Publish for the user

Write `<project>/08-publish-<id>.md`: the cover variants with scores and file names (recommend one), and the final caption in a code block, ready to paste. Send the user the cover PNGs (full and grid) and the file. The chosen cover is uploaded in Instagram as a custom cover (otherwise Instagram uses the first frame).

Update `<project>/project.json` (`stages.publish.<id>`: covers, chosen cover once the user picks, caption file) and `PROJECTS.md`.

End: "Pick a cover. The caption is in 08-publish-<id>.md, ready to paste."
