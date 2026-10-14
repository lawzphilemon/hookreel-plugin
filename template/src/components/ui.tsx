import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BRAND, C, display, ENTER, easeOut, mono, RADIUS, sans } from "../brand";
import { f, FPS, TIME } from "../motion.ts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const NEVER = 1e9;

export const useEnter = (at: number, length = ENTER) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [at, at + length], [0, 1], { ...clamp, easing: easeOut });
};

const FOCUS = BRAND.motion?.entrance === "focus";
const KINETIC = BRAND.motion?.text === "kinetic";

// The entrance time of the nearest Appear, so kinetic headlines can start their words from it.
const AppearAt = React.createContext(0);

// Fade + short rise (or, with motion.entrance "focus", fade in from a blur). Nothing bounces or loops.
export const Appear: React.FC<{ at?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at = 0,
  dy = TIME.rise,
  style,
  children,
}) => {
  const p = useEnter(at);
  return (
    <AppearAt.Provider value={at}>
      <div style={{ opacity: p, translate: `0px ${(1 - p) * (FOCUS ? dy / 2 : dy)}px`, filter: FOCUS && p < 1 ? `blur(${(1 - p) * TIME.focus.blur}px)` : undefined, ...style }}>{children}</div>
    </AppearAt.Provider>
  );
};

export const Stack: React.FC<{ gap?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  gap = 44,
  children,
  style,
}) => <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>;

// `code` spans inside text, styled for the surface they sit on.
export const Rich: React.FC<{ text: string; onPanel?: boolean }> = ({ text, onPanel }) => (
  <>
    {text.split("`").map((part, i) =>
      i % 2 === 1 ? (
        <span
          key={i}
          style={{
            fontFamily: mono,
            fontSize: "0.86em",
            padding: "0.08em 0.3em",
            borderRadius: 8,
            background: onPanel ? C.panelSoft : C.track,
            color: onPanel ? C.panelText : C.text,
          }}
        >
          {part}
        </span>
      ) : (
        <React.Fragment key={i}>
          {part.split("*").map((bit, j) => (j % 2 === 1 ? <span key={j} style={{ color: C.accent }}>{bit}</span> : <React.Fragment key={j}>{bit}</React.Fragment>))}
        </React.Fragment>
      ),
    )}
  </>
);

// Words of a headline with their emphasis (*word* marks accent words).
const words = (text: string) =>
  text.split("*").flatMap((part, i) => part.split(/\s+/).filter(Boolean).map((w) => ({ w, hot: i % 2 === 1 })));

// Kinetic headline: each word fades in from a blur and rises, one after another.
const KineticWords: React.FC<{ text: string }> = ({ text }) => {
  const at = React.useContext(AppearAt);
  return (
    <>
      {words(text).map((x, i) => (
        <KineticWord key={i} at={at + i * f(TIME.kinetic.wordStep)} hot={x.hot}>
          {x.w}
        </KineticWord>
      ))}
    </>
  );
};

const KineticWord: React.FC<{ at: number; hot: boolean; children: string }> = ({ at, hot, children }) => {
  const p = useEnter(at);
  return (
    <span style={{ display: "inline-block", marginRight: "0.25em", opacity: p, translate: `0px ${(1 - p) * 0.35}em`, filter: p < 1 ? `blur(${(1 - p) * TIME.focus.blur}px)` : undefined, color: hot ? C.accent : undefined }}>
      {children}
    </span>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.accent }) => (
  <div style={{ fontFamily: sans, fontSize: 30, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color }}>
    {children}
  </div>
);

export const Headline: React.FC<{ text: string; size?: number; color?: string }> = ({ text, size = 88, color = C.text }) => (
  <div
    style={{
      fontFamily: display,
      fontSize: size,
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: "-0.03em",
      color,
      textWrap: "balance",
    }}
  >
    {KINETIC && !text.includes("`") ? <KineticWords text={text} /> : <Rich text={text} />}
  </div>
);

export const Body: React.FC<{ text: string; size?: number; color?: string }> = ({ text, size = 40, color = C.muted }) => (
  <div style={{ fontFamily: sans, fontSize: size, fontWeight: 500, color, lineHeight: 1.35 }}>
    <Rich text={text} />
  </div>
);

export const Source: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: sans, fontSize: 24, fontWeight: 500, color: C.muted, marginTop: 14 }}>{BRAND.labels?.source ?? "Source"}: {children}</div>
);

