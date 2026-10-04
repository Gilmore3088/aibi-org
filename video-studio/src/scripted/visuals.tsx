// Visual-first scenes: the voice explains, these SHOW the idea. On-screen text
// is at most a short line or a few labels — never a paragraph.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand, fonts } from "../brand";
import { CountUp } from "../ui";
import { ScriptSection } from "./types";

const fade = (frame: number, total: number, inF = 12, outF = 14) =>
  interpolate(frame, [0, inF, total - outF, total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// A short line near the lower third — a caption, not a paragraph.
const LowerLine: React.FC<{ text?: string; delay?: number }> = ({
  text,
  delay = 8,
}) => {
  const frame = useCurrentFrame();
  if (!text) return null;
  const o = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        width: "100%",
        textAlign: "center",
        opacity: o,
        fontFamily: fonts.sans,
        fontSize: 38,
        color: brand.goldSoft,
        letterSpacing: 0.5,
      }}
    >
      {text}
    </div>
  );
};

// ── statement: one short line, voice-synced ────────────────────────────────
const Statement: React.FC<{ section: ScriptSection; total: number }> = ({
  section,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", opacity: fade(frame, total) }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(rise, [0, 1], [40, 0])}px)`,
          opacity: rise,
          fontFamily: fonts.serif,
          fontSize: 92,
          color: brand.cream,
          textAlign: "center",
          lineHeight: 1.1,
          maxWidth: 1500,
          padding: "0 120px",
        }}
      >
        {section.line}
      </div>
    </AbsoluteFill>
  );
};

// ── prompt-chaos: bubbles multiplying ──────────────────────────────────────
const CHAOS = [
  { t: "Draft a member email", x: -560, y: -240, d: 20 },
  { t: "Summarize this policy", x: 520, y: -200, d: 30 },
  { t: "Explain this reg", x: -620, y: 150, d: 44 },
  { t: "Write a board update", x: 560, y: 200, d: 54 },
  { t: "Clean up these notes", x: -300, y: 300, d: 66 },
  { t: "Compare two vendors", x: 320, y: 320, d: 78 },
];
const Bubble: React.FC<{
  text: string;
  x: number;
  y: number;
  appear: number;
  big?: boolean;
}> = ({ text, x, y, appear, big }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - appear, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%,-50%) translate(${x}px, ${y}px) scale(${interpolate(
          s,
          [0, 1],
          [0.6, 1],
        )})`,
        opacity: big ? s : s * 0.5,
        background: big ? brand.ink2 : `${brand.ink2}cc`,
        border: `1px solid ${brand.gold}${big ? "" : "33"}`,
        color: big ? brand.cream : `${brand.cream}cc`,
        fontFamily: fonts.sans,
        fontSize: big ? 40 : 30,
        padding: big ? "26px 34px" : "16px 22px",
        borderRadius: 18,
        whiteSpace: "nowrap",
        boxShadow: big ? `0 20px 50px #00000055` : "none",
      }}
    >
      {text}
      {big && <BlinkingCursor />}
    </div>
  );
};
const BlinkingCursor: React.FC = () => {
  const frame = useCurrentFrame();
  const on = Math.floor(frame / 15) % 2 === 0;
  return (
    <span style={{ opacity: on ? 1 : 0, color: brand.gold, marginLeft: 4 }}>|</span>
  );
};
const PromptChaos: React.FC<{ section: ScriptSection; total: number }> = ({
  section,
  total,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total) }}>
      <Bubble text="Summarize this loan policy" x={0} y={-20} appear={4} big />
      {CHAOS.map((c) => (
        <Bubble key={c.t} text={c.t} x={c.x} y={c.y} appear={c.d} />
      ))}
      <LowerLine text={section.line} delay={70} />
    </AbsoluteFill>
  );
};

