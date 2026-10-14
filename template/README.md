# hookreel studio

Remotion project for short vertical videos, made by `/hookreel:build`. A video is data:

- `brand.json` — colours (semantic tokens, 6-digit hex), Google Fonts by name, logo, radius, entrance timing.
- `videos/<id>.json` — scenes: voiceover line, one visual, cues. Types and fields: `src/schema.ts`.

```bash
npm install          # also generates sound effects and registers videos
npm run check        # cues, colours, files
npm run dev          # Remotion Studio
npm run vo -- <id> "<recording>"   # one take per video → per-scene clips + word timings
npm run align -- <id>              # where each script word is spoken
npm run render -- <id> out/<id>.mp4
npm run cover -- <id>              # cover variants → out/<id>-cover-<n>.png + 3:4 grid preview
```

Recordings (`public/vo/`) and music (`public/music/`) are git-ignored on purpose.
