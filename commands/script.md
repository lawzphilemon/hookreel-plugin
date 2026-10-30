---
name: script
description: Write the final voiceover per scene, sketch what the viewer sees on each beat, mark the cue words, check everything against the project's bans, then publish the script for the user to read and approve before anything else is built
allowed-tools: Read, Write, Edit
---

# HKR-4 — Script

**Mission:** Every scene gets its exact spoken line, a sketch of what the viewer sees on each beat, and the cue words that make it land on the word. The script is **published for review and approved** before anything is built; the same review picks the hook from `03-story.md`, so story and script take one reply. Requires `03-story.md` (draft or confirmed). Read `<project>/CLAUDE_<CODE>.md` first and follow it. Follow the `hookreel-rules` skill (Custom motion).

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Voiceover lines

**3D looks** (`3d dialog`, `3d toons`): the script is a dialogue between the brand's two characters, one table per video (`# · who · line`, 3–8 words a line), written and turned into the kit episode as `references/look-3d-kit.md` of the `hookreel-rules` skill says; Step 2 sketches what the laptop screen (dialog) or the recording (toons) shows per line. Every other rule below still applies.

Scene 1 uses the **recommended hook** from `03-story.md` unless the user already picked another. One scene per beat. For each scene write the line exactly as it will be spoken:
- Written for the ear: short sentences, one idea per sentence, 10–30 words per scene.
- Numbers written the way they are said where it matters ("900 million", "September 24"), and only numbers from the allowed claims.
- Brand voice from `CLAUDE_<CODE>.md`; its casing and punctuation rules apply.
- The CTA scene says the exact action from `CLAUDE_<CODE>.md` ("Type ChatGPT Ads in the comments").

## Step 2 — What the viewer sees

Per scene, one short line per beat (about every 1.5–3 s of speech): the one idea on screen, in the spirit of the user's reference reels (for example "the bill slides in, a stamp lands on *covered*"), the exact words shown on screen, and the source label (from `02-facts.md`) next to every number; hypotheticals carry the illustration label. This is a sketch for approval of content, not the final motion: `/hookreel:build` designs the motion from the references. Respect the visual bans in `CLAUDE_<CODE>.md`. Use the template's catalog types (`references/visual-catalog.md`) only when the user asked for the template look.

## Step 3 — Cues

For every beat, name its **cue**: the word (or short phrase) copied exactly from that scene's line on which the beat lands.

## Step 4 — Check against the rules

