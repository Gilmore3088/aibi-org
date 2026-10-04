// The five scenes of the assessment-results explainer, top to bottom in the
// order they play. Each is rendered inside a <Sequence> in AssessmentResults.tsx,
// so `useCurrentFrame()` here is LOCAL to the scene (starts at 0).
//
// Read this file top-to-bottom to learn the core Remotion moves:
//   useCurrentFrame()  -> "what frame am I on"
//   interpolate(...)   -> map a frame range to a value range (fades, slides)
//   spring(...)        -> springy, natural motion
//   AbsoluteFill       -> a full-frame absolutely-positioned div

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand, fonts } from "./brand";
import { CountUp, Wordmark } from "./ui";
import {
  AssessmentResult,
  bandFor,
  colorFor,
  MATURITY_BANDS,
} from "./data";

// Fade a scene in at the start and out at the end (in local frames).
const sceneOpacity = (
  frame: number,
  total: number,
  fadeIn = 14,
  fadeOut = 14,
) =>
  interpolate(
    frame,
    [0, fadeIn, total - fadeOut, total],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

// ─────────────────────────────────────────────────────────────────────────
// SCENE 1 — Intro / title card
// ─────────────────────────────────────────────────────────────────────────
export const IntroScene: React.FC<{
  result: AssessmentResult;
  durationInFrames: number;
}> = ({ result, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 200 } });
  const titleY = interpolate(rise, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity(frame, durationInFrames),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div style={{ opacity: rise }}>
        <Wordmark size={40} />
      </div>
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          fontFamily: fonts.serif,
          fontSize: 92,
          color: brand.cream,
          textAlign: "center",
          lineHeight: 1.05,
          maxWidth: 1300,
        }}
      >
        Your AI Readiness Results
      </div>
      <div
        style={{
          opacity: interpolate(frame, [18, 36], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          fontFamily: fonts.sans,
          fontSize: 30,
          letterSpacing: 1,
          color: brand.goldSoft,
        }}
      >
        In-Depth Diagnostic · {result.name}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// SCENE 2 — Overall score with an animated SVG ring
// ─────────────────────────────────────────────────────────────────────────
export const OverallScene: React.FC<{
  result: AssessmentResult;
  durationInFrames: number;
}> = ({ result, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const band = bandFor(result.overall);
  const accent = colorFor(result.overall);

  // Ring geometry.
  const size = 460;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  // Animate the ring filling to the score, springy, after a short beat.
  const progress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });
  const pct = (result.overall / 100) * progress;
  const dashOffset = circumference * (1 - pct);

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity(frame, durationInFrames),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 26,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: brand.goldSoft,
        }}
      >
        Overall Readiness
      </div>

      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`${brand.cream}1a`}
            strokeWidth={stroke}
          />
          {/* progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        {/* number in the middle */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontFamily: fonts.serif,
              fontSize: 150,
              color: brand.cream,
              lineHeight: 1,
            }}
          >
            <CountUp to={result.overall} delay={10} durationInFrames={40} />
          </div>
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: 28,
              color: `${brand.cream}99`,
            }}
          >
            out of 100
          </div>
        </AbsoluteFill>
      </div>

      <div
        style={{
          opacity: interpolate(frame, [40, 58], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          fontFamily: fonts.sans,
          fontSize: 34,
          color: accent,
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        {band.label}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// SCENE 3 — The eight dimension bars (staggered)
// ─────────────────────────────────────────────────────────────────────────
const DimensionBar: React.FC<{
  label: string;
  score: number;
  index: number;
}> = ({ label, score, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = colorFor(score);

  // Each bar starts 6 frames after the previous one — the "stagger".
  const start = 8 + index * 6;
  const grow = spring({ frame: frame - start, fps, config: { damping: 200 } });
  const widthPct = score * grow; // 0 → score, as a percentage of the track

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: grow }}>
      <div
        style={{
          width: 360,
          textAlign: "right",
          fontFamily: fonts.sans,
          fontSize: 26,
          color: brand.cream,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 34,
          borderRadius: 17,
          background: `${brand.cream}12`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${widthPct}%`,
            height: "100%",
            borderRadius: 17,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
          }}
        />
      </div>
      <div
        style={{
          width: 70,
          fontFamily: fonts.serif,
          fontSize: 32,
          color,
          textAlign: "left",
        }}
      >
        <CountUp to={score} delay={start} durationInFrames={30} />
      </div>
    </div>
  );
};

export const DimensionsScene: React.FC<{
  result: AssessmentResult;
  durationInFrames: number;
}> = ({ result, durationInFrames }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity(frame, durationInFrames),
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 140px",
        gap: 22,
      }}
    >
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: 52,
          color: brand.cream,
          marginBottom: 18,
        }}
      >
        Eight Dimensions of Readiness
      </div>
      {result.dimensions.map((d, i) => (
        <DimensionBar key={d.label} label={d.label} score={d.score} index={i} />
      ))}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// SCENE 4 — Strongest vs. focus-next callout cards
// ─────────────────────────────────────────────────────────────────────────
const HighlightCard: React.FC<{
  kicker: string;
  label: string;
  score: number;
  color: string;
  delay: number;
}> = ({ kicker, label, score, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: rise,
        transform: `translateY(${interpolate(rise, [0, 1], [40, 0])}px)`,
        width: 540,
        padding: "44px 48px",
        borderRadius: 20,
        background: `${brand.ink2}`,
        border: `1px solid ${color}55`,
        boxShadow: `0 24px 60px #00000055`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 22,
          letterSpacing: 4,
          textTransform: "uppercase",
          color,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: 48,
          color: brand.cream,
          margin: "14px 0 8px",
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: fonts.serif, fontSize: 64, color }}>
        {score}
        <span style={{ fontSize: 30, color: `${brand.cream}88` }}> / 100</span>
      </div>
    </div>
  );
};

export const HighlightsScene: React.FC<{
  result: AssessmentResult;
  durationInFrames: number;
}> = ({ result, durationInFrames }) => {
  const frame = useCurrentFrame();
  const sorted = [...result.dimensions].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity(frame, durationInFrames),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 48,
      }}
    >
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: 52,
          color: brand.cream,
        }}
      >
        Where to focus
      </div>
      <div style={{ display: "flex", gap: 48 }}>
        <HighlightCard
          kicker="Strongest"
          label={strongest.label}
          score={strongest.score}
          color={brand.green}
          delay={6}
        />
        <HighlightCard
          kicker="Focus next"
          label={weakest.label}
          score={weakest.score}
          color={brand.red}
          delay={16}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// SCENE 5 — Outro / call to action
// ─────────────────────────────────────────────────────────────────────────
export const OutroScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 } });
  const underline = interpolate(frame, [20, 50], [0, 360], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity(frame, durationInFrames),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 26,
      }}
    >
      <div style={{ opacity: rise }}>
        <Wordmark size={44} />
      </div>
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: 56,
          color: brand.cream,
          marginTop: 10,
        }}
      >
        Turn your score into a plan
      </div>
      <div style={{ height: 3, width: underline, background: brand.gold }} />
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 28,
          color: brand.goldSoft,
          letterSpacing: 1,
        }}
      >
        aibi.org · In-Depth Diagnostic
      </div>
    </AbsoluteFill>
  );
};

// Re-export the band list so the studio sidebar can show it if needed.
export { MATURITY_BANDS };
