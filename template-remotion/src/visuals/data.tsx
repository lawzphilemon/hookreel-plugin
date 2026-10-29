import React from "react";
import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { C, display, FPS, RADIUS, sans } from "../brand";
import { PlanSfx } from "../components/sfx";
import { Appear, Body, Chips, Headline, Highlight, Pill, Rich, Source, Stack, useEnter } from "../components/ui";
import { f, TIME } from "../motion.ts";
import { planBars, planMonths, planRanking, planSplit, planStat, planTiles, planTimeline } from "../plan.ts";
import type { BarsVisual, MonthsVisual, RankingVisual, SplitVisual, StatVisual, TilesVisual, TimelineVisual } from "../schema";
import { usePlanCtx, useScene } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 100 dots; the first `lit` turn accent one by one.
const DotGrid: React.FC<{ lit: number; at: number }> = ({ lit, at }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.min(lit, Math.floor(((frame - at) / FPS) * TIME.stat.dotsPerSecond)));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 36px)", gap: 12 }}>
      {Array.from({ length: 100 }, (_, i) => (
        <div key={i} style={{ width: 36, height: 36, borderRadius: 18, background: i < shown ? C.accent : C.track }} />
      ))}
    </div>
  );
};

const BigNumber: React.FC<{ at: number; value: string; label: string; source?: string; size: number }> = ({ at, value, label, source, size }) => (
  <Appear at={at}>
    <div style={{ fontFamily: display, fontSize: size, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em", color: C.accent }}>{value}</div>
    <div style={{ fontFamily: sans, fontSize: 44, fontWeight: 600, color: C.text, marginTop: 14, lineHeight: 1.2 }}>
      <Rich text={label} />
    </div>
    {source ? <Source>{source}</Source> : null}
  </Appear>
);

export const Stat: React.FC<{ v: StatVisual }> = ({ v }) => {
  const p = planStat(v, usePlanCtx());
  return (
    <Stack gap={40}>
      <PlanSfx events={p.events} />
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={84} />
        </Appear>
      ) : null}
      <BigNumber at={p.at} value={v.value} label={v.label} source={v.source} size={v.size ?? (v.dots ? 180 : 200)} />
      {v.dots ? (
        <Appear at={p.dotsAt}>
          <DotGrid lit={v.dots.lit} at={p.dotsStart} />
        </Appear>
      ) : null}
      {v.chips ? <Chips items={v.chips.items} at={p.chipsAt} accent={v.chips.accent} /> : null}
    </Stack>
  );
};

export const Ranking: React.FC<{ v: RankingVisual }> = ({ v }) => {
  const p = planRanking(v, usePlanCtx());
  const frame = useCurrentFrame();
  const dim = interpolate(frame, [p.dim, p.dim + f(TIME.ranking.dim)], [1, 0.3], clamp);
  return (
    <Stack gap={30}>
      <PlanSfx events={p.events} />
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={96} />
        </Appear>
      ) : null}
      <div>
        {v.items.map((item, i) => {
          const hot = item === v.highlight;
          const bright = hot || (v.keep ?? []).includes(item);
          const row = (
            <div style={{ display: "flex", alignItems: "center", gap: 28, padding: "14px 22px", fontFamily: sans, fontSize: 42, fontWeight: hot ? 800 : 600, color: hot ? C.accent : C.text, opacity: bright ? 1 : dim }}>
              <span style={{ width: 72, color: hot ? C.accent : C.muted, fontVariantNumeric: "tabular-nums" }}>#{i + 1}</span>
              {item}
            </div>
          );
          return (
            <Appear key={item} at={p.rows[i]} dy={12}>
              {hot ? (
                <Highlight at={p.hot} radius={18}>
                  {row}
                </Highlight>
              ) : (
                row
              )}
            </Appear>
          );
        })}
        {v.source ? (
          <Appear at={p.sourceAt}>
            <Source>{v.source}</Source>
          </Appear>
        ) : null}
      </div>
    </Stack>
  );
};

