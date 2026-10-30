---
name: hookreel-rules
description: Shared rules for the hookreel short-video pipeline (make, brief, facts, story, script, storyboard, build, voice, qa, publish) — the project CLAUDE.md, review gates, evidence and claims, brand context profiles, writing voiceover for the ear, custom per-beat motion invented from the user's reference reels, the 30 fps time model (frame = f(t)), safe areas and audio. Use whenever a /hookreel command runs or a hookreel video is being written, built, or reviewed.
---

# HOOKREEL rules

Short vertical videos (Reels, TikTok, Shorts) for any brand, built from a brand context profile. These rules apply at every stage.

## Pipeline and files

```text
/hookreel:make [topic]    (one entry point: the whole pipeline below, four stops per video)
/hookreel:brief [stop 1: one message, ≤6 questions + pre-filled brief] → facts [auto; stops only on a failed claim] → story → script [stop 2: hook pick + script approval, one reply] → build [stop 3: prototype scene approved, then every scene] → voice → qa [critique loop on stills, render, self-critique] → publish [stop 4: preview + covers + caption together, pick a cover]
/hookreel:produce <id>     (after the prototype is approved: the rest of build, voice, qa and publish in one run)
/hookreel:carousel        (a photo carousel from a source post: copy approved, then HTML → checked PNGs)
/hookreel:storyboard      (optional, on request: a timed plan, not a gate)
/hookreel:resume <CODE>   (reopen any project later)
```

| Stage | Output |
|---|---|
| brief | project code, `<project>/01-brief.md`, **`<project>/CLAUDE_<CODE>.md`** (mandatory rulebook) + `CLAUDE.md` import, `project.json`, `meta.json`, row in `hookreel-output/PROJECTS.md` |
| facts | `02-facts.md` (bans added to `CLAUDE_<CODE>.md`) |
| story | `03-story.md` (hooks + beat sheets, uses HookLab; confirmed with the script) |
| script | `04-script.md` (hook options on top, scenes, pronunciation table, checks), published for review, `Status: approved`; then `VOICEOVER_<CODE>.md` (recording guide, only when a human records) |
| storyboard (optional) | `draft/brand.json`, `draft/videos/<id>.json`, `05-storyboard-<id>.md` |
| build | `06-motion-<id>.md` (beat ideas from the references), `hookreel-studio/<brand>-studio/` (brand.json, BRAND.md, videos/, `reels/<id>/` = `compositions/<scene id>.html` + `words.json` + `moves.json` (freshness log) + `style.json` (style brief), with `index.html` and `assets/` written by `npm run assemble`; studio `CLAUDE_<CODE>.md` + import line in its `CLAUDE.md`), `out/<id>-proto.mp4` approved, `06-motion-prompt.md` (only on request) |
| voice | `public/vo/<id>/`, `reels/<id>/words.json` re-timed on the recording |
| qa | `07a-critique-<id>.md` (scored critique rounds on `out/sheets/<id>/`), `07-qa-<id>.md`, `out/<id>.mp4` + `out/<id>-mix.wav` (`npm run render`), `out/<id>-preview.mp4`, then the mandatory **`07b-critique-<id>.md`** (the video, the workflow, plugin updates) |
| carousel (any time, own gate) | `<project>/carousel/<id>/`: `01-source.md`, `02-copy.md` (approved), `carousel.html`, `slide-NN.png`, `verification.json` (`scripts/carousel.mjs`), `report.md` |
| publish | `08-publish-<id>.md`, `out/<id>-cover-<n>.png` (only after `07b-critique-<id>.md` exists), copies of the render and every cover in `<project>/render/`, then once a cover is picked the posting folder `<project>/publish/` (`<id>.mp4`, `<id>-cover.png`, `<id>-caption.txt`) |

Each stage reads the previous files and updates `project.json` and `PROJECTS.md`, so the pipeline resumes after a restart.

## Token budget

