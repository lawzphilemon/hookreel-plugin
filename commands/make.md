---
name: make
description: One entry point for a whole video — brief, facts, story and script, prototype, then every scene, voice, QA, cover and caption — stopping only four times for the user
argument-hint: "[topic or brief notes]"
allowed-tools: Read, Write, Edit, Bash, Glob, Agent, AskUserQuestion, WebSearch, WebFetch, Skill
---

# HKR-M — Make a video

**Mission:** One command from topic to posting folder, with the same output quality as running every stage alone, and only **four stops** for the user:

1. **Brief** — one message: at most six questions plus the pre-filled brief. The reply is the confirmation.
2. **Story + script** — the script review with the three hooks on top (recommended one in scene 1). One reply: pick the hook and approve, or ask for changes.
3. **Prototype** — one rendered scene (a 3D look: the stills contact sheet). Approve the look, or ask for changes.
4. **Final** — preview, cover variants and caption in one message. Pick a cover, or ask for fixes.

**Unanswered questions carry over.** When the user's reply at a stop leaves one of its questions open, use the stated default, record it in `<project>/DECISIONS.md`, and open the next stop's message with a short "Still open from the last stop" list (question, default used). The user can change any of them there.

Other stops only when the user must decide: facts with a claim NOT FOUND or CONTRADICTED (or an alternative to choose), and the "stop and ask" cases of `/hookreel:produce` (a changed line, claim, number or timing; a ban that cannot be met; a voice problem; a critique still under 8 after three rounds). Between stops, never wait for the user and never suggest a new session.

Argument: $ARGUMENTS (a topic or brief notes; use them to answer what they can in stop 1). Follow the `hookreel-rules` skill and, once it exists, `<project>/CLAUDE_<CODE>.md`. Each stage's steps are in its own command file; run them as written there, do not shorten them.

## Flow

| # | Run | Stop |
|---|---|---|
| 1 | `/hookreel:brief` Steps 1–5 | **Stop 1** at Step 2 (one message) |
| 2 | `/hookreel:facts` Steps 1–4 | only on a failed claim; else `Status: confirmed (auto)` |
| 3 | `/hookreel:story` Steps 1–5 (no approval of its own) | — |
| 4 | `/hookreel:script` Steps 1–6 (Step 6 only when a human records) | **Stop 2** at Step 5 |
| 5 | `/hookreel:build` Steps 0–4 | **Stop 3** at Step 4 (prototype) |
| 6 | `/hookreel:produce <id>`: build Steps 5–6, voice, critique loop, QA, render, self-critique, publish Steps 1–3; plus build Step 7 (studio CLAUDE files) | **Stop 4**: preview + covers + caption |
| 7 | `/hookreel:publish` Step 4 (posting folder) once a cover is picked | — |

For a series, run steps 5–7 per video; stops 3 and 4 are per video.

A human voiceover not recorded yet at step 6: send the prototype result and the recording guide, and wait for the take (that wait is the recording, not an extra review). A synthetic voice goes straight on.

## State and resuming

Every stage writes its state to files (`project.json`, `CLAUDE_<CODE>.md`, the stage outputs), so nothing lives only in chat. If the context runs low, tell the user: "Continue with /hookreel:resume <CODE>." It picks up at the first stage that is not done.

End: the posting folder message from `/hookreel:publish` Step 4.
