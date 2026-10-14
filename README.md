# HOOKREEL Short Video Pipeline

Claude Code plugin that turns an interview into a finished short vertical video (Instagram Reels, TikTok, YouTube Shorts) for **any brand**, driven by that brand's context profile.

Interview → verified facts → a story built with the WTF Hook 999 framework → voiceover script → a Remotion video with infographics, recreated UI mockups, burned-in captions, word-accurate voiceover sync, synthesised sound effects and music ducking.

## Install

```text
/plugin marketplace add lawzphilemon/hookreel-plugin
/plugin install hookreel@hookreel-plugin
```

The storyboard and video stages need Node.js 22.18 or newer.

## Pipeline

```text
/hookreel:brief → /hookreel:facts → /hookreel:story → /hookreel:script → /hookreel:storyboard → /hookreel:build → /hookreel:voice → /hookreel:qa → /hookreel:publish
/hookreel:resume <CODE>
```

| Command | Stage | Output |
|---|---|---|
| `/hookreel:brief` | Interview in four rounds: brand context profile, topic, pain and why, audience awareness, evidence, proof, format, CTA, voice, music, sound effects, visual dislikes. Gives the project a unique code and writes its rulebook **CLAUDE_<CODE>.md**: fixed rules, rules for this video, and concrete bans so nothing comes out generic. | `hookreel-output/<CODE>_<slug>/01-brief.md`, `CLAUDE_<CODE>.md`, `project.json` |
| `/hookreel:facts` | Every number and claim verified against primary sources, dated, estimates labelled; allowed and forbidden claims | `02-facts.md` |
| `/hookreel:story` | WTF Hook 999: three hooks per video (Gain, Pain, Curiosity), beat sheets; keeps your own storyline if you give one | `03-story.md` |
| `/hookreel:script` | Exact voiceover per scene, visuals, cue phrases, checked against the bans. **Published for you to read and approve.** Once approved, writes the recording guide: how to record, pronunciation, lines per scene, recording status. | `04-script.md`, `VOICEOVER_<CODE>.md` |
| `/hookreel:storyboard` | Perfectionist-grade storyboard per video: composition, every movement, every sound effect, captions and words, in seconds and frames (60 fps, frame = f(t)), second by second. Computed by the same code that renders. **Published for you to read and approve.** | `05-storyboard-<id>.md` |
| `/hookreel:build` | Releases the approved draft into the brand's Remotion studio, writes the studio's `CLAUDE_<CODE>.md`, validates, checks every scene visually, and writes a standalone Remotion prompt built on frame = f(t) | `hookreel-studio/<brand>/`, `06-remotion-prompt.md` |
| `/hookreel:voice` | One recorded take per video: normalised, transcribed locally, cut per scene, visuals and captions synced to the spoken words, storyboard regenerated as recorded, mix checked | `public/vo/<id>/`, `05-storyboard-<id>.recorded.md` |
| `/hookreel:qa` | Layout, sync, sources, stale facts, audio, licences and every ban; MP4 render | `07-qa-<id>.md`, `out/<id>.mp4` |
| `/hookreel:publish` | Three cover variants scored with the creator-os hook rubric, rendered as stills with a profile-grid (3:4) preview; the post caption with creator-os (a second hook in the first two lines, value, the video's CTA, hashtags) plus sources, disclaimers and music credit, checked against every ban | `08-publish-<id>.md`, `out/<id>-cover-<n>.png` |
| `/hookreel:resume <CODE>` | Reopens a project by its code: loads its rulebook, shows every stage and video, routes edits, and marks later stages for re-approval | — |

Nothing goes into Remotion before the script and the storyboard are approved.

The plugin bundles the **WTF Hook 999** skills (`wtf-hook-999`, `-generator`, `-auditor`, `-optimizer`, from [lawzphilemon/wtf-hook-999](https://github.com/lawzphilemon/wtf-hook-999), MIT): `/hookreel:story` builds the hooks with them, and they work on their own for any hook. No separate install needed.

The plugin also bundles the **creator-os** skill (hook frameworks, 150 hook templates, script structures, caption format, content calendar, performance analysis, monetisation). `/hookreel:publish` uses it for the cover hooks and the caption; it also works on its own for any hook, caption or content-plan request.

**Project codes.** Every project gets a code like `HKR-261012-7QF3`. It names the folder (`hookreel-output/HKR-261012-7QF3_chatgpt-ads-wa/`), both rulebooks (`CLAUDE_HKR-261012-7QF3.md` in the project and in the studio, each imported by a plain `CLAUDE.md` so Claude Code loads them automatically) and every video (`HKR-261012-7QF3-teaser`), and is listed in `hookreel-output/PROJECTS.md`. Come back any time with `/hookreel:resume HKR-261012-7QF3`. Each brand gets one studio folder, so several brands can share a machine.

## The template

`template/` is a Remotion project where a video is data, not code:

- `brand.json`: semantic colour tokens (works on dark and light backgrounds), Google Fonts by name, logo, corner radius, entrance timing.
- `videos/<id>.json`: scenes, each with its voiceover line, one visual and optional cues. See `template/src/schema.ts`.
- 14 visual types: headline, stat (with a 1-in-100 dot grid), ranking, tiles, timeline, bars, flow, chat, journey, ui, list, logo, swap and cta. Every type in use: `reference/all-visuals.json`.
- **60 fps, frame = f(t):** every time is in seconds (`src/motion.ts`); `src/plan.ts` decides when everything happens and which sounds play, for both the render and `npm run storyboard`.
- `npm run check` validates cues, colours and files; `npm run storyboard -- <id>` prints the frame-exact storyboard; `npm run vo` handles the voiceover; `npm run sfx` regenerates the sound effects.

A complete example brand and video: `examples/gwenchana-chatgpt-ads/`.

## Principles

- **Evidence first.** No number on screen without a source label; estimates say so.
- **The brand's voice, not ours.** Everything about tone, claims and look comes from the context profile.
- **Revise on paper.** Hooks, beats, the script and the storyboard are approved before anything is built.
- **The storyboard is the render.** Both come from the same timing code.
- **No surprise licences.** Sound effects are synthesised; music and recordings stay out of public repositories.

## License

MIT
