import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { CalculateMetadataFunction, Composition, staticFile, Still } from "remotion";
import { Cover, CoverProps } from "./Cover";
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

const calculateMetadata: CalculateMetadataFunction<ReelProps> = async ({ props }) => {
  const reel = VIDEOS.find((v) => v.id === props.videoId);
  if (!reel) throw new Error(`No video "${props.videoId}" in videos/. Run npm run register.`);
  const timings = await Promise.all(
    reel.scenes.map(async (scene) => {
      const vo = await voiceover(reel.id, scene.id);
      if (!vo) return toTiming(estimateSeconds(scene.vo), null);
      return toTiming(vo.seconds, vo.path, vo.heard ? scriptWordTimes(scene.vo, vo.heard, vo.seconds) : null);
    }),
  );
  return {
    durationInFrames: timings.reduce((sum, t) => sum + t.duration, 0),
    props: { ...props, timings },
    defaultOutName: reel.id,
  };
};

// One composition per videos/<id>.json (registered by scripts/register-videos.mjs), plus one still
// per cover variant: <id>-cover-1, <id>-cover-2, …
export const RemotionRoot: React.FC = () => (
  <>
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
