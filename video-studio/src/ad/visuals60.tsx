// "Bankers into Builders" (:60) visuals. Production-note discipline: Inter for
// everything (system-sans stand-in until @remotion/google-fonts Inter is added),
// flat fills (no decorative gradients), gold #C8A24A as the ONLY accent, used
// where the eye should land. Dispatched by beat id.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand, fonts } from "../brand";
import { CountUp } from "../ui";
import { ScriptSection } from "../scripted/types";

const S = fonts.sans;
const fade = (f: number, t: number, i = 12, o = 12) =>
  interpolate(f, [0, i, t - o, t], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Footage: React.FC<{ src: string }> = ({ src }) => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </AbsoluteFill>
);

// Centered lower-third super, inside the letterbox safe area.
const Super: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  if (!section.super) return null;
  const o = interpolate(frame, [14, 28, total - 12, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 150, width: "100%", textAlign: "center", opacity: o, fontFamily: S, fontSize: 28, letterSpacing: 1.5, color: brand.goldSoft }}>
      {section.super}
    </div>
  );
};

const Cursor: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = brand.cream }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = Math.floor(frame / (fps * 0.5)) % 2 === 0;
  return <span style={{ display: "inline-block", width: 3, height: size, background: color, opacity: on ? 1 : 0, verticalAlign: "middle", marginLeft: 4 }} />;
};

