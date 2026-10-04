// "The Cross-Out" — v2 hero spot. The bad prompt (with customer PII) types in,
// the PII glows red, each value is struck through and replaced by a gold
// placeholder chip, the prompt becomes the good prompt, and the real calculator
// runs — terms only, no customer. Sound-off-legible: captions carry the lesson.
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
import narration from "./crossout-v2.narration.json";

const C = { navy: "#071A2F", navy2: "#0B2745", cream: "#F7F3EA", gold: "#C8A24A", goldSoft: "#E6D39B", red: "#C0392B", muted: "#8FA0B6" };
const SANS = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const SERIF = 'Georgia, "Times New Roman", serif';
const FPS = 30;

const VO: Record<string, { seconds: number; audio: string }> | null =
  narration.enabled ? (narration.sections as Record<string, { seconds: number; audio: string }>) : null;
const VoiceClip: React.FC<{ id: string }> = ({ id }) => (VO && VO[id] ? <Audio src={staticFile(VO[id].audio)} /> : null);

// ── prompt content ──────────────────────────────────────────────────────────
type Run = { text: string } | { pii: string; chip: string; order: number } | { term: string };
const RUNS: Run[] = [
  { text: "build me a loan calculator — borrower is " },
  { pii: "John Doe", chip: "[BORROWER_NAME]", order: 0 },
  { text: ", SSN " },
  { pii: "000-00-0000", chip: "[SSN]", order: 1 },
  { text: ", loan #" },
  { pii: "00123", chip: "[LOAN_ID]", order: 2 },
  { text: ", email " },
  { pii: "jdoe@example.com", chip: "[BORROWER_EMAIL]", order: 3 },
  { text: ". He’s borrowing " },
  { term: "$250,000" },
  { text: " at " },
  { term: "7.25%" },
  { text: " for " },
  { term: "30 years" },
  { text: ". what’s his monthly payment?" },
];
const runText = (r: Run) => ("text" in r ? r.text : "pii" in r ? r.pii : r.term);

const TYPE_END = 95, GLOW = 125, STRIKE0 = 240, STEP = 85, STRIKE_DUR = 22, CHIP_GAP = 16;

const fade = (fr: number, t: number, i = 12, o = 12) =>
  interpolate(fr, [0, i, t - o, t], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Stage: React.FC = () => (
  <AbsoluteFill style={{ background: C.navy }}>
    <AbsoluteFill style={{ background: "radial-gradient(65% 55% at 50% 12%, rgba(200,162,74,0.10) 0%, rgba(0,0,0,0) 60%)" }} />
  </AbsoluteFill>
);
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.045, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%"><filter id="cg"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 60} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#cg)" /></svg>
    </AbsoluteFill>
  );
};
const Mark = (color: string, size: number) => (
  <span style={{ whiteSpace: "nowrap", color, fontFamily: SANS, fontWeight: 700, fontSize: size }}>[A<span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600 }}>i</span>]</span>
);

