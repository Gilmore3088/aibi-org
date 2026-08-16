import { test, expect } from '@playwright/test';

// In-Depth Assessment — covers §5.128-167 of tasks/launch-checklist.md.
//
// Public path (no auth, no Stripe call): verify the landing page leads
// with the paid product, the entitlement gate works for /take, and the
// purchase exemption holds for the marketing surface.
//
// Skipped here (need Supabase env + Stripe test webhooks):
//   - §5.130-134 — webhook signature, idempotency, alternate event types
//   - §5.135-136 — post-purchase magic-link email round-trip
//   - §5.138-167 — the 48-question flow itself (needs an entitled user)

test.describe('in-depth assessment — public surface', () => {
  test('§5.128 /assessment/in-depth lists product details + primary purchase CTA', async ({
    page,
  }) => {
    await page.goto('/assessment/in-depth');
    await page.waitForLoadState('networkidle');

    // Primary CTA must lead with the paid product (Wave 1 fix per
    // 2026-05-17 commit ba87655 — was previously buried below the fold).
    const primary = page.getByRole('button', {
      name: /purchase in-depth.*99/i,
    });
    await expect(primary.first()).toBeVisible({ timeout: 5_000 });

    // The page also lists the price and deliverables.
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/\$99/);
    expect(body).toMatch(/eight readiness dimensions|48 questions|forty-eight/i);
  });

  test('§5.128b secondary CTA still surfaces the free 12-question assessment', async ({
    page,
  }) => {
    await page.goto('/assessment/in-depth');
    const free = page.getByRole('link', {
      name: /free 12-question|12-question version/i,
    });
    await expect(free.first()).toBeVisible({ timeout: 5_000 });
  });

  test('§5.137 /assessment/in-depth/take redirects unauthenticated visitors to /auth/login', async ({
    page,
  }) => {
    await page.goto('/assessment/in-depth/take');
    // Page-level gate: auth check redirects to /auth/login with ?next=
    await expect(page).toHaveURL(/\/auth\/login.*next=.*in-depth/);
  });

  test('§5 — no-purchase visitors see the gentle "purchase required" notice', async ({
    page,
  }) => {
    // The /assessment/in-depth page accepts ?reason=no-purchase, set by
    // the /take page when an authenticated user lacks the entitlement.
    // Visitors who arrive via that path see the explanatory banner.
    await page.goto('/assessment/in-depth?reason=no-purchase');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/purchase required|paid|unlock it/i);
  });
});
