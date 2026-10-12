---
name: resume
description: Reopen an existing hookreel project by its project code (HKR-YYMMDD-XXXX) — load its rulebook, show where every stage and video stands, and continue or edit it without losing approvals by accident
argument-hint: "[project code, slug or brand]"
allowed-tools: Read, Write, Edit, Glob, Bash
---

# HKR-0 — Resume a project

**Mission:** Come back to any project later, by its code, with all of its rules and decisions loaded, and edit it safely. Follow the `hookreel-rules` skill.

Argument: $ARGUMENTS

## Step 1 — Find the project

- A code was given (any case, e.g. `hkr-261012-7qf3`): open `hookreel-output/<CODE>_*/`.
- A slug, brand or words from a title were given: search `hookreel-output/PROJECTS.md` and every `hookreel-output/*/project.json`; if several match, list them and ask which one.
- Nothing was given: show `hookreel-output/PROJECTS.md` (code, slug, brand, title, created, status) and ask which project.

If `PROJECTS.md` is missing or out of date, rebuild it from the `project.json` files.

## Step 2 — Load it

Read, in this order: `project.json`, **`CLAUDE_<CODE>.md`** (the rulebook: follow it for everything that follows), `01-brief.md`, `02-facts.md`, `03-story.md`, `04-script.md`, `VOICEOVER_<CODE>.md`, the storyboards, and the studio's `CLAUDE_<CODE>.md` if the project was built. Check that the project folder's `CLAUDE.md` imports `CLAUDE_<CODE>.md` and that the studio's `CLAUDE.md` imports the studio's coded file; restore the import line if it is missing.

## Step 3 — Show where it stands

```text
Project <CODE> · <slug> · <brand> · created <date>
| Stage | Status | Date | File |
| brief / facts / story / script / storyboard / build | confirmed · approved · needs re-approval · not started | … | … |
| Video | Built | Voiceover | Storyboard | QA | MP4 |
| <CODE>-teaser | yes | recorded <date> | approved / recorded | pass / — | out/<CODE>-teaser.mp4 |
```

Flag anything stale: facts older than about 30 days in `02-facts.md`, a draft JSON newer than its approved storyboard, a studio video file that differs from the approved draft.

## Step 4 — Continue or edit

Ask what the user wants, then route:

| Change | Do | Then |
|---|---|---|
| A rule or ban | Edit `CLAUDE_<CODE>.md` (and the studio's coded file for brand-level rules) | Re-check the script and storyboard against it |
| Facts | `/hookreel:facts` | Everything after it needs re-approval |
| Hook or beats | `/hookreel:story` | Script and storyboard need re-approval |
| A line, a visual, a cue | Edit `04-script.md` | Republish the script for approval, rewrite `VOICEOVER_<CODE>.md` (mark changed lines; recorded takes of them are void), then regenerate the storyboard |
| Timing, layout or sound only | Edit the draft JSON | Regenerate and republish the storyboard |
| New voiceover take | `/hookreel:voice` | QA again |

**Cascade rule:** editing a stage marks every later stage `needs re-approval` in `project.json` and `PROJECTS.md` (files are kept, approvals are not). Nothing reaches the studio again until the script and storyboard are re-approved.

Never create a new project code for an existing project; a new code is only for a new project.

End: tell the user the code, the current status, and the next command to run.
