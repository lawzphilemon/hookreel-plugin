# hookreel studio

Remotion project for short vertical videos, made by `/hookreel:build`.

- **Custom motion (default):** every video gets its own per-beat scenes in `src/proto/<id>/`, invented from the user's reference reels and the plugin's motion library, built on `src/proto/kit.tsx` (font library `FONT`: Open Sans 800, Rubik 500–700, Instrument Serif italic; focus-in words, grain, glow, sounds, voiceover clips, source lines, spoken-word times, `protoReel`). Registered in `src/Root.tsx` as `<id>-motion`.
- `brand.json`: colours (semantic tokens, 6-digit hex), Google Fonts by name, logo, radius, entrance timing.
- `videos/<id>.json`: scenes with their voiceover lines (drives `npm run vo` and `npm run words`). The template's data-driven visuals (`src/schema.ts`, composition `<id>`) are used only when the template look is chosen.

```bash
npm install          # also generates sound effects and registers videos
npm run check        # cues, colours, files
npm run dev          # Remotion Studio
npm run vo -- <id> "<recording>"   # one take per video → per-scene clips + heard fragments
npm run words -- <id>              # src/proto/<id>/words.json, character-aligned (--estimate before recording)
npx remotion render <id>-motion out/<id>.mp4
npx remotion render <id>-motion out/<id>-mix.wav --codec=wav && npm run loudness -- out/<id>-mix.wav
npm run cover -- <id>              # cover variants → out/<id>-cover-<n>.png + 3:4 grid preview
```

`node scripts/word-times.mjs --self-test` and `node scripts/loudness.mjs --self-test` check the two scripts.

Recordings (`public/vo/`) and music (`public/music/`) are git-ignored on purpose.
