import { describe, expect, it } from 'vitest';
import { proficiencyLevels } from './scoring';

describe('exam result copy', () => {
  it('quotes the current course price and name', () => {
    const copy = proficiencyLevels.map((l) => `${l.summary} ${l.recommendation}`).join(' ');
    // The course is $295 everywhere else (pricing page, /courses). A stale
    // "$97" here told low scorers the wrong price on a credential page.
    for (const price of copy.match(/\$\d+/g) ?? []) expect(price).toBe('$295');
    expect(copy).not.toMatch(/AI Foundations (course|curriculum)/);
  });
});
