import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BRAND, C, logoFilter, RADIUS, sans } from "../brand";
import { Sfx } from "../components/sfx";
import { Appear, Chips, Eyebrow, Headline, Pill, Rich, Stack } from "../components/ui";
import type { CtaSpec, CtaVisual, HeadlineVisual, ListVisual, LogoVisual } from "../schema";
import { useCueFn } from "../timing";

export const HeadlineScene: React.FC<{ v: HeadlineVisual }> = ({ v }) => {
  const cue = useCueFn();
  const at = cue(v.cue, 0);
  return (
    <Stack gap={44}>
      <Appear at={at}>
        {v.eyebrow ? (
          <div style={{ marginBottom: 18 }}>
            <Eyebrow>{v.eyebrow}</Eyebrow>
          </div>
        ) : null}
        <Headline text={v.text} size={v.size ?? 104} />
      </Appear>
      {v.sub ? (
        <Appear at={cue(v.sub.cue, at + 12)}>
          <div style={{ fontFamily: sans, fontSize: 44, fontWeight: 500, color: C.muted, lineHeight: 1.3 }}>
            <Rich text={v.sub.text} />
          </div>
        </Appear>
      ) : null}
      {v.chips ? <Chips items={v.chips.items} at={cue(v.chips.cue, at + 20)} /> : null}
    </Stack>
  );
};

const StrikeItem: React.FC<{ at: number; struckAt: number; text: string }> = ({ at, struckAt, text }) => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [struckAt, struckAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Appear at={at} dy={12}>
      <Sfx name="tick" at={at} />
      <div style={{ position: "relative", display: "inline-block", opacity: 1 - 0.55 * strike }}>
        <Pill size={40}>
          <Rich text={text} />
        </Pill>
        <div
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            height: 5,
            width: `calc(${strike * 100}% - 32px)`,
            background: C.errorText,
            borderRadius: 3,
          }}
        />
      </div>
    </Appear>
  );
};

export const List: React.FC<{ v: ListVisual }> = ({ v }) => {
  const cue = useCueFn();
  const ats = v.items.map((it, i) => cue(it.cue, 10 + i * 6));
  const strikeAt = cue(v.strikeCue, 1e9);
  return (
    <Stack gap={36}>
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
        {v.items.map((it, i) =>
          v.style === "strike" ? (
            <StrikeItem key={i} at={ats[i]} struckAt={strikeAt + i * 4} text={it.text} />
          ) : (
            <Appear key={i} at={ats[i]} dy={16}>
              <Sfx name="tick" at={ats[i]} />
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
        <Appear at={cue(v.answer.cue, strikeAt + 20)}>
          <Sfx name="pop" at={cue(v.answer.cue, strikeAt + 20)} />
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
    <div style={{ fontFamily: sans, fontSize: width / 6, fontWeight: 800, color: C.text, opacity, letterSpacing: "-0.02em" }}>
      {BRAND.name}
    </div>
  );

export const Logo: React.FC<{ v: LogoVisual }> = ({ v }) => {
  const cue = useCueFn();
  const at = cue(v.cue, 12);
  return (
    <Stack gap={60} style={{ alignItems: "flex-start" }}>
      <Appear>
        <BrandMark width={460} />
      </Appear>
      <Appear at={at}>
        <Sfx name="pop" at={at} />
        <Headline text={v.headline} size={92} />
      </Appear>
      {v.chip ? (
        <Appear at={at + 16}>
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
  const cue = useCueFn();
  const at = cue(v.cue, 30);
  return (
    <Stack gap={32}>
      <Appear>
        <Headline text={v.headline} size={92} />
      </Appear>
      {cta ? (
        <>
          <Sfx name="riser" at={Math.max(0, at - 36)} />
          <Appear at={at}>
            {/* Lighter than elsewhere: this lands on top of the voice, the riser and the music. */}
            <Sfx name="impact" at={at} volume={0.22} />
            <Sfx name="ding" at={at} volume={0.28} />
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
        </>
      ) : null}
      {v.footer ? (
        <Appear at={cue(v.footerCue, at + 30)}>
          <div style={{ fontFamily: sans, fontSize: 38, fontWeight: 600, color: C.muted }}>{v.footer}</div>
        </Appear>
      ) : null}
    </Stack>
  );
};
