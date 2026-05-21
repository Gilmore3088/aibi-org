import { test, expect } from '@playwright/test';
import { normalizeProduct, dbReadValues } from '@/lib/products/normalize';

// AiBI-Foundation course purchase → Stripe webhook → enrollment provisioning.
// Covers issue #137 (launch §6, items 168–192).
//
// What's testable here without live Stripe money or a running webhook:
//   - Purchase page renders with the right price + institutional pricing (168, 169)
//   - Checkout success/cancel URLs are wired (172, 173) — asserted indirectly
//     via request-validation, since the real redirect needs a live Stripe key
//   - create-checkout request validation: mode / quantity / email (170, 171 deps)
//   - Webhook signature verification rejects forged / unsigned events (174 dep)
//   - normalizeProduct + dbReadValues dual-read shim (185, 186, 187, 188)
//
// Skipped (test.fixme) — need a live Stripe sandbox round-trip, a running
// webhook with STRIPE_WEBHOOK_SECRET, a seeded Supabase, or a magic-link inbox.
// These are operator / §20 (CI Stripe-sandbox) territory, not unit-testable.

// ---------------------------------------------------------------------------
// Purchase pages (168, 169)
// ---------------------------------------------------------------------------

test.describe('foundation purchase — public page', () => {
  test('§6.168 /courses/foundation/program/purchase renders with the $295 price', async ({
    page,
  }) => {
    await page.goto('/courses/foundation/program/purchase');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText();
    // Per-seat price on the enroll strip.
    expect(body).toMatch(/\$295/);
    // The page leads with the AiBI-Foundation product.
    expect(body).toMatch(/AiBI-Foundation|AI Banking\s*Foundation/i);
  });

  test('§6.169 institutional pricing ($199 at 10+ seats) renders', async ({ page }) => {
    await page.goto('/courses/foundation/program/purchase');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').innerText();
    expect(body).toMatch(/\$199/);
    expect(body).toMatch(/10\+\s*seats/i);
  });
});

// ---------------------------------------------------------------------------
// create-checkout request validation (170/171 deps, mode/quantity/email)
// ---------------------------------------------------------------------------
//
// We cannot assert the real Stripe Checkout opens (needs STRIPE_FOUNDATION_PRICE_ID
// + a live Stripe key — see fixme below). But the route validates the request
// shape BEFORE touching Stripe, so the 400 paths are deterministic and run
// without any external dependency. A correctly-shaped request returns 503
// when no price id is configured (local/preview) or 200 with a Stripe url
// when it is — we accept both so the test is environment-agnostic.

