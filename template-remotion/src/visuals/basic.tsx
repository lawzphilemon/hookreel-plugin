import React from "react";
import { Video } from "@remotion/media";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BRAND, C, display, logoFilter, RADIUS, sans } from "../brand";
import { PlanSfx } from "../components/sfx";
import { Appear, Chips, Eyebrow, Headline, Pill, Rich, Stack, useEnter } from "../components/ui";
import { f, TIME } from "../motion.ts";
import { planCharacter, planCta, planHeadline, planList, planLogo } from "../plan.ts";
import type { CharacterVisual, CtaSpec, CtaVisual, HeadlineVisual, ListVisual, LogoVisual } from "../schema";
import { usePlanCtx, useScene } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const HeadlineScene: React.FC<{ v: HeadlineVisual }> = ({ v }) => {
  const p = planHeadline(v, usePlanCtx());
  return (
    <Stack gap={44}>
      <PlanSfx events={p.events} />
      <Appear at={p.at}>
        {v.eyebrow ? (
          <div style={{ marginBottom: 18 }}>
            <Eyebrow>{v.eyebrow}</Eyebrow>
          </div>
        ) : null}
        <Headline text={v.text} size={v.size ?? 104} />
      </Appear>
      {v.sub ? (
        <Appear at={p.subAt}>
          <div style={{ fontFamily: sans, fontSize: 44, fontWeight: 500, color: C.muted, lineHeight: 1.3 }}>
            <Rich text={v.sub.text} />
          </div>
        </Appear>
      ) : null}
      {v.chips ? <Chips items={v.chips.items} at={p.chipsAt} /> : null}
    </Stack>
  );
};

const StrikeItem: React.FC<{ at: number; struckAt: number; text: string }> = ({ at, struckAt, text }) => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [struckAt, struckAt + f(TIME.list.strike)], [0, 1], clamp);
  return (
    <Appear at={at} dy={12}>
      <div style={{ position: "relative", display: "inline-block", opacity: 1 - 0.55 * strike }}>
        <Pill size={40}>
          <Rich text={text} />
        </Pill>
        <div style={{ position: "absolute", left: 16, top: "50%", height: 5, width: `calc(${strike * 100}% - 32px)`, background: C.errorText, borderRadius: 3 }} />
      </div>
    </Appear>
  );
};

export const List: React.FC<{ v: ListVisual }> = ({ v }) => {
  const p = planList(v, usePlanCtx());
  return (
    <Stack gap={36}>
      <PlanSfx events={p.events} />
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
      <div style={{ display: "flex", flexDirection: "column", gap: v.style === "strike" ? 18 : 24, alignItems: "flex-start" }}>
        {v.style === "pills" ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            {v.items.map((it, i) => (
              <Appear key={i} at={p.items[i]} dy={16}>
                <Pill tone={i % 2 === 0 ? "accent" : "outline"} size={44}>
                  <Rich text={it.text} />
                </Pill>
              </Appear>
            ))}
          </div>
        ) : null}
        {v.style === "pills" ? null : v.items.map((it, i) =>
          v.style === "strike" ? (
            <StrikeItem key={i} at={p.items[i]} struckAt={p.strikeAt + i * f(TIME.list.strikeStep)} text={it.text} />
          ) : (
            <Appear key={i} at={p.items[i]} dy={16}>
              <div style={{ display: "flex", gap: 22, alignItems: "baseline", fontFamily: sans, fontSize: v.style === "dash" ? 48 : 40, fontWeight: v.style === "dash" ? 600 : 500, color: C.text, lineHeight: 1.25 }}>
                <span style={{ color: C.accent, fontWeight: 700 }}>{v.style === "dash" ? "—" : "✓"}</span>
                <span>
                  <Rich text={it.text} />
                </span>
              </div>
            </Appear>
          ),
        )}
      </div>
      {v.answer ? (
        <Appear at={p.answerAt}>
          <Pill tone="accent" size={56}>
            {v.answer.text}
          </Pill>
        </Appear>
      ) : null}
    </Stack>
  );
};

export const BrandMark: React.FC<{ width: number; opacity?: number }> = ({ width, opacity = 1 }) =>
  BRAND.logo ? (
    <Img src={staticFile(BRAND.logo)} style={{ width, filter: logoFilter, opacity }} />
  ) : (
    <div style={{ fontFamily: display, fontSize: width / 6, fontWeight: 800, color: C.text, opacity, letterSpacing: "-0.02em" }}>{BRAND.name}</div>
  );

export const Logo: React.FC<{ v: LogoVisual }> = ({ v }) => {
  const p = planLogo(v, usePlanCtx());
  return (
    <Stack gap={60} style={{ alignItems: "flex-start" }}>
      <PlanSfx events={p.events} />
      <Appear>
        <BrandMark width={460} />
      </Appear>
      <Appear at={p.at}>
        <Headline text={v.headline} size={92} />
      </Appear>
      {v.chip ? (
        <Appear at={p.chipAt}>
          <Pill tone="light" size={34}>
            {v.chip}
          </Pill>
        </Appear>
      ) : null}
    </Stack>
  );
};

