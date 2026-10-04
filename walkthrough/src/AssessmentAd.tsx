// Ad from the REAL assessment recording, narration-driven:
//   [Ai] open → first 3 questions → (9 dropped) → fill name/email → ACTUAL report → CTA.
// When narration is generated, each beat stretches to its spoken line and plays
// its clip; until then it renders silent with captions. Cut points come from the
// recording (assessment.cuts.json); voice lengths from assessment.narration.json.
import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import narration from "./assessment.narration.json";
import cuts from "../public/footage/assessment.cuts.json";

const C = { ink: "#071A2F", ink2: "#0B2745", gold: "#C8A24A", goldSoft: "#E6D39B", cream: "#F7F3EA" };
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const FPS = 30;

// Cut points come from the recording — re-record and they update automatically.
const CUT = cuts as { q3End: number; formStart: number; reportStart: number; end: number };
const f = (s: number) => Math.round(s * FPS);

const VO: Record<string, { seconds: number; audio: string }> | null =
  narration.enabled ? (narration.sections as Record<string, { seconds: number; audio: string }>) : null;

// footage beats: source range + a default (silent) duration; voiced overrides it
const SEGS = [
  { id: "questions", a: 0, b: CUT.q3End, silentRate: 1.2, cap: "Twelve questions. About three minutes." },
  { id: "form", a: CUT.formStart, b: CUT.reportStart, silentRate: 1.5, cap: "Add your name — and where you bank." },
  { id: "report", a: CUT.reportStart, b: CUT.end, silentRate: 1.0, cap: "Your real report — score, top gap, where to start." },
];
const partFrames = (id: string, fallback: number) => (VO && VO[id] ? Math.round(VO[id].seconds * FPS) : fallback);
const segFrames = (s: (typeof SEGS)[number]) => partFrames(s.id, Math.ceil((f(s.b) - f(s.a)) / s.silentRate));

const OPEN_DEF = 60, CLOSE_DEF = 84;
const openFrames = () => partFrames("open", OPEN_DEF);
const closeFrames = () => partFrames("close", CLOSE_DEF);
export const assessmentAdFrames = () => openFrames() + SEGS.reduce((n, s) => n + segFrames(s), 0) + closeFrames();

const VoiceClip: React.FC<{ id: string }> = ({ id }) => (VO && VO[id] ? <Audio src={staticFile(VO[id].audio)} /> : null);

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

const BrandCard: React.FC<{ id: string; total: number; title: string; sub?: string }> = ({ id, total, title, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = interpolate(frame, [4, 26], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <VoiceClip id={id} />
      <div style={{ position: "relative", lineHeight: 1 }}>
        {Mark(`${C.gold}22`, 150)}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${reveal}%` }}>{Mark(C.gold, 150)}</div>
      </div>
      <div style={{ opacity: rise, fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.cream, textAlign: "center", maxWidth: 1300, lineHeight: 1.1 }}>{title}</div>
      {sub && <div style={{ opacity: rise, fontFamily: SANS, fontSize: 28, color: C.goldSoft, letterSpacing: 1 }}>{sub}</div>}
    </AbsoluteFill>
  );
};

const Seg: React.FC<{ s: (typeof SEGS)[number]; total: number }> = ({ s, total }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, total], [1.0, 1.025], { extrapolateRight: "clamp" });
  const rate = (f(s.b) - f(s.a)) / total; // footage fills the (voice-sized) segment
  const o = interpolate(frame, [8, 20, total - 12, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total, 8, 8), alignItems: "center", justifyContent: "center" }}>
      <VoiceClip id={s.id} />
      <div style={{ transform: `scale(${push})`, width: 1500, borderRadius: 14, overflow: "hidden", boxShadow: "0 70px 150px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06)" }}>
        <OffthreadVideo src={staticFile("footage/assessment.mp4")} startFrom={f(s.a)} endAt={f(s.b)} playbackRate={rate} style={{ width: "100%", display: "block" }} />
      </div>
      {/* captions only when there's no voice (voice carries it otherwise) */}
      {!VO && <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", opacity: o, fontFamily: SANS, fontSize: 34, color: C.cream, textShadow: "0 3px 16px rgba(0,0,0,.8)" }}>{s.cap}</div>}
    </AbsoluteFill>
  );
};

export const AssessmentAd: React.FC = () => {
  let at = 0;
  const place = (n: number) => { const fr = at; at += n; return fr; };
  return (
    <AbsoluteFill>
      <Stage />
      <Sequence from={place(openFrames())} durationInFrames={openFrames()}><BrandCard id="open" total={openFrames()} title="Find your AI starting point." sub="Free · 12 questions · 3 minutes" /></Sequence>
      {SEGS.map((s) => {
        const len = segFrames(s);
        return <Sequence key={s.id} from={place(len)} durationInFrames={len}><Seg s={s} total={len} /></Sequence>;
      })}
      <Sequence from={place(closeFrames())} durationInFrames={closeFrames()}><BrandCard id="close" total={closeFrames()} title="Turning Bankers into Builders" sub="aibankinginstitute.com — start free" /></Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