test.describe('create-checkout — request validation', () => {
  test('§6 rejects a missing / invalid mode with 400', async ({ request }) => {
    const res = await request.post('/api/create-checkout', {
      data: { mode: 'nonsense' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/mode must be/i);
  });

  test('§6 rejects invalid JSON body with 400', async ({ request }) => {
    const res = await request.post('/api/create-checkout', {
      data: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(400);
  });

  test('§6.171 institution mode requires quantity >= 10 (integer)', async ({ request }) => {
    const res = await request.post('/api/create-checkout', {
      data: { mode: 'institution', quantity: 5, institution_name: 'Test CU' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/quantity >= 10/i);
  });

  test('§6.171 institution mode requires a non-empty institution_name', async ({ request }) => {
    const res = await request.post('/api/create-checkout', {
      data: { mode: 'institution', quantity: 12, institution_name: '   ' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/institution_name is required/i);
  });

  test('§6 rejects a malformed user_email with 400', async ({ request }) => {
    const res = await request.post('/api/create-checkout', {
      data: { mode: 'individual', user_email: 'not-an-email' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/valid email/i);
  });

  test('§6.170 a well-formed individual request reaches the Stripe step (200 or 503, never a validation 400)', async ({
    request,
  }) => {
    // Past validation, the route either creates a session (200 {url}) or
    // returns 503 when STRIPE_FOUNDATION_PRICE_ID isn't configured. It must
    // NOT return a 400 — that would mean a validation regression.
    const res = await request.post('/api/create-checkout', {
      data: { mode: 'individual' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([200, 503], `unexpected status ${res.status()}`).toContain(res.status());
    if (res.status() === 200) {
      const json = (await res.json()) as { url?: string };
      expect(typeof json.url).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// Webhook signature verification (174 dep — provisioning gate)
// ---------------------------------------------------------------------------
//
// The webhook MUST verify stripe.webhooks.constructEvent before any
// provisioning. A forged or unsigned event must never reach
// provisionEnrollment(). The route returns 400 on a missing/invalid
// signature, OR 503 when STRIPE_WEBHOOK_SECRET is unset (local/preview) —
// both correctly refuse to provision. We assert "rejected, not 200, not a
// 500 stack leak".

test.describe('stripe webhook — signature gate', () => {
  test('§6.174 rejects an unsigned checkout.session.completed event', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: {
        id: 'evt_forged',
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_forged', metadata: { product: 'foundation', mode: 'individual' } } },
      },
      headers: { 'Content-Type': 'application/json' },
    });
    // 400 (missing signature) or 503 (no webhook secret) — never provisions.
    expect([400, 503], `unexpected status ${res.status()}`).toContain(res.status());
  });

  test('§6.174 rejects an event with a forged signature', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: {
        id: 'evt_forged',
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_forged', metadata: { product: 'aibi-p', mode: 'individual' } } },
      },
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 't=1700000000,v1=deadbeefdeadbeefdeadbeefdeadbeef',
      },
    });
    expect([400, 503], `unexpected status ${res.status()}`).toContain(res.status());
    expect(res.status()).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// Normalize dual-read shim (185, 186, 187, 188) — pure-function unit coverage
// ---------------------------------------------------------------------------
//
// src/lib/products/normalize.ts has no server/Next dependencies, so it imports
// directly into the Playwright runner. This is the cheapest reliable coverage
// for the legacy 'aibi-p' → canonical 'foundation' rename shim that the webhook
// and create-checkout both lean on.

test.describe('product normalize shim', () => {
  test("§6.185 dbReadValues('foundation') returns legacy + canonical variants", () => {
    expect(dbReadValues('foundation')).toEqual(['aibi-p', 'foundation']);
  });

  test('§6.185 dbReadValues for non-foundation products returns only the canonical value', () => {
    expect(dbReadValues('aibi-s')).toEqual(['aibi-s']);
    expect(dbReadValues('aibi-l')).toEqual(['aibi-l']);
  });

  test("§6.186 normalizeProduct('aibi-p') returns 'foundation'", () => {
    expect(normalizeProduct('aibi-p')).toBe('foundation');
  });

  test("§6.188 normalizeProduct('foundation') returns 'foundation'", () => {
    expect(normalizeProduct('foundation')).toBe('foundation');
  });

  test('§6 normalizeProduct passes through other canonical slugs and rejects unknowns', () => {
    expect(normalizeProduct('aibi-s')).toBe('aibi-s');
    expect(normalizeProduct('aibi-l')).toBe('aibi-l');
    expect(normalizeProduct('totally-unknown')).toBeNull();
    expect(normalizeProduct(null)).toBeNull();
    expect(normalizeProduct(undefined)).toBeNull();
  });

  // §6.187 — normalizeProduct('foundations') (plural backfill) → 'foundation'.
  // The issue lists this as expected behaviour, but the current shim only maps
  // 'aibi-p' and the canonical set {foundation, aibi-s, aibi-l, toolbox-only};
  // 'foundations' (plural) is NOT in that set and currently normalizes to null.
  // The plural backfill is handled at the env-var layer (STRIPE_FOUNDATIONS_*),
  // not in normalizeProduct. Flagging rather than asserting a contract the code
  // does not implement — confirm intent before locking this in.
  test.fixme(
    "§6.187 normalizeProduct('foundations') should return 'foundation' (plural backfill)",
    () => {
      expect(normalizeProduct('foundations' as never)).toBe('foundation');
    },
  );
});

// ---------------------------------------------------------------------------
// Items requiring a live Stripe sandbox round-trip / seeded Supabase / inbox
// (§20 CI Stripe-sandbox + operator). Recorded as fixme with a one-line reason.
// ---------------------------------------------------------------------------

test.describe('foundation purchase — live round-trip (operator / §20)', () => {
  test.fixme('§6.170 Stripe Checkout opens with STRIPE_FOUNDATION_PRICE_ID', async () => {
    // Needs a live/test Stripe key + price id; redirect lands on checkout.stripe.com.
  });

  test.fixme(
    '§6.171 institution Checkout opens with STRIPE_FOUNDATION_INSTITUTION_PRICE_ID',
    async () => {
      // Needs the institution price id + live/test Stripe key.
    },
  );

  test.fixme('§6.172 success URL lands at /courses/foundation/program/purchased', async () => {
    // Needs a completed sandbox checkout to follow the success_url redirect.
  });

  test.fixme('§6.173 cancel URL returns to /purchase', async () => {
    // Needs a real Stripe Checkout session to exercise the cancel_url.
  });

  test.fixme(
    "§6.174 webhook inserts course_enrollments with product='foundation'",
    async () => {
      // Needs a signed event (STRIPE_WEBHOOK_SECRET) + seeded Supabase to read back the row.
    },
  );

  test.fixme(
    "§6.175 webhook handles legacy metadata.product='aibi-p' and 'foundation' via shim",
    async () => {
      // Needs a signed event round-trip; the shim itself is unit-covered above (§6.186).
    },
  );

  test.fixme('§6.176 individual purchase triggers course-purchase-individual Resend template', async () => {
    // Needs a signed event + Resend (no sandbox; SKIP_RESEND suppresses it on preview).
  });

  test.fixme('§6.177 10+ seat purchase triggers course-purchase-institution template', async () => {
    // Needs a signed institution event + Resend.
  });

  test.fixme('§6.178 purchaser subscribed to MailerLite Foundation group', async () => {
    // Needs a signed event + live MailerLite (no sandbox; SKIP_MAILERLITE on preview).
  });

  test.fixme('§6.179 post-purchase magic-link email arrives within 60s', async () => {
    // Needs a real inbox (.test TLD never delivers) + Supabase auth-admin magic link.
  });

  test.fixme(
    '§6.180 enrolled user on /courses/foundation/program sees overview, not purchase',
    async () => {
      // Needs a seeded enrolled user + Supabase session (grantFoundationEnrollment + loginViaUI).
    },
  );

  test.fixme(
    '§6.181 unenrolled user on /courses/foundation/program/3 redirects to purchase',
    async () => {
      // Needs a seeded authenticated-but-unenrolled session against real Supabase.
    },
  );

  test.fixme('§6.182 already-enrolled user sees "already enrolled" page (no double charge)', async () => {
    // Needs a seeded enrolled session; the purchase page branches on getEnrollment().
  });

  test.fixme('§6.183 course_enrollments.user_id binds on first login', async () => {
    // Needs an anonymous-purchase row (user_id=null) + a subsequent login to bind it.
  });

  test.fixme('§6.184 anonymous purchase creates user_id=null row, binds on signup', async () => {
    // Needs a signed webhook event without a matching user + later signup.
  });

  test.fixme('§6.189 entitlement row created on successful enrollment', async () => {
    // Needs a signed event + the sync_entitlement_from_enrollment trigger against real DB.
  });

  test.fixme('§6.190 refund within 7 days revokes entitlement', async () => {
    // Needs a sandbox charge.refunded event + entitlement read-back.
  });

  test.fixme("§6.191 Stripe price changes don't break existing enrollments", async () => {
    // Needs historical enrollment rows + a changed price id in a sandbox account.
  });

  test.fixme('§6.192 /dashboard shows enrolled courses', async () => {
    // Needs a seeded enrolled + authenticated session against real Supabase.
  });
});
