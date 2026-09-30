// "The site as the film" — scrolls the REAL captured site pages in a browser
// frame, narration as lower-third supers, [Ai] bookends. No recreations; these
// are screenshots of the live app (see scripts/capture-site.mjs).
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  ink: "#071A2F", ink2: "#0B2745", gold: "#C8A24A",
  goldSoft: "#E6D39B", cream: "#F7F3EA",
};
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
export const FPS = 30;

// Captured page heights in CSS px (from the capture log) → drive the scroll.
export interface Section { img: string; cssHeight: number; url: string; line: string; seconds: number; }
export const SECTIONS: Section[] = [
  { img: "site/home.png",           cssHeight: 5161, url: "aibankinginstitute.com",                line: "It opens not with a pitch — but with the thing you’ll actually get back.", seconds: 8 },
  { img: "site/assessment.png",     cssHeight: 2070, url: "aibankinginstitute.com/assessment",     line: "Twelve questions, under three minutes. A real readiness picture — not a brochure.", seconds: 6 },
  { img: "site/resources.png",      cssHeight: 8773, url: "aibankinginstitute.com/resources",      line: "Real policies, playbooks, and desk cards — built for community banks, free to take.", seconds: 11 },
  { img: "site/security.png",       cssHeight: 4287, url: "aibankinginstitute.com/security",       line: "Boundary-safe by design — aligned with SR 11-7, Interagency TPRM, and ECOA / Reg B.", seconds: 7 },
  { img: "site/certifications.png", cssHeight: 2865, url: "aibankinginstitute.com/certifications", line: "A credential your examiner can read — and your team can be proud of.", seconds: 6 },
  { img: "site/about.png",          cssHeight: 5175, url: "aibankinginstitute.com/about",          line: "Built exclusively for community banks and credit unions.", seconds: 7 },
];

const FRAME_W = 1500, CONTENT_H = 858, TITLE_H = 56;

const Stage: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 50% 6%, rgba(200,162,74,0.13) 0%, rgba(0,0,0,0) 60%)" }} />
  </AbsoluteFill>
);

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.045, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 60} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

const Mark = (color: string, size: number) => (
  <span style={{ whiteSpace: "nowrap", color, fontFamily: SANS, fontWeight: 700, fontSize: size }}>
    [A<span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600 }}>i</span>]
  </span>
);

const fade = (f: number, t: number, i = 12, o = 12) =>
  interpolate(f, [0, i, t - o, t], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const ScrollShot: React.FC<{ section: Section; total: number }> = ({ section, total }) => {
  const frame = useCurrentFrame();
  const imgDisplayH = section.cssHeight * (FRAME_W / 1440);
  const scrollRange = Math.max(0, imgDisplayH - CONTENT_H);
  const y = interpolate(frame, [14, total - 18], [0, -scrollRange], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease),
  });
  const push = interpolate(frame, [0, total], [1.0, 1.02], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${push})`, width: FRAME_W, borderRadius: 16, overflow: "hidden", background: C.ink2, boxShadow: "0 80px 160px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)" }}>
        <div style={{ height: TITLE_H, display: "flex", alignItems: "center", padding: "0 22px", gap: 16, background: C.ink2 }}>
          <div style={{ display: "flex", gap: 10 }}>{["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 15, height: 15, borderRadius: 99, background: c }} />)}</div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ background: C.ink, color: C.goldSoft, fontFamily: SANS, fontSize: 21, padding: "9px 26px", borderRadius: 9, minWidth: 480, textAlign: "center" }}>{section.url}</div>
          </div>
          <div style={{ width: 64 }} />
        </div>
        <div style={{ height: CONTENT_H, overflow: "hidden" }}>
          <Img src={staticFile(section.img)} style={{ width: FRAME_W, transform: `translateY(${y}px)` }} />
        </div>
      </div>
      {/* scrim so the caption reads over busy page content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 260, background: "linear-gradient(180deg, rgba(7,26,47,0) 0%, rgba(7,26,47,0.55) 45%, rgba(7,26,47,0.95) 100%)", pointerEvents: "none" }} />
      {/* lower-third super (narration) */}
      <div style={{ position: "absolute", bottom: 64, width: "100%", textAlign: "center", padding: "0 220px", fontFamily: SANS, fontSize: 37, lineHeight: 1.35, color: C.cream, textShadow: "0 4px 24px rgba(0,0,0,0.9)" }}>
        {section.line}
      </div>
    </AbsoluteFill>
  );
};

const BrandCard: React.FC<{ total: number; closing?: boolean }> = ({ total, closing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = interpolate(frame, [4, 28], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = spring({ frame: frame - 16, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 22 }}>
      <div style={{ position: "relative", lineHeight: 1 }}>
        {Mark(`${C.gold}22`, 170)}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${reveal}%` }}>{Mark(C.gold, 170)}</div>
      </div>
      <div style={{ opacity: rise, fontFamily: SANS, fontSize: 38, letterSpacing: 1, color: C.cream }}>The AI Banking Institute</div>
      {closing && <div style={{ opacity: rise, fontFamily: SANS, fontSize: 25, color: C.goldSoft, letterSpacing: 1 }}>Turning Bankers into Builders · Start with the free assessment</div>}
    </AbsoluteFill>
  );
};

export const totalFrames = () =>
  Math.round((2 + SECTIONS.reduce((s, x) => s + x.seconds, 0) + 3.5) * FPS);

export const SiteWalkthrough: React.FC = () => {
  let at = 0;
  const place = (n: number) => { const f = at; at += n; return f; };
  const open = Math.round(2 * FPS), close = Math.round(3.5 * FPS);
  return (
    <AbsoluteFill>
      <Stage />
      <Sequence from={place(open)} durationInFrames={open}><BrandCard total={open} /></Sequence>
      {SECTIONS.map((s) => {
        const len = Math.round(s.seconds * FPS);
        return <Sequence key={s.img} from={place(len)} durationInFrames={len}><ScrollShot section={s} total={len} /></Sequence>;
      })}
      <Sequence from={place(close)} durationInFrames={close}><BrandCard total={close} closing /></Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
