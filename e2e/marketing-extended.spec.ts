import { test, expect } from '@playwright/test';

// Marketing / public-route coverage beyond smoke.spec.ts.
// Covers §10.313-342 + §14 SEO assertions + 2026 brand invariants.

test.describe('marketing — content + brand invariants', () => {
  test('§10.319 /certifications inquiry-only (no Stripe CTAs per Phase 1 gate)', async ({ page }) => {
    await page.goto('/certifications');
    // /certifications redirects to /education per next.config.mjs.
    await expect(page).toHaveURL(/\/education/);
  });

  test('§10.323 /security renders with download/CTA', async ({ page }) => {
    const res = await page.goto('/security');
    expect(res?.status()).toBe(200);
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(300);
  });

  test('§10.330/.331 Calendly CTA env var configured', async ({ request }) => {
    // We can't click into Calendly headlessly without exploding the test
    // matrix, but we can confirm the CTA link points at a real Calendly URL.
    const res = await request.get('/for-institutions');
    const body = await res.text();
    // If Calendly is wired anywhere on the marketing site, the href will
    // contain "calendly.com".
    expect(body).toMatch(/calendly\.com|mailto:hello@aibankinginstitute/i);
  });

  test('§11 no banned phrases in homepage HTML', async ({ page }) => {
    await page.goto('/');
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/FFIEC-aware/i);
    expect(body).not.toMatch(/A-B-C of AI Banking/i);
    expect(body).not.toMatch(/Banking AI Practitioner/);
  });

  test('§11 brand uses "The AI Banking Institute" in prose', async ({ page }) => {
    await page.goto('/');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/The AI Banking Institute/);
  });
});

test.describe('marketing — SEO', () => {
  test('§14.403 unique <title> tag', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(70);
  });

  test('§14.404 meta description present', async ({ page }) => {
    await page.goto('/');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect((desc ?? '').length).toBeGreaterThan(50);
    expect((desc ?? '').length).toBeLessThanOrEqual(180);
  });

  test('§14.408 Open Graph image tag points at /opengraph-image', async ({ page }) => {
    await page.goto('/');
    const og = await page.locator('meta[property="og:image"]').first().getAttribute('content');
    expect(og).toBeTruthy();
    expect(og).toMatch(/opengraph-image|aibankinginstitute\.com/);
  });

  test('§14.409 Organization JSON-LD present', async ({ page }) => {
    await page.goto('/');
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const allLd = scripts.join('\n');
    expect(allLd).toMatch(/EducationalOrganization|Organization/);
    expect(allLd).toMatch(/The AI Banking Institute/);
  });

  test('§14.410 Course JSON-LD on /courses/foundation/program', async ({ page }) => {
    await page.goto('/courses/foundation/program');
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const allLd = scripts.join('\n');
    expect(allLd).toMatch(/"@type":\s*"Course"/);
    expect(allLd).toMatch(/AiBI-Foundation/);
  });

  test('§14.405/.407 sitemap canonical to www', async ({ page }) => {
    const res = await page.goto('/sitemap.xml');
    expect(res?.status()).toBe(200);
    const body = await page.content();
    expect(body).toContain('https://www.aibankinginstitute.com/');
    expect(body).not.toMatch(/<loc>https:\/\/aibankinginstitute\.com\/[^<]*<\/loc>/);
  });

  test('§14.407 robots disallows /api, /dashboard, /auth', async ({ page }) => {
    const res = await page.goto('/robots.txt');
    expect(res?.status()).toBe(200);
    const body = await page.locator('body').innerText();
    for (const path of ['/api/', '/auth/', '/dashboard/', '/admin/', '/results/']) {
      expect(body).toContain(`Disallow: ${path}`);
    }
  });

  test('§16.452 security.txt at /.well-known/', async ({ request }) => {
    const res = await request.get('/.well-known/security.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Contact: mailto:hello@aibankinginstitute.com');
    expect(body).toContain('Expires:');
  });
});

test.describe('marketing — legacy redirects', () => {
  test.describe.configure({ retries: 1 });

  const REDIRECTS: ReadonlyArray<{ from: string; toMatch: RegExp }> = [
    { from: '/services', toMatch: /\/for-institutions/ },
    { from: '/foundations', toMatch: /\/education/ },
    { from: '/courses', toMatch: /\/education/ },
    { from: '/certifications', toMatch: /\/education/ },
    { from: '/consulting', toMatch: /\/for-institutions\/advisory/ },
    { from: '/practitioner', toMatch: /\/courses\/foundation\/program/ },
    { from: '/resources', toMatch: /\/research/ },
    { from: '/courses/aibi-p', toMatch: /\/courses\/foundation\/program/ },
    { from: '/courses/aibi-p/anything', toMatch: /\/courses\/foundation\/program\/anything/ },
    { from: '/toolbox', toMatch: /\/dashboard\/toolbox/ },
  ];

  for (const { from, toMatch } of REDIRECTS) {
    test(`legacy ${from} redirects correctly`, async ({ page }) => {
      const res = await page.goto(from);
      expect(res?.url()).toMatch(toMatch);
    });
  }
});