// ── a single PII run: type → glow red → strike → gold chip ──────────────────
const Pii: React.FC<{ run: Extract<Run, { pii: string }>; visible: number; frame: number }> = ({ run, visible, frame }) => {
  const { fps } = useVideoConfig();
  const strikeAt = STRIKE0 + run.order * STEP;
  const chipAt = strikeAt + STRIKE_DUR + CHIP_GAP;
  if (frame >= chipAt) {
    const g = spring({ frame: frame - chipAt, fps, config: { damping: 200 } });
    return (
      <span style={{ display: "inline-block", transform: `scale(${interpolate(g, [0, 1], [0.6, 1])})`, opacity: g, background: C.gold, color: C.navy, fontFamily: MONO, fontWeight: 700, fontSize: 33, padding: "2px 12px", borderRadius: 8, margin: "0 2px", verticalAlign: "middle" }}>{run.chip}</span>
    );
  }
  const txt = run.pii.slice(0, visible);
  const glow = frame >= GLOW;
  const strike = interpolate(frame, [strikeAt, strikeAt + STRIKE_DUR], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <span style={{ position: "relative", color: glow ? C.red : C.cream, textShadow: glow ? `0 0 18px ${C.red}88` : "none", transition: "color .2s" }}>
      {txt}
      <span style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${strike}%`, background: C.red }} />
    </span>
  );
};

// ── the prompt scene ────────────────────────────────────────────────────────
const PromptScene: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const totalChars = RUNS.reduce((n, r) => n + runText(r).length, 0);
  const typed = interpolate(frame, [6, TYPE_END], [0, totalChars], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const caret = Math.floor(frame / 14) % 2 === 0 && frame < TYPE_END + 8;
  let cum = 0;

  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center", padding: "0 160px" }}>
      <div style={{ width: 1480, background: C.navy2, borderRadius: 18, border: "1px solid rgba(255,255,255,.07)", boxShadow: "0 60px 140px rgba(0,0,0,.5)", padding: "44px 50px" }}>
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: ".14em", textTransform: "uppercase", color: C.goldSoft, marginBottom: 26 }}>New chat · loan tools</div>
        <div style={{ fontFamily: MONO, fontSize: 33, lineHeight: 1.62, color: C.cream }}>
          {RUNS.map((r, i) => {
            const len = runText(r).length;
            const vis = Math.max(0, Math.min(len, Math.round(typed - cum)));
            cum += len;
            if (vis <= 0) return null;
            if ("pii" in r) return <Pii key={i} run={r} visible={vis} frame={frame} />;
            if ("term" in r) return <span key={i} style={{ color: C.goldSoft, borderBottom: `2px solid ${C.gold}66` }}>{r.term.slice(0, vis)}</span>;
            return <span key={i}>{r.text.slice(0, vis)}</span>;
          })}
          {caret && <span style={{ borderLeft: `3px solid ${C.gold}`, marginLeft: 2 }} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── good prompt + the three inputs ──────────────────────────────────────────
const GoodScene: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = [
    "Act as a front-end developer. Build a self-contained",
    "loan calculator — one HTML file.",
    "Inputs: loan amount, interest rate, term.",
    "Outputs: monthly payment, total interest, amortization.",
    "Take loan terms only — never include borrower NPI.",
  ];
  const inputs = [["Loan amount", "$250,000"], ["Rate", "7.25%"], ["Term", "30 years"]];
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center", padding: "0 160px" }}>
      <div style={{ width: 1480, background: C.navy2, borderRadius: 18, border: "1px solid rgba(255,255,255,.07)", boxShadow: "0 60px 140px rgba(0,0,0,.5)", padding: "44px 50px" }}>
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: ".14em", textTransform: "uppercase", color: C.goldSoft, marginBottom: 24 }}>The prompt, right-sized</div>
        <div style={{ fontFamily: MONO, fontSize: 27, lineHeight: 1.6, color: C.cream }}>
          {lines.map((l, i) => {
            const o = interpolate(frame, [10 + i * 8, 26 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <div key={i} style={{ opacity: o }}>{l}</div>;
          })}
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 34 }}>
          {inputs.map(([label, val], i) => {
            const g = spring({ frame: frame - (70 + i * 12), fps, config: { damping: 200 } });
            return (
              <div key={label} style={{ opacity: g, transform: `translateY(${interpolate(g, [0, 1], [20, 0])}px)`, flex: 1, background: C.navy, border: `1px solid ${C.gold}55`, borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontFamily: SANS, fontSize: 16, color: C.muted }}>{label}</div>
                <div style={{ fontFamily: MONO, fontSize: 30, color: C.gold, fontWeight: 700 }}>{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CalcScene: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, total], [1.0, 1.03], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${push})`, width: 1560, borderRadius: 14, overflow: "hidden", boxShadow: "0 70px 150px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06)" }}>
        <OffthreadVideo src={staticFile("footage/calculator-v2.mp4")} style={{ width: "100%", display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = interpolate(frame, [6, 34], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = spring({ frame: frame - 18, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 22 }}>
      <div style={{ position: "relative", lineHeight: 1 }}>{Mark(`${C.gold}22`, 180)}<div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${reveal}%` }}>{Mark(C.gold, 180)}</div></div>
      <div style={{ opacity: rise, fontFamily: SANS, fontSize: 38, letterSpacing: 1, color: C.cream }}>The AI Banking Institute</div>
      <div style={{ opacity: rise, fontFamily: SANS, fontSize: 25, color: C.goldSoft, letterSpacing: 1 }}>Turning Bankers into Builders · Build boldly. Inside the lines.</div>
    </AbsoluteFill>
  );
};

// ── captions (sound-off-legible), keyed to global frames ────────────────────
const CAPS: [number, number, string][] = [
  [10, 120, "You’ve got a question and a deadline. So you just ask."],
  [120, 240, "But look at what just walked out the door."],
  [240, 390, "You don’t delete the customer."],
  [390, 600, "You replace it with a placeholder — the real person never goes in."],
  [600, 810, "Then you ask for what the task needs. Not one customer’s math — a tool, for all of them."],
  [810, 1050, "Same answer. None of the exposure — a calculator you built."],
  [1050, 1140, "You can build your own tools. Just without the customer inside them."],
];
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const a = CAPS.find(([s, e]) => f >= s && f < e);
  if (!a) return null;
  const [s, e, text] = a;
  const o = interpolate(f, [s, s + 10, e - 10, e], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(180deg, rgba(7,26,47,0) 0%, rgba(7,26,47,.85) 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 56, width: "100%", textAlign: "center", padding: "0 220px", opacity: o, fontFamily: SANS, fontSize: 35, lineHeight: 1.35, color: C.cream, textShadow: "0 3px 16px rgba(0,0,0,.8)" }}>{text}</div>
    </>
  );
};

// ── timeline ────────────────────────────────────────────────────────────────
const T = { prompt: 600, good: 210, calc: 330, end: 120 };
export const crossOutFrames = T.prompt + T.good + T.calc + T.end;

export const CrossOutV2: React.FC = () => {
  let at = 0;
  const place = (n: number) => { const f = at; at += n; return f; };
  return (
    <AbsoluteFill>
      <Stage />
      <VoiceClip id="all" />
      <Sequence from={place(T.prompt)} durationInFrames={T.prompt}><PromptScene total={T.prompt} /></Sequence>
      <Sequence from={place(T.good)} durationInFrames={T.good}><GoodScene total={T.good} /></Sequence>
      <Sequence from={place(T.calc)} durationInFrames={T.calc}><CalcScene total={T.calc} /></Sequence>
      <Sequence from={place(T.end)} durationInFrames={T.end}><EndCard total={T.end} /></Sequence>
      <Captions />
      <Grain />
    </AbsoluteFill>
  );
};
