// PROOF of the "product-as-hero" look: your real UI in a browser frame, a real
// cursor, slow camera, clean cuts. Linear/Stripe energy, aibi restraint.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand, fonts } from "./brand";
import { BrowserFrame, Cursor } from "./product/frame";

const S = fonts.sans;

// Deep navy stage with a single soft glow — the product floats on it.
const Stage: React.FC = () => (
  <AbsoluteFill style={{ background: brand.ink }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(60% 50% at 50% 8%, rgba(200,162,74,0.14) 0%, rgba(0,0,0,0) 60%)",
      }}
    />
  </AbsoluteFill>
);

// Subtle film grain so it isn't sterile.
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="ph-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 60} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ph-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const fade = (f: number, t: number, i = 10, o = 10) =>
  interpolate(f, [0, i, t - o, t], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// One product shot: framed screen, slow push, optional cursor.
const Shot: React.FC<{
  total: number;
  src: string;
  url: string;
  cursor?: React.ComponentProps<typeof Cursor>;
  pushTo?: number;
}> = ({ total, src, url, cursor, pushTo = 1.05 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, total], [1.0, pushTo], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${scale})` }}>
        <BrowserFrame src={src} url={url} />
      </div>
      {cursor && <Cursor {...cursor} />}
    </AbsoluteFill>
  );
};

const BrandEnd: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = interpolate(frame, [6, 32], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = spring({ frame: frame - 18, fps, config: { damping: 200 } });
  const Mark = (color: string) => (
    <span style={{ whiteSpace: "nowrap", color, fontFamily: S, fontWeight: 700 }}>
      [A<span style={{ fontFamily: fonts.serif, fontStyle: "italic", fontWeight: 600 }}>i</span>]
    </span>
  );
  return (
    <AbsoluteFill style={{ opacity: fade(frame, total), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
      <div style={{ position: "relative", fontSize: 180, lineHeight: 1 }}>
        {Mark(`${brand.gold}22`)}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${reveal}%` }}>{Mark(brand.gold)}</div>
      </div>
      <div style={{ opacity: rise, fontFamily: S, fontSize: 38, letterSpacing: 1, color: brand.cream }}>The AI Banking Institute</div>
      <div style={{ opacity: rise, fontFamily: S, fontSize: 25, color: brand.goldSoft, letterSpacing: 1 }}>Turning Bankers into Builders · aibankinginstitute.com</div>
    </AbsoluteFill>
  );
};

export const ProductHero: React.FC = () => {
  const A = 150, B = 168, C = 120, D = 96; // frames per scene
  let at = 0;
  const place = (n: number) => { const f = at; at += n; return f; };

  return (
    <AbsoluteFill>
      <Stage />

      <Sequence from={place(A)} durationInFrames={A}>
        <Shot total={A} src="screens/results.png" url="aibankinginstitute.com/assessment/results"
          cursor={{ fromX: 980, fromY: 470, toX: 446, toY: 752, moveStart: 30, moveDur: 34, clickAt: 110 }} />
      </Sequence>

      <Sequence from={place(B)} durationInFrames={B}>
        <Shot total={B} src="screens/sandbox.png" url="aibankinginstitute.com/sandbox"
          cursor={{ fromX: 1040, fromY: 430, toX: 1154, toY: 844, moveStart: 34, moveDur: 36, clickAt: 120 }} />
      </Sequence>

      <Sequence from={place(C)} durationInFrames={C}>
        <Shot total={C} src="screens/toolbox.png" url="aibankinginstitute.com/toolbox" pushTo={1.06} />
      </Sequence>

      <Sequence from={place(D)} durationInFrames={D}>
        <BrandEnd total={D} />
      </Sequence>

      <Grain />
    </AbsoluteFill>
  );
};

export const productHeroFrames = 150 + 168 + 120 + 96;
