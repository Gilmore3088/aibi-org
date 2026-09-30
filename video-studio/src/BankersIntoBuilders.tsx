// "Bankers into Builders" — the :60 ad. Same hybrid + cinematic finish as the
// :30: bespoke graphics now, footage-ready for the human beats (portraits,
// confident), narration dropped per beat, cinematic grade on top.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Background } from "./ui";
import { Ad60Scene } from "./ad/visuals60";
import { CinematicOverlay, PushIn } from "./ad/cinematic";
import { FPS, VideoScript } from "./scripted/types";
import { bankersIntoBuildersScript } from "./scripts/bankers-into-builders";

export type BankersProps = { script: VideoScript };

export const bankersFrames = (script: VideoScript): number =>
  Math.round(script.sections.reduce((s, x) => s + x.seconds, 0) * FPS);

export const BankersIntoBuilders: React.FC<BankersProps> = ({
  script = bankersIntoBuildersScript,
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
      {script.sections.map((section, i) => {
        const len = Math.round(section.seconds * FPS);
        const [from, to] = i % 2 === 0 ? [1.0, 1.04] : [1.05, 1.01];
        return (
          <Sequence key={section.id} from={place(len)} durationInFrames={len}>
            {section.audio && <Audio src={staticFile(section.audio)} />}
            <PushIn total={len} from={from} to={to}>
              <Ad60Scene section={section} durationInFrames={len} />
            </PushIn>
          </Sequence>
        );
      })}
      <CinematicOverlay />
    </AbsoluteFill>
  );
};
