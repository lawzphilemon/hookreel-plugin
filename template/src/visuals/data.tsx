import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, display, FPS, RADIUS, sans } from "../brand";
import { PlanSfx } from "../components/sfx";
import { Appear, Body, Chips, Headline, Highlight, Pill, Rich, Source, Stack, useEnter } from "../components/ui";
import { f, TIME } from "../motion.ts";
import { planBars, planRanking, planStat, planTiles, planTimeline } from "../plan.ts";
import type { BarsVisual, RankingVisual, StatVisual, TilesVisual, TimelineVisual } from "../schema";
import { usePlanCtx } from "../timing";

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