Many users run this on plans with a limited token budget. Save tokens without cutting output:
- **Sessions are optional.** Every stage reads its state from files (`project.json`, `CLAUDE_<CODE>.md`, the stage outputs), not from chat history, so a fresh session loses nothing. Run the whole video in one session by default; only when the context runs low, continue in a new one with `/hookreel:resume <CODE>`.
- **Generate review pages, never type them.** `scripts/review-page.mjs` in this skill folder turns a stage's markdown into the HTML page to publish (`--cards` for the script). Edit the markdown, regenerate the page.
- **Read only the hook type you need.** HookLab templates are one file per type in `references/templates/` of the `hooklab` skill; never read all 15.
- **The humanizer runs once**, on the final caption or text, not on every reply.
- **`06-motion-prompt.md` only on request.**
- **Edit in place.** Change only the lines that change (video JSON, script, reports, director file); write a whole file only when it is created.
- **Compare, do not re-read.** After a storyboard or voiceover is regenerated, diff it against the previous version and read only what changed.
- **History at the bottom.** Stage files open with their status line and their content; version notes go in a `## Changes` section at the end (or in `DECISIONS.md`), so later stages read the content first.
- **Sheets before stills.** Check layout on `npm run sweep` and `npm run sheets`; take a full-size still (`npm run hf -- snapshot reels/<id> --at <s> --no-end`) only for a frame that looks wrong.
- **Filter command output.** `npm run render` prints errors and its totals only; long output (`check --json`) through `tail`, `grep` or a JSON filter for the lines that matter (errors, totals, loudness).

## Project codes

