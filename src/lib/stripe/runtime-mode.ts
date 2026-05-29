type StripeRuntimeEnv = Record<string, string | undefined>;

export function assertStripeSecretMatchesRuntime(
  secretKey: string,
  env: StripeRuntimeEnv = process.env,
): void {
  if (env.VERCEL_ENV === 'production' && secretKey.startsWith('sk_test_')) {
    throw new Error(
      'Production Stripe config is using a test secret key. Set STRIPE_SECRET_KEY to an sk_live_ key in the Vercel Production environment.'
    );
  }
}
