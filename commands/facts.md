---
name: facts
description: Verify every number and claim the video will show or say against primary sources, date it, label estimates, and produce the allowed and forbidden claims list
allowed-tools: Read, Write, WebSearch, WebFetch, Bash
---

# HKR-2 — Fact Gate

**Mission:** Nothing reaches the screen or the voiceover unless it can be defended. Requires a confirmed `hookreel-output/<slug>/01-brief.md`. Read `hookreel-output/<slug>/CLAUDE.md` first and follow it. Follow the `hookreel-rules` skill.

## Step 1 — List the claims

From the brief, its sources and the user's storyline, list every factual claim the video is likely to make: numbers, rankings, dates, prices, "first", "only", "most", quotes, and any statement about a third party's product or policy. Include claims the storyline implies even if no number was given (for example "why this works in [country]" needs evidence).

## Step 2 — Verify

For each claim, in this order of preference:
1. The user's own source files (PDF reports, exports). Read the actual page; quote the page number. For image-only PDFs, render the page and read it.
2. The primary publisher (the company's own announcement, the analytics provider's own page, the official report).
3. A reputable outlet quoting the primary source (wire services, established trade press).
4. Aggregator or blog statistics: usable only as a labelled estimate, never as fact.

Record for each: the exact wording the source supports, the source, its date, and what it measures (visits are not people; a survey of internet users aged 16+ is not the whole population; a run rate is not booked revenue).

When a number the user wants does not exist in any credible source, say so plainly and offer the closest defensible alternatives (a percentage instead of an absolute count, a ranking instead of a user number, or a labelled estimate). Let the user choose.

## Step 3 — Make it age well

- Prefer dates over relative time ("since September 24", not "three weeks ago").
- Note numbers that will go stale (monthly rankings, user counts) and the date they were checked.
- Flag findings that contradict the brief (for example a country no longer in a top-five list).

## Step 4 — Save

Save `hookreel-output/<slug>/02-facts.md`:

```text
Checked: [date]
| # | Claim as it may appear | Verdict | Exact supported wording | Source (page) | Source date | Measures | On-screen source label |
Verdicts: VERIFIED · ESTIMATE (label "estimate" on screen) · NOT FOUND · CONTRADICTED

Allowed claims: [bullets, ready to use]
Forbidden claims: [from the brief, the context profile's hard rules, and NOT FOUND / CONTRADICTED items]
Goes stale: [claim → recheck before posting after …]
Sources: [markdown links]
```

Show the table in chat with the sources, and ask the user to confirm or pick alternatives. On confirmation add `Status: confirmed` as the first line.

Then update `hookreel-output/<slug>/CLAUDE.md`: copy every NOT FOUND and CONTRADICTED claim, word for word, into **Bans → Claims**, and add any stale-fact recheck date to **Rules for this video**.

End: "Confirm the facts, then run /hookreel:story."

## Rules
- Never compute a new number by combining sources with different bases (for example a percentage of 16+ users times the total population).
- Never present an estimate as a fact.
- Experience claims ("in our account it arrived within a minute") are allowed only when the brief says the experience is real, and never with money results unless the brief explicitly allows them.
