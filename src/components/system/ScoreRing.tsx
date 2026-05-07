/**
 * <ScoreRing> — SVG circular progress ring with mono number inside.
 *
 * Used on the assessment results page. Score is a number 12–48 (the V2
 * assessment scale). Tier color is resolved from the score; the ring's
 * filled stroke matches the tier.
 *
 * Accessible: announces the score and tier as a single string in aria-label.
 *
 *   <ScoreRing score={24} maxScore={48} />
 */

import { cn } from "@/lib/utils/cn";
import { tierColor, tierForScore } from "@/lib/design-system/tokens";

export interface ScoreRingProps {
  readonly score: number;
  readonly maxScore?: number;
  readonly size?: number;
  readonly stroke?: number;
  readonly className?: string;
  /** Override the auto-resolved tier label for the aria announcement. */
  readonly ariaTierLabel?: string;
}

const TIER_LABEL: Record<ReturnType<typeof tierForScore>, string> = {
  "starting-point": "Starting Point",
  "early-stage": "Early Stage",
  "building-momentum": "Building Momentum",
  "ready-to-scale": "Ready to Scale",
};

export function ScoreRing({
  score,
  maxScore = 48,
  size = 200,
  stroke = 6,
  className,
  ariaTierLabel,
}: ScoreRingProps) {
  const safe = Math.max(0, Math.min(score, maxScore));
  const ratio = safe / maxScore;
  const tier = tierForScore(safe);
  const fillColor = tierColor(safe);
  const radius = (size - stroke) / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);
  const tierLabel = ariaTierLabel ?? TIER_LABEL[tier];

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ${safe} of ${maxScore}, tier ${tierLabel}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--divider-hairline)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
          style={{ transition: "stroke-dashoffset var(--motion-slow) var(--ease-spring)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p
            className="font-mono tabular-nums text-ink leading-none"
            style={{ fontSize: `${Math.round(size * 0.28)}px` }}
          >
            {safe}
          </p>
          <p className="font-mono text-label-sm uppercase tracking-widest text-slate mt-s2">
            of {maxScore} possible
          </p>
        </div>
      </div>
    </div>
  );
}
