'use client';

// GrowthComparison — dimension-by-dimension pre/post score delta visualization.
// Renders 8 dimension bars showing pre-score, post-score, and improvement.
//
// Ported to mockup design system 2026-05-27 (Inter, ink/cream/gold,
// tabular-nums for numerics).

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

const TNUM: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
const KICKER: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

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
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--ink-a10)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 14, color: 'var(--ink)' }}>{label}</span>
        <span
          style={{
            ...TNUM,
            fontSize: 12,
            fontWeight: 600,
            color: improved ? 'var(--gold-deep)' : 'var(--slate-500)',
          }}
          aria-label={`${improvementLabel} points`}
        >
          {improvementLabel}
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          height: 8,
          borderRadius: 999,
          overflow: 'hidden',
          background: 'var(--ink-a10)',
        }}
        role="img"
        aria-label={`${label}: pre ${preScore ?? 0}, post ${postScore} out of ${maxScore}`}
      >
        {preScore !== null && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              borderRadius: 999,
              background: 'var(--slate-400)',
              width: `${prePct}%`,
            }}
            aria-hidden="true"
          />
        )}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            borderRadius: 999,
            transition: 'width 700ms cubic-bezier(0.4, 0, 0.2, 1)',
            width: `${postPct}%`,
            background: improved ? 'var(--gold)' : 'var(--slate-500)',
          }}
          aria-hidden="true"
        />
      </div>

      <div style={{ marginTop: 4 }}>
        <span style={{ ...TNUM, fontSize: 10, color: 'var(--slate-500)' }}>
          {preScore !== null ? `${preScore} → ` : ''}
          <span style={{ color: 'var(--ink)' }}>{postScore}</span> / {maxScore}
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
      style={{
        background: 'var(--cream)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(24px, 4vw, 32px)',
        boxShadow: 'var(--shadow-soft)',
      }}
      aria-labelledby="growth-heading"
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ ...KICKER, color: 'var(--gold-deep)', margin: '0 0 8px' }}>
          Measure Your Growth
        </p>
        <h2
          id="growth-heading"
          style={{
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'var(--ink)',
            lineHeight: 1.15,
            margin: '0 0 12px',
          }}
        >
          {headline}
        </h2>

        {/* Tier change callout */}
        {moved && preTierLabel && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 16px',
              border: `1px solid ${postTierColorVar}`,
              background: '#FFFFFF',
              borderRadius: 'var(--r-md)',
              marginTop: 8,
            }}
            role="status"
            aria-label={`Tier advanced from ${preTierLabel} to ${postTierLabel}`}
          >
            <span style={{ ...KICKER, color: 'var(--slate-500)' }}>{preTierLabel}</span>
            <span style={{ fontSize: 12, color: 'var(--slate-500)' }} aria-hidden="true">
              →
            </span>
            <span style={{ ...KICKER, color: postTierColorVar, fontWeight: 700 }}>
              {postTierLabel}
            </span>
          </div>
        )}

        {!moved && (
          <p style={{ ...KICKER, color: postTierColorVar, margin: '8px 0 0' }}>
            {postTierLabel}
          </p>
        )}
      </div>

      {/* Score totals */}
      {preScore !== null && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
            marginBottom: 32,
            padding: 16,
            background: '#FFFFFF',
            border: '1px solid var(--ink-a10)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <div>
            <p style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 4px' }}>
              Before Course
            </p>
            <p
              style={{
                ...TNUM,
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--slate-500)',
                margin: 0,
              }}
            >
              {preScore}
              <span style={{ fontSize: 14, fontWeight: 400 }}> / 48</span>
            </p>
          </div>
          <div>
            <p style={{ ...KICKER, color: 'var(--gold-deep)', margin: '0 0 4px' }}>
              After Course
            </p>
            <p
              style={{
                ...TNUM,
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--gold-deep)',
                margin: 0,
              }}
            >
              {postScore}
              <span style={{ fontSize: 14, fontWeight: 400 }}> / 48</span>
            </p>
          </div>
        </div>
      )}

      {/* Dimension breakdown */}
      {sortedDimensions.length > 0 && (
        <div>
          <p style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 16px' }}>
            By Dimension
          </p>
          <div>
            {sortedDimensions.map(([dim, delta]) => (
              <DimensionBar key={dim} dimension={dim} delta={delta} />
            ))}
          </div>
          {preScore !== null && (
            <p
              style={{
                fontSize: 12,
                color: 'var(--slate-500)',
                lineHeight: 1.55,
                marginTop: 16,
              }}
            >
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
