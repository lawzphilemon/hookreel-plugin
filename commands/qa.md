---
name: qa
description: Final quality gate before posting — layout sweep, sync, freshness, contrast, sources, stale facts, audio, licences, a scored critique loop on stills (8+ on every criterion) — then the MP4 render and a preview, and the mandatory self-critique with plugin recommendations
allowed-tools: Read, Write, Bash
---

# HKR-8 — QA, Render and Self-critique

**Mission:** Nothing ships with an overlap, an unsourced number, a stale fact, a repeated move, unreadable text or a clipped peak; and every finished video is followed by an honest self-critique that improves the next one. Run inside `hookreel-studio/<brand>-studio/` after `/hookreel:voice`. Read the project's `CLAUDE_<CODE>.md` first; every item in its Bans section is a QA check. Follow the `hookreel-rules` skill.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Checklist

Go through every item and report pass or fail with evidence. A full render takes minutes (an 18.8 s reel about 0.9 min), so a fix found after it simply re-renders; the mix's loudness is printed by the render (item 8).

1. **Layout:** `npm run sweep -- <id>` (6 frames per scene at quarter scale on one image, safe area drawn in red). One idea per screen; text inside x 80–1000 and above y 1500; nothing clipped or overlapping; every beat's animation finished before the next starts; the lower part of the safe area used, not left empty. Then `npm run hf -- check reels/<id> --json` (lint, runtime and layout): no error left, every warning weighed. Take a full-size still (`npm run hf -- snapshot reels/<id> --at <s> --no-end`) only for a frame that looks wrong.
2. **Sync:** `reels/<id>/words.json` comes from the recording (`npm run words -- <id>`, not `--estimate`); every beat lands on its spoken word (allow about 0.15 s); the render's length matches the sum of the scene lengths (`npm run render` checks the frame count).
3. **Freshness:** `npm run fresh -- <id>` against `reels/<id>/moves.json`. **Fails** on a move or transition used twice in this video, a background or camera held longer than about 5 s, a beat without a `shot` or three beats in a row at one shot size, more than one `special` beat, a missing or flat `style.json`, or a style brief sharing 3 of its 6 lines with a recent video; **warns** on moves or transitions also used in the brand's last 3 videos (each warning needs a reason or a change). Also check that no scene design was reused as it is from a previous video.
4. **Retention and register:** `npm run retention -- <id>`. **Fails** on a beat without `until` or `sfx` in `moves.json`, a transition or a whole scene without a sound, dead air (more than about 1.2 s of voice with no hero on screen), a first beat later than 1 s, an `<img>` stretched out of its ratio, a beat without its on-screen `text`, 3 text tiers on one beat or a line over 6 words, **an ask that lands after 55 % of the runtime (on screen or spoken) when `videos/<id>.json` declares `cta.keyword`, and a `cta.reward` that never appears in the CTA scene's on-screen text**; each warning (a short phrase with a full stop, all caps on several beats, a cover crop over 10 %, empty bands from contain) needs a look at the sweep. Every product, object or number the voice names is on screen in its beat. Check every beat against its register in `06-motion-<id>.md`: threats photoreal, screens real screenshots (only where the brief allows them and the owner's permission is recorded in `CLAUDE_<CODE>.md`), recognisable people only with their permission, concepts drawn, and no faked UI.
5. **Contrast:** every text colour on its background, with its size: `npm run contrast -- "<text>" "<background>" <px> …`. At least 4.5:1 below 84 px (supporting text, labels, source lines, captions), 3:1 for 84 px and up. Fix the colour, never the rule.
6. **Sources and labels:** every number on screen has its source label, matching `02-facts.md`; every hypothetical amount or example carries the illustration label (for example "Ilustrasi"); the required disclaimers are on the end card.
7. **Stale facts:** if `02-facts.md` lists claims that go stale and the check date is older than about 30 days, recheck them before rendering.
8. **Audio:** read the loudness `npm run render` prints for `out/<id>-mix.wav` (or `npm run loudness -- out/<id>-mix.wav`): true peak at or below -0.5 dBTP, integrated about -16 to -17 LUFS (out of range: adjust `data-volume` on the voice, music or effects and render again); voice clearly above the music everywhere; every sound effect synthesised, from the private library (`lib/…`, its licence line from `LIBRARY.md` in `CLAUDE_<CODE>.md`) or with a commercial licence note (no meme or lifted sounds); every transition and every key beat is heard, not only seen. Ask the user to listen once on a phone with sound, in the final preview (no separate listening stop).
9. **Licences:** music synthesised (`npm run music`, no licence needed) or its source and licence noted; credit line ready if required. HyperFrames registry blocks, fonts or media a scene pulls in: licence checked and noted. Recordings, licensed tracks and private library files (`public/sfx/lib/`, `hookreel-library/`) are not committed to a public repository. AI-generated characters or scenes: the tool is noted, its terms allow commercial use, and the post will carry the platform's AI label (Instagram "AI info", TikTok "AI-generated") when the platform requires it.
10. **Rules:** every ban in `CLAUDE_<CODE>.md` checked one by one (claims, words, visuals, sound); fixed rules respected (30 fps, frame = f(t), every value a function of timeline time, safe area). Where the brand's rules (`BRAND.md`) require a watermark: `npm run assemble` prints `watermark tile` or `watermark corner` (not `watermark off`), and the sweep shows it from about 1.2 s on every scene but the end card.
11. **Look:** the video is the custom motion approved at the prototype, not the template's infographic slides (unless the user asked for the template look). Run the taste check of motion library H on the sweep and report each of its four answers; no template skeleton (motion library H).
12. **Frame 0 and sound placement:** frame 0 is a real image of the hook (not black, not empty): autoplay shows it muted and it is the thumbnail until the cover is set. In the strips and `moves.json`, each effect starts 2–3 frames before its visual lands, a riser ends on its hit, there is one impact (on the `special` beat), and music and effects dip about 1 s before the turn beat.
13. **Muted viewing:** if the video has no kinetic captions, say so in the report and remind the user to turn on the platform's auto-captions.