export const Pill: React.FC<{
  children: React.ReactNode;
  tone?: "accent" | "surface" | "light" | "outline";
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, tone = "surface", size = 32, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      fontFamily: sans,
      fontSize: size,
      fontWeight: tone === "accent" ? 700 : 600,
      padding: `${size * 0.42}px ${size * 0.9}px`,
      borderRadius: RADIUS.pill,
      background: tone === "accent" ? C.accent : tone === "surface" || tone === "outline" ? C.surface : C.panelSoft,
      color: tone === "accent" ? C.onAccent : tone === "surface" || tone === "outline" ? C.text : C.panelText,
      border: tone === "outline" ? `3px solid ${C.text}` : undefined,
      boxShadow: tone === "accent" ? `0 0 48px ${C.accent}59` : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chips: React.FC<{ items: string[]; at: number; accent?: string; size?: number }> = ({ items, at, accent, size = 32 }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
    {items.map((c, i) => (
      <Appear key={c} at={at + i * f(TIME.chips.step)} dy={12}>
        <Pill tone={c === accent ? "accent" : "light"} size={size}>
          {c}
        </Pill>
      </Appear>
    ))}
  </div>
);

// Accent outline that switches on at `at` (its click is in the plan).
export const Highlight: React.FC<{ at: number; children: React.ReactNode; radius?: number; style?: React.CSSProperties }> = ({
  at,
  children,
  radius = 14,
  style,
}) => {
  const p = useEnter(at);
  return (
    <div
      style={{
        borderRadius: radius,
        outline: `4px solid ${C.accent}${Math.round(p * 255).toString(16).padStart(2, "0")}`,
        outlineOffset: 4,
        background: `${C.accent}${Math.round(p * 36).toString(16).padStart(2, "0")}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Light UI window, like a framed screenshot. A recreation, never a real screenshot.
export const Panel: React.FC<{ label: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  label,
  children,
  style,
}) => (
  <div
    style={{
      background: C.panel,
      borderRadius: RADIUS.card,
      overflow: "hidden",
      boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
      fontFamily: sans,
      color: C.panelText,
      ...style,
    }}
  >
    <div
      style={{
        padding: "22px 32px",
        borderBottom: `2px solid ${C.panelLine}`,
        fontSize: 26,
        fontWeight: 600,
        color: C.panelMuted,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: C.panelLine }} />
        ))}
      </div>
      {label}
    </div>
    <div style={{ padding: 32 }}>{children}</div>
  </div>
);

// Text that types itself in from `at` (key taps are in the plan).
export const Typed: React.FC<{ text: string; at: number; cps?: number; style?: React.CSSProperties }> = ({
  text,
  at,
  cps = 40,
  style,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - at) / FPS) * cps)));
  return (
    <span style={style}>
      {text.slice(0, n)}
      <span style={{ opacity: 0 }}>{text.slice(n)}</span>
    </span>
  );
};

// "Watch out" card.
export const Note: React.FC<{ at: number; label?: string; text: string }> = ({ at, label = "Watch out", text }) => (
  <Appear at={at}>
    <div style={{ background: C.surface, borderRadius: RADIUS.card, padding: "24px 32px", fontFamily: sans }}>
      <Eyebrow>{label}</Eyebrow>
      <div style={{ fontSize: 38, fontWeight: 500, color: C.text, lineHeight: 1.3, marginTop: 12 }}>
        <Rich text={text} />
      </div>
    </div>
  </Appear>
);

export const Switch: React.FC<{ at: number }> = ({ at }) => {
  const p = useEnter(at, f(TIME.toggle));
  return (
    <div
      style={{
        width: 84,
        height: 46,
        borderRadius: 999,
        background: p > 0.5 ? C.accent : C.panelLine,
        padding: 5,
        display: "flex",
        justifyContent: p > 0.5 ? "flex-end" : "flex-start",
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 18, background: C.panel, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
    </div>
  );
};

export const Checkbox: React.FC<{ at?: number; label: string }> = ({ at = NEVER, label }) => {
  const p = useEnter(at, f(TIME.toggle));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 32, fontWeight: 600, padding: "10px 12px" }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: `3px solid ${p > 0.5 ? C.panelText : C.panelLine}`,
          background: p > 0.5 ? C.panelText : C.panel,
          color: C.panel,
          fontSize: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {p > 0.5 ? "✓" : ""}
      </div>
      {label}
    </div>
  );
};

export { NEVER };
