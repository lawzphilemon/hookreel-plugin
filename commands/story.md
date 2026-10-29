---
name: story
description: Build the story with the WTF Hook 999 framework, three hook options across Gain, Pain and Curiosity, then a beat sheet per video that keeps the user's own storyline
allowed-tools: Read, Write, Skill
---

# HKR-3 — Story

**Mission:** Turn the brief and the verified facts into a story that stops the scroll and earns the CTA. Requires confirmed `01-brief.md` and `02-facts.md` in `<project>/`. Read `<project>/CLAUDE_<CODE>.md` first: its bans override the framework's examples. Follow the `hookreel-rules` skill.

`<project>` is the project folder `hookreel-output/<CODE>_<slug>/` and `<CODE>` its project code (see `hookreel-rules`); `<id>` is a video id, always `<CODE>-<name>`.

## Step 1 — Load the framework

Load the WTF Hook 999 skill (`wtf-hook-999`, bundled with this plugin) and follow its workflow and hook types. Use `wtf-hook-999-auditor` to score and tighten the hooks before they are shown.

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

Give every beat a role from this set (the order varies; the roles and their pace recur):

| Role | Does | Pace |
|---|---|---|
| start | the subject at rest, before anything happens | held, quiet, 1–1.5 s |
| build | one framing, detail added | 3–6 s, rising |
| change | the subject's form or state changes | a hit on the change |
| turn | it could go wrong, or everything gathers | builds slowly, then changes in 1–3 frames; sound drops just before; carries the loudest hit and the `special` beat |
| quiet | alone, still | held, the lowest sound |
| payoff | the claim is proved or the result shown | held long enough to read |
| close | the ask, or a return to the opening image, changed by the story | calm |

Every cut or transition between beats has a reason you can say out loud (next step, this becomes that, cause and effect, later, back to an earlier image changed). A beat with no reason to be there is cut. Where it fits, the last beat calls back to the first image, changed.

Budget about 2.1 spoken words per second. Keep each video within the brief's target length; say which beats you would cut first if it runs long.

## Step 5 — Save

Save `<project>/03-story.md` with the hook options, the recommendation, and the beat sheets, first line `Status: draft — reviewed with the script`. **No separate approval:** go straight on to `/hookreel:script`, which writes the recommended hook into scene 1 and shows all three hooks at the top of the script review. The user picks the hook and approves the beats there, in one reply (revising on paper is still cheap; revising after the build is not).

When the script is approved, `/hookreel:script` sets `Status: confirmed` here with the chosen hook per video, and records the chosen hook under **Rules for this video** in `CLAUDE_<CODE>.md`.

Update `<project>/project.json` (`stages.story`) and the Status column in `hookreel-output/PROJECTS.md`.

End: go straight on to `/hookreel:script` (no stop). Run alone, end with: "Story saved. Next: /hookreel:script — the hooks are picked on the script review."

## Rules
- A hook whose claim the video does not pay off is clickbait. Every hook names its payoff beat.
- No claim outside the allowed list. No hype voice if the brand voice forbids it.
- Keep the user's wording where they gave it.
