---
name: hookreel-rules
description: Shared rules for the hookreel short-video pipeline (brief, facts, story, script, storyboard, build, voice, qa, publish) — the project CLAUDE.md, review gates, evidence and claims, brand context profiles, writing voiceover for the ear, custom per-beat motion invented from the user's reference reels, the 60 fps time model (frame = f(t)), safe areas and audio. Use whenever a /hookreel command runs or a hookreel video is being written, built, or reviewed.
---

# HOOKREEL rules

Short vertical videos (Reels, TikTok, Shorts) for any brand, built from a brand context profile. These rules apply at every stage.

## Pipeline and files

```text
/hookreel:brief → facts → story → script [publish + approve] → build [prototype scene: render + approve, then every scene] → voice → qa [+ self-critique] → publish
/hookreel:storyboard      (optional, on request: a timed plan, not a gate)
/hookreel:resume <CODE>   (reopen any project later)
```

| Stage | Output |
|---|---|
| brief | project code, `<project>/01-brief.md`, **`<project>/CLAUDE_<CODE>.md`** (mandatory rulebook) + `CLAUDE.md` import, `project.json`, row in `hookreel-output/PROJECTS.md` |
| facts | `02-facts.md` (bans added to `CLAUDE_<CODE>.md`) |
| story | `03-story.md` (hooks + beat sheets, uses WTF Hook 999) |
| script | `04-script.md`, published for review, `Status: approved`; then `VOICEOVER_<CODE>.md` (recording guide) |
| storyboard (optional) | `draft/brand.json`, `draft/videos/<id>.json`, `05-storyboard-<id>.md` |
| build | `06-motion-<id>.md` (beat ideas from the references), `hookreel-studio/<brand>/` (brand.json, videos/, `src/proto/<id>/` scenes + `words.json` + `moves.json` (freshness log), compositions `<id>-motion` and `<id>-sweep`, studio `CLAUDE_<CODE>.md` + import line in its `CLAUDE.md`), `out/<id>-proto.mp4` approved, `06-remotion-prompt.md` (only on request) |
| voice | `public/vo/<id>/`, `src/proto/<id>/words.json` re-timed on the recording |
| qa | `07-qa-<id>.md`, `out/<id>.mp4`, `out/<id>-preview.mp4`, then the mandatory **`07b-critique-<id>.md`** (the video, the workflow, plugin updates) |
| publish | `08-publish-<id>.md`, `out/<id>-cover-<n>.png` (only after `07b-critique-<id>.md` exists) |

Each stage reads the previous files and updates `project.json` and `PROJECTS.md`, so the pipeline resumes after a restart.

## Token budget

Many users run this on plans with a limited token budget. Save tokens without cutting output:
- **One session per stage group.** Every stage reads its state from files (`project.json`, `CLAUDE_<CODE>.md`, the stage outputs), not from chat history, so a fresh session loses nothing. Suggest a new session (`/hookreel:resume <CODE>`) after the script is approved, after build, and after QA.
- **Generate review pages, never type them.** `scripts/review-page.mjs` in this skill folder turns a stage's markdown into the HTML page to publish (`--cards` for the script). Edit the markdown, regenerate the page.
- **Read only the hook type you need.** WTF Hook templates are one file per type in `references/templates/` of the `wtf-hook-999` skill; never read all 15.
- **The humanizer runs once**, on the final caption or text, not on every reply.
- **`06-remotion-prompt.md` only on request.**
- **Edit in place.** Change only the lines that change (video JSON, script, reports, director file); write a whole file only when it is created.
- **Compare, do not re-read.** After a storyboard or voiceover is regenerated, diff it against the previous version and read only what changed.
- **History at the bottom.** Stage files open with their status line and their content; version notes go in a `## Changes` section at the end (or in `DECISIONS.md`), so later stages read the content first.
- **Half-scale stills for layout.** Check beats with `--scale=0.5` stills at their end frames; render full size only for a frame that looks wrong.
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

- Nothing is built before the script is published and explicitly approved.
- One prototype scene (usually the hook) is rendered and sent before any other scene is built; the rest waits for an explicit approval of its look.
- The storyboard is optional (on request) and never blocks the build.
- A new claim, number or line after approval goes back to the user first.

## Time model: 60 fps, frame = f(t)

