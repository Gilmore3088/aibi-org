// Synthetic sample In-Depth briefing for /assessment/in-depth/results/preview.
//
// The cohort dashboard's "See the individual briefing format" CTA
// (src/app/assessment/in-depth/access/page.tsx) and any marketing link point
// at the reserved `preview` id. Without a handler that id fell through to the
// UUID guard in loadAssessmentResponse() and 404'd. This builds a fully
// populated PaidReport from the canonical v4 scoring pipeline so the preview
// always matches the exact shape a real report uses.

import { questions } from '@content/assessments/v4/questions';
import {
  getDimensionScores,
  normalize,
  getMaturityBand,
} from '@content/assessments/v4/scoring';
import type { Dimension, MaturityBand } from '@content/assessments/v4/types';
import type { RoleV4 } from '@content/assessments/v4/roles';
import type { DimensionScoreSerializedV4 } from '@/lib/assessment/load-response';

export interface SampleInDepthReport {
  readonly profileId: string;
  readonly email: string;
  readonly score: number;
  readonly band: MaturityBand;
  readonly role: RoleV4 | null;
  readonly dimensionBreakdown: Record<Dimension, DimensionScoreSerializedV4>;
  readonly readinessAt: string;
  readonly institutionContext: null;
}

// A believable mid-maturity profile: strong on access + data security, with
// clear gaps in model risk, bounded autonomy, and governance. Values are on
// the 1-4 per-question answer scale, applied uniformly across each dimension's
// six questions.
const SAMPLE_LEVELS: Record<Dimension, number> = {
  'ai-access-architecture': 3,
  'model-risk-validation': 2,
  'compliance-explainability': 3,
  'data-security-guardrails': 4,
  'workflow-orchestration': 3,
  'bounded-autonomy-human-review': 2,
  'vendor-risk-interoperability': 3,
  'governance-roles-human-capital': 2,
};

export function buildSampleInDepthReport(): SampleInDepthReport {
  const answers = questions.map((q) => SAMPLE_LEVELS[q.dimension]);
  const raw = answers.reduce((sum, n) => sum + n, 0);
  const score = normalize(raw);
  const band = getMaturityBand(score);

  const breakdown = getDimensionScores(answers, questions);
  const dimensionBreakdown = {} as Record<Dimension, DimensionScoreSerializedV4>;
  for (const dim of Object.keys(breakdown) as Dimension[]) {
    dimensionBreakdown[dim] = {
      score: breakdown[dim].normalized,
      maxScore: 100,
      label: breakdown[dim].label,
    };
  }

  return {
    profileId: 'preview',
    email: 'sample@aibankinginstitute.com',
    score,
    band,
    role: 'compliance-risk',
    dimensionBreakdown,
    readinessAt: '2026-01-15T00:00:00.000Z',
    institutionContext: null,
  };
}
