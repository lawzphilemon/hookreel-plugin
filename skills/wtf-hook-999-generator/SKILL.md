---
name: wtf-hook-999-generator
description: Generate, rank, and refine high-retention social media hooks using the WTF Hook 999 framework. Use when the user asks for hooks, headlines, carousel covers, Reel/TikTok openings, YouTube titles, thread openings, contrarian angles, curiosity gaps, or says “WTF Hook 999”.
---

# WTF Hook 999 Generator

Turn a topic, article, dataset, story, offer, or rough idea into credible, audience-centric hooks. Use the framework in `references/wtf-hook-framework.md`.

## Default behavior

- Work from the context already available. Do not interview the user when reasonable defaults can be inferred.
- If the input is materially incomplete, ask at most one question and still provide a clearly labeled provisional result.
- Default language follows the user. For Lawrence, default to natural Indonesian with light English terminology.
- Default mode is **Quick**: create 5 candidates internally, show the winner plus 2 meaningful alternatives.
- Use **Matrix mode** only when requested: generate one hook for each relevant type, or 15 × 3 when explicitly requested.

## Inputs to infer or collect

1. Topic or source material
2. Target audience and current emotional state
3. Platform and hook placement
4. Desired action: continue reading, save, share, comment, click, or DM
5. Available evidence: data, source, personal experience, product document
6. Provocation level: default Level 2, contrarian plus curiosity gap

## Workflow

### 1. Distill the content

Write privately:

- Literal content / feature
- Immediate benefit or pain
- Deeper meaning for this audience
- One-sentence context
- Consequence chain: “so what” at least twice

### 2. Build audience tension

Identify:

- Who this is for
- What they believe now
- What they want
- What blocks them
- What changes if they ignore or understand the topic

### 3. Select emotional mechanics

- Choose one primary pillar: GAIN, PAIN, or CURIOSITY.
- Choose one secondary pillar only when it adds clarity.
- Select 1–3 genuine human instincts from the reference.
- Generate candidates from at least 3 different hook types. Do not merely paraphrase one formula.

### 4. Protect credibility

- Never invent statistics, product features, research findings, medical causality, financial returns, legal rules, or quotes.
- When a number or claim lacks a reliable source, use `[perlu verifikasi]` or remove it.
- A forecast must be framed as a scenario or inference, not certainty.
- A personal confession must not be fabricated for the user.
- Never attack named competitors, protected groups, or private individuals.

### 5. Simplify

- Carousel cover: maximum 15 words, statement form, no question mark, no exclamation mark.
- Reel/TikTok spoken opening: target 8–18 words; a question is allowed only when it sounds natural.
- YouTube title: target 6–12 words; preserve searchable topic keywords.
- X/Threads opening: one sharp sentence; avoid overexplaining.
- Remove setup phrases such as “hari ini saya mau membahas”.

### 6. Score candidates

Score 1–5 using:

- Scroll-stop power: 30%
- Audience relevance: 25%
- Credibility and payoff: 20%
- Emotional tension: 15%
- Simplicity: 10%

Reject any hook that scores below 4/5 on credibility and payoff, even if it is provocative.

### 7. Define the payoff

For every curiosity or contradiction hook, state exactly what the content must explain. If the payoff is missing from the source material, soften or replace the hook.

## Special mode: insurance and financial protection

When the topic involves insurance, financial planning, Prudential, medical coverage, claims, or PAYDI:

- Use a protective, consultative, low-pressure tone.
- Do not guarantee claim approval without complete medical and policy information.
- State that unit-link/PAYDI returns are not guaranteed whenever returns are discussed.
- Mention a 12-month waiting period only when relevant and supported by the product document or validated source.
- Describe repricing as connected to medical-cost inflation; do not frame it as arbitrary.
- Do not bash competitors, BPJS, or public programs. BPJS may be framed as a foundation, not the entire roof.
- Product premiums, benefits, exclusions, and policy clauses must come from supplied documents or be marked `[perlu verifikasi]`.
- Avoid fear tactics around death, illness, or family hardship. Tension is allowed; terror is not.

## Required output

Use this compact structure unless the user requests another format:

### Hook Strategy
- Audience:
- Core tension:
- Primary pillar:
- Hook type:
- Human instincts:
- Evidence status:

### Recommended Hook
`<final hook>`

**Score:** `<weighted score>/5`

**Why it wins:** 1–2 sentences.

**Payoff required:** one specific sentence describing what the content must prove or explain.

### Alternatives
1. `<alternative from a different hook type>`
2. `<alternative from a different hook type>`

### Delivery note
One sentence adapted to the platform, such as visual emphasis, spoken pause, or carousel payoff location.

## Final quality gate

Before responding, verify:

- The hook matches the actual topic and audience.
- The surprising claim is defensible.
- The content can pay the curiosity debt.
- No fabricated number, quote, or personal story appears.
- No exclamation mark appears in a carousel cover.
- The winner is not just the most sensational candidate.
- The alternatives use different mechanisms, not synonyms.
