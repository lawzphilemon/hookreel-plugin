# Motion reference library

**`/hookreel:build` reads this whole file before designing any scene**, together with the user's own reference reels for the video. It is the shared library for every brand: the same moves, rules and fonts apply to all brands alike (only a 3D character is brand-specific, and it is opt-in).

Everything here is **ideas on composition and motion only**: never copy a creator's artwork, footage, music or wording, and never name or tag them in a client video. Recreate every move in code (`src/proto/kit.tsx` and new components), with the brand's own words and colours.

How to use it: for each beat, pick a move here (or from the user's reels) that carries the beat's one idea, then change it enough that it is new for this video: a different prop, a different direction, a different reveal. Do not reuse the same move twice in a row, and do not repeat a scene from the brand's previous video.

## A. Personal reference reels (the core look)

Moves from the user's own reference reels, described in words only. These set the base look: one idea per screen, beats on the spoken words, lots of empty space, elements that enter, act and leave.

| Move | How to build it |
|---|---|
| Kinetic words, blur to sharp, with a marker under the key word | Each word focuses in from an 18 px blur and a slight scale (`Word`); the key word gets a marker bar that wipes in under it a beat later. |
| Phone or map mockup with a glowing halo | A drawn phone (rounded rect, notch) or a flat map; a soft radial glow pulses behind it; content inside the screen moves on the words. |
| Search bar typed into, results list, one result picked, a price-style pill | Letters appear one per few frames with a blinking caret; result rows slide up one by one; one row highlights and scales; a pill pops next to it (use a label or a number with its source, never an invented price). |
| Brand-colour background with a pill CTA button pressed | The frame floods with the brand colour; a pill button enters, a cursor or finger taps it, the button squashes (scale 0.94) and springs back. |
| Hard dial needle sweeping | A semicircle gauge with ticks draws in; the needle snaps from one end toward a value with a quick ease and a small settle. |
| Hexagon icon nodes linked by lines | Hexagons with simple line icons pop in one by one; connecting lines draw between them (`strokeDashoffset`), building a network on the words. |
| Pill tags toggling filled and outlined | A row of pill tags; on the cue word one flips from outline to filled colour (and others back), like a choice being made. |
| Calendar and checklist cards in 3D tilt, with a chunky 3D object | UI cards rotated in perspective (`rotateX/rotateY`), checks ticking down a list, a calendar day marked; one solid 3D-looking object (a dumbbell-like shape) sits in front for depth. |
| Dashed crosshair grid framing a word | Thin dashed guide lines and corner ticks draw in around a single word, like a designer's frame; the word lands in the centre. |
| Progress ring around an avatar | A circle avatar (drawn, never a real person without permission) with a ring that fills to a value; the value counts up beside it. |
| Paper-texture editorial type | Paper grain (`Grain`) on a warm base, mixed sizes and weights in one centred block, an italic serif for the accent word. |
| Old TV with content on its screen | A drawn retro TV; the screen content switches with a quick flicker or scan-line roll between beats. |
| Keyboard sliding in at an angle | A drawn keyboard enters tilted from below; keys depress as words are "typed" into a field above it. |
| Warm orange editorial with a compass, an arc of icon nodes, stacked bars with a playhead | A compass needle swings to a heading; icon nodes travel along an arc path; stacked bars grow while a vertical playhead scrubs across them, revealing values as it passes. |

## B. Instagram motion library (scraped 2026-10-15)

Scraped from Instagram keyword search ("motion infographic", "infographic animation", "animated infographic", "data visualization animation", "infografis animasi", "explainer motion graphics"); 141 videos checked, a frame of each candidate viewed. Views and likes as of that date. "Move" is what to rebuild as custom motion.

### Data and numbers

| Reel | Account | Views / likes | Len | What it does | Move |
|---|---|---|---|---|---|
| [DIZIBB2x9bD](https://www.instagram.com/reel/DIZIBB2x9bD/) | mindset.therapy | 6.1M / 141k | 8 s | Gold particles pour through a funnel into one circle, then spread thin across five; one line of text under each state. A ratio told without a single number. | Particles pour into one container, then split across several; show "concentrated vs spread" as fill, not digits |
| [DGVFtgQtlJe](https://www.instagram.com/reel/DGVFtgQtlJe/) | valueanimate | 328k / 15k | 5 s | Line chart in a glass card; a cursor taps Days → Months → Years and the same line reshapes. | A line redraws when a time-frame toggle is tapped; the tap lands on the spoken word |
| [DXtFg2Mkww0](https://www.instagram.com/reel/DXtFg2Mkww0/) | galihwar | 1.07M / 51k | 16 s | Study of a launch countdown: tiny dots on white orbit and collapse into digits. Almost empty frame. | A big number assembled from small dots that orbit and collapse into the digits; almost empty frame |
| [DePUFS4Bm2K](https://www.instagram.com/reel/DePUFS4Bm2K/) | cinegraph.design | 1.4k / 28 | 95 s | "About 1,040 Sundays left at 60": a life as a striped bar under a landscape whose light fades scene by scene. | A period of time as a striped bar that empties while the background light fades |
| [DebPdNvCYMH](https://www.instagram.com/reel/DebPdNvCYMH/) | creativenergy.it | 204 / 0 | 12 s | Navy editorial frame: isometric grid of tiles, three small stats in the footer (% change, count 00/64). | An isometric tile grid that lifts tile by tile, with small counters ticking in a footer strip |
| [Co9k2_tjNug](https://www.instagram.com/reel/Co9k2_tjNug/) | datavizproject | 7.4k / 279 | 29 s | One small dataset re-drawn as many chart types; 3D bars on white. | The same data morphing from one chart form into another (bars → dots → ring) between beats |
| [DUja7ERE5P6](https://www.instagram.com/reel/DUja7ERE5P6/) | madebyfern | 11.6k / 468 | 8 s | Radar chart on cream paper, axes and points drawing in; editorial serif labels. | A radar "profile" whose axes draw in and whose shape inflates point by point, serif labels on paper |
| [DU8FmQCkUqU](https://www.instagram.com/reel/DU8FmQCkUqU/) | stephanzammit | 3.0k / 83 | 19 s | Static infographic turned motion: a ranking of watch brands with values sliding in. | Ranked rows sliding in from the side with their values counting up, the leader last |
| [DV1DmSCEch1](https://www.instagram.com/reel/DV1DmSCEch1/) | _the__editorr | 12.6k / 207 | 8 s | Counter (49358) ticks up while a line draws beside it. | A counter ticking up in sync with a line drawing beside it |
| [DYpJuYHo6LL](https://www.instagram.com/reel/DYpJuYHo6LL/) | armanmotions | 7.2k / – | 6 s | Neon line chart in a rounded card, line steps up. | A glowing line climbing in steps inside a card |
| [DLo8i2JNE5g](https://www.instagram.com/reel/DLo8i2JNE5g/) | letmeview.8 | 18.8k / 415 | 6 s | Vox-style map: halftone grey US map, one red route line draws across. | A halftone grey map with one coloured route drawing across it |

### Explainers that structure an idea

| Reel | Account | Views / likes | Len | What it does | Move |
|---|---|---|---|---|---|
| [DVDrWS2EvO4](https://www.instagram.com/reel/DVDrWS2EvO4/) | kries.valerio | 1.1M / 159k | 38 s | Indonesian hand-drawn explainer (acids and bases): marker bubbles linked by arrows, words written as spoken. | Hand-drawn bubbles and arrows that write themselves on the spoken word; proof that plain Indonesian and simple diagrams travel far |
| [DcLzGYovY9B](https://www.instagram.com/reel/DcLzGYovY9B/) | sultanmotions | 688k / 24k | 44 s | Breaks an explainer into its sections: intro, problem, use case, features, CTA, on a product mockup. | One product mockup that changes state per section (problem, use, features, CTA) instead of new layouts |
| [DbagmfuIKyH](https://www.instagram.com/reel/DbagmfuIKyH/) | earn.edits | 88k / 4.6k | 32 s | Brand-history story told over newspaper clippings and collage cut-outs, one caption line per beat. | Paper clippings and cut-outs sliding over each other, one line per beat (drawn, never real articles without rights) |
| [DN04dIuZr9d](https://www.instagram.com/reel/DN04dIuZr9d/) | visuals.jai | 23k / 504 | 14 s | Product shot on one side, arrow bullets ("premium positioning") ticking in on the other. | An object on one side, arrow bullets ticking in on the other on each spoken point |
| [DeXFLz4tZtV](https://www.instagram.com/reel/DeXFLz4tZtV/) | gozmotion.ae | 3.9k / 83 | 15 s | "X doesn't just sell Y": one-line claim, product in a circle, items orbit. | One object in a circle with related items orbiting it under a one-line claim |
| [DZb6sRCx7DI](https://www.instagram.com/reel/DZb6sRCx7DI/) | micheal_ay52 | 1.2k / 33 | 75 s | Public-awareness collage: cut-out photos, flat colour blocks, numbered chapters (02 EXPERIENCE). | Big chapter numbers that wipe in between sections of a long reel |

### Product and UI explainers (SaaS style)

| Reel | Account | Views / likes | Len | Move |
|---|---|---|---|---|
| [DXr3qpkASFv](https://www.instagram.com/reel/DXr3qpkASFv/) | studio.ojas | 96k / 4.7k | 30 s | Old way vs new way side by side, one brand colour holding the whole reel together |
| [DWUAfqRDCT2](https://www.instagram.com/reel/DWUAfqRDCT2/) | fudail_shahzad | 59k / 1.5k | 13 s | Phone UI cards stacking and fanning out on a dark navy field |
| [DTihcLUCZZ8](https://www.instagram.com/reel/DTihcLUCZZ8/) | motionbyemile | 889k / 78k | 12 s | One brand colour floods the frame between beats (circle or wipe), resetting the stage |
| [DddhvBLxGET](https://www.instagram.com/reel/DddhvBLxGET/) | motii_nv | 18.6k / 435 | 147 s | A percentage slider whose handle drags and whose fill and number follow |
| [CDrKcOen_Cm](https://www.instagram.com/reel/CDrKcOen_Cm/) | lostframee_tips | 2.4k / 172 | 60 s | A pie or donut building slice by slice, each slice labelled as it lands |

### Patterns across the set

- **One idea, one move, under 15 s** wins reach: the top data reels (6.1M, 1.07M, 328k) are 5–16 s with one metaphor each.
- **Metaphor over digits:** the biggest reel shows a ratio with particles and a funnel, no number on screen. When the exact figure matters less than the gap, show the gap.
- **A quiet base and a strong mark:** white, cream or navy fields where one moving thing (a line, particles, a colour flood) carries the beat.
- **Text lands on the spoken word:** the hand-drawn Indonesian explainer writes each label as it is said. Time every beat from `words.json`.

### Character explainers (opt-in per brand)

AI-generated 3D cartoon characters are the only brand-specific visual: used only when that brand has its own character sheet, made with a tool it has rights to. Never put a person's own character images in a public repository.

| Reel | Account | Views / likes | Len | What it does | Move |
|---|---|---|---|---|---|
| [DW_QadAhhJO](https://www.instagram.com/reel/DW_QadAhhJO/) | edctv.health | 2.4k / 129 | 83 s | Indonesian health explainer: a glossy 3D cartoon apple talks inside a colourful body scene, germs float around it. | One talking object per topic in a full-colour scene |
| [DcEHoMOyjD_](https://www.instagram.com/reel/DcEHoMOyjD_/) | asmr_by_dara | 347 / 0 | 64 s | Vaccine explainer: a 3D cartoon character travels through cells. | A character travelling through a sequence of places, one per beat |
| [DIZIBB2x9bD](https://www.instagram.com/reel/DIZIBB2x9bD/) | mindset.therapy | 6.1M / 141k | 8 s | Particles pour and settle with a soft bounce; the loop keeps the frame alive. | A gentle idle float on a metaphor scene |

Keep busy character scenes readable: one idea per scene, a scrim behind any text.

### Off limits

- Trending licensed songs as the bed (e.g. the colour-flood concept above): use the brand's licensed or synthesised audio only.

## C. Transition set

No background or camera holds longer than about 5 s. Change it with a transition, a different one each time, and log it in `moves.json`. The kit's `Transition` covers five; invent more in the same way (a function of the frame, revealing the next stage over the current one).

| Transition | Kit | What it does | Good for |
|---|---|---|---|
| Circle wipe | `kind="circle"` (`x`, `y` = origin) | The next stage grows out of a point, often the word or prop just spoken | A turn in the story ("but…"); revealing from a prop |
| Colour flood | `kind="flood"` (`color`) | A brand colour sweeps up over the frame, then uncovers the next stage | Resetting the stage between ideas |
| Swipe | `kind="swipe"` | The next stage slides in from the right like a phone screen | UI and step-by-step beats |
| Zoom-through | `kind="zoom"` | The next stage grows from a small rounded card to full frame | Going "into" a phone, card or detail |
| Mask reveal | `kind="mask"` | A soft diagonal wipe | Calm changes, editorial scenes |
| Camera move (in the scene) | `transform` on a wrapper | Push in, pan across a wide layout, rotate a few degrees | Holding one stage longer while still moving the camera |

## D. Font library (every brand)

The same three Google Fonts for every brand's creative motion, loaded by `src/proto/kit.tsx` through `@remotion/google-fonts`:

| Font | Weights | Use | Kit export |
|---|---|---|---|
| Open Sans | 800 | Headlines and big numbers (tight letter-spacing, about -0.04em) | `FONT.display` |
| Rubik | 500–700 | Supporting text, labels, source lines, UI mockups | `FONT.sans` |
| Instrument Serif | 400 italic | The accent on the key word | `FONT.serif` |

Mix them in one block: a big Open Sans word, a Rubik line under it, one Instrument Serif italic word as the accent. Use the brand's own fonts only when its rulebook requires them.

## E. Past work

Breakdowns of videos already made with hookreel or plain Remotion, as references for **moves, timing and code**. Truemission and Gwenchana are the plugin author's own brands. Customer stories, claim amounts, client names, voice recordings, music, logos and character images are left out on purpose. Times are scene seconds unless marked; `w("word")` is when that word is spoken (from `words.json`).

Ranked by how useful they are now: E1 is the current default look (custom motion). E2 and E3 are the older template look. Study them for timing and props, but do not rebuild them as layouts. E4 is a footage overlay.

### E1. Truemission · HKR-261015-3A9P-reel-v2: "health insurance is not enough" (custom motion, 2026-10-15)

8 scenes, about 103 s at 60 fps, hard cuts between scenes (each scene opens with its own reveal over the previous scene's colour). Scene lengths: 8.9 / 12.1 / 11.8 / 14.8 / 14.9 / 17.6 / 13.9 / 8.7 s. Built as `src/proto/` (`kit.tsx`, `HookProto.tsx`, `scenes.tsx`, `words.json`), not from template visuals.

**Look.** Cream `#F6EDE6`, ink `#140C0B`, red `#AE0001`, dark scene `#1A1110`, muted `#5E5450`, coral `#FF7A6B` for red text on dark. Open Sans 800 (tight, -0.04 to -0.06em) for the big words and numbers, Rubik 500 for lines and labels, Instrument Serif italic for the accent word. Every scene: a slow radial glow drifting on `sin/cos(t)`, coarse paper grain (reseeded every 8 frames so it survives Instagram compression), camera push 1 → 1.04 over the scene, content lowered 70 px.

**Kit patterns (reuse these):**

```tsx
// 0 → 1 from `start` over `dur` seconds, brand ease-out
const prog = (t, start, dur, easing = Easing.bezier(0.16, 1, 0.3, 1)) =>
  interpolate(t, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
// Word: focuses in from an 18 px blur, rises 30 px, scales from 1.25 (or `from`) to 1, over 0.45 s
// wordsOf(id)("tapi") → scene time of the spoken word; wordsOf(id)("untuk", 1) → its second occurrence
// Beat: lives from `from` to `to`, then leaves with its own exit
<Beat exit="swipe" t={t} from={w("tagihan") - 0.25} to={w("tapi") - 0.08}>…</Beat>
// Shell: scene reveal + glow + colour floods on beat changes + push + grain + voiceover
<Shell id={id} tone="cream" enter="circle" prev={RED} floods={[w("tagihan") - 0.25, w("tapi") - 0.1]}>
```

- **Five scene entrances** (`reveal(kind, p)` over 0.45 s as a `clipPath`): `circle` from the centre, `down` (`inset` from the top), `left`, `diag` (a growing triangle `polygon`). Each scene uses a different one from the scene before it.
- **Colour floods** inside a scene: on each beat change, the alternate shade of the scene colour grows as a `circle()` clip from a rotating origin (bottom centre, top left, right, bottom left, top right) over 0.55 s, and the camera kicks +2.5% for half a second (`sin(prog·π)`). This keeps long scenes from holding one background.
- **Five beat exits** over 0.3 s, eased in (`bezier(0.5, 0, 0.8, 0.4)`): `blur` (fade + blur + drift up), `zoom` (scale up through the camera), `swipe` (out to the left with a skew), `up`, `drop` (falls and tilts). The moving exits start 0.22 s early so the frame is clear before the next beat's first word.
- **Line**: one centred, wrapping baseline row at a fixed `top`. Mixing `big()`, `txt()` and `ital()` in one row gives the editorial mixed-size block.

| Scene | What moves, and how | Timing | Code pattern |
|---|---|---|---|
| 1 Hook (cream → red) | Three Rubik words focus in one per spoken word. A big number **counts up** in Open Sans 330 px with a red "Rp" raised beside it, and an italic serif unit drops in under it. On "dibayar" the number block lifts 470 px and scales to 0.72. A white receipt card **slides up from below the frame** (y 1980 → 860), rotating 6° → -1.5°. A check circle **draws its tick** on "cashless". Turn: a **red circle wipe opens from the centre** on "Tapi" (`clipPath: circle(wipe·1200px at 540px 960px)`). "Tapi" lands huge (serif 320 px), then steps back to half size as the next line arrives. "pusing" enters letter by letter and keeps **wobbling** (odd and even letters rotate in opposite directions, `sin((t − at)·7)`). Dashed and solid **rings** spin in opposite directions behind it. Drawn **banknotes** fall and turn on "uang". Exit: the whole block blurs out and a giant serif "?" swings in (-25° → 0°, scale 0.5 → 1) inside a circle that draws itself. | 8.95 s. Count-up 0.7 s from the number word; the wipe starts 0.1 s before "tapi" and runs 0.38 s; the question enters 0.12 s after "kenapa" | `count = round(N · prog(t, T.n, 0.7))`; the tick uses `pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p}` |
| 2 Agitation (cream, circle in) | Beat 1: a three-line editorial block (Rubik / serif / Open Sans) leaves with a zoom. Beat 2: a **receipt with a zigzag torn edge** (`clipPath: polygon(...)` teeth) slides up with a tilt. Its rows fade in 0.12 s apart, amounts drawn as grey bars, never numbers. A red **stamp slams in** (scale 2.4 → 1, rotated -12°, eased in) on "ditanggung", then the receipt is thrown off to the left before "tapi". Beat 3: two rows of **needs pills scroll endlessly** in opposite directions (`((t − at)·200) % 1200`). Beat 4: two cards. One ticks, one has an **iOS toggle switching off** as its label turns red. | 12.1 s; 3 floods | stamp: `scale(mix(p, 2.4, 1))` with `p = prog(t, w, 0.28, bezier(0.5,0,0.75,0))` |
| 3 Mechanism (cream, down) | An "ILUSTRASI" outline pill stays at the top for the whole scene. "hitung." drops in large and leaves with `drop`. A monthly income figure zooms through. A **12-month grid** card: months turn red one by one, 0.1 s apart, each with a small scale pulse and a tick sound. A yearly total counts up, then **crumbles**: each character falls and spins with a stagger (`d = crumble − i·0.08; translateY(d²·900) rotate(±d·35°)`). Bills slide down from the top. A **red bar keeps running** along a thin track under "jalan". | 11.8 s; 4 floods | per-character transforms on `` `Rp${count}`.split("") `` |
| 4 Solution (red, diagonal in) | **The gap**: two cream blocks sit apart with a dashed empty slot between them. A white "sakit kritis" piece **drops into the slot** from above (y -300 → 720, 0.7 s), and the dashed outline fades out. An underline wipes in under "ditanggung?" (`scaleX` from the left). A "money in" notification card slides down from the top. Three **outline pills** blur in, one per spoken use, slightly rotated (-2°, 0, 2°), the first one filled white. | 14.8 s; 4 floods | `top: mix(drop, -300, 720)`; underline `transformOrigin: "left"`, `scaleX(p)` |
| 5 Product (cream, left in) | The product name enters **letter by letter** (60 ms apart), then shrinks into a header (scale 1 → 0.42, moved to the top). A **dot grid of 61** fills red from left to right, 22 ms apart, timed to finish on the number. A **ring fills** 0 → 100% between two spoken words, with the percentage counting inside it. An **age ruler** slides under a fixed needle from 25 to 88 while the age counts up. | 14.9 s; 3 floods | ring progress spans the gap between two words: `prog(t, w("a"), w("b") - w("a"))`; ruler `left: 540 - (age - 20)·40` |
| 6 Sharia product (ink, circle in) | The question leaves with a zoom. The name block (Open Sans + coral serif) shrinks into a header. Stage labels swap in one **text slot** (up, drop, blur exits). A **track fills in two steps** (to 25%, then to 100%) with the percentage counting under it. A dark card with a **toggle switching off** and a **shield whose tick draws** and gently pulses. | 17.6 s (too long: see lessons); 4 floods | `fill = prog(a)·0.25 + prog(b)·0.75` |
| 7 Cover (cream, down) | Four illness names **replace each other in one slot** (each blurs up and out as the next is spoken), while matching chips pop into a wrapping row below, plus an outline "dan lainnya" chip. A **90-tick dial** lights up tick by tick while a needle sweeps and the day count climbs. "selagi sehat." in red serif. Ends on a **chat**: a red bubble slides up, then a white bubble with three **typing dots** bobbing on a sine. | 13.9 s; 3 floods | ticks at `a = i/90·2π − π/2`, lit when `i/90 < dial` |
| 8 CTA (red, diagonal in) | "pusing" wobbles again, now damped to rest (`sin(...)·(1 − settle)`), which echoes the hook. A comment field **types the keyword** letter by letter with a blinking caret (`floor(t·3) % 2`). The send button **squashes** (scale 1 → 0.88 → 1). A DM exchange slides in. Both disclaimers sit at the bottom. | 8.7 s; 2 floods | `typed = word.slice(0, floor(prog(...)·word.length))` |

**Sound.** Synthesised only, subtle, no booms: a whoosh at each scene start; a tick on counts; a check on drawn ticks; a stamp on the stamp; a switch on toggles; pops on chips; a ding on bubbles; a riser into fills; a power-down on the crumble; a resolve chord on the final CTA word. Each sound sits on its word: `<Sfx at={w("dm")} name="resolve" volume={0.26} />`.

**Lessons from its self-critique (apply next time).** The middle drags: scenes 4–6 run 15–18 s against a 75 s script, so write to length and change the background or camera every 4–5 s. Hard cuts between all scenes and one exit style everywhere felt flat: the floods and the five exits above were added for that reason. Red on dark is 2.47:1, so use coral or cream there. Grey source lines at 28 px were 3.36:1, so make them darker. The bottom third (y 1250–1500) was often empty. Fine grain inflated the file to 376 MB and smears on Instagram, so keep it coarse. Scenes 2, 3 and 5 repeated "card slides in + tick + red serif word", so log moves and do not repeat them inside one video.

### E2. Truemission · HKR-261013-TYYC-reel: waiting period 12 → 6 months (template look, 2026-10-14)

8 scenes, planned at 73.2 s, recorded at about 90 s, 60 fps. Built from `videos/<id>.json` with template visuals (bars, swap, months, split, list, headline, cta). This is the look the creative mandate now replaces. Keep the props and the timing ideas, not the layout (header + headline + one card per scene).

**Look.** Cream `#F9F0EC`, black text, muted `#6F6360`, track `#E6D9D3`, red `#AE0001` as the only accent, white cards, grey pills with white text. Open Sans 800 + Rubik. Headlines enter word by word, 0.06 s apart, each from a 14 px blur. Accent words in red with a marker bar that draws in 0.1 s after the word lands, over 0.35 s. Camera push +2.5% per scene. Centred captions of at most 4 words, each word fading in as it is spoken.

| Scene | Visual | What moves | Worth reusing |
|---|---|---|---|
| 1 Hook | `bars` | Two horizontal bars, the old period (ratio 1) then the new one (ratio 0.5, red). Each grows on its spoken phrase; a snip sound lands 0.4 s before the second | Comparing two durations as bar lengths, the change in red |
| 2 Basis | `swap` | A stat card (the regulation, "6 bulan") with a stamp sound, then on "Dan di Prudential," it swaps for a headline with two accent words | A mid-scene swap on a spoken phrase, instead of a new scene |
| 3 Until now | `months`, calendar | A 12-cell calendar card, all grey: the whole first year is waiting | The calendar as a time container |
| 4 From December | `months`, calendar + notes | The same calendar, now staged: months 1–6 grey, 7–11 marked 25%, month 12 marked 100%. Each group lights on its phrase, with a rising piano scale as the months light up, then a riser into month 12 and a ding | **Before/after on the same prop across two scenes**: the viewer sees the rule change, not two charts |
| 5 Illustration | `split` | A total ("Ilustrasi", a round example) as one grey block that **splits into 4 parts** (gaps grow, corners round), then only the first part fades to red. A swatch legend: kept vs not paid | Showing a share as a block that splits, then colouring the share |
| 6 Unchanged | `swap` → `list` pills | Pills of terms that stay the same, then a swap to the exemption | Pills as a quiet "nothing changes here" list |
| 7 Products | `headline` + chips | A grid of product chips with one marked as excluded, ticks on each chip | Many names on one card, one excluded |
| 8 CTA | `cta` | A card with the save-and-send button, a riser into it, then a resolve chord; disclaimers in the footer | |

Sound for this video was a "dramatic" palette with booms muted after review (the author found low hits disturbing). Whooshes start from scene 2; the voice opens the video.

### E3. Gwenchana · ChatGPT Ads reels: teaser + phases 1–3 (template look, 2026-10-12)

Four English reels for a free guide, 30 fps, plain Remotion (`src/reels/*.tsx`, one React component per scene, cues found by phrase in the voiceover). An older generation: one header, one headline and one card stack per scene.

**Look.** Obsidian `#1E1E1E` / `#2F2F2F` / `#3D3D3D`, white, grey `#9A9A9A`, citron `#ECCE22` as a rationed accent, paper `#F4F4F2` for light UI panels. Montserrat 400–800 for everything, JetBrains Mono for event names and code. Every element: fade plus a 28 px rise over 0.36 s (`Appear`), no bounce. A citron outline and tint **switch on** around the thing that matters (`Highlight`, with a click sound).

```tsx
// cue frame from a phrase in the voiceover (character offset → word time from the transcript)
const [card, plans] = useCues(["a sponsored card", "Free and Go"]);
<Appear at={card} dy={16}><Highlight at={card + 6}>…</Highlight></Appear>
```

| Reel · scene | What moves | Worth reusing |
|---|---|---|
| Teaser 1 | A ranking of 7 websites appears 3 frames apart. The non-compared rows **dim to 30%**, and the hero row gets a riser, then an impact, then a highlight. The ranking fades out and a big percentage takes over, with a **100-dot grid filling** 1.6 dots per frame to 38 | Dim everything except the comparison; a dot grid for "1 in 3" |
| Teaser 2 | A recreated chat UI (never a screenshot): a user bubble, grey answer lines, then a "Sponsored" card **pops in under the answer** and gets highlighted | Recreating a UI with grey bars for text |
| Teaser 4 | A vertical timeline; each point lights up on its date and the line draws down to it | |
| Teaser 6 | A **2×2 journey**: ad → page → button → chat. The WhatsApp button **presses** (`scale(1 − 0.06·sin(π·p))` plus a citron outline), and the prefilled message gets highlighted | A four-step funnel as numbered mini-screens |
| Teaser 7 | Tool pills tick in. Nodes connect with **wires that grow downward**, and one node splits into two | Wires growing between nodes |
| Phase 1 | "0 campaigns" highlighted in a UI table. **Tap dots** fill on the left while the conversions tile stays at a big "0". A track shows a **red striped gap** (`repeating-linear-gradient(135deg, …)`) labelled "not counted, ever", then white "counted" | Striped fill for lost or uncounted time |
| Phase 2 | Suspect pills appear one by one, then **get struck through** (a coral line grows across them, opacity drops to 45%). Four link formats are checked one by one against a verdict. A checkbox and a toggle switch on | A strike-through to eliminate wrong answers |
| Phase 3 | One click shows as **two event rows**, the second tagged "duplicate" in red, then a big citron "×2". Compare bars (reported vs real). Wait tiles. Tag rows, with one paused | Duplicate rows, then the multiplier |

Each reel ends on the same end card (headline, guide, comment keyword, "next" footer).

### E4. Personal · race-day recap (footage overlay, 2026-10)

A 27 s, 720×1280, 30 fps edit of phone footage. It is the one reference here for **graphics over live video**:

- Three trims of one clip in a `TransitionSeries` with 10-frame `fade()` crossfades. Audio fades in and out at each cut (`volume={(f) => interpolate(...)}`).
- A slow **perceptual-scale push** (1 → 1.07, `output: "perceptual-scale"`) while the key moment is held up to the camera.
- Intro: a top gradient shade, a pink uppercase kicker, then a two-line Barlow Condensed 800 title rising 40 px. Both fade out before the first cut.
- A **badge stamps in** (scale 1.8 → 1 with a damped spring, rotated -3°, pink glow).
- A **frosted stats card** (`backdropFilter: blur(18px)`, translucent dark, 1 px light border) slides up on a spring. Over the same 1.8 s, a route line **draws itself** (`strokeDashoffset` 1 → 0 with a glow) and the stats count up (`toFixed(2)`, m:ss formatting). The card **steps aside** (drops 500 px) while the footage needs the frame, then returns. This uses one `interpolate` with a separate easing per segment.

Fonts: Barlow Condensed 600/800 for numbers and titles, Inter 500/600 for labels. Accent pink `#FF2D87`.
