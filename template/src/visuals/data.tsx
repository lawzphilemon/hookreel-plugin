import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, RADIUS, sans } from "../brand";
import { Sfx } from "../components/sfx";
import { Appear, Body, Chips, Headline, Highlight, Pill, Rich, Source, Stack, useEnter } from "../components/ui";
import type { BarsVisual, RankingVisual, StatVisual, TilesVisual, TimelineVisual } from "../schema";
import { useCueFn } from "../timing";

// 100 dots, the first `lit` light up one by one: a share of a population at a glance.
const DotGrid: React.FC<{ lit: number; at: number }> = ({ lit, at }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.min(lit, Math.floor((frame - at) * 1.6)));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 36px)", gap: 12 }}>
      {Array.from({ length: 100 }, (_, i) => (
        <div key={i} style={{ width: 36, height: 36, borderRadius: 18, background: i < shown ? C.accent : C.track }} />
      ))}
    </div>
  );
};

export const BigNumber: React.FC<{ at: number; value: string; label: string; source?: string; size?: number }> = ({
  at,
  value,
  label,
  source,
  size = 200,
}) => (
  <Appear at={at}>
    <Sfx name="impact" at={at} />
    <div style={{ fontFamily: sans, fontSize: size, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em", color: C.accent }}>
      {value}
    </div>
    <div style={{ fontFamily: sans, fontSize: 44, fontWeight: 600, color: C.text, marginTop: 14, lineHeight: 1.2 }}>
      <Rich text={label} />
    </div>
    {source ? <Source>{source}</Source> : null}
  </Appear>
);

export const Stat: React.FC<{ v: StatVisual }> = ({ v }) => {
  const cue = useCueFn();
  const at = cue(v.cue, 4);
  return (
    <Stack gap={40}>
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={84} />
        </Appear>
      ) : null}
      <BigNumber at={at} value={v.value} label={v.label} source={v.source} size={v.size ?? (v.dots ? 180 : 200)} />
      {v.dots ? (
        <Appear at={cue(v.dots.cue, at + 8)}>
          <DotGrid lit={v.dots.lit} at={cue(v.dots.cue, at + 10)} />
        </Appear>
      ) : null}
      {v.chips ? <Chips items={v.chips.items} at={cue(v.chips.cue, at + 20)} accent={v.chips.accent} /> : null}
    </Stack>
  );
};

const RankRow: React.FC<{ rank: number; label: string; at: number; hot: boolean; hotAt: number; dim: number }> = ({
  rank,
  label,
  at,
  hot,
  hotAt,
  dim,
}) => {
  const row = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "14px 22px",
        fontFamily: sans,
        fontSize: 42,
        fontWeight: hot ? 800 : 600,
        color: hot ? C.accent : C.text,
        opacity: dim,
      }}
    >
      <span style={{ width: 72, color: hot ? C.accent : C.muted, fontVariantNumeric: "tabular-nums" }}>#{rank}</span>
      {label}
    </div>
  );
  return (
    <Appear at={at} dy={12}>
      {hot ? (
        <>
          <Sfx name="riser" at={Math.max(0, hotAt - 36)} />
          <Sfx name="impact" at={hotAt} />
          <Highlight at={hotAt} radius={18}>
            {row}
          </Highlight>
        </>
      ) : (
        row
      )}
    </Appear>
  );
};

export const Ranking: React.FC<{ v: RankingVisual }> = ({ v }) => {
  const cue = useCueFn();
  const frame = useCurrentFrame();
  const hotAt = cue(v.highlightCue, 36);
  const dimAt = cue(v.dimCue, 1e9);
  const dim = interpolate(frame, [dimAt, dimAt + 10], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Stack gap={30}>
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={96} />
        </Appear>
      ) : null}
      <div>
        {v.items.map((item, i) => {
          const bright = item === v.highlight || (v.keep ?? []).includes(item);
          return <RankRow key={item} rank={i + 1} label={item} at={4 + i * 3} hot={item === v.highlight} hotAt={hotAt} dim={bright ? 1 : dim} />;
        })}
        {v.source ? (
          <Appear at={4 + v.items.length * 3}>
            <Source>{v.source}</Source>
          </Appear>
        ) : null}
      </div>
    </Stack>
  );
};

