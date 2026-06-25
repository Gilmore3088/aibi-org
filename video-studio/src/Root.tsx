// Registers every composition Remotion can render. The studio sidebar and the
// `remotion render` CLI both read this list.
import React from "react";
import { Composition } from "remotion";
import { AssessmentResults, TOTAL_FRAMES } from "./AssessmentResults";
import { sampleResult } from "./data";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AssessmentResults"
        component={AssessmentResults}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        // Default data — overridable via --props=./props.json or the studio panel.
        defaultProps={{ result: sampleResult }}
      />
    </>
  );
};
