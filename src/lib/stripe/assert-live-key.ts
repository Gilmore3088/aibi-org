// Production safety guard for the Stripe secret key.
//
// A test-mode key (sk_test_) running in Vercel production is a silent
// foot-gun: real customers are sent through Stripe TEST mode, so their
// cards are never charged, no enrollment money moves, and webhooks fire
// with test data — all while the UI looks like it's working. Fail fast at
// client construction instead of discovering it from missing revenue.
//
// Only the dangerous direction is enforced (test key in production). The
// secret value is never logged or included in the thrown message.

// Record (not a one-prop interface) so process.env (ProcessEnv) is
// assignable without TS's weak-type "no properties in common" error.
type StripeRuntimeEnv = Record<string, string | undefined>;

/**
 * Throws if a Stripe TEST secret key is configured while running in the
 * Vercel production environment. No-op everywhere else (preview, local,
 * CI), where test keys are expected.
 *
 * @param secretKey the value of STRIPE_SECRET_KEY
 * @param env       runtime env (injectable for tests); defaults to process.env
 */
export function assertProductionStripeKey(
  secretKey: string,
  env: StripeRuntimeEnv = process.env,
): void {
  if (env.VERCEL_ENV === 'production' && secretKey.startsWith('sk_test_')) {
    throw new Error(
      'STRIPE_SECRET_KEY is a test-mode key (sk_test_) but VERCEL_ENV is ' +
        '"production". Set a live key (sk_live_) in the Vercel Production ' +
        'environment so real payments are processed.',
    );
  }
}
