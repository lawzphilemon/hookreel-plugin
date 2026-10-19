# HOOKREEL Short Video Pipeline

Claude Code plugin that turns an interview into a finished short vertical video (Instagram Reels, TikTok, YouTube Shorts) for **any brand**, driven by that brand's context profile.

Interview → verified facts → a story built with the WTF Hook 999 framework → voiceover script → a Remotion video with **new motion design for every video**, invented per beat from your reference reels (approved on a rendered prototype scene first), beats timed on the spoken words, synthesised sound effects and music ducking.

## Install

```text
/plugin marketplace add lawzphilemon/hookreel-plugin
/plugin install hookreel@hookreel-plugin
```

The storyboard and video stages need Node.js 22.18 or newer.

## Pipeline

```text
/hookreel:brief → /hookreel:facts → /hookreel:story → /hookreel:script → /hookreel:build → /hookreel:voice → /hookreel:qa → /hookreel:publish
/hookreel:resume <CODE>
```

| Command | Stage | Output |
|---|---|---|
| `/hookreel:brief` | Interview in four rounds: brand context profile, topic, pain and why, audience awareness, evidence, proof, format, CTA, voice, music, sound effects, visual dislikes. Gives the project a unique code and writes its rulebook **CLAUDE_<CODE>.md**: fixed rules, rules for this video, and concrete bans so nothing comes out generic. | `hookreel-output/<CODE>_<slug>/01-brief.md`, `CLAUDE_<CODE>.md`, `project.json` |
| `/hookreel:facts` | Every number and claim verified against primary sources, dated, estimates labelled; allowed and forbidden claims | `02-facts.md` |
| `/hookreel:story` | WTF Hook 999: three hooks per video (Gain, Pain, Curiosity), beat sheets; keeps your own storyline if you give one | `03-story.md` |
| `/hookreel:script` | Exact voiceover per scene, a sketch of each beat on screen, cue words, checked against the bans. **Published for you to read and approve.** Once approved, writes the recording guide: how to record, pronunciation, lines per scene, recording status. | `04-script.md`, `VOICEOVER_<CODE>.md` |
| `/hookreel:build` | Studies all your reference reels, designs new motion per beat, renders **one prototype scene for your approval**, then builds every scene in the brand's Remotion studio (`src/proto/<id>/`), checks each beat visually; on request, writes a standalone Remotion prompt built on frame = f(t) | `06-motion-<id>.md`, `hookreel-studio/<brand>/`, `out/<id>-proto.mp4` |
| `/hookreel:voice` | One recorded take per video: normalised, transcribed locally, cut per scene, every beat re-timed on the spoken words (character-aligned), mix loudness checked | `public/vo/<id>/`, `src/proto/<id>/words.json` |
| `/hookreel:storyboard` | Optional, on request: frame-exact storyboard of the template look, second by second. Never a gate. | `05-storyboard-<id>.md` |
| `/hookreel:qa` | Layout sweep, sync, freshness (no repeated moves, no holds over ~5 s), contrast, sources, stale facts, audio, licences and every ban; MP4 render and preview encode; then a **mandatory self-critique** of the video and the workflow, with plugin updates when a better way was found | `07-qa-<id>.md`, `out/<id>.mp4`, `07b-critique-<id>.md` |
| `/hookreel:publish` | Three cover variants scored with the creator-os hook rubric, rendered as stills with a profile-grid (3:4) preview; the post caption with creator-os (a second hook in the first two lines, value, the video's CTA, hashtags) plus sources, disclaimers and music credit, checked against every ban | `08-publish-<id>.md`, `out/<id>-cover-<n>.png` |
| `/hookreel:carousel` | A source post (Threads, X, LinkedIn, notes) into a 4:5 photo carousel: raw transcript with unreadable parts marked, one-idea-per-slide copy **for your approval**, brand-styled editable HTML, PNG slides rendered with headless Chrome and checked (size, numbering, smallest font, overflow), production report | `carousel/<id>/` in the project |
| `/hookreel:resume <CODE>` | Reopens a project by its code: loads its rulebook, shows every stage and video, routes edits, and marks later stages for re-approval | — |

Nothing is built before the script is approved, and no scene beyond the prototype before the prototype is approved.

**Token budget.** Built to run on plans with limited tokens: each stage reads its state from files, so you can start a new session between stage groups (`/hookreel:resume <CODE>`); review pages are generated from the markdown instead of typed out; hook templates load one type at a time; the humanizer runs once on the final text; the standalone Remotion prompt is written only on request.

The plugin bundles the **WTF Hook 999** skills (`wtf-hook-999`, `-generator`, `-auditor`, `-optimizer`, from [lawzphilemon/wtf-hook-999](https://github.com/lawzphilemon/wtf-hook-999), MIT): `/hookreel:story` builds the hooks with them, and they work on their own for any hook. No separate install needed.

The plugin also bundles **humanizer-id** and **humanizer-en**, passive filters that remove AI writing patterns from Indonesian and English text; `/hookreel:publish` runs them on the caption.

The plugin also bundles the **creator-os** skill (hook frameworks, 150 hook templates, script structures, caption format, content calendar, performance analysis, monetisation). `/hookreel:publish` uses it for the cover hooks and the caption; it also works on its own for any hook, caption or content-plan request.

**Project codes.** Every project gets a code like `HKR-261012-7QF3`. It names the folder (`hookreel-output/HKR-261012-7QF3_chatgpt-ads-wa/`), both rulebooks (`CLAUDE_HKR-261012-7QF3.md` in the project and in the studio, each imported by a plain `CLAUDE.md` so Claude Code loads them automatically) and every video (`HKR-261012-7QF3-teaser`), and is listed in `hookreel-output/PROJECTS.md`. Come back any time with `/hookreel:resume HKR-261012-7QF3`. Each brand gets one studio folder, so several brands can share a machine.

## The template

`template/` is a Remotion project. By default it is **tooling** for custom motion: `src/proto/kit.tsx` (focus-in words, grain, glow, sound effects, voiceover clips, source lines, spoken-word times, `protoReel`), `npm run vo` (voiceover prep), `npm run words` (character-aligned word times, `--estimate` before recording), `npm run sfx` (synthesised sound effects), `npm run loudness` (BS.1770 loudness and peaks in plain Node), `npm run trim` (caps the pauses in a take, no retake), `npm run retention` (fails on dead air, a slow hook, a silent transition or scene and stretched images), `npm run music` (original background music synthesised from code, four moods), `npm run refcuts` (cut rhythm of a reference reel) and render. Each video's scenes are written new in `src/proto/<id>/`.

When the template look is chosen, a video is data, not code:

- `brand.json`: semantic colour tokens (works on dark and light backgrounds), Google Fonts by name, logo, corner radius, entrance timing.
- `videos/<id>.json`: scenes, each with its voiceover line, one visual and optional cues. See `template/src/schema.ts`.
- Two styles in `brand.json`: `clean` (fade-and-rise, nothing loops) and `playful` (bouncy pop entrances, floating elements, AI 3D cartoon characters).
- 15 visual types: headline, stat (with a 1-in-100 dot grid), ranking, tiles, timeline, bars, flow, chat, journey, ui, list, logo, character (AI 3D cartoon, mascot or illustrated scene from an image or clip), swap and cta. Every type except character (it needs your own image files) in use: `reference/all-visuals.json`.
- **60 fps, frame = f(t):** every time is in seconds (`src/motion.ts`); `src/plan.ts` decides when everything happens and which sounds play, for both the render and `npm run storyboard`.
- `npm run check` validates cues, colours and files; `npm run storyboard -- <id>` prints the frame-exact storyboard; `npm run vo` handles the voiceover; `npm run sfx` regenerates the sound effects.

Breakdowns of past videos (scene by scene, with code patterns): `skills/hookreel-rules/references/motion-library.md` → E. Past work.

The pause trim, the retention lint and the register rule (threat → photoreal, screen → real screenshot, concept → drawn; never fake a UI) are adapted from ideas in [Hyperframe Pro](https://github.com/buildwithhanif/hyperframe-pro) (MIT), rewritten for Remotion and recorded voiceovers.

## Principles

- **Evidence first.** No number on screen without a source label; estimates say so.
- **The brand's voice, not ours.** Everything about tone, claims and look comes from the context profile.
- **Revise on paper, then on one scene.** Hooks, beats and the script are approved before anything is built; the look is approved on one rendered prototype scene.
- **Fresh every time, same rules for every brand.** Each video's motion is invented from your reference reels and the motion library (`skills/hookreel-rules/references/motion-library.md`), set in one font library (Open Sans, Rubik, Instrument Serif); only a 3D character is brand-specific.
- **No surprise licences.** Sound effects are synthesised; music and recordings stay out of public repositories.

## License

MIT
