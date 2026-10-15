import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { C, sans } from "./brand";
import { Reel, ReelProps } from "./Reel";
import { VIDEOS } from "./videos.generated";

export type SheetProps = ReelProps & { frames?: number[] };

export const SHEET = { cols: 3, thumb: 360, label: 36 };

// Every scene 0.5 s before its end on one image, so a layout check reads one picture, not one per scene.
export const Sheet: React.FC<SheetProps> = ({ videoId, timings, frames }) => {
  const video = VIDEOS.find((v) => v.id === videoId);
  if (!video || !timings || !frames) return null;
  const scale = SHEET.thumb / (video.width ?? 1080);
  const h = Math.round((video.height ?? 1920) * scale);
  return (
    <AbsoluteFill style={{ backgroundColor: "#222", display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start" }}>
      {frames.map((frame, i) => (
        <div key={i} style={{ width: SHEET.thumb, height: h + SHEET.label, position: "relative", overflow: "hidden" }}>
          <div style={{ width: video.width ?? 1080, height: video.height ?? 1920, transform: `scale(${scale})`, transformOrigin: "top left", backgroundColor: C.bg }}>
            <Freeze frame={frame}>
              <Reel videoId={videoId} timings={timings} />
            </Freeze>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: SHEET.label, color: "#fff", fontFamily: sans, fontSize: 18, lineHeight: `${SHEET.label}px`, paddingLeft: 10 }}>
            {video.scenes[i].id} · F {frame}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
