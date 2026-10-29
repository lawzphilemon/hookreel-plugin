# Truemission preset

A ready brand context for `/hookreel:brief`, so a new Truemission project starts from the brand's own
rules instead of a blank interview.

| File | What it is |
|---|---|
| `brand.json` | Colour tokens, fonts, radius, motion for the studio (`Brand` in `template-remotion/src/schema.ts`; HyperFrames scenes use its colours and logo). `logo` is `null` because the real logo is private: set `"logo": "brand/truemission-logo.png"` after copying it into the studio's `public/brand/`. |
| `CLAUDE.md` | The brand law: voice, compliance hard rules, end-card disclaimers, the CTA shape, measured pacing, look, bans. |

## Using it

1. **A new studio for this brand**

   ```bash
   mkdir -p hookreel-studio/truemission
   cp -r "${CLAUDE_PLUGIN_ROOT}/template/." hookreel-studio/truemission/
   cp "${CLAUDE_PLUGIN_ROOT}/brands/truemission/brand.json" hookreel-studio/truemission/brand.json
   cd hookreel-studio/truemission && npm install
   ```

   Then add the private assets the preset deliberately does not carry: the logo, the watermark tile,
   the 3D presenter poses, the SFX library, the music.

2. **A new project for this brand**: `/hookreel:brief` reads `brands/truemission/CLAUDE.md` first and
   skips every question it answers — voice, claims, disclaimers, CTA, pacing, look. It still asks the
   things only the video knows: topic, the pain, the audience, the evidence, the series job.

3. **Fan a rule into the project's own file**: `CLAUDE_<CODE>.md` may add to these rules. It may not
   loosen one, and a compliance rule changes here, in the preset, with the reason recorded.

## Keeping it honest

The pacing section carries numbers from real posted reels (a 91.8 s reel: 50 % of viewers gone by
2.7 s, 8 % left at the ask). When a new reel's Insights disagrees with a line here, the line changes —
the whole point of shipping the preset is that the next project does not repeat a measured mistake.
