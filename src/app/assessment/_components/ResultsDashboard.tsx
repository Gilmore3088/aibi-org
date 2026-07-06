'use client';

import type { Tier } from '@content/assessments/v2/scoring';
import type { DimensionScore } from '@content/assessments/v2/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';
import {
  PERSONAS,
  MATURITY_LADDER,
  TIER_TO_RUNG,
} from '@content/assessments/v2/personalization';
import { ScoreRing } from './ScoreRing';

interface ResultsDashboardProps {
  readonly score: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly subjectName: string;
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
}

interface RankedRow {
  readonly id: Dimension;
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
  readonly pct: number;
}

function rank(
  breakdown: Record<Dimension, DimensionScore>,
): ReadonlyArray<RankedRow> {
  return (Object.entries(breakdown) as [Dimension, DimensionScore][])
    .filter(([, d]) => d.maxScore > 0)
    .map(([id, d]) => ({
      id,
      label: DIMENSION_LABELS[id],
      score: d.score,
      maxScore: d.maxScore,
      pct: d.score / d.maxScore,
    }))
    .sort((a, b) => a.pct - b.pct);
}

/**
 * Top-of-page diagnostic dashboard. Ported to the mockup design system
 * (2026-05-27). Score ring + tier badge on the left, eight-dimension
 * ranked list on the right, maturity-ladder footer ribbon. All
 * Ledger token references retired.
 */
export function ResultsDashboard({
  score,
  tier,
  tierId,
  subjectName,
  dimensionBreakdown,
}: ResultsDashboardProps) {
  const persona = PERSONAS[tierId];
  const ranked = rank(dimensionBreakdown);
  const rungIndex = TIER_TO_RUNG[tierId];
  const rungLabel = MATURITY_LADDER[rungIndex]?.label ?? tier.label;

  return (
    <section
      aria-labelledby="dashboard-heading"
      className="space-y-8"
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        animation: 'fadeInUp 700ms cubic-bezier(0.22, 1, 0.36, 1) 200ms both',
      }}
    >
      <p
        className="uppercase"
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: 'var(--gold-deep)',
        }}
      >
        Diagnosis
      </p>

      <h2
        id="dashboard-heading"
        className="max-w-3xl"
        style={{
          fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {subjectName} is in the{' '}
        <span style={{ color: 'var(--gold-deep)' }}>{persona.label}</span> phase.
      </h2>
      <p
        className="max-w-2xl"
        style={{
          fontSize: '1.125rem',
          lineHeight: 1.6,
          color: 'var(--slate-600)',
        }}
      >
        {persona.oneLine}
      </p>

      {/* Dashboard panel — stacks on mobile, side-by-side on md+ */}
      <div
        style={{
          background: 'var(--cream)',
          borderRadius: 24,
          border: '1px solid var(--ink-a10)',
          overflow: 'hidden',
        }}
      >
        <div className="grid md:grid-cols-[minmax(280px,320px)_1fr] gap-0">
          {/* Left — Ring + tier seal */}
          <div
            className="flex flex-col items-center md:border-b-0 md:border-r"
            style={{
              gap: 24,
              padding: 36,
              background: '#fff',
              borderBottom: '1px solid var(--ink-a10)',
              borderRightColor: 'var(--ink-a10)',
            }}
          >
            <ScoreRing
              score={score}
              minScore={12}
              maxScore={48}
              colorVar={tier.colorVar}
              label={tier.label}
            />
            <TierSeal rungIndex={rungIndex} rungLabel={rungLabel} />
          </div>

          {/* Right — 8-dimension chart */}
          <div style={{ padding: 36 }}>
            <div className="flex items-baseline justify-between" style={{ marginBottom: 24 }}>
              <p
                className="uppercase"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: 'var(--ink)',
                }}
              >
                Readiness by dimension
              </p>
              <p
                className="uppercase tabular-nums"
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  color: 'var(--slate-500)',
                }}
              >
                Weakest first
              </p>
            </div>
            <ul className="space-y-4">
              {ranked.map((row) => (
                <DimensionBar key={row.id} row={row} />
              ))}
            </ul>
          </div>
        </div>

        {/* Footer ribbon */}
        <div
          className="flex flex-wrap items-baseline justify-between"
          style={{
            borderTop: '1px solid var(--ink-a10)',
            padding: '20px 36px',
            background: 'var(--cream-2)',
            columnGap: 24,
            rowGap: 8,
          }}
        >
          <p
            className="uppercase"
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'var(--ink)',
            }}
          >
            Rung{' '}
            <span
              className="tabular-nums"
              style={{
                color: 'var(--gold-deep)',
                fontWeight: 700,
                letterSpacing: 'normal',
                fontSize: '0.9375rem',
              }}
            >
              {rungIndex + 1}
            </span>{' '}
            of 6 ·{' '}
            <span
              style={{
                color: 'var(--ink)',
                fontWeight: 600,
                letterSpacing: 'normal',
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {rungLabel}
            </span>
          </p>
          <p
            className="uppercase"
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              color: 'var(--slate-500)',
            }}
          >
            The ladder is below ↓
          </p>
        </div>
      </div>
    </section>
  );
}

function TierSeal({
  rungIndex,
  rungLabel,
}: {
  readonly rungIndex: number;
  readonly rungLabel: string;
}) {
  return (
    <div
      className="text-center"
      style={{
        border: '1px solid var(--ink-a15)',
        borderRadius: 12,
        padding: '12px 20px',
        maxWidth: '15rem',
        background: 'var(--cream)',
      }}
    >
      <p
        className="uppercase tabular-nums"
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: 'var(--slate-500)',
        }}
      >
        Rung {rungIndex + 1} of 6
      </p>
      <p
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--gold-deep)',
          lineHeight: 1.15,
          marginTop: 6,
        }}
      >
        {rungLabel}
      </p>
    </div>
  );
}

function DimensionBar({ row }: { readonly row: RankedRow }) {
  const filled = Math.round(row.pct * 4);
  const isCritical = row.pct < 0.5;
  const isStrong = row.pct >= 0.75;
  // No oxblood/forest. Critical = ink; strong = emerald; mid = gold.
  const fillBg = isCritical
    ? 'var(--ink)'
    : isStrong
      ? 'var(--emerald-700)'
      : 'var(--gold)';

  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-4 items-baseline">
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3" style={{ marginBottom: 8 }}>
          <span
            className="min-w-0 truncate"
            style={{
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}
          >
            {row.label}
          </span>
          <span
            className="tabular-nums shrink-0"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--slate-600)',
            }}
          >
            {row.score}/{row.maxScore}
          </span>
        </div>
        <div className="flex" style={{ gap: 3 }} aria-hidden>
          {[0, 1, 2, 3].map((bar) => (
            <div
              key={bar}
              style={{
                height: 9,
                flex: 1,
                background: bar < filled ? fillBg : 'var(--ink-a10)',
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      </div>
    </li>
  );
}
