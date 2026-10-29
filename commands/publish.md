---
name: publish
description: Last stage before posting — reel cover variants rendered as stills (grid-safe), and the post caption written with the creator-os skill, both checked against the project's bans
allowed-tools: Read, Write, Edit, Bash
---

# HKR-9 — Cover and Caption

**Mission:** The reel goes out with a cover that still reads in the profile grid and a caption that earns the "more" tap. Run inside `hookreel-studio/<brand>-studio/` after `/hookreel:qa`: as the last step of `/hookreel:produce` (the user then gets preview, covers and caption in one message), or alone. Read the project's `CLAUDE_<CODE>.md` first: every ban applies to the cover and the caption too. Follow the `hookreel-rules` skill, and the `creator-os` skill (bundled with this plugin) for hooks and captions.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 0 — Gate

Stop unless `<project>/07-qa-<id>.md` passed and **`<project>/07b-critique-<id>.md` exists** (the self-critique written by `/hookreel:qa` Step 4). If the critique is missing, write it first, following `/hookreel:qa` Step 4; no cover or caption before it.

## Step 1 — Cover variants

Read `creator-os` `references/hook-frameworks.md` (Simplify Method, 8 Human Desire Triggers, rubric in §12). Write three cover variants for each video, each a different mechanism, for example:
1. the video's hook as a headline,
2. one big number (`big`) with a short headline,
3. an open loop the video pays off.

Rules: headline at most about 10 words, one message, one emotion; one accent word (the kit's serif or a brand colour); every number carries its source line (`.hr-source`); no claim, number or word the script did not already approve (the facts gate still holds); the brand's bans apply.

Score each with the creator-os rubric (Pattern, Relevansi, Janji, Spesifik, Ringkas, 0–2 each). Below 8, fix the weakest criterion before rendering.

Write each variant as a still HyperFrames page, `reels/<id>-cover-<n>/index.html`: 1080×1920, `data-no-timeline` on the root, the kit linked as `assets/kit.css` (fonts and classes as in the scenes), images named `assets/<path>` from `public/<path>`. Design it in the video's look, not a template card. Keep all cover content inside y 420–1500. Then render:

```bash
npm run cover -- <id>
```

This copies the kit and every `public/` file the pages name into their `assets/`, and writes `out/<id>-cover-<n>.png` (1080×1920) and `out/<id>-cover-<n>-grid.png`, the centre 1080×1440 that Instagram's profile grid shows (3:4; 240 px off the top and bottom). Read every grid preview: nothing cut off, nothing broken mid-word, text fits. In a Remotion studio (before 0.18.0) without the HyperFrames tooling, covers stay `cover` in `videos/<id>.json` (`CoverSpec` in its `src/schema.ts`).

## Step 2 — Caption

Follow `creator-os` Workflow B (`references/script-structures.md`, caption format):
- **First two lines: a second hook**, a different mechanism from the spoken hook (the viewer already heard that one). It must work alone in the preview before "more" (about 125 characters). Score it with the same rubric.
- Two to four sentences of value, in the brand voice from `CLAUDE_<CODE>.md`.
- **The CTA inside the first ~125 characters, or repeated there.** A caption that puts it in the fourth paragraph is invisible: the feed cuts at about 125 characters behind "… more", which is where the only ask of a real reel sat (character 666 of 1.282, so nobody read it).
- **One line that asks for the save or the share, not only the keyword.** Shares are what carries a reel to people who never open the post page; a keyword ask alone excludes exactly those viewers. Name the intended recipient ("kirim ke yang sedang menyiapkan dana kuliah dalam dolar"), or ask for the save when the value is a reference. If the video deliberately asks for neither, write the reason in `DECISIONS.md`.
- The CTA exactly as in the video.
- Three to five relevant hashtags.

Then add what the project requires: the sources for every number shown, the disclaimers from `CLAUDE_<CODE>.md`, and the music credit (always when the licence requires it; as a courtesy otherwise). When the video uses AI-generated characters or scenes, remind the user to switch on the platform's AI label when posting. Run the bundled humanizer as a last pass (`humanizer-id` for Indonesian, `humanizer-en` for English), then re-check the bans.

Check the caption line by line against `CLAUDE_<CODE>.md` (claims, words, punctuation, person) and `02-facts.md` (every number and its source).

## Step 3 — Publish for the user

Write `<project>/08-publish-<id>.md`: the cover variants with scores and file names (recommend one), and the final caption in a code block, ready to paste. Send the user the cover PNGs (full and grid) and the file; inside `/hookreel:produce`, in the same message as the preview. The chosen cover is uploaded in Instagram as a custom cover (otherwise Instagram uses the first frame).

Copy the final render and every cover into the project, so the finished files live with the project and not only in the studio: `out/<id>.mp4` and every `out/<id>-cover-<n>.png` and `out/<id>-cover-<n>-grid.png` go to `<project>/render/` (create it; copy, do not move; check the MP4 has the same size as the original). Whenever the render or a cover changes later, overwrite the matching file there. In `<project>/meta.json` set `file_utama` to `render/<id>.mp4` (the first video's, for a project with several).

Update `<project>/project.json` (`stages.publish.<id>`: covers, chosen cover once the user picks, caption file) and `PROJECTS.md`.

End: "Pick a cover. The caption is in 08-publish-<id>.md, ready to paste. Once you pick, everything to post goes in one folder."

## Step 4 — Posting folder

When the user picks a cover, put everything needed to post this video in one folder, `<project>/publish/`, so nothing has to be fetched from the studio:

| File | Copy of |
|---|---|
| `<id>.mp4` | the studio's `out/<id>.mp4` (the original render, not the preview) |
| `<id>-cover.png` | the chosen `out/<id>-cover-<n>.png` (the full 1080×1920, not the grid crop) |
| `<id>-caption.txt` | the text inside the caption code block in `08-publish-<id>.md`, without the fences (UTF-8) |

Copy, do not move: `out/` stays the studio's render folder. Check the copied MP4 has the same size as the original. Whenever the cover choice, the caption or the render changes later, overwrite the matching file here.

Record it in `project.json` (`stages.publish.<id>.folder`: `"publish/"`, plus the chosen cover) and in `PROJECTS.md`. Once every video of the project has its posting folder, set `status` in `<project>/meta.json` to `"selesai"`.

End: "Ready to post: `<project>/publish/` has <id>.mp4, <id>-cover.png and <id>-caption.txt. Upload the cover as the custom cover in Instagram."
