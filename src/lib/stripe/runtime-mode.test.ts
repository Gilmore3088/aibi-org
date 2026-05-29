import { describe, expect, it } from 'vitest';
import { assertStripeSecretMatchesRuntime } from './runtime-mode';

describe('assertStripeSecretMatchesRuntime', () => {
  it('rejects test Stripe keys in Vercel production', () => {
    expect(() =>
      assertStripeSecretMatchesRuntime('sk_test_123', { VERCEL_ENV: 'production' }),
    ).toThrow(/test secret key/i);
  });

  it('allows live Stripe keys in Vercel production', () => {
    expect(() =>
      assertStripeSecretMatchesRuntime('sk_live_123', { VERCEL_ENV: 'production' }),
    ).not.toThrow();
  });

  it('allows test Stripe keys outside Vercel production', () => {
    expect(() =>
      assertStripeSecretMatchesRuntime('sk_test_123', { VERCEL_ENV: 'preview' }),
    ).not.toThrow();
  });
});
