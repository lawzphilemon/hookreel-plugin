# CLAUDE_[CODE] · [project slug] · [brand]

Project code: **[CODE]** · folder `hookreel-output/[CODE]_[slug]/` · videos `[CODE]-…` · reopen with `/hookreel:resume [CODE]`.

Rules of play for this video project. This file is imported by the folder's `CLAUDE.md` so it loads automatically. Read this file before every hookreel stage and follow it over any default. Written by `/hookreel:brief`, extended by every later stage. Last updated: [date] by [stage]. Rules only, one line each; the reasons and history behind them live in `DECISIONS.md`.

## 1. Fixed rules (every video for this brand)

### Brand voice
- Speaks like: [from the context profile]
- Never sounds like: [from the context profile]
- Person: [e.g. "you" for the viewer, "we" for the brand]
- Casing, punctuation, emoji: [e.g. sentence case, no exclamation marks, no emoji]
- Language: [voiceover language and any terms kept in another language]

### Look
- Brand colours: [hex values]
- Typeface: [Google Fonts name], weights [..]; code in [mono font]
- Logo: [file, where it appears, e.g. end card only]
- Signature elements that must appear: [e.g. citron eyebrow labels, em-dash lists, or none]
- Reference reels (the source of the look): [files or links, and what to take from each]

### Motion and time
- 1080×1920, **30 fps**, every time written in seconds and converted with **frame = f(t) = round(t × 30)**.
- Every animated property is a function of the current frame (interpolate with clamped input, ease-out cubic-bezier(0.16, 1, 0.3, 1)). No CSS transitions or keyframe animations.
- Look: [custom motion (default) | 3d dialog | 3d toons | template clean | template playful]. Custom motion = new motion design per video, invented per beat from all the reference reels (`hookreel-rules` → Custom motion), built in the studio's `reels/<id>/`; never the template's infographic slides unless chosen here. 3D looks are made with video-3d-kit (`hookreel-rules` → `references/look-3d-kit.md`); the motion rules below apply to custom motion only.
- Beats land on the spoken words (`reels/<id>/words.json`), and each beat finishes its animation before the next.
- Safe area: text inside x 80–1000 and above y 1500 (platform UI).

### Sound
- Voiceover: [who], one take per video, -16 LUFS, peaks -3 dBTP.
- Sound effects: [off | subtle | medium | dramatic], synthesised or with a commercial licence note, no meme sounds.
- Music: [synthesised (mood …) | track + licence | none]; ducked under the voice.
- Final mix: -16 to -17 LUFS integrated, true peak at or below -0.5 dBTP.

### Evidence
- Every number on screen carries its source label; estimates say "estimate".
- Hypothetical amounts and examples carry the label "[Illustration | Ilustrasi | …]".
- Required disclaimers on the end card: [exact text, or none].
- Dates, not relative time.

## 2. Rules for this video

- Topic: [..]
- Pain and why: [..]
- Audience and awareness: [..]
- Storyline given by the user (keep its beats and order): [..]
- Format: [single | series of N], roles: [..]; target length: [..] s
- CTA (exact words): [..] → [what they get]
- Proof allowed: [own experience | client, named? results?]
- Approved hook per video: [filled by /hookreel:story]
- Script approved on: [filled by /hookreel:script]
- Prototype approved on: [filled by /hookreel:build: date and file of the approved prototype scene]
- Storyboard approved on: [only if one was requested]

## 3. Bans

### Claims
- [from the context profile's hard rules]
- [from the brief: results, prices, client names, competitors]
- [from /hookreel:facts: NOT FOUND and CONTRADICTED claims, word for word]

### Words and phrases (so it never sounds generic)
- Brand-specific: [never-say list from the profile]
- Generic filler: "in today's digital world", "game-changer", "unlock", "supercharge", "level up", "take it to the next level", "secret sauce", "the ultimate guide", "you won't believe", "let's dive in", "revolutionise", "seamless", "cutting-edge"
- Hype punctuation: [e.g. exclamation marks, ALL CAPS for emphasis]

### Visuals
- [from the brief's dislikes, e.g. story-style progress bar]
- Stock photos, stock icon packs, emoji as decoration, real screenshots unless allowed: [keep or remove per brand]

### Sound
- Meme or viral sound effects, sounds lifted from songs, films, cartoons or games, ripped music without a licence note, music louder than the voice.

### Process
- Nothing is built before the script is published and approved; no scene beyond the prototype before the prototype is approved.
- No new claim, number or scene after approval without asking.
