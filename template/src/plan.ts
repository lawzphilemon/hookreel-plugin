// The single source of truth for what happens when. Each planner turns one visual (plus its
// cues) into frame times for the components and a list of events for the storyboard, including
// every sound effect. The render plays exactly these sounds; scripts/storyboard.mjs prints them.
// Plain TypeScript: no React, no Remotion.
import type { CueFn } from "./cue.ts";
import { EASE, f, TIME, type SoundName } from "./motion.ts";
import type {
  BarsVisual,
  ChatVisual,
  CtaVisual,
  FlowVisual,
  HeadlineVisual,
  JourneyVisual,
  ListVisual,
  LogoVisual,
  RankingVisual,
  SceneSpec,
  StatVisual,
  SwapVisual,
  TilesVisual,
  TimelineVisual,
  UiRow,
  UiVisual,
  Visual,
} from "./schema.ts";

export const NEVER = 1e9;

export type PlanEvent = {
  at: number; // frame, relative to the scene
  layer: string; // what on screen
  action: string; // what happens
  motion?: string; // how it moves
  until?: number; // frame the movement ends
  sfx?: { name: SoundName; volume?: number; length?: number };
};

export type PlanCtx = { cue: CueFn; enter: number /* entrance length in frames */ };

const ms = (frames: number) => `${Math.round((frames / f(1)) * 1000)} ms`;
const appear = (ctx: PlanCtx) => `fade 0→1 and rise ${TIME.rise}px→0 over ${ms(ctx.enter)}, ${EASE.name}`;
const ev = (ctx: PlanCtx, at: number, layer: string, action = "enters", extra: Partial<PlanEvent> = {}): PlanEvent => ({
  at,
  layer,
  action,
  motion: appear(ctx),
  until: at + ctx.enter,
  ...extra,
});
const highlight = (ctx: PlanCtx, at: number, layer: string): PlanEvent => ({
  at,
  layer,
  action: "accent outline and tint switch on",
  motion: `outline 0→4px accent, tint 0→14% over ${ms(ctx.enter)}`,
  until: at + ctx.enter,
  sfx: { name: "click" },
});
const typing = (at: number, text: string, cps: number, layer: string): PlanEvent => {
  const length = f(text.length / cps);
  return { at, layer, action: `types "${text}"`, motion: `${cps} characters per second`, until: at + length, sfx: { name: "typing", length } };
};
const chips = (ctx: PlanCtx, items: string[], at: number, layer = "chip"): PlanEvent[] =>
  items.map((c, i) => ev(ctx, at + i * f(TIME.chips.step), `${layer} "${c}"`, "enters", { sfx: { name: "tick" } }));

// ---------------------------------------------------------------- data

export const planStat = (v: StatVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const at = cue(v.cue, f(TIME.stat.at));
  const dotsAt = v.dots ? cue(v.dots.cue, at + f(TIME.stat.dots)) : NEVER;
  const dotsStart = v.dots ? cue(v.dots.cue, at + f(TIME.stat.dotsStart)) : NEVER;
  const chipsAt = v.chips ? cue(v.chips.cue, at + f(TIME.stat.chips)) : NEVER;
  const events: PlanEvent[] = [
    ...(v.headline ? [ev(ctx, 0, `headline "${v.headline}"`)] : []),
    ev(ctx, at, `big number "${v.value}" with label "${v.label}"${v.source ? ` and source "${v.source}"` : ""}`, "enters", { sfx: { name: "impact" } }),
  ];
  if (v.dots) {
    events.push(ev(ctx, dotsAt, "10×10 dot grid (all dots in track colour)"));
    events.push({ at: dotsStart, layer: "dot grid", action: `first ${v.dots.lit} dots turn accent, one by one`, motion: `${TIME.stat.dotsPerSecond} dots per second`, until: dotsStart + f(v.dots.lit / TIME.stat.dotsPerSecond) });
  }
  if (v.chips) events.push(...chips(ctx, v.chips.items, chipsAt));
  return { at, dotsAt, dotsStart, chipsAt, events };
};

