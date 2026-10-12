---
name: hookreel-rules
description: Shared rules for the hookreel short-video pipeline (brief, facts, story, script, build, voice, qa) — evidence and claims, brand context profiles, writing voiceover for the ear, cue phrases, visual catalog, safe areas, motion and audio defaults. Use whenever a /hookreel command runs or a hookreel video is being written, built, or reviewed.
---

# HOOKREEL rules

Short vertical videos (Reels, TikTok, Shorts) for any brand, built from a brand context profile. These rules apply at every stage.

## Pipeline and files

```text
/hookreel:brief → /hookreel:facts → /hookreel:story → /hookreel:script → /hookreel:build → /hookreel:voice → /hookreel:qa
```

| Stage | Output |
|---|---|
| brief | `hookreel-output/<slug>/01-brief.md` |
| facts | `02-facts.md` |
| story | `03-story.md` (hooks + beat sheets, uses WTF Hook 999) |
| script | `04-script.md` (voiceover, visuals, cues, recording sheet) |
| build | `hookreel-studio/<brand>/brand.json`, `videos/<id>.json`, `05-remotion-prompt.md` |
| voice | `hookreel-studio/<brand>/public/vo/<id>/` |
| qa | `06-qa-<id>.md`, `out/<id>.mp4` |

Each stage reads the previous files, so the pipeline resumes after a restart. A stage starts only when the previous file says `Status: confirmed`.

## The brand comes from its context profile

- Voice, tone, hard rules, forbidden claims, colours, fonts, logo and motion rules come from the brand's context profile. Never import another brand's voice or the framework author's personal voice rules.
- Never mix two brands' profiles in one project. One studio folder per brand.

## Evidence

- Every number on screen carries a source label. Every claim is on the allowed list in `02-facts.md`.
- Estimates are labelled "estimate". Visits are not people. A survey base (for example internet users aged 16+) is stated, never silently widened.
- Dates, not relative time. Note what goes stale.
- Experience claims only when real; results and client names only when the brief allows them.

## Writing the voiceover

- For the ear: short sentences, one idea each, 10–30 words per scene, about 2.5 words per second.
- What is written is what is said and what the caption shows.
- Hooks: 8–18 spoken words, understood in under a second, with a named payoff later in the video.
- The CTA says the exact action and what the viewer gets.

## Cues

A cue is a phrase copied exactly from the scene's voiceover, marking when an element appears. Exact case and punctuation, unique within the scene. After recording, cues land on the actual spoken word. `npm run check` rejects a cue that is not in its line.

## Visuals

Pick from the catalog in `references/visual-catalog.md`; one visual per scene, `swap` for two in sequence, optional `note` card. Recreated UI mockups, not screenshots, unless the brief allows screenshots. One accent colour, used for the thing that matters in the scene.

Safe area for 1080×1920: content between y ≈ 330 and y ≈ 1300, sides 80 px; captions sit at y ≈ 1340; the platform UI covers the bottom ~420 px and the right edge. Headlines at least 84 px, supporting text at least 32 px.

Motion: fade-and-rise entrances (about 360 ms, ease-out), no bounce, no looping, no story-style progress bar.

## Audio

- Voiceover: one take per video, normalised to -16 LUFS with -3 dBTP peaks by `npm run vo`.
- Music: optional, rights cleared, normalised into the project, ducked about 13 dB under the voice and 8 dB in pauses.
- Sound effects: synthesised in the project (no licences); intensity `off | subtle | medium | dramatic`.
- Final mix: integrated about -16 to -17 LUFS, true peak at or below -0.5 dBTP.

## Don'ts

- No invented numbers, results, prices, quotes or client names.
- No claim the video does not pay off.
- No downloaded or ripped music without a licence note.
- Do not overwrite a user's edited files in an existing studio.
