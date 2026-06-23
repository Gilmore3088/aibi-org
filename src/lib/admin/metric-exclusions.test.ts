import { describe, expect, it } from 'vitest';
import { filterMetricRowsByEmail, isExcludedMetricEmail, type MetricExclusionConfig } from './metric-exclusions';

const config: MetricExclusionConfig = {
  exactEmails: ['jlgilmore2@gmail.com'],
  wildcardPatterns: ['*@aibankinginstitute.test', 'james.gilmore+*@csiweb.com'],
};

describe('metric exclusions', () => {
  it('excludes default test domains and configured wildcard aliases', () => {
    expect(isExcludedMetricEmail('e2e+abc@aibankinginstitute.test', config)).toBe(true);
    expect(isExcludedMetricEmail('james.gilmore+3@csiweb.com', config)).toBe(true);
    expect(isExcludedMetricEmail('james.gilmore@csiweb.com', config)).toBe(false);
  });

  it('canonicalizes Gmail exact exclusions', () => {
    expect(isExcludedMetricEmail('jlgilmore2+qa@gmail.com', config)).toBe(true);
    expect(isExcludedMetricEmail('j.l.gilmore2+qa@googlemail.com', config)).toBe(true);
  });

  it('filters rows by email accessor', () => {
    const rows = [
      { email: 'buyer@bank.com' },
      { email: 'e2e+abc@aibankinginstitute.test' },
      { email: 'jlgilmore2+qa@gmail.com' },
    ];

    expect(filterMetricRowsByEmail(rows, (row) => row.email, config)).toEqual([{ email: 'buyer@bank.com' }]);
  });
});