export const planRanking = (v: RankingVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const rows = v.items.map((_, i) => f(TIME.ranking.first) + i * f(TIME.ranking.step));
  const hot = cue(v.highlightCue, f(TIME.ranking.hot));
  const dim = cue(v.dimCue, NEVER);
  const sourceAt = f(TIME.ranking.first) + v.items.length * f(TIME.ranking.step);
  const events: PlanEvent[] = [
    ...(v.headline ? [ev(ctx, 0, `headline "${v.headline}"`)] : []),
    ...v.items.map((item, i) => ev(ctx, rows[i], `row #${i + 1} "${item}"`, "enters", { motion: `fade in and rise 12px over ${ms(ctx.enter)}` })),
    ...(v.source ? [ev(ctx, sourceAt, `source "${v.source}"`)] : []),
    { at: Math.max(0, hot - f(TIME.ranking.riserLead)), layer: "audio", action: "riser builds toward the highlight", sfx: { name: "riser" } },
    { ...highlight(ctx, hot, `row "${v.highlight}" (text turns accent)`), sfx: { name: "impact" } },
    { at: hot, layer: `row "${v.highlight}"`, action: "click", sfx: { name: "click" } },
  ];
  if (dim < NEVER) {
    const kept = [v.highlight, ...(v.keep ?? [])].join(", ");
    events.push({ at: dim, layer: "other rows", action: `dim to 30% (stay bright: ${kept})`, motion: `opacity 1→0.3 over ${ms(f(TIME.ranking.dim))}`, until: dim + f(TIME.ranking.dim) });
  }
  return { rows, hot, dim, sourceAt, events };
};

export const planTiles = (v: TilesVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const tiles = v.tiles.map((t, i) => cue(t.cue, f(TIME.tiles.first) + i * f(TIME.tiles.step)));
  const last = Math.max(...tiles);
  const sourceAt = last + f(TIME.tiles.source);
  const textAt = v.text ? cue(v.text.cue, last + f(TIME.tiles.text)) : NEVER;
  const chipsAt = v.chips ? cue(v.chips.cue, last + f(TIME.tiles.chips)) : NEVER;
  const events: PlanEvent[] = [
    ...(v.headline ? [ev(ctx, 0, `headline "${v.headline}"`)] : []),
    ...v.tiles.map((t, i) => ev(ctx, tiles[i], `tile "${t.value}" / "${t.label}"${t.hot ? " (light, emphasised)" : ""}`, "enters", { sfx: { name: "impact", volume: 0.32 } })),
    ...(v.source ? [ev(ctx, sourceAt, `source "${v.source}"`)] : []),
    ...(v.text ? [ev(ctx, textAt, `text "${v.text.text}"`)] : []),
    ...(v.chips ? chips(ctx, v.chips.items, chipsAt) : []),
  ];
  return { tiles, sourceAt, textAt, chipsAt, events };
};

export const planTimeline = (v: TimelineVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const items = v.items.map((it, i) => cue(it.cue, f(TIME.timeline.first) + i * f(TIME.timeline.step)));
  const chipAt = v.chip ? cue(v.chip.cue, Math.max(...items) + f(TIME.timeline.chip)) : NEVER;
  const events: PlanEvent[] = [
    ...(v.headline ? [ev(ctx, 0, `headline "${v.headline}"`)] : []),
    ...v.items.flatMap((it, i) => {
      const out: PlanEvent[] = [
        { at: items[i], layer: `point "${it.date}" — "${it.text}"${it.hot ? " (accent, glow)" : ""}`, action: "lights up", motion: `opacity 0.25→1 over ${ms(ctx.enter)}`, until: items[i] + ctx.enter, sfx: { name: "tick" } },
      ];
      if (i < v.items.length - 1) out.push({ at: items[i] + f(TIME.timeline.lineDelay), layer: "connector line", action: "draws down to the next point", motion: `height 0→100% over ${ms(f(TIME.timeline.line))}`, until: items[i] + f(TIME.timeline.lineDelay) + f(TIME.timeline.line) });
      return out;
    }),
    ...(v.chip ? [ev(ctx, chipAt, `chip "${v.chip.text}"`)] : []),
  ];
  return { items, chipAt, events };
};

