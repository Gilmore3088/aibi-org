// "The Blank Cursor" — bespoke per-beat visuals. Dispatched by section id (each
// beat is its own shot), not the generic visual enum. Motion-graphics reading of
// a live-action brief: cursor → artifact → builder, "show the artifact" as ad.
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

// Real/AI-generated footage layer for a beat (used when section.footage is set).
const Footage: React.FC<{ src: string }> = ({ src }) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(src)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

const MONO = '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace';

const fade = (frame: number, total: number, inF = 12, outF = 12) =>
  interpolate(frame, [0, inF, total - outF, total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
const kenBurns = (frame: number, total: number, from = 1.0, to = 1.06) =>
  interpolate(frame, [0, total], [from, to], { extrapolateRight: "clamp" });

const Cursor: React.FC<{ size?: number; color?: string }> = ({
  size = 34,
  color = brand.ink,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = Math.floor(frame / (fps * 0.55)) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: Math.max(2, size * 0.06),
        height: size,
        background: color,
        opacity: on ? 1 : 0,
        verticalAlign: "middle",
      }}
    />
  );
};

// Lower-third supers (url / legal / tagline).
const Supers: React.FC<{ section: ScriptSection; total: number }> = ({
  section,
  total,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [14, 28, total - 12, total], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (!section.super) return null;
  const legal = section.super.includes("Aligned");
  return (
    <div
      style={{
        position: "absolute",
        bottom: legal ? 150 : 158, // sit inside the letterbox safe area
        width: "100%",
        textAlign: legal ? "center" : "left",
        paddingLeft: legal ? 0 : 150,
        opacity: o,
        fontFamily: fonts.sans,
        fontSize: legal ? 26 : 30,
        letterSpacing: legal ? 1.5 : 0.5,
        color: brand.goldSoft,
      }}
    >
      {section.super}
    </div>
  );
};

// ── Beat 1 & 2 — the blank document + cursor ───────────────────────────────
const DocCursor: React.FC<{
  section: ScriptSection;
  total: number;
  tight?: boolean;
}> = ({ section, total, tight }) => {
  const frame = useCurrentFrame();
  const scale = kenBurns(frame, total, tight ? 1.4 : 1.0, tight ? 1.55 : 1.05);

  // When a generated/real clip is supplied, use it instead of the graphic.
  if (section.footage) {
    return (
      <AbsoluteFill style={{ opacity: fade(frame, total) }}>
        <Footage src={section.footage} />
        <Supers section={section} total={total} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, total),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          width: 1180,
          height: 720,
          background: `linear-gradient(160deg, ${brand.cream}, ${brand.cream2})`,
          borderRadius: 14,
          boxShadow: `0 60px 140px #00000066`,
          padding: 70,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* sticky notes + coffee ring — abstract desk hints (beat 1 only) */}
        {!tight && (
          <>
            <div style={{ position: "absolute", top: 40, right: 60, width: 90, height: 90, background: "#E9C46A", transform: "rotate(6deg)", boxShadow: "0 8px 20px #00000022" }} />
            <div style={{ position: "absolute", top: 70, right: 130, width: 90, height: 90, background: "#A8C6A1", transform: "rotate(-5deg)", boxShadow: "0 8px 20px #00000022" }} />
            <div style={{ position: "absolute", bottom: 60, right: 90, width: 130, height: 130, borderRadius: "50%", border: `10px solid ${brand.goldDeep}22` }} />
          </>
        )}
        {/* document title bar */}
        <div style={{ fontFamily: fonts.sans, fontSize: 24, color: `${brand.ink}66`, marginBottom: 36, letterSpacing: 1 }}>
          Untitled — AI &nbsp;·&nbsp; draft
        </div>
        {/* the blank line + blinking cursor */}
        <div style={{ display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 40, color: brand.ink }}>
          <Cursor size={48} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Beat 3 — twelve questions resolve into a score ─────────────────────────
const QuestionsToScore: React.FC<{ section: ScriptSection; total: number }> = ({
  section,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turn = Math.round(total * 0.52); // questions → score

  const ring = spring({ frame: frame - turn, fps, config: { damping: 200 } });
  const score = 68;
  const size = 360,
    stroke = 22,
    r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const pct = (score / 100) * ring;

  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      {/* twelve questions */}
      <div
        style={{
          position: "absolute",
          opacity: interpolate(frame, [turn - 8, turn + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px 60px",
          width: 1180,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const g = spring({ frame: frame - i * 3, fps, config: { damping: 200 } });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: g }}>
              <div style={{ width: 26, height: 26, borderRadius: 99, background: brand.gold, transform: `scale(${g})` }} />
              <div style={{ height: 16, borderRadius: 8, background: `${brand.cream}26`, width: `${60 + ((i * 7) % 38)}%` }} />
            </div>
          );
        })}
      </div>

      {/* score ring */}
      <div style={{ position: "absolute", width: size, height: size, opacity: ring }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${brand.cream}1a`} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={brand.gold} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
        </svg>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ fontFamily: fonts.serif, fontSize: 120, color: brand.cream }}>
            <CountUp to={score} delay={turn} durationInFrames={36} />
          </div>
          <div style={{ fontFamily: fonts.sans, fontSize: 24, color: brand.goldSoft, letterSpacing: 1 }}>
            Building Momentum
          </div>
        </AbsoluteFill>
      </div>
      <Supers section={section} total={total} />
    </AbsoluteFill>
  );
};

// ── Beat 4 — the artifacts you can hold ────────────────────────────────────
const ArtifactCard: React.FC<{ delay: number; children: React.ReactNode; tilt?: number; x?: number }> = ({
  delay,
  children,
  tilt = 0,
  x = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: g,
        transform: `translateX(${x}px) translateY(${interpolate(g, [0, 1], [60, 0])}px) rotate(${tilt}deg)`,
        width: 460,
        height: 540,
        background: brand.cream,
        borderRadius: 16,
        boxShadow: `0 40px 100px #00000055`,
        padding: 40,
        color: brand.ink,
      }}
    >
      {children}
    </div>
  );
};

