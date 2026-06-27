// Ad from the REAL assessment recording, cut to the requested shape:
//   [Ai] open → first 3 questions → (9 questions dropped) → fill name/email →
//   the ACTUAL report → CTA.
// Cut points come from the recording (public/footage/assessment.cuts.json).
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

// recording cut points (seconds) — see assessment.cuts.json
const CUT = { q3End: 8.41, formStart: 11.21, reportStart: 19.31, end: 25.42 };
const f = (s: number) => Math.round(s * FPS);

// three segments: [source range, playback rate]
const SEGS = [
  { a: 0, b: CUT.q3End, rate: 1.2, cap: "Twelve questions. About three minutes." },
  { a: CUT.formStart, b: CUT.reportStart, rate: 1.5, cap: "Add your name — and where you bank." },
  { a: CUT.reportStart, b: CUT.end, rate: 1.0, cap: "Your real report — score, top gap, where to start." },
];
const segLen = (s: { a: number; b: number; rate: number }) => Math.ceil((f(s.b) - f(s.a)) / s.rate);

const OPEN = 60, CLOSE = 84;
export const assessmentAdFrames = OPEN + SEGS.reduce((n, s) => n + segLen(s), 0) + CLOSE;

const fade = (fr: number, t: number, i = 10, o = 10) =>
  interpolate(fr, [0, i, t - o, t], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Stage: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 50% 8%, rgba(200,162,74,0.13) 0%, rgba(0,0,0,0) 60%)" }} />
  </AbsoluteFill>
);

const Grain: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.045, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="ag"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={fr % 60} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
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

const Seg: React.FC<{ a: number; b: number; rate: number; total: number; cap: string }> = ({ a, b, rate, total, cap }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, total], [1.0, 1.025], { extrapolateRight: "clamp" });
  const o = interpolate(frame, [8, 20, total - 12, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total, 8, 8), alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${push})`, width: 1500, borderRadius: 14, overflow: "hidden", boxShadow: "0 70px 150px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06)" }}>
        <OffthreadVideo src={staticFile("footage/assessment.mp4")} startFrom={f(a)} endAt={f(b)} playbackRate={rate} style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", opacity: o, fontFamily: SANS, fontSize: 34, color: C.cream, textShadow: "0 3px 16px rgba(0,0,0,.8)" }}>{cap}</div>
    </AbsoluteFill>
  );
};

export const AssessmentAd: React.FC = () => {
  let at = 0;
  const place = (n: number) => { const fr = at; at += n; return fr; };
  return (
    <AbsoluteFill>
      <Stage />
      <Sequence from={place(OPEN)} durationInFrames={OPEN}><BrandCard total={OPEN} title="Find your AI starting point." sub="Free · 12 questions · 3 minutes" /></Sequence>
      {SEGS.map((s, i) => {
        const len = segLen(s);
        return <Sequence key={i} from={place(len)} durationInFrames={len}><Seg a={s.a} b={s.b} rate={s.rate} total={len} cap={s.cap} /></Sequence>;
      })}
      <Sequence from={place(CLOSE)} durationInFrames={CLOSE}><BrandCard total={CLOSE} title="Turning Bankers into Builders" sub="aibankinginstitute.com — start free" /></Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
