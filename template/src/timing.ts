// React side of the time model: the current scene's context and the cue hook.
import { createContext, useContext } from "react";
import { ENTER } from "./brand";
import { makeCue, type SceneCtx } from "./cue.ts";
import type { PlanCtx } from "./plan.ts";

export { captionChunks, charToFrame, LEAD_IN, TAIL, estimateSeconds, toTiming, type SceneTiming } from "./cue.ts";

export const SceneContext = createContext<SceneCtx>({ vo: "", voFrames: 0, duration: 0, words: null });
export const useScene = () => useContext(SceneContext);

// One hook call, then resolve any number of optional cues: `cue(phrase, fallbackFrame)`.
export const useCueFn = () => makeCue(useScene());

// What every planner needs: the cue resolver and the brand's entrance length.
export const usePlanCtx = (): PlanCtx => ({ cue: useCueFn(), enter: ENTER });
