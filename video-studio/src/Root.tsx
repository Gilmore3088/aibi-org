// Registers every composition Remotion can render. The studio sidebar and the
// `remotion render` CLI both read this list.
import React from "react";
import { Composition } from "remotion";
import { AssessmentResults, TOTAL_FRAMES } from "./AssessmentResults";
import { sampleResult } from "./data";
import { ScriptedExplainer } from "./ScriptedExplainer";
import { safeAiUseScript } from "./scripts/safe-ai-use";
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

      {/* Video 2 — script-driven explainer. The timeline length is computed
          from the script, so a longer/shorter script just works. */}
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
    </>
  );
};
