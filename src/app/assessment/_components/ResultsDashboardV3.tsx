'use client';

import type { Tier, DimensionScore } from '@content/assessments/v3/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v3/types';
import type { Dimension } from '@content/assessments/v3/types';
import {
  PERSONAS,
  MATURITY_LADDER,
  TIER_TO_RUNG,
} from '@content/assessments/v3/personalization';
import { ScoreRing } from './ScoreRing';

interface ResultsDashboardV3Props {
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
 * Top-of-page diagnostic dashboard for v3 (12 dimensions). Score ring +
 * tier badge on the left, all twelve dimensions ranked weakest-first on
 * the right, and a "rung N of 6" footer that previews the maturity
 * ladder below.
 */
export function ResultsDashboardV3({
  score,
  tier,
  tierId,
  subjectName,
  dimensionBreakdown,
}: ResultsDashboardV3Props) {
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
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]">
        Diagnosis
      </p>

      <h2
        id="dashboard-heading"
        className="text-3xl md:text-5xl leading-[1.05] tracking-[-0.01em] text-[color:var(--ink)] max-w-3xl"
      >
        {subjectName} is in the{' '}
        <span className="text-[color:var(--gold)]">{persona.label}</span> phase.
      </h2>
      <p className="text-base md:text-lg text-[color:var(--ink)]/75 leading-relaxed max-w-2xl">
        {persona.oneLine}
      </p>

      <div className="border border-[color:var(--ink)]/20 rounded-2xl bg-[color:var(--cream)] overflow-hidden">
        <div className="grid md:grid-cols-[minmax(280px,320px)_1fr] gap-0">
          <div className="flex flex-col items-center gap-6 p-7 md:p-9 border-b md:border-b-0 md:border-r border-[color:var(--ink)]/15 bg-[color:var(--cream-2)]">
            <ScoreRing
              score={score}
              minScore={12}
              maxScore={48}
              colorVar={tier.colorVar}
              label={tier.label}
            />
            <TierSeal rungIndex={rungIndex} rungLabel={rungLabel} />
          </div>

          <div className="p-7 md:p-9">
            <div className="flex items-baseline justify-between mb-6">
              <p className="text-[13px] uppercase tracking-[0.2em] text-[color:var(--ink)]/75">
                Readiness by dimension
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink)]/55 tabular-nums">
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

        <div className="border-t border-[color:var(--ink)]/15 px-7 md:px-9 py-5 bg-[color:var(--cream-2)] flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="text-[13px] uppercase tracking-[0.2em] text-[color:var(--ink)]/75">
            Rung{' '}
            <span className="text-[color:var(--gold)] tabular-nums tracking-normal text-[15px]">
              {rungIndex + 1}
            </span>{' '}
            of 6 ·{' '}
            <span className="text-[color:var(--ink)] normal-case tracking-normal text-[16px]">
              {rungLabel}
            </span>
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--ink)]/65">
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
    <div className="border border-[color:var(--ink)]/40 rounded-2xl px-5 py-3 text-center max-w-[15rem] bg-[color:var(--cream)]">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--ink)]/65 tabular-nums">
        Rung {rungIndex + 1} of 6
      </p>
      <p className="text-[18px] text-[color:var(--gold)] leading-tight mt-1.5">
        {rungLabel}
      </p>
    </div>
  );
}

function DimensionBar({ row }: { readonly row: RankedRow }) {
  const filled = Math.round(row.pct * 4);
  const isCritical = row.pct < 0.5;
  const isStrong = row.pct >= 0.75;
  const fillColor = isCritical
    ? 'bg-[color:var(--color-error)]'
    : isStrong
      ? 'bg-[color:var(--ink)]/70'
      : 'bg-[color:var(--gold)]';

  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-4 items-baseline">
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <span className="min-w-0 text-[16px] text-[color:var(--ink)] truncate leading-tight">
            {row.label}
          </span>
          <span className="text-[12px] text-[color:var(--ink)]/75 tabular-nums shrink-0">
            {row.score}/{row.maxScore}
          </span>
        </div>
        <div className="flex gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={
                'h-[8px] flex-1 ' +
                (bar < filled ? fillColor : 'bg-[color:var(--ink)]/10')
              }
            />
          ))}
        </div>
      </div>
    </li>
  );
}