export const planBars = (v: BarsVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const bars = v.items.map((it, i) => cue(it.cue, f(TIME.bars.first) + i * f(TIME.bars.step)));
  const textAt = v.text ? cue(v.text.cue, Math.max(...bars) + f(TIME.bars.text)) : NEVER;
  const events: PlanEvent[] = [
    ...(v.headline ? [ev(ctx, 0, `headline "${v.headline}"`)] : []),
    ...v.items.map((it, i) => ({ at: bars[i], layer: `bar "${it.label}" = "${it.value}"${it.hot ? " (accent)" : ""}`, action: `grows to ${Math.round(it.ratio * 100)}% height`, motion: `height 0→target over ${ms(f(TIME.bars.grow))}, ${EASE.name}`, until: bars[i] + f(TIME.bars.grow), sfx: { name: "tick" as const } })),
    ...(v.text ? [ev(ctx, textAt, `text "${v.text.text}"`)] : []),
  ];
  return { bars, textAt, events };
};

// ---------------------------------------------------------------- flow

export const planFlow = (v: FlowVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const T = TIME.flow;
  const toolsAt = cue(v.tools?.cue, f(T.tools));
  const tools = (v.tools?.items ?? []).map((_, i) => toolsAt + i * f(T.toolStep));
  const firstStep = v.tools ? toolsAt + f(T.firstAfterTools) : f(T.first);
  const steps = v.steps.map((s, i) => cue(s.cue, firstStep + i * f(T.step)));
  const lastStep = steps[steps.length - 1] ?? 0;
  const splitAt = v.split ? cue(v.split.cue, lastStep + f(T.split)) : NEVER;
  const breakAt = v.breakAfter ? cue(v.breakAfter.cue, lastStep + f(T.break)) : NEVER;
  const after = Math.max(lastStep, splitAt < NEVER ? splitAt : 0, breakAt < NEVER ? breakAt : 0);
  const results = (v.results ?? []).map((r, i) => cue(r.cue, after + f(T.results) + i * f(T.resultStep)));
  const chipAt = v.chip ? cue(v.chip.cue, after + f(T.chip)) : NEVER;
  const link = (at: number, what: string): PlanEvent => ({ at, layer: what, action: "draws", motion: `length 0→100% over ${ms(f(T.link))}`, until: at + f(T.link) });
  const events: PlanEvent[] = [
    ...(v.eyebrow || v.headline ? [ev(ctx, 0, `${v.eyebrow ? `eyebrow "${v.eyebrow}" ` : ""}${v.headline ? `headline "${v.headline}"` : ""}`)] : []),
    ...(v.tools?.items ?? []).map((t, i) => ev(ctx, tools[i], `tool pill "${t}"`, "enters", { sfx: { name: "tick" } })),
    ...v.steps.flatMap((s, i) => [
      ...(i > 0 ? [link(steps[i] - f(T.linkLead), `accent connector into step ${i + 1}`)] : []),
      ev(ctx, steps[i], `step ${i + 1}${s.label ? ` "${s.label}"` : ""}: "${s.text}"${s.accent ? " (light card)" : ""}`, "enters", { sfx: { name: "tick" } }),
    ]),
    ...(v.breakAfter ? [{ ...link(breakAt, `dashed error-colour connector with "${v.breakAfter.text}"`), action: "draws (broken link)" }] : []),
    ...(v.split
      ? [link(splitAt - f(T.linkLead), "accent connector into the split"), ...v.split.nodes.map((n, i) => ev(ctx, splitAt + i * f(T.splitStep), `node "${n.label}": "${n.value}"`, "enters", { sfx: { name: "tick" } }))]
      : []),
    ...(v.results ?? []).map((r, i) => ev(ctx, results[i], `result card "${r.label}": "${r.value}"`, "enters", { sfx: { name: "click" } })),
    ...(v.chip ? [ev(ctx, chipAt, `chip "${v.chip.text}"`)] : []),
  ];
  return { toolsAt, tools, steps, splitAt, breakAt, results, chipAt, events };
};

export const planJourney = (v: JourneyVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const T = TIME.journey;
  const steps = v.steps.map((s, i) => cue(s.cue, f(T.first) + i * f(T.step)));
  const events: PlanEvent[] = [
    ...(v.headline ? [ev(ctx, 0, `headline "${v.headline}"`)] : []),
    ...v.steps.flatMap((s, i) => {
      const out: PlanEvent[] = [ev(ctx, steps[i], `screen ${i + 1} "${s.title}" (${s.kind}${s.text ? `: "${s.text}"` : ""})`, "enters", { sfx: { name: "tick" } })];
      if (s.kind === "tap") out.push({ at: steps[i] + f(T.press), layer: `screen ${i + 1} button`, action: "pressed: dips to 94% and back, accent outline", motion: `${ms(ctx.enter)}`, until: steps[i] + f(T.press) + ctx.enter, sfx: { name: "click" } });
      if (s.kind === "chat") out.push(highlight(ctx, steps[i] + f(T.chat), `screen ${i + 1} prefilled message`));
      return out;
    }),
  ];
  return { steps, events };
};

