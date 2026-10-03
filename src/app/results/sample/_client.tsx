'use client';

// /results/sample — the free readiness report, shown with illustrative data.
// It renders the real ResultsViewV3, so the sample can never drift from
// what a banker actually receives. Numbers match page 2 of
// public/downloads/sample-readiness-report.pdf (36 / 48, Building Momentum,
// top gap Documentation) and are labelled as sample data.

import { getTierV3, type DimensionScore } from '@content/assessments/v3/scoring';
import { DIMENSION_LABELS, type Dimension } from '@content/assessments/v3/types';
import { ResultsViewV3 } from '@/app/assessment/_components/ResultsViewV3';

/** One answer per topic, 1–4. Sums to 36; Documentation is the single lowest. */
export const SAMPLE_ANSWERS: Readonly<Record<Dimension, number>> = {
  'strategic-value': 3,
  'approved-tool-path': 4,
  'data-safety-reflexes': 4,
  'prompting-skill': 4,
  'role-fit': 3,
  'human-review': 2,
  documentation: 1,
  'vendor-awareness': 3,
  'customer-impact-awareness': 3,
  'workflow-readiness': 2,
  'training-culture': 4,
  'leadership-visibility': 3,
};

export const SAMPLE_SCORE = Object.values(SAMPLE_ANSWERS).reduce((a, b) => a + b, 0);

function sampleBreakdown(): Record<Dimension, DimensionScore> {
  return Object.fromEntries(
    (Object.keys(SAMPLE_ANSWERS) as Dimension[]).map((id) => [
      id,
      { score: SAMPLE_ANSWERS[id], maxScore: 4, label: DIMENSION_LABELS[id] },
    ]),
  ) as Record<Dimension, DimensionScore>;
}

export default function SampleResultsPage() {
  const tier = getTierV3(SAMPLE_SCORE);
  return (
    <div className="rv-sample">
      <p className="rv-sample-bar" role="note">
        <strong>Sample report</strong> — illustrative data only. Your own report appears right after{' '}
        <a href="/assessment/take">the 12-question assessment</a>.{' '}
        <a href="/api/resources/sample-readiness-report/download">Download the sample (PDF)</a>
      </p>
      <ResultsViewV3
        score={SAMPLE_SCORE}
        tier={tier}
        tierId={tier.id}
        dimensionBreakdown={sampleBreakdown()}
        profileId={null}
      />
    </div>
  );
}