// ── 1 — three portraits facing blank screens ───────────────────────────────
const Portraits: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (section.footage) return <AbsoluteFill style={{ opacity: fade(frame, total) }}><Footage src={section.footage} /><Super section={section} total={total} /></AbsoluteFill>;
  const roles = ["CFO", "BSA Officer", "Branch Lead"];
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 70 }}>
        {roles.map((role, i) => {
          const g = spring({ frame: frame - i * 8, fps, config: { damping: 200 } });
          return (
            <div key={role} style={{ opacity: g, transform: `translateY(${interpolate(g, [0, 1], [30, 0])}px)`, width: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
              {/* portrait: flat head + shoulders */}
              <div style={{ width: 360, height: 300, background: brand.ink2, borderRadius: 12, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ width: 220, height: 250, background: `${brand.cream}1f`, borderRadius: "120px 120px 0 0", position: "relative" }}>
                  <div style={{ width: 96, height: 96, borderRadius: 99, background: `${brand.cream}33`, position: "absolute", top: 36, left: 62 }} />
                </div>
              </div>
              {/* the blank screen they face */}
              <div style={{ width: 360, height: 96, background: brand.cream, borderRadius: 8, padding: 18 }}>
                <div style={{ height: 12, width: "70%", background: `${brand.ink}22`, borderRadius: 6 }} />
                <div style={{ height: 12, width: "40%", background: `${brand.ink}14`, borderRadius: 6, marginTop: 12, display: "flex" }}>
                  <Cursor size={14} color={brand.ink} />
                </div>
              </div>
              <div style={{ fontFamily: S, fontSize: 24, letterSpacing: 2, textTransform: "uppercase", color: brand.goldSoft }}>{role}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── 2 — the question typed then deleted ────────────────────────────────────
const TypedQuestion: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  const q = "What do we actually do about AI?";
  // type 0..len over first 40f, hold, delete back to 0 by end
  const typeEnd = 46, holdEnd = total - 34;
  let shown: number;
  if (frame < typeEnd) shown = Math.round(interpolate(frame, [8, typeEnd], [0, q.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  else if (frame < holdEnd) shown = q.length;
  else shown = Math.round(interpolate(frame, [holdEnd, total - 6], [q.length, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1280, padding: "44px 50px", background: brand.cream, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: S, fontSize: 50, color: brand.ink }}>{q.slice(0, shown)}</span>
        <Cursor size={52} color={brand.ink} />
      </div>
    </AbsoluteFill>
  );
};

// ── 3 — assessment: phone questions → desktop score ────────────────────────
const AssessmentFlow: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turn = Math.round(total * 0.5);
  const ring = spring({ frame: frame - turn, fps, config: { damping: 200 } });
  const score = 68, size = 300, stroke = 20, r = (size - stroke) / 2, c = 2 * Math.PI * r;

  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      {/* phone */}
      <div style={{ position: "absolute", opacity: interpolate(frame, [turn - 8, turn + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <div style={{ width: 340, height: 700, background: brand.cream, borderRadius: 40, padding: 36, border: `10px solid ${brand.ink2}` }}>
          <div style={{ fontFamily: S, fontSize: 18, color: brand.goldDeep, letterSpacing: 1 }}>QUESTION 4 OF 12</div>
          <div style={{ fontFamily: S, fontSize: 30, color: brand.ink, margin: "20px 0 30px", lineHeight: 1.3 }}>Do staff know which tasks are off-limits for AI?</div>
          {["Yes, documented", "Informally", "Not yet"].map((o, i) => {
            const g = spring({ frame: frame - 10 - i * 6, fps, config: { damping: 200 } });
            return <div key={o} style={{ opacity: g, fontFamily: S, fontSize: 24, color: brand.ink, border: `2px solid ${i === 0 ? brand.gold : brand.ink + "22"}`, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>{o}</div>;
          })}
        </div>
      </div>
      {/* desktop score */}
      <div style={{ position: "absolute", width: size, height: size, opacity: ring }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${brand.cream}1a`} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={brand.gold} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - (score / 100) * ring)} />
        </svg>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ fontFamily: S, fontWeight: 700, fontSize: 110, color: brand.cream }}><CountUp to={score} delay={turn} durationInFrames={34} /></div>
          <div style={{ fontFamily: S, fontSize: 22, color: brand.goldSoft }}>Building Momentum</div>
        </AbsoluteFill>
      </div>
      <Super section={section} total={total} />
    </AbsoluteFill>
  );
};

// ── 4 — the workbench (sandbox + Save to Toolbox) ──────────────────────────
const Workbench: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const respLines = [92, 88, 96, 80, 70];
  const saved = spring({ frame: frame - Math.round(total * 0.66), fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 30, width: 1500 }}>
        {/* scenario */}
        <div style={{ width: 560, background: brand.cream, borderRadius: 14, padding: 36 }}>
          <div style={{ fontFamily: S, fontSize: 20, letterSpacing: 2, textTransform: "uppercase", color: brand.goldDeep }}>Scenario</div>
          <div style={{ fontFamily: S, fontSize: 28, color: brand.ink, marginTop: 16, lineHeight: 1.4 }}>Draft a member hardship reply — no PII, escalate the decision.</div>
        </div>
        {/* honest response streaming */}
        <div style={{ flex: 1, background: brand.ink2, borderRadius: 14, padding: 36 }}>
          <div style={{ fontFamily: S, fontSize: 20, color: brand.goldSoft, marginBottom: 22 }}>AI response</div>
          {respLines.map((w, i) => {
            const rev = interpolate(frame, [20 + i * 10, 34 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <div key={i} style={{ height: 14, borderRadius: 7, background: `${brand.cream}26`, width: `${w * rev}%`, marginBottom: 18 }} />;
          })}
          <div style={{ marginTop: 30, display: "inline-block", opacity: saved, transform: `scale(${interpolate(saved, [0, 1], [0.9, 1])})`, background: brand.gold, color: brand.ink, fontFamily: S, fontWeight: 600, fontSize: 24, padding: "14px 24px", borderRadius: 10 }}>
            Saved to Toolbox ✓
          </div>
        </div>
      </div>
      <Super section={section} total={total} />
    </AbsoluteFill>
  );
};

// ── 5 — artifacts montage (AI prepares · humans decide) ────────────────────
const ArtifactMontage: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ["SAR narrative", "Board memo", "AI-use policy", "Desk card"];
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 32 }}>
        {items.map((label, i) => {
          const g = spring({ frame: frame - (8 + i * 16), fps, config: { damping: 200 } });
          const checked = spring({ frame: frame - (8 + i * 16 + 22), fps, config: { damping: 200 } });
          return (
            <div key={label} style={{ opacity: g, transform: `translateY(${interpolate(g, [0, 1], [40, 0])}px)`, width: 320, height: 420, background: brand.cream, borderRadius: 12, padding: 28, position: "relative" }}>
              <div style={{ fontFamily: S, fontWeight: 600, fontSize: 26, color: brand.ink, marginBottom: 18 }}>{label}</div>
              {[100, 94, 88, 96, 70, 82].map((w, j) => <div key={j} style={{ height: 10, borderRadius: 5, background: `${brand.ink}16`, width: `${w}%`, marginBottom: 14 }} />)}
              {/* human review check */}
              <div style={{ position: "absolute", bottom: 22, right: 22, width: 44, height: 44, borderRadius: 99, background: brand.gold, color: brand.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, opacity: checked, transform: `scale(${checked})` }}>✓</div>
            </div>
          );
        })}
      </div>
      <Super section={section} total={total} />
    </AbsoluteFill>
  );
};

// ── 6 — the certificate ────────────────────────────────────────────────────
const Certificate: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = spring({ frame, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: g, transform: `translateY(${interpolate(g, [0, 1], [30, 0])}px)`, width: 1040, height: 620, background: brand.cream, borderRadius: 14, padding: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
        <div style={{ width: 90, height: 90, borderRadius: 99, border: `6px solid ${brand.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.serif, fontSize: 44, color: brand.goldDeep }}>
          <span style={{ color: brand.goldDeep }}>[<span style={{ fontStyle: "italic" }}>A</span>]</span>
        </div>
        <div style={{ fontFamily: S, fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: brand.goldDeep }}>Certificate of Completion</div>
        <div style={{ fontFamily: S, fontWeight: 700, fontSize: 56, color: brand.ink }}>AiBI-Foundation</div>
        <div style={{ width: 360, height: 2, background: `${brand.ink}22`, marginTop: 18 }} />
        <div style={{ fontFamily: S, fontSize: 24, color: `${brand.ink}99` }}>The AI Banking Institute</div>
      </div>
      <Super section={section} total={total} />
    </AbsoluteFill>
  );
};

// ── 8 — brand mark ─────────────────────────────────────────────────────────
const BrandMark: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = interpolate(frame, [6, 34], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  // [Ai] — only the "i" is the italic serif, per the one-italic rule.
  const Mark = (color: string) => (
    <span style={{ whiteSpace: "nowrap", color, fontFamily: S, fontWeight: 700 }}>
      [A<span style={{ fontFamily: fonts.serif, fontStyle: "italic", fontWeight: 600 }}>i</span>]
    </span>
  );
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 26 }}>
      <div style={{ position: "relative", fontSize: 190, lineHeight: 1 }}>
        {Mark(`${brand.gold}22`)}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${reveal}%` }}>{Mark(brand.gold)}</div>
      </div>
      <div style={{ opacity: rise, fontFamily: S, fontSize: 40, letterSpacing: 1, color: brand.cream }}>The AI Banking Institute</div>
      <div style={{ opacity: rise, display: "flex", gap: 18, fontFamily: S, fontSize: 26, color: brand.goldSoft, letterSpacing: 1 }}>
        <span>{section.line}</span><span style={{ color: `${brand.cream}44` }}>·</span><span>{section.super}</span>
      </div>
    </AbsoluteFill>
  );
};

const Confident: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  if (section.footage) return <AbsoluteFill style={{ opacity: fade(frame, total) }}><Footage src={section.footage} /><Super section={section} total={total} /></AbsoluteFill>;
  // graphics fallback: a calm "you stay in the chair" line
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: S, fontSize: 64, color: brand.cream, textAlign: "center", maxWidth: 1300, lineHeight: 1.2 }}>
        Your bankers. <span style={{ color: brand.gold }}>Doing it themselves.</span>
      </div>
    </AbsoluteFill>
  );
};

export const Ad60Scene: React.FC<{ section: ScriptSection; durationInFrames: number }> = ({ section, durationInFrames }) => {
  const p = { section, total: durationInFrames };
  switch (section.id) {
    case "portraits": return <Portraits {...p} />;
    case "question": return <TypedQuestion {...p} />;
    case "assessment": return <AssessmentFlow {...p} />;
    case "workbench": return <Workbench {...p} />;
    case "artifacts": return <ArtifactMontage {...p} />;
    case "certificate": return <Certificate {...p} />;
    case "confident": return <Confident {...p} />;
    case "brand": return <BrandMark {...p} />;
    default: return <TypedQuestion {...p} />;
  }
};
