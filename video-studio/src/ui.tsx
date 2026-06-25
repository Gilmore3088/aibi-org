// Small reusable pieces shared across scenes.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { brand, fonts } from "./brand";

/**
 * The persistent backdrop: deep-navy radial gradient + a faint gold vignette.
 * Used as the base layer of every scene so cuts feel like one film.
 */
export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 120% at 50% 0%, ${brand.ink2} 0%, ${brand.ink} 55%, #04101d 100%)`,
      }}
    >
      {/* faint gold frame line */}
      <AbsoluteFill
        style={{
          margin: 48,
          border: `1px solid ${brand.gold}22`,
          borderRadius: 12,
        }}
      />
    </AbsoluteFill>
  );
};

/** The aibi wordmark, rendered as type so we need no image asset. */
export const Wordmark: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <div
    style={{
      fontFamily: fonts.serif,
      fontSize: size,
      letterSpacing: 1,
      color: brand.cream,
    }}
  >
    <span style={{ color: brand.gold }}>Ai</span>
    <span>BI</span>
    <span
      style={{
        fontFamily: fonts.sans,
        fontSize: size * 0.42,
        letterSpacing: 3,
        marginLeft: 10,
        color: brand.goldSoft,
        textTransform: "uppercase",
      }}
    >
      AI Banking Institute
    </span>
  </div>
);

/**
 * A number that counts up to `to` over `durationInFrames`, easing out.
 * Pure function of the current frame — no state, so it scrubs and renders
 * identically every time.
 */
export const CountUp: React.FC<{
  to: number;
  durationInFrames?: number;
  delay?: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ to, durationInFrames = 40, delay = 0, suffix = "", style }) => {
  const frame = useCurrentFrame();
  const value = interpolate(frame - delay, [0, durationInFrames], [0, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
  });
  return (
    <span style={style}>
      {Math.round(value)}
      {suffix}
    </span>
  );
};
