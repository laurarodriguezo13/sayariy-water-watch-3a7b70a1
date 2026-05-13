import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { SceneIntro } from "./scenes/SceneIntro";
import { ScenePillars } from "./scenes/ScenePillars";
import { SceneDashboard } from "./scenes/SceneDashboard";
import { SceneImpact } from "./scenes/SceneImpact";
import { SceneOutro } from "./scenes/SceneOutro";

export const FPS = 30;

// Scene durations
const D_INTRO = 150;
const D_PILLARS = 130;
const D_DASH = 140;
const D_IMPACT = 130;
const D_OUTRO = 130;
const T = 18; // transition overlap frames (4 transitions)

export const DURATION = D_INTRO + D_PILLARS + D_DASH + D_IMPACT + D_OUTRO - 4 * T;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D_INTRO}><SceneIntro /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={D_PILLARS}><ScenePillars /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={D_DASH}><SceneDashboard /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={D_IMPACT}><SceneImpact /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={D_OUTRO}><SceneOutro /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
