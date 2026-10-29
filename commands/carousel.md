---
name: carousel
description: Turn a source post (Threads, X, LinkedIn, a caption, notes) into a 4:5 photo carousel for Instagram, TikTok Photo Mode and LinkedIn — raw source transcript, reviewed slide copy, brand-styled editable HTML, PNG slides rendered and checked (size, numbering, font size, overflow), and a production report
allowed-tools: Read, Write, Edit, Glob, Bash, WebFetch, AskUserQuestion
---

# HKR-C — Carousel

**Mission:** One source post becomes a carousel that keeps the source's argument and its uncertainty, reads one idea per slide, looks like the brand (never the same template twice), and ships with proof that every slide renders correctly. Follow the `hookreel-rules` skill: project codes, the rulebook, evidence and the brand context profile apply exactly as for a video.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/`; `<id>` is the carousel id, always `<CODE>-<name>`; `<dir>` is `<project>/carousel/<id>/`. Talk to the user in their language.

## Step 0 — Project

- Given a project code, or run inside a project folder: read `<project>/CLAUDE_<CODE>.md` and `project.json`, and use that project.
- Otherwise create a light project the way `/hookreel:brief` does (code, folder, `CLAUDE_<CODE>.md` + `CLAUDE.md` import, `project.json`, a row in `hookreel-output/PROJECTS.md`), but ask only what the source does not answer, in one round: brand context profile (look for one first, as in `/hookreel:brief` Step 1), destination platforms [Instagram + TikTok Photo Mode + LinkedIn], aspect [4:5, 1080×1350], slide count [follow the source, 5–10], CTA [none, or the source's], required disclaimers, the **voice** (below), and whether the source is the user's own post (someone else's needs their permission, recorded in `CLAUDE_<CODE>.md`).
- **Voice**, asked for every carousel (recorded in `CLAUDE_<CODE>.md`):
  - **Own voice**: the user's own tone, as in their source post; the copy keeps the source's wording style. Default when there is no client context profile.
  - **Brand voice**: the client's tone from its context profile. Default when a client context profile is used.

## Step 1 — Source, raw

Get the source text as published, in this order:
1. The text the user pasted.
2. The post itself: for Threads, the Repliz connector (`repliz_search_threads_user_content` / `repliz_get_content`) when it is connected; otherwise `WebFetch` on the URL.
3. A screenshot: transcribe it.

Write `<dir>/01-source.md`: URL, platform, the visible handle, how it was retrieved (and what failed), then the text **verbatim** per segment, with no fixes. Anything unreadable is marked `[unreadable]`, never guessed. End with `## Uncertainties`.

## Step 2 — Copy (review gate)

Write `<dir>/02-copy.md`, one `## Slide NN` per slide: a kicker (2–4 words), a headline (at most ~12 words), body (at most ~40 words), an optional accent line.

- One idea per slide. Slide 1 is the hook: keep the source's claim and score it with the bundled `hooklab-auditor`; sharpen it without promising more than the source says. The last slide carries the disclaimers and the CTA.
- Keep the source's meaning and hedges ("bergantung pada definisi polis" stays). No new claim, number or example. A regulated topic (insurance, finance, health, legal) is checked against `<project>/02-facts.md` when it exists; a claim that is not on the allowed list is flagged for the user, not dropped silently.
- **Brand voice:** rewrite every line in the client's voice from its context profile: form of address (kami/kamu/Anda), register, sentence length, words and phrases it bans, its sample lines, its forbidden claims. Only the voice changes: the meaning, the hedges and the claim limits stay as in the source, and no claim is added. Never mix in the user's own voice, another brand's voice or a framework author's personal voice (`hookreel-rules`: the brand comes from its context profile).
- A segment rebuilt around an `[unreadable]` part is rebuilt only from the meaning around it, and flagged.
- Under `## Edits`, list every material change from the source (merged, shortened, moved, omitted) with the reason; in brand voice, also "rewritten into <brand>'s voice" with the slides where wording changed most.
- Run the bundled humanizer once as a final pass (`humanizer-id` / `humanizer-en`), then check against the bans in `CLAUDE_<CODE>.md` and, in brand voice, line by line against the context profile's voice rules.

Publish it for review: `node <hookreel-rules skill folder>/scripts/review-page.mjs <dir>/02-copy.md --title "Carousel <short topic>"`. **Stop until the user approves it**; then set `Status: approved` at the top. A change after approval goes back to the user.

## Step 3 — Build the HTML

Write `<dir>/carousel.html`, one self-contained file the user can edit:
- Each slide is `<section class="slide" id="slide-NN">`; `.slide` sets the canvas `width` and `height` in px (1080×1350 for 4:5, 1080×1080 for 1:1, 1080×1920 for 9:16) and `overflow:hidden`.
- Colours, fonts, logo and look come from the brand context profile (or the studio's `brand.json`). Fonts load from Google Fonts or local files next to the HTML. Never a default system font when the brand has one.
- Design for this carousel: pick the layout from the content of each slide (hook, contrast, list, quote, definition, checklist, end card), so slides vary, and do not reuse the last carousel's layout. Pick fonts from the font library in `references/motion-library.md` (section D) unless the brand sets its own.
- Readability: headline at least 64 px, body at least 32 px, nothing below 24 px. Side margins at least 80 px. Platform UI covers the edges, so keep key text clear of the bottom ~160 px and leave the counter and handle small.
- Every slide shows `NN / TT` and a handle: own voice, the source handle and platform; brand voice, the client's handle, with the source credited only when `CLAUDE_<CODE>.md` says so.
- No text in images: all copy stays live text, so the user can edit it.

## Step 4 — Render and check

```bash
node <hookreel-rules skill folder>/scripts/carousel.mjs <dir>/carousel.html --out <dir>
```

It uses `--chrome <path>`, `CHROME_PATH`, the Chrome a Remotion studio downloaded (found from the current folder upwards) or an installed Chrome; pass `--chrome <path>` when none is found. It writes `slide-NN.png` per slide and `verification.json`, and fails on a wrong PNG size, broken numbering, text below 24 px (`--min-font` to change), or any element that sticks out of its slide. Fix and re-run until it passes.

Then look at every PNG yourself: hierarchy, orphan words, awkward line breaks, contrast (`npm run contrast` in the studio for the colour pairs), anything the script cannot judge. Fix and re-render.

## Step 5 — Report

Write `<dir>/report.md`: source and how it was retrieved, attribution, destinations, slide count, canvas, the voice (own or brand), the look in one line, the edits from `02-copy.md`, warnings (the uncertainties, "source-derived, not independently verified" for regulated topics), and the verification summary from `verification.json`.

Update `project.json` (`stages.carousel.<id>`: copy approved, html, slides, pass) and `PROJECTS.md`. Send the user the PNGs, `carousel.html` and `report.md`.

For the post caption, `/hookreel:publish` Step 2 applies as written (second hook, value, CTA, hashtags, disclaimers, humanizer); save it in `report.md` under `## Caption`.

End: "The slides are in <dir>. Edit carousel.html and re-run Step 4 for any change."