export const Tiles: React.FC<{ v: TilesVisual }> = ({ v }) => {
  const p = planTiles(v, usePlanCtx());
  return (
    <Stack gap={40}>
      <PlanSfx events={p.events} />
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={92} />
        </Appear>
      ) : null}
      <div>
        <div style={{ display: "flex", gap: 18 }}>
          {v.tiles.map((t, i) => (
            <Appear key={t.label} at={p.tiles[i]} style={{ flex: 1 }}>
              <div style={{ background: t.hot ? C.panel : C.surface, borderRadius: RADIUS.card, padding: "32px 24px", fontFamily: sans, textAlign: "center", height: "100%" }}>
                <div style={{ fontFamily: display, fontSize: 132, fontWeight: 800, lineHeight: 1, color: t.hot ? C.panelText : C.accent, letterSpacing: "-0.04em" }}>{t.value}</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: t.hot ? C.panelText : C.text, marginTop: 14, lineHeight: 1.2 }}>{t.label}</div>
              </div>
            </Appear>
          ))}
        </div>
        {v.source ? (
          <Appear at={p.sourceAt}>
            <Source>{v.source}</Source>
          </Appear>
        ) : null}
      </div>
      {v.text ? (
        <Appear at={p.textAt}>
          <Body text={v.text.text} size={36} />
        </Appear>
      ) : null}
      {v.chips ? <Chips items={v.chips.items} at={p.chipsAt} size={34} /> : null}
    </Stack>
  );
};

const TimelineRow: React.FC<{ date: string; text: string; at: number; hot?: boolean; last: boolean }> = ({ date, text, at, hot, last }) => {
  const p = useEnter(at);
  const line = useEnter(at + f(TIME.timeline.lineDelay), f(TIME.timeline.line));
  return (
    <div style={{ display: "flex", gap: 28, opacity: 0.25 + 0.75 * p }}>
      <div style={{ width: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, marginTop: 8, background: hot ? C.accent : p > 0.5 ? C.text : C.track, boxShadow: hot ? `0 0 ${32 * p}px ${C.accent}80` : undefined }} />
        {last ? null : (
          <div style={{ flex: 1, width: 4, background: C.track, marginTop: 6 }}>
            <div style={{ width: "100%", height: `${line * 100}%`, background: C.text }} />
          </div>
        )}
      </div>
      <div style={{ paddingBottom: last ? 0 : 34, fontFamily: sans }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: hot ? C.accent : C.muted, letterSpacing: "0.04em" }}>{date}</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: C.text, marginTop: 6, lineHeight: 1.2 }}>
          <Rich text={text} />
        </div>
      </div>
    </div>
  );
};

export const Timeline: React.FC<{ v: TimelineVisual }> = ({ v }) => {
  const p = planTimeline(v, usePlanCtx());
  return (
    <Stack gap={50}>
      <PlanSfx events={p.events} />
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={92} />
        </Appear>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {v.items.map((it, i) => (
          <TimelineRow key={it.date} date={it.date} text={it.text} at={p.items[i]} hot={it.hot} last={i === v.items.length - 1} />
        ))}
      </div>
      {v.chip ? (
        <Appear at={p.chipAt}>
          <Pill tone="light" size={34}>
            {v.chip.text}
          </Pill>
        </Appear>
      ) : null}
    </Stack>
  );
};

const Bar: React.FC<{ label: string; value: string; ratio: number; at: number; hot?: boolean; height: number }> = ({ label, value, ratio, at, hot, height }) => {
  const p = useEnter(at, f(TIME.bars.grow));
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: sans }}>
      <div style={{ fontFamily: display, fontSize: 56, fontWeight: 800, color: hot ? C.accent : C.text, opacity: p, marginBottom: 12 }}>{value}</div>
      <div style={{ height: (height - 150) * ratio * p, borderRadius: 20, background: hot ? C.accent : C.track }} />
      <div style={{ fontSize: 32, fontWeight: 600, color: C.muted, marginTop: 14 }}>{label}</div>
    </div>
  );
};

