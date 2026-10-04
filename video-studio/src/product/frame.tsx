// Product-as-hero building blocks: a clean browser window wrapping a real
// screenshot, and a cursor that moves + clicks. Linear/Stripe aesthetic.
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { brand, fonts } from "../brand";

export const BrowserFrame: React.FC<{
  src: string;
  url: string;
  width?: number;
}> = ({ src, url, width = 1500 }) => (
  <div
    style={{
      width,
      borderRadius: 16,
      overflow: "hidden",
      background: brand.ink2,
      boxShadow:
        "0 80px 160px rgba(0,0,0,0.55), 0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
    }}
  >
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: "0 22px",
        gap: 16,
        background: brand.ink2,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 15, height: 15, borderRadius: 99, background: c }} />
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            background: brand.ink,
            color: brand.goldSoft,
            fontFamily: fonts.sans,
            fontSize: 21,
            padding: "9px 26px",
            borderRadius: 9,
            minWidth: 460,
            textAlign: "center",
            letterSpacing: 0.3,
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ width: 64 }} />
    </div>
    <img src={staticFile(src)} alt="" style={{ display: "block", width: "100%" }} />
  </div>
);

// A pointer that eases from → to, with an optional click ripple.
export const Cursor: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  moveStart?: number;
  moveDur?: number;
  clickAt?: number;
}> = ({ fromX, fromY, toX, toY, moveStart = 12, moveDur = 28, clickAt }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [moveStart, moveStart + moveDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const x = interpolate(t, [0, 1], [fromX, toX]);
  const y = interpolate(t, [0, 1], [fromY, toY]);

  const ripple =
    clickAt !== undefined
      ? interpolate(frame, [clickAt, clickAt + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const press =
    clickAt !== undefined
      ? interpolate(frame, [clickAt - 3, clickAt, clickAt + 6], [1, 0.88, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {clickAt !== undefined && ripple > 0 && ripple < 1 && (
        <div
          style={{
            position: "absolute",
            left: toX,
            top: toY,
            width: 90 * ripple,
            height: 90 * ripple,
            transform: "translate(-50%,-50%)",
            borderRadius: 99,
            border: `3px solid ${brand.gold}`,
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `scale(${press})`,
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
        }}
      >
        <path
          d="M5 3l14 7-6 1.5L9 19l-1.5-6.5L5 3z"
          fill="#fff"
          stroke={brand.ink}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </AbsoluteFill>
  );
};
