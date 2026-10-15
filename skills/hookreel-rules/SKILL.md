---
name: hookreel-rules
description: Shared rules for the hookreel short-video pipeline (brief, facts, story, script, storyboard, build, voice, qa, publish) — the project CLAUDE.md, review gates, evidence and claims, brand context profiles, writing voiceover for the ear, cue phrases, the 60 fps time model (frame = f(t)), visual catalog, safe areas, motion and audio defaults. Use whenever a /hookreel command runs or a hookreel video is being written, built, or reviewed.
---

# HOOKREEL rules

Short vertical videos (Reels, TikTok, Shorts) for any brand, built from a brand context profile. These rules apply at every stage.

## Pipeline and files

```text
/hookreel:brief → facts → story → script [publish + approve] → storyboard [publish + approve] → build → voice → qa → publish
/hookreel:resume <CODE>   (reopen any project later)
```

| Stage | Output |
|---|---|
| brief | project code, `<project>/01-brief.md`, **`<project>/CLAUDE_<CODE>.md`** (mandatory rulebook) + `CLAUDE.md` import, `project.json`, row in `hookreel-output/PROJECTS.md` |
| facts | `02-facts.md` (bans added to `CLAUDE_<CODE>.md`) |
| story | `03-story.md` (hooks + beat sheets, uses WTF Hook 999) |
| script | `04-script.md`, published for review, `Status: approved`; then `VOICEOVER_<CODE>.md` (recording guide) |
| storyboard | `draft/brand.json`, `draft/videos/<id>.json`, `05-storyboard-<id>.md`, published for review, `Status: approved` |
| build | `hookreel-studio/<brand>/` (brand.json, videos/, studio `CLAUDE_<CODE>.md` + import line in its `CLAUDE.md`), `06-remotion-prompt.md` (only on request) |
| voice | `public/vo/<id>/`, `05-storyboard-<id>.recorded.md` |
| qa | `07-qa-<id>.md`, `out/<id>.mp4` |
| publish | `08-publish-<id>.md`, `out/<id>-cover-<n>.png` |

Each stage reads the previous files and updates `project.json` and `PROJECTS.md`, so the pipeline resumes after a restart.

## Token budget

Many users run this on plans with a limited token budget. Save tokens without cutting output:
- **One session per stage group.** Every stage reads its state from files (`project.json`, `CLAUDE_<CODE>.md`, the stage outputs), not from chat history, so a fresh session loses nothing. Suggest a new session (`/hookreel:resume <CODE>`) after the storyboard is approved, after build, and after QA.
- **Generate review pages, never type them.** `scripts/review-page.mjs` in this skill folder turns a stage's markdown into the HTML page to publish (`--cards` for the script). Edit the markdown, regenerate the page.
- **Read only the hook type you need.** WTF Hook templates are one file per type in `references/templates/` of the `wtf-hook-999` skill; never read all 15.
- **The humanizer runs once**, on the final caption or text, not on every reply.
- **`06-remotion-prompt.md` only on request.**
- **Edit in place.** Change only the lines that change (video JSON, script, reports, director file); write a whole file only when it is created.
- **Compare, do not re-read.** After a storyboard or voiceover is regenerated, diff it against the previous version and read only what changed.
- **History at the bottom.** Stage files open with their status line and their content; version notes go in a `## Changes` section at the end (or in `DECISIONS.md`), so later stages read the content first.
- **One picture for layout.** `npx remotion still <id>-sheet out/stills/<id>-sheet.png` renders every scene 0.5 s before its end on one image. Render a single full still only for a scene that looks wrong.
- **Filter command output.** Renders with `--log=error`; long logs through `tail` or `grep` for the lines that matter (errors, totals, loudness).

## Project codes

- Every project gets a unique code at `/hookreel:brief`: `HKR-YYMMDD-XXXX` (date plus four characters from `23456789ABCDEFGHJKMNPQRSTVWXYZ`).
- The code is in every name that must stay findable and must never collide: the project folder `<project>` = `hookreel-output/<CODE>_<slug>/`, the rulebook `CLAUDE_<CODE>.md`, the studio file `CLAUDE_<CODE>.md`, every video id `<CODE>-<name>` (so compositions, `videos/<id>.json`, `public/vo/<id>/`, storyboards and `out/<id>.mp4` all carry it).
- Claude Code auto-loads only files named `CLAUDE.md`, so each folder's `CLAUDE.md` imports the coded files with `@CLAUDE_<CODE>.md` lines. Never delete another project's import line or coded file.
- `/hookreel:resume <CODE>` reopens a project; editing a stage marks every later stage `needs re-approval`.

## The project CLAUDE.md is the rulebook

Every project has `<project>/CLAUDE_<CODE>.md` (imported by the folder's `CLAUDE.md`) with three sections: **fixed rules** (brand voice, look, motion and time, sound, evidence), **rules for this video** (topic, pain, audience, storyline, CTA, approvals) and **bans** (claims, words and phrases, visuals, sound, process). Read it before every stage; it overrides defaults and framework examples. Bans are concrete items, never "avoid being generic". Every stage that learns a new rule or ban writes it there.

The rulebook is loaded into every session, so it holds **rules only**, one line each, without the story of how they came about. Who decided what and why, dates, rejected options and version history go to `<project>/DECISIONS.md` (append-only, read only when a rule is questioned).

## Review gates

- No storyboard before the script is published and explicitly approved.
- No Remotion JSON in a studio before the storyboard is published and explicitly approved.
- Changing the draft after approval means regenerating and re-approving.

## Time model: 60 fps, frame = f(t)

- Every duration and offset is written in seconds and converted with `frame = f(t) = round(t × 60)` (`src/motion.ts`). Never hard-code a frame count.
- Every animated property is a pure function of the frame: `value(F) = from + (to − from) · ease(clamp((F − F0) / D))`, ease-out cubic-bezier(0.16, 1, 0.3, 1), via `interpolate()`. No CSS transitions or keyframe animations.
- When things happen and which sounds play comes only from `src/plan.ts`. Components read their times from it; the storyboard script prints it. So the storyboard is the render.

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

Pick from the catalog in `references/visual-catalog.md`; one visual per scene, `swap` for two in sequence, optional `note` card. Recreated UI mockups, not screenshots, unless the brief allows screenshots. One accent colour, used for the thing that matters in the scene. For composition and motion ideas, `references/motion-infographic-refs.md` lists real Instagram motion-infographic reels mapped to catalog types (ideas only; never copy their assets).

Safe area for 1080×1920: content between y ≈ 330 and y ≈ 1300, sides 80 px; captions sit at y ≈ 1340; the platform UI covers the bottom ~420 px and the right edge. Headlines at least 84 px, supporting text at least 32 px.

Motion has two styles, set in `brand.json` `style` (asked in the brief, recorded in `CLAUDE_<CODE>.md`):

- **clean** (default): fade-and-rise entrances (about 360 ms, ease-out), no bounce, no looping.
- **playful**: pop entrances (a spring with a small overshoot, the bounce) and elements that keep floating gently (a loop), made for `character` visuals: AI-generated 3D cartoon characters, mascots, illustrated scenes. Still one idea per scene, still readable: the character carries the emotion, the text stays short.

Both styles: no story-style progress bar, every motion a function of the frame.

Storyboards are perfectionist-grade: every element's place, size, colour token, moment, movement and sound, in seconds and frames, plus a second-by-second table.

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
