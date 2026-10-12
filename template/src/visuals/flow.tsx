import React from "react";
import { C, mono, RADIUS, sans } from "../brand";
import { Sfx } from "../components/sfx";
import { Appear, Eyebrow, Headline, Highlight, Pill, Rich, Stack, useEnter } from "../components/ui";
import type { FlowVisual, JourneyVisual } from "../schema";
import { useCueFn } from "../timing";

const Node: React.FC<{ at: number; label?: string; text: string; accent?: boolean }> = ({ at, label, text, accent }) => (
  <Appear at={at} dy={16} style={{ flex: 1 }}>
    <Sfx name="tick" at={at} />
    <div
      style={{
        background: accent ? C.panel : C.surface,
        color: accent ? C.panelText : C.text,
        borderRadius: 24,
        padding: "20px 26px",
        fontFamily: sans,
        height: "100%",
      }}
    >
      {label ? <div style={{ fontSize: 24, fontWeight: 600, color: accent ? C.panelMuted : C.muted }}>{label}</div> : null}
      <div style={{ fontSize: 36, fontWeight: 700, marginTop: label ? 4 : 0 }}>
        <Rich text={text} onPanel={accent} />
      </div>
    </div>
  </Appear>
);

// Connector between steps; `broken` (dashed, error colour) marks where something stops working.
const Link: React.FC<{ at: number; broken?: string }> = ({ at, broken }) => {
  const p = useEnter(at, 10);
  return (
    <div style={{ height: 44, display: "flex", alignItems: "center", gap: 18, paddingLeft: 40 }}>
      <div style={{ width: 0, height: `${p * 100}%`, borderLeft: broken ? `4px dashed ${C.error}` : `4px solid ${C.accent}` }} />
      {broken ? (
        <div style={{ fontFamily: sans, fontSize: 26, fontWeight: 600, color: C.errorText, opacity: p }}>{broken}</div>
      ) : null}
    </div>
  );
};

export const Flow: React.FC<{ v: FlowVisual }> = ({ v }) => {
  const cue = useCueFn();
  const toolsAt = cue(v.tools?.cue, 4);
  const ats = v.steps.map((s, i) => cue(s.cue, (v.tools ? toolsAt + 20 : 6) + i * 10));
  const lastStep = ats[ats.length - 1] ?? 0;
  const splitAt = v.split ? cue(v.split.cue, lastStep + 14) : 0;
  const breakAt = v.breakAfter ? cue(v.breakAfter.cue, lastStep + 10) : 0;
  const after = Math.max(lastStep, splitAt, breakAt);
  return (
    <Stack gap={28}>
      {v.eyebrow || v.headline ? (
        <Appear>
          {v.eyebrow ? <Eyebrow>{v.eyebrow}</Eyebrow> : null}
          {v.headline ? (
            <div style={{ marginTop: v.eyebrow ? 18 : 0 }}>
              <Headline text={v.headline} size={88} />
            </div>
          ) : null}
        </Appear>
      ) : null}
      {v.tools ? (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {v.tools.items.map((t, i) => (
            <Appear key={t} at={toolsAt + i * 8} dy={12}>
              <Sfx name="tick" at={toolsAt + i * 8} />
              <Pill size={30}>{t}</Pill>
            </Appear>
          ))}
        </div>
      ) : null}
      <div>
        {v.steps.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <Link at={ats[i] - 6} /> : null}
            <Node at={ats[i]} label={s.label} text={s.text} accent={s.accent} />
          </React.Fragment>
        ))}
        {v.breakAfter ? <Link at={breakAt} broken={v.breakAfter.text} /> : null}
        {v.split ? (
          <>
            <Link at={splitAt - 6} />
            <div style={{ display: "flex", gap: 18 }}>
              {v.split.nodes.map((n, i) => (
                <Node key={n.label} at={splitAt + i * 6} label={n.label} text={n.value} />
              ))}
            </div>
          </>
        ) : null}
      </div>
      {v.results ? (
        <div style={{ display: "flex", gap: 20 }}>
          {v.results.map((r, i) => {
            const at = cue(r.cue, after + 10 + i * 8);
            return (
              <Appear key={r.label} at={at} style={{ flex: 1 }}>
                <Sfx name="click" at={at} />
                <div style={{ background: C.panel, borderRadius: 24, padding: "20px 24px", fontFamily: sans, color: C.panelText, height: "100%" }}>
                  <div style={{ fontSize: 24, fontWeight: 600, color: C.panelMuted }}>{r.label}</div>
                  <div style={{ marginTop: 8, fontSize: r.big ? 56 : 30, fontWeight: r.big ? 800 : 600, lineHeight: 1.1, fontFamily: r.big ? sans : mono }}>
                    <Rich text={r.value} onPanel />
                  </div>
                </div>
              </Appear>
            );
          })}
        </div>
      ) : null}
      {v.chip ? (
        <Appear at={cue(v.chip.cue, after + 16)}>
          <Pill tone="light" size={32}>
            {v.chip.text}
          </Pill>
        </Appear>
      ) : null}
    </Stack>
  );
};

