// Scenes for the scripted engine: a title card, a generic per-section scene
// (which adapts its look to the section's `kind`/`zone`), and a CTA outro.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand, fonts } from "../brand";
import { Wordmark } from "../ui";
import { ScriptSection, VideoScript } from "./types";
import { KineticCaptions, Kicker, ZoneWatermark, zoneColor } from "./components";

const fade = (frame: number, total: number, inF = 12, outF = 14) =>
  interpolate(frame, [0, inF, total - outF, total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ── Title card ────────────────────────────────────────────────────────────
export const TitleScene: React.FC<{
  script: VideoScript;
  durationInFrames: number;
}> = ({ script, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 } });
  const underline = interpolate(frame, [18, 46], [0, 420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, durationInFrames),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div style={{ opacity: rise }}>
        <Wordmark size={38} />
      </div>
      <div
        style={{
          transform: `translateY(${interpolate(rise, [0, 1], [40, 0])}px)`,
          fontFamily: fonts.serif,
          fontSize: 96,
          color: brand.cream,
          textAlign: "center",
          lineHeight: 1.04,
          maxWidth: 1400,
        }}
      >
        {script.title}
      </div>
      <div style={{ height: 3, width: underline, background: brand.gold }} />
      {script.subtitle && (
        <div
          style={{
            opacity: interpolate(frame, [24, 42], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            fontFamily: fonts.sans,
            fontSize: 32,
            letterSpacing: 1,
            color: brand.goldSoft,
          }}
        >
          {script.subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── One section ───────────────────────────────────────────────────────────
export const SectionScene: React.FC<{
  section: ScriptSection;
  durationInFrames: number;
}> = ({ section, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = zoneColor(section.zone);
  const isHook = section.kind === "hook";

  const rise = spring({ frame, fps, config: { damping: 200 } });
  // Captions start after the headline settles, and reveal over ~65% of the scene.
  const captionStart = section.headline ? 16 : 6;
  const revealFrames = Math.round(durationInFrames * 0.6);

  return (
    <AbsoluteFill style={{ opacity: fade(frame, durationInFrames) }}>
      <ZoneWatermark zone={section.zone} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 26,
          padding: "0 160px",
        }}
      >
        {section.kicker && (
          <div style={{ opacity: rise }}>
            <Kicker text={section.kicker} color={accent} />
          </div>
        )}

        {section.headline && (
          <div
            style={{
              transform: `translateY(${interpolate(rise, [0, 1], [28, 0])}px)`,
              fontFamily: fonts.serif,
              fontSize: 78,
              color: brand.cream,
              textAlign: "center",
              lineHeight: 1.06,
              maxWidth: 1500,
            }}
          >
            {section.headline}
          </div>
        )}

        <KineticCaptions
          text={section.narration}
          startAt={captionStart}
          revealFrames={revealFrames}
          fontSize={isHook ? 58 : 44}
          color={isHook ? brand.cream : `${brand.cream}e6`}
          maxWidth={isHook ? 1500 : 1400}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── CTA outro ─────────────────────────────────────────────────────────────
export const CtaScene: React.FC<{
  script: VideoScript;
  durationInFrames: number;
}> = ({ script, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 } });
  const underline = interpolate(frame, [22, 52], [0, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, durationInFrames),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div style={{ opacity: rise }}>
        <Wordmark size={40} />
      </div>
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 24,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: brand.goldSoft,
          marginTop: 8,
        }}
      >
        {script.resource.kicker}
      </div>
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: 66,
          color: brand.cream,
          textAlign: "center",
          maxWidth: 1300,
          lineHeight: 1.06,
        }}
      >
        {script.resource.name}
      </div>
      <div style={{ height: 3, width: underline, background: brand.gold }} />
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 30,
          color: brand.goldSoft,
          letterSpacing: 1,
        }}
      >
        {script.resource.url}
      </div>
    </AbsoluteFill>
  );
};