// ---------------------------------------------------------------- mockups

export const planChat = (v: ChatVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const T = TIME.chat;
  const panelAt = f(T.panel);
  const sponsoredAt = v.sponsored ? cue(v.sponsored.cue, f(T.sponsored)) : NEVER;
  const chipAt = v.chip ? cue(v.chip.cue, (v.sponsored ? sponsoredAt : panelAt) + f(T.chip)) : NEVER;
  const events: PlanEvent[] = [
    ...(v.headline ? [ev(ctx, 0, `headline "${v.headline}"`)] : []),
    ev(ctx, panelAt, `${v.app ?? "AI assistant"} window with question "${v.question}" and three answer lines`),
  ];
  if (v.sponsored) {
    events.push(ev(ctx, sponsoredAt, `sponsored card "${v.sponsored.title}" / button "${v.sponsored.button}"`, "enters", { sfx: { name: "pop" } }));
    events.push(highlight(ctx, sponsoredAt + f(T.highlight), "sponsored card"));
  }
  if (v.chip) events.push(ev(ctx, chipAt, `chip "${v.chip.text}"`, "enters", { sfx: { name: "tick" } }));
  return { panelAt, sponsoredAt, chipAt, events };
};

export type RowPlan = { at: number; highlightAt: number; typeAt: number; onAt: number };

export const planUi = (v: UiVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const T = TIME.ui;
  const panelAt = cue(v.cue, f(T.panel));
  const rows: RowPlan[] = [];
  const events: PlanEvent[] = [
    ...(v.step || v.headline ? [ev(ctx, 0, `${v.step ? `step "${v.step}" ` : ""}${v.headline ? `headline "${v.headline}"` : ""}`)] : []),
    ev(ctx, panelAt, `UI window "${v.window}"`),
  ];
  v.rows.forEach((row: UiRow, i) => {
    const at = cue("cue" in row ? row.cue : undefined, panelAt + f(T.firstRow) + i * f(T.rowStep));
    const r: RowPlan = { at, highlightAt: NEVER, typeAt: NEVER, onAt: NEVER };
    if (row.kind === "field") {
      r.highlightAt = row.highlightCue ? cue(row.highlightCue) : row.typed ? at : NEVER;
      events.push(ev(ctx, at, `field "${row.label}"${row.typed ? "" : `: "${row.value}"`}`));
      if (r.highlightAt < NEVER) events.push(highlight(ctx, r.highlightAt, `field "${row.label}"`));
      if (row.typed) {
        r.typeAt = at + f(T.typeDelay);
        events.push(typing(r.typeAt, row.value, row.value.length > 30 ? TIME.typing.cpsLong : TIME.typing.cps, `field "${row.label}"`));
      }
    } else if (row.kind === "check") {
      r.onAt = row.cue ? cue(row.cue) + f(T.checkDelay) : NEVER;
      if (r.onAt < NEVER) {
        events.push(highlight(ctx, r.onAt, `checkbox "${row.label}"`));
        events.push({ at: r.onAt, layer: `checkbox "${row.label}"`, action: "ticks", motion: `fills over ${ms(f(TIME.toggle))}`, until: r.onAt + f(TIME.toggle), sfx: { name: "switch" } });
      }
    } else if (row.kind === "toggle") {
      r.highlightAt = at;
      r.onAt = at + f(T.toggleDelay);
      events.push(ev(ctx, at, `toggle "${row.label}"`), highlight(ctx, at, `toggle "${row.label}"`));
      events.push({ at: r.onAt, layer: `toggle "${row.label}"`, action: "switches on (accent)", motion: `knob slides over ${ms(f(TIME.toggle))}`, until: r.onAt + f(TIME.toggle), sfx: { name: "switch" } });
    } else if (row.kind === "row") {
      r.highlightAt = row.highlightCue ? cue(row.highlightCue) : NEVER;
      events.push(ev(ctx, at, `row "${row.text}"${row.right ? ` · "${row.right}"` : ""}`, "enters", { sfx: { name: "tick" } }));
      if (r.highlightAt < NEVER) events.push(highlight(ctx, r.highlightAt, `row "${row.text}"`));
      if (row.status) {
        r.onAt = cue(row.status.cue);
        events.push({ at: r.onAt, layer: `row "${row.text}" status`, action: `"${row.status.from}" → "${row.status.to}"`, motion: `crossfade over ${ms(f(TIME.toggle))}`, until: r.onAt + f(TIME.toggle), sfx: { name: "switch" } });
      }
    } else if (row.kind === "code") {
      events.push(ev(ctx, at, "code block"));
      row.lines.forEach((l, k) => events.push(typing(at + k * f(T.codeStep), l, TIME.typing.cpsLong, `code line ${k + 1}`)));
    } else {
      row.items.forEach((item, k) => events.push(ev(ctx, at + k * f(T.pathStep), `breadcrumb "${item}"${k === row.items.length - 1 ? " (accent)" : ""}`, "enters", { sfx: { name: "tick" } })));
    }
    rows.push(r);
  });
  const afterAt = v.after ? cue(v.after.cue, panelAt + f(T.after)) : NEVER;
  if (v.after) events.push(ev(ctx, afterAt, `line "${v.after.text}"`));
  return { panelAt, rows, afterAt, events };
};