const Bars: React.FC<{ widths: number[] }> = ({ widths }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {widths.map((w, i) => (
      <div key={i} style={{ height: 14, width: `${w}%`, borderRadius: 7, background: C.panelLine }} />
    ))}
  </div>
);

const ButtonMock: React.FC<{ text: string; size?: number; pressAt?: number }> = ({ text, size = 20, pressAt }) => {
  const press = useEnter(pressAt ?? 1e9, 6);
  return (
    <div
      style={{
        background: C.panelText,
        color: C.panel,
        borderRadius: 999,
        padding: `${size * 0.5}px ${size * 0.9}px`,
        fontSize: size,
        fontWeight: 700,
        scale: `${1 - 0.06 * Math.sin(Math.PI * press)}`,
        outline: `4px solid ${C.accent}${Math.round(press * 255).toString(16).padStart(2, "0")}`,
        outlineOffset: 6,
      }}
    >
      {text}
    </div>
  );
};

const JourneyScreen: React.FC<{ kind: JourneyVisual["steps"][number]["kind"]; text?: string; at: number }> = ({ kind, text, at }) => {
  if (kind === "ad")
    return (
      <>
        <Bars widths={[100, 85, 60]} />
        <div style={{ marginTop: 16, border: `2px solid ${C.panelLine}`, borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.panelMuted }}>Sponsored</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{text ?? "Your business"}</div>
        </div>
      </>
    );
  if (kind === "page")
    return (
      <>
        <div style={{ height: 70, borderRadius: 12, background: C.panelSoft, marginBottom: 14 }} />
        <Bars widths={[90, 70]} />
        <div style={{ marginTop: 16, display: "flex" }}>
          <ButtonMock text={text ?? "Contact us"} />
        </div>
      </>
    );
  if (kind === "tap")
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Sfx name="click" at={at + 8} />
        <ButtonMock text={text ?? "Contact us"} size={26} pressAt={at + 8} />
      </div>
    );
  if (kind === "chat")
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <Highlight at={at + 8} radius={14}>
          <div style={{ background: C.panelSoft, borderRadius: 14, padding: "12px 14px", fontSize: 22, fontWeight: 500, lineHeight: 1.3 }}>
            {text ?? "Hi, I'd like to know more."}
          </div>
        </Highlight>
      </div>
    );
  return <div style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.3 }}>{text}</div>;
};

export const Journey: React.FC<{ v: JourneyVisual }> = ({ v }) => {
  const cue = useCueFn();
  const ats = v.steps.map((s, i) => cue(s.cue, 8 + i * 14));
  const rows = [v.steps.slice(0, 2), v.steps.slice(2, 4)].filter((r) => r.length);
  return (
    <Stack gap={28}>
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={84} />
        </Appear>
      ) : null}
      {rows.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: 18 }}>
          {row.map((s, i) => {
            const idx = r * 2 + i;
            return (
              <Appear key={idx} at={ats[idx]} style={{ flex: 1 }}>
                <Sfx name="tick" at={ats[idx]} />
                <div style={{ background: C.surface, borderRadius: RADIUS.card, padding: 22, height: 360, display: "flex", flexDirection: "column", gap: 16, fontFamily: sans }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 44, fontWeight: 800, color: C.accent }}>{idx + 1}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1.15 }}>{s.title}</div>
                  </div>
                  <div style={{ flex: 1, background: C.panel, borderRadius: 20, padding: 18, color: C.panelText, overflow: "hidden" }}>
                    <JourneyScreen kind={s.kind} text={s.text} at={ats[idx]} />
                  </div>
                </div>
              </Appear>
            );
          })}
        </div>
      ))}
    </Stack>
  );
};
