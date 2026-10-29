// The data contract between /hookreel:build and this template.
// One brand.json per project, one videos/<id>.json per video.

// A cue is a phrase copied exactly from the scene's `vo`. The element appears when the
// narration reaches that phrase (word-accurate once the voiceover is recorded).
export type Cue = string;

// Text fields accept `backticks` for inline code, e.g. "GA4 gets `whatsapp_click`".
export type Rich = string;

export type Brand = {
  name: string;
  logo?: string | null; // file in public/, e.g. "brand/logo.png"; null shows the brand name as text
  logoTreatment?: "none" | "white" | "black"; // recolour a one-colour logo to sit on the background
  colors: {
    bg: string; // page background (only background colour)
    text: string; // main text on bg
    muted: string; // secondary text on bg
    surface: string; // tiles and cards on bg
    track: string; // inactive fills: dots, bar tracks, connectors
    accent: string; // the one highlight colour
    onAccent: string; // text on accent
    panel: string; // light UI mockup panels
    panelText: string;
    panelMuted: string;
    panelSoft: string; // input fields inside panels
    panelLine: string;
    error: string;
    errorText: string; // error colour readable on bg
  };
  fonts: { sans: string; mono: string; display?: string }; // Google Fonts family names; display (optional) for headlines and big numbers, defaults to sans
  labels?: { source?: string }; // on-screen words in the voiceover language, e.g. { "source": "Sumber" }; default "Source"
  radius?: { card?: number; pill?: number };
  style?: "clean" | "playful"; // clean (default) = fade + rise, nothing loops; playful = pop entrances with overshoot, floating elements, made for character visuals (AI 3D cartoon, mascots)
  motion?: {
    entranceMs?: number; // entrance length (the fade; a pop's spring settles in TIME.pop.settle)
    entrance?: "rise" | "focus" | "pop"; // focus = fade in from a blur; pop = spring in with a small overshoot (bounce); default from style
    idle?: "still" | "float"; // float = elements bob gently after they land (loops); default from style
    text?: "block" | "kinetic"; // kinetic = headlines enter word by word; default block
    camera?: "still" | "push"; // push = the visual drifts slowly closer over each scene; default still
  };
  headlineCase?: "sentence" | "as-written";
  captions?: { align?: "left" | "center"; reveal?: "line" | "word" }; // center = centred at the bottom; word = each word appears as it is spoken
};

export type MusicSpec = {
  src: string; // file in public/, loudness-normalised (see /hookreel:voice)
  startAt?: number; // seconds into the track
  underVoice?: number; // gain while speaking
  inPauses?: number; // gain between phrases
  credit?: string; // shown in the post caption, not in the video
};

export type VideoSpec = {
  id: string; // kebab-case, also the folder for its voiceover: public/vo/<id>/
  title: string;
  eyebrow: string; // small label top-left on every scene
  language?: string; // voiceover language, e.g. "en" or "id" (picks the Whisper model), default "en"
  width?: number; // default 1080
  height?: number; // default 1920
  captions?: boolean; // burned-in captions from the vo text, default true
  audio?: {
    music?: MusicSpec | null;
    sfx?: "off" | "subtle" | "medium" | "dramatic"; // default "medium"
    mute?: string[]; // sound effects silenced in every scene, e.g. ["impact"]
  };
  cta?: CtaSpec;
  cover?: CoverSpec[]; // reel cover variants, rendered as stills by `npm run cover -- <id>` (see /hookreel:publish)
  scenes: SceneSpec[];
};

// A still 1080×1920 cover. Instagram's profile grid shows only the centre 1080×1440 (3:4), so the
// template keeps all of it inside y 420–1500.
export type CoverSpec = {
  kicker?: string; // small accent label above the headline
  headline: string; // *word* marks accent words; at most about 10 words
  big?: string; // optional big number line, e.g. "12 → 6 bulan"
  sub?: string; // one muted line under the headline
  source?: string; // source label when the cover shows a number
};

export type CtaSpec = {
  kicker?: string; // e.g. "Free guide"
  title: string; // what they get
  chips?: string[]; // e.g. ["45–60 min", "Tool cost: $0"]
  button: string; // e.g. "Comment “ChatGPT Ads”"
  sub?: string; // e.g. "We'll send you the free guide."
};