const Tile: React.FC<{ at: number; value: string; label: string; hot?: boolean }> = ({ at, value, label, hot }) => (
  <Appear at={at} style={{ flex: 1 }}>
    <Sfx name="impact" at={at} volume={0.32} />
    <div
      style={{
        background: hot ? C.panel : C.surface,
        borderRadius: RADIUS.card,
        padding: "32px 24px",
        fontFamily: sans,
        textAlign: "center",
        height: "100%",
      }}
    >
      <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1, color: hot ? C.panelText : C.accent, letterSpacing: "-0.04em" }}>
        {value}
      </div>
      <div style={{ fontSize: 32, fontWeight: 600, color: hot ? C.panelText : C.text, marginTop: 14, lineHeight: 1.2 }}>{label}</div>
    </div>
  </Appear>
);

export const Tiles: React.FC<{ v: TilesVisual }> = ({ v }) => {
  const cue = useCueFn();
  const ats = v.tiles.map((t, i) => cue(t.cue, 8 + i * 10));
  const last = Math.max(...ats);
  return (
    <Stack gap={40}>
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={92} />
        </Appear>
      ) : null}
      <div>
        <div style={{ display: "flex", gap: 18 }}>
          {v.tiles.map((t, i) => (
            <Tile key={t.label} at={ats[i]} value={t.value} label={t.label} hot={t.hot} />
          ))}
        </div>
        {v.source ? (
          <Appear at={last + 6}>
            <Source>{v.source}</Source>
          </Appear>
        ) : null}
      </div>
      {v.text ? (
        <Appear at={cue(v.text.cue, last + 10)}>
          <Body text={v.text.text} size={36} />
        </Appear>
      ) : null}
      {v.chips ? <Chips items={v.chips.items} at={cue(v.chips.cue, last + 16)} size={34} /> : null}
    </Stack>
  );
};

const TimelineRow: React.FC<{ date: string; text: string; at: number; hot?: boolean; last: boolean }> = ({
  date,
  text,
  at,
  hot,
  last,
}) => {
  const p = useEnter(at);
  const line = useEnter(at + 4, 14);
  return (
    <div style={{ display: "flex", gap: 28, opacity: 0.25 + 0.75 * p }}>
      <Sfx name="tick" at={at} />
      <div style={{ width: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            marginTop: 8,
            background: hot ? C.accent : p > 0.5 ? C.text : C.track,
            boxShadow: hot ? `0 0 ${32 * p}px ${C.accent}80` : undefined,
          }}
        />
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
  const cue = useCueFn();
  const ats = v.items.map((it, i) => cue(it.cue, 6 + i * 10));
  return (
    <Stack gap={50}>
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={92} />
        </Appear>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {v.items.map((it, i) => (
          <TimelineRow key={it.date} date={it.date} text={it.text} at={ats[i]} hot={it.hot} last={i === v.items.length - 1} />
        ))}
      </div>
      {v.chip ? (
        <Appear at={cue(v.chip.cue, Math.max(...ats) + 10)}>
          <Pill tone="light" size={34}>
            {v.chip.text}
          </Pill>
        </Appear>
      ) : null}
    </Stack>
  );
};

const Bar: React.FC<{ label: string; value: string; ratio: number; at: number; hot?: boolean; height: number }> = ({
  label,
  value,
  ratio,
  at,
  hot,
  height,
}) => {
  const p = useEnter(at, 18);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: sans }}>
      <Sfx name="tick" at={at} />
      <div style={{ fontSize: 56, fontWeight: 800, color: hot ? C.accent : C.text, opacity: p, marginBottom: 12 }}>{value}</div>
      <div style={{ height: (height - 150) * ratio * p, borderRadius: 20, background: hot ? C.accent : C.track }} />
      <div style={{ fontSize: 32, fontWeight: 600, color: C.muted, marginTop: 14 }}>{label}</div>
    </div>
  );
};

export const Bars: React.FC<{ v: BarsVisual }> = ({ v }) => {
  const cue = useCueFn();
  const ats = v.items.map((it, i) => cue(it.cue, 8 + i * 10));
  const height = 420;
  return (
    <Stack gap={56}>
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={96} />
        </Appear>
      ) : null}
      <div style={{ display: "flex", gap: 36, alignItems: "flex-end", height }}>
        {v.items.map((it, i) => (
          <Bar key={it.label} {...it} at={ats[i]} height={height} />
        ))}
      </div>
      {v.text ? (
        <Appear at={cue(v.text.cue, Math.max(...ats) + 10)}>
          <Body text={v.text.text} />
        </Appear>
      ) : null}
    </Stack>
  );
};
