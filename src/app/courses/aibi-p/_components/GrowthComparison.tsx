'use client';

// GrowthComparison — dimension-by-dimension pre/post score delta visualization.
// Renders 8 dimension bars showing pre-score, post-score, and improvement.
// Uses CSS variables only. All numbers in DM Mono. Institutional tone.

import type { Dimension } from '@content/assessments/v2/types';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { DimensionScore } from '@content/assessments/v2/scoring';

interface DimensionDelta {
  readonly pre: DimensionScore | null;
  readonly post: DimensionScore;
}

interface GrowthComparisonProps {
  readonly preScore: number | null;
  readonly postScore: number;
  readonly preTierId: string | null;
  readonly preTierLabel: string | null;
  readonly postTierId: string;
  readonly postTierLabel: string;
  readonly postTierColorVar: string;
  readonly dimensionDeltas: Partial<Record<Dimension, DimensionDelta>>;
}

const TIER_ORDER = ['starting-point', 'early-stage', 'building-momentum', 'ready-to-scale'];

function tierProgressed(preTierId: string | null, postTierId: string): boolean {
  if (!preTierId) return false;
  return TIER_ORDER.indexOf(postTierId) > TIER_ORDER.indexOf(preTierId);
}

function formatImprovement(pre: number | null, post: number): string {
  if (pre === null || pre === 0) return `+${post}`;
  const delta = post - pre;
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return '—';
}

interface DimensionBarProps {
  readonly dimension: Dimension;
  readonly delta: DimensionDelta;
}

function DimensionBar({ dimension, delta }: DimensionBarProps) {
  const label = DIMENSION_LABELS[dimension];
  const maxScore = delta.post.maxScore;
  const preScore = delta.pre?.score ?? null;
  const postScore = delta.post.score;

  const prePct = preScore !== null ? (preScore / maxScore) * 100 : 0;
  const postPct = (postScore / maxScore) * 100;
  const improved = preScore === null ? false : postScore > preScore;
  const improvementLabel = formatImprovement(preScore, postScore);

  return (
    <div className="py-4 border-b border-[color:var(--color-ink)]/8 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-sm text-[color:var(--color-ink)]">{label}</span>
        <span
          className="font-mono text-xs tabular-nums"
          style={{ color: improved ? 'var(--color-terra)' : 'var(--color-dust)' }}
          aria-label={`${improvementLabel} points`}
        >
          {improvementLabel}
        </span>
      </div>

      <div
        className="relative h-2 rounded-full overflow-hidden bg-[color:var(--color-ink)]/8"
        role="img"
        aria-label={`${label}: pre ${preScore ?? 0}, post ${postScore} out of ${maxScore}`}
      >
        {/* Pre-score bar (ghost) */}
        {preScore !== null && (
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-[color:var(--color-ink)]/20"
            style={{ width: `${prePct}%` }}
            aria-hidden="true"
          />
        )}
        {/* Post-score bar */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${postPct}%`,
            backgroundColor: improved ? 'var(--color-terra)' : 'var(--color-dust)',
          }}
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="font-mono text-[10px] tabular-nums text-[color:var(--color-dust)]">
          {preScore !== null ? `${preScore} → ` : ''}
          <span style={{ color: 'var(--color-ink)' }}>{postScore}</span>
          {' '}/ {maxScore}
        </span>
      </div>
    </div>
  );
}

export function GrowthComparison({
  preScore,
  postScore,
  preTierId,
  preTierLabel,
  postTierId,
  postTierLabel,
  postTierColorVar,
  dimensionDeltas,
}: GrowthComparisonProps) {
  const moved = tierProgressed(preTierId, postTierId);
  const totalImprovement =
    preScore !== null && preScore > 0
      ? Math.round(((postScore - preScore) / preScore) * 100)
      : null;

  const headline =
    totalImprovement !== null
      ? `Your AI readiness improved by ${Math.abs(totalImprovement)}%`
      : `Your AI readiness score: ${postScore} out of 48`;

  const sortedDimensions = Object.entries(dimensionDeltas) as [Dimension, DimensionDelta][];

  return (
    <section
      className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-sm p-6 sm:p-8"
      aria-labelledby="growth-heading"
    >
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-2">
          Measure Your Growth
        </p>
        <h2
          id="growth-heading"
          className="font-serif text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] leading-tight mb-3"
        >
          {headline}
        </h2>

        {/* Tier change callout */}
        {moved && preTierLabel && (
          <div
            className="inline-flex items-center gap-3 px-4 py-2 border rounded-sm mt-2"
            style={{
              borderColor: postTierColorVar,
              backgroundColor: 'var(--color-linen)',
            }}
            role="status"
            aria-label={`Tier advanced from ${preTierLabel} to ${postTierLabel}`}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)]">
              {preTierLabel}
            </span>
            <span className="font-mono text-[10px] text-[color:var(--color-dust)]" aria-hidden="true">
              →
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: postTierColorVar }}
            >
              {postTierLabel}
            </span>
          </div>
        )}

        {!moved && (
          <p
            className="font-mono text-[10px] uppercase tracking-widest mt-2"
            style={{ color: postTierColorVar }}
          >
            {postTierLabel}
          </p>
        )}
      </div>

      {/* Score totals */}
      {preScore !== null && (
        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/8 rounded-sm">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)] mb-1">
              Before Course
            </p>
            <p className="font-mono text-3xl tabular-nums text-[color:var(--color-dust)]">
              {preScore}
              <span className="text-base font-normal"> / 48</span>
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-1">
              After Course
            </p>
            <p className="font-mono text-3xl tabular-nums text-[color:var(--color-terra)]">
              {postScore}
              <span className="text-base font-normal"> / 48</span>
            </p>
          </div>
        </div>
      )}

      {/* Dimension breakdown */}
      {sortedDimensions.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-dust)] mb-4">
            By Dimension
          </p>
          <div>
            {sortedDimensions.map(([dim, delta]) => (
              <DimensionBar key={dim} dimension={dim} delta={delta} />
            ))}
          </div>
          {preScore !== null && (
            <p className="font-sans text-xs text-[color:var(--color-dust)] mt-4 leading-relaxed">
              Ghost bars reflect your pre-course scores. Solid bars are post-course.
              Each session draws from different questions, so per-dimension scores
              reflect the questions served in that session.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