export type SceneSpec = {
  id: string; // "01-hook", also the voiceover file name
  vo: string; // exactly what is said; captions show this text
  say?: string; // for npm run tts only: the vo with {shown|spoken} spans, e.g. "{Rp900 juta|sembilan ratus juta rupiah}"
  visual: Visual;
  note?: { label?: string; text: Rich; cue?: Cue }; // "Watch out" style card under the visual
  sfx?: { name: string; cue?: Cue; offset?: number; volume?: number }[]; // extra sounds on cues; offset in seconds (negative = before the cue, e.g. a riser)
  mute?: boolean | string[]; // true = no sound effects in this scene; a list = only those sounds are silenced, e.g. ["impact", "drop"] (voiceover and music still play)
};

export type Visual =
  | HeadlineVisual
  | StatVisual
  | RankingVisual
  | TilesVisual
  | TimelineVisual
  | BarsVisual
  | MonthsVisual
  | SplitVisual
  | FlowVisual
  | ChatVisual
  | JourneyVisual
  | UiVisual
  | ListVisual
  | LogoVisual
  | CharacterVisual
  | SwapVisual
  | CtaVisual;

export type HeadlineVisual = {
  type: "headline";
  eyebrow?: string;
  text: Rich;
  size?: number;
  cue?: Cue;
  sub?: { text: Rich; cue?: Cue };
  chips?: { items: string[]; cue?: Cue };
};

export type StatVisual = {
  type: "stat";
  headline?: Rich;
  value: string; // "37.9%", "900M", "$1B", "Sep 24"
  label: Rich;
  source?: string;
  cue?: Cue;
  size?: number;
  dots?: { lit: number; cue?: Cue }; // 10×10 grid, `lit` of 100 light up
  chips?: { items: string[]; cue?: Cue; accent?: string };
};

export type RankingVisual = {
  type: "ranking";
  headline?: Rich;
  items: string[]; // in rank order
  highlight: string; // the item to light up
  keep?: string[]; // items that stay bright when the others dim
  source?: string;
  highlightCue?: Cue;
  dimCue?: Cue;
};

export type TilesVisual = {
  type: "tiles";
  headline?: Rich;
  tiles: { value: string; label: string; cue?: Cue; hot?: boolean }[];
  source?: string;
  text?: { text: Rich; cue?: Cue };
  chips?: { items: string[]; cue?: Cue };
};

export type TimelineVisual = {
  type: "timeline";
  headline?: Rich;
  items: { date: string; text: Rich; cue?: Cue; hot?: boolean }[];
  chip?: { text: string; cue?: Cue };
};

export type BarsVisual = {
  type: "bars";
  headline?: Rich;
  items: { label: string; value: string; ratio: number; cue?: Cue; hot?: boolean }[]; // ratio 0–1, relative height
  text?: { text: Rich; cue?: Cue };
};

// A grid of months (waiting periods, staged benefits). Each group lights its months one by one
// from its cue; `fill` is how much of each cell turns accent (0 = track colour, 1 = solid accent).
export type MonthsVisual = {
  type: "months";
  headline?: Rich;
  columns?: number; // cells per row, default 6
  style?: "grid" | "calendar"; // calendar = square cells on a slightly tilted card, with a check on every paid month
  title?: string; // calendar card title, e.g. "Tahun pertama polis"
  notes?: boolean; // each cell plays a rising note as it lights up
  groups: { from: number; to: number; label: string; cell?: string; fill: number; cue?: Cue }[]; // months are 1-based and inclusive; label goes in the legend, cell (short) inside each cell
  source?: string;
  text?: { text: Rich; cue?: Cue };
};

// One amount as a wide bar that splits into equal blocks; the first `keep` blocks stay accent,
// the rest fade to the track colour ("Rp100 juta -> 4 x Rp25 juta, only one is paid").
export type SplitVisual = {
  type: "split";
  headline?: Rich;
  total: { value: string; label?: string; cue?: Cue }; // the whole amount above the bar
  parts: number; // equal blocks
  part: string; // text inside each block, e.g. "Rp25 jt"
  keep: number; // blocks that stay accent, counted from the left
  keepLabel: string; // legend for the kept blocks
  restLabel: string; // legend for the faded blocks
  start?: "accent" | "track"; // track = the bar starts grey ("nothing paid") and only the kept blocks turn accent; default accent
  cue?: Cue; // when the bar splits
  fadeCue?: Cue; // when the rest fades (or, with start "track", when the kept blocks light up)
  text?: { text: Rich; cue?: Cue };
};

