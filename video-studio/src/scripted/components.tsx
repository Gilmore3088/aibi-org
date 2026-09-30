// Reusable pieces for the scripted engine: zone colors, a kinetic caption
// block that reveals the narration word-by-word, and a giant ghost watermark
// letter for scenario scenes.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { brand, fonts } from "../brand";
import { Zone } from "./types";

export const zoneColor = (zone?: Zone): string => {
  if (zone === "green") return brand.green;
  if (zone === "red") return brand.red;
  if (zone === "yellow") return brand.gold;
  return brand.gold;
};

/**
 * Reveals `text` word-by-word over `revealFrames`, starting at `startAt`.
 * Pure function of the current frame, so it scrubs and renders identically.
 * This is how the *script* becomes synced captions with no manual timing.
 */
export const KineticCaptions: React.FC<{
  text: string;
  startAt?: number;
  revealFrames?: number;
  fontSize?: number;
  color?: string;
  maxWidth?: number;
}> = ({
  text,
  startAt = 6,
  revealFrames = 60,
  fontSize = 46,
  color = brand.cream,
  maxWidth = 1500,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const per = revealFrames / words.length;

  return (
    <div
      style={{
        maxWidth,
        textAlign: "center",
        fontFamily: fonts.sans,
        fontSize,
        lineHeight: 1.4,
        color,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 0.32em",
      }}
    >
      {words.map((w, i) => {
        const appear = startAt + i * per;
        const opacity = interpolate(frame, [appear, appear + 8], [0.12, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(frame, [appear, appear + 8], [10, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{ opacity, transform: `translateY(${y}px)`, display: "inline-block" }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** A huge faint zone word behind a scenario scene (GREEN / YELLOW / RED). */
export const ZoneWatermark: React.FC<{ zone?: Zone }> = ({ zone }) => {
  const frame = useCurrentFrame();
  if (!zone) return null;
  const drift = interpolate(frame, [0, 300], [0, -30]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: fonts.sans,
          fontWeight: 800,
          fontSize: 460,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: `${zoneColor(zone)}10`,
          transform: `translateY(${drift}px)`,
          userSelect: "none",
        }}
      >
        {zone}
      </div>
    </AbsoluteFill>
  );
};

/** The small uppercase label above a headline, with a zone dot. */
export const Kicker: React.FC<{ text: string; color?: string }> = ({
  text,
  color = brand.goldSoft,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: fonts.sans,
      fontSize: 26,
      letterSpacing: 5,
      textTransform: "uppercase",
      color,
    }}
  >
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 99,
        background: color,
        display: "inline-block",
      }}
    />
    {text}
  </div>
);
