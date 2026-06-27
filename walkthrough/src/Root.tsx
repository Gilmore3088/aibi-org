import React from "react";
import { Composition } from "remotion";
import { SiteWalkthrough, totalFrames } from "./Walkthrough";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SiteWalkthrough"
    component={SiteWalkthrough}
    durationInFrames={totalFrames()}
    fps={30}
    width={1920}
    height={1080}
  />
);