- Every duration and offset is written in seconds and converted with `frame = f(t) = round(t × 60)` (`src/motion.ts`). Never hard-code a frame count.
- Every animated property is a pure function of the frame: `value(F) = from + (to − from) · ease(clamp((F − F0) / D))`, ease-out cubic-bezier(0.16, 1, 0.3, 1), via `interpolate()`. No CSS transitions or keyframe animations.
- Custom scenes time every beat from the spoken words: `src/proto/<id>/words.json` (`npm run words`, character-aligned to the Whisper fragments, so a split or respelled word still lands on its fragment) read through `wordsOf()`. Never time beats by guessing or from the template's word aligner, which can run 0.3–1.1 s early.
- Give every beat time to finish its animation before the next one starts.
- The template's data-driven visuals take their times from `src/plan.ts` (and `npm run storyboard` prints it); that path is used only when the user asks for the template look.

## The brand comes from its context profile

- Voice, tone, hard rules, forbidden claims, colours, fonts, logo and motion rules come from the brand's context profile. Never import another brand's voice or the framework author's personal voice rules.
- Never mix two brands' profiles in one project. One studio folder per brand.

## Evidence

These rules are binding in every look (they protect licensed and regulated users):
- Every number on screen carries a source label. Every claim is on the allowed list in `02-facts.md`.
- Hypothetical amounts and examples carry the illustration label from `CLAUDE_<CODE>.md` (for example "Ilustrasi" / "Illustration").
- Required disclaimers appear on the end card; claim bans are checked word for word.
- Estimates are labelled "estimate". Visits are not people. A survey base (for example internet users aged 16+) is stated, never silently widened.
- Dates, not relative time. Note what goes stale.
- Experience claims only when real; results and client names only when the brief allows them.

## Writing the voiceover

- For the ear: short sentences, one idea each, 10–30 words per scene, about 2.5 words per second.
- What is written is what is said, and what any caption or on-screen word shows.
- Hooks: 8–18 spoken words, understood in under a second, with a named payoff later in the video.
- The CTA says the exact action and what the viewer gets.

## Cues

A cue is the word or phrase, copied exactly from the scene's voiceover, on which something happens. In custom scenes it is a `wordsOf()` lookup (`w("but")`, or `w("for", 1)` for the second time it is said), which throws if the word is not spoken in that scene.

## Custom motion (the default look)

**Creative mandate.** Every video is **new motion design built from all of the user's reference reels and the motion library**, written per beat in `src/proto/<id>/` with `src/proto/kit.tsx`. Never the template's infographic-slide look: cards stacked top-left, a header and logo on every scene, one layout held for 10–17 s. Something fresh every time.

**Same for every brand.** The mandate, the motion library and the font library apply to every brand identically; there are no brand-specific variants of the look. Only a 3D character is brand-specific: opt-in per brand, from that brand's own character sheet, and a person's own character images never go into a public repository.

