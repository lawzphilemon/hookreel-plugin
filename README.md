# HOOKREEL Short Video Pipeline

Claude Code plugin that turns an interview into a finished short vertical video (Instagram Reels, TikTok, YouTube Shorts) for **any brand**, driven by that brand's context profile.

Interview → verified facts → a story built with the WTF Hook 999 framework → voiceover script → a Remotion video with infographics, recreated UI mockups, burned-in captions, word-accurate voiceover sync, synthesised sound effects and music ducking.

## Install

```text
/plugin marketplace add lawzphilemon/hookreel-plugin
/plugin install hookreel@hookreel-plugin
```

The story stage needs the WTF Hook 999 plugin:

```text
/plugin marketplace add lawzphilemon/wtf-hook-999
/plugin install wtf-hook-999@wtf-hook-999-marketplace
```

The video stages need Node.js 20+.

## Pipeline

```text
/hookreel:brief → /hookreel:facts → /hookreel:story → /hookreel:script → /hookreel:build → /hookreel:voice → /hookreel:qa
```

| Command | Stage | Output |
|---|---|---|
| `/hookreel:brief` | Interview in four rounds: brand context profile, topic, pain and why, audience awareness, evidence, proof, format, CTA, voice, music, sound effects, visual dislikes. Skips anything the profile already answers. | `hookreel-output/<slug>/01-brief.md` |
| `/hookreel:facts` | Every number and claim verified against primary sources, dated, estimates labelled; allowed and forbidden claims | `02-facts.md` |
| `/hookreel:story` | WTF Hook 999: three hooks per video (Gain, Pain, Curiosity), beat sheets; keeps your own storyline if you give one | `03-story.md` |
| `/hookreel:script` | Exact voiceover per scene, a visual from the catalog, cue phrases, recording sheet | `04-script.md` |
| `/hookreel:build` | Remotion studio for the brand: `brand.json` from the profile, `videos/<id>.json`, validation, a visual check of every scene, and a standalone Remotion prompt | `hookreel-studio/<brand>/`, `05-remotion-prompt.md` |
| `/hookreel:voice` | One recorded take per video: normalised, transcribed locally, cut per scene, visuals and captions synced to the spoken words, mix checked | `public/vo/<id>/` |
| `/hookreel:qa` | Layout, sync, sources, stale facts, audio and licence checks; MP4 render; post caption | `06-qa-<id>.md`, `out/<id>.mp4` |

Each project lives in `hookreel-output/<slug>/`, so the pipeline resumes after a restart and projects never overwrite each other. Each brand gets one studio folder, so several brands can share a machine.

## The template

`template/` is a Remotion project where a video is data, not code:

- `brand.json`: semantic colour tokens (works on dark and light backgrounds), Google Fonts by name, logo, corner radius, entrance timing.
- `videos/<id>.json`: scenes, each with its voiceover line, one visual and optional cues. See `template/src/schema.ts`.
- 14 visual types: headline, stat (with a 1-in-100 dot grid), ranking, tiles, timeline, bars, flow, chat, journey, ui, list, logo, swap and cta. Every type in use: `reference/all-visuals.json`.
- `npm run check` validates cues, colours and files; `npm run vo` handles the voiceover; `npm run sfx` regenerates the sound effects.

A complete example brand and video: `examples/gwenchana-chatgpt-ads/`.

## Principles

- **Evidence first.** No number on screen without a source label; estimates say so.
- **The brand's voice, not ours.** Everything about tone, claims and look comes from the context profile.
- **Revise on paper.** Hooks and beats are confirmed before anything is built.
- **No surprise licences.** Sound effects are synthesised; music and recordings stay out of public repositories.

## License

MIT
