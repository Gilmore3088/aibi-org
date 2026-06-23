import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PrintReport } from './PrintReport';
import { getTierV3 } from '@content/assessments/v3/scoring';
import { getTierV2 } from '@content/assessments/v2/scoring';
import {
  DIMENSION_LABELS as V3_LABELS,
  type Dimension as DimensionV3,
} from '@content/assessments/v3/types';
import {
  DIMENSION_LABELS as V2_LABELS,
  type Dimension as DimensionV2,
} from '@content/assessments/v2/types';
import { GAP_CONTENT as V3_GAP_CONTENT } from '@content/assessments/v3/personalization';

// A realistic v3 breakdown: every dimension scored 1-4, total 38, with
// 'documentation' as the weakest (this is the exact shape that crashed the
// route before the v3 migration — v2-keyed lookups returned undefined).
function v3Breakdown(): Record<DimensionV3, { score: number; maxScore: number; label: string }> {
  const scores: Record<DimensionV3, number> = {
    documentation: 1,
    'vendor-awareness': 2,
    'strategic-value': 3,
    'approved-tool-path': 3,
    'data-safety-reflexes': 3,
    'prompting-skill': 4,
    'role-fit': 4,
    'human-review': 4,
    'customer-impact-awareness': 3,
    'workflow-readiness': 3,
    'training-culture': 4,
    'leadership-visibility': 4,
  };
  const out = {} as Record<DimensionV3, { score: number; maxScore: number; label: string }>;
  for (const dim of Object.keys(scores) as DimensionV3[]) {
    out[dim] = { score: scores[dim], maxScore: 4, label: V3_LABELS[dim] };
  }
  return out;
}

function v2Breakdown(): Record<DimensionV2, { score: number; maxScore: number; label: string }> {
  const out = {} as Record<DimensionV2, { score: number; maxScore: number; label: string }>;
  for (const dim of Object.keys(V2_LABELS) as DimensionV2[]) {
    out[dim] = { score: 3, maxScore: 6, label: V2_LABELS[dim] };
  }
  return out;
}

describe('PrintReport (assessment PDF/print body)', () => {
  it('renders a v3 result without crashing and uses v3 content', () => {
    const tier = getTierV3(38);
    const { container } = render(
      <PrintReport
        version="v3"
        tier={tier}
        tierId={tier.id}
        score={38}
        maxScore={48}
        breakdown={v3Breakdown()}
        generatedAt={new Date('2026-06-22T00:00:00Z')}
        firstName={null}
        institutionName={null}
      />,
    );

    const text = container.textContent ?? '';
    // "Documentation" is a v3-only dimension label (v2 has no such key);
    // its presence proves the v3 content pack is wired in.
    expect(text).toContain('Documentation');
    // The weakest-dimension GapDetail must render the v3 gap explanation —
    // this is the exact lookup (GAP_CONTENT['documentation']) that threw
    // "Cannot read properties of undefined" against the v2 map.
    const v3Explanation = V3_GAP_CONTENT.documentation.explanation;
    expect(text).toContain(v3Explanation.slice(0, 40));
  });

  it('renders a legacy v2 result without crashing and uses v2 content', () => {
    const tier = getTierV2(30);
    const { container } = render(
      <PrintReport
        version="v2"
        tier={tier}
        tierId={tier.id}
        score={30}
        maxScore={48}
        breakdown={v2Breakdown()}
        generatedAt={new Date('2026-06-22T00:00:00Z')}
        firstName={null}
        institutionName={null}
      />,
    );

    const text = container.textContent ?? '';
    // "Current AI Usage" is a v2-only dimension label.
    expect(text).toContain('Current AI Usage');
  });
});
