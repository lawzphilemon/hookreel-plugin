# hookreel studio (Remotion, legacy)

Used by studios made before hookreel 0.18.0 and for the template look (data-driven infographic slides). New studios use the HyperFrames template in `../template/`.

Remotion project for short vertical videos, made by `/hookreel:build`.

- **Custom motion (default):** every video gets its own per-beat scenes in `src/proto/<id>/`, invented from the user's reference reels and the plugin's motion library, built on `src/proto/kit.tsx` (font library `FONT`: Open Sans 800, Rubik 500–700, Instrument Serif italic; focus-in words, grain, glow, sounds, voiceover clips, source lines, spoken-word times, `protoReel`). Registered in `src/Root.tsx` as `<id>-motion`.
- `brand.json`: colours (semantic tokens, 6-digit hex), Google Fonts by name, logo, radius, entrance timing.
- `videos/<id>.json`: scenes with their voiceover lines (drives `npm run vo` and `npm run words`). The template's data-driven visuals (`src/schema.ts`, composition `<id>`) are used only when the template look is chosen.

```bash
npm install          # also generates sound effects and registers videos
npm run check        # cues, colours, files
npm run dev          # Remotion Studio
npm run vo -- <id> "<recording>"   # one take per video → per-scene clips + heard fragments
npm run tts -- <id> [--dry]        # ElevenLabs take with character times → per-scene clips, no Whisper (key in .env.local)
npm run words -- <id>              # src/proto/<id>/words.json, character-aligned (--estimate before recording)
npm run sweep -- <id>              # 6 frames per scene at quarter scale on one image, safe area in red
npm run fresh -- <id>              # moves.json + style.json: no repeats, no hold over ~5 s, shot sizes change, one special beat, style brief new
npm run retention -- <id>          # no dead air over 1.2 s, first beat within 1 s, every transition heard, no stretched image, no slide text
npm run trim -- "<recording>"      # cap the pauses in a take (0.3 s) before npm run vo, no retake
npm run music -- <id> --mood chill  # original music from code (energetic, cheerful, chill, dramatic), ducked by the kit's Music
npm run refcuts -- "<reference>"   # cut rhythm of a reference reel + one frame per shot in out/refs/<name>/
npm run contrast -- "#text" "#bg" 28   # WCAG ratio per text colour pair (4.5:1 below 84 px, 3:1 above)
npx remotion render <id>-motion out/<id>.mp4
npm run preview -- <id>            # out/<id>-preview.mp4 (crf 27) + out/<id>-ig-test.mp4 (Instagram-like)
npm run sheets -- <id>             # critique sheets: contact (0.5 s), transition strips, phone-size tiles; --gate <critique.md>
npm run chunks -- <id> --audio-only && npm run loudness -- out/<id>-mix.wav
npm run chunks -- <id>             # out/<id>.mp4 scene by scene, unchanged scenes reused (--check: determinism)
npm run cover -- <id>              # cover variants → out/<id>-cover-<n>.png + 3:4 grid preview
```

`word-times.mjs`, `loudness.mjs`, `fresh-check.mjs`, `retention.mjs` and `contrast.mjs` each take `--self-test`.

Recordings (`public/vo/`), music (`public/music/`) and sound effects (`public/sfx/`, including licensed private-library sounds in `public/sfx/lib/`) are git-ignored on purpose.