// ── pillars: three labelled pillars rising ─────────────────────────────────
const Pillars: React.FC<{ section: ScriptSection; total: number }> = ({
  section,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labels = section.labels ?? [];
  const heights = [360, 420, 360];
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, total),
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 220,
      }}
    >
      <div style={{ display: "flex", gap: 70, alignItems: "flex-end" }}>
        {labels.map((label, i) => {
          const g = spring({
            frame: frame - (10 + i * 12),
            fps,
            config: { damping: 200 },
          });
          const h = heights[i % heights.length] * g;
          return (
            <div key={label} style={{ width: 240, textAlign: "center" }}>
              <div
                style={{
                  opacity: g,
                  fontFamily: fonts.sans,
                  fontSize: 34,
                  color: brand.cream,
                  marginBottom: 18,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  height: h,
                  borderRadius: "14px 14px 0 0",
                  background: `linear-gradient(180deg, ${brand.gold}, ${brand.goldDeep})`,
                }}
              />
            </div>
          );
        })}
      </div>
      {/* baseline */}
      <div
        style={{
          width: 900,
          height: 3,
          background: `${brand.gold}55`,
          marginTop: -2,
        }}
      />
    </AbsoluteFill>
  );
};

// ── constellation: N nodes in a ring lighting up ───────────────────────────
const Constellation: React.FC<{ section: ScriptSection; total: number }> = ({
  section,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labels = section.labels ?? [];
  const cx = 960;
  const cy = 540;
  const R = 330;

  return (
    <AbsoluteFill style={{ opacity: fade(frame, total) }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {labels.map((_, i) => {
          const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * R;
          const y = cy + Math.sin(a) * R;
          const o = interpolate(frame, [12 + i * 7, 24 + i * 7], [0, 0.5], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={brand.gold}
              strokeWidth={1.5}
              opacity={o}
            />
          );
        })}
      </svg>

      {/* center */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: "translate(-50%,-50%)",
          fontFamily: fonts.serif,
          fontSize: 40,
          color: brand.gold,
        }}
      >
        AI-ready
      </div>

      {labels.map((label, i) => {
        const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        const g = spring({
          frame: frame - (12 + i * 7),
          fps,
          config: { damping: 200 },
        });
        const onSide = Math.cos(a) >= 0;
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%,-50%) scale(${interpolate(g, [0, 1], [0.4, 1])})`,
              opacity: g,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 99,
                background: brand.gold,
                boxShadow: `0 0 18px ${brand.gold}aa`,
              }}
            />
            <div
              style={{
                fontFamily: fonts.sans,
                fontSize: 24,
                color: brand.cream,
                whiteSpace: "nowrap",
                textShadow: "0 2px 8px #000",
                transform: `translateX(${onSide ? 0 : 0}px)`,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── gauge: a score ring filling to a number ────────────────────────────────
const Gauge: React.FC<{ section: ScriptSection; total: number }> = ({
  section,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const value = section.value ?? 72;
  const size = 440;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const pct = (value / 100) * progress;

  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, total),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${brand.cream}1a`} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={brand.gold}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
          />
        </svg>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: fonts.serif, fontSize: 150, color: brand.cream }}>
            <CountUp to={value} delay={8} durationInFrames={40} />
          </div>
        </AbsoluteFill>
      </div>
      <LowerLine text={section.line} delay={36} />
    </AbsoluteFill>
  );
};

// ── dispatcher ─────────────────────────────────────────────────────────────
export const VisualScene: React.FC<{
  section: ScriptSection;
  durationInFrames: number;
}> = ({ section, durationInFrames }) => {
  const props = { section, total: durationInFrames };
  switch (section.visual) {
    case "prompt-chaos":
      return <PromptChaos {...props} />;
    case "pillars":
      return <Pillars {...props} />;
    case "constellation":
      return <Constellation {...props} />;
    case "gauge":
      return <Gauge {...props} />;
    case "statement":
    default:
      return <Statement {...props} />;
  }
};