A warning that says "add `cta.keyword`" means the project has not declared its ask yet: declare it and re-run, so the check is an error and not a note.

Fix what fails before rendering.

## Step 1b — Critique loop on stills (before the first full render)

Every past re-render was for something a still would have shown: contrast, text over a prop of the same colour, a rail, an empty frame. Find those before the MP4:

```bash
npm run sheets -- <id>
```

It writes `out/sheets/<id>/`: `contact-NN.png` (every 0.5 s), `strip-NN.png` (12 frames around every transition) and `phone-NN.png` (every beat at 360 px wide, its hero complete). Read every sheet as a harsh director and write `<project>/07a-critique-<id>.md`:

```text
Status: critique round <n> — [date]
## Round <n>
| Criterion | Score | Evidence (sheet, timestamp) |
| Hook | | first 3 s: does it stop the scroll, is the payoff promised |
| Phone readability | | phone sheets: every word readable at 360 px, source lines included |
| Motion quality | | strips: eases and settles, no pop, no slide, no overlap mid-move |
| Variety | | contact sheets: a new idea every 2–4 s, no dead beat |
| Composition | | one idea per screen, the eye knows where to look, nothing in the platform UI zones |
| Brand accuracy | | colours, fonts, labels, disclaimers, every ban |
| Sound sync | | from moves.json and npm run retention: every beat and transition has its sound on its word |
## Three biggest problems
| # | Problem | Sheet and timestamp | Fix |
```

Fix the three biggest problems, run `npm run sheets -- <id>` again and score the new sheets in a new round under a `## Round <n>` heading (the file keeps every round; the gate reads only the round with the highest n, so older score tables can stay as they are). `npm run sheets -- <id> --gate <project>/07a-critique-<id>.md` passes only when every criterion is 8 or more on sheets made after the last code change. Run it before Step 2; a full render does not start on a failed gate (an assemble after the sheets counts as a change: assemble first, then the sheets). Three rounds at most: still under 8 after the third, send the sheets and scores to the user and ask.

**Close every open item before the render leaves the studio.** The "Open before posting" list is not a to-do for later: a deferred length decision ships as the shipped length. HKR-261019-Y6VQ carried `decide on the length: 92 s against ~75 s` into the post, and the 17 extra seconds pushed the keyword ask to 88 % of the runtime, past almost the whole audience. Every item is either done, or the reason it is dropped is written in the file.

## Step 2 — Render and preview

```bash
npm run render -- <id>
npm run preview -- <id>
```

`npm run render` assembles the reel, renders `out/<id>.mp4` with parallel Chrome workers (lint errors fail it), checks the frame count against `words.json`, and prints the loudness of `out/<id>-mix.wav`. It takes minutes, so a fix found after it simply re-renders. (For a template-look video in a Remotion studio, its own render per `template-remotion/README.md`.) Then look at the **encoded file**, not only the stills: `ffmpeg -hide_banner -loglevel error -i out/<id>.mp4 -r 0.5 -vf scale=270:-2 out/mp4-frames/<id>-%03d.png` (one frame every 2 s; create `out/mp4-frames/` first) and read them for anything the sweep could not show: a frame that went black or empty, text cut at an edge, a transition that does not cover the whole frame. Start with the smallest files (`ls -S -r out/mp4-frames/<id>-*.png | head`): an empty or flat frame is the smallest PNG, so it shows up first. Render one video at a time: two renders or encodes in parallel take about three times as long, not twice. `npm run preview` writes `out/<id>-preview.mp4` (crf 27, to send) and `out/<id>-ig-test.mp4` (about Instagram's re-encode). Watch the test encode at the grain, gradients and thin lines; if they smear or band, render the original again at a lower CRF (`npm run assemble -- <id>`, then `npm run hf -- render reels/<id> -o out/<id>.mp4 --crf 12`) (grain also dithers gradients, so a slightly coarser grain survives better than a lighter one), and only then lower the grain or keep it to flat backgrounds. Post the original `out/<id>.mp4`.

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
| Step | Minutes | Renders (draft / full) |
(build, voice, critique rounds, audio, render, fixes after the render; the numbers that show whether the next video got faster)
What cost the most time or tokens, and why. What worked better than before and should become the default.

## 3. Plugin: must update
| Change | Why |
(Only changes that gave or would give a better outcome than the current plugin; "none" if nothing was found.)
```

Fix the weak points that can be fixed now and are inside the approved script (re-render, re-run the checks). For every row in section 3, tell the user the plugin should be updated and offer to do it; a better way of working that was found here must not be lost. Update `project.json` (`stages.critique.<id>`).

End: go straight on to `/hookreel:publish` (inside `/hookreel:produce` or `/hookreel:make`, its Steps 1–3 run next and the preview goes out together with the covers and caption). Run alone, send the preview and end with: "Self-critique is in 07b-critique-<id>.md. Next: /hookreel:publish for the cover and the caption."
