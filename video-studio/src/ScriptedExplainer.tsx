// The engine. Give it a VideoScript and it lays the title, every section, and
// the CTA onto the timeline — durations come straight from the script's
// `seconds` fields. Optionally plays a narration track under the whole thing.

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./ui";
import { CtaScene, SectionScene, TitleScene } from "./scripted/scenes";
import { CTA_SECONDS, FPS, TITLE_SECONDS, VideoScript } from "./scripted/types";
import { safeAiUseScript } from "./scripts/safe-ai-use";

// `type` (not `interface`) so it satisfies Remotion's Record<string, unknown>.
export type ScriptedExplainerProps = {
  script: VideoScript;
};

export const ScriptedExplainer: React.FC<ScriptedExplainerProps> = ({
  script = safeAiUseScript,
}) => {
  const titleFrames = Math.round(TITLE_SECONDS * FPS);
  const ctaFrames = Math.round(CTA_SECONDS * FPS);

  // Running offset so each block starts when the previous ends.
  let at = 0;
  const place = (len: number) => {
    const from = at;
    at += len;
    return from;
  };

  return (
    <AbsoluteFill>
      <Background />

      {/* Optional full-length voiceover track (alternative to per-section). */}
      {script.voiceover && <Audio src={staticFile(script.voiceover)} />}

      <Sequence from={place(titleFrames)} durationInFrames={titleFrames}>
        <TitleScene script={script} durationInFrames={titleFrames} />
      </Sequence>

      {script.sections.map((section) => {
        const len = Math.round(section.seconds * FPS);
        return (
          <Sequence
            key={section.id}
            from={place(len)}
            durationInFrames={len}
          >
            {/* Per-section narration: lives inside the section's window, so the
                spoken audio and the kinetic captions are always in sync. */}
            {section.audio && <Audio src={staticFile(section.audio)} />}
            <SectionScene section={section} durationInFrames={len} />
          </Sequence>
        );
      })}

      <Sequence from={place(ctaFrames)} durationInFrames={ctaFrames}>
        <CtaScene script={script} durationInFrames={ctaFrames} />
      </Sequence>
    </AbsoluteFill>
  );
};
