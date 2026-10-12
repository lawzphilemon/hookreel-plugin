---
name: script
description: Write the final voiceover per scene, choose a visual type for each scene from the catalog, mark the cue phrases that time the visuals, and produce the recording sheet
allowed-tools: Read, Write
---

# HKR-4 — Script

**Mission:** Every scene gets its exact spoken line, one visual, and the cue phrases that make the visual land on the word. Requires confirmed `03-story.md`. Follow the `hookreel-rules` skill and its `references/visual-catalog.md`.

## Step 1 — Voiceover lines

One scene per beat. For each scene write the line exactly as it will be spoken:
- Written for the ear: short sentences, one idea per sentence, 10–30 words per scene.
- Numbers written the way they are said where it matters ("900 million", "September 24"), and only numbers from the allowed claims.
- Brand voice from the context profile; no exclamation marks unless the brand uses them.
- The CTA scene says the exact action from the brief ("Type ChatGPT Ads in the comments").

## Step 2 — Visual per scene

Pick one visual type per scene from the catalog (headline, stat, ranking, tiles, timeline, bars, flow, chat, journey, ui, list, logo, swap, cta) and write its content: headline, labels, values, source labels (from `02-facts.md`, shown on screen next to every number), mockup rows. Use `swap` when one scene needs two visuals in sequence (for example a ranking, then a big number). A scene may add a `note` ("Watch out") card.

Prefer recreated UI mockups over screenshots unless the brief allows screenshots. Respect the brief's dislikes.

## Step 3 — Cues

For every element that should appear on a word, pick a **cue**: a phrase copied exactly from that scene's line (same case, same punctuation), unique within the scene, at the point the element should land. Elements without a cue appear in order from the scene start. Cues are what make the visuals follow the voice once it is recorded, so they must match the line character for character.

## Step 4 — Check the length

Count words per scene and per video. At about 2.5 words per second plus one second per scene, report the estimated length against the brief's target. If it runs long, propose specific cuts.

## Step 5 — Save

Save `hookreel-output/<slug>/04-script.md` with, per video:

```text
## [video id] · [title] · eyebrow: "[small label]" · ~[n]s
| Scene id | Voiceover (exact) | Visual type | Visual content | Cues → element | Sources on screen |
```

Then a **Recording sheet** per video: the lines in order, one per paragraph, with a pronunciation guide for brand names, acronyms, code words (`whatsapp_click` → "whatsapp click") and numbers, plus: "Record one take per video, in order, with about half a second of pause between lines."

Show it and ask for confirmation. On confirmation add `Status: confirmed` as the first line.

End: "Confirm the script, then run /hookreel:build."

## Rules
- The voiceover text is also the caption text. What is written is what is said.
- Every cue must be an exact substring of its scene's line.
- Every number on screen carries its source label.
