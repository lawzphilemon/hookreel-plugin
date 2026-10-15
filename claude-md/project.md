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
- Background, text, accent: [hex values and how the accent is rationed]
- Typeface: [Google Fonts name], weights [..]; code in [mono font]
- Logo: [file, treatment on the background]
- Signature elements that must appear: [e.g. citron eyebrow labels, one accent per scene, em-dash lists]

### Motion and time
- 1080×1920, **60 fps**, every time written in seconds and converted with **frame = f(t) = round(t × 60)**.
- Every animated property is a function of the current frame (interpolate with clamped input, ease-out cubic-bezier(0.16, 1, 0.3, 1)). No CSS transitions or keyframe animations.
- Style: [clean | playful].
  - clean: entrances fade + rise [28] px over [360] ms. No bounce, no spring overshoot, no looping animation.
  - playful: entrances pop (spring, small overshoot), elements float gently (loop); characters [describe the character sheet, AI tool used, files in public/characters/].
- No story-style progress bar.
- Safe area: content y 330–1300, sides 80 px, captions at y 1340.

### Sound
- Voiceover: [who], one take per video, -16 LUFS, peaks -3 dBTP.
- Sound effects: [off | subtle | medium | dramatic], synthesised, no meme sounds.
- Music: [track + licence, or none]; ducked under the voice.
- Final mix: -16 to -17 LUFS integrated, true peak at or below -0.5 dBTP.

### Evidence
- Every number on screen carries its source label; estimates say "estimate".
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
- Storyboard approved on: [filled by /hookreel:storyboard]

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
- Stock photos, stock icon packs, emoji as decoration, decorative gradients, drop-shadowed 3D text, more than one accent colour per scene, real screenshots unless allowed: [keep or remove per brand]

### Sound
- Meme or viral sound effects, ripped music without a licence note, music louder than the voice.

### Process
- No JSON for Remotion before the script is published and approved, and the storyboard is published and approved.
- No new claim, number or scene after approval without asking.
