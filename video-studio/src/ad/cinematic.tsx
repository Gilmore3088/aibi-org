// Cinematic finishing layer: film grain, vignette, a subtle grade, letterbox
// bars, and a slow camera push. Stacked on top of the whole ad so even pure
// motion-graphics beats read like film rather than flat animation.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";

// 2.35:1 letterbox bars (1920×1080 → ~120px top/bottom). Supers sit inside.
export const LETTERBOX = 120;

// Moving film grain via an animated turbulence seed.
const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 60;
  return (
    <AbsoluteFill style={{ opacity: 0.075, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="om-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#om-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(120% 100% at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 120%)",
    }}
  />
);

// Gentle grade: cool navy in the shadows, a hint of warmth up top.
const Grade: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(11,39,69,0.16) 0%, rgba(0,0,0,0) 38%, rgba(4,16,29,0.22) 100%)",
        mixBlendMode: "soft-light",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(80% 60% at 50% 20%, rgba(200,162,74,0.10) 0%, rgba(0,0,0,0) 60%)",
        mixBlendMode: "soft-light",
      }}
    />
  </>
);

const Letterbox: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: LETTERBOX, background: "#000" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: LETTERBOX, background: "#000" }} />
  </>
);

// Everything above the picture. pointerEvents none so it never blocks the studio.
export const CinematicOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <Grade />
    <Vignette />
    <FilmGrain />
    <Letterbox />
  </AbsoluteFill>
);

// Slow camera push for a single scene (local frame).
export const PushIn: React.FC<{
  total: number;
  from?: number;
  to?: number;
  children: React.ReactNode;
}> = ({ total, from = 1.0, to = 1.05, children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, total], [from, to], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "50% 50%" }}>
      {children}
    </AbsoluteFill>
  );
};
