import { describe, expect, it } from 'vitest';
import { isFullyRefunded } from './refund';

describe('isFullyRefunded (F3 — partial refunds must not revoke access)', () => {
  it('true when charge.refunded boolean is set', () => {
    expect(isFullyRefunded({ refunded: true, amount: 29500, amount_refunded: 29500 })).toBe(true);
  });

  it('true when amount_refunded covers the full amount even if boolean lags', () => {
    expect(isFullyRefunded({ refunded: false, amount: 9900, amount_refunded: 9900 })).toBe(true);
  });

  it('false for a partial refund (small goodwill credit)', () => {
    expect(isFullyRefunded({ refunded: false, amount: 29500, amount_refunded: 100 })).toBe(false);
  });

  it('false when nothing has been refunded yet', () => {
    expect(isFullyRefunded({ refunded: false, amount: 29500, amount_refunded: 0 })).toBe(false);
  });

  it('false when amount is missing/zero (cannot prove a full refund)', () => {
    expect(isFullyRefunded({ refunded: false, amount: 0, amount_refunded: 0 })).toBe(false);
  });
});
