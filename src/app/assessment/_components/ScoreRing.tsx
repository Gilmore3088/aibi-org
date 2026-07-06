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
    <div
      className="flex flex-col items-center"
      role="img"
      aria-label={`Your AI readiness score is ${score} out of ${maxScore}, placing you in the ${label} tier.`}
    >
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--ink)"
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
          <span
            className="leading-none tabular-nums"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '4.5rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
            }}
          >
            {score}
          </span>
          <span
            className="mt-3"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--slate-500)',
            }}
          >
            out of {maxScore}
          </span>
        </div>
      </div>
      <p
        className="mt-6 text-center"
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(1.25rem, 2.4vw, 1.75rem)',
          fontWeight: 700,
          letterSpacing: '-0.015em',
          color: colorVar,
        }}
      >
        {label}
      </p>
    </div>
  );
}