**Before designing any scene, read** `references/motion-library.md` in full (the user's core reference moves, the Instagram motion library, the transition set, the font library) and the user's reference reels for this video (listed in `CLAUDE_<CODE>.md`; ask for them if missing).

**Fonts:** the font library in `src/proto/kit.tsx` (`FONT`): Open Sans 800 for headlines and big numbers, Rubik 500–700 for supporting text, labels and UI mockups, Instrument Serif italic for the accent on the key word.

What the references share; use it as the base, then invent beyond it:
- One idea per screen; beats on the spoken words, about 1.5–3 s each.
- Centred type with mixed sizes and weights; an italic serif (or another contrast face) for the key word.
- Lots of empty space; paper grain or a soft drifting glow; colour changes between scenes (wipes, circle reveals, pushes).
- Drawn props and UI mockups that move: receipts, stamps, calendars, toggles, notifications, chat or comment boxes, dials, rulers, progress rings, counters, letters that wobble or crumble.
- Elements enter, act and leave; nothing just appears and sits.

Rules:
- **Always fresh (mandatory).** Every video's result is fresh: never reuse a previous video's scene designs as they are. Each video logs its moves and transitions in `src/proto/<id>/moves.json`; `npm run fresh` fails on a move or transition repeated inside the video and warns on repeats from the brand's last 3 videos. Propose bold ideas.
- **No dead air, a hook that moves.** Something hero-sized is on screen whenever the voice speaks (no gap over about 1.2 s) and something moves in the first second. `npm run retention` checks both from `moves.json` (`until` marks when a beat's hero leaves), and fails on an image stretched out of its ratio.
- **No long holds.** No background or camera holds longer than about 5 s: change it with a transition (circle wipe, colour flood, swipe, zoom-through, mask reveal; `Transition` in the kit), a different one each time.
- Study all the references, not one; never copy their assets, brands or sounds.
- Text contrast at least 4.5:1 below 84 px and 3:1 above (`npm run contrast`).
- Kinetic captions (`KineticCaption`) are an option styled into the motion, for muted viewing; otherwise remind the user to turn on the platform's auto-captions.
- Gradients, glow, several colours and a background change per scene are allowed when the references call for them. A header or logo on every scene is not required. Burned-in captions are optional (only when the user asks).
- **Register first (mandatory).** Before deciding how a beat looks, decide which register it is in; a beat done well in the wrong register still fails:

  | The beat is… | Hero | Why |
  |---|---|---|
  | a **threat**: something taken, lost, broken, a bill arriving | **photoreal** (licensed photo or footage, or an AI image with its licence and the platform's AI label) | it has to reach the danger reflex; a drawing does not. If the brand bans frightening visuals, keep it photoreal but calm (the aftermath, not the attack) or rewrite the beat |
  | a **screen**: "you have seen this exact screen" | **real screenshot**, cropped to the rows the beat is about, only when the brief allows screenshots | the viewer owns the real one; a copy is subtly wrong and reads as a lie. Screenshots not allowed: rewrite the beat so it no longer depends on recognising that screen |
  | a **concept** or a **sensation** (slow, hot, confusing, a waiting period) | **drawn**: props, type, abstract UI | nothing to photograph, no screen to show |

  **Never fake a UI.** No generated image or redrawn copy of a real product's screen presented as the real thing, and no invented numbers or messages inside a real app's look. An abstract mockup is fine: grey bars for text, simplified shapes, no pixel-for-pixel copy of a real app. Treat it as the drawn register.
- The brand's own bans in `CLAUDE_<CODE>.md` still apply (for example no frightening visuals).
- Style and process rules that are dropped for good: the template layouts and visual catalog as the default, one accent per scene, a single fixed background colour, no gradients or glow, a header on every scene, burned-in captions, the storyboard approval as a blocker. Do not bring them back unless the user asks.
- Rules that stay, because they protect licensed and regulated users: true numbers with source labels, the illustration label on hypotheticals, no guaranteed outcomes or claim promises, the required disclaimers, licensed or synthesised sound only (see Evidence and Audio).
- Beat timing: beats come from character-aligned word times (`npm run words`, built on the Whisper fragments); the template's word aligner can be 0.3–1.1 s early. Every beat gets time to finish its animation.

Safe area for 1080×1920: keep text inside x 80–1000 and above y ≈ 1500; the platform UI covers the bottom ~420 px and the right edge. Key words large (headlines at least 84 px), supporting text at least 32 px, source lines at least 26 px.

**Template look (only on request).** The data-driven template stays available when the user explicitly asks for it: `videos/<id>.json` visuals, `references/visual-catalog.md`, the `clean` and `playful` styles, `npm run storyboard`.

## Audio

- Voiceover: one take per video, normalised to -16 LUFS with -3 dBTP peaks by `npm run vo`.
- Too long or too loose: cap the pauses in the existing take (`npm run trim`, default 0.3 s, never below 0.18 s), then tighten holds, and only then rewrite and re-record. Never speed the voice up and never drop a step to hit a length.
- Music: optional, rights cleared, normalised into the project, ducked about 13 dB under the voice and 8 dB in pauses.
- Sound effects: synthesised in the project (`npm run sfx`, no licence needed) or files with a commercial licence note; intensity `off | subtle | medium | dramatic`. Never meme sounds or sounds lifted from songs, films, cartoons or games.
- Final mix: integrated about -16 to -17 LUFS, true peak at or below -0.5 dBTP, measured with `npm run loudness -- <file.wav>` (Remotion's ffmpeg has no ebur128 filter).

## Self-critique (mandatory)

Right after a video is finished (after QA and render, before the cover and caption), write `<project>/07b-critique-<id>.md`: an honest critique of the video with evidence, then an evaluation of the workflow that produced it, then a **Plugin: must update** table. When a new way of working gave a better outcome than the plugin's current way, tell the user the plugin must be updated and offer to do it. `/hookreel:publish` does not start without this file.

## Don'ts

- No invented numbers, results, prices, quotes or client names.
- No claim the video does not pay off.
- No downloaded or ripped music without a licence note.
- Do not overwrite a user's edited files in an existing studio.
