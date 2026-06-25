// Registers every composition Remotion can render. The studio sidebar and the
// `remotion render` CLI both read this list.
import React from "react";
import { Composition } from "remotion";
import { AssessmentResults, TOTAL_FRAMES } from "./AssessmentResults";
import { sampleResult } from "./data";
import { ScriptedExplainer } from "./ScriptedExplainer";
import { AiReadyExplainer } from "./AiReadyExplainer";
import { safeAiUseScript } from "./scripts/safe-ai-use";
import { whatsAiReadyScript } from "./scripts/whats-ai-ready";
import { totalFrames } from "./scripted/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Video 1 — data-driven assessment results. */}
      <Composition
        id="AssessmentResults"
        component={AssessmentResults}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ result: sampleResult }}
      />

      {/* Video 2 — caption-style script engine (kept as a reference). */}
      <Composition
        id="ScriptedExplainer"
        component={ScriptedExplainer}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ script: safeAiUseScript }}
        calculateMetadata={({ props }) => ({
          durationInFrames: totalFrames(props.script ?? safeAiUseScript),
        })}
      />

      {/* Video 3 — voice-first, visual-first explainer. The voice explains;
          the screen shows. This is the current approach. */}
      <Composition
        id="AiReadyExplainer"
        component={AiReadyExplainer}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ script: whatsAiReadyScript }}
        calculateMetadata={({ props }) => ({
          durationInFrames: totalFrames(props.script ?? whatsAiReadyScript),
        })}
      />
    </>
  );
};
