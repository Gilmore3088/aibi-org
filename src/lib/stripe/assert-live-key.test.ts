import { describe, expect, it } from 'vitest';
import { assertProductionStripeKey } from './assert-live-key';

describe('assertProductionStripeKey', () => {
  it('throws on a test key in Vercel production', () => {
    expect(() =>
      assertProductionStripeKey('sk_test_abc123', { VERCEL_ENV: 'production' }),
    ).toThrow(/test-mode key/i);
  });

  it('allows a live key in Vercel production', () => {
    expect(() =>
      assertProductionStripeKey('sk_live_abc123', { VERCEL_ENV: 'production' }),
    ).not.toThrow();
  });

  it('allows a test key in preview', () => {
    expect(() =>
      assertProductionStripeKey('sk_test_abc123', { VERCEL_ENV: 'preview' }),
    ).not.toThrow();
  });

  it('allows a test key locally (VERCEL_ENV unset)', () => {
    expect(() => assertProductionStripeKey('sk_test_abc123', {})).not.toThrow();
  });
});
