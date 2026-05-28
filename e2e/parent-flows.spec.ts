import { test, expect, type Page } from '@playwright/test';

/**
 * Parent-page user-flow coverage — one test per top-level marketing route.
 *
 * Goal: prove the primary CTA on each parent page actually advances the
 * user toward conversion, on both desktop and mobile viewports. These are
 * shallow smokes — they don't drive Stripe, MailerLite, or Supabase
 * end-to-end (those have dedicated specs: course-purchase.spec.ts,
 * stripe-checkout-roundtrip.spec.ts, assessment-flow.spec.ts).
 *
 * Pages covered:
 *   / (home)               — hero CTA reaches /assessment
 *   /assessment             — primary CTA reaches /assessment/take
 *   /courses                — enroll CTA reaches /courses/foundation/program/purchase
 *   /for-institutions       — "Book a briefing" CTA opens Calendly URL
 *   /research               — download click opens an inline email gate
 *
 * Filed under the 2026-05-28 funnel-audit goal: each parent page must
 * have a working forward path. Tests intentionally do NOT submit forms
 * or trigger emails — they only verify the navigation reaches the
 * expected target surface.
 */

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

async function gotoStable(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

test.describe('parent flows — desktop', () => {
  test.use({ viewport: DESKTOP });

  test('/ — hero CTA navigates to /assessment(/take)', async ({ page }) => {
    await gotoStable(page, '/');
    // The primary CTA on home is "Get my AI readiness score" linking to the
    // assessment funnel. Accept either /assessment or /assessment/take as
    // the target — copy / wiring may evolve.
    const cta = page
      .getByRole('link', { name: /get my ai readiness score|take the assessment|start (the )?assessment/i })
      .first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toMatch(/^\/assessment(\/take)?$|^\/assessment\/?(\?.*)?$/);
  });

  test('/ — value-path row distinguishes free vs paid tiers (#354)', async ({ page }) => {
    await gotoStable(page, '/');
    const body = await page.locator('body').innerText();
    // After #354, each value-path card carries a "Free" or "In Foundation course" tier badge.
    // Accept either string casing.
    expect(body).toMatch(/Free/);
    expect(body).toMatch(/In Foundation course|Foundation course/i);
  });

  test('/ — price strip surfaces Free, $99, $295 (#353)', async ({ page }) => {
    await gotoStable(page, '/');
    const body = await page.locator('body').innerText();
    // The home page must surface budget bands without requiring a navigation click.
    expect(body).toMatch(/\$99\b/);
    expect(body).toMatch(/\$295\b/);
  });

  test('/assessment — primary CTA reaches /assessment/take', async ({ page }) => {
    await gotoStable(page, '/assessment');
    const cta = page
      .getByRole('link', { name: /start (the )?free assessment|take the assessment|begin assessment|take.*assessment/i })
      .first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toMatch(/^\/assessment\/take/);
  });

  test('/assessment — page describes v3 specs (12 dimensions / 12 questions / 3 min) (#349)', async ({ page }) => {
    await gotoStable(page, '/assessment');
    const body = await page.locator('body').innerText();
    // Post-#349 the page must lead with the free v3 specs on the free-tier hero.
    expect(body).toMatch(/12 questions|12-question/i);
    expect(body).toMatch(/12 dimensions|twelve readiness dimensions/i);
    expect(body).toMatch(/\b3 minutes|three minutes|~3 ?min/i);
    // Free-tier sample card score is /48, not /100.
    expect(body).toMatch(/\/\s*48\b/);
  });

  test('/courses — enroll CTA reaches purchase page', async ({ page }) => {
    await gotoStable(page, '/courses');
    const enroll = page
      .getByRole('link', { name: /enroll.*\$?295|enroll in aibi.foundation|enroll/i })
      .first();
    await expect(enroll).toBeVisible();
    const href = await enroll.getAttribute('href');
    expect(href).toMatch(/\/courses\/foundation\/program\/purchase/);
  });

  test('/courses — curriculum lists 12 modules (#350)', async ({ page }) => {
    await gotoStable(page, '/courses');
    const body = await page.locator('body').innerText();
    // Post-#350 the page lists all 12 modules, not 5.
    expect(body).toMatch(/12-module|twelve module|all 12/i);
  });

  test('/courses — back-link to free assessment (#354)', async ({ page }) => {
    await gotoStable(page, '/courses');
    // "Not sure where to start? Take the free readiness check first." back-link.
    const backLink = page
      .getByRole('link', { name: /take the free readiness check|free assessment|free readiness/i })
      .first();
    await expect(backLink).toBeVisible();
  });

  test('/for-institutions — booking CTA opens advisory or Calendly (#I1 / #352)', async ({ page }) => {
    await gotoStable(page, '/for-institutions');
    const briefing = page.getByRole('link', { name: /book.*briefing|executive briefing/i }).first();
    await expect(briefing).toBeVisible();
    const href = await briefing.getAttribute('href');
    // Two valid targets: direct Calendly URL, or the in-app /for-institutions/advisory
    // page that embeds Calendly. Both keep the funnel intact.
    expect(href).toMatch(/calendly\.com|^https?:\/\/|^\/for-institutions\/advisory/);
  });

  test('/for-institutions — "See enrollment options" CTA links to anchor (#352)', async ({ page }) => {
    await gotoStable(page, '/for-institutions');
    // Post-#352 the broken "Re-pricing" CTA was replaced with "See enrollment options"
    // that anchors to the on-page pricing section.
    const enrollOptions = page
      .getByRole('link', { name: /see enrollment options|enrollment.*advisory/i })
      .first();
    await expect(enrollOptions).toBeVisible();
    const href = await enrollOptions.getAttribute('href');
    expect(href).toMatch(/^#\w/);
  });

  test('/research — DownloadGate replaces direct PDF anchors (#351)', async ({ page }) => {
    await gotoStable(page, '/research');
    // Post-#351 each artifact card has a "Get the PDF" button that, on click,
    // swaps to an inline email form. The form must include an email input
    // and a submit button. We don't actually submit (would create real
    // MailerLite records); we just verify the gate is present and reachable.
    const getButton = page
      .getByRole('button', { name: /get the pdf|get pdf/i })
      .first();
    await expect(getButton).toBeVisible();
    await getButton.click();
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });
});

test.describe('parent flows — mobile', () => {
  test.use({ viewport: MOBILE });

  test('/ — hero CTA visible + tappable on mobile', async ({ page }) => {
    await gotoStable(page, '/');
    const cta = page
      .getByRole('link', { name: /get my ai readiness score|start (the )?assessment/i })
      .first();
    await expect(cta).toBeVisible();
    // Mobile tap target: at least 36px tall is the conservative floor.
    const box = await cta.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(36);
  });

  test('/assessment — primary CTA reachable on mobile within 3000px scroll', async ({ page }) => {
    await gotoStable(page, '/assessment');
    const cta = page
      .getByRole('link', { name: /start (the )?free assessment|take the assessment|take.*assessment/i })
      .first();
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    // Primary CTA must be findable in the upper part of the page on mobile.
    expect(box?.y ?? Infinity).toBeLessThan(3000);
  });

  test('/courses — enroll CTA visible on mobile', async ({ page }) => {
    await gotoStable(page, '/courses');
    const enroll = page.getByRole('link', { name: /enroll/i }).first();
    await expect(enroll).toBeVisible();
  });

  test('/for-institutions — Book a briefing visible on mobile', async ({ page }) => {
    await gotoStable(page, '/for-institutions');
    const briefing = page.getByRole('link', { name: /book.*briefing/i }).first();
    await expect(briefing).toBeVisible();
  });

  test('/research — Get-PDF button visible on mobile', async ({ page }) => {
    await gotoStable(page, '/research');
    const getBtn = page.getByRole('button', { name: /get the pdf|get pdf/i }).first();
    await expect(getBtn).toBeVisible();
  });
});
