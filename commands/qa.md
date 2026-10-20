---
name: qa
description: Final quality gate before posting — layout sweep, sync, freshness, contrast, sources, stale facts, audio, licences — then render the MP4 and a preview, and write the mandatory self-critique with plugin recommendations
allowed-tools: Read, Write, Bash
---

# HKR-8 — QA, Render and Self-critique

**Mission:** Nothing ships with an overlap, an unsourced number, a stale fact, a repeated move, unreadable text or a clipped peak; and every finished video is followed by an honest self-critique that improves the next one. Run inside `hookreel-studio/<brand-slug>/` after `/hookreel:voice`. Read the project's `CLAUDE_<CODE>.md` first; every item in its Bans section is a QA check. Follow the `hookreel-rules` skill.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Checklist

Go through every item and report pass or fail with evidence. Run item 8 (audio) first: the WAV render and loudness check take a minute, a full MP4 render about 25, so every audio fix happens before the first MP4.

1. **Layout:** `npm run sweep -- <id>` (6 frames per scene at quarter scale on one image, safe area drawn in red). One idea per screen; text inside x 80–1000 and above y 1500; nothing clipped or overlapping; every beat's animation finished before the next starts; the lower part of the safe area used, not left empty. Render a full-size still (`npx remotion still <id>-motion out/stills/<id>-<frame>.png --frame=<frame> --log=error`) only for a frame that looks wrong.
2. **Sync:** `src/proto/<id>/words.json` comes from the recording (`npm run words -- <id>`, not `--estimate`); every beat lands on its spoken word (allow about 0.15 s); the render's length matches the sum of the scene lengths.
3. **Freshness:** `npm run fresh -- <id>` against `src/proto/<id>/moves.json`. **Fails** on a move or transition used twice in this video, a background or camera held longer than about 5 s, a beat without a `shot` or three beats in a row at one shot size, more than one `special` beat, a missing or flat `style.json`, or a style brief sharing 3 of its 6 lines with a recent video; **warns** on moves or transitions also used in the brand's last 3 videos (each warning needs a reason or a change). Also check that no scene design was reused as it is from a previous video.
4. **Retention and register:** `npm run retention -- <id>`. **Fails** on a beat without `until` or `sfx` in `moves.json`, a transition or a whole scene without a sound, dead air (more than about 1.2 s of voice with no hero on screen), a first beat later than 1 s, an image stretched out of its ratio, a beat without its on-screen `text`, 3 text tiers on one beat or a line over 6 words; each warning (a short phrase with a full stop, all caps on several beats, a cover crop over 10 %, empty bands from contain) needs a look at the sweep. Every product, object or number the voice names is on screen in its beat. Check every beat against its register in `06-motion-<id>.md`: threats photoreal, screens real screenshots (only where the brief allows them and the owner's permission is recorded in `CLAUDE_<CODE>.md`), recognisable people only with their permission, concepts drawn, and no faked UI.
5. **Contrast:** every text colour on its background, with its size: `npm run contrast -- "<text>" "<background>" <px> …`. At least 4.5:1 below 84 px (supporting text, labels, source lines, captions), 3:1 for 84 px and up. Fix the colour, never the rule.
6. **Sources and labels:** every number on screen has its source label, matching `02-facts.md`; every hypothetical amount or example carries the illustration label (for example "Ilustrasi"); the required disclaimers are on the end card.
7. **Stale facts:** if `02-facts.md` lists claims that go stale and the check date is older than about 30 days, recheck them before rendering.
8. **Audio:** `npx remotion render <id>-motion out/<id>-mix.wav --codec=wav --log=error`, then `npm run loudness -- out/<id>-mix.wav`: true peak at or below -0.5 dBTP, integrated about -16 to -17 LUFS; voice clearly above the music everywhere; every sound effect synthesised, from the private library (`lib/…`, its licence line from `LIBRARY.md` in `CLAUDE_<CODE>.md`) or with a commercial licence note (no meme or lifted sounds); every transition and every key beat is heard, not only seen. Ask the user to listen once on a phone with sound.
9. **Licences:** music synthesised (`npm run music`, no licence needed) or its source and licence noted; credit line ready if required. Recordings, licensed tracks and private library files (`public/sfx/lib/`, `hookreel-library/`) are not committed to a public repository. AI-generated characters or scenes: the tool is noted, its terms allow commercial use, and the post will carry the platform's AI label (Instagram "AI info", TikTok "AI-generated") when the platform requires it.
10. **Rules:** every ban in `CLAUDE_<CODE>.md` checked one by one (claims, words, visuals, sound); fixed rules respected (60 fps, frame = f(t), every value a function of the frame, safe area).
11. **Look:** the video is the custom motion approved at the prototype, not the template's infographic slides (unless the user asked for the template look). Run the taste check of motion library H on the sweep and report each of its four answers; no template skeleton (motion library H).
12. **Muted viewing:** if the video has no kinetic captions (`KineticCaption`), say so in the report and remind the user to turn on the platform's auto-captions.

Fix what fails before rendering.

## Step 2 — Render and preview

```bash
npx remotion render <id>-motion out/<id>.mp4 --log=error
npm run preview -- <id>
```

(For a template-look video: `npm run render -- <id> out/<id>.mp4`.) Then look at the **encoded file**, not only the stills: `npx remotion ffmpeg -hide_banner -loglevel error -i out/<id>.mp4 -r 0.5 -vf scale=270:-2 out/mp4-frames/<id>-%03d.png` (one frame every 2 s; create `out/mp4-frames/` first) and read them for anything the sweep could not show: a frame that went black or empty, text cut at an edge, a transition that does not cover the whole frame. `npm run preview` writes `out/<id>-preview.mp4` (crf 27, to send) and `out/<id>-ig-test.mp4` (about Instagram's re-encode). Watch the test encode at the grain, gradients and thin lines; if they smear or band, render the original again with `--crf=12` (grain also dithers gradients, so a slightly coarser grain survives better than a lighter one), and only then lower the grain or keep it to flat backgrounds. Post the original `out/<id>.mp4`.

## Step 3 — Report

Save the checklist with its evidence as `<project>/07-qa-<id>.md`. Update `<project>/project.json` (`stages.qa.<id>`) and `PROJECTS.md`. Send the user the preview MP4 (and say where the full file is).

## Step 4 — Self-critique (mandatory, before the cover and caption)

Right after the render, write `<project>/07b-critique-<id>.md`, honest and specific, with evidence (numbers, scene lengths, contrast ratios, file sizes, sweep frames):

```text
Status: self-critique — [date]
# Self-critique · <id>

## 1. The video
What works (2–4 points). What is weak, worst first:
| # | Problem | Evidence | Fix |

## 2. The workflow
What cost the most time or tokens, and why. What worked better than before and should become the default.

## 3. Plugin: must update
| Change | Why |
(Only changes that gave or would give a better outcome than the current plugin; "none" if nothing was found.)
```

Fix the weak points that can be fixed now and are inside the approved script (re-render, re-run the checks). For every row in section 3, tell the user the plugin should be updated and offer to do it; a better way of working that was found here must not be lost. Update `project.json` (`stages.critique.<id>`).

End: "Self-critique is in 07b-critique-<id>.md. When the video is right, start a new session for the cover and the caption: /hookreel:resume <CODE>, then /hookreel:publish."