// Closing card: what they get, and the one action to take.
export const Cta: React.FC<{ v: CtaVisual; cta?: CtaSpec }> = ({ v, cta }) => {
  const p = planCta(v, usePlanCtx(), Boolean(cta));
  return (
    <Stack gap={32}>
      <PlanSfx events={p.events} />
      <Appear>
        <Headline text={v.headline} size={92} />
      </Appear>
      {cta ? (
        <Appear at={p.at}>
          <div style={{ background: C.surface, borderRadius: RADIUS.card, padding: 36, display: "flex", flexDirection: "column", gap: 24 }}>
            {cta.kicker ? <div style={{ fontFamily: sans, fontSize: 28, fontWeight: 600, color: C.muted }}>{cta.kicker}</div> : null}
            <Headline text={cta.title} size={56} />
            {cta.chips?.length ? (
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {cta.chips.map((c) => (
                  <Pill key={c} tone="light" size={28}>
                    {c}
                  </Pill>
                ))}
              </div>
            ) : null}
            <div>
              <Pill tone="accent" size={40}>
                {cta.button}
              </Pill>
            </div>
            {cta.sub ? <div style={{ fontFamily: sans, fontSize: 32, fontWeight: 500, color: C.text }}>{cta.sub}</div> : null}
          </div>
        </Appear>
      ) : null}
      {v.footer ? (
        <Appear at={p.footerAt}>
          <div style={{ fontFamily: sans, fontSize: 38, fontWeight: 600, color: C.muted }}>{v.footer}</div>
        </Appear>
      ) : null}
    </Stack>
  );
};

// An image, or a muted looping clip, from public/.
const Media: React.FC<{ src: string; fit: "contain" | "cover"; style?: React.CSSProperties }> = ({ src, fit, style }) =>
  /\.(mp4|webm|mov)$/i.test(src) ? (
    <Video src={staticFile(src)} muted loop objectFit={fit} style={{ width: "100%", height: "100%", ...style }} />
  ) : (
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: fit, ...style }} />
  );

const Bubble: React.FC<{ at: number; text: string }> = ({ at, text }) => (
  <Appear at={at} dy={16} style={{ alignSelf: "flex-start", maxWidth: 820 }}>
    <div style={{ position: "relative", background: C.panel, color: C.panelText, borderRadius: RADIUS.card, padding: "26px 34px", fontFamily: sans, fontSize: 46, fontWeight: 700, lineHeight: 1.2 }}>
      <Rich text={text} onPanel />
      <div style={{ position: "absolute", left: 70, bottom: -22, width: 0, height: 0, borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: `24px solid ${C.panel}` }} />
    </div>
  </Appear>
);

// Character (AI 3D cartoon, mascot, illustration). Card: stands in the content area and floats.
// Full: fills the whole 1080×1920 frame behind header and captions, with scrims so both stay readable.
export const Character: React.FC<{ v: CharacterVisual }> = ({ v }) => {
  const p = planCharacter(v, usePlanCtx());
  const frame = useCurrentFrame();
  const { duration } = useScene();
  const fade = useEnter(p.at);
  if (v.layout === "full") {
    const push = 1 + (TIME.character.push * frame) / Math.max(1, duration);
    return (
      <div style={{ position: "relative", height: "100%" }}>
        <PlanSfx events={p.events} />
        {/* The content area starts at x 80, y 330 (see Reel.tsx); step out of it to cover the frame. */}
        <div style={{ position: "absolute", left: -80, top: -330, width: 1080, height: 1920, overflow: "hidden", opacity: fade }}>
          <Media src={v.src} fit="cover" style={{ scale: String(push) }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${C.bg}e6 0%, ${C.bg}00 24%, ${C.bg}00 58%, ${C.bg}f2 82%)` }} />
        </div>
        <Stack gap={36} style={{ position: "relative" }}>
          {v.headline ? (
            <Appear>
              <div style={{ textShadow: `0 4px 24px ${C.bg}` }}>
                <Headline text={v.headline} size={92} />
              </div>
            </Appear>
          ) : null}
          {v.bubble ? <Bubble at={p.bubbleAt} text={v.bubble.text} /> : null}
          {v.chips ? <Chips items={v.chips.items} at={p.chipsAt} /> : null}
        </Stack>
      </div>
    );
  }
  return (
    <Stack gap={36} style={{ height: "100%" }}>
      <PlanSfx events={p.events} />
      {v.headline ? (
        <Appear>
          <Headline text={v.headline} size={88} />
        </Appear>
      ) : null}
      {v.bubble ? <Bubble at={p.bubbleAt} text={v.bubble.text} /> : null}
      {/* Absolute media takes only the height left over, so chips stay inside the safe area. */}
      <Appear at={p.at} amp={TIME.float.characterAmp} style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Media src={v.src} fit="contain" style={{ position: "absolute", inset: 0 }} />
      </Appear>
      {v.chips ? <Chips items={v.chips.items} at={p.chipsAt} /> : null}
    </Stack>
  );
};
