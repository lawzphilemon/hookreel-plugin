# 3D looks: `3d dialog` and `3d toons` (video-3d-kit)

Two looks besides custom motion, chosen per project in the brief (`Look:`):

- **`3d dialog`**: two 3D characters talk in a 3D place (a night bedroom, a park), with a laptop screen they can point at. Voiced dialogue, one-line subtitles, music, sound effects, lighting that follows the mood.
- **`3d toons`**: the same two characters stand flat at the bottom edges of a video the user already has (a phone or PC screen recording, portrait 9:16) and explain what is on it, one short sentence per screen, one-word captions.

Hookreel keeps every gate (brief, facts, story + script, prototype, QA, self-critique, publish). The pictures and the sound come from **video-3d-kit** (`github.com/artosku/video-3d-kit`, MIT for its code, characters, worlds and skill files; its `ASSETS_NOTICE.md` lists the rest), installed once as a tool. The kit is called, never copied into this plugin or a studio.

## The kit

- Folder: `~/.video-3d-kit` (Windows: `%USERPROFILE%\.video-3d-kit`). Missing: `git clone https://github.com/artosku/video-3d-kit ~/.video-3d-kit`; present: `git -C ~/.video-3d-kit pull`. Then `pip install -r requirements.txt` and `python tools/episode.py doctor --smoke` until it prints `READY` (Python 3.9+, Node, FFmpeg with libass and libx264, Chrome). Every kit command runs from that folder.
- The kit's own `CLAUDE.md`, `AGENT_SETUP.md` and slash command templates are written for its `/video-3d` commands. Inside a hookreel project, read them as the manual for each step; where they and hookreel differ (questions, approvals, claims, where the MP4 goes), hookreel wins. Hookreel does not need the kit's `/video-3d` commands installed.
- Voices come from the kit's provider, set in its `project.json` (`cartesia` or `elevenlabs`). With ElevenLabs, the brand's voice (for example the user's clone) becomes one character's voice: `python tools/setup.py set-voice <character> elevenlabs <voice-id> --name "<name>"`. The key goes in `~/.video-3d-kit/.env` (`ELEVENLABS_API_KEY` or `CARTESIA_API_KEY`), put there by the user; never in chat, never printed.
- The kit's `project.json` is one file for every brand. Before each video, set it for this one: `python tools/setup.py init --format portrait --language <code> --provider <cartesia|elevenlabs> --characters <left>,<right> --world <world> --delivery "<project>/render"`. Then set `rules` in it: `numbersNeedFacts: true`, `forbidWords` = the word bans of `CLAUDE_<CODE>.md`. The left character is the lead.
- Rendering uses the graphics card when there is one (a few minutes a video); without, about 30 s of waiting per second of video. `VIDEO3D_GPU=off` forces the processor.

## Characters

- Each brand gets its **own pair**, made with the kit's `skill/guides/new-character.md` (easy path: shape, three colours, how it talks; `python tools/setup.py preview-character <id>` until the user is happy). They live in `~/.video-3d-kit/characters/<id>/`; keep a copy in the brand's **private** studio (`hookreel-studio/<brand>-studio/characters/3d/<id>/`). Record the pair in `BRAND.md`.
- A character modelled on a real person (for example the Truemission Lawrence character) only with that person's yes, and only in private folders; never in this plugin or any public repository.
- Never in a published video: the kit's `claude` pixel mascot (an unofficial fan model of Anthropic's mascot, for demos only). The `ayam` demo chicken only when the user picks it for that video.

## Stage by stage

| Stage | What changes for a 3D look |
|---|---|
| brief | `Look: 3d dialog` or `3d toons`. Question 6 asks for the characters and the place (dialog) or the video to explain (toons) instead of reference reels. Toons: look through the video's frames now (`python tools/toons.py look <slug>` after `init`, or the brief's own frame check) and record every piece of personal data as a ban (blur or crop it). |
| facts | Unchanged. Every allowed number and claim also goes into the kit episode's `facts` list (`episode.json`), with its source. |
| story | Unchanged: three hooks, one beat sheet. The beats become dialogue between the two characters (one asks or worries, the other answers), not a narrator. |
| script | `04-script.md` is a dialogue table `# · who · line`: short spoken lines (3–8 words; the kit's `script-craft.md`), about 2.6 s per line (toons: a word budget per screen, about 0.6 s per word, one feature per sentence in screen order; the kit's `toons-playbook.md`). Every voiceover rule and ban of hookreel still applies. Stop 2 is unchanged. After approval, write the kit episode: `python tools/episode.py new "<title>"` (dialog) or `python tools/toons.py init "<title>" --video <path>` (toons); copy the lines into its `script.json`; record the kit slug in `project.json` → `kit3d: { "<id>": "<slug>" }`. |
| build | Read the kit's `cinematic-playbook.md` in full, then `direction.md` and `light-theory.md` (toons: `toons-playbook.md`). Dialog: `directions <slug>`, then direct every line by hand (shot, both faces, a body act on key beats, a camera move, the light); `review <slug>` must print `cinematic check: OK`; `validate <slug>` until OK; `build <slug>` (voices, mouth, subtitles, sound); `stills <slug>`. Toons: `toons.marks` in `episode.json`, `toons.py settle <slug>`, `validate`, `build`, `toons.py stills <slug> --at <6 seconds>`. |
| prototype (stop 3) | The **stills contact sheet** (`out/<slug>/stills/contact.png`, toons `out/<slug>/toons_stills.png`) instead of a rendered scene, sent with the first line's voice take. Nothing is rendered in full before the user approves it. Record it under **Prototype approved on**. |
| voice | Done by the kit's `build` (or `settle`). A line that came out wrong: `variants <slug> <line>`, let the user pick, `lock <slug> <line> <file>`. A synthetic voice keeps the AI label rule. |
| qa | `python tools/episode.py video <slug>` (render, encode, the kit's own QA), in the background. Then hookreel's checklist on frames from the MP4 (`ffmpeg -i <mp4> -vf fps=1/3,scale=270:-2,tile=6x4 sheet.png`): claims, labels, disclaimers, bans, personal data. `07b-critique-<id>.md` stays mandatory. |
| publish | `deliver <slug>` copies the MP4 into `<project>/render/` (the `--delivery` folder). Covers from the stills; caption and posting folder unchanged. |

Changes after a result: edit `script.json` or `episode.json` and run `build` (or `settle`) again: unchanged lines reuse their takes and cost no credits. Toons: delete `out/<slug>/frames` before every re-render.

## Evidence in a 3D video

- Numbers and claims: only the allowed ones from `02-facts.md`. A number on the laptop screen (`pages` + `screen`) carries its source line on that screen page; a number that is only spoken gets its source in the caption.
- Hypotheticals: the illustration label from `CLAUDE_<CODE>.md` on the screen page that shows them, or in the subtitle of that line.
- Required disclaimers: on the laptop screen during the last line (dialog) or on the end card (toons `outro: "whirl"` with `outroTexts`), readable for at least 3 s; check them on the stills.
- Real brands on screen only when their owner allows it (the kit's `validate` knows only a short list of brands; the bans in `CLAUDE_<CODE>.md` are the real check).

## Sound licence

The kit's music is synthesised by its own code (`assets/audio_engine/make-audio.mjs`) with CC0 samples. Its sound effects in `assets/sfx/generated/` were made by the kit's author with ElevenLabs, and `assets/sfx/kit/` comes from the author's own app; the kit's MIT licence does not name them. Before the first video a brand posts, ask the user to accept that or to generate the effects again with their own ElevenLabs plan, and record the answer in `CLAUDE_<CODE>.md` under sound and in the QA report.
