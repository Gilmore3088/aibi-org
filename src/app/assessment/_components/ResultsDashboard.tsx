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
 * Top-of-page diagnostic dashboard. Replaces the prior single-ring
 * diagnosis with a denser panel: score ring + tier badge on the left,
 * all eight dimensions ranked weakest-first on the right, and a
 * "rung 3 of 6" footer that previews the maturity ladder below. Goal
 * is to put every number a reader will care about above the fold and
 * connect fluidly into the maturity ladder + signature insight that
 * follow.
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
      style={{ animation: 'fadeInUp 700ms cubic-bezier(0.22, 1, 0.36, 1) 200ms both' }}
    >
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Diagnosis
      </p>

      <h2
        id="dashboard-heading"
        className="font-serif text-3xl md:text-5xl leading-[1.05] tracking-[-0.01em] text-[color:var(--color-ink)] max-w-3xl"
      >
        {subjectName} is in the{' '}
        <span className="text-[color:var(--color-terra)]">{persona.label}</span> phase.
      </h2>
      <p className="text-base md:text-lg text-[color:var(--color-ink)]/75 leading-relaxed max-w-2xl">
        {persona.oneLine}
      </p>

      {/* Dashboard panel */}
      <div className="border border-[color:var(--color-ink)]/20 rounded-[3px] bg-[color:var(--color-linen)] overflow-hidden">
        <div className="grid md:grid-cols-[auto_1fr] gap-0">
          {/* Left — Ring + tier seal */}
          <div className="flex flex-col items-center gap-5 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[color:var(--color-ink)]/15 bg-[color:var(--color-parch)]">
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
          <div className="p-6 md:p-8">
            <div className="flex items-baseline justify-between mb-5">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/65">
                Readiness by dimension
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50 tabular-nums">
                Weakest first
              </p>
            </div>
            <ul className="space-y-3">
              {ranked.map((row) => (
                <DimensionBar key={row.id} row={row} />
              ))}
            </ul>
          </div>
        </div>

        {/* Footer ribbon — bridges into the maturity ladder */}
        <div className="border-t border-[color:var(--color-ink)]/15 px-6 md:px-8 py-4 bg-[color:var(--color-parch)] flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/65">
            Rung{' '}
            <span className="text-[color:var(--color-terra)] font-mono tabular-nums tracking-normal">
              {rungIndex + 1}
            </span>{' '}
            of 6 ·{' '}
            <span className="text-[color:var(--color-ink)]">{rungLabel}</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55">
            The ladder is below. The first move follows it.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tier seal — a small ledger-style stamp showing the rung position.
// Stays inside the Ledger discipline: no gradients, hairline rule only.
// ---------------------------------------------------------------------------

function TierSeal({
  rungIndex,
  rungLabel,
}: {
  readonly rungIndex: number;
  readonly rungLabel: string;
}) {
  return (
    <div className="border border-[color:var(--color-ink)]/30 rounded-[3px] px-4 py-2 text-center max-w-[14rem]">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 tabular-nums">
        Rung {rungIndex + 1} of 6
      </p>
      <p className="font-serif text-[15px] text-[color:var(--color-ink)] leading-tight mt-1">
        {rungLabel}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dimension bar — label · 4-segment fill · score numerator
// ---------------------------------------------------------------------------

function DimensionBar({ row }: { readonly row: RankedRow }) {
  const filled = Math.round(row.pct * 4);
  const isCritical = row.pct < 0.5;
  const isStrong = row.pct >= 0.75;
  const fillColor = isCritical
    ? 'bg-[color:var(--color-error)]'
    : isStrong
      ? 'bg-[color:var(--color-ink)]/70'
      : 'bg-[color:var(--color-terra)]';

  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-4 items-baseline">
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <span className="min-w-0 font-serif text-[15px] text-[color:var(--color-ink)] truncate">
            {row.label}
          </span>
          <span className="font-mono text-[11px] text-[color:var(--color-ink)]/65 tabular-nums shrink-0">
            {row.score}/{row.maxScore}
          </span>
        </div>
        <div className="flex gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={
                'h-[6px] flex-1 ' +
                (bar < filled ? fillColor : 'bg-[color:var(--color-ink)]/10')
              }
            />
          ))}
        </div>
      </div>
    </li>
  );
}
