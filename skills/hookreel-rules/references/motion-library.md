# Motion reference library

**`/hookreel:build` reads this whole file before designing any scene**, together with the user's own reference reels for the video. It is the shared library for every brand: the same moves, rules and fonts apply to all brands alike (only a 3D character is brand-specific, and it is opt-in).

Everything here is **ideas on composition and motion only**: never copy a creator's artwork, footage, music or wording, and never name or tag them in a client video. Recreate every move in code (the studio kit `HR` in `kit/kit.js` and new HTML and GSAP per scene), with the brand's own words and colours.

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
| Paper-texture editorial type | Paper grain (`.hr-grain` + `HR.grain`) on a warm base, mixed sizes and weights in one centred block, an italic serif for the accent word. |
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

No background or camera holds longer than about 5 s. Change it with a transition, a different one each time, and log it in `moves.json`. The kit's `HR.transition` covers six; invent more in the same way (tweens on the scene's paused timeline, or `HR.drive` for a pure function of t, revealing the next stage over the current one).

| Transition | Kit | What it does | Good for |
|---|---|---|---|
| Circle wipe | `"circle"` (`o.x`, `o.y` = origin) | The next stage grows out of a point, often the word or prop just spoken | A turn in the story ("but…"); revealing from a prop |
| Colour flood | `"flood"` (`o.cover` = a full-bleed colour layer) | A brand colour sweeps up over the frame, then uncovers the next stage | Resetting the stage between ideas |
| Swipe | `"swipe"` | The next stage slides in from the right like a phone screen | UI and step-by-step beats |
| Zoom-through | `"zoom"` | The next stage grows from a small rounded card to full frame | Going "into" a phone, card or detail |
| Mask reveal | `"mask"` | A soft diagonal wipe | Calm changes, editorial scenes |
| Object wipe | `"object"` (`o.shape` = the object, a giant prop or brand-colour slab) | An object passes close to the lens and the next stage is already behind it | Any change a prop of this beat can carry |
| Shot change (in the scene) | `HR.camera` with `shots` (see F) | Close-up on the element that speaks, back to wide, close on the next | Holding one stage longer while the camera still tells the story |

**Transitions carried by objects** (no kit helper; build them per beat, as functions of timeline time like the rest; from the Motion Format skill, see F):
- The next beat's prop is the wipe: a phone, door, envelope or card rises from the edge and covers the frame; the camera is already in the new stage.
- Out of the screen: the item picked in a UI lifts toward the camera, the screen folds away, and the item is a real object in the next stage.
- Match cut on shape: a coloured object on dark cuts to the same shape as an outline on light, then gets its colour back.
- Pull back to reveal: the subject shrinks to the centre while the next place builds around it.
- A hand takes it: a hand enters and picks the object up; the gesture closes one beat and opens the next.
- Colour field in two steps: a secondary colour sweeps, then the main one, and it stays as the next background (not a decorative bar passing by).
- Into a symbol: a symbol grows fast into the lens with blur; its colour becomes the next background.
- Flip to change: an icon turns edge-on; on its back the glyph and the line have changed.
- A panel blooms into the next step: a button is tapped and its panel grows to fill the frame with the next screen.
- A shape becomes a window: a logo shape or letter grows into a window onto the next stage.
- Dim, then change: the line greys out before it leaves; the next line lands in the same place.
- Delete and type: the old line deletes letter by letter from the left; the new one is typed in its place.

**Transition craft.** Never slide the whole stage until its edge shows (it reads as "next page"; `HR.camera` clamps the world for this reason). A sudden spin or zoom with blur on every cut is an editor preset, not motion design. One kind of transition on every cut is a template, however expensive. Most changes are carried by elements that overlap in time (one leaves while the next arrives) or by an object wipe; a fast zoom-through only when it is motivated (diving into a phone screen).

## D. Font library (every brand)

The same three fonts for every brand's creative motion, bundled as woff2 in the studio's `kit/fonts/` and declared in `kit/kit.css`:

