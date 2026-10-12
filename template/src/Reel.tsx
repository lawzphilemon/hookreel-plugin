import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Series, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sans } from "./brand";
import { BackgroundMusic } from "./components/music";
import { PlanSfx, SfxLevelContext } from "./components/sfx";
import { Note } from "./components/ui";
import type { SceneSpec, VideoSpec } from "./schema";
import { f, TIME } from "./motion.ts";
import { planShell } from "./plan.ts";
import { captionChunks, charToFrame, LEAD_IN, SceneContext, SceneTiming, usePlanCtx, useScene } from "./timing";
import { BrandMark } from "./visuals/basic";
import { VisualView } from "./visuals";
import { VIDEOS } from "./videos.generated";

export type ReelProps = {
  videoId: string;
  timings?: SceneTiming[];
};

// Safe area for 1080×1920 Reels/TikTok/Shorts: keep content out of the top ~220px, the bottom
// ~420px (caption and buttons) and away from the right-hand action bar.
const SIDE = 80;
const CONTENT_TOP = 330;
const CAPTION_TOP = 1340;

// Eyebrow and logo only: no story-style progress bar.
const Header: React.FC<{ eyebrow: string }> = ({ eyebrow }) => (
  <div style={{ position: "absolute", top: 150, left: SIDE, right: SIDE, fontFamily: sans }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accent }}>
        {eyebrow}
      </div>
      <BrandMark width={150} opacity={0.85} />
    </div>
  </div>
);

const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const chunks = captionChunks(scene.vo);
  const at = (c: { start: number }) => charToFrame(scene, c.start);
  const lead = f(TIME.captionIn) / 2;
  const current = [...chunks].reverse().find((c) => frame >= at(c) - lead);
  if (!current) return null;
  const p = interpolate(frame, [at(current) - lead, at(current) + lead], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: CAPTION_TOP,
        left: SIDE,
        width: 860,
        fontFamily: sans,
        fontSize: 46,
        fontWeight: 600,
        lineHeight: 1.25,
        color: C.text,
        opacity: p,
        textWrap: "balance",
      }}
    >
      {current.text}
    </div>
  );
};

const SceneShell: React.FC<{ scene: SceneSpec; video: VideoSpec; first: boolean; captions: boolean }> = ({ scene, video, first, captions }) => {
  const frame = useCurrentFrame();
  const { duration } = useScene();
  const p = planShell(scene, usePlanCtx(), duration, first);
  const out = interpolate(frame, [p.fadeOut, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <PlanSfx events={p.events} />
      <div style={{ position: "absolute", top: CONTENT_TOP, left: SIDE, right: SIDE, height: CAPTION_TOP - CONTENT_TOP - 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 34, height: "100%" }}>
          <div style={{ flex: scene.note ? undefined : 1, position: "relative" }}>
            <VisualView v={scene.visual} cta={video.cta} />
          </div>
          {scene.note ? <Note at={p.noteAt} label={scene.note.label} text={scene.note.text} /> : null}
        </div>
      </div>
      {captions ? <Caption /> : null}
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({ videoId, timings }) => {
  const video = VIDEOS.find((v) => v.id === videoId);
  const { durationInFrames } = useVideoConfig();
  if (!video || !timings) return null;
  return (
    <SfxLevelContext.Provider value={video.audio?.sfx ?? "medium"}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <Series>
          {video.scenes.map((scene, i) => {
            const t = timings[i];
            return (
              <Series.Sequence key={scene.id} name={scene.id} durationInFrames={t.duration}>
                <SceneContext.Provider value={{ vo: scene.vo, voFrames: t.voFrames, duration: t.duration, words: t.words }}>
                  <SceneShell scene={scene} video={video} first={i === 0} captions={video.captions !== false} />
                  {t.voSrc ? <Audio src={staticFile(t.voSrc)} from={LEAD_IN} /> : null}
                </SceneContext.Provider>
              </Series.Sequence>
            );
          })}
        </Series>
        <Header eyebrow={video.eyebrow} />
        {video.audio?.music && durationInFrames > 0 ? <BackgroundMusic timings={timings} music={video.audio.music} /> : null}
      </AbsoluteFill>
    </SfxLevelContext.Provider>
  );
};
