import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, mono, sans } from "../brand";
import { PlanSfx } from "../components/sfx";
import { Appear, Checkbox, Eyebrow, Headline, Highlight, Panel, Pill, Rich, Stack, Switch, Typed } from "../components/ui";
import { f, TIME } from "../motion.ts";
import { NEVER, planChat, planUi, type RowPlan } from "../plan.ts";
import type { ChatVisual, UiRow, UiVisual } from "../schema";
import { usePlanCtx } from "../timing";

export const Chat: React.FC<{ v: ChatVisual }> = ({ v }) => {
  const p = planChat(v, usePlanCtx());
  return (
    <Stack gap={44}>
      <PlanSfx events={p.events} />
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={100} />
        </Appear>
      ) : null}
      <Appear at={p.panelAt}>
        <Panel label={v.app ?? "AI assistant"}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: C.panelSoft, borderRadius: 22, padding: "14px 22px", fontSize: 30, fontWeight: 500, maxWidth: 620 }}>{v.question}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "24px 0" }}>
            {[100, 92, 70].map((w) => (
              <div key={w} style={{ height: 18, width: `${w}%`, borderRadius: 9, background: C.panelLine }} />
            ))}
          </div>
          {v.sponsored ? (
            <Appear at={p.sponsoredAt} dy={16}>
              <Highlight at={p.sponsoredAt + f(TIME.chat.highlight)} radius={18}>
                <div style={{ border: `2px solid ${C.panelLine}`, borderRadius: 18, padding: "18px 22px" }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: C.panelMuted }}>{v.sponsored.label ?? "Sponsored"}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{v.sponsored.title}</div>
                    <div style={{ background: C.panelText, color: C.panel, borderRadius: 999, padding: "8px 18px", fontSize: 24, fontWeight: 600 }}>{v.sponsored.button}</div>
                  </div>
                </div>
              </Highlight>
            </Appear>
          ) : null}
        </Panel>
      </Appear>
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

const FieldBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: C.panelSoft, border: `2px solid ${C.panelLine}`, borderRadius: 14, padding: "14px 22px", fontSize: 32, fontWeight: 600, minHeight: 44, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
    {children}
  </div>
);

const Maybe: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) =>
  at >= NEVER ? <>{children}</> : <Highlight at={at}>{children}</Highlight>;

const StatusSwap: React.FC<{ from: string; to: string; at: number }> = ({ from, to, at }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + f(TIME.toggle)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative" }}>
      <div style={{ opacity: 1 - p }}>
        <Pill tone="light" size={22}>
          {from}
        </Pill>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: p }}>
        <Pill size={22}>{to}</Pill>
      </div>
    </div>
  );
};

const Row: React.FC<{ row: UiRow; r: RowPlan }> = ({ row, r }) => {
  if (row.kind === "field") {
    const long = row.value.length > 30;
    return (
      <Appear at={r.at} dy={10} style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: C.panelMuted, marginBottom: 10 }}>{row.label}</div>
        <Maybe at={r.highlightAt}>
          <FieldBox>
            {row.typed ? (
              <Typed text={row.value} at={r.typeAt} cps={long ? TIME.typing.cpsLong : TIME.typing.cps} style={{ fontFamily: row.mono ? mono : sans, fontSize: row.value.length > 40 ? 24 : undefined, wordBreak: "break-all" }} />
            ) : (
              <span style={{ fontFamily: row.mono ? mono : sans }}>
                <Rich text={row.value} onPanel />
              </span>
            )}
          </FieldBox>
        </Maybe>
      </Appear>
    );
  }
  if (row.kind === "check") {
    return (
      <Maybe at={r.onAt}>
        <Checkbox at={r.onAt} label={row.label} />
      </Maybe>
    );
  }
  if (row.kind === "toggle") {
    return (
      <Appear at={r.at} dy={10} style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: C.panelMuted, marginBottom: 10 }}>{row.label}</div>
        <Maybe at={r.highlightAt}>
          <FieldBox>
            <Switch at={r.onAt} />
            <span>On</span>
          </FieldBox>
        </Maybe>
      </Appear>
    );
  }
  if (row.kind === "row") {
    return (
      <Appear at={r.at} dy={10}>
        <Maybe at={r.highlightAt}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 10px", borderBottom: `2px solid ${C.panelLine}`, gap: 16 }}>
            <span style={{ fontFamily: row.mono ? mono : sans, fontSize: 30, fontWeight: row.mono ? 500 : 700 }}>
              <Rich text={row.text} onPanel />
            </span>
            {row.status ? (
              <StatusSwap from={row.status.from} to={row.status.to} at={r.onAt} />
            ) : row.right ? (
              <span style={{ fontSize: 24, fontWeight: 600, color: C.panelMuted }}>{row.right}</span>
            ) : null}
          </div>
        </Maybe>
      </Appear>
    );
  }
  if (row.kind === "code") {
    return (
      <Appear at={r.at} dy={10}>
        <div style={{ background: C.panelText, color: C.panel, borderRadius: 14, padding: "22px 26px", fontFamily: mono, fontSize: 28, lineHeight: 1.5 }}>
          {row.lines.map((l, i) => (
            <div key={i}>
              <Typed text={l} at={r.at + i * f(TIME.ui.codeStep)} cps={TIME.typing.cpsLong} />
            </div>
          ))}
        </div>
      </Appear>
    );
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginBottom: 18 }}>
      {row.items.map((item, i) => (
        <Appear key={item} at={r.at + i * f(TIME.ui.pathStep)} dy={10}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Pill tone={i === row.items.length - 1 ? "accent" : "light"} size={28}>
              <Rich text={item} onPanel={i !== row.items.length - 1} />
            </Pill>
            {i < row.items.length - 1 ? <span style={{ fontSize: 30, color: C.panelMuted }}>→</span> : null}
          </div>
        </Appear>
      ))}
    </div>
  );
};

export const Ui: React.FC<{ v: UiVisual }> = ({ v }) => {
  const p = planUi(v, usePlanCtx());
  return (
    <Stack gap={36}>
      <PlanSfx events={p.events} />
      {v.step || v.headline ? (
        <Appear>
          {v.step ? <Eyebrow>{v.step}</Eyebrow> : null}
          {v.headline ? (
            <div style={{ marginTop: v.step ? 18 : 0 }}>
              <Headline text={v.headline} size={84} />
            </div>
          ) : null}
        </Appear>
      ) : null}
      <Appear at={p.panelAt}>
        <Panel label={v.window}>
          {v.rows.map((row, i) => (
            <Row key={i} row={row} r={p.rows[i]} />
          ))}
          {v.button ? (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Pill size={28}>{v.button}</Pill>
            </div>
          ) : null}
        </Panel>
      </Appear>
      {v.after ? (
        <Appear at={p.afterAt}>
          <div style={{ fontFamily: sans, fontSize: 34, fontWeight: 500, color: C.muted, lineHeight: 1.35 }}>
            <Rich text={v.after.text} />
          </div>
        </Appear>
      ) : null}
    </Stack>
  );
};
