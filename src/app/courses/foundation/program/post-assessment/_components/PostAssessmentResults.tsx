'use client';

import { GrowthComparison } from '../../_components/GrowthComparison';
import { TransformationCard } from '../../_components/TransformationCard';
import { ShareDelta } from '../_local/ShareDelta';
import type { Tier, DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';
import type { ReadinessResult } from '@/lib/user-data';

const SKILLS_BUILT = 3;

interface PostAssessmentResultsProps {
  readonly postTier: Tier;
  readonly totalScore: number;
  readonly preData: ReadinessResult | null;
  readonly dimensionDeltas: Partial<Record<Dimension, { pre: DimensionScore | null; post: DimensionScore }>>;
  readonly saving: boolean;
  readonly saveError: string | null;
  readonly enrollmentId: string;
}

export function PostAssessmentResults({
  postTier,
  totalScore,
  preData,
  dimensionDeltas,
  saving,
  saveError,
  enrollmentId,
}: PostAssessmentResultsProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div
        style={{
          background: 'var(--ink)',
          color: '#fff',
          borderRadius: 28,
          padding: 'clamp(28px, 4vw, 40px)',
          boxShadow: 'var(--shadow-hero)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--gold-a20)',
            color: 'var(--gold-soft)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          AiBI-Foundation · Measure your growth
        </span>
        <h1
          style={{
            fontWeight: 700,
            fontSize: 'clamp(36px, 4.6vw, 56px)',
            lineHeight: 1.04,
            letterSpacing: '-0.028em',
            color: '#fff',
            margin: 0,
          }}
        >
          Your transformation
        </h1>
      </div>

      {saving && (
        <p
          style={{ fontSize: 13, color: 'var(--slate-500)', margin: 0 }}
          aria-live="polite"
        >
          Saving your result...
        </p>
      )}
      {saveError && (
        <p
          style={{ fontSize: 13, color: 'var(--ink)', margin: 0, fontWeight: 600 }}
          role="alert"
          aria-live="assertive"
        >
          {saveError}
        </p>
      )}

      <TransformationCard
        preScore={preData?.score ?? null}
        postScore={totalScore}
        preTierLabel={preData?.tierLabel ?? null}
        postTierLabel={postTier.label}
        postTierColorVar={postTier.colorVar}
        skillsBuilt={SKILLS_BUILT}
        enrollmentId={enrollmentId}
      />

      <GrowthComparison
        preScore={preData?.score ?? null}
        postScore={totalScore}
        preTierId={preData?.tierId ?? null}
        preTierLabel={preData?.tierLabel ?? null}
        postTierId={postTier.id}
        postTierLabel={postTier.label}
        postTierColorVar={postTier.colorVar}
        dimensionDeltas={dimensionDeltas}
      />

      <ShareDelta
        preScore={preData?.score ?? null}
        postScore={totalScore}
        preTierLabel={preData?.tierLabel ?? null}
        postTierLabel={postTier.label}
      />
    </div>
  );
}
