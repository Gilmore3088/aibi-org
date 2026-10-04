// "The Blank Cursor" — the :30 ad. No title/CTA wrapper; it opens cold on the
// cursor and ends on the brand mark. Each beat is its own bespoke shot with its
// narration clip dropped inside its window.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./ui";
import { AdScene } from "./ad/visuals";
import { CinematicOverlay, PushIn } from "./ad/cinematic";
import { FPS, VideoScript } from "./scripted/types";
import { blankCursorScript } from "./scripts/blank-cursor";

export type BlankCursorProps = { script: VideoScript };

export const adFrames = (script: VideoScript): number =>
  Math.round(script.sections.reduce((s, x) => s + x.seconds, 0) * FPS);

export const BlankCursor: React.FC<BlankCursorProps> = ({
  script = blankCursorScript,
}) => {
  let at = 0;
  const place = (len: number) => {
    const from = at;
    at += len;
    return from;
  };
  // Alternate the camera push direction per beat so cuts feel intentional.
  return (
    <AbsoluteFill>
      <Background />
      {script.sections.map((section, i) => {
        const len = Math.round(section.seconds * FPS);
        const [from, to] = i % 2 === 0 ? [1.0, 1.05] : [1.06, 1.01];
        return (
          <Sequence key={section.id} from={place(len)} durationInFrames={len}>
            {section.audio && <Audio src={staticFile(section.audio)} />}
            <PushIn total={len} from={from} to={to}>
              <AdScene section={section} durationInFrames={len} />
            </PushIn>
          </Sequence>
        );
      })}
      <CinematicOverlay />
    </AbsoluteFill>
  );
};
