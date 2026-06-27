import React from "react";
import { Composition } from "remotion";
import { SiteWalkthrough, totalFrames } from "./Walkthrough";
import { AssessmentAd, assessmentAdFrames } from "./AssessmentAd";
import { CrossOutV2, crossOutFrames } from "./CrossOutV2";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CrossOutV2"
      component={CrossOutV2}
      durationInFrames={crossOutFrames}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="AssessmentAd"
      component={AssessmentAd}
      durationInFrames={assessmentAdFrames()}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="SiteWalkthrough"
      component={SiteWalkthrough}
      durationInFrames={totalFrames()}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
