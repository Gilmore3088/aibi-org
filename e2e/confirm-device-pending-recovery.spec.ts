// Proves the fix for the "auth-login" remediation issue: paid buyers stranded
// on the device-trust holding page /auth/confirm-device-pending now have a
// sessionless escape hatch instead of a dead-end resend button.
//
// Pre-fix: the holding page only offered a "Resend confirmation email" button
// that POSTs /api/auth/check-device, which returns 401 with no live session —
// so a buyer arriving without a session (bank gateway filtered/expired the
// single magic link) could only loop back to /auth/login. The two sessionless
// recovery endpoints PR #517 added to /auth/login were never exposed here.
//
// Post-fix: the holding page renders both recovery forms (EMAIL ME A SIGN-IN
// LINK + RESEND PURCHASE LINK), forwards the real `next` destination into the
// resend body (GAP B), and when check-device says 401 it points the buyer at
// the sessionless sign-in-link form instead of only "Sign in again".
//
// The holding page is a client component with no server-side gating, so this
// spec needs NO seeded Supabase user. It runs in a fresh context with NO
// session cookie and NO trusted-device cookie, and intercepts the API calls
// with page.route to keep the assertions deterministic.
//
// Run: PLAYWRIGHT_BASE_URL=http://localhost:3000 \
//      E2E_ALLOW_PRODUCTION_SUPABASE=true \
//      npx playwright test e2e/confirm-device-pending-recovery.spec.ts

import { test, expect } from '@playwright/test';

const EMAIL = 'e2e+confirm-recovery@aibankinginstitute.test';
const NEXT = '/assessment/in-depth/take';

test.describe('confirm-device-pending recovery (auth-login fix)', () => {
  test('exposes sessionless recovery forms and forwards next', async ({ page }) => {
    await page.goto(
      `/auth/confirm-device-pending?email=${encodeURIComponent(EMAIL)}&next=${encodeURIComponent(NEXT)}`,
      { waitUntil: 'commit' },
    );

    // (2) Both recovery buttons must exist. Pre-fix they did not — this is the
    //     proof the gap is closed.
    const emailLinkButton = page.getByRole('button', { name: /email me a sign-in link/i });
    const purchaseLinkButton = page.getByRole('button', { name: /resend purchase link/i });
    await expect(emailLinkButton).toBeVisible();
    await expect(purchaseLinkButton).toBeVisible();

    // (3) Intercept the sessionless send-sign-in-link endpoint and assert the
    //     forwarded next + email reach the request body (proves GAP B), then
    //     return the generic anti-enumeration success copy.
    let sentBody: { email?: string; next?: string } | null = null;
    await page.route('**/api/auth/send-sign-in-link', async (route) => {
      sentBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          message: 'If that email can sign in, a one-time link is on its way.',
        }),
      });
    });

    // The page may prefill the email; set it explicitly to be deterministic.
    const emailLinkForm = page.locator('form', { has: emailLinkButton });
    await emailLinkForm.getByLabel('Email').fill(EMAIL);
    await emailLinkButton.click();

    await expect
      .poll(() => sentBody)
      .toEqual(expect.objectContaining({ email: EMAIL, next: NEXT }));

    // Generic success status renders.
    await expect(page.getByText(/a one-time link is on its way/i)).toBeVisible();

    // (4) The legacy resend button hits /api/auth/check-device, which returns
    //     401 with no live session. The UI must now reveal/point at the
    //     fallback form instead of only "Sign in again".
    await page.route('**/api/auth/check-device', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not authenticated.' }),
      });
    });

    await page.getByRole('button', { name: /resend confirmation email/i }).click();

    // The no-session fallback copy must appear and steer the buyer to the
    // sessionless sign-in-link form (not only "Sign in again").
    await expect(page.getByText(/could not confirm a live session/i)).toBeVisible();
    await expect(emailLinkButton).toBeVisible();
  });
});
