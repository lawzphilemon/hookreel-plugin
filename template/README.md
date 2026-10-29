# hookreel studio

HyperFrames studio for short vertical videos, made by `/hookreel:build`. One studio per brand; every video is its own HyperFrames project in `reels/<id>/`.

Needs Node 22.18+ and FFmpeg + FFprobe on PATH (Windows: `winget install --id Gyan.FFmpeg -e`). HyperFrames fetches its own Chrome; `npx hyperframes doctor` shows what is missing.

- `reels/<id>/compositions/<scene id>.html`: the scenes, written new for every video (HTML + a paused GSAP timeline, `window.__timelines["s<scene id>"]`), on the kit in `kit/`: `kit.js` (global `HR`: spoken-word times `HR.at`, `life`, focus-in `word`, springs, camera with shot sizes, shake, squash, grain, transitions) and `kit.css` (font library Open Sans 800, Rubik, Instrument Serif italic; grain; source lines).
- `reels/<id>/words.json`, `moves.json`, `style.json`: word times, freshness log, style brief.
- `npm run assemble -- <id>` writes `reels/<id>/index.html` (scenes back to back, voice clips, ducked music) and `reels/<id>/assets/`. Never edit those by hand.
- `videos/<id>.json`: scenes with their voiceover lines (`vo`, `say`), `tts`, `cta`, `music`. Drives `npm run vo`, `tts` and `words`.
- `brand.json`: colour tokens and logo.

```bash
npm install                        # also generates the sound effects
npm run words -- <id> [--estimate] # reels/<id>/words.json, character-aligned
npm run tts -- <id> [--dry]        # ElevenLabs take with character times (key in .env.local)
npm run vo -- <id> "<recording>"   # a recorded take → per-scene clips (trim loose pauses first: npm run trim)
npm run music -- <id> --mood chill # original music from code → public/music/<id>-synth.wav; set "music" in videos/<id>.json
npm run assemble -- <id>           # root page and assets for reels/<id>
npm run dev                        # HyperFrames preview
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

Fonts in `kit/fonts/` are from Google Fonts under the SIL Open Font License.
