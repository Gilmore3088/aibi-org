'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  readonly score: number;
  readonly minScore: number;
  readonly maxScore: number;
  readonly colorVar: string;
  readonly label: string;
}

// SVG ring — strokeDasharray animation per developer-spec.
const SIZE = 240;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

export function ScoreRing({ score, minScore, maxScore, colorVar, label }: ScoreRingProps) {
  const [animatedPct, setAnimatedPct] = useState(0);

  const targetPct =
    maxScore === minScore ? 0 : (score - minScore) / (maxScore - minScore);
  const clampedTarget = Math.min(Math.max(targetPct, 0), 1);

  useEffect(() => {
    // Start at 0, animate to target on mount
    const id = requestAnimationFrame(() => setAnimatedPct(clampedTarget));
    return () => cancelAnimationFrame(id);
  }, [clampedTarget]);

  const dashOffset = CIRC * (1 - animatedPct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity={0.08}
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={colorVar}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 1500ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-6xl text-[color:var(--color-ink)] leading-none">
            {score}
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/50 mt-2">
            out of {maxScore}
          </span>
        </div>
      </div>
      <p
        className="font-serif text-2xl md:text-3xl mt-6 text-center"
        style={{ color: colorVar }}
      >
        {label}
      </p>
    </div>
  );
}
