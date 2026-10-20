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

Read, in this order: `project.json`, **`CLAUDE_<CODE>.md`** (the rulebook: follow it for everything that follows), `01-brief.md`, `02-facts.md`, `03-story.md`, `04-script.md`, `VOICEOVER_<CODE>.md`, `06-motion-<id>.md`, any storyboards, and the studio's `CLAUDE_<CODE>.md` if the project was built. Check that the project folder's `CLAUDE.md` imports `CLAUDE_<CODE>.md` and that the studio's `CLAUDE.md` imports the studio's coded file; restore the import line if it is missing.

## Step 3 — Show where it stands

```text
Project <CODE> · <slug> · <brand> · created <date>
| Stage | Status | Date | File |
| brief / facts / story / script / build | confirmed · approved · needs re-approval · not started | … | … |
| Video | Prototype | Built | Voiceover | QA | Critique | MP4 | Posting folder |
| <CODE>-teaser | approved <date> | yes | recorded <date> | pass / — | written / — | out/<CODE>-teaser.mp4 | publish/ (cover <n>) / — |
```

Flag anything stale: facts older than about 30 days in `02-facts.md`, a `words.json` still estimated after recording, a studio `videos/<id>.json` whose lines differ from the approved script.

## Step 4 — Continue or edit

Ask what the user wants, then route:

| Change | Do | Then |
|---|---|---|
| A rule or ban | Edit `CLAUDE_<CODE>.md` (and the studio's coded file for brand-level rules) | Re-check the script and the built scenes against it |
| Facts | `/hookreel:facts` | Everything after it needs re-approval |
| Hook or beats | `/hookreel:story` | Script and build need re-approval |
| A line or a beat idea | Edit `04-script.md` | Republish the script for approval, rewrite `VOICEOVER_<CODE>.md` (mark changed lines; recorded takes of them are void), then update `videos/<id>.json`, `npm run words` and the affected scenes |
| Motion, layout or sound only | Edit the scenes in the studio's `src/proto/<id>/` | Render the changed scene and send it |
| Too long or loose pacing | `npm run trim -- "<recording>"` (caps the pauses, no retake), then `/hookreel:voice` on the trimmed file | QA again |
| New voiceover take | `/hookreel:voice` | QA again |
| Cover or caption | `/hookreel:publish` | — |
| A carousel slide (copy or look) | Edit `carousel/<id>/02-copy.md` (re-approve) or `carousel.html` | Re-run `/hookreel:carousel` Step 4 and update `report.md` |

**Cascade rule:** editing a stage marks every later stage `needs re-approval` in `project.json` and `PROJECTS.md` (files are kept, approvals are not). Nothing is built again until the script is re-approved.

Never create a new project code for an existing project; a new code is only for a new project.

End: tell the user the code, the current status, and the next command to run.
