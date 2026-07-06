import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getTierV3, type DimensionScore } from '@content/assessments/v3/scoring';
import { DIMENSION_LABELS, type Dimension } from '@content/assessments/v3/types';
import { ResultsViewV3 } from './ResultsViewV3';

function dimensionBreakdown(): Record<Dimension, DimensionScore> {
  const entries = (Object.keys(DIMENSION_LABELS) as Dimension[]).map((id, index) => [
    id,
    {
      score: index === 0 ? 1 : 3,
      maxScore: 4,
      label: DIMENSION_LABELS[id],
    },
  ]);
  return Object.fromEntries(entries) as Record<Dimension, DimensionScore>;
}

const tier = getTierV3(34);

describe('ResultsViewV3', () => {
  it('adds a mission-aware lens for explicit MDI and community-development institutions', () => {
    render(
      <ResultsViewV3
        score={34}
        tier={tier}
        tierId={tier.id}
        dimensionBreakdown={dimensionBreakdown()}
        institutionName="Unity MDI Community Bank"
        profileId={null}
      />,
    );

    expect(screen.getByLabelText(/mission lens/i)).toBeTruthy();
    expect(screen.getByText(/Unity MDI Community Bank.?s capacity and trust goals/i)).toBeTruthy();
    expect(screen.getByText(/MDI, CDFI, and community-development institutions/i)).toBeTruthy();
    expect(screen.getByText(/Measure recaptured staff time/i)).toBeTruthy();
  });

  it('does not show the mission lens for generic institution names', () => {
    render(
      <ResultsViewV3
        score={34}
        tier={tier}
        tierId={tier.id}
        dimensionBreakdown={dimensionBreakdown()}
        institutionName="First Federal Credit Union"
        profileId={null}
      />,
    );

    expect(screen.queryByLabelText(/mission lens/i)).toBeNull();
  });

  it('renders the staffing-reality stripe when an asset band was shared', () => {
    render(
      <ResultsViewV3
        score={34}
        tier={tier}
        tierId={tier.id}
        dimensionBreakdown={dimensionBreakdown()}
        institutionName="First Federal Credit Union"
        profileId={null}
        assetBand="under-150m"
      />,
    );

    expect(screen.getByTestId('staffing-reality')).toBeTruthy();
    expect(screen.getByText(/for an institution under \$150M/i)).toBeTruthy();
    expect(screen.getByText(/one named owner/i)).toBeTruthy();
  });

  it('renders nothing size-specific when the asset band was skipped', () => {
    render(
      <ResultsViewV3
        score={34}
        tier={tier}
        tierId={tier.id}
        dimensionBreakdown={dimensionBreakdown()}
        institutionName="First Federal Credit Union"
        profileId={null}
        assetBand={null}
      />,
    );

    expect(screen.queryByTestId('staffing-reality')).toBeNull();
  });
});
