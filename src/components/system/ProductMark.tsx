// Line-art Ledger marks for the product ladder. Matches the editorial
// style introduced on /research (1.6 stroke, ink primary, gold accent fill
// on key shapes, square viewBox). Used on marketing tiles where a tile is
// the visual unit and a small mark differentiates it without illustration.

import type { ReactElement } from 'react';

const STROKE = '#0E1B2D';
const GOLD = '#B5862A';
const GOLD_FILL = 'rgba(181,134,42,0.18)';
const GOLD_SOFT = 'rgba(181,134,42,0.10)';

export type ProductMarkKind =
  | 'assessment-free'
  | 'assessment-indepth'
  | 'course-foundation'
  | 'institution-cohort'
  | 'institution-rollout';

interface Props {
  readonly kind: ProductMarkKind;
  readonly size?: number;
  readonly className?: string;
}

export function ProductMark({ kind, size = 56, className }: Props): ReactElement {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: STROKE,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  };

  switch (kind) {
    // Free Assessment — a 12-tick dial with a single gold pointer.
    // Reads as: a quick reading, a small instrument.
    case 'assessment-free':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" fill={GOLD_SOFT} />
          <circle cx="32" cy="32" r="20" />
          {/* Tick marks every 30° */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 32 + 18 * Math.cos(rad);
            const y1 = 32 + 18 * Math.sin(rad);
            const x2 = 32 + 15 * Math.cos(rad);
            const y2 = 32 + 15 * Math.sin(rad);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1} />;
          })}
          {/* Pointer at ~ 11 o'clock (gold) */}
          <line x1="32" y1="32" x2="24" y2="22" stroke={GOLD} strokeWidth={2} />
          <circle cx="32" cy="32" r="2.5" fill={GOLD} stroke="none" />
        </svg>
      );

    // In-Depth Assessment — a magnifier hovering over a document grid.
    // Reads as: deeper scrutiny, a forty-eight-line filing.
    case 'assessment-indepth':
      return (
        <svg {...common}>
          {/* Document */}
          <rect x="10" y="12" width="32" height="40" fill={GOLD_SOFT} />
          <line x1="14" y1="20" x2="34" y2="20" strokeWidth={1} opacity={0.6} />
          <line x1="14" y1="26" x2="38" y2="26" strokeWidth={1} opacity={0.6} />
          <line x1="14" y1="32" x2="30" y2="32" strokeWidth={1} opacity={0.6} />
          <line x1="14" y1="38" x2="36" y2="38" strokeWidth={1} opacity={0.6} />
          <line x1="14" y1="44" x2="28" y2="44" strokeWidth={1} opacity={0.6} />
          {/* Magnifier overlay */}
          <circle cx="44" cy="40" r="10" fill="#F4F1E7" stroke={STROKE} />
          <circle cx="44" cy="40" r="6" fill="none" stroke={STROKE} strokeWidth={1} opacity={0.5} />
          <line x1="51" y1="47" x2="58" y2="54" stroke={GOLD} strokeWidth={2.4} />
        </svg>
      );

    // Foundation course — anvil / structural mark. Builders, not theory.
    case 'course-foundation':
      return (
        <svg {...common}>
          {/* Anvil base */}
          <path d="M14 46 L50 46 L46 54 L18 54 Z" fill={GOLD_FILL} />
          {/* Anvil top */}
          <path d="M10 32 L54 32 L50 40 L14 40 Z" fill={GOLD_FILL} />
          <line x1="14" y1="40" x2="14" y2="46" />
          <line x1="50" y1="40" x2="50" y2="46" />
          {/* Spark mark */}
          <line x1="32" y1="14" x2="32" y2="22" stroke={GOLD} strokeWidth={2} />
          <line x1="26" y1="18" x2="38" y2="18" stroke={GOLD} strokeWidth={1.4} />
          <circle cx="32" cy="26" r="2" fill={GOLD} stroke="none" />
        </svg>
      );

    // Coached cohort — five linked figures at a table.
    case 'institution-cohort':
      return (
        <svg {...common}>
          {/* Table */}
          <ellipse cx="32" cy="42" rx="22" ry="6" fill={GOLD_SOFT} />
          {/* Five seats */}
          {[14, 22, 32, 42, 50].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={26 - (i === 2 ? 2 : 0)} r="3.5" fill={i === 2 ? GOLD : 'none'} stroke={STROKE} />
              <line x1={x} y1={29 - (i === 2 ? 2 : 0)} x2={x} y2="38" />
            </g>
          ))}
        </svg>
      );

    // Institution rollout — a building with a flag.
    case 'institution-rollout':
      return (
        <svg {...common}>
          {/* Building base */}
          <rect x="14" y="22" width="36" height="32" fill={GOLD_SOFT} />
          <line x1="14" y1="54" x2="50" y2="54" strokeWidth={1.2} />
          {/* Columns */}
          <line x1="22" y1="28" x2="22" y2="50" strokeWidth={1} opacity={0.6} />
          <line x1="32" y1="28" x2="32" y2="50" strokeWidth={1} opacity={0.6} />
          <line x1="42" y1="28" x2="42" y2="50" strokeWidth={1} opacity={0.6} />
          {/* Pediment */}
          <path d="M10 22 L32 12 L54 22 Z" fill="none" />
          {/* Flag */}
          <line x1="32" y1="12" x2="32" y2="6" strokeWidth={1} />
          <rect x="32" y="6" width="8" height="4" fill={GOLD} stroke="none" />
        </svg>
      );
  }
}