const Artifacts: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 40 }}>
        {/* 1 — readiness card */}
        <ArtifactCard delay={6} tilt={-2}>
          <div style={{ fontFamily: fonts.sans, fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: brand.goldDeep }}>AI Readiness</div>
          <div style={{ fontFamily: fonts.serif, fontSize: 110, lineHeight: 1, marginTop: 8 }}>68</div>
          <div style={{ fontFamily: fonts.sans, fontSize: 22, color: `${brand.ink}99`, marginBottom: 26 }}>Building Momentum</div>
          {[82, 61, 74].map((v, i) => (
            <div key={i} style={{ height: 18, borderRadius: 9, background: `${brand.ink}12`, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ width: `${v}%`, height: "100%", background: brand.gold }} />
            </div>
          ))}
        </ArtifactCard>

        {/* 2 — working prompt */}
        <ArtifactCard delay={16} tilt={1}>
          <div style={{ background: brand.ink, borderRadius: 12, padding: 26, height: "100%", color: brand.cream }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {["#E0564B", "#E9C46A", "#3E8E6E"].map((c) => (
                <div key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />
              ))}
              <div style={{ marginLeft: "auto", fontFamily: fonts.sans, fontSize: 18, color: brand.gold }}>Saved ✓</div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.55, color: `${brand.cream}e0` }}>
              <span style={{ color: brand.goldSoft }}>You are a credit analyst.</span> Using only the memo below, summarize the borrower's repayment capacity. Flag any figure not supported by a source. Do not infer.
            </div>
          </div>
        </ArtifactCard>

        {/* 3 — AI-use policy with a margin citation */}
        <ArtifactCard delay={26} tilt={-1}>
          <div style={{ fontFamily: fonts.serif, fontSize: 30, marginBottom: 20 }}>AI-Use Policy</div>
          {[100, 94, 88, 97, 70].map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ height: 12, borderRadius: 6, background: `${brand.ink}18`, width: `${w}%` }} />
            </div>
          ))}
          <div style={{ marginTop: 22, borderLeft: `4px solid ${brand.gold}`, paddingLeft: 16, fontFamily: fonts.sans, fontSize: 20, color: brand.goldDeep }}>
            §3 Model validation —<br />
            <strong>SR 11-7</strong>
          </div>
        </ArtifactCard>
      </div>
      <Supers section={section} total={total} />
    </AbsoluteFill>
  );
};

