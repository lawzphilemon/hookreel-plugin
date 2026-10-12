# Visual catalog

The exact fields are in the template's `src/schema.ts`. Working examples of every type: `reference/all-visuals.json` (plugin root) and `examples/gwenchana-chatgpt-ads/videos/teaser.json`.

Text fields accept `backticks` for inline code. Every `cue` is an exact phrase from the scene's `vo`.

| Type | Use it for | Key fields |
|---|---|---|
| `headline` | A statement hook or a turn in the story | `text`, `eyebrow`, `sub`, `chips` |
| `stat` | One big number with its meaning and source; `dots` shows a share out of 100 | `value`, `label`, `source`, `dots.lit`, `chips` |
| `ranking` | "#4 in the country", one item lit, others dimmed | `items` (in order), `highlight`, `keep`, `source`, `dimCue` |
| `tiles` | 2–3 numbers side by side ("1 trigger, 2 destinations, 4 formats") | `tiles[].value/label/hot`, `source`, `text`, `chips` |
| `timeline` | Dates leading to "now" | `items[].date/text/hot`, `chip` |
| `bars` | Two values compared (reported vs real) — heights are relative, not data | `items[].label/value/ratio/hot`, `text` |
| `flow` | A process or a diagram: steps with connectors, a break where it fails, a split into two destinations, result cards | `tools`, `steps`, `breakAfter`, `split`, `results`, `chip` |
| `chat` | An AI assistant answer, optionally with a sponsored card | `app`, `question`, `sponsored`, `chip` |
| `journey` | The customer path in 2–4 screens: ad → page → tap → chat | `steps[].title/kind/text` (`kind`: ad, page, tap, chat, text) |
| `ui` | A recreated software screen for a how-to step | `window`, `step`, `rows` (field, check, toggle, row with status change, code, path breadcrumb), `button`, `after` |
| `list` | Dash list, checklist, or a list that gets crossed out with the real answer revealed | `style` (dash, check, strike), `items`, `strikeCue`, `answer` |
| `logo` | "We do this ourselves" — the brand mark with a statement | `headline`, `chip` |
| `swap` | Two visuals in one scene, crossfading at a cue (ranking → stat) | `first`, `second`, `at` |
| `cta` | The closing card built from `video.cta` | `headline`, `cue`, `footer` |

Scene-level `note`: a "Watch out" card under the visual (`label`, `text`, `cue`).

## Choosing

- A number the viewer should remember → `stat` (with `dots` for "1 in 3" style shares).
- A position or rank → `ranking`.
- How something works → `flow` or `journey`.
- A step in a tool → `ui`.
- Blame, myths, wrong assumptions → `list` with `style: "strike"`.
- Keep one idea per scene. If a scene needs two, use `swap` or split the scene.

## Layout specs (for the storyboard's Composition blocks)

All sizes in px on the 1080×1920 frame, taken from the template's components. Colours are `brand.json` tokens.

**Frame zones**
- Header: eyebrow at x 80, y ≈ 150, 28 px / 600, uppercase, tracking 0.16em, `accent`; logo top-right, 150 px wide (or the brand name as text).
- Content: x 80–1000, y 330–1300 (930 px tall). Elements stack top-down with 28–56 px gaps.
- Caption: x 80, y 1340, width 860, 46 px / 600, `text`, line-height 1.25, balanced wrap.
- Platform UI covers y > 1500 and the right ~120 px; nothing important there.

**Shared**
- Headline: weight 800, line-height 1.05, tracking -0.03em, `text`. Default size per type: headline 104, chat 100, ranking 96, bars 96, tiles 92, timeline 92, logo 92, cta 92, flow 88, list 88, stat 84, journey 84, ui 84.
- Pill: radius 999, padding 0.42 × size by 0.9 × size; accent pill has a soft accent glow.
- Card: radius from `brand.json` (default 28). Panels (UI mockups) are `panel` with a 2 px `panelLine` title bar and three dots.
- Highlight: 4 px `accent` outline, offset 4 px, 14% accent tint.
- Source label: 24 px / 500, `muted`, 14 px under its number.

**Per type**
- stat: number 200 px (180 with dots) / 800 `accent`; label 44 / 600 `text`; dots 10×10 circles of 36 px, gap 12 (468 px square), lit dots `accent`, others `track`.
- ranking: rows 42 px / 600 (highlight row 800 `accent`), rank column 72 px `muted`, row padding 14 × 22.
- tiles: equal-width cards, value 132 / 800 `accent` (hot tile: `panel` with `panelText`), label 32 / 600, padding 32 × 24.
- timeline: 28 px dots (hot: `accent` with glow), 4 px connector drawing in `text`; date 30 / 700 `muted` (hot `accent`), text 40 / 600.
- bars: area 420 px tall; value 56 / 800 above each bar; bars radius 20 (`accent` for hot, `track` otherwise); label 32 / 600 `muted`.
- flow: nodes radius 24, padding 20 × 26, label 24 / 600, text 36 / 700 (accent node: `panel`); connectors 44 px tall, 4 px `accent`; broken link 4 px dashed `error` with a 26 px `errorText` label; tool pills 30; result cards label 24, value 30 mono (or 56 / 800 when big).
- chat: panel with the app name in the title bar; question bubble 30 / 500 on `panelSoft`, right-aligned; three 18 px answer lines; sponsored card: label 22 `panelMuted`, title 32 / 700, button 24 on `panelText`.
- journey: 2 per row, cards 360 px tall, step number 44 / 800 `accent`, title 28 / 700; inner screen on `panel`, radius 20.
- ui: field label 24 / 600 `panelMuted`, field box 32 / 600 on `panelSoft`, radius 14; toggle 84 × 46 (on: `accent`); checkbox 40 px; rows 30 px with a right-side label 24 or a status pill 22; code block 28 px mono on `panelText`; breadcrumb pills 28.
- list: dash items 48 / 600 with an `accent` em dash; check items 40 / 500 with an `accent` ✓; strike items are 40 px pills crossed by a 5 px `errorText` line; answer pill 56 `accent`.
- logo: 460 px wide, then the headline.
- cta: headline, then a `surface` card (padding 36): kicker 28 / 600 `muted`, title 56, chips 28, accent button pill 40, sub line 32 / 500; footer 38 / 600 `muted`.
- note: `surface` card, padding 24 × 32, eyebrow 30 `accent`, text 38 / 500.
