// Phase 2: ScoreRing reveal + "view full comparison" CTA.

import { getTierV2 } from '@content/assessments/v2/scoring';
import { ScoreRing } from '@/app/assessment/_components/ScoreRing';

export function PostAssessmentScorePhase({
  totalScore,
  preScore,
  preTierLabel,
  onViewResults,
}: {
  readonly totalScore: number;
  readonly preScore: number | null;
  readonly preTierLabel: string | null;
  readonly onViewResults: () => void;
}) {
  const tier = getTierV2(totalScore);

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="flex flex-col items-center text-center">
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--gold-a10)',
            color: 'var(--gold-deep)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          Post-course score
        </span>
        <ScoreRing
          score={totalScore}
          minScore={12}
          maxScore={48}
          colorVar={tier.colorVar}
          label={tier.label}
        />
        <h2
          style={{
            fontWeight: 700,
            fontSize: 'clamp(28px, 3.6vw, 40px)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            textAlign: 'center',
            marginTop: 32,
            maxWidth: '36rem',
          }}
        >
          {tier.headline}
        </h2>
        {preScore !== null && (
          <p style={{ fontSize: 15, color: 'var(--slate-600)', marginTop: 16 }}>
            Before the course: score{' '}
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {preScore}
            </span>{' '}
            ({preTierLabel})
          </p>
        )}
      </div>

      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onViewResults}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: 'var(--ink)',
            color: 'var(--cream-2)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color var(--t-fast) var(--ease)',
          }}
        >
          VIEW FULL COMPARISON
        </button>
      </div>
    </div>
  );
}