export const Bars: React.FC<{ v: BarsVisual }> = ({ v }) => {
  const p = planBars(v, usePlanCtx());
  const height = 420;
  return (
    <Stack gap={56}>
      <PlanSfx events={p.events} />
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={96} />
        </Appear>
      ) : null}
      <div style={{ display: "flex", gap: 36, alignItems: "flex-end", height }}>
        {v.items.map((it, i) => (
          <Bar key={it.label} {...it} at={p.bars[i]} height={height} />
        ))}
      </div>
      {v.text ? (
        <Appear at={p.textAt}>
          <Body text={v.text.text} />
        </Appear>
      ) : null}
    </Stack>
  );
};

const MonthCell: React.FC<{ month: number; at: number; fill: number; cell?: string; width: number; calendar?: boolean }> = ({ month, at, fill, cell, width, calendar }) => {
  const p = useEnter(at, f(TIME.months.grow));
  const height = Math.round(width * (calendar ? 1 : 1.3));
  // A partial fill is never shorter than the cell text, so the text always sits on accent.
  const fillPx = fill >= 1 ? height : fill > 0 ? Math.max(fill * height, 56) : 0;
  return (
    <div style={{ position: "relative", height, borderRadius: 20, overflow: "hidden", background: fill > 0 ? C.surface : C.track, opacity: 0.25 + 0.75 * p, fontFamily: sans }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: fillPx * p, background: C.accent }} />
      <div style={{ position: "absolute", top: 14, left: 18, fontFamily: display, fontSize: 44, fontWeight: 800, color: fill >= 1 && p > 0.5 ? C.onAccent : fill > 0 ? C.text : C.muted }}>{month}</div>
      {cell ? (
        <div style={{ position: "absolute", left: 18, bottom: 12, fontSize: 30, fontWeight: 700, color: C.onAccent, opacity: p }}>{cell}</div>
      ) : null}
      {calendar && fill > 0 ? (
        <div style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: 17, display: "flex", alignItems: "center", justifyContent: "center", background: fill >= 1 ? C.onAccent : C.accent, color: fill >= 1 ? C.accent : C.onAccent, fontSize: 22, fontWeight: 800, scale: String(p) }}>
          ✓
        </div>
      ) : null}
    </div>
  );
};

// Calendar card: tilted back a little and settling flatter over the scene, so it never sits still.
const CalendarCard: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  const frame = useCurrentFrame();
  const { duration } = useScene();
  const k = Math.min(1, frame / Math.max(1, duration));
  return (
    <div style={{ perspective: 1800 }}>
      <div style={{ background: C.surface, borderRadius: RADIUS.card, padding: 28, boxShadow: "0 30px 60px rgba(0,0,0,0.10)", transform: `rotateX(${12 - 6 * k}deg) rotateY(${-14 + 8 * k}deg) rotateZ(${2 - k}deg)`, transformOrigin: "50% 50%" }}>
        {title ? <div style={{ fontFamily: sans, fontSize: 30, fontWeight: 600, color: C.muted, marginBottom: 20 }}>{title}</div> : null}
        {children}
      </div>
    </div>
  );
};

