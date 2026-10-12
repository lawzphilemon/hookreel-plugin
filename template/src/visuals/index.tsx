import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { CtaSpec, SwapVisual, Visual } from "../schema";
import { useCueFn } from "../timing";
import { Cta, HeadlineScene, List, Logo } from "./basic";
import { Bars, Ranking, Stat, Tiles, Timeline } from "./data";
import { Flow, Journey } from "./flow";
import { Chat, Ui } from "./mock";

// First visual, then a crossfade to the second when the narration reaches `at`.
const Swap: React.FC<{ v: SwapVisual; cta?: CtaSpec }> = ({ v, cta }) => {
  const cue = useCueFn();
  const frame = useCurrentFrame();
  const at = cue(v.at);
  const out = interpolate(frame, [at - 10, at - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", height: "100%" }}>
      {/* Each half is only mounted while it is on screen, so its sounds don't play while hidden. */}
      {frame < at ? (
        <div style={{ position: "absolute", inset: 0, opacity: out }}>
          <VisualView v={v.first} cta={cta} />
        </div>
      ) : null}
      {frame >= at - 2 ? (
        <div style={{ position: "absolute", inset: 0 }}>
          <VisualView v={v.second} cta={cta} />
        </div>
      ) : null}
    </div>
  );
};

export const VisualView: React.FC<{ v: Visual; cta?: CtaSpec }> = ({ v, cta }) => {
  switch (v.type) {
    case "headline":
      return <HeadlineScene v={v} />;
    case "stat":
      return <Stat v={v} />;
    case "ranking":
      return <Ranking v={v} />;
    case "tiles":
      return <Tiles v={v} />;
    case "timeline":
      return <Timeline v={v} />;
    case "bars":
      return <Bars v={v} />;
    case "flow":
      return <Flow v={v} />;
    case "chat":
      return <Chat v={v} />;
    case "journey":
      return <Journey v={v} />;
    case "ui":
      return <Ui v={v} />;
    case "list":
      return <List v={v} />;
    case "logo":
      return <Logo v={v} />;
    case "swap":
      return <Swap v={v} cta={cta} />;
    case "cta":
      return <Cta v={v} cta={cta} />;
  }
};
