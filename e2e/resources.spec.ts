import { test, expect } from '@playwright/test';
import { allDownloadHrefs } from '../src/app/resources/data';

// /resources — Artifact Library
//
// Full UA tests for every user path on the new resources page. The page
// is the single landing surface for playbooks, checklists, templates,
// prompt cards, and starter kits. Anything that breaks here breaks the
// site nav (the global nav links to /resources).

test.describe('/resources page', () => {
  test('renders hero, headline, and primary CTAs', async ({ page }) => {
    await page.goto('/resources');
    await expect(page).toHaveTitle(/Resources.*AI Banking Institute/i);
    await expect(
      page.getByRole('heading', { level: 1, name: /find the AI artifact your team needs next/i }),
    ).toBeVisible();
    // Primary CTAs in hero
    await expect(page.getByRole('link', { name: /browse starter kits/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get readiness score/i }).first()).toBeVisible();
  });

  test('every starter kit card exposes a ZIP download link to a valid path', async ({ page }) => {
    await page.goto('/resources');
    const expected = [
      { id: 'governance', zip: '/downloads/governance-starter-kit.zip' },
      { id: 'frontline', zip: '/downloads/frontline-enablement-kit.zip' },
      { id: 'marketing', zip: '/downloads/marketing-review-kit.zip' },
      { id: 'lending', zip: '/downloads/lending-review-kit.zip' },
    ];
    for (const { id, zip } of expected) {
      const card = page.locator(`[data-kit-id="${id}"]`);
      await expect(card).toBeVisible();
      const zipLink = card.locator(`a[href="${zip}"]`);
      await expect(zipLink, `kit ${id} ZIP link`).toBeVisible();
    }
  });

  test('featured-kit panel ZIP CTA updates when selection changes', async ({ page }) => {
    await page.goto('/resources');
    const featured = page.getByTestId('featured-kit');
    // Default selection is governance.
    await expect(featured.locator('a[href="/downloads/governance-starter-kit.zip"]')).toBeVisible();

    // Select Lending Review Kit and confirm the CTA flips.
    await page.locator('[data-kit-id="lending"] .rx-kit-card-body').click();
    await expect(featured.locator('a[href="/downloads/lending-review-kit.zip"]')).toBeVisible();
  });

  test('starter-kit chooser updates the recommended-kit panel', async ({ page }) => {
    await page.goto('/resources');
    const featuredTitle = page.getByTestId('featured-kit-title');
    await expect(featuredTitle).toHaveText(/AI Governance Starter Kit/i);

    // Click a second kit card and confirm the featured panel updates.
    await page.locator('[data-kit-id="lending"] .rx-kit-card-body').click();
    await expect(featuredTitle).toHaveText(/Lending Review Kit/i);

    // The featured panel should now list the lending playbook artifact.
    await expect(
      page.getByRole('link', { name: /Lending Playbook/i }).first(),
    ).toBeVisible();
  });

  test('chooser tabs switch panel content', async ({ page }) => {
    await page.goto('/resources');

    // Default tab "By role" shows role mini-cards.
    await expect(page.getByRole('button', { name: 'By role' })).toHaveAttribute('aria-pressed', 'true');

    // Switch to "By problem"
    await page.getByRole('button', { name: 'By problem' }).click();
    await expect(page.getByRole('button', { name: 'By problem' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(/Set AI rules/)).toBeVisible();
    await expect(page.getByText(/Brief leadership/)).toBeVisible();

    // Switch to "By format"
    await page.getByRole('button', { name: 'By format' }).click();
    await expect(page.getByRole('button', { name: 'By format' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: /Playbook.*Browse by artifact type/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Template.*Browse by artifact type/ })).toBeVisible();
  });

  test('every role playbook card has Open + PDF links pointing at real routes', async ({ page }) => {
    await page.goto('/resources');
    const roles = ['compliance', 'retail', 'marketing', 'lending', 'bsa-aml', 'infosec'];
    for (const slug of roles) {
      const open = page.locator(`a[href="/playbooks/${slug}"]`).first();
      await expect(open, `Open link for ${slug}`).toBeVisible();
      const pdf = page.locator(`a[href="/downloads/${slug}-playbook.pdf"]`).first();
      await expect(pdf, `PDF link for ${slug}`).toBeVisible();
    }
  });

  test('desk cards link to existing PDFs', async ({ page }) => {
    await page.goto('/resources');
    const expected = [
      '/downloads/safe-ai-use-checklist.pdf',
      '/downloads/red-yellow-green-use-card.pdf',
      '/downloads/prompt-strategy-cheat-sheet.pdf',
      '/downloads/regulatory-cheatsheet.pdf',
    ];
    for (const href of expected) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test('assessment CTA card routes to /assessment', async ({ page }) => {
    await page.goto('/resources');
    const cta = page.getByRole('link', { name: /Get readiness score/i }).last();
    await expect(cta).toHaveAttribute('href', '/assessment');
  });

  test('every download href referenced on the page returns HTTP 200', async ({ request }) => {
    // Iterate the data model used by the page so any new artifact
    // automatically gets coverage without editing this test.
    const hrefs = allDownloadHrefs();
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), `${href} should be 200`).toBe(200);
    }
  });

  test('page does not contain the banned "FFIEC-aware" phrase', async ({ page }) => {
    await page.goto('/resources');
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/FFIEC-aware/i);
  });

  test('no console errors on render', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/resources');
    await page.waitForLoadState('networkidle');
    // Filter out third-party noise (Plausible/Vercel analytics in dev).
    const fatal = errors.filter(
      (e) => !/plausible|vercel|favicon|404 \(Not Found\)/i.test(e),
    );
    expect(fatal).toEqual([]);
  });
});