// ---------------------------------------------------------------- basic

export const planHeadline = (v: HeadlineVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const at = cue(v.cue, 0);
  const subAt = v.sub ? cue(v.sub.cue, at + f(TIME.headline.sub)) : NEVER;
  const chipsAt = v.chips ? cue(v.chips.cue, at + f(TIME.headline.chips)) : NEVER;
  const events: PlanEvent[] = [
    ev(ctx, at, `${v.eyebrow ? `eyebrow "${v.eyebrow}" + ` : ""}headline "${v.text}"`),
    ...(v.sub ? [ev(ctx, subAt, `subline "${v.sub.text}"`)] : []),
    ...(v.chips ? chips(ctx, v.chips.items, chipsAt) : []),
  ];
  return { at, subAt, chipsAt, events };
};

export const planList = (v: ListVisual, ctx: PlanCtx) => {
  const { cue } = ctx;
  const T = TIME.list;
  const items = v.items.map((it, i) => cue(it.cue, f(T.first) + i * f(T.step)));
  const strikeAt = cue(v.strikeCue, NEVER);
  const answerAt = v.answer ? cue(v.answer.cue, strikeAt < NEVER ? strikeAt + f(T.answer) : NEVER) : NEVER;
  const marker = v.style === "dash" ? "— (accent)" : v.style === "check" ? "✓ (accent)" : "pill";
  const events: PlanEvent[] = [
    ...(v.eyebrow || v.headline ? [ev(ctx, 0, `${v.eyebrow ? `eyebrow "${v.eyebrow}" ` : ""}${v.headline ? `headline "${v.headline}"` : ""}`)] : []),
    ...v.items.map((it, i) => ev(ctx, items[i], `item ${i + 1} ${marker} "${it.text}"`, "enters", { motion: `fade in and rise 16px over ${ms(ctx.enter)}`, sfx: { name: "tick" } })),
  ];
  if (v.style === "strike" && strikeAt < NEVER) {
    v.items.forEach((it, i) => events.push({ at: strikeAt + i * f(T.strikeStep), layer: `item "${it.text}"`, action: "struck through in error colour, fades to 45%", motion: `line 0→100% over ${ms(f(T.strike))}`, until: strikeAt + i * f(T.strikeStep) + f(T.strike) }));
  }
  if (v.answer && answerAt < NEVER) events.push(ev(ctx, answerAt, `answer pill "${v.answer.text}" (accent, large)`, "enters", { sfx: { name: "pop" } }));
  return { items, strikeAt, answerAt, events };
};

export const planLogo = (v: LogoVisual, ctx: PlanCtx) => {
  const at = ctx.cue(v.cue, f(TIME.logo.headline));
  const chipAt = at + f(TIME.logo.chip);
  const events: PlanEvent[] = [
    ev(ctx, 0, "brand logo, 460 px wide"),
    ev(ctx, at, `headline "${v.headline}"`, "enters", { sfx: { name: "pop" } }),
    ...(v.chip ? [ev(ctx, chipAt, `chip "${v.chip}"`)] : []),
  ];
  return { at, chipAt, events };
};

