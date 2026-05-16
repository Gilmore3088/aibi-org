import { test, expect } from '@playwright/test';

// Marketing smoke tests — no auth required, no DB seeding. These run
// against any environment (local, preview, staging, prod) without setup.
// They're the cheapest signal that a deployment didn't break the home
// page or basic routing.

test.describe('marketing smoke', () => {
  test('homepage renders with tagline', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Banking Institute/i);
    // The tagline is non-negotiable per CLAUDE.md (2026-04-15 decision).
    // It appears in the hero H1 and again in the SiteFooter wordmark; scope
    // to the hero heading so the assertion stays specific.
    await expect(
      page.getByRole('heading', { level: 1, name: /Turning Bankers into Builders/i }),
    ).toBeVisible();
  });

  test('homepage does not contain the banned "FFIEC-aware" phrase', async ({ page }) => {
    // Per CLAUDE.md launch gate: "FFIEC-aware" must not appear anywhere
    // in the deployed site. If this test fails, copy regressed somewhere.
    await page.goto('/');
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/FFIEC-aware/i);
  });

  test('robots.txt disallows /api, /auth, /dashboard', async ({ page }) => {
    const res = await page.goto('/robots.txt');
    expect(res?.status()).toBe(200);
    const body = await page.locator('body').innerText();
    expect(body).toContain('Disallow: /api/');
    expect(body).toContain('Disallow: /auth/');
    expect(body).toContain('Disallow: /dashboard/');
  });

  test('sitemap.xml is reachable and lists the homepage', async ({ page }) => {
    const res = await page.goto('/sitemap.xml');
    expect(res?.status()).toBe(200);
    const body = await page.content();
    // Sitemap should reference the canonical www URL, not the apex.
    expect(body).toContain('https://www.aibankinginstitute.com/');
  });

  test('security headers present on homepage', async ({ request }) => {
    const res = await request.get('/');
    expect(res.headers()['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers()['strict-transport-security']).toContain('max-age=');
    expect(res.headers()['permissions-policy']).toContain('camera=()');
  });

  test('404 page renders for unknown route', async ({ page }) => {
    const res = await page.goto('/this-route-definitely-does-not-exist-xyz');
    // Under COMING_SOON=true the middleware rewrites unknown routes to
    // /coming-soon (200) so crawlers don't surface broken paths during
    // takedown. Detect that case from the response and skip the 404 check.
    const body = await page.locator('body').innerText().catch(() => '');
    if (res?.status() === 200 && /AI noise soon/i.test(body)) {
      test.skip(true, 'COMING_SOON rewrite active — 404 only applies when the real site is live.');
    }
    expect(res?.status()).toBe(404);
  });

  test('assessment landing page renders', async ({ page }) => {
    await page.goto('/assessment');
    await expect(page).toHaveURL(/\/assessment/);
    // Should not 404 or 500.
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(100);
  });

  test('education hub renders', async ({ page }) => {
    await page.goto('/education');
    await expect(page).toHaveURL(/\/education/);
  });

  test('for-institutions renders', async ({ page }) => {
    await page.goto('/for-institutions');
    await expect(page).toHaveURL(/\/for-institutions/);
  });

  test('legacy /services redirects to /for-institutions', async ({ page }) => {
    const res = await page.goto('/services');
    expect(res?.url()).toMatch(/\/for-institutions/);
  });

  test('legacy /courses/aibi-p redirects to /courses/foundation/program', async ({ page }) => {
    const res = await page.goto('/courses/aibi-p');
    expect(res?.url()).toMatch(/\/courses\/foundation\/program/);
  });
});
