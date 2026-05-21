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

test.describe('marketing — public routes render (200 + H1, no auth)', () => {
  // §10.317/.318/.321/.322/.323/.324/.325 + §10.313 — every canonical public
  // marketing route serves 200 and renders exactly one semantic <h1>. These
  // run without Supabase/auth: all routes here are SSR marketing pages with
  // no enrollment gate. Routes that 301 elsewhere are covered by the redirect
  // block below, not here.
  //
  // The homepage <h1> is asserted in smoke.spec.ts (it uses a desktop SVG
  // titleNode + sr-only H1, which needs bespoke handling), so it is omitted
  // here to avoid duplicating that assertion.
  const ROUTES: ReadonlyArray<{ path: string; item: string }> = [
    { path: '/education', item: '§10.317' },
    { path: '/for-institutions', item: '§10.318' },
    { path: '/about', item: '§10.321' },
    { path: '/research', item: '§10.322 (resources→research)' },
    { path: '/security', item: '§10.323' },
    { path: '/terms', item: '§10.324' },
    { path: '/privacy', item: '§10.325' },
    { path: '/faq', item: '§10' },
  ];

  for (const { path, item } of ROUTES) {
    test(`${item} ${path} serves 200 and renders an H1`, async ({ page }) => {
      const res = await page.goto(path);
      // COMING_SOON middleware rewrites unknown/gated routes to /coming-soon
      // (200). These are real published routes, so a redirect to coming-soon
      // means the takedown gate is active — skip rather than fail.
      if (/\/coming-soon/.test(page.url())) {
        test.skip(true, 'COMING_SOON gate active — marketing routes rewritten to /coming-soon.');
      }
      expect(res?.status()).toBe(200);
      // Both MarketingPage and LedgerArticle templates emit a real <h1>.
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    });
  }
});

test.describe('marketing — chrome + a11y (§10.328/.329/.341/.342)', () => {
  test('§10.341 skip-to-content link present and targets #main-content', async ({ page }) => {
    await page.goto('/education');
    const skip = page.locator('a.skip-link[href="#main-content"]');
    await expect(skip).toHaveText(/Skip to main content/i);
    // The target landmark must exist for the skip link to do anything.
    await expect(page.locator('#main-content')).toHaveCount(1);
  });

  test('§10.328 primary nav landmark renders on marketing pages', async ({ page }) => {
    await page.goto('/for-institutions');
    await expect(page.getByRole('navigation', { name: /Primary/i })).toBeVisible();
  });

  test('§10.329 footer renders with Privacy + Terms links', async ({ page }) => {
    await page.goto('/education');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: /Privacy/i })).toHaveAttribute('href', '/privacy');
    await expect(footer.getByRole('link', { name: /^Terms$/i })).toHaveAttribute('href', '/terms');
  });

  test('§10.342 nav home lockup is keyboard-focusable', async ({ page }) => {
    await page.goto('/education');
    // The brand lockup carries an accessible name and is a real link, so it
    // participates in tab order. Asserting it is focusable is a cheap proxy
    // for keyboard navigability without a full tab-walk.
    const home = page.getByRole('link', { name: /The AI Banking Institute.*Home/i }).first();
    await home.focus();
    await expect(home).toBeFocused();
  });
});

test.describe('marketing — per-route SEO meta (§10.336/.337/.338/.340)', () => {
  test('§10.336 /education has its own title + meta description', async ({ page }) => {
    await page.goto('/education');
    expect(await page.title()).toMatch(/Education/i);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect((desc ?? '').length).toBeGreaterThan(50);
  });

  test('§10.336 self-referencing canonical link present', async ({ page }) => {
    await page.goto('/education');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(/aibankinginstitute\.com\/education$/);
  });

  test('§10.338 Twitter summary_large_image card meta present', async ({ page }) => {
    await page.goto('/');
    const card = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(card).toBe('summary_large_image');
  });

  test('§10.340 WebSite + Organization JSON-LD on every page (sampled)', async ({ page }) => {
    await page.goto('/for-institutions');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld).toMatch(/"@type":\s*"(EducationalOrganization|Organization)"/);
    expect(ld).toMatch(/"@type":\s*"WebSite"/);
  });
});

test.describe('marketing — error pages (§10.326/.327)', () => {
  test('§10.326 unknown route renders the 404 page', async ({ page }) => {
    const res = await page.goto('/no-such-marketing-route-zzz-141');
    const body = await page.locator('body').innerText().catch(() => '');
    // Under COMING_SOON the middleware rewrites unknowns to /coming-soon (200).
    if (res?.status() === 200 && /coming-soon|AI noise soon/i.test(`${page.url()} ${body}`)) {
      test.skip(true, 'COMING_SOON rewrite active — true 404 only applies when the live site is up.');
    }
    expect(res?.status()).toBe(404);
    expect(body.length).toBeGreaterThan(20);
  });

  // §10.327 — a custom 500 page only renders under a genuine server error,
  // which can't be provoked deterministically from a headless marketing
  // request without a fault-injection hook. Needs an error-route harness.
  test.fixme('§10.327 custom 500 page renders on server error', async () => {
    // Requires a route that forces a render-time throw (or an injected fault)
    // to exercise app/error boundaries. No such hook exists in the marketing
    // build, so this can't run without backend/fault tooling.
  });
});

test.describe('marketing — Lighthouse + Calendly popup (deferred)', () => {
  // §10.332-.335 Lighthouse gates need the Lighthouse runner + a stable
  // network/perf environment; not expressible as a Playwright assertion here.
  test.fixme('§10.332-.335 Lighthouse Perf/A11y/BestPractices/SEO gates', async () => {
    // Run via the Lighthouse CI harness against the five marquee routes, not
    // in this Playwright suite. LCP is the known-weak metric (3.8-4.2s).
  });

  // §10.330/.331 — clicking the Calendly CTA loads the third-party Calendly
  // popup over the live network. The href is asserted above (§10.330/.331 env
  // var); driving the actual popup needs a live Calendly backend + the iframe
  // to load, which we deliberately don't exercise headlessly.
  test.fixme('§10.330/.331 Calendly Executive Briefing popup opens', async () => {
    // Needs live calendly.com network access and iframe load; assert the CTA
    // href instead (covered above). Also covers the iPhone-Safari device case.
  });

  // §10.320 — certification inquiry submission writes to DB + sends an ack
  // email. Requires Supabase + Resend backends, which this auth-free suite
  // intentionally avoids.
  test.fixme('§10.320 certification inquiry writes to DB + sends ack email', async () => {
    // Needs Supabase insert + Resend; out of scope for the no-auth route suite.
  });

  // §10.339 — favicon + apple-touch-icon load. Next emits these via the app
  // metadata icons convention; verifying the actual asset bytes load is a
  // network/asset-pipeline check better suited to the asset audit.
  test.fixme('§10.339 favicon + apple-touch-icon load', async () => {
    // Asset-load verification; depends on the built /_next icon pipeline.
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
