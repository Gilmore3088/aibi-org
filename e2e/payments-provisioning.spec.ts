import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import {
  assertNotLiveStripeKey,
  defaultCard,
  fillStripeCheckout,
  STRIPE_TEST_CARDS,
} from './helpers/stripe';
import { cleanupAllSeededUsers, getProvisioningByEmail } from './helpers/seed';

/**
 * Full paid-funnel chain in Stripe TEST MODE:
 *   create-checkout -> hosted Checkout (test card) -> redirect to /purchased
 *   -> webhook checkout.session.completed -> course_enrollments + entitlement.
 *
 * The existing stripe-checkout-roundtrip.spec.ts proves the redirect lands on
 * /purchased. This spec goes one step further and asserts that PROVISIONING
 * actually happened in Supabase — the leg most likely to silently break and
 * the one the read-only sweeps can never see.
 *
 * Requires (all must be present, else self-skips):
 *   - E2E_STRIPE_ROUNDTRIP=true            opt-in (no accidental Stripe hits)
 *   - sk_test_ STRIPE_SECRET_KEY + price IDs (create-checkout returns a URL)
 *   - test webhook wired to the target + STRIPE_WEBHOOK_SECRET_TEST set, so the
 *     event reaches the app under test (dual-secret support in the route)
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + E2E_ALLOW_PRODUCTION_SUPABASE
 *     (to read provisioning + clean up)
 *
 * Guard: refuses to run against a live-mode Stripe key.
 */

const RUN = process.env.E2E_STRIPE_ROUNDTRIP === 'true';
const CAN_VERIFY =
  process.env.E2E_ALLOW_PRODUCTION_SUPABASE === 'true' &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);

function uniqueBuyerEmail(tag: string): string {
  return `e2e+pay-${tag}-${randomBytes(3).toString('hex')}@aibankinginstitute.test`;
}

async function openCheckout(
  request: APIRequestContext,
  endpoint: string,
  email: string,
): Promise<string | null> {
  const res = await request.post(endpoint, { data: { mode: 'individual', user_email: email } });
  if (!res.ok()) {
    const status = res.status();
    const body = await res.text();
    test.skip(
      status === 503 || /missing|not configured|stripe/i.test(body),
      `${endpoint} unavailable (status=${status}); needs sk_test_ STRIPE_SECRET_KEY + price IDs.`,
    );
    throw new Error(`${endpoint} failed unexpectedly: ${status} ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as { url?: string; checkout_url?: string };
  const url = json.url ?? json.checkout_url ?? null;
  expect(url, `${endpoint} must return a Stripe URL`).toBeTruthy();
  expect(url!).toMatch(/checkout\.stripe\.com/);
  return url;
}

async function pollProvisioning(email: string, product: string, timeoutMs = 40_000) {
  const deadline = Date.now() + timeoutMs;
  let last = await getProvisioningByEmail(email, product);
  while (Date.now() < deadline && !last.enrollment) {
    await new Promise((r) => setTimeout(r, 2_000));
    last = await getProvisioningByEmail(email, product);
  }
  return last;
}

test.describe('payments provisioning — Stripe test mode, full chain', () => {
  test.skip(!RUN, 'Opt-in: set E2E_STRIPE_ROUNDTRIP=true to run. Default skipped.');
  test.beforeAll(() => assertNotLiveStripeKey());
  test.setTimeout(180_000);

  test.afterAll(async () => {
    if (CAN_VERIFY) await cleanupAllSeededUsers().catch(() => {});
  });

  for (const product of [
    { key: 'foundation', endpoint: '/api/create-checkout', dbProduct: 'foundation' },
    { key: 'in-depth', endpoint: '/api/checkout/in-depth', dbProduct: 'in-depth-assessment' },
  ]) {
    test(`${product.key}: test-card purchase provisions enrollment + active entitlement`, async ({
      page,
      request,
    }) => {
      const email = uniqueBuyerEmail(product.key);
      const checkoutUrl = await openCheckout(request, product.endpoint, email);

      await page.goto(checkoutUrl!);
      await page.waitForLoadState('networkidle');
      await fillStripeCheckout(page, defaultCard(email));
      await page.getByRole('button', { name: /^pay\b|^subscribe\b/i }).first().click();
      await page.waitForURL(/purchased|success/i, { timeout: 90_000 });

      test.skip(!CAN_VERIFY, 'Provisioning verification needs Supabase service role + E2E_ALLOW_PRODUCTION_SUPABASE=true.');
      const provisioned = await pollProvisioning(email, product.dbProduct);
      expect(provisioned.enrollment, 'webhook should create a course_enrollments row').toBeTruthy();
      expect(provisioned.enrollment!.product).toBe(product.dbProduct);
      expect(provisioned.entitlement, 'entitlements trigger should grant active access').toBeTruthy();
      expect(provisioned.entitlement!.active).toBe(true);
    });
  }

  test('declined card does not redirect to /purchased and provisions nothing', async ({
    page,
    request,
  }) => {
    const email = uniqueBuyerEmail('decline');
    const checkoutUrl = await openCheckout(request, '/api/create-checkout', email);

    await page.goto(checkoutUrl!);
    await page.waitForLoadState('networkidle');
    await fillStripeCheckout(page, defaultCard(email, STRIPE_TEST_CARDS.decline));
    await page.getByRole('button', { name: /^pay\b|^subscribe\b/i }).first().click();

    // Stripe shows an inline decline error and keeps us on checkout.stripe.com.
    await expect(page.getByText(/declin|was not|try a different|card/i).first()).toBeVisible({ timeout: 30_000 });
    expect(page.url()).toMatch(/checkout\.stripe\.com/);

    if (CAN_VERIFY) {
      const provisioned = await getProvisioningByEmail(email, 'foundation');
      expect(provisioned.enrollment, 'a declined payment must not provision access').toBeNull();
    }
  });
});
