---
name: story
description: Build the story with the WTF Hook 999 framework, three hook options across Gain, Pain and Curiosity, then a beat sheet per video that keeps the user's own storyline
allowed-tools: Read, Write, Skill
---

# HKR-3 — Story

**Mission:** Turn the brief and the verified facts into a story that stops the scroll and earns the CTA. Requires confirmed `01-brief.md` and `02-facts.md` in `hookreel-output/<slug>/`. Read `hookreel-output/<slug>/CLAUDE.md` first: its bans override the framework's examples. Follow the `hookreel-rules` skill.

## Step 1 — Load the framework

Load the WTF Hook 999 skill (`wtf-hook-999:wtf-hook-999`) and follow its workflow and hook types. If it is not installed, stop and tell the user to install it:

```text
/plugin marketplace add lawzphilemon/wtf-hook-999
/plugin install wtf-hook-999@wtf-hook-999-marketplace
```

Use only the **allowed claims** from `02-facts.md`. Apply the brand voice and hard rules from the context profile, not the framework author's personal voice rules.

## Step 2 — Structure

**If the user gave a storyline:** keep its beats and their order. Sharpen each beat's angle, merge or split only with the user's consent, and add only what is missing (usually the hook mechanism and the bridge into the CTA).

**If not:** pick the arc from the audience's awareness in the brief.
- Unaware: what it is → why it matters here → why now → proof → how it works → what it takes → CTA.
- Aware, not using: hook → pain → why it matters → the fix → what it takes → CTA.
- Already using: hook (the mistake they are making) → why it costs them → the fix, step by step → checkpoint → CTA.

For a series, give each video one job (for example teaser: the why; part 1–3: one phase each) and end every video with the same CTA plus a pointer to the next one.

## Step 3 — Hooks

For each video, write three hook options from the one or two hook types that best fit the facts: one GAIN, one PAIN, one CURIOSITY. Each is 8–18 spoken words and understood in under a second. For each, give the hook type, the instinct it touches, and the payoff: where in the video the claim is resolved. Recommend one.

## Step 4 — Beat sheet

Per video, a table:

| # | Beat | What the viewer must feel or learn | Key line (draft) | Evidence (fact #) | Visual idea |

Budget about 2.5 spoken words per second. Keep each video within the brief's target length; say which beats you would cut first if it runs long.

## Step 5 — Save

Save `hookreel-output/<slug>/03-story.md` with the hook options, the recommendation, and the beat sheets. Show it and ask the user to pick hooks and confirm the beats. Revising here is cheap; revising after the build is not. On confirmation add `Status: confirmed` as the first line, with the chosen hook per video.

Record the chosen hook per video under **Rules for this video** in `CLAUDE.md`.

End: "Confirm the story, then run /hookreel:script."

## Rules
- A hook whose claim the video does not pay off is clickbait. Every hook names its payoff beat.
- No claim outside the allowed list. No hype voice if the brand voice forbids it.
- Keep the user's wording where they gave it.
