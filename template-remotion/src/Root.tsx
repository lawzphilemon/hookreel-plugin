import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { CalculateMetadataFunction, Composition, staticFile, Still } from "remotion";
import { Cover, CoverProps } from "./Cover";
import { Sheet, SHEET, SheetProps } from "./Sheet";
import { FPS } from "./brand";
import { Reel, ReelProps } from "./Reel";
import { VIDEOS, VO_FILES } from "./videos.generated";
import { estimateSeconds, toTiming } from "./timing";
import { HeardWord, scriptWordTimes } from "./align";

// Recorded clips are listed by scripts/register-videos.mjs (run by `npm run vo` and `npm run dev`).
// Scenes without a clip get an estimated duration, so videos preview before anything is recorded.
const voiceover = async (videoId: string, sceneId: string) => {
  const entry = VO_FILES[`${videoId}/${sceneId}`];
  if (!entry) return null;
  const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(staticFile(entry.src)) });
  const seconds = await input.computeDuration();
  const heard = entry.words ? ((await (await fetch(staticFile(entry.words))).json()) as HeardWord[]) : null;
  return { path: entry.src, seconds, heard };
};

const timingsFor = async (videoId: string) => {
  const reel = VIDEOS.find((v) => v.id === videoId);
  if (!reel) throw new Error(`No video "${videoId}" in videos/. Run npm run register.`);
  const timings = await Promise.all(
    reel.scenes.map(async (scene) => {
      const vo = await voiceover(reel.id, scene.id);
      if (!vo) return toTiming(estimateSeconds(scene.vo), null);
      return toTiming(vo.seconds, vo.path, vo.heard ? scriptWordTimes(scene.vo, vo.heard, vo.seconds) : null);
    }),
  );
  return { reel, timings };
};

const calculateMetadata: CalculateMetadataFunction<ReelProps> = async ({ props }) => {
  const { reel, timings } = await timingsFor(props.videoId);
  return {
    durationInFrames: timings.reduce((sum, t) => sum + t.duration, 0),
    props: { ...props, timings },
    defaultOutName: reel.id,
  };
};

// Contact sheet: every scene 0.5 s before its end, SHEET.cols per row. A composition as long as the
// video (not a one-frame Still), so the frozen scenes inside it are within its timeline.
const sheetMetadata: CalculateMetadataFunction<SheetProps> = async ({ props }) => {
  const { reel, timings } = await timingsFor(props.videoId);
  let start = 0;
  const frames = timings.map((t) => {
    const frame = start + t.duration - Math.round(0.5 * FPS);
    start += t.duration;
    return frame;
  });
  const thumbHeight = Math.round(((reel.height ?? 1920) * SHEET.thumb) / (reel.width ?? 1080));
  return {
    durationInFrames: start,
    width: SHEET.thumb * SHEET.cols,
    height: Math.ceil(frames.length / SHEET.cols) * (thumbHeight + SHEET.label),
    props: { ...props, timings, frames },
  };
};

// One composition per videos/<id>.json (registered by scripts/register-videos.mjs), plus one still
// per cover variant (<id>-cover-1, <id>-cover-2, …) and a contact sheet (<id>-sheet).
export const RemotionRoot: React.FC = () => (
  <>
    {VIDEOS.map((video) => (
      <Composition
        key={`${video.id}-sheet`}
        id={`${video.id}-sheet`}
        component={Sheet}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={1}
        defaultProps={{ videoId: video.id } as SheetProps}
        calculateMetadata={sheetMetadata}
      />
    ))}
    {VIDEOS.flatMap((video) =>
      (video.cover ?? []).map((_, i) => (
        <Still
          key={`${video.id}-cover-${i + 1}`}
          id={`${video.id}-cover-${i + 1}`}
          component={Cover}
          width={video.width ?? 1080}
          height={video.height ?? 1920}
          defaultProps={{ videoId: video.id, index: i } as CoverProps}
        />
      )),
    )}
    {VIDEOS.map((video) => (
      <Composition
        key={video.id}
        id={video.id}
        component={Reel}
        width={video.width ?? 1080}
        height={video.height ?? 1920}
        fps={FPS}
        durationInFrames={30 * FPS}
        defaultProps={{ videoId: video.id } as ReelProps}
        calculateMetadata={calculateMetadata}
      />
    ))}
  </>
);
