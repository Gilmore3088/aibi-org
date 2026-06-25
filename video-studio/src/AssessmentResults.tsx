// The top-level composition: it lays out the five scenes on the timeline with
// <Sequence>, over a shared <Background>. Change the scene durations here and
// the whole video re-times itself.

import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "./ui";
import {
  IntroScene,
  OverallScene,
  DimensionsScene,
  HighlightsScene,
  OutroScene,
} from "./scenes";
import { AssessmentResult, sampleResult } from "./data";

// Scene lengths in frames (the comp runs at 30fps → 30 frames = 1 second).
export const SCENES = {
  intro: 90, // 3.0s
  overall: 150, // 5.0s
  dimensions: 450, // 15.0s — the bars need room to stagger in and breathe
  highlights: 120, // 4.0s
  outro: 90, // 3.0s
} as const;

export const TOTAL_FRAMES =
  SCENES.intro +
  SCENES.overall +
  SCENES.dimensions +
  SCENES.highlights +
  SCENES.outro;

// Props let you swap the data without touching code (props.json / studio panel).
export interface AssessmentResultsProps {
  result: AssessmentResult;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  result = sampleResult,
}) => {
  // Running offset so each scene starts when the previous one ends.
  let at = 0;
  const next = (len: number) => {
    const from = at;
    at += len;
    return from;
  };

  return (
    <AbsoluteFill>
      <Background />

      <Sequence from={next(SCENES.intro)} durationInFrames={SCENES.intro}>
        <IntroScene result={result} durationInFrames={SCENES.intro} />
      </Sequence>

      <Sequence from={next(SCENES.overall)} durationInFrames={SCENES.overall}>
        <OverallScene result={result} durationInFrames={SCENES.overall} />
      </Sequence>

      <Sequence
        from={next(SCENES.dimensions)}
        durationInFrames={SCENES.dimensions}
      >
        <DimensionsScene result={result} durationInFrames={SCENES.dimensions} />
      </Sequence>

      <Sequence
        from={next(SCENES.highlights)}
        durationInFrames={SCENES.highlights}
      >
        <HighlightsScene result={result} durationInFrames={SCENES.highlights} />
      </Sequence>

      <Sequence from={next(SCENES.outro)} durationInFrames={SCENES.outro}>
        <OutroScene durationInFrames={SCENES.outro} />
      </Sequence>
    </AbsoluteFill>
  );
};
