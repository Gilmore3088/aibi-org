import { describe, it, expect, vi } from 'vitest';
import {
  EXCLUDED_PAYMENT_METHODS,
  checkoutIdempotencyKey,
  dynamicPaymentMethodDefaults,
} from './checkout-defaults';

describe('dynamicPaymentMethodDefaults', () => {
  it('returns the expected exclusion list (Stripe-recommended DPM pattern)', () => {
    const out = dynamicPaymentMethodDefaults();
    expect(out.excluded_payment_method_types).toEqual([...EXCLUDED_PAYMENT_METHODS]);
  });

  it('does not include payment_method_types — disabling DPM is the anti-pattern', () => {
    const out = dynamicPaymentMethodDefaults() as Record<string, unknown>;
    expect(out.payment_method_types).toBeUndefined();
  });
});

describe('checkoutIdempotencyKey', () => {
  it('returns the same key for the same buyer + product within a minute', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-07T12:34:10Z'));
    const a = checkoutIdempotencyKey({
      product: 'foundation-individual',
      email: 'Buyer@Example.com',
    });
    vi.setSystemTime(new Date('2026-06-07T12:34:55Z'));
    const b = checkoutIdempotencyKey({
      product: 'foundation-individual',
      email: 'buyer@example.com',
    });
    expect(a).toBe(b);
    vi.useRealTimers();
  });

  it('returns a different key once the minute bucket rolls over', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-07T12:34:55Z'));
    const a = checkoutIdempotencyKey({ product: 'in-depth-assessment' });
    vi.setSystemTime(new Date('2026-06-07T12:35:05Z'));
    const b = checkoutIdempotencyKey({ product: 'in-depth-assessment' });
    expect(a).not.toBe(b);
    vi.useRealTimers();
  });

  it('discriminates by product so two SKUs in the same minute do not collide', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-07T12:34:10Z'));
    const a = checkoutIdempotencyKey({
      product: 'foundation-individual',
      email: 'a@example.com',
    });
    const b = checkoutIdempotencyKey({
      product: 'in-depth-assessment',
      email: 'a@example.com',
    });
    expect(a).not.toBe(b);
    vi.useRealTimers();
  });

  it('discriminates by quantity for institution checkouts', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-07T12:34:10Z'));
    const a = checkoutIdempotencyKey({
      product: 'foundation-institution',
      email: 'a@example.com',
      quantity: 10,
    });
    const b = checkoutIdempotencyKey({
      product: 'foundation-institution',
      email: 'a@example.com',
      quantity: 25,
    });
    expect(a).not.toBe(b);
    vi.useRealTimers();
  });
});
