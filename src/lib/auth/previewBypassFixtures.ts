// Synthetic data used to render auth-gated surfaces on preview deploys
// where Supabase isn't configured. Only consumed when
// isPreviewAuthBypassEnabled() is true — never reaches production.
//
// The id parameter is the route's bearer-token UUID. We hash it into a
// score so different URLs produce visually different reports, which is
// the whole point of QA-ing a results page.

import type { AssessmentResponseLoaded } from '@/lib/assessment/load-response';
import { getTierV2, getTierInDepth } from '@content/assessments/v2/scoring';
import type { DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';

const DIMENSIONS: ReadonlyArray<Dimension> = [
  'current-ai-usage',
  'experimentation-culture',
  'ai-literacy-level',
  'quick-win-potential',
  'leadership-buy-in',
  'security-posture',
  'training-infrastructure',
  'builder-potential',
];

// Deterministic hash so the same URL renders the same demo report twice.
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

interface DemoOptions {
  readonly id: string;
  readonly indepth?: boolean;
}

export function buildDemoAssessmentResponse({
  id,
  indepth = false,
}: DemoOptions): AssessmentResponseLoaded {
  const seed = hashId(id);

  // Per-dimension scores. Free flow uses 1–4 per dimension across the 12
  // rotating questions (6 points max per dim is typical); In-Depth runs
  // 6 questions × 4 points = 24 per dimension.
  const maxPerDim = indepth ? 24 : 6;
  const breakdown = {} as Record<Dimension, DimensionScore>;
  let total = 0;
  for (let i = 0; i < DIMENSIONS.length; i++) {
    const dim = DIMENSIONS[i]!;
    // Deterministic pseudo-random across dimensions so the bar chart
    // shows a spread instead of a flat line.
    const noise = (seed >> (i * 3)) & 0xff;
    const pct = 0.25 + (noise / 255) * 0.6; // 25%–85%
    const score = Math.round(pct * maxPerDim);
    breakdown[dim] = { score, maxScore: maxPerDim, label: DIMENSION_LABELS[dim] };
    total += score;
  }

  const maxScore = indepth ? 192 : 48;
  const tier = indepth ? getTierInDepth(total, maxScore) : getTierV2(total);

  return {
    profileId: id,
    email: 'preview@aibankinginstitute.com',
    score: total,
    maxScore,
    tier,
    tierId: tier.id,
    dimensionBreakdown: breakdown,
    readinessAt: new Date().toISOString(),
    role: null,
  };
}