export const Months: React.FC<{ v: MonthsVisual }> = ({ v }) => {
  const p = planMonths(v, usePlanCtx());
  const columns = v.columns ?? 6;
  const gap = 16;
  const calendar = v.style === "calendar";
  const width = Math.min(160, ((calendar ? 864 : 920) - gap * (columns - 1)) / columns);
  const groupOf = (m: number) => v.groups.find((g) => m >= g.from && m <= g.to);
  const grid = (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
      {p.cellAt.map((at, i) => {
        const g = groupOf(i + 1);
        return <MonthCell key={i} month={i + 1} at={at} fill={g?.fill ?? 0} cell={g?.cell} width={width} calendar={calendar} />;
      })}
    </div>
  );
  return (
    <Stack gap={32}>
      <PlanSfx events={p.events} />
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={92} />
        </Appear>
      ) : null}
      {calendar ? <CalendarCard title={v.title}>{grid}</CalendarCard> : grid}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {v.groups.map((g, i) => (
          <Appear key={g.label} at={p.groups[i]}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: sans, fontSize: 36, fontWeight: 600, color: C.text }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: g.fill >= 1 ? C.accent : g.fill > 0 ? `linear-gradient(to top, ${C.accent} ${g.fill * 100}%, ${C.surface} ${g.fill * 100}%)` : C.track, flexShrink: 0 }} />
              <Rich text={g.label} />
            </div>
          </Appear>
        ))}
        {v.source ? (
          <Appear at={p.sourceAt}>
            <Source>{v.source}</Source>
          </Appear>
        ) : null}
      </div>
      {v.text ? (
        <Appear at={p.textAt}>
          <Body text={v.text.text} size={36} />
        </Appear>
      ) : null}
    </Stack>
  );
};

const Swatch: React.FC<{ color: string }> = ({ color }) => <div style={{ width: 30, height: 30, borderRadius: 8, background: color, flexShrink: 0 }} />;

export const Split: React.FC<{ v: SplitVisual }> = ({ v }) => {
  const p = planSplit(v, usePlanCtx());
  const split = useEnter(p.splitAt, f(TIME.split.grow));
  const fade = useEnter(p.fadeAt, f(TIME.split.fadeLength));
  const gap = 16 * split;
  const inner = 20 * split;
  return (
    <Stack gap={40}>
      <PlanSfx events={p.events} />
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={92} />
        </Appear>
      ) : null}
      <Appear at={p.totalAt}>
        <div style={{ fontFamily: display, fontSize: 84, fontWeight: 800, lineHeight: 1, color: C.text, letterSpacing: "-0.03em" }}>{v.total.value}</div>
        {v.total.label ? <div style={{ fontFamily: sans, fontSize: 36, fontWeight: 600, color: C.muted, marginTop: 12 }}>{v.total.label}</div> : null}
        <div style={{ display: "flex", gap, height: 240, marginTop: 28 }}>
          {Array.from({ length: v.parts }, (_, i) => {
            const kept = i < v.keep;
            const grey = v.start === "track";
            // accent→track for the rest (default), or track→accent for the kept blocks (start "track")
            const bg = grey ? (kept ? interpolateColors(fade, [0, 1], [C.track, C.accent]) : C.track) : kept ? C.accent : interpolateColors(fade, [0, 1], [C.accent, C.track]);
            const fg = grey ? (kept ? interpolateColors(fade, [0, 1], [C.muted, C.onAccent]) : C.muted) : kept ? C.onAccent : interpolateColors(fade, [0, 1], [C.onAccent, C.muted]);
            const first = i === 0;
            const last = i === v.parts - 1;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: bg,
                  borderRadius: `${first ? 20 : inner}px ${last ? 20 : inner}px ${last ? 20 : inner}px ${first ? 20 : inner}px`,
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 18,
                  fontFamily: display,
                  fontSize: 44,
                  fontWeight: 800,
                  color: fg,
                }}
              >
                <span style={{ opacity: split }}>{v.part}</span>
              </div>
            );
          })}
        </div>
      </Appear>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, opacity: fade, fontFamily: sans, fontSize: 36, fontWeight: 600, color: C.text }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Swatch color={C.accent} />
          <Rich text={v.keepLabel} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Swatch color={C.track} />
          <Rich text={v.restLabel} />
        </div>
      </div>
      {v.text ? (
        <Appear at={p.textAt}>
          <Body text={v.text.text} size={36} />
        </Appear>
      ) : null}
    </Stack>
  );
};
