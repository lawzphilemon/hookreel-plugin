---
name: script
description: Write the final voiceover per scene, choose a visual for each scene, mark the cue phrases, check everything against the project's bans, then publish the script for the user to read and approve before anything else is built
allowed-tools: Read, Write, Edit
---

# HKR-4 — Script

**Mission:** Every scene gets its exact spoken line, one visual, and the cue phrases that make the visual land on the word. The script is **published for review and approved** before any storyboard or Remotion JSON exists. Requires confirmed `03-story.md`. Read `<project>/CLAUDE_<CODE>.md` first and follow it. Follow the `hookreel-rules` skill and its `references/visual-catalog.md`.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Voiceover lines

One scene per beat. For each scene write the line exactly as it will be spoken:
- Written for the ear: short sentences, one idea per sentence, 10–30 words per scene.
- Numbers written the way they are said where it matters ("900 million", "September 24"), and only numbers from the allowed claims.
- Brand voice from `CLAUDE_<CODE>.md`; its casing and punctuation rules apply.
- The CTA scene says the exact action from `CLAUDE_<CODE>.md` ("Type ChatGPT Ads in the comments").

## Step 2 — Visual per scene

Pick one visual type per scene from the catalog and write its content: headline, labels, values, source labels (from `02-facts.md`, shown next to every number), mockup rows. Use `swap` for two visuals in sequence. A scene may add a `note` card. Respect the visual bans in `CLAUDE_<CODE>.md`.

## Step 3 — Cues

For every element that should appear on a word, pick a **cue**: a phrase copied exactly from that scene's line (same case, same punctuation), unique within the scene, at the point the element should land. Elements without a cue follow the default order and offsets from the scene start.

## Step 4 — Check against the rules

Before showing anything, check the whole script against `CLAUDE_<CODE>.md` and report the result:
- No banned phrase (brand never-say list and the generic filler list), no banned punctuation or emoji.
- No claim outside the allowed list; every number has a source label.
- The CTA matches the exact wording.
- Length: about 2.5 words per second plus one second per scene, against the target length. If it runs long, propose specific cuts.

Fix every hit before publishing.

## Step 5 — Publish for review (mandatory)

Save `<project>/04-script.md`, per video:

```text
## [video id] · [title] · eyebrow: "[small label]" · ~[n]s
| Scene id | Voiceover (exact) | Visual type | Visual content | Cues → element | Sources on screen |
```

followed by a **Recording sheet** per video: the lines in order, one per paragraph, a pronunciation guide for brand names, acronyms, code words (`whatsapp_click` → "whatsapp click") and numbers, and: "Record one take per video, in order, with about half a second of pause between lines."

Then **publish** it for reading: if the host can publish a page or document the user can open and comment on, publish the script there and give the link; otherwise send the file. Present it as a script to read, not as a table dump: per scene, the spoken line first, then what is on screen.

Ask the user to read it and reply with approval or changes. Apply changes and republish until they approve. Only an explicit approval counts; silence or "looks fine so far" does not.

On approval, put `Status: approved — [date]` as the first line of `04-script.md` and fill **Script approved on** in `CLAUDE_<CODE>.md`.

Update `<project>/project.json` (`stages.script`) and the Status column in `hookreel-output/PROJECTS.md`.

End: "Script approved. Run /hookreel:storyboard."

## Rules
- The voiceover text is also the caption text. What is written is what is said.
- Every cue must be an exact substring of its scene's line.
- No storyboard and no Remotion JSON until the script is approved.
