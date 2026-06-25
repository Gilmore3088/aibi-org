// Voice-first explainer composition. The narrator carries the explanation; each
// section SHOWS its idea via an animated visual. On-screen text stays minimal.
// Per-section audio (when generated) lives inside each scene's window, so the
// voice and the visuals are always in sync.

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./ui";
import { TitleScene, CtaScene } from "./scripted/scenes";
import { VisualScene } from "./scripted/visuals";
import { CTA_SECONDS, FPS, TITLE_SECONDS, VideoScript } from "./scripted/types";
import { whatsAiReadyScript } from "./scripts/whats-ai-ready";

export type AiReadyExplainerProps = {
  script: VideoScript;
};

export const AiReadyExplainer: React.FC<AiReadyExplainerProps> = ({
  script = whatsAiReadyScript,
}) => {
  const titleFrames = Math.round(TITLE_SECONDS * FPS);
  const ctaFrames = Math.round(CTA_SECONDS * FPS);

  let at = 0;
  const place = (len: number) => {
    const from = at;
    at += len;
    return from;
  };

  return (
    <AbsoluteFill>
      <Background />

      <Sequence from={place(titleFrames)} durationInFrames={titleFrames}>
        <TitleScene script={script} durationInFrames={titleFrames} />
      </Sequence>

      {script.sections.map((section) => {
        const len = Math.round(section.seconds * FPS);
        return (
          <Sequence key={section.id} from={place(len)} durationInFrames={len}>
            {section.audio && <Audio src={staticFile(section.audio)} />}
            <VisualScene section={section} durationInFrames={len} />
          </Sequence>
        );
      })}

      <Sequence from={place(ctaFrames)} durationInFrames={ctaFrames}>
        <CtaScene script={script} durationInFrames={ctaFrames} />
      </Sequence>
    </AbsoluteFill>
  );
};