| Font | Weights | Use | Kit CSS |
|---|---|---|---|
| Open Sans | 800 | Headlines and big numbers (tight letter-spacing, about -0.04em) | `var(--display)`, `.hr-display` |
| Rubik | 500–700 | Supporting text, labels, source lines, UI mockups | `var(--sans)`, `.hr-sans` |
| Instrument Serif | 400 italic | The accent on the key word | `var(--serif)`, `.hr-serif` |

Mix them in one block: a big Open Sans word, a Rubik line under it, one Instrument Serif italic word as the accent. Use the brand's own fonts only when its rulebook requires them.

## E. Past work

Breakdowns of videos already made with hookreel or plain Remotion, as references for **moves, timing and code**. Their code is Remotion (React) from before 0.18.0; read it as formulas and write it in HyperFrames: `prog(t, a, d)` is a `tl.fromTo(…, { duration: d, ease: HR.EASE }, a)` tween, any other pure function of t is `HR.drive(tl, a, b, fn)`, `w("word")` is `HR.at(scene, "word")`, `<Sfx at={…}>` is an `<audio class="clip" data-start=…>` in the scene, `TransitionSeries` and `Sequence` are scene hosts and `data-start`. Truemission and Gwenchana are the plugin author's own brands. Customer stories, claim amounts, client names, voice recordings, music, logos and character images are left out on purpose. Times are scene seconds unless marked; `w("word")` is when that word is spoken (from `words.json`).

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

## F. Camera: shot sizes

