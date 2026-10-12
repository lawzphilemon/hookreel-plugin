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
