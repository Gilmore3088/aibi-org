'use client';

import type { TopicScore } from '@/lib/user-data';

interface RadarChartProps {
  readonly scores: readonly TopicScore[];
  readonly size?: number;
}

const GRID_LEVELS = [25, 50, 75, 100];

export function RadarChart({ scores, size = 280 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const n = scores.length;
  if (n < 3) return null;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function polarToXY(angle: number, r: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  function polygonPoints(valueFn: (i: number) => number): string {
    return scores
      .map((_, i) => {
        const angle = startAngle + i * angleStep;
        const [x, y] = polarToXY(angle, valueFn(i));
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <>
    <svg width={size} height={size} className="mx-auto" aria-hidden="true">
      {/* Grid rings */}
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={polygonPoints(() => (level / 100) * radius)}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {scores.map((_, i) => {
        const angle = startAngle + i * angleStep;
        const [x, y] = polarToXY(angle, radius);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--color-ink)"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints((i) => (scores[i].pct / 100) * radius)}
        fill="var(--color-terra)"
        fillOpacity={0.15}
        stroke="var(--color-terra)"
        strokeWidth={2}
      />

      {/* Data points */}
      {scores.map((score, i) => {
        const angle = startAngle + i * angleStep;
        const [x, y] = polarToXY(angle, (score.pct / 100) * radius);
        return (
          <circle
            key={score.topic}
            cx={x}
            cy={y}
            r={4}
            fill="var(--color-terra)"
          />
        );
      })}

      {/* Labels */}
      {scores.map((score, i) => {
        const angle = startAngle + i * angleStep;
        const labelR = radius + 24;
        const [x, y] = polarToXY(angle, labelR);
        const isLeft = x < cx - 10;
        const isRight = x > cx + 10;
        return (
          <text
            key={score.topic}
            x={x}
            y={y}
            textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
            dominantBaseline="middle"
            fill="var(--color-ink)"
            fillOpacity={0.7}
            fontSize={10}
            fontFamily="var(--font-serif-sc)"
            letterSpacing="0.5px"
          >
            {score.label.split(' ').slice(0, 2).join(' ')}
          </text>
        );
      })}
    </svg>
    <div className="sr-only">
      <table>
        <caption>Proficiency skill breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Topic</th>
            <th scope="col">Score</th>
            <th scope="col">Correct/Total</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score) => (
            <tr key={score.topic}>
              <td>{score.label}</td>
              <td>{score.pct}%</td>
              <td>{score.correct}/{score.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
