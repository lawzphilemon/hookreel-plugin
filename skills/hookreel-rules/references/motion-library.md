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
