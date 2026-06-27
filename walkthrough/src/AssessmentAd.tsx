// An ad built from the REAL recording of taking the free assessment.
// Brand open → the live experience (lightly sped) with captions → CTA.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = { ink: "#071A2F", ink2: "#0B2745", gold: "#C8A24A", goldSoft: "#E6D39B", cream: "#F7F3EA" };
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const FPS = 30;

const OPEN = 60, VIDEO = 588, CLOSE = 84;
export const assessmentAdFrames = OPEN + VIDEO + CLOSE;

const fade = (f: number, t: number, i = 10, o = 10) =>
  interpolate(f, [0, i, t - o, t], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Stage: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 50% 8%, rgba(200,162,74,0.13) 0%, rgba(0,0,0,0) 60%)" }} />
  </AbsoluteFill>
);

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.045, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="ag"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 60} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#ag)" />
      </svg>
    </AbsoluteFill>
  );
};

const Mark = (color: string, size: number) => (
  <span style={{ whiteSpace: "nowrap", color, fontFamily: SANS, fontWeight: 700, fontSize: size }}>
    [A<span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600 }}>i</span>]
  </span>
);

const BrandCard: React.FC<{ total: number; title: string; sub?: string }> = ({ total, title, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = interpolate(frame, [4, 26], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <div style={{ position: "relative", lineHeight: 1 }}>
        {Mark(`${C.gold}22`, 150)}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${reveal}%` }}>{Mark(C.gold, 150)}</div>
      </div>
      <div style={{ opacity: rise, fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.cream, textAlign: "center", maxWidth: 1300, lineHeight: 1.1 }}>{title}</div>
      {sub && <div style={{ opacity: rise, fontFamily: SANS, fontSize: 28, color: C.goldSoft, letterSpacing: 1 }}>{sub}</div>}
    </AbsoluteFill>
  );
};

const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const lines: [number, number, string][] = [
    [20, 430, "Twelve questions. About three minutes."],
    [430, VIDEO, "A real readiness picture — a score, a gap, a starting move."],
  ];
  const active = lines.find(([a, b]) => f >= a && f < b);
  if (!active) return null;
  const [a, b, text] = active;
  const o = interpolate(f, [a, a + 10, b - 10, b], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", opacity: o, fontFamily: SANS, fontSize: 34, color: C.cream, textShadow: "0 3px 16px rgba(0,0,0,.8)" }}>{text}</div>
  );
};

const ExperienceShot: React.FC = () => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, VIDEO], [1.0, 1.03], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, VIDEO, 12, 12), alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${push})`, width: 1500, borderRadius: 14, overflow: "hidden", boxShadow: "0 70px 150px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06)" }}>
        <OffthreadVideo src={staticFile("footage/assessment.mp4")} playbackRate={1.5} style={{ width: "100%", display: "block" }} />
      </div>
      <Caption />
    </AbsoluteFill>
  );
};

export const AssessmentAd: React.FC = () => {
  let at = 0;
  const place = (n: number) => { const f = at; at += n; return f; };
  return (
    <AbsoluteFill>
      <Stage />
      <Sequence from={place(OPEN)} durationInFrames={OPEN}><BrandCard total={OPEN} title="Find your AI starting point." sub="Free · 12 questions · 3 minutes" /></Sequence>
      <Sequence from={place(VIDEO)} durationInFrames={VIDEO}><ExperienceShot /></Sequence>
      <Sequence from={place(CLOSE)} durationInFrames={CLOSE}><BrandCard total={CLOSE} title="Turning Bankers into Builders" sub="aibankinginstitute.com — start free" /></Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
