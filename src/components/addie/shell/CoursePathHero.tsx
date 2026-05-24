// CoursePathHero — animated SVG that traces the six-module arc.
// Server component; the stroke-draw animation is CSS only and only fires
// when prefers-reduced-motion is not set (see addie-course-surface.css).

import { ModuleIllustration } from '@/components/addie/illustrations/ModuleIllustration';

interface CoursePathHeroProps {
  readonly currentOrdinal?: number;
}

const NODES: Array<{ x: number; y: number; label: string; ord: number }> = [
  { x: 60,  y: 100, label: 'M0 Orientation',   ord: 0 },
  { x: 200, y: 60,  label: 'M1 Awareness',     ord: 1 },
  { x: 340, y: 100, label: 'M2 Access',        ord: 2 },
  { x: 480, y: 60,  label: 'M3 Prompting',     ord: 3 },
  { x: 620, y: 100, label: 'M4 Skills',        ord: 4 },
  { x: 760, y: 60,  label: 'M5 Build',         ord: 5 },
];

function buildPath(): string {
  // Smooth Bezier through the 6 nodes; visual rhythm, not geometric precision.
  let d = `M ${NODES[0].x} ${NODES[0].y}`;
  for (let i = 1; i < NODES.length; i++) {
    const prev = NODES[i - 1];
    const cur = NODES[i];
    const midX = (prev.x + cur.x) / 2;
    d += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`;
  }
  return d;
}

export function CoursePathHero({ currentOrdinal = 0 }: CoursePathHeroProps) {
  const path = buildPath();
  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox="0 0 820 160"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Course path: six modules from orientation to build."
        className="w-full h-auto min-w-[640px]"
      >
        {/* Hairline guide */}
        <line
          x1="40" y1="135" x2="780" y2="135"
          stroke="var(--ledger-rule)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        {/* Animated stroke */}
        <path
          d={path}
          fill="none"
          stroke="var(--ledger-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          className="addie-path-stroke"
        />
        {/* Node markers */}
        {NODES.map((n) => {
          const done = n.ord < currentOrdinal;
          const current = n.ord === currentOrdinal;
          return (
            <g key={n.label}>
              <circle
                cx={n.x}
                cy={n.y}
                r={current ? 9 : 6}
                fill={done || current ? 'var(--ledger-accent)' : 'var(--ledger-paper)'}
                stroke={done || current ? 'var(--ledger-accent)' : 'var(--ledger-rule-strong)'}
                strokeWidth="1.5"
                className={current ? 'addie-path-pulse' : ''}
              />
              <text
                x={n.x}
                y={n.y + 28}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="9"
                letterSpacing="1.6"
                fill="var(--ledger-muted)"
              >
                {n.label.split(' ')[0]}
              </text>
              <text
                x={n.x}
                y={n.y + 42}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="8"
                letterSpacing="1.4"
                fill="var(--ledger-muted)"
              >
                {n.label.split(' ').slice(1).join(' ').toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Mini-thumbs row beneath the path (mobile friendly) */}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
        {(['m0', 'm1', 'm2', 'm3', 'm4', 'm5'] as const).map((id) => (
          <div
            key={id}
            data-reveal
            data-reveal-delay={(id.charCodeAt(1) - '0'.charCodeAt(0)) as number}
            className="border border-[var(--ledger-rule)] rounded-[3px] p-2 bg-[var(--ledger-paper)]"
          >
            <ModuleIllustration module={id} />
          </div>
        ))}
      </div>
    </div>
  );
}