export type FlowVisual = {
  type: "flow";
  eyebrow?: string;
  headline?: Rich;
  tools?: { items: string[]; cue?: Cue }; // pills above the diagram
  steps: { label?: string; text: Rich; cue?: Cue; accent?: boolean }[];
  breakAfter?: { text: string; cue?: Cue }; // dashed red link after the last step
  split?: { cue?: Cue; nodes: { label: string; value: Rich }[] }; // last step fans out to 2 nodes
  results?: { label: string; value: Rich; big?: boolean; cue?: Cue }[]; // white result cards
  chip?: { text: string; cue?: Cue };
};

export type ChatVisual = {
  type: "chat";
  headline?: Rich;
  app?: string; // window label, e.g. "ChatGPT"
  question: string;
  sponsored?: { label?: string; title: string; button: string; cue?: Cue };
  chip?: { text: string; cue?: Cue };
};

export type JourneyVisual = {
  type: "journey";
  headline?: Rich;
  steps: {
    title: string;
    kind: "ad" | "page" | "tap" | "chat" | "text";
    text?: string; // ad title, page button, prefilled message, or free text
    cue?: Cue;
  }[]; // 2–4 steps, laid out 2 per row
};

export type UiRow =
  | { kind: "field"; label: string; value: Rich; typed?: boolean; mono?: boolean; cue?: Cue; highlightCue?: Cue }
  | { kind: "check"; label: string; cue?: Cue }
  | { kind: "toggle"; label: string; cue?: Cue }
  | { kind: "row"; text: Rich; right?: string; mono?: boolean; cue?: Cue; highlightCue?: Cue; status?: { from: string; to: string; cue: Cue } }
  | { kind: "code"; lines: string[]; cue?: Cue }
  | { kind: "path"; items: string[]; cue?: Cue }; // breadcrumb chips: A → B → C

export type UiVisual = {
  type: "ui";
  step?: string; // eyebrow, e.g. "Step 1.1"
  headline?: Rich;
  window: string; // mockup title bar, e.g. "Tag Manager · Triggers"
  cue?: Cue;
  rows: UiRow[];
  button?: string;
  after?: { text: Rich; cue?: Cue }; // line under the panel
};

export type ListVisual = {
  type: "list";
  eyebrow?: string;
  headline?: Rich;
  style: "dash" | "check" | "strike" | "pills"; // pills alternate accent-filled and outlined
  items: { text: Rich; cue?: Cue }[];
  strikeCue?: Cue; // for "strike": when the items get crossed out
  answer?: { text: string; cue?: Cue }; // for "strike": the real cause, in accent
};

export type LogoVisual = {
  type: "logo";
  headline: Rich;
  cue?: Cue;
  chip?: string;
};

// An illustrated or AI-generated character (3D cartoon, mascot) or scene from public/. Card: the
// character stands in the content area and floats; full: the image fills the whole frame behind
// the header and captions, with a slow push.
export type CharacterVisual = {
  type: "character";
  src: string; // file in public/, e.g. "characters/apel-senang.png" (transparent PNG/WebP for card), or a muted looping .mp4/.webm
  layout?: "card" | "full"; // default card
  headline?: Rich;
  cue?: Cue; // when the character enters
  bubble?: { text: Rich; cue?: Cue }; // speech bubble from the character
  chips?: { items: string[]; cue?: Cue };
  credit?: string; // tool or artist that made it (for the post caption and the AI label); not shown on screen
};

export type SwapVisual = {
  type: "swap"; // first visual, then crossfade to the second at `at`
  first: Visual;
  second: Visual;
  at: Cue;
};

export type CtaVisual = {
  type: "cta"; // closing card built from video.cta
  headline: Rich;
  cue?: Cue; // when the CTA card appears
  sound?: string; // replaces the ding when the card lands, e.g. "resolve"
  footer?: string; // e.g. "Next: Phase 1 · Ads Manager"
  footerCue?: Cue;
};
