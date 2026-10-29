# HOOKREEL Short Video Pipeline

> [!IMPORTANT]
> # ⚠️ Untuk penggunaan pribadi, tidak dijual
> # ⚠️ For personal use, not for sale
>
> **Plugin ini dibuat oleh Lawrence Philemon untuk penggunaan pribadi dan tidak dijual.**
> Tidak ada versi berbayar, langganan, atau layanan resmi di balik repositori ini. Kalau ada yang menjual plugin ini atau menawarkannya sebagai produk berbayar, itu bukan dari pembuatnya.
>
> **This plugin is made by Lawrence Philemon for personal use and is not sold.**
> There is no paid version, subscription or official service behind this repository. Anyone selling it or offering it as a paid product is not its author.

Claude Code plugin that turns an interview into a finished short vertical video (Instagram Reels, TikTok, YouTube Shorts) for **any brand**, driven by that brand's context profile.

Interview → verified facts → a story built with the HookLab framework → voiceover script → a [HyperFrames](https://github.com/heygen-com/hyperframes) video (HTML + GSAP) with **new motion design for every video**, invented per beat from your reference reels (approved on a rendered prototype scene first), beats timed on the spoken words, synthesised sound effects and music ducking.

## Install

```text
/plugin marketplace add lawzphilemon/hookreel-plugin
/plugin install hookreel@hookreel-plugin
```

The video stages need Node.js 22.18 or newer and FFmpeg with FFprobe on `PATH` (Windows: `winget install --id Gyan.FFmpeg -e`). HyperFrames (pinned to 0.8.188) runs through `npx` and fetches its own Chrome; `npx hyperframes doctor` checks the setup.

## Pipeline

```text
/hookreel:make [topic]     (one command, the whole video, four stops)
/hookreel:brief → /hookreel:facts → /hookreel:story → /hookreel:script → /hookreel:build → /hookreel:voice → /hookreel:qa → /hookreel:publish
/hookreel:produce <id>     (after the prototype: voice, qa, cover and caption in one run)
/hookreel:resume <CODE>
```

**Four stops per video.** You reply four times; everything in between runs on its own:
1. **Brief:** one message with at most six questions and the rest pre-filled. Your answer confirms it.
2. **Story + script:** the script review with three hooks on top. Pick one (or keep the recommended) and approve.
3. **Prototype:** one rendered scene. Approve the look.
4. **Final:** preview, cover variants and caption together. Pick a cover; the posting folder follows.

Facts are checked without a stop unless a claim cannot be verified or contradicts the brief.

| Command | Stage | Output |
|---|---|---|
| `/hookreel:make` | The whole pipeline below in one run, stopping only at the four stops (plus a failed claim, or a call only you can make). If the context runs low, continue with `/hookreel:resume <CODE>`. | everything below |
| `/hookreel:brief` | One message: at most six questions (topic and pain, audience awareness, sources and numbers, proof and must-not-claim, CTA, reference reels) and the rest pre-filled from the brand preset or defaults; your reply confirms it. Gives the project a unique code and writes its rulebook **CLAUDE_<CODE>.md**: fixed rules, rules for this video, and concrete bans so nothing comes out generic. | `hookreel-output/<CODE>_<slug>/01-brief.md`, `CLAUDE_<CODE>.md`, `project.json` |
| `/hookreel:facts` | Every number and claim verified against primary sources, dated, estimates labelled; allowed and forbidden claims. Asks only when a claim fails | `02-facts.md` |
| `/hookreel:story` | HookLab: three hooks per video (Gain, Pain, Curiosity), beat sheets; keeps your own storyline if you give one. Reviewed with the script | `03-story.md` |
| `/hookreel:script` | Exact voiceover per scene, a sketch of each beat on screen, cue words, checked against the bans. **Published for you to read and approve, with the three hooks on top: one reply picks the hook and approves.** Holds the pronunciation table for the voice. When a human records, writes the recording guide: how to record, pronunciation, lines per scene, recording status. | `04-script.md`, `VOICEOVER_<CODE>.md` (recorded voice only) |
| `/hookreel:build` | Studies all your reference reels, designs new motion per beat, renders **one prototype scene for your approval**, then builds every scene in the brand's HyperFrames studio (`reels/<id>/compositions/`, one HTML file per scene), checks each beat visually; on request, writes a standalone HyperFrames/GSAP prompt built on frame = f(t) | `06-motion-<id>.md`, `hookreel-studio/<brand>/`, `out/<id>-proto.mp4` |
| `/hookreel:voice` | One recorded take per video: normalised, transcribed locally, cut per scene, every beat re-timed on the spoken words (character-aligned), mix loudness checked | `public/vo/<id>/`, `reels/<id>/words.json` |
| `/hookreel:storyboard` | Optional, on request: frame-exact storyboard of the template look, second by second. Never a gate. | `05-storyboard-<id>.md` |
| `/hookreel:produce` | After the prototype is approved, one run without stops between stages: the remaining scenes built in parallel, the voice (an ElevenLabs take with exact word times, or a recording), every check, the critique loop on stills until every score is 8+, the render (minutes, so a fix simply re-renders), QA, the self-critique, then the cover variants and caption, sent together with the preview | everything `/hookreel:voice`, `/hookreel:qa` and `/hookreel:publish` write |
| `/hookreel:qa` | Layout sweep, sync, freshness (no repeated moves, no holds over ~5 s, shot sizes that change, a new style brief), not-a-slide text checks, contrast, sources, stale facts, audio, licences and every ban; `hyperframes check` (lint, runtime, layout); MP4 render with the mix loudness printed, and preview encode; then a **mandatory self-critique** of the video and the workflow, with plugin updates when a better way was found | `07-qa-<id>.md`, `out/<id>.mp4`, `07b-critique-<id>.md` |
| `/hookreel:publish` | Three cover variants scored with the creator-os hook rubric, built as still HyperFrames pages and rendered with a profile-grid (3:4) preview; the post caption with creator-os (a second hook in the first two lines, value, the video's CTA, hashtags) plus sources, disclaimers and music credit, checked against every ban | `08-publish-<id>.md`, `out/<id>-cover-<n>.png` |
| `/hookreel:carousel` | A source post (Threads, X, LinkedIn, notes) into a 4:5 photo carousel: raw transcript with unreadable parts marked, one-idea-per-slide copy in your own voice or the client's brand voice **for your approval**, brand-styled editable HTML, PNG slides rendered with headless Chrome and checked (size, numbering, smallest font, overflow), production report | `carousel/<id>/` in the project |
| `/hookreel:resume <CODE>` | Reopens a project by its code: loads its rulebook, shows every stage and video, routes edits, and marks later stages for re-approval | — |

Nothing is built before the script is approved, and no scene beyond the prototype before the prototype is approved.

**Token budget.** Built to run on plans with limited tokens: each stage reads its state from files, so a video runs in one session, and if the context runs low you continue in a new one with `/hookreel:resume <CODE>`; review pages are generated from the markdown instead of typed out; hook templates load one type at a time; the humanizer runs once on the final text; the standalone motion prompt is written only on request.

The plugin bundles the **HookLab** skills (`hooklab`, `-generator`, `-auditor`, `-optimizer`): `/hookreel:story` builds the hooks with them, and they work on their own for any hook. No separate install needed.

The plugin also bundles **humanizer-id** and **humanizer-en**, passive filters that remove AI writing patterns from Indonesian and English text; `/hookreel:publish` runs them on the caption.

The plugin also bundles the **creator-os** skill (hook frameworks, 150 hook templates, script structures, caption format, content calendar, performance analysis, monetisation). `/hookreel:publish` uses it for the cover hooks and the caption; it also works on its own for any hook, caption or content-plan request.

**Project codes.** Every project gets a code like `HKR-261012-7QF3`. It names the folder (`hookreel-output/HKR-261012-7QF3_chatgpt-ads-wa/`), both rulebooks (`CLAUDE_HKR-261012-7QF3.md` in the project and in the studio, each imported by a plain `CLAUDE.md` so Claude Code loads them automatically) and every video (`HKR-261012-7QF3-teaser`), and is listed in `hookreel-output/PROJECTS.md`. Come back any time with `/hookreel:resume HKR-261012-7QF3`. Each brand gets one studio folder, so several brands can share a machine.

## The template

`template/` is the HyperFrames studio, copied once per brand to `hookreel-studio/<brand>/` (`npm install`). Each video is a HyperFrames project in `reels/<id>/`: one hand-written HTML composition per scene in `compositions/`, plus `words.json`, `moves.json` and `style.json`; `npm run assemble` writes the root `index.html` (scenes back to back, voice clips, music ducked under the voice) and `assets/`. The kit is the global `HR` in `kit/kit.js` (spoken-word times, slow-in fast-out life, focus-in words, springs, a shot-size camera, shake, squash, grain, transitions including an object wipe; every helper adds tweens to the scene's paused GSAP timeline, so frame = f(t)) and `kit/kit.css` (the font library, grain, source lines). The rest is **tooling**: `npm run vo` (voiceover prep), `npm run words` (character-aligned word times, `--estimate` before recording), `npm run sfx` (synthesised sound effects), `npm run loudness` (BS.1770 loudness and peaks in plain Node), `npm run trim` (caps the pauses in a take, no retake), `npm run retention` (fails on dead air, a slow hook, a silent transition or scene, stretched images and slide text: 3 tiers or 7+ words on screen), `npm run fresh` (repeated moves, long holds, a camera stuck at one shot size, a style brief too close to recent videos), `npm run music` (original background music synthesised from code, four moods), `npm run refcuts` (cut rhythm of a reference reel), `npm run tts` (an ElevenLabs take with character times, no Whisper), `npm run sheets` (critique sheets and the 8+ score gate), `npm run sweep` (the layout check), `npm run dev` (HyperFrames preview and Studio), `npm run render` (the MP4 with parallel workers, frame-count check and mix loudness; an 18.8 s reel renders in about a minute), `npm run cover` (cover stills with the grid preview). Each video's scenes are written new.

`template-remotion/` is the Remotion studio of hookreel before 0.18.0. It stays for studios made with it and for the template look below. Old studios keep their own tooling for their old videos. New videos for that brand go in a new HyperFrames studio beside the old one, `hookreel-studio/<brand>-hf/`.

When the template look is chosen (a Remotion studio from `template-remotion/`), a video is data, not code:

- `brand.json`: semantic colour tokens (works on dark and light backgrounds), Google Fonts by name, logo, corner radius, entrance timing.
- `videos/<id>.json`: scenes, each with its voiceover line, one visual and optional cues. See `template-remotion/src/schema.ts`.
- Two styles in `brand.json`: `clean` (fade-and-rise, nothing loops) and `playful` (bouncy pop entrances, floating elements, AI 3D cartoon characters).
- 15 visual types: headline, stat (with a 1-in-100 dot grid), ranking, tiles, timeline, bars, flow, chat, journey, ui, list, logo, character (AI 3D cartoon, mascot or illustrated scene from an image or clip), swap and cta. Every type except character (it needs your own image files) in use: `reference/all-visuals.json`.
- **30 fps, frame = f(t):** every time is in seconds (`src/motion.ts`); `src/plan.ts` decides when everything happens and which sounds play, for both the render and `npm run storyboard`.
- `npm run check` validates cues, colours and files; `npm run storyboard -- <id>` prints the frame-exact storyboard; `npm run vo` handles the voiceover; `npm run sfx` regenerates the sound effects.

Videos render with [HyperFrames](https://github.com/heygen-com/hyperframes) by HeyGen (Apache-2.0); older studios and the template look use [Remotion](https://www.remotion.dev).

Breakdowns of past videos (scene by scene, with code patterns): `skills/hookreel-rules/references/motion-library.md` → E. Past work.

The pause trim, the retention lint and the register rule (threat → photoreal, screen → real screenshot, concept → drawn; never fake a UI) are adapted from ideas in [Hyperframe Pro](https://github.com/buildwithhanif/hyperframe-pro) (MIT), rewritten for hookreel and recorded voiceovers.

The shot-size camera, the not-a-slide checks, the style brief menus (background motion, surface, render family, first 3 seconds, closing, several points without three tiles), the object transitions and the one-line revision protocol are adapted from the **Motion Format** skill v1.0.0 (MIT), built on [Bang Motion](https://github.com/bangtutorial/bang-motion) by Bang Tutorial (MIT), rewritten for vertical reels.

## Principles

- **Evidence first.** No number on screen without a source label; estimates say so.
- **The brand's voice, not ours.** Everything about tone, claims and look comes from the context profile.
- **Shipped brand presets** in `brands/<brand>/` (`brand.json` + `CLAUDE.md`): a brand's colour tokens, voice, compliance rules, end-card disclaimers, CTA shape and measured pacing, so `/hookreel:brief` starts from the brand instead of a blank interview. `brands/truemission/` is the first one; private assets (logo, watermark, recordings, SFX library) are never in the repository and are added inside the studio's `public/`.
- **Revise on paper, then on one scene.** Hooks, beats and the script are approved before anything is built; the look is approved on one rendered prototype scene.
- **Fresh every time, same rules for every brand.** Each video's motion is invented from your reference reels and the motion library (`skills/hookreel-rules/references/motion-library.md`), set in one font library (Open Sans, Rubik, Instrument Serif); only a 3D character is brand-specific.
- **No surprise licences.** Sound effects are synthesised; music and recordings stay out of public repositories.

## License

MIT
