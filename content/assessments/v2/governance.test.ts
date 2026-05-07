import { describe, it, expect } from 'vitest';
import {
  getGovernanceFor,
  GOVERNANCE_BY_DIMENSION,
  type GovernanceAttrs,
} from './governance';
import { DIMENSION_LABELS } from './types';

describe('GOVERNANCE_BY_DIMENSION', () => {
  it('covers every dimension', () => {
    for (const dim of Object.keys(DIMENSION_LABELS)) {
      expect(GOVERNANCE_BY_DIMENSION[dim as keyof typeof GOVERNANCE_BY_DIMENSION]).toBeDefined();
    }
  });

  it('every entry has all five attributes populated', () => {
    for (const [dim, attrs] of Object.entries(GOVERNANCE_BY_DIMENSION)) {
      expect(attrs.riskLevel, dim).toMatch(/^(Low|Moderate|Elevated)$/);
      expect(attrs.governanceComplexity, dim).toMatch(/^(None|Policy update|Formal review)$/);
      expect(attrs.dataSensitivity, dim).toMatch(/^(Public|Internal|Confidential|NPI)$/);
      expect(attrs.humanReview, dim).toMatch(/^(Optional|Recommended|Required)$/);
      expect(attrs.examinerDefensibility.length, dim).toBeGreaterThan(40);
    }
  });
});

describe('getGovernanceFor', () => {
  it('returns the dimension default', () => {
    const attrs: GovernanceAttrs = getGovernanceFor('security-posture');
    expect(attrs.riskLevel).toBe('Elevated');
  });
});
