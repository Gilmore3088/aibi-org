import { test, expect } from '@playwright/test';
import { allDownloadHrefs, starterKits, rolePlaybooks, deskCards } from '../src/app/resources/data';

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
      page.getByRole('heading', { level: 1, name: /Start with the artifact, not a blank page/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /^Browse kits$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get readiness score/i }).first()).toBeVisible();
  });

  test('every starter kit card exposes a ZIP download link to a valid path', async ({ page }) => {
    await page.goto('/resources');
    for (const kit of starterKits) {
      const card = page.locator(`[data-kit-id="${kit.id}"]`);
      await expect(card).toBeVisible();
      const zipLink = card.locator(`a[href="${kit.zip}"]`);
      await expect(zipLink, `kit ${kit.id} ZIP link`).toBeVisible();
    }
  });

  test('featured-kit panel ZIP CTA updates when selection changes', async ({ page }) => {
    await page.goto('/resources');
    const featured = page.getByTestId('featured-kit');
    // Default selection is governance.
    const governanceKit = starterKits.find((k) => k.id === 'governance')!;
    await expect(featured.locator(`a[href="${governanceKit.zip}"]`)).toBeVisible();

    // Select Lending Review Kit and confirm the CTA flips.
    const lendingKit = starterKits.find((k) => k.id === 'lending')!;
    await page.getByRole('button', { name: /Preview Lending Review Kit in the featured panel/i }).click();
    await expect(featured.locator(`a[href="${lendingKit.zip}"]`)).toBeVisible();
  });

  test('starter-kit chooser updates the recommended-kit panel', async ({ page }) => {
    await page.goto('/resources');
    const featuredTitle = page.getByTestId('featured-kit-title');
    await expect(featuredTitle).toHaveText(/AI Governance Starter Kit/i);

    // Click a second kit card and confirm the featured panel updates.
    await page.getByRole('button', { name: /Preview Lending Review Kit in the featured panel/i }).click();
    await expect(featuredTitle).toHaveText(/Lending Review Kit/i);

    // The featured panel should now list the lending playbook artifact.
    await expect(
      page.getByRole('link', { name: /Lending Playbook/i }).first(),
    ).toBeVisible();
  });

  test('filter rail narrows resources by role, format, and search', async ({ page }) => {
    await page.goto('/resources');

    const filters = page.getByRole('complementary', { name: /Filter artifacts/i });
    await expect(filters).toBeVisible();
    const mobileFilterSummary = filters.locator('details.rx-filter-rail-mobile summary');
    if (await mobileFilterSummary.isVisible()) {
      await mobileFilterSummary.click();
    }

    await filters.getByRole('button', { name: 'BSA/AML' }).click();
    await expect(filters.getByRole('button', { name: 'BSA/AML' })).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('heading', { level: 2, name: /1 playbook for the role you picked/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'BSA / AML' })).toBeVisible();

    await filters.getByRole('button', { name: /Reset all filters/i }).click();
    await filters.getByRole('button', { name: 'Template' }).click();
    await expect(filters.getByRole('button', { name: 'Template' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 2, name: /Copy these into your next meeting/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'AI Workflow SOP' })).toBeVisible();

    await filters.getByRole('searchbox', { name: /Search/i }).fill('Board');
    await expect(
      page.getByRole('heading', { level: 3, name: 'Board / Leadership Briefing Checklist' }),
    ).toBeVisible();
  });

  test('every role playbook card has Open + PDF links pointing at real routes', async ({ page }) => {
    await page.goto('/resources');
    for (const playbook of rolePlaybooks) {
      const open = page.locator(`a[href="/playbooks/${playbook.slug}"]`).first();
      await expect(open, `Open link for ${playbook.slug}`).toBeVisible();
      const pdf = page.locator(`a[href="${playbook.pdf}"]`).first();
      await expect(pdf, `PDF link for ${playbook.slug}`).toBeVisible();
    }
  });

  test('desk cards link to correct API download routes', async ({ page }) => {
    await page.goto('/resources');
    for (const card of deskCards) {
      await expect(
        page.locator(`a[href="${card.href}"]`).first(),
        `desk card ${card.title}`,
      ).toBeVisible();
    }
  });

  test('assessment CTA card routes to /assessment', async ({ page }) => {
    await page.goto('/resources');
    const cta = page.getByRole('link', { name: /Get readiness score/i }).last();
    await expect(cta).toHaveAttribute('href', '/assessment');
  });

  test('every download href referenced on the page resolves to a wired route', async ({ request }) => {
    // Iterate the data model used by the page so any new artifact
    // automatically gets coverage without editing this test.
    // Accepts 302 because /api/resources/.../download redirects to a
    // short-lived signed URL. 401/403 are acceptable for auth-gated downloads.
    // In envs without Supabase (local/preview), the route can return 503. A
    // 404 means the known slug is missing or unpublished and should fail.
    const hrefs = allDownloadHrefs().filter((h) => h.startsWith('/api/'));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(
        [200, 302, 401, 403, 503].includes(res.status()),
        `${href} returned unexpected ${res.status()}`,
      ).toBe(true);
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
      (e) => !/plausible|vercel|favicon|404 \(Not Found\)|SSL error has occurred|status of 403/i.test(e),
    );
    expect(fatal).toEqual([]);
  });
});