export const planCta = (v: CtaVisual, ctx: PlanCtx, hasCta: boolean) => {
  const { cue } = ctx;
  const at = cue(v.cue, f(TIME.cta.card));
  const footerAt = v.footer ? cue(v.footerCue, at + f(TIME.cta.footer)) : NEVER;
  const events: PlanEvent[] = [ev(ctx, 0, `headline "${v.headline}"`)];
  if (hasCta) {
    events.push({ at: Math.max(0, at - f(TIME.cta.riserLead)), layer: "audio", action: "riser builds toward the CTA card", sfx: { name: "riser" } });
    events.push(ev(ctx, at, "CTA card: kicker, title, chips, accent button, sub line", "enters", { sfx: { name: "impact", volume: 0.22 } }));
    events.push({ at, layer: "CTA card", action: "ding", sfx: { name: "ding", volume: 0.28 } });
  }
  if (v.footer) events.push(ev(ctx, footerAt, `footer "${v.footer}"`));
  return { at, footerAt, events };
};

// ---------------------------------------------------------------- dispatch

export const planSwap = (v: SwapVisual, ctx: PlanCtx, hasCta: boolean) => {
  const at = ctx.cue(v.at);
  const fadeStart = at - f(TIME.swap.fadeStart);
  const mountSecond = at - f(TIME.swap.fadeEnd);
  const first = planVisual(v.first, ctx, hasCta).events.filter((e) => e.at < at);
  const second = planVisual(v.second, ctx, hasCta).events.filter((e) => e.at >= mountSecond);
  const events: PlanEvent[] = [
    ...first.map((e) => ({ ...e, layer: `[first] ${e.layer}` })),
    { at: fadeStart, layer: "first visual", action: "fades out", motion: `opacity 1→0 over ${ms(mountSecond - fadeStart)}`, until: mountSecond },
    { at: mountSecond, layer: "second visual", action: "replaces the first" },
    ...second.map((e) => ({ ...e, layer: `[second] ${e.layer}` })),
  ];
  return { at, fadeStart, mountSecond, events };
};

export const planVisual = (v: Visual, ctx: PlanCtx, hasCta: boolean): { events: PlanEvent[] } => {
  switch (v.type) {
    case "headline": return planHeadline(v, ctx);
    case "stat": return planStat(v, ctx);
    case "ranking": return planRanking(v, ctx);
    case "tiles": return planTiles(v, ctx);
    case "timeline": return planTimeline(v, ctx);
    case "bars": return planBars(v, ctx);
    case "flow": return planFlow(v, ctx);
    case "chat": return planChat(v, ctx);
    case "journey": return planJourney(v, ctx);
    case "ui": return planUi(v, ctx);
    case "list": return planList(v, ctx);
    case "logo": return planLogo(v, ctx);
    case "swap": return planSwap(v, ctx, hasCta);
    case "cta": return planCta(v, ctx, hasCta);
  }
};

// Scene frame: whoosh and soft hit at the start, optional note card, fade out at the end.
export const planShell = (scene: SceneSpec, ctx: PlanCtx, duration: number, first: boolean) => {
  const noteAt = scene.note ? ctx.cue(scene.note.cue, f(TIME.note.at)) : NEVER;
  const fadeOut = duration - f(TIME.sceneFadeOut);
  const events: PlanEvent[] = [
    { at: 0, layer: "scene", action: "cut in", sfx: { name: "whoosh", volume: first ? 0.25 : undefined } },
    { at: f(TIME.sceneHit), layer: "audio", action: "soft low hit", sfx: { name: "impact", volume: 0.22 } },
  ];
  if (scene.note) events.push(ev(ctx, noteAt, `note card "${scene.note.label ?? "Watch out"}": "${scene.note.text}"`, "enters", { sfx: { name: "pop" } }));
  events.push({ at: fadeOut, layer: "whole scene", action: "fades out", motion: `opacity 1→0 over ${ms(f(TIME.sceneFadeOut))}`, until: duration });
  return { noteAt, fadeOut, events };
};
