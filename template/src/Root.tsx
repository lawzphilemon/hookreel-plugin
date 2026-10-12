import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { FPS } from "./brand";
import { Reel, ReelProps } from "./Reel";
import { VIDEOS } from "./videos.generated";
import { estimateSeconds, toTiming } from "./timing";
import { HeardWord, scriptWordTimes } from "./align";

const VO_EXTENSIONS = ["wav", "mp3", "m4a"];

// Looks for public/vo/<reel>/<scene>.(wav|mp3|m4a). Missing files fall back to an
// estimated duration, so the reels preview fine before anything is recorded.
const findVoiceover = async (reelId: string, sceneId: string) => {
  for (const ext of VO_EXTENSIONS) {
    const path = `vo/${reelId}/${sceneId}.${ext}`;
    try {
      const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(staticFile(path)) });
      const seconds = await input.computeDuration();
      return { path, seconds };
    } catch {
      // not recorded yet, or not this extension
    }
  }
  return null;
};

// Word timestamps written by scripts/prepare-vo.mjs, next to each clip.
const findWords = async (reelId: string, sceneId: string): Promise<HeardWord[] | null> => {
  try {
    const res = await fetch(staticFile(`vo/${reelId}/${sceneId}.words.json`));
    return res.ok ? ((await res.json()) as HeardWord[]) : null;
  } catch {
    return null;
  }
};

const calculateMetadata: CalculateMetadataFunction<ReelProps> = async ({ props }) => {
  const reel = VIDEOS.find((v) => v.id === props.videoId);
  if (!reel) throw new Error(`No video "${props.videoId}" in videos/. Run npm run register.`);
  const timings = await Promise.all(
    reel.scenes.map(async (scene) => {
      const vo = await findVoiceover(reel.id, scene.id);
      if (!vo) return toTiming(estimateSeconds(scene.vo), null);
      const heard = await findWords(reel.id, scene.id);
      return toTiming(vo.seconds, vo.path, heard ? scriptWordTimes(scene.vo, heard, vo.seconds) : null);
    }),
  );
  return {
    durationInFrames: timings.reduce((sum, t) => sum + t.duration, 0),
    props: { ...props, timings },
    defaultOutName: reel.id,
  };
};

// One composition per videos/<id>.json (registered by scripts/register-videos.mjs).
export const RemotionRoot: React.FC = () => (
  <>
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
