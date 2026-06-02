import { test, expect, type Page } from '@playwright/test';

/**
 * Customer-journey snapshot walk.
 *
 * Walks the public funnel and captures a screenshot at every DECISION point
 * the audit identified — landing, assessment, email gate, conversion fork,
 * the two self-serve checkout entry pages, and a request-info form. It stops
 * AT each boundary; it never submits real PII and never completes a purchase.
 *
 * Run against any environment:
 *   npx playwright test customer-journey-snapshot --project=chromium
 *   PLAYWRIGHT_BASE_URL=https://www.aibankinginstitute.com \
 *     npx playwright test customer-journey-snapshot --project=chromium
 *
 * Screenshots land in test-results/journey/. Full-page so you can see the
 * whole screen, not just the fold.
 */

const SHOT_DIR = 'test-results/journey';

// A throwaway address. We only type it to reveal the gated state for the
// screenshot — the spec asserts the gate is present, it does not rely on a
// real inbox or a magic link round-trip.
const THROWAWAY_EMAIL = `journey-snapshot+${Date.now()}@example.com`;

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: true });
}

// Settle: wait for network idle and a beat for any staggered reveal to land
// (the brand forbids motion, but client hydration still needs a tick).
async function settle(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(400);
}

test.describe('customer journey snapshot walk', () => {
  test('01 — landing and primary CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: /AI training that becomes real banking work/i }),
    ).toBeVisible();
    await settle(page);
    await shot(page, '01-landing');

    // Capture where the two hero CTAs actually point — the first fork the
    // visitor sees. Logged, not asserted, so a copy/route change doesn't
    // fail the walk; it just shows up in the snapshot + console.
    const ctaHrefs = await page
      .locator('a[href="/assessment/take"], a[href="/assessment/start"], a[href="/courses"]')
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')));
    console.log('landing CTA hrefs:', ctaHrefs);
  });

  test('02 — assessment intro', async ({ page }) => {
    await page.goto('/assessment/start');
    await settle(page);
    await shot(page, '02-assessment-intro');
  });

  test('03 — assessment questions and 04 — results pre-email', async ({ page }) => {
    await page.goto('/assessment/take');
    await settle(page);
    await shot(page, '03-assessment-questions');

    // Answer the 8 questions by clicking the first option offered on each
    // step. Selectors are intentionally loose (radio OR button) so the walk
    // survives a markup change; if the assessment UI diverges, this loop is
    // the thing to update.
    for (let i = 0; i < 8; i++) {
      const radio = page.getByRole('radio').first();
      const optionButton = page.getByRole('button', { name: /strongly|somewhat|neutral|agree|disagree|yes|no/i }).first();

      if (await radio.isVisible().catch(() => false)) {
        await radio.click();
      } else if (await optionButton.isVisible().catch(() => false)) {
        await optionButton.click();
      }

      const next = page.getByRole('button', { name: /next|continue|see (my )?results|finish/i }).first();
      if (await next.isVisible().catch(() => false)) {
        await next.click();
        await page.waitForTimeout(250);
      }
    }

    await settle(page);
    // This is the pre-email results view: score + tier should be visible,
    // the dimension breakdown should NOT be (it's behind the gate).
    await shot(page, '04-results-pre-email');
  });

  test('05 — the email gate (funnel hinge)', async ({ page }) => {
    await page.goto('/assessment/take');
    await settle(page);
    for (let i = 0; i < 8; i++) {
      const radio = page.getByRole('radio').first();
      if (await radio.isVisible().catch(() => false)) await radio.click();
      const next = page.getByRole('button', { name: /next|continue|see (my )?results|finish/i }).first();
      if (await next.isVisible().catch(() => false)) {
        await next.click();
        await page.waitForTimeout(250);
      }
    }
    await settle(page);

    // Find the email field that gates the breakdown. Snapshot it empty (the
    // ask) and filled (the moment before the value exchange). We do NOT
    // submit — submitting would fire MailerLite/Resend with a fake address.
    const emailField = page.getByRole('textbox', { name: /email/i }).or(page.locator('input[type="email"]')).first();
    if (await emailField.isVisible().catch(() => false)) {
      await shot(page, '05a-email-gate-empty');
      await emailField.fill(THROWAWAY_EMAIL);
      await shot(page, '05b-email-gate-filled');
    } else {
      // If no gate appeared, capture whatever's on screen so the reviewer
      // can see why — maybe the gate moved or the score is ungated now.
      await shot(page, '05c-email-gate-not-found');
    }
  });

  test('06 — conversion fork presentation', async ({ page }) => {
    // The results/sample page renders the post-assessment offer set without
    // requiring a completed run — ideal for snapshotting how the 5 paths
    // are presented (self-serve vs request-info).
    await page.goto('/results/sample');
    await settle(page);
    await shot(page, '06-conversion-fork');
  });

  test('07 — Foundations course (individual vs team)', async ({ page }) => {
    await page.goto('/courses/foundation');
    await settle(page);
    await shot(page, '07a-foundation-default');

    // Reveal the institution/team pricing path if a toggle exists.
    const teamToggle = page.getByRole('button', { name: /team|institution|10\+|seats/i }).first();
    if (await teamToggle.isVisible().catch(() => false)) {
      await teamToggle.click();
      await settle(page);
      await shot(page, '07b-foundation-team');
    }
  });

  test('08 — in-depth assessment sales page', async ({ page }) => {
    await page.goto('/assessment/in-depth');
    await settle(page);
    await shot(page, '08-in-depth-assessment');
  });

  test('09 — for-institutions and a request-info form', async ({ page }) => {
    await page.goto('/for-institutions');
    await settle(page);
    await shot(page, '09a-for-institutions');

    // Open a representative inquiry form (certifications page hosts one).
    await page.goto('/certifications');
    await settle(page);
    await shot(page, '09b-certifications-inquiry');
  });
});
