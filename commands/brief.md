---
name: brief
description: One message of at most six questions plus a pre-filled brief (brand context, topic, pain and why, audience, evidence, CTA, references; format, audio and visuals defaulted) — the reply locks the video brief before any story or script
allowed-tools: Read, Write, Glob, AskUserQuestion
---

# HKR-1 — Video Brief

**Mission:** Capture everything the story, script and video need, once, so later stages never have to come back and ask, give the project a unique code, and write its rulebook (`CLAUDE_<CODE>.md`). Follow the `hookreel-rules` skill throughout.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

Talk to the user in their language. The brief file itself is written in English field names with the user's answers as given.

## Step 1 — Context profile

Look for a brand context profile before asking anything: a `*context-profile*.json`, `*context_profile*.json`, `brand*.json` or similar in the working directory or attached to the conversation.

- Found: read it fully. Extract brand name, voice and tone rules, hard rules and forbidden claims, colours, fonts, logo file, motion rules, and any proof points. These answers are now known; do not ask them again.
- Several found: ask which one this video uses, as one of the Step 2 questions.
- **The brand studio** `hookreel-studio/<brand>-studio/` (for example `hookreel-studio/truemission-studio/`: its `BRAND.md` holds the brand's voice, compliance hard rules, end-card disclaimers, CTA shape and measured pacing; its `brand.json` the colours, logo and watermark): find it from the studio named in the conversation, or ask which studio this video belongs to (or whether to make a new one; `/hookreel:build` Step 1 creates it, and `BRAND.md` is written from this interview or the brandcore profile). Read both before asking anything and treat them as a found context profile, saying which studio you used. A studio is a starting point, never a reason to skip the evidence questions — the topic, the numbers and their sources still come from the user for this video.
- None: ask whether one exists. If not, offer to build one first with the `brandcore` skill if it is available, or continue with a short brand block (name, voice in one line, colours, font, logo file, hard rules) asked as one of the Step 2 questions (it counts toward the six).

## Step 2 — One message: questions and the pre-filled brief

Ask **once**, in **one message**, at most **six** numbered questions, and only what the context profile, the brand studio's `BRAND.md` or the conversation does not already answer. Pick them in this order of priority, skipping any that are known:

1. Topic and pain: what is the video about, what does the viewer struggle with, and what happens if they ignore it? (If they already have a storyline or beats, paste them; the story stage sharpens it, not replaces it.)
2. Audience and awareness: who watches, and how much do they know? (never heard of it / know it, don't use it / already use it)
3. Sources and numbers: source material (guide, report, PDF, link, own experience), and every number to show with where it comes from.
4. Proof and must-not-claim: own experience or a client's (named? results allowed?), and anything that must not be claimed or shown (results, prices, client names, competitors, regulated claims).
5. Call to action: the exact action (comment a keyword, link in bio, DM, page) and what the viewer gets.
6. Reference reels: the reels whose look you want (files or links) and what to take from each. None: say so, and I propose a direction from a few public examples. (Template infographic look only if asked: clean, or playful with AI 3D cartoon characters.) For a 3D look (`3d dialog`: two 3D characters talking; `3d toons`: the characters over a screen recording), ask instead for the brand's character pair and place (dialog) or the video to explain (toons); see `references/look-3d-kit.md` of the `hookreel-rules` skill.

Anything that becomes a claim on screen (numbers, sources, proof, must-not-claim) stays among the questions while it is unknown; never fill it with a default.

**Every other field gets a stated default**, from `BRAND.md` or the profile where it has one, else:
- Platform: Instagram Reels · Language: the language of the brief · Length: 45–75 s · Format: single video.
- Voiceover: ElevenLabs/TTS when the studio has it (`ELEVENLABS_API_KEY` in `.env.local` or a voice in `BRAND.md`), else recorded by the user, one take per video.
- Music: synthesised (`npm run music`), mood by the brand's tone (energetic, cheerful, chill or dramatic) · SFX: medium.
- Visual assets: the logo from the profile or `brand.json`; recreated mockups only, no real screenshots or photos of people until their owner's permission is recorded · Dislikes: the bans in `BRAND.md`, else none.
- Slug: a proposed kebab-case slug.

In the **same message**, below the questions, show the brief as it will be saved (Step 3 format) with every default filled in and every open field marked `[Q1]`, `[Q2]`…, headed "Reply to change any line." List which questions you skipped and why in one line.

The user's answer **is** the confirmation: apply the answers and any changed lines, then go on to Step 3 without asking again. Ask a follow-up only when an answer leaves a claim on screen still unknown or contradicts the profile's hard rules.

## Step 3 — Project code, folder and brief

**Project code.** Every new project gets a unique code so it can be found, reopened and edited later: `HKR-YYMMDD-XXXX`, today's date plus four random characters from `23456789ABCDEFGHJKMNPQRSTVWXYZ` (no 0, 1, I, L, O, U), for example `HKR-261012-7QF3`. Make sure it is not already in `hookreel-output/PROJECTS.md`.

**Slug.** A short kebab-case name for humans (for example `chatgpt-ads-wa`), proposed in the Step 2 message; the user may change it in the same reply.

**Folder.** Everything for this project lives in `<project>` = `hookreel-output/<CODE>_<slug>/`. Nothing is ever written outside it except the studio (at build).

**Video ids.** Every video id is `<CODE>-<name>` (for example `HKR-261012-7QF3-teaser`), so two projects for the same brand never collide in one studio, in `public/vo/`, or in rendered file names.

Save `<project>/01-brief.md` (overwrite if it exists) with the user's answers applied, and `Status: confirmed` as the first line: the reply to the Step 2 message is the confirmation, so there is no separate confirmation round.

```text
Project code: [HKR-YYMMDD-XXXX]
Slug: [kebab-case]
Video ids: [<CODE>-teaser, <CODE>-part-1, …]
Brand: [name] · Context profile: [path, or "inline" with the short brand block below]
Brand block (only if no profile): voice / hard rules / colours (6-digit hex) / fonts (Google Fonts names) / logo file
Topic: [one sentence]
Pain: [what the viewer struggles with]
Why it matters: [consequence of ignoring it]
Why now: [if any]
Audience: [who] · Awareness: [unaware | aware-not-using | using]
User storyline: [beats as given, or "none — build one"]
Sources: [files and links]
Numbers to show: | Number | Claim | Source as given | Verified? (filled by /facts) |
Proof: [own | client (named? results allowed?)]
Must not claim or show: [list]
Platform: [..] · Language: [..] · Length target: [..s]
Format: [single | series of N] · Roles: [teaser, part 1, …]
CTA: [exact action] → [what they get]
Voiceover: [who, one take per video | none]
Music: [synthesised, mood … | file and licence | none]
SFX: [off | subtle | medium | dramatic]
Reference reels: [files or links, and what to take from each] · Look: [custom motion (default) | 3d dialog | 3d toons | template clean | template playful]
3D cast (3D looks only): [left character, right character, place | the video to explain]
Visual assets: [logo path, screenshots allowed?] · Dislikes: [list]
Open questions: [anything still unknown]
```

## Step 4 — Export the project CLAUDE file (mandatory)

Every new project gets its own rules file, so later stages (and any later session) follow this brand and this video instead of generic defaults. Fill `${CLAUDE_PLUGIN_ROOT}/claude-md/project.md` and save it as **`<project>/CLAUDE_<CODE>.md`**:

1. **Fixed rules**: from the context profile (voice, casing, punctuation, emoji, language, colours, typeface, logo, signature elements) plus the pipeline's fixed rules already in the skeleton (30 fps, frame = f(t), motion, safe area, sound targets, evidence).
2. **Rules for this video**: from the brief (topic, pain and why, audience, storyline, format, length, CTA, proof).
3. **Bans**: the profile's hard rules and never-say list, the brief's forbidden claims and dislikes, the generic filler list in the skeleton, and the visual and sound bans. Write bans as concrete items, never "avoid being generic". When a source is a screen recording of a real account, look through its frames for personal data (notifications, lock screen, names, policy or account numbers, phone numbers, emails) and record each one as a ban ("never show the policy number at 0:12"), so it is recreated or masked, never shown.

Leave no `[placeholder]` unfilled: write "none" where the answer is none.

Claude Code only loads files named exactly `CLAUDE.md` automatically, so also write `<project>/CLAUDE.md` containing only:

```text
# Project <CODE> · <slug>
Rules for this project live in the coded file, imported here so they load automatically:
@CLAUDE_<CODE>.md
```

## Step 5 — Register the project

So the project can be recalled by its code later (`/hookreel:resume <CODE>`):

- Write `<project>/project.json`:

```json
{
  "code": "HKR-261012-7QF3",
  "slug": "chatgpt-ads-wa",
  "title": "…",
  "brand": "…",
  "contextProfile": "path/to/profile.json",
  "studio": "hookreel-studio/<brand>-studio",
  "videos": ["HKR-261012-7QF3-teaser"],
  "created": "2026-10-12",
  "stages": { "brief": "confirmed", "facts": null, "story": null, "script": null, "storyboard": null, "prototype": null, "build": null, "voice": {}, "qa": {}, "critique": {} }
}
```

- Write `<project>/meta.json`, the short record that workspace indexes read (keys exactly as shown; `klien` is the brand, `tanggal` the created date):

```json
{ "kode": "HKR-261012-7QF3", "jenis": "Video", "klien": "…", "alat": "hookreel", "tanggal": "2026-10-12", "status": "berjalan", "file_utama": "" }
```

- Add a row to `hookreel-output/PROJECTS.md` (create it with this header if missing):

```text
| Code | Slug | Brand | Title | Created | Folder | Status |
|---|---|---|---|---|---|---|
```

Every later stage updates `stages` in `project.json` and the Status column in `PROJECTS.md`.

Show the code prominently and tell the user: "Your project code is <CODE>. Use /hookreel:resume <CODE> to come back to it."

End: go straight on to `/hookreel:facts` (no stop). Run alone, end with: "Brief saved. Next: /hookreel:facts."

## Rules
- Ask, never assume, for anything that would end up as a claim on screen.
- Keep the user's own storyline and wording when they give one.
- One project, one code, one folder. Never overwrite another project.
- No project without its `CLAUDE_<CODE>.md`, its `CLAUDE.md` import, `project.json` and a row in `PROJECTS.md`.