Before showing anything, check the whole script against `CLAUDE_<CODE>.md` and report the result:
- No banned phrase (brand never-say list and the generic filler list), no banned punctuation or emoji.
- No claim outside the allowed list; every number has a source label.
- The CTA matches the exact wording.
- Length: about 2.1 words per second plus one second per scene, against the target length (measured: a human take about 2.0, an ElevenLabs clone about 2.15; use the chosen voice's own pace once a take exists). If it runs long, propose specific cuts.
- **Hook audit:** run `hooklab-auditor` on scene 1 as written (not the story draft). Credibility and payoff at least 3, weighted score at least 4; otherwise apply its recommended rewrite (within the allowed claims) and audit again.
- **Read-aloud pass:** read every line as the narrator will say it (the `hookreel-rules` voiceover rules): no sentence over about 15 words, no list read as a list, no colon or parenthesis that cannot be spoken, connectors where a listener would lose the thread. Rewrite what fails.

Fix every hit before publishing, and add the results (hook score, cuts made, rules checked) as a short **Checks** section at the end of `04-script.md`, so the user reviews a script that has already passed them.

## Step 5 — Publish for review (mandatory)

Save `<project>/04-script.md`, per video:

```text
## Hook options · [video id]
| Hook | Type | Line (spoken) | Payoff beat | Audit score |
| A · Gain | … |   (mark the recommended one "recommended, in scene 1")
| B · Pain | … |
| C · Curiosity | … |

## [video id] · [title] · eyebrow: "[small label]" · ~[n]s
| Scene id | Voiceover (exact) | Beats on screen | Cue word → beat | Sources and labels on screen |
```

Scene ids are `01-hook`, `02-<name>`, `03-<name>`… (two digits, a dash, lowercase words and dashes: the format `npm run check` enforces). Never `s01-…`; `review-page.mjs --cards` refuses to publish a script or recording guide with any other id.

The hook options go at the top, so the hook is picked in the same review. Mark the recommended one; scene 1 already uses it. A different pick rewrites scene 1 with that hook and re-runs the Step 4 checks on it.

**Pronunciation** goes in `04-script.md` too, after the scene tables (before **Checks**), for every brand name, acronym, code word, URL, number, date or amount whose spoken form differs from the shown one:

```text
## Pronunciation
| Shown | Spoken |
| GA4 | G A four |
| USD 2.500 | dua ribu lima ratus dolar |
```

Each row becomes a `{shown|spoken}` span in the scene's `say` (`{USD 2.500|dua ribu lima ratus dolar}`).

`/hookreel:voice` and `/hookreel:produce` read it for `npm run tts` (`say` spans) and any other TTS prompt. The recording guide `VOICEOVER_<CODE>.md` (Step 6) is written only when a human records, so the person recording never has to read the script tables.

Then **publish** it for reading. Generate the page, do not write it by hand:

```bash
node <hookreel-rules skill folder>/scripts/review-page.mjs <project>/04-script.md --cards --title "Script <short topic>"
```

`--cards` shows each scene as a card with the spoken line first, then what is on screen. If the host can publish a page the user can open and comment on, publish that HTML file and give the link; otherwise send it. On every revision, edit `04-script.md` and regenerate the page.

Ask the user, in one message, to pick a hook (default: the recommended one, already in scene 1) and reply with approval or changes. Apply changes and republish until they approve. Only an explicit approval counts; silence or "looks fine so far" does not. An approval without a hook pick keeps the recommended hook.

On approval:
- `04-script.md`: `Status: approved — [date]` as the first line; fill **Script approved on** in `CLAUDE_<CODE>.md`.
- `03-story.md`: `Status: confirmed` as the first line, with the chosen hook per video; record the chosen hook under **Rules for this video** in `CLAUDE_<CODE>.md`.

Update `<project>/project.json` (`stages.story`, `stages.script`) and the Status column in `hookreel-output/PROJECTS.md`.

## Step 6 — Voiceover guide (after approval, only when a human records)

Skip this step when the project uses a synthetic voice (ElevenLabs or another TTS, `CLAUDE_<CODE>.md` → sound): the pronunciation table in `04-script.md` is all `tts` needs. When a human records, write `<project>/VOICEOVER_<CODE>.md`, the guide for whoever records. Only approved lines go in it, so nobody records a draft. Instructions in the language the user writes in; the lines exactly as approved, in the voiceover language.

```text
# Voiceover · [project title] · [CODE]
Approved script: [date]. Read every line exactly as written: on-screen words and cue timings follow this text.

## How to record
- One take per video, lines in order, about half a second of pause between lines. Restart the line, not the take, after a slip.
- Quiet room, phone or mic a hand's width away, no music. Any format (m4a, mp3, wav).
- Changing a word? Ask first: the script must be re-approved, because on-screen words and cue timings use the text.

## After recording
npm run vo -- <id> "<path to recording>"   (in hookreel-studio/<brand>-studio/, or run /hookreel:voice)
What it does: [normalise -16 LUFS / -3 dBTP, local Whisper, cut per scene at the pauses, word timings]. Check each printed "heard:" line; fix a bad cut with ranges in seconds: npm run vo -- <id> "<file>" "1.7-6.9,7.7-14.0,…"

## Pronunciation
| Written | Say |   (copied from the pronunciation table in `04-script.md`: `whatsapp_click` → "whatsapp click", GA4 → "G A four")

## Status
| Video | Recorded | Date | File |   (filled by /hookreel:voice)

## [video id] · [title] · ~[n] s
| Scene | Line | Estimate |   (Scene = the scene id, `01-hook`, `02-<name>`…, the same ids as `04-script.md` and the clip names `npm run vo` writes; estimate = words ÷ 2.1 + 1 s; total at the end)
```

Send the user the file.

End: go straight on to `/hookreel:build` (no stop until the prototype). Run alone, end with: "Script approved[, VOICEOVER_<CODE>.md is ready for recording]. Next: /hookreel:build — one prototype scene for your approval first (before or after recording)."

## Rules
- What is written is what is said; any caption or on-screen quote uses this text.
- Every cue must be an exact substring of its scene's line.
- Nothing is built until the script is approved.
