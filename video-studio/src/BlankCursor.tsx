// "The Blank Cursor" — the :30 ad. No title/CTA wrapper; it opens cold on the
// cursor and ends on the brand mark. Each beat is its own bespoke shot with its
// narration clip dropped inside its window.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./ui";
import { AdScene } from "./ad/visuals";
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
  return (
    <AbsoluteFill>
      <Background />
      {script.sections.map((section) => {
        const len = Math.round(section.seconds * FPS);
        return (
          <Sequence key={section.id} from={place(len)} durationInFrames={len}>
            {section.audio && <Audio src={staticFile(section.audio)} />}
            <AdScene section={section} durationInFrames={len} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
