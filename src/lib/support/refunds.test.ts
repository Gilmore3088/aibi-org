import { describe, expect, it } from 'vitest';
import { evaluateRefundEligibility } from './refunds';

const NOW = new Date('2026-06-22T12:00:00.000Z');

describe('evaluateRefundEligibility', () => {
  it('allows unused Foundation purchases inside the seven-day window', () => {
    const result = evaluateRefundEligibility({
      product: 'foundation',
      purchasedAt: '2026-06-20T12:00:00.000Z',
      completedModules: [1],
      certificateCount: 0,
      now: NOW,
    });

    expect(result.label).toBe('eligible');
    expect(result.eligible).toBe(true);
  });

  it('blocks Foundation refunds after meaningful use', () => {
    const result = evaluateRefundEligibility({
      product: 'foundation',
      purchasedAt: '2026-06-20T12:00:00.000Z',
      completedModules: [1, 2],
      certificateCount: 1,
      now: NOW,
    });

    expect(result.label).toBe('ineligible');
    expect(result.blockers.join(' ')).toContain('Foundation modules');
    expect(result.blockers.join(' ')).toContain('certificate');
  });

  it('blocks submitted In-Depth reports', () => {
    const result = evaluateRefundEligibility({
      product: 'in-depth-assessment',
      purchasedAt: '2026-06-21T12:00:00.000Z',
      assessmentSubmitted: true,
      now: NOW,
    });

    expect(result.label).toBe('ineligible');
    expect(result.blockers.join(' ')).toContain('submitted');
  });

  it('marks already-refunded sessions separately', () => {
    const result = evaluateRefundEligibility({
      product: 'foundation',
      purchasedAt: '2026-06-21T12:00:00.000Z',
      alreadyRefunded: true,
      now: NOW,
    });

    expect(result.label).toBe('already_refunded');
  });
});
