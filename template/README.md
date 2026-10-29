# hookreel brand studio

A brand studio for short vertical videos, made by `/hookreel:build`. It holds brand data only. Every tool comes from **hookreel-engine** (the hookreel plugin repository), installed as a dependency, so the studio is always on the latest engine without copying or merging code.

Needs Node 22.18+ and FFmpeg + FFprobe on PATH (Windows: `winget install --id Gyan.FFmpeg -e`). HyperFrames fetches its own Chrome; `npm run hf -- doctor` shows what is missing. `.npmrc` sets `allow-git=root`: npm 12 blocks git dependencies unless allowed, and `root` allows only this studio's direct ones (the engine).

```bash
npm install            # engine from GitHub + the synthesised sound effects
npm run update-engine  # the newest engine (main)
```

- `brand.json`: colour tokens, logo, `watermark` (drawn over every scene by `npm run assemble`).
- `BRAND.md`: voice, compliance rules, disclaimers, CTA shape, pacing; `CLAUDE.md` imports it and one `CLAUDE_<CODE>.md` per project.
- `reels/<id>/compositions/<scene id>.html`: the scenes, new for every video (HTML + a paused GSAP timeline on the engine's kit, global `HR`). `reels/<id>/words.json`, `moves.json`, `style.json` beside them. `index.html` and `assets/` are written by `npm run assemble`.
- `videos/<id>.json`: the voiceover lines (`vo`, `say`), `tts`, `cta`, `music`, `watermark`.
- `public/`: logo, characters, licensed sound effects (`sfx/lib/`), licensed music, voice clips.

```bash
npm run words -- <id> [--estimate] # reels/<id>/words.json, character-aligned
npm run tts -- <id> [--dry]        # ElevenLabs take with character times (key in .env.local)
npm run vo -- <id> "<recording>"   # a recorded take → per-scene clips (npm run trim first for loose pauses)
npm run music -- <id> --mood chill # original music → public/music/<id>-synth.wav; set "music" in videos/<id>.json
npm run assemble -- <id>           # root page and assets for reels/<id>
npm run dev -- reels/<id>          # HyperFrames preview
npm run hf -- check reels/<id>     # lint, runtime and layout checks
npm run fresh -- <id>              # no repeated moves, no hold over ~5 s, shot sizes change, style brief new
npm run retention -- <id>          # no dead air, first beat within 1 s, every transition heard, no stretched image, no slide text
npm run contrast -- "#text" "#bg" 28
npm run sweep -- <id>              # out/<id>-sweep.png: 6 frames per scene, safe area in red
npm run sheets -- <id>             # critique sheets in out/sheets/<id>/; --gate <critique.md>
npm run render -- <id> [--draft]   # out/<id>.mp4, frame count checked, mix loudness printed
npm run preview -- <id>            # out/<id>-preview.mp4 + out/<id>-ig-test.mp4
npm run cover -- <id>              # reels/<id>-cover-<n>/ → out/<id>-cover-<n>.png + 3:4 grid preview
npm run refcuts -- "<reference>"   # cut rhythm of a reference reel
```
