import React from "react";
import { AbsoluteFill } from "remotion";
import { C, display } from "./brand";
import { BrandMark } from "./visuals/basic";
import { Body, Eyebrow, Rich, Source } from "./components/ui";
import { VIDEOS } from "./videos.generated";

export type CoverProps = { videoId: string; index: number };

// Instagram's profile grid crops a Reel cover to the centre 1080×1440 (240px off the top and bottom),
// and its buttons cover the lower part of the full cover, so everything that matters sits in y 420–1500.
const TOP = 420;
const BOTTOM = 1500;
const SIDE = 80;

// "ke-7" must not break at its hyphen: use a non-breaking hyphen inside words.
const keep = (text: string) => text.replace(/(\w)-(\w)/g, "$1‑$2");

// Static on purpose: a still renders one frame, so nothing here animates in. Only the logo sits up top
// (the eyebrow would repeat the kicker); it is outside the grid crop, like the video's header.
export const Cover: React.FC<CoverProps> = ({ videoId, index }) => {
  const video = VIDEOS.find((v) => v.id === videoId);
  const cover = video?.cover?.[index];
  if (!video || !cover) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ position: "absolute", top: 150, right: SIDE }}>
        <BrandMark width={150} opacity={0.85} />
      </div>
      <div style={{ position: "absolute", top: TOP, height: BOTTOM - TOP, left: SIDE, right: SIDE, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
        {cover.kicker ? <Eyebrow>{cover.kicker}</Eyebrow> : null}
        <div style={{ fontFamily: display, fontSize: 120, fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.03em", color: C.text, textWrap: "balance" }}>
          <Rich text={keep(cover.headline)} />
        </div>
        {cover.big ? (
          <div style={{ fontFamily: display, fontSize: 176, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: C.accent, whiteSpace: "nowrap" }}>{keep(cover.big)}</div>
        ) : null}
        {cover.sub ? <Body text={keep(cover.sub)} size={48} /> : null}
        {cover.source ? <Source>{cover.source}</Source> : null}
      </div>
    </AbsoluteFill>
  );
};
