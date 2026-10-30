# Changelog

## 0.19.1 — 2026-10-30

Fixes from the first end-to-end run of the `3d dialog` look (two reels: one in the kit's bedroom, one in a new place built for the run).

- **`hookreel kit-finish <kit mp4> <brand studio> <out> --end-card-at <s>`** (`npm run kit-finish` in a studio): one ffmpeg encode that adds what video-3d-kit does not, the `brand.json` watermark (same grid and values as `npm run assemble`: opacity 0.13, height 58, step 330×300, row offset 165, in at 1.2 s, off at the end card) and loudness at −16.5 LUFS, true peak −1.5 dB (linear loudnorm after an audio-only measuring pass). `--self-test` checks loudness, length and the watermark on/off on a synthetic clip.
- `look-3d-kit.md`:
  - Portrait: a custom `screen` shot (bedroom values given) on every line whose page carries a claim, a source or the end card, held through the tail with `camExtra`; every built-in shot crops the laptop screen in 9:16.
  - QA and publish: `kit-finish` after `video`; the finished file is the one delivered and posted (`deliver` copies only the kit original); a boxed `subs.ass` style on bright worlds; covers placed over the burned-in subtitle band, never over a face.
  - Kit traps: never `setup.py init --help` (it runs init and overwrites `project.json`); run kit commands from the kit root (WinError 183 inside `out/<slug>/stills`); `subs` changes need `build`, not only `stills`.
  - Script: 16–18 lines for a 45–60 s target.
  - Voices: premade ElevenLabs voices through the API when the account has only the user's clone; three samples of one script line.
  - New places: the world `screen` contract (`setPage`, `page`, `glow()`), debugging a silent hang with `VIDEO3D_DEBUG=1`; a place variant copies the episode with `takes/` and sets `"world"` (no new voice credits).
- `/hookreel:facts`: a `Scope` column; a source that covers only a subtype (one claim route, one product) never becomes a general claim. `/hookreel:script` Step 4 checks every line stays inside its claim's scope.
- Output root: `hookreel-output/` can be another folder named once in the workspace `CLAUDE.md` (`hookreel output root: <path>`).
- Stops: questions left open by a short reply use their defaults, go into `DECISIONS.md`, and open the next stop's message. Brief Q5: a product-neutral end-card line when the brand's disclaimer names one product and the topic spans several.

## 0.19.0 — 2026-10-30

Two new looks besides custom motion, made with [video-3d-kit](https://github.com/artosku/video-3d-kit) (MIT code) as an external tool in `~/.video-3d-kit`. Hookreel calls it and never copies it.

- `3d dialog`: two 3D characters talk in a 3D place, with voiced dialogue, subtitles, music and lighting that follows the mood. `3d toons`: the same characters stand over a screen recording and explain it.
- Chosen in the brief (`Look:`). Every gate stays: facts, the script approval, the prototype (now the kit's stills contact sheet), QA, the self-critique and publish. The script becomes a dialogue table.
- `skills/hookreel-rules/references/look-3d-kit.md`: kit setup, the per-brand character pair, the stage-by-stage mapping, evidence in a 3D video (source lines on the laptop screen, disclaimers on the last line or end card), and the open sound licence question for the kit's sound effects.
- Never in a published video: the kit's `claude` pixel mascot (an unofficial fan model of Anthropic's mascot).

## 0.18.2 — 2026-10-30

Six fixes from the Truemission reel HKR-261030-K7RD, each of which needed a manual workaround.

- `npm run tts` no longer calls `scripts/register-videos.mjs`, a file an engine studio does not have. It used to exit 1 after the clips were written.
- `tts.prefix` in `videos/<id>.json` now works with `eleven_v3` and `eleven_v4`. The audio tag goes in front of the take, and its characters are dropped from the alignment before the cut, so the word times do not move. Other models skip the prefix with a warning, because they would read it aloud. The prefix is part of the cache hash.
- Loudness: `level()` (used by `tts` and `vo`) measures again after the peak limiter and applies the remaining gain, up to three passes. The K7RD take landed at -17.1 LUFS before this fix and at -16.1 after it. `VO_GAIN` goes from 0.8 to 0.9, so -16 LUFS clips mix near -16.7 LUFS. `"voiceGain"` in `videos/<id>.json` overrides it for one video. The render warning names the setting.
- `kit.css` has a `.hr-screen` class (absolute, inset 0, pointer-events none, `z-index: 10`) for the text layer. The scene contract in `hookreel-rules` and `/hookreel:build` now puts every text, label and source line in it, after the `HR.camera` world. In K7RD, transformed props painted over the text in 3 of 8 scenes.
- `npm run sheets -- <id> --gate` reads only the newest round: the `## Round <n>` section with the highest n, or else the first table after `Status:`. Older rounds can keep their score tables. The `07a` template in `/hookreel:qa` now has the `## Round <n>` heading.
- Template `update-engine` works on npm 12 when `~/.npmrc` sets `allow-scripts`. `npm run` passed that setting to the child npm as `npm_config_allow_scripts`, which npm 12 refuses with `EALLOWSCRIPTS`. The script now removes the variable before it installs. Existing studios: copy the template's `update-engine` script into `package.json` (`/hookreel:build` says so too).

## 0.18.1 — 2026-10-29

Finished files now live with the project, not only in the studio.

- `/hookreel:brief` writes `<project>/meta.json` (`kode`, `jenis`, `klien`, `alat`, `tanggal`, `status`, `file_utama`), the short record workspace indexes read. `/hookreel:carousel` writes it with `"jenis": "Carousel"`.
- `/hookreel:publish` Step 3 copies `out/<id>.mp4` and every cover (full and grid) to `<project>/render/` and sets `file_utama`; Step 4 sets `status` to `"selesai"` once every video has its posting folder.
- `/hookreel:resume` writes a missing `meta.json` for older projects.

## 0.18.0 — 2026-10-29

One video took about ten replies from the user and two or three session hops. The user now replies four
times, and the renderer moved from Remotion to HyperFrames. Every quality gate stays: facts from primary
sources, the hook audit, the read-aloud pass, freshness, retention, contrast, the critique loop (8+ on
stills) and the self-critique.

**Four stops per video**
- **`/hookreel:make`**: one entry point from brief to posting folder. It stops four times: the brief,
  the script, the prototype and the final.
- Brief: the four interview rounds became one message. It asks at most six questions, only what the
  context profile or preset does not answer, and shows the rest as a pre-filled brief. The user's reply
  is the confirmation.
- Facts run on their own and stop only on a claim that is NOT FOUND or CONTRADICTED.
- Story and script are approved together. The review page opens with the three hooks, the recommended
  one already in scene 1. The pronunciation table lives in `04-script.md`. `VOICEOVER_<CODE>.md` is
  written only when a person records.
- `/hookreel:produce` now ends with publish: preview, covers and caption in one message. There is no
  separate "listen to the mix" stop, and no "start a new session" hop. `/hookreel:resume` is for when
  the context runs low.

**HyperFrames renderer** (`template/`, HyperFrames 0.8.188 pinned)
- Each video is a HyperFrames project in `reels/<id>/`. The scenes are hand-written HTML with a paused
  GSAP timeline in `compositions/<scene id>.html`. `words.json`, `moves.json` and `style.json` moved
  there from `src/proto/<id>/`.
- `kit/kit.js` (global `HR`) ports the Remotion kit: `at` (word times), `life`, `word`, `spr`,
  `camera` (same `camAt` maths), `frameOn`, `shake`, `squash`, `grain` and the six transitions, plus
  `drive` for any value that is a pure function of time. `kit/kit.css` carries the font library
  (Open Sans 800, Rubik, Instrument Serif italic, shipped as woff2 under the OFL), grain and source
  lines.
- `npm run assemble -- <id>` writes the root page: scenes back to back, voice clips, and the music
  ducked under the voice in Node (the old `Music` envelope). It also copies the assets the scenes name
  from `public/`.
- `npm run render -- <id>` does assemble, render, a frame-count check and a loudness readout. The
  voice sits at 0.8, which landed the test mix at -16.5 LUFS and -3.6 dBTP. Measured on this laptop:
  an 18.8 s two-scene reel from the deposito take renders in 0.9 min. Remotion took about 25 min for
  a 92 s reel.
- Chunked render (`npm run chunks`) is removed: a full render now costs minutes.
- `npm run sheets` and `npm run sweep` build the critique pages from `hyperframes snapshot` stills, as
  an HTML page that is snapshotted too. 37 s and 18 s on the test reel. `--gate` is unchanged.
- `npm run cover` makes the covers from still pages in `reels/<id>-cover-<n>/`.
- `retention` also checks `<img>` in HTML scenes.
- Audio, voice and check scripts call `ffmpeg` and `ffprobe` from PATH. Remotion's ffmpeg is gone.
- The studio installs 2 packages in 5 s. Whisper stays for recorded takes.
- `template-remotion/`: the old Remotion template, kept for studios made before 0.18.0 and for the
  template look (data-driven slides, storyboard).

**Engine and brand studios**
- The repo is also the npm package **`hookreel-engine`**.
  - Every tool lives in `engine/`: kit, scripts, and `src/motion.mjs` / `align.mjs`, now plain JS because
    Node does not strip TypeScript types inside `node_modules`.
  - The tools run through the `hookreel` CLI (`engine/cli.mjs`).
- `template/` is now a thin brand studio.
  - Its `package.json` depends on `github:lawzphilemon/hookreel-plugin#main`, and every npm script calls
    `hookreel <command>`.
  - `npm run update-engine` pulls the newest engine.
  - `.npmrc` sets `allow-git=root`, because npm 12 refuses git dependencies by default.
  - No engine code is copied into a studio any more, so a studio never needs a merge.
- Tested end to end with a thin studio installed from the GitHub branch (10 s install): retention,
  render (1.0 min, 566 frames, -16.5 LUFS) and sweep all ran through the CLI.
- **Watermark**: `brand.json` → `watermark` (`tile` or `corner`) is drawn over every scene by
  `assemble`. It fades in after the hook and steps aside for the end card. `"watermark": "off"` per
  video only where the brand allows it. The defaults are the Truemission values (0.13 opacity, 58 px,
  offset rows).
- `brands/truemission/` is removed from this public repo. Brand rules now live in each brand's own
  studio repository: `BRAND.md` plus `brand.json`, which `/hookreel:brief` reads as the context profile.
  Truemission's is the private `lawzphilemon/truemission-studio`, with its logo, character, licensed
  sound effects and music.

**Naming and disclaimer**
- The bundled hook skills are renamed to **HookLab**:
  - `wtf-hook-999*` → `hooklab`, `hooklab-generator`, `hooklab-auditor`, `hooklab-optimizer`.
  - The two hook groups are now "Shock Hook" (types 1–6) and "Power Hook" (types 7–15).
  - The third-party framework's brand names are removed.
- README and both manifests say in large type that the plugin is made by Lawrence Philemon for
  personal use and is not sold.

## 0.17.0 — 2026-10-28

Rules from a read of seven public Claude Code motion toolkits (whaleyxbt/claude-motion, howseen-ai/claude-motion-design,
haidrrrry/claude-remotion-skill, charlie947/motion-graphics-skills, Barty-Bart/motion-graphics, cth9191/animate,
nateherkai/herk-edit-kit) set against 0.16.0. Most of what they teach is already here (springs, exits, reading holds,
stagger, pause trimming, ducking, critique sheets, the 8+ gate); only three gaps were real. Markdown only, no script changes.

- `hookreel-rules` Audio: sound placement. An effect starts 2–3 frames before its visual lands, a riser ends on its
  hit, one impact per video on the `special` beat, tonal effects share one key with the music, pan follows the hero's
  screen position, continuous motion stays silent, and music and effects dip about 1 s before the turn beat.
- `/hookreel:story` Step 4: every beat gets a role (start, build, change, turn, quiet, payoff, close) with its pace;
  every cut has a reason that can be said out loud; the last beat may call back to the first image, changed.
- `/hookreel:qa` item 12: frame 0 is a real image of the hook (autoplay thumbnail) and sound placement is checked on
  the strips; muted viewing is now item 13.
- Not taken: stillness quotas (conflict with "no frame dead for more than 0.5 s"), style packs of `animate`
  (illustration looks, against the brand mandate), talking-head footage editing (no footage in these reels).

## 0.16.0 — 2026-10-28

Faster production at the same output, from the article "How to build motion design studio with Opus 5.5"
(@0xMovez, 2026-09-27) read against the self-critiques of HKR-261015-3A9P, HKR-261019-3JH5 and the three
HKR-261019-Y6VQ reels. Their biggest costs were full renders (about 25 min each, up to four per video), fixes
found only in the MP4 that a still would have shown, Whisper on CPU, and scene ids renamed late.

- **`npm run chunks -- <id>`** (`scripts/render-chunks.mjs`): the MP4 scene by scene. Bundles once, renders the
  audio first as one WAV (`--audio-only` stops there for the loudness check), renders each scene's frame range
  without audio into `out/chunks/<id>/<scene>-<hash>.mp4`, and joins them with ffmpeg concat (video copied, not
  re-encoded). A scene whose file (`src/proto/<id>/scenes/<scene>.tsx`), words, range, shared code, non-audio
  assets, lock file and flags did not change is reused, so a fix costs the scenes it touched. Stops on code that
  breaks frame = f(t) (`Math.random`, `Date`, timers, React state and effects, CSS transitions); `--check`
  renders three frames twice and compares their hashes; `--dry` lists what would be rendered or reused. Assets
  are hashed by content, not mtime. Checks the joined file's frame count. Tested on HKR-261019-Y6VQ-deposito
  (84.5 s, 8 scenes): first chunked render 23 min with the check, one changed scene plus its audio 5.5 min;
  frames match the earlier full render.
- **`npm run sheets -- <id>`** (`scripts/sheets.mjs`, kit `protoReel(…).sheet`, composition `<id>-critique`):
  critique sheets in one render: a contact sheet every 0.5 s, 12-frame strips around every transition in
  `moves.json`, and every beat at 360 px wide at the moment its hero is complete, safe area drawn on every
  tile. `--gate <critique.md>` passes only when every criterion (hook, phone readability, motion quality,
  variety, composition, brand accuracy, sound sync) scores 8+ on sheets made after the last code change.
- `/hookreel:qa` Step 1b: the scored critique loop on those sheets (`07a-critique-<id>.md`, three rounds at
  most) before any full render; item 8 and Step 2 use `npm run chunks`; the self-critique records minutes and
  renders per step.
- **`npm run tts -- <id>`** (`scripts/tts-vo.mjs`): ElevenLabs' with-timestamps endpoint, the whole video as
  one take, levelled like a recording, cut at the middle of the silence between scenes, word fragments from the
  character times: no Whisper, no pause detection, no ranges. A scene's `say` carries `{shown|spoken}` spans
  ("{USD 2.500|dua ribu lima ratus dolar}") so cues on numbers land where they are spoken; `npm run check`
  fails when `say` does not read as the `vo`. Key in `.env.local` (now in `.gitignore`), voice from `tts.voice`,
  `--voice` or `ELEVENLABS_VOICE_ID`, no fallback voice. The take is cached: an unchanged script costs no
  credits. `--dry` spends nothing.
- `scripts/vo-audio.mjs`: prepare-vo's stereo WAV helpers (high-pass, loudness, level, fade) shared with tts-vo.
  `word-times.mjs` exports `lcsMap`.
- **Spring presets** `SPRING` in `src/motion.ts` (snappy 0.30 s, default 0.53 s, heavy 0.93 s, playful 0.60 s
  with visible overshoot, measured at 30 fps) and kit `spr(t, at, preset)` / `glide(t, from, steps)` (several
  targets, one spring per change), on Remotion's `spring()`, a pure function of the frame.
- **`/hookreel:produce <id>`**: after the prototype is approved, the rest of build, voice and qa in one run,
  stopping only for the user's calls (a changed line or claim, a ban, a voice problem, a critique that does not
  pass after three rounds).
- `/hookreel:build`: one file per scene (`scenes/<scene id>.tsx`, shared props in `shared.tsx`), and Step 5
  builds the remaining scenes with up to four parallel subagents, each owning its scene files, with
  `06-motion-<id>.md`, `moves.json` and the prototype as the spec; the `<id>-critique` composition is
  registered with the others. Older studios get the new files listed in Step 1.
- `review-page.mjs --cards` refuses to publish a script or recording guide whose scene ids are not `01-hook`
  form, so the id is fixed at the script, not renamed across clips and words.json at build.

## 0.15.0 — 2026-10-25

- **`brands/truemission/`** (`brand.json` + `CLAUDE.md` + `README.md`): the first shipped brand preset.
  Colour tokens, fonts, radius and motion; voice ("kamu"/"Sahabat", never "Anda"); compliance hard rules
  (source line on every number, "Ilustrasi" on hypotheticals, the one allowed guarantee form, "dijamin
  LPS" reserved for a bank deposit, "bukan bunga", "tetap bisa ditolak", the three end-card disclaimers);
  the CTA shape including the DM alternative and the 55 % rule; and the pacing measured on the brand's own
  reels — half the viewers gone by 2.7 s, the payoff inside the first 10 s, 40–60 s for a cold feed.
  No logo, watermark, character poses, recordings, SFX library or client facts: those stay private.
- `/hookreel:brief` Step 1 reads a preset as a found context profile and says which one it used.
- README: the presets folder is documented; `/hookreel:build` lists `scripts/pace.mjs` among the files an
  older studio must receive.

## 0.14.2 — 2026-10-25

Three gates from the performance review of HKR-261019-Y6VQ-cara-kerja (91.8 s). Insights showed the
keyword ask on screen at 80.95 s (88.2 % of the runtime) with the retention curve already down to about
8 % of viewers, and the reward — "RIPLAY lewat DM" — only in the voiceover, on screen never.

- `scripts/retention.mjs` → `ctaAudit`: **fails** when the ask (on screen or first spoken) lands after
  55 % of the runtime, and when a declared `cta.reward` never appears in the CTA scene's on-screen
  `text`; **warns** about the same when no keyword is declared, and about a reel with no save or share
  ask anywhere. Reads `cta: { keyword, reward }` from `videos/<id>.json` (`/hookreel:build` now releases
  it). Self-test covers the late ask, the early one, and a reward that exists only in the audio.
- `scripts/pace.mjs` (new): the pace gate, called by `prepare-vo`. A take slower than the planned rate
  stretches every scene and moves the ask without touching a word — 1.94 words/s turned this project's
  75 s plan into 91.8 s. Fails the voice step when the voice runs more than 8 % over the plan, and names
  the three worst scenes. `--allow-drift` overrides. `npm run pace` runs its self-test.
- `prepare-vo`: per-scene seconds and the planned estimate are kept for that check; the retake estimate
  uses `PLANNED_WPS` (2.1 in the template) instead of a number written twice.
- `/hookreel:qa` item 4 lists the two CTA gates; a new closing rule says every "Open before posting" item
  is closed before the render ships (this project shipped with "decide on the length" still open).
- `/hookreel:publish`: the caption CTA belongs inside the first ~125 characters (this one sat at
  character 666 of 1.282), plus one line that asks for the save or the share, or a reason in
  `DECISIONS.md` why neither is asked.

## 0.14.1 — 2026-10-21

- HyperFrames clips (optional): `hookreel-rules` → HyperFrames clips says when one beat may be built in HyperFrames and how it plays in Remotion (no audio, text from the script, source lines in Remotion, `public/hf/`, re-rendered after the voice). `/hookreel:build` Step 5 and `/hookreel:qa` licences point to it. Remotion stays the master timeline.
- Tested 2026-10-21: HyperFrames 0.8.183 with Remotion's bundled FFmpeg renders a 2 s 1080×1920 VP9 webm with alpha (30 fps, 18 s on this laptop), and `<OffthreadVideo transparent>` in Remotion 4.0.534 shows the background through it.

## 0.14.0 — 2026-10-21

30 fps, and the fixes from the self-critiques of HKR-261019-Y6VQ-deposito and -kuliah.

- **30 fps** (was 60): `FPS` in `src/motion.ts`, the rules, the project and brand CLAUDE templates, build, storyboard and QA. Everything is timed in seconds, so speeds and beats do not change and videos built at 60 fps render as they are. Kit `Grain` reseeds 20 times a second instead of every 3 frames, so it flickers the same at any frame rate.
- Kit `SourceLine`: `backing` (a soft chip behind the line, readable over a prop) and `size`.
- Kit `Head` and `Sub`: the screen-layer headline and supporting line (life() in and out, Word focus, serif accent) that every custom video was rewriting.
- Pace estimate 2.1 words a second (was 2.5) in script, story, storyboard, the rules and `npm run words -- --estimate`: three reels measured 2.0–2.15 and came out 9–17 s over target.
- `npm run fresh`: warns when a figure (a percentage or an amount with separators) on screen is also shown by a sibling video of the same project, naming both beats, so a series does not draw the same idea twice (it would have caught an umbrella and a canopy both carrying "105%").
- `/hookreel:build` Step 6: every text/surface pair goes through `npm run contrast` before the first full render.
- `/hookreel:qa` Step 2: read the smallest encoded frames first (an empty frame is the smallest PNG); render one video at a time.
- Motion library G3: isometric objects compared by height share a screen baseline; an ungrown box draws nothing.

## 0.13.2 — 2026-10-20

Patch release from the self-critique of HKR-261019-Y6VQ.

- Kit `Transition kind="object"`: once the pass is done it returns only the next stage; the slab no longer stays parked at the left edge with its rotated corner showing.
- Kit `Vo`: `volume` prop.
- `npm run vo`: upmixes a mono take to stereo before levelling, so -16 LUFS is what the stereo mix hears (mono takes measured about 3 dB loud in the mix). `out/<id>-take.json` is written on every run that has none, also a rerun with ranges.
- `npm run lib-sfx -- "<library>/<pack>/sfx"`: installs private library effects into `public/sfx/lib/` peak-normalised to -6 dBFS (they peaked the mix at -0.3 dBTP at volume 0.3–0.4).
- `npm run retention`: currency codes (USD, IDR, SGD…) no longer count as all-caps text.
- `/hookreel:voice`: a TTS path (voice clone): spoken forms and `[pause]` in the prompt, expansions, pace, the user saves the files, AI label.
- `/hookreel:script`: the VOICEOVER template uses the scene ids (`01-hook`, `02-…`).
- `/hookreel:qa`: the mix check runs before the first full MP4 render.

## 0.13.1 — 2026-10-20

- **Private library.** Licensed assets the user may use but not redistribute (sound packs, motion templates) live in `hookreel-library/` in the working directory with a `LIBRARY.md` catalogue, never in the plugin or a public repo. `/hookreel:build` reads it, copies its sound effects into the studio's git-ignored `public/sfx/lib/` (named `lib/<name>` in `moves.json` and `Sfx`, found by `npm run retention`), and treats its templates as references like reference reels, never layouts to render. `/hookreel:qa` checks the library licence line and that no library file is committed.

## 0.13.0 — 2026-10-20

Ideas from the Motion Format skill v1.0.0 (MIT, built on Bang Motion by Bang Tutorial, MIT), rewritten for Remotion and vertical reels.

- **Shot sizes.** The camera changes shot size on the beat (wide, medium, close) instead of a 1.00 → 1.06 push that reads as still. Kit: `Camera`, `SHOT`, `frameOn` (math in `src/motion.ts` `camAt`, clamped so the world's edge never shows). `moves.json` beats need `shot`; `npm run fresh` fails on three in a row at one size. UI demos move close to the tap (1.4–2.2).
- **Not a slide.** `moves.json` beats need `text` (on-screen text per tier); `npm run retention` fails on 3 tiers or a line over 6 words, warns on a full stop after a short phrase and on all caps across beats. Rules: attention order, sentence case, no template skeleton, every thing the voice names is on screen (motion library H).
- **Style brief per video.** `06-motion-<id>.md` opens with it and `src/proto/<id>/style.json` holds six lines (background motion, surface with 2+ layers, render family, signature move, opener, closing) from the new menus in motion library G; `npm run fresh` fails on a missing or flat brief and on 3 lines shared with one of the brand's last 3 videos. One `special` beat gets the most expensive effect; more than one fails.
- **Menus:** background motion (12), surfaces, object render families, the first 3 seconds, closings, several points without three tiles (motion library G).
- **Transitions:** `Transition kind="object"` (an object passes the lens, the next stage behind it), a list of transitions carried by objects, and craft rules (no stage edge showing, no preset spin or blur on every cut). Kit `life(t, at, until)`: slow, firm entrances (0.7–1.3 s) and fast exits (0.35–0.55 s).
- **One-line revisions** in `/hookreel:resume`: change only the target, shift what follows, re-render only the changed seconds, report in one sentence with numbers.
- **Taste check** (four questions) on every sweep in `/hookreel:build` and `/hookreel:qa`; grainy or gradient-heavy videos that band in the Instagram test encode render again with `--crf=12`.
- Existing studios: `/hookreel:build` Step 1 says what to copy in (the two lint scripts, the camera math, `Camera`, `life` and the object transition); older videos' `moves.json` are only compared, not failed.

## 0.12.3 — 2026-10-20

- `/hookreel:publish` Step 4: once the user picks a cover, one posting folder per project at `hookreel-output/<CODE>_<slug>/publish/` with `<id>.mp4`, `<id>-cover.png` and `<id>-caption.txt` (copies of the studio render, the chosen cover and the caption code block), recorded as `stages.publish.<id>.folder` in `project.json` and in `PROJECTS.md`. No more fetching the MP4 from the studio's `out/` and the caption from a markdown file.
- `/hookreel:resume`: the status table shows the posting folder per video.

## 0.12.2 — 2026-10-19

Patch release from the self-critique of HKR-261019-3JH5.

- `/hookreel:script`: scene ids are written `01-hook`, `02-…` (the format `npm run check` enforces), never `s01-…`.
- `npm run vo` (`prepare-vo.mjs`): saves the full-take Whisper transcript with absolute word times to `out/<id>-take.json`, so explicit ranges can be picked without a second Whisper pass.
- `npm run vo`: warns when a scene's clip is longer than 2× its script estimate (words ÷ 2.5), a sign of a retake or false starts inside it.
- `/hookreel:build` Step 3: one background or camera change per ≤ 5 s in `06-motion`; write `moves.json` from the plan and pass `npm run fresh` before coding scenes.
- `/hookreel:brief`: a screen recording of a real account is scanned frame by frame for personal data (notifications, lock screen, names, policy numbers), each recorded as a ban.