// ── Beat 5 — draft, edit, sign (you stay in the chair) ─────────────────────
const DraftSign: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  if (section.footage) {
    return (
      <AbsoluteFill style={{ opacity: fade(frame, total) }}>
        <Footage src={section.footage} />
        <Supers section={section} total={total} />
      </AbsoluteFill>
    );
  }
  const lines = [96, 90, 99, 84, 92, 70];
  const sigStart = Math.round(total * 0.55);
  const sig = interpolate(frame, [sigStart, sigStart + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sigPath = 360;

  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1180, height: 740, background: brand.cream, borderRadius: 16, boxShadow: `0 50px 120px #00000055`, padding: 70, color: brand.ink }}>
        <div style={{ fontFamily: fonts.serif, fontSize: 38, marginBottom: 36 }}>Credit Memo — draft</div>
        {lines.map((w, i) => {
          const rev = interpolate(frame, [i * 7, i * 7 + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ height: 16, borderRadius: 8, background: `${brand.ink}14`, width: `${w * rev}%`, marginBottom: 22 }} />
          );
        })}
        {/* signature line */}
        <div style={{ marginTop: 60, display: "flex", alignItems: "flex-end", gap: 20 }}>
          <svg width={sigPath} height={90}>
            <path
              d="M10 60 C 60 10, 90 80, 130 40 S 210 10, 250 55 S 320 70, 350 30"
              fill="none"
              stroke={brand.ink}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={600}
              strokeDashoffset={600 * (1 - sig)}
            />
          </svg>
          <div style={{ fontFamily: fonts.sans, fontSize: 22, color: brand.green, opacity: sig, paddingBottom: 18 }}>Signed ✓</div>
        </div>
        <div style={{ borderTop: `2px solid ${brand.ink}22`, width: sigPath, marginTop: -6 }} />
      </div>
    </AbsoluteFill>
  );
};

// ── Beat 6 — the brand mark draws on in gold ───────────────────────────────
const BrandMark: React.FC<{ section: ScriptSection; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = interpolate(frame, [6, 34], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = spring({ frame: frame - 20, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 26 }}>
      {/* [Ai] mark — faint outline with a gold wipe revealing over it */}
      <div style={{ position: "relative", fontFamily: fonts.serif, fontWeight: 600, fontSize: 200, lineHeight: 1 }}>
        <span style={{ color: `${brand.gold}22` }}>[Ai]</span>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${reveal}%` }}>
          <span style={{ color: brand.gold, whiteSpace: "nowrap" }}>[Ai]</span>
        </div>
      </div>
      <div style={{ opacity: rise, fontFamily: fonts.sans, fontSize: 40, letterSpacing: 2, color: brand.cream }}>
        The AI Banking Institute
      </div>
      <div style={{ opacity: rise, display: "flex", gap: 18, alignItems: "center", fontFamily: fonts.sans, fontSize: 26, color: brand.goldSoft, letterSpacing: 1 }}>
        <span>{section.line}</span>
        <span style={{ color: `${brand.cream}44` }}>·</span>
        <span>{section.super}</span>
      </div>
    </AbsoluteFill>
  );
};

// ── dispatcher (by beat id) ────────────────────────────────────────────────
export const AdScene: React.FC<{ section: ScriptSection; durationInFrames: number }> = ({
  section,
  durationInFrames,
}) => {
  const p = { section, total: durationInFrames };
  switch (section.id) {
    case "saying":
      return <DocCursor {...p} />;
    case "lines":
      return <DocCursor {...p} tight />;
    case "twelve":
      return <QuestionsToScore {...p} />;
    case "hold":
      return <Artifacts {...p} />;
    case "chair":
      return <DraftSign {...p} />;
    case "brand":
      return <BrandMark {...p} />;
    default:
      return <DocCursor {...p} />;
  }
};
