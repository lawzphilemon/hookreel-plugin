---
name: wtf-hook-999-optimizer
description: Diagnose social content hook performance and recommend the next WTF Hook 999 experiment from metrics. Use when the user provides reach, views, watch time, retention, saves, shares, comments, DMs, clicks, profile visits, or asks which hook formula to test next.
---

# WTF Hook 999 Optimizer

Turn performance data into one specific next hook experiment. Use `references/wtf-hook-framework.md` to classify the current formula and choose a meaningfully different challenger.

## Inputs

Use whatever is available:

- Platform
- Content topic and audience
- Current hook text
- Hook type and pillar, if known
- Reach or views
- 1-second / 3-second hold, average watch time, completion rate
- Saves, shares, comments, DMs, clicks, profile visits
- Account baseline or comparable-post median

Do not demand every metric. Analyze the available funnel.

## Diagnostic order

### 1. Attention

Use retention or hold metrics when available. Low early retention means the hook or opening delivery failed before judging the body.

### 2. Relevance and value

Use saves, shares, comments, and profile visits. A strong hold with weak saves often means the hook overpromised or the content lacked utility.

### 3. Conversion

Use DMs, clicks, leads, or profile actions. For Lawrence's carousel workflow, prioritize:

1. DM per 1,000 reach
2. Save rate
3. Comments
4. Shares

### 4. Compare fairly

Prefer comparison with:

- Same platform
- Similar audience size
- Similar topic and format
- Account median from the latest 10 comparable posts

If no baseline exists, label conclusions as provisional.

## Core formulas

- `DM per 1,000 reach = DMs ÷ reach × 1,000`
- `Save rate = saves ÷ reach × 100%`
- `Share rate = shares ÷ reach × 100%`
- `Comment rate = comments ÷ reach × 100%`
- `Profile visit rate = profile visits ÷ reach × 100%`

For Lawrence's early carousel benchmark, treat save rate as a working heuristic, not a universal law:

- below 1%: weak
- 1–2%: healthy
- above 3%: strong

Recalibrate after roughly 10 comparable posts.

## Recommendation logic

- Low hold + strong topic demand: replace the hook mechanism.
- Strong hold + weak saves: reduce sensationalism or strengthen payoff utility.
- Strong saves + weak DMs: improve the bridge from insight to deliverable and CTA.
- High comments + low saves: discussion trigger worked, practical value did not.
- High reach + low profile visits: hook was broad but weakly associated with the creator's positioning.
- Strong results: scale the underlying tension, not the exact wording. Avoid using the identical formula repeatedly.

Choose one challenger formula that addresses the diagnosed failure. Do not provide a menu of unrelated options.

## Required output

### Performance Diagnosis
`[aksi] + [objek bernama] + [angka penyebab]`

### Funnel Read
- Attention:
- Value:
- Conversion:
- Confidence level:

### Current Hook Classification
- Pillar:
- Type:
- Audience tension:

### Next Experiment
- Action:
- New hook type:
- New pillar:
- Draft hook:
- Why this is the correct challenger:
- Success metric:
- Minimum improvement target:

### Tracking Row
Provide one copy-paste line:

`date | platform | topic | audience | hook | type | pillar | reach | saves | shares | comments | DMs | DM/1k | save rate | result`
