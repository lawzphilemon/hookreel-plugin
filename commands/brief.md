---
name: brief
description: Interview the user about the video (brand context, topic, pain and why, audience, evidence, format, CTA, audio, visuals) and lock a video brief before any story or script
allowed-tools: Read, Write, Glob, AskUserQuestion
---

# HKR-1 — Video Brief

**Mission:** Capture everything the story, script and video need, once, so later stages never have to come back and ask, give the project a unique code, and write its rulebook (`CLAUDE_<CODE>.md`). Follow the `hookreel-rules` skill throughout.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

Talk to the user in their language. The brief file itself is written in English field names with the user's answers as given.

## Step 1 — Context profile

Look for a brand context profile before asking anything: a `*context-profile*.json`, `*context_profile*.json`, `brand*.json` or similar in the working directory or attached to the conversation.

- Found: read it fully. Extract brand name, voice and tone rules, hard rules and forbidden claims, colours, fonts, logo file, motion rules, and any proof points. These answers are now known; do not ask them again.
- Several found: ask which one this video uses.
- None: ask whether one exists. If not, offer to build one first with the `brandcore` skill if it is available, or continue with a short brand block (name, voice in one line, colours, font, logo file, hard rules) collected in Step 2.

## Step 2 — Interview

Ask in **four rounds**, one message per round, numbered questions, with a recommended default in brackets where one is sensible. Skip any question the context profile or the conversation already answers, and say which ones you skipped and why. Never ask more than six questions in one round.

**Round A — the story**
1. Main topic: what is this video about, in one sentence?
2. Why does this video exist? What pain or problem does the viewer have that this video helps solve, and what happens to them if they ignore it?
3. Who watches it, and how much do they already know? (never heard of it / know it, don't use it / already use it)
4. Do you already have a storyline or list of beats you want to follow? If yes, paste it; the story stage will sharpen it, not replace it. If no, the story stage builds one.

**Round B — evidence**
5. Source material: a guide, article, report, PDF, link, or your own experience? Attach or link it.
6. Numbers you want on screen, and where each comes from. Numbers without a source go through `/hookreel:facts`.
7. Proof: is the experience your own (your own account, your own business) or a client's? May the client be named? May results be shown?
8. Anything that must not be claimed or shown (results, prices, client names, competitors, regulated claims)?

**Round C — format and call to action**
9. Platform and language of the voiceover. (Instagram Reels, English)
10. One video or a series? For a series: how many, and the job of each (for example teaser, then one per step).
11. Purpose and length: organic content, or a paid ad? For an ad: 15 s for warm or retargeting audiences, 30 s for cold audiences (see Ad mode in `hookreel-rules`). (organic, 45–75 seconds)
12. Call to action: the exact action (comment a keyword, link in bio, DM, visit a page) and what the viewer gets.

**Round D — sound and look**
13. Voiceover: recorded by you or a team member (one take per video), or none? (recorded by you)
14. Background music: a track you have the rights to use, or none for now? Note its source and licence.
15. Sound effects: off, subtle, medium or dramatic? (medium)
16. Reference reels: send the reels whose look you want (screen recordings or video files; links if they can be opened). Every video gets new motion design invented from all of them, never a fixed template. What do you like in each (pacing, type, props, transitions)? If you have none, I will propose a direction from a few public examples for you to pick from. (Only if you explicitly want the template's infographic slides instead, say so: clean, or playful with AI-generated 3D cartoon characters.)
17. Visual assets and dislikes: logo file, product screenshots allowed or recreated mockups only, and anything you do not want to see (for example a story-style progress bar, emoji, stock photos).

## Step 3 — Project code, folder and brief

**Project code.** Every new project gets a unique code so it can be found, reopened and edited later: `HKR-YYMMDD-XXXX`, today's date plus four random characters from `23456789ABCDEFGHJKMNPQRSTVWXYZ` (no 0, 1, I, L, O, U), for example `HKR-261012-7QF3`. Make sure it is not already in `hookreel-output/PROJECTS.md`.

**Slug.** A short kebab-case name for humans (for example `chatgpt-ads-wa`), confirmed with the user.

**Folder.** Everything for this project lives in `<project>` = `hookreel-output/<CODE>_<slug>/`. Nothing is ever written outside it except the studio (at build).

**Video ids.** Every video id is `<CODE>-<name>` (for example `HKR-261012-7QF3-teaser`), so two projects for the same brand never collide in one studio, in `public/vo/`, or in rendered file names.

Save `<project>/01-brief.md` (overwrite if it exists), show it in chat, and ask for confirmation. On confirmation, apply changes and add `Status: confirmed` as the first line.

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
Platform: [..] · Language: [..] · Purpose: [organic | ad-15 | ad-30] · Length target: [..s]
Format: [single | series of N] · Roles: [teaser, part 1, …]
CTA: [exact action] → [what they get]
Voiceover: [who, one take per video | none]
Music: [file and licence | none]
SFX: [off | subtle | medium | dramatic]
Reference reels: [files or links, and what to take from each] · Look: [custom motion (default) | template clean | template playful]
Visual assets: [logo path, screenshots allowed?] · Dislikes: [list]
Open questions: [anything still unknown]
```

## Step 4 — Export the project CLAUDE file (mandatory)

Every new project gets its own rules file, so later stages (and any later session) follow this brand and this video instead of generic defaults. Fill `${CLAUDE_PLUGIN_ROOT}/claude-md/project.md` and save it as **`<project>/CLAUDE_<CODE>.md`**:

1. **Fixed rules**: from the context profile (voice, casing, punctuation, emoji, language, colours, typeface, logo, signature elements) plus the pipeline's fixed rules already in the skeleton (60 fps, frame = f(t), motion, safe area, sound targets, evidence).
2. **Rules for this video**: from the brief (topic, pain and why, audience, storyline, format, length, CTA, proof).
3. **Bans**: the profile's hard rules and never-say list, the brief's forbidden claims and dislikes, the generic filler list in the skeleton, and the visual and sound bans. Write bans as concrete items, never "avoid being generic".

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
  "studio": "hookreel-studio/<brand-slug>",
  "videos": ["HKR-261012-7QF3-teaser"],
  "created": "2026-10-12",
  "stages": { "brief": "confirmed", "facts": null, "story": null, "script": null, "storyboard": null, "prototype": null, "build": null, "voice": {}, "qa": {}, "critique": {} }
}
```

- Add a row to `hookreel-output/PROJECTS.md` (create it with this header if missing):

```text
| Code | Slug | Brand | Title | Created | Folder | Status |
|---|---|---|---|---|---|---|
```

Every later stage updates `stages` in `project.json` and the Status column in `PROJECTS.md`.

Show the code prominently and tell the user: "Your project code is <CODE>. Use /hookreel:resume <CODE> to come back to it."

End: "Confirm the brief and CLAUDE_<CODE>.md, then run /hookreel:facts."

## Rules
- Ask, never assume, for anything that would end up as a claim on screen.
- Keep the user's own storyline and wording when they give one.
- One project, one code, one folder. Never overwrite another project.
- No project without its `CLAUDE_<CODE>.md`, its `CLAUDE.md` import, `project.json` and a row in `PROJECTS.md`.