Sections F–H and the object transitions in C are adapted from the **Motion Format** skill v1.0.0 (MIT), itself built on [Bang Motion](https://github.com/bangtutorial/bang-motion) by Bang Tutorial (MIT), rewritten for vertical reels (first for Remotion, now HyperFrames).

"Zoom in and out" in motion design means **changing the shot size**, not a camera breath: a push of a few percent is nearly invisible and the video still reads as still.

| Shot | Kit | Use |
|---|---|---|
| Wide | `HR.SHOT.wide` (1) | The whole composition: several elements, or a line that needs the full width |
| Medium | `HR.SHOT.medium` (about 1.45) or `HR.frameOn(box, 0.45)` | The element that speaks plus a little context, about a third to half of the frame |
| Close | `HR.SHOT.close` (about 2.1) or `HR.frameOn(box, 0.7)` | One element or its detail fills the frame: emphasis, the moment of action, a small detail that must be read |

- Aim at the element that is speaking now: the line that just landed, the prop that arrived, the button being tapped, the detail the voice names. The camera meets it; it does not chase it.
- Change the shot on the beat: close on A → back to wide when the composition needs the whole frame → close on B. Never three beats in a row at the same size (`npm run fresh` fails on it). Log each beat's size as `shot` in `moves.json`.
- Two tempos: the shot change itself (0.6–0.9 s, ease in-out) and a slow push while holding.
- A scene may be born in a close-up (`cut: true`) and pull back; the video may open in one.
- Text lands after the camera arrives, never mid-move. Do not swing close and wide faster than a viewer can read.
- World inside the `HR.camera` wrapper, screen layer outside: labels, source lines, captions and the CTA sit outside the rig so they never scale or get cut. Raster images inside the world need the resolution for the close-up (at least scale × displayed size).
- **UI demos:** move close to the area about to be tapped (scale 1.4–2.2, 0.6–0.9 s ease in-out) so the tap reads, then pull back or pan to the result. Not on every tap.

## G. Style brief menus (one pick each per video, in `style.json`)

Every video's style brief names six lines (`/hookreel:build` Step 3): background motion (G1), background surface with 2+ layers (G2), object render family (G3), signature move, opener (G4) and closing (G5). `npm run fresh` fails when 3 of them match one of the brand's last 3 videos. The fonts and the brand palette stay fixed; these lines are what make two videos of one brand look different. The **signature move** is one kind of motion repeated as this video's identity (a fold, a stamp, a line that draws, a colour block hitting the edge); it moves objects and text, not the background.

### G1. Background motion (never a still background; never "things streaking sideways" by default)

| # | Background motion | Feel |
|---|---|---|
| 1 | Textured base + a slow shift of tint, light or grain | calm, premium |
| 2 | A large 2–3 colour gradient drifting or turning (8–15 s per cycle) | soft, modern |
| 3 | 2–4 blurred colour blobs floating (±60 px, 4–6 s) | friendly, light |
| 4 | Living paper grain or texture (offset from t, never random) | organic, print |
| 5 | One light sweep per segment (not continuous) | premium |
| 6 | A large shape from the logo or theme turning slowly (20–40 s per turn), two layers of parallax | brand, strong |
| 7 | Particles rising slowly (dust, bubbles), never horizontal; at most .35 opacity behind text | warm, alive |
| 8 | A grid or pattern breathing (scale or opacity 1.00 ↔ 1.04, 6–10 s) | technical, precise |
| 9 | A giant ghost word drifting behind (low contrast) | editorial |
| 10 | A photo or illustration with slow zoom + two-layer parallax, darkened on the text side | narrative |
| 11 | Horizontal flow (streaks, lanes): only when the theme is speed or flow | fast, data |
| 12 | Colour fields from the palette snapping in on the beat (0.15–0.3 s), each filled with moving shapes | pop, energetic |

### G2. Background surface (at least two layers; never one flat colour)

- Horizon glow: a dark gradient with a radial glow of the accent rising from the bottom.
- Diagonal duotone: accent darkened → base → light accent at about 160°.
- Light mesh: a pale base with 3–4 large soft blobs in the palette.
- Spotlight + tint: a soft radial pool of accent on the base.
- Layered sky: a light vertical gradient with 2–3 thin bands at .2–.4 opacity.
- Texture + tint: paper or grain (`Grain`) over any of the above; multiply on light, overlay on dark.
- Grainy gradient: saturated 2–3 colour gradients inside the shapes and the background, fine grain over everything (it also dithers away banding; see `/hookreel:qa` for the render setting).

Under the text keep a calm pocket: dark (luminance ≤ 25 %) or light (≥ 80 %), never a busy middle. Outside the pocket the background should be rich.

### G3. Object render family (one per video, or two when the switch is the moment)

Flat solid · flat with scattered palette dots · soft 3D clay (matte pastel, rounded, soft shadow) · glossy 3D (rim light, reflections) · glass or glowing orb · isometric (30°, no perspective) · realistic metal or marble (best as a licensed or generated image, animated as a layer) · neon line on dark · flat character illustration. Mixing families without a reason looks like stock assets.

Isometric: objects compared by height (columns, stacks, bars) stand on one screen baseline, plan points with the same a + b; otherwise the one in front sits lower and reads as shorter. A box that has not grown yet draws nothing, or its flat top face shows as a stray mark.

### G4. First 3 seconds (the hook beat's opening; two videos in a row never open the same way)

- In media res: the object is already moving on frame 1.
- Sound first: a hit or effect, the picture lands one beat later.
- A giant word cut off by the frame edge; the camera pulls back to the whole line.
- A line draws itself and turns out to be the product, the prop or the logo.
- A texture in extreme close-up that turns out to be part of the object.
- The question typed on something in the world (a receipt, a note), not a floating input box.
- Dark → one light → the world.
- The problem already happening: the frame opens in the middle of the mess.
- A grey world with one subject in the brand colour.
- The unexpected actor: who really uses it is on screen in the first second.
- The result first: the outcome, very close and blurred, pulls back to make room for the line.
- Old tools scattered: windows and papers tilted in 3D; the answer is born behind the pile.
- A kinetic title assembling: letters fly in from different directions and lock.

Text has eight ways in: up, down, left, right, from depth, mask reveal, word by word, typed. Pick from the meaning; two beats in a row never use the same way in.

### G5. Closing (the CTA beat)

- The last object becomes the logo (a morph, or a shape that closes).
- The camera pulls back: the world was the logo shape all along.
- The key word of the last line is replaced by the logo.
- A diegetic CTA: a button in the UI or on an object is pressed, not CTA text floating.
- A seamless loop: the last frame joins the first.
- A hard stop: everything stops together, one line, cut.
- Arrival: the hero object has arrived and a hand takes it; the brand only on its label.
- Callback to the opener: the logo takes the opener's shape and leaves where it came in.
- Handle → name: the handle or site is typed, deleted from the left, the brand name typed in its place.
- Into a portal: the camera enters a shape; the logo waits behind the dark.

Logo and CTA stacked in the centre only when the brief asks for an explicit CTA card. The required disclaimers stay on the end card either way.

### G6. Several points without three tiles

When the voice lists points (features, steps, reasons), pick one way per video; two videos in a row never use the same one:
- One point demonstrated, the rest as 0.4 s flashes at the end.
- One line with a word that changes: "Bayar ___" → premi / klaim / denda.
- One object transforms from point A into point B.
- Cards shuffled or thrown one by one from a hand or a pile.
- Orbit: icons circle the subject and drop into it.
- A mockup in use: scrolled or tapped, each point lights up in place.
- A diegetic checklist ticked by actions in the world.
- A before/after divider that slides per point.
- One container whose contents change fast, landing on the brand's.
- A claim → how → result cycle per point, repeated, not lined up.
- A grid of icon tiles (the count follows the points, not always three): one option, never the default.

## H. Not a slide: checks before showing anything

A frame that is technically correct still fails when it reads as a presentation.

- **One shot, one statement.** Up to 6 words per line on screen; a longer claim is split over two beats or shown as an object, an icon or a number. At most two text tiers per beat (one line + one world label); a kicker + title + body is a slide. Log the on-screen text per beat as `text` in `moves.json`; `npm run retention` fails on 3 tiers or 7+ words. Source lines, illustration labels, disclaimers and the text inside a UI mockup do not count (a mockup is read as a picture).
- **Attention order:** the line first, the hero object next, details last; never a badge before its line.
- **Sentence case.** All caps for one emphasis beat at most. Short phrases (4 words or fewer) without a full stop; `?` for a real question. The punctuation style is decided once in the style brief.
- **Template skeleton.** The order hook → point → point → promise → logo → CTA, three feature tiles side by side, a search box being typed, a first line zooming in then leaving left, logo and CTA stacked in the centre: two or more of these in one video without the story asking for them is a template, whatever the colours. Pick the opener, the closing and the way of presenting points from G4–G6 instead.
- **Every named thing is on screen.** Each product, brand, kind of person, object or number the voice names in a beat appears in that beat (as a prop, an icon, a logo, or the number with its source), unless a ban or a missing permission rules it out; then `06-motion` says so for that beat.
- **Enter slow, leave fast.** Entrances 0.7–1.3 s with a firm ease-out, exits 0.35–0.55 s with an ease-in (`HR.life(tl, sel, at, until)` in the kit). Symmetric in and out reads mechanical.
- **One special moment.** The most expensive effect (a 3D move, the logo build, a big object wipe) is used once, on the beat marked `"special": true` in `moves.json`. Used everywhere, it stops being special.
- **When in doubt,** darken the text pocket and make the type bigger.

**Taste check, on the sweep** (`npm run sweep`):
1. Could this frame be a corporate slide without changes? Then rebuild it.
2. Does the eye know where to look within 0.2 s? If not, remove elements.
3. With all text hidden, is the background still interesting but not noisy? Both must be yes.
4. At each change, does something move because of the camera, not only because elements animate themselves?

## I. AI Code-Motion Reference Library (Opus 5.5 & Guanmo AI Motion)

Studied from `yihui-dev/awesome-opus5-5-videos` (700+ prompts, 418 remakes on Skillry) and `guanmo-ai/awesome-ai-motion` (1,400+ curated code animations across 7 domains). Read whenever designing scenes, writing prompts, or building HyperFrames scenes.

### I1. Core Philosophy: Zero Cuts, Continuous Flow & Beat Math
- **Animation as $f(t)$:** Every visual attribute is a closed-form pure function of time. No mutable component state between frames, no drift.
- **Continuous One-Take (No Dissolves):** No crossfades, no blur-ins, no hard cuts. Every scene morphs out of the previous one:
  - Text rises out of horizontal mask baselines (`clip-path`).
  - Icons pop from zero scale on an under-damped spring.
  - A primary shape floods the entire canvas and contracts into the next stage.
- **Beat Grid Synchronization:** Calibrate the timeline to musical BPM (e.g., 120 BPM = 0.5s per beat). Major state transitions, camera cuts, and audio peaks land strictly on the downbeat.
- **Direct Cursor Manipulation:** A simulated pointer drives changes through visible intent: springy taps (squashing target by 6–10%), drags with rubber-band resistance, and long-press expansions.

### I2. The 6-Part Prompt Architecture for AI Motion
Use this structure when asking Claude / LLMs to generate motion code:
1. `<inputs>`: Required brand assets, audio track with BPM & drop timing, reference images.
2. `<direction>`: Key aesthetic (e.g., Apple launch film, dark-mode technical HUD), strict bans (no crossfades, no template layouts, no dead air > 1s), typography pairing, and camera scale behavior.
3. `<structure>`: Detailed beat sheet mapping each downbeat to a physical state transition.
4. `<build>`: Technical constraints (single-file HTML/Remotion, closed-form springs, SVG displacement shaders for liquid glass, peak-aligned SFX at -14 LUFS).
5. `<gotchas>`: Critical browser/compositor quirks (avoid `will-change` on scaled containers to prevent text blur; container text swapping needs staggered masks; clone scenes for displacement).
6. `<start>`: Gatekeeper: demand beat map + 4 still preview moments before generating full implementation code.

### I3. 10 Code-Motion Signature Moves to Draw From
| Move | Origin | Mechanism & Timing | Best For |
|---|---|---|---|
| **Single Shape UI Odyssey** | @twoclipping | One continuous container morphs size, radius, fill across 8–12 UI states (Button → Loader → Player → Slider → Tabs → Chart → Toast). | Product showcase, UI speedrun |
| **Liquid Glass & Refractive Lens** | @twoclipping | SVG `feDisplacementMap` + chromatic edge shift over cloned backdrop; stretches into toolbars and magnifies content. | Premium tech, luxury launch |
| **Mechanical Iris Shutter** | @twoclipping | 6–8 aperture blades sweep open and shut along trigonometric arcs over photos/stamps. | Photo reveals, camera features |
| **Paper Map Origami Unfold** | @melvynx | A single tile unfolds like an origami map along seams (center, plus, corners) into an isometric bento grid. | Multi-feature reveals, catalogs |
| **Exploded Anatomy / CAD Breakdown** | @wheresryan22 | Orthographic line drawings disassemble into floating dimensional layers with caliper measurements. | Explaining complex mechanisms, engines, architecture |
| **Direct Manipulation Rubber-Band** | @stephanlivera | Cursor drags a slider or toggle past its boundary; container stretches with rubber-banding tension before springing back. | Interactive feels, mobile app demos |
| **Particle Orbit & Digit Collapse** | @ajith_io / @galihwar | Cloud of ambient particles rotates in 3D space, accelerates, and collapses into crisp numerical digits on the drop. | Big statistics, countdowns, milestones |
| **Highlighter Baseline Wipe** | @deedydas | Key phrase rises from a baseline mask; 0.2s later, a colorful highlighter stroke paints behind the italic serif accent. | Educational explainers, quotes |
| **Sketch to 3D Extrusion** | @tomkrcha | Flat line-art sketch receives shadow, extrudes into an orthographic 3D mesh, and rotates on the beat. | Vision, transformation, design tools |
| **Color Flood Canvas Wipe** | @twoclipping | An active circle grows exponentially (scale 0.1 → 3.5 in 0.3s) flooding the frame, then contracts into a new container. | Major chapter transition, climax |

### I4. 7 Use Case Framework (Guanmo AI Motion)
- **Product Commercial (产品宣传):** 15–30s high-velocity demos, continuous morphs, hardware exploded views, tangible physical UI.
- **Knowledge Explainer (知识讲解):** Anatomy schematics, step-by-step logic maps, algorithm visualizers, editorial typography.
- **Micro-interactions (短动效):** Loopable single-shape UI journeys, responsive buttons, spring toggles, haptic visual feedback.
- **Character Animation (角色动画):** Stylized avatars, pixel-art loops, 3D character staging with reactive gestures.
- **3D Interactive (3D 交互):** Three.js spatial planes, procedural landscapes, physics-driven particle flows.
- **Narrative Short Film (叙事短片):** Multi-shot cinematic continuity, emotional pacing, metaphorical scene evolution.
- **Music & Audio Video (音乐视频):** Frequency-reactive typography, beat-locked motion bursts, lyric pacing.
