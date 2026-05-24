// DimensionScorecard — renders all 8 readiness dimensions, sorted high→low,
// flagging the lowest-scoring dimension(s) as "focus first."
//
// Input is the dimension_scores jsonb from addie.assessment_results plus the
// max-per-dimension (defaults to 24 = 6 questions × 4 points each).

import {
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  DEFAULT_DIMENSION_MAX,
  type DimensionKey,
} from '@/lib/addie/assessment/dimensions';
import { ScoreBar } from './ScoreBar';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export interface DimensionScorecardProps {
  readonly dimension_scores: Readonly<Record<string, number>>;
  /** Override the per-dimension max if the runner used a non-default scale. */
  readonly perDimensionMax?: number;
}

interface RankedDim {
  readonly key: DimensionKey;
  readonly label: string;
  readonly score: number;
  readonly pct: number;
}

function rank(
  scores: Readonly<Record<string, number>>,
  max: number,
): readonly RankedDim[] {
  const rows: RankedDim[] = DIMENSION_KEYS.map((key) => {
    const score = Number.isFinite(scores[key]) ? scores[key] : 0;
    const pct = max > 0 ? (score / max) * 100 : 0;
    return { key, label: DIMENSION_LABELS[key], score, pct };
  });
  rows.sort((a, b) => b.score - a.score);
  return rows;
}

export function DimensionScorecard({
  dimension_scores,
  perDimensionMax = DEFAULT_DIMENSION_MAX,
}: DimensionScorecardProps) {
  const rows = rank(dimension_scores, perDimensionMax);
  // "Focus first" = bottom score (ties included).
  const minScore = rows.length > 0 ? rows[rows.length - 1].score : 0;
  const focusKeys = new Set(
    rows.filter((r) => r.score === minScore && r.score < perDimensionMax).map((r) => r.key),
  );

  return (
    <section
      aria-labelledby="dimension-scorecard-heading"
      className="space-y-6"
    >
      <header className="space-y-1">
        <KickerLabel tone="muted">Deliverable 1 of 4</KickerLabel>
        <h2
          id="dimension-scorecard-heading"
          className="font-serif text-2xl text-[var(--ledger-ink)]"
        >
          Dimensional scorecard
        </h2>
        <p className="text-sm text-[var(--ledger-muted)]">
          Eight readiness dimensions. Highest to lowest. The lowest scoring
          dimension is where to focus first.
        </p>
      </header>

      <ul className="space-y-5">
        {rows.map((r) => (
          <li key={r.key}>
            <ScoreBar
              label={r.label}
              score={r.score}
              max={perDimensionMax}
              emphasis={focusKeys.has(r.key) ? 'focus' : 'default'}
              footnote={focusKeys.has(r.key) ? 'Focus first' : null}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
