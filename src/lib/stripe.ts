// Stripe client singleton — server-only.
// Never import this from Client Components or expose to the browser.
// Uses Stripe SDK v22. API version: 2026-03-25.dahlia.

import Stripe from 'stripe';

const { STRIPE_SECRET_KEY } = process.env;

if (!STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY is not set. Add it to .env.local (sk_test_... for dev, sk_live_... for production).'
  );
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
  appInfo: {
    name: 'The AI Banking Institute',
    url: 'https://aibankinginstitute.com',
  },
});