- Every project gets a unique code at `/hookreel:brief`: `HKR-YYMMDD-XXXX` (date plus four characters from `23456789ABCDEFGHJKMNPQRSTVWXYZ`).
- The code is in every name that must stay findable and must never collide: the project folder `<project>` = `hookreel-output/<CODE>_<slug>/`, the rulebook `CLAUDE_<CODE>.md`, the studio file `CLAUDE_<CODE>.md`, every video id `<CODE>-<name>` (so compositions, `videos/<id>.json`, `public/vo/<id>/`, storyboards and `out/<id>.mp4` all carry it).
- **Output root.** `hookreel-output/` in every hookreel file means the output root: `hookreel-output/` in the working directory by default, or the folder the workspace names instead (a line `hookreel output root: <path>` in the workspace `CLAUDE.md`, or the user's answer at stop 1, then written there). `PROJECTS.md` and every project folder live in it; `/hookreel:resume` searches it.
- Claude Code auto-loads only files named `CLAUDE.md`, so each folder's `CLAUDE.md` imports the coded files with `@CLAUDE_<CODE>.md` lines. Never delete another project's import line or coded file.
- `/hookreel:resume <CODE>` reopens a project; editing a stage marks every later stage `needs re-approval`.

## The project CLAUDE.md is the rulebook

Every project has `<project>/CLAUDE_<CODE>.md` (imported by the folder's `CLAUDE.md`) with three sections: **fixed rules** (brand voice, look, motion and time, sound, evidence), **rules for this video** (topic, pain, audience, storyline, CTA, approvals) and **bans** (claims, words and phrases, visuals, sound, process). Read it before every stage; it overrides defaults and framework examples. Bans are concrete items, never "avoid being generic". Every stage that learns a new rule or ban writes it there.

The rulebook is loaded into every session, so it holds **rules only**, one line each, without the story of how they came about. Who decided what and why, dates, rejected options and version history go to `<project>/DECISIONS.md` (append-only, read only when a rule is questioned).

## Review gates

Four stops per video, nothing else waits for the user:
1. **Brief:** one message, at most six questions plus the pre-filled brief; the reply is the confirmation.
2. **Story + script:** the script review shows the three hooks (recommended one in scene 1); one reply picks the hook and approves the script.
3. **Prototype:** one rendered scene, approved before any other scene is built.
4. **Final:** preview, covers and caption in one message; the user picks a cover or asks for fixes.

Facts run without a stop unless a claim is NOT FOUND or CONTRADICTED, or the user must choose an alternative. The other stops are the user's calls listed in `/hookreel:produce` (a changed line, claim, number or timing; a ban that cannot be met; a voice problem; a critique that does not pass).

- Nothing is built before the script is published and explicitly approved.
- One prototype scene (usually the hook) is rendered and sent before any other scene is built; the rest waits for an explicit approval of its look.
- The storyboard is optional (on request) and never blocks the build.
- A new claim, number or line after approval goes back to the user first.

## Time model: 30 fps, frame = f(t)

- 30 fps since 0.14.0 (60 fps took twice as long to render for no visible gain on a phone). Videos built at 60 fps keep working: they are timed in seconds.
- Every duration and offset is written in seconds (scene seconds, counted from the scene host's start); the frame is `F = round(t × 30)`. Never hard-code a frame count; anything that must happen "every n frames" is written as a rate per second.
- Every animated property is a pure function of timeline time. Each scene registers one **paused** GSAP timeline as `window.__timelines["s<scene id>"]`, and HyperFrames seeks it to every frame. Tweens use `fromTo` (never `from`, which drifts on seek-back) with ease-out `HR.EASE` (`power4.out`, close to cubic-bezier(0.16, 1, 0.3, 1)) or a `SPRING` preset (`HR.spr`); a value GSAP cannot tween goes through `HR.drive(tl, a, b, fn)`, `fn` a pure function of t. No CSS transitions or keyframe animations, `Math.random`, `Date`, timers or `tl.play()`: the frame at t must be the same picture in preview, snapshot and render.
- Custom scenes time every beat from the spoken words: `reels/<id>/words.json` (`npm run words`, character-aligned to the Whisper fragments, so a split or respelled word still lands on its fragment) read through `HR.at(scene, word, n)`. Never time beats by guessing or from the template's word aligner, which can run 0.3–1.1 s early.
- Give every beat time to finish its animation before the next one starts.
- The template look's data-driven visuals take their times from `src/plan.ts` of the legacy Remotion studio (`template-remotion/`; `npm run storyboard` prints it); that path is used only when the user asks for the template look.

## The brand comes from its context profile

- Voice, tone, hard rules, forbidden claims, colours, fonts, logo and motion rules come from the brand's context profile. Never import another brand's voice or the framework author's personal voice rules.
- In a brand studio the profile is `BRAND.md` (voice, compliance rules, disclaimers, CTA shape, pacing) plus `brand.json` (colour tokens, logo, `watermark`); the studio's `CLAUDE.md` imports `@BRAND.md`. Brand rules are never shipped in this plugin.
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

- For the ear: short sentences, one idea each, 10–30 words per scene, about 2.1 words per second (the old 2.5 left three reels 9–17 s over target).
- What is written is what is said, and what any caption or on-screen word shows.
- Hooks: 8–18 spoken words, understood in under a second, with a named payoff later in the video.
- The CTA says the exact action and what the viewer gets.

## Cues

A cue is the word or phrase, copied exactly from the scene's voiceover, on which something happens. In custom scenes it is an `HR.at()` lookup (`HR.at("03-why", "but")`, or `HR.at("03-why", "for", 1)` for the second time it is said), which throws if the word is not spoken in that scene.

## Custom motion (the default look)

**Creative mandate.** Every video is **new motion design built from all of the user's reference reels and the motion library**, written per beat as HyperFrames scenes in `reels/<id>/compositions/` with the engine's kit (`engine/kit/kit.js`, `engine/kit/kit.css`). Never the template's infographic-slide look: cards stacked top-left, a header and logo on every scene, one layout held for 10–17 s. Something fresh every time.

**Brand-neutral tools.** The 3D looks (`3d dialog`, `3d toons`), the kit's characters and worlds, and the motion library are neutral tools for any video and any brand; none of them is a default for one brand. Brand specifics (characters modelled on a person, colours, watermark, bans, disclaimers) live only in that brand's private studio and its project `CLAUDE_<CODE>.md`.

**Same for every brand.** The mandate, the motion library and the font library apply to every brand identically; there are no brand-specific variants of the look. Only a 3D character is brand-specific: opt-in per brand, from that brand's own character sheet, and a person's own character images never go into a public repository.

**Before designing any scene, read** `references/motion-library.md` in full (the user's core reference moves, the Instagram motion library, the transition set, the font library, shot sizes, the style brief menus, the not-a-slide checks, and section I's AI code-motion reference library — prompt architecture and signature moves to draw from when a beat needs something the library above does not already have) and the user's reference reels for this video (listed in `CLAUDE_<CODE>.md`; ask for them if missing).

**Fonts:** the font library in the engine's `engine/kit/kit.css`: `--display` / `.hr-display` (Open Sans 800, as "HR Display") for headlines and big numbers, `--sans` / `.hr-sans` (Rubik 500–700) for supporting text, labels and UI mockups, `--serif` / `.hr-serif` (Instrument Serif italic) for the accent on the key word.

What the references share; use it as the base, then invent beyond it:
- One idea per screen; beats on the spoken words, about 1.5–3 s each.
- Centred type with mixed sizes and weights; an italic serif (or another contrast face) for the key word.
- Lots of empty space; paper grain or a soft drifting glow; colour changes between scenes (wipes, circle reveals, pushes).
- Drawn props and UI mockups that move: receipts, stamps, calendars, toggles, notifications, chat or comment boxes, dials, rulers, progress rings, counters, letters that wobble or crumble.
- Elements enter, act and leave; nothing just appears and sits.

Rules:
- **Always fresh (mandatory).** Every video's result is fresh: never reuse a previous video's scene designs as they are. Each video logs its moves and transitions in `reels/<id>/moves.json`; `npm run fresh` fails on a move or transition repeated inside the video and warns on repeats from the brand's last 3 videos. Propose bold ideas.
- **No dead air, a hook that moves.** Something hero-sized is on screen whenever the voice speaks (no gap over about 1.2 s) and something moves in the first second. `npm run retention` checks both from `moves.json`, where every beat must carry `until` (the scene second its hero leaves; the lint fails without it), and fails on an `<img>` stretched out of its ratio.
- **Motion craft (every beat).** Main moves are never linear: they ease out, and hero entrances go anticipation → overshoot → settle (a spring with low damping). Things that land or hit squash and stretch for a few frames (`HR.squash`) and impacts get a short decaying shake (`HR.shake`). Parts of one object overlap and follow through: a label trails its object by about 0.05 s, a group enters staggered 0.04–0.07 s apart, never all at once. Build depth with at least a background, a midground and a foreground, and some secondary motion (grain, a drifting glow, a ±2 % breath), so no frame sits dead for more than about 0.5 s. Entrances are slow and firm (0.7–1.3 s), exits fast (0.35–0.55 s, `HR.life`). Key text stays fully readable for at least 0.35 s + 0.15 s per word. Every transition has its sound.
- **Shot sizes, not a breathing push (mandatory).** The camera changes shot size on the beat: close on the element that is speaking, back to wide, close on the next (`HR.camera` + `HR.SHOT` / `HR.frameOn`; motion library F). A push of a few percent reads as a still camera. Every beat logs its `shot` (`wide`, `medium`, `close`) in `moves.json`; `npm run fresh` fails on three beats in a row at one size. World inside the rig, labels and source lines outside it. UI demos move close to the tap (scale 1.4–2.2), not on every tap.
- **Not a slide (mandatory, checked).** One statement per beat: up to 6 words per on-screen line and at most two text tiers (one line + one world label); never kicker + title + body. Attention order: line, hero object, details. Sentence case; short phrases without a full stop. No template skeleton (hook → point → point → promise → logo → CTA, three tiles side by side, a typed search box, logo + CTA stacked in the centre). Every product, object, kind of person or number the voice names in a beat is on screen in that beat. Each beat logs its on-screen `text` in `moves.json`; `npm run retention` fails on 3 tiers or 7+ words. Motion library H.
- **Style brief per video (mandatory).** Before any scene: background motion, background surface (2+ layers, never flat), object render family, signature move, opener (first 3 s) and closing, picked from the menus in motion library G and written to `06-motion-<id>.md` and `reels/<id>/style.json`. `npm run fresh` fails when 3 of the 6 match one of the brand's last 3 videos. One beat is the **special moment** (`"special": true` in `moves.json`): the most expensive effect, used once.
- **No long holds.** No background or camera holds longer than about 5 s: change it with a transition (circle wipe, colour flood, swipe, zoom-through, mask reveal, object wipe; `HR.transition`; or a transition carried by an object, motion library C), a different one each time. Never slide the stage until its edge shows, never a preset spin or blur on every cut.
- Study all the references, not one; never copy their assets, brands or sounds.
- Text contrast at least 4.5:1 below 84 px and 3:1 above (`npm run contrast`).
- Kinetic captions are an option styled into the motion, for muted viewing (a captions block from the HyperFrames registry, `/hyperframes-registry`, timed from `words.json`); otherwise remind the user to turn on the platform's auto-captions.
- Gradients, glow, several colours and a background change per scene are allowed when the references call for them. A header or logo on every scene is not required. Burned-in captions are optional (only when the user asks).
- **Register first (mandatory).** Before deciding how a beat looks, decide which register it is in; a beat done well in the wrong register still fails:

  | The beat is… | Hero | Why |
  |---|---|---|
  | a **threat**: something taken, lost, broken, a bill arriving | **photoreal** (licensed photo or footage, or an AI image with its licence and the platform's AI label; a recognisable real person only with that person's permission) | it has to reach the danger reflex; a drawing does not. If the brand bans frightening visuals, keep it photoreal but calm (the aftermath, not the attack) or rewrite the beat |
  | a **screen**: "you have seen this exact screen" | **real screenshot**, cropped to the rows the beat is about, only when the brief allows screenshots **and** the owner of what is on it (the account holder, client or person whose data, name or messages show) has given permission | the viewer owns the real one; a copy is subtly wrong and reads as a lie. Screenshots not allowed: rewrite the beat so it no longer depends on recognising that screen |
  | a **concept** or a **sensation** (slow, hot, confusing, a waiting period) | **drawn**: props, type, abstract UI | nothing to photograph, no screen to show |

  **Never fake a UI.** No generated image or redrawn copy of a real product's screen presented as the real thing, and no invented numbers or messages inside a real app's look. An abstract mockup is fine: grey bars for text, simplified shapes, no pixel-for-pixel copy of a real app. Treat it as the drawn register. Record every permission (who, for which image, date) in `CLAUDE_<CODE>.md`; no permission, no screenshot or photo of that person or account.
- The brand's own bans in `CLAUDE_<CODE>.md` still apply (for example no frightening visuals).
- Style and process rules that are dropped for good: the template layouts and visual catalog as the default, one accent per scene, a single fixed background colour, no gradients or glow, a header on every scene, burned-in captions, the storyboard approval as a blocker. Do not bring them back unless the user asks.
- Rules that stay, because they protect licensed and regulated users: true numbers with source labels, the illustration label on hypotheticals, no guaranteed outcomes or claim promises, the required disclaimers, licensed or synthesised sound only (see Evidence and Audio).
- Beat timing: beats come from character-aligned word times (`npm run words`, built on the Whisper fragments); the template's word aligner can be 0.3–1.1 s early. Every beat gets time to finish its animation.

Safe area for 1080×1920: keep text inside x 80–1000 and above y ≈ 1500; the platform UI covers the bottom ~420 px and the right edge. Key words large (headlines at least 84 px), supporting text at least 32 px, source lines at least 26 px.

**3D looks (chosen in the brief).** `3d dialog` (two 3D characters talking in a 3D place) and `3d toons` (the characters over a screen recording) are made with video-3d-kit, an external tool in `~/.video-3d-kit`, called and never copied. Every gate, evidence rule and ban stays; the custom motion rules above do not apply. Read `references/look-3d-kit.md` before the script of a 3D video.

**Template look (only on request).** The data-driven template stays available in the legacy Remotion template (`template-remotion/`, a Remotion studio) when the user explicitly asks for it: `videos/<id>.json` visuals, `references/visual-catalog.md`, the `clean` and `playful` styles, `npm run storyboard`.

## Private library (optional)

Licensed assets the user owns but may not redistribute (sound packs, motion templates, footage) live in **`hookreel-library/`** in the working directory, next to `hookreel-output/` and `hookreel-studio/`, never in this plugin or any public repository. Its `LIBRARY.md` lists each asset with its licence and how to use it. When it exists:
- `/hookreel:build` reads `LIBRARY.md` with the motion library. Library templates and clips are **references**, like the user's reference reels: take timing, easing and sound placement, build new motion in HyperFrames, never render them as they are or copy their look; the always-fresh rule applies.
- Library sound effects are installed into the studio's `public/sfx/lib/` (git-ignored with the rest of `public/sfx`) with `npm run lib-sfx -- "<hookreel-library>/<pack>/sfx"`, which peak-normalises each to -6 dBFS like the synthesised set (a plain copy peaked the mix near 0 dBTP), and named `lib/<name>` in `moves.json` and `assets/sfx/lib/<name>.wav` in the scene's `<audio>`. They count as licensed sounds: their licence line from `LIBRARY.md` goes into `CLAUDE_<CODE>.md` and the QA report.
- Never copy library files into the plugin, a public repository or anything shared; never put the library vendor's name or logo into a video.

## Renderer: HyperFrames

Since 0.18.0 every video is a HyperFrames project (HTML + GSAP, rendered by headless Chrome; `npx hyperframes`, pinned to 0.8.188 as `npm run hf`). The tools are the npm package **`hookreel-engine`** (this plugin's repository root; `engine/kit/` = `kit.js`, `kit.css`, fonts; `engine/scripts/` = every tool; `engine/src/` = `motion.mjs`, `align.mjs`; CLI `hookreel <command>`, `engine/cli.mjs`). A brand studio is a thin copy of `template/`: brand data only, the engine as its one dependency (`github:lawzphilemon/hookreel-plugin#main`, allowed by `allow-git=root` in its `.npmrc`), every npm script mapped to `hookreel <command>`. Never copy engine code into a studio; `npm run update-engine` brings the latest engine. A studio is its own repository, private when it holds licensed or personal assets (for example `<owner>/acme-studio`, cloned to `hookreel-studio/acme-studio/`); `.env.local` never goes into git. Studios made before 0.18.0 are Remotion studios (their own `scripts/` and `src/proto/`) and keep their own copied tooling for their old videos (`template-remotion/README.md`); new videos for that brand go in its engine studio. `template-remotion/` also serves the template look. Read the `hyperframes` skill for the composition contract; voice, music, sound, source lines and every gate (facts, script, prototype, qa) stay in hookreel.
- **One project per video:** `reels/<id>/`. Scenes are written by hand in `compositions/<scene id>.html`; `npm run assemble -- <id>` writes `index.html` (scene hosts back to back, the voice clips at `data-volume` 0.8, the music bed ducked under the voice in Node) and `assets/` (the kit and fonts copied from the engine, `words.js`, voice, music, and every `assets/<path>` a scene names, copied from `public/<path>`). Never edit `index.html` or `assets/` by hand; rerun assemble after the words, the scene list or the music change.
- **Scene contract:** everything inside `<template>`; the root `<div id="root" data-composition-id="s<scene id>" data-width="1080" data-height="1920">`, styled as `#root` (`position: absolute; inset: 0`); every element id prefixed per scene (`#hook-title`); one paused timeline registered as `window.__timelines["s<scene id>"]`; `fromTo`, not `from`; no `Date`, `Math.random` or timers. Two layers: the world inside `HR.camera`, and every text, label and source line in one `<div class="hr-screen">` after it (kit.css: absolute, inset 0, `z-index: 10`), so no transformed prop paints over the text. Sound effects are clips inside the scene: `<audio id="hook-sfx-stamp" class="clip" data-start="<scene second>" data-volume="0.5" src="assets/sfx/<name>.wav">`.
- **Kit:** the global `HR` (`engine/kit/kit.js`): `HR.at(scene, word, n)` (the scene second a word is spoken; throws on a typo), `HR.secs`, `HR.life`, `HR.word` (focus-in), `HR.spr` with `SPRING` presets, `HR.drive(tl, a, b, fn)`, `HR.camera` with `HR.SHOT` and `HR.frameOn`, `HR.shake`, `HR.squash`, `HR.grain` (on a `.hr-grain` layer) and `HR.transition` (`circle`, `flood` with `o.cover`, `swipe`, `zoom`, `mask`, `object` with `o.shape`). `engine/kit/kit.css`: the font variables, `.hr-display`, `.hr-sans`, `.hr-serif`, `.hr-fill`, `.hr-screen` (the text layer above the world), `.hr-grain`, `.hr-source` (a source line on its backing).
- **Watermark:** `brand.json` → `watermark` (`{ "src": "brand/<logo>.png", "mode": "tile" | "corner" }`, optional `opacity`, `height`, `stepX`, `stepY`, `offset`, `margin`, `inAt`) is drawn by `npm run assemble` over every scene: it fades in after the hook (`inAt` 1.2 s) and steps aside on the last scene (the end card). `"watermark": "off"` (or an object override) in `videos/<id>.json` only when the brand allows it.
- **Look and check:** `npm run dev` (HyperFrames preview and Studio; the desktop app via `npx hyperframes open` is optional), `npm run hf -- snapshot reels/<id> --at <s>` for stills, `npm run hf -- check reels/<id> --json` (lint, runtime and layout: fix every error, weigh every warning).
- **Render:** `npm run render -- <id>` (assemble, render with parallel workers, frame-count check, the mix's loudness printed). An 18.8 s reel took about 0.9 min on the author's laptop (Remotion took about 25 min for 92 s), so a fix simply re-renders.
- **Setup:** a studio from `template/` and `npm install` (fetches the engine, generates the sound effects); Node 22.18+, FFmpeg and FFprobe on `PATH` (Windows: `winget install --id Gyan.FFmpeg -e`); HyperFrames fetches its Chrome (`npx hyperframes doctor` checks all three). Set `HYPERFRAMES_NO_TELEMETRY=1` and send no `hyperframes feedback` reports unless the user agrees.
- **Same rules:** the creative mandate and always-fresh rule apply (no HyperFrames registry block or template look as it is); private library files and brand-only characters (for example one modelled on a real person) never go into a HyperFrames project that is shared or public; HyperFrames itself is Apache-2.0 (checked 2026-10-21, v0.8.183); any registry block, font or media it pulls in is checked before the first commercial use and noted in `CLAUDE_<CODE>.md`.
- **Routing:** inside a hookreel project a request for a video means `/hookreel`; the HyperFrames skills serve the build (contract, CLI, registry). Outside hookreel, its own skills serve their own jobs (`embedded-captions`, `talking-head-recut`, `slideshow`).

## Audio

- Voiceover: one take per video (a recording, or a TTS voice clone with the AI label: `/hookreel:voice`), upmixed to stereo and normalised to -16 LUFS with -3 dBTP peaks by `npm run vo` (a recording) or `npm run tts` (ElevenLabs with character times, no Whisper).
- Too long or too loose: cap the pauses in the existing take (`npm run trim`, default 0.3 s, never below 0.18 s), then tighten holds, and only then rewrite and re-record. Never speed the voice up and never drop a step to hit a length.
- Music: optional. Either original music synthesised from code (`npm run music -- <id> --mood energetic|cheerful|chill|dramatic`, no licence needed, remade after every new recording) or a rights-cleared track normalised into the project. Ducked about 13 dB under the voice and 8 dB in pauses (`npm run assemble` ducks it in Node).
- Sound effects follow the picture: every transition and every key beat has its sound, named per beat in `moves.json` (`sfx`, or `"none"` for a deliberate silence); `npm run retention` fails on a transition or a whole scene without one.
- Sound placement: an effect starts 2–3 frames before its visual lands (late sounds read as broken sync). A riser ends exactly on its hit. One impact per video, on the `special` beat. Tonal effects (chimes, blips, pops) share one musical key with the music, and pitch rises with progress and resolves on the payoff. Pan follows the hero's position on screen (-1 left … +1 right); a sequence of pops sweeps across the field. Accent, don't narrate: continuous motion (drift, grain, breath) stays silent. Music and effects drop about 1 s before the turn beat of the story (picture holds), so the turn lands in the quiet.
- Sound effects: synthesised in the project (`npm run sfx`, no licence needed), from the private library (`lib/<name>`, licence line from `LIBRARY.md`) or files with a commercial licence note; intensity `off | subtle | medium | dramatic`. Never meme sounds or sounds lifted from songs, films, cartoons or games.
- Final mix: integrated about -16 to -17 LUFS, true peak at or below -0.5 dBTP, printed by `npm run render` for `out/<id>-mix.wav` (BS.1770 in plain Node, also `npm run loudness -- <file.wav>`).

## Self-critique (mandatory)

Right after a video is finished (after QA and render, before the cover and caption), write `<project>/07b-critique-<id>.md`: an honest critique of the video with evidence, then an evaluation of the workflow that produced it, then a **Plugin: must update** table. When a new way of working gave a better outcome than the plugin's current way, tell the user the plugin must be updated and offer to do it. `/hookreel:publish` does not start without this file.

## Don'ts

- No invented numbers, results, prices, quotes or client names.
- No claim the video does not pay off.
- No downloaded or ripped music without a licence note.
- Do not overwrite a user's edited files in an existing studio.
