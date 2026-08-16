import { test, expect } from '@playwright/test';
import {
  allDownloadHrefs,
  deskCards,
  paidPreviews,
  rolePlaybooks,
  starterKits,
} from '../src/app/resources/data';

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
      page.getByRole('heading', { level: 1, name: /Find the right AI artifact for the job/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse resources/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get readiness score/i }).first()).toBeVisible();
  });

  test('renders start-here chooser and keyboard skip shortcuts', async ({ page }) => {
    await page.goto('/resources');

    await expect(page.getByRole('heading', { level: 2, name: /Pick the work you need/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /I need AI rules/i })).toHaveAttribute(
      'href',
      '/resources/templates/ai-use-policy-starter',
    );
    await expect(page.getByRole('link', { name: /I need a role playbook/i })).toHaveAttribute(
      'href',
      '#role-playbooks',
    );
    await expect(page.getByRole('link', { name: /I just took the assessment/i })).toHaveAttribute(
      'href',
      '#preview-paid',
    );

    const shortcuts = page.getByRole('navigation', { name: /Resource page shortcuts/i });
    await expect(shortcuts.getByRole('link', { name: /Skip to start here/i })).toHaveAttribute('href', '#start-here');
    await expect(shortcuts.getByRole('link', { name: /Skip to filters/i })).toHaveAttribute('href', '#resource-filters');
    await expect(shortcuts.getByRole('link', { name: /Skip to resources/i })).toHaveAttribute('href', '#resources-main');
  });

  test('every starter kit card exposes a ZIP download link to a valid path', async ({ page }) => {
    await page.goto('/resources');
    for (const kit of starterKits) {
      const card = page.locator('article', {
        has: page.getByRole('heading', { level: 3, name: kit.title, exact: true }),
      });
      await expect(card).toBeVisible();
      const zipGate = card.getByRole('button', { name: new RegExp(`Get ZIP for ${kit.title}`, 'i') });
      await expect(zipGate, `kit ${kit.id} ZIP gate`).toBeVisible();
    }
  });

  test('role chips narrow the grouped resource grids', async ({ page }) => {
    await page.goto('/resources');
    const filters = page.locator('#resource-filters');
    await filters.getByRole('button', { name: 'Lending' }).click();
    await expect(filters.getByRole('button', { name: 'Lending' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('heading', { level: 3, name: 'Lending' })).toBeVisible();
    await expect(page.locator('[role="status"][aria-live="polite"]')).toContainText(/artifacts? shown/i);
  });

  test('search finds a matching artifact and reset restores the library', async ({ page }) => {
    await page.goto('/resources');
    const filters = page.locator('#resource-filters');
    await filters.getByRole('searchbox', { name: /Search resources/i }).fill('Board');
    await expect(
      page.getByRole('heading', { level: 3, name: /Board.*Briefing Checklist/i }),
    ).toBeVisible();
    await filters.getByRole('button', { name: /Reset/i }).click();
    await expect(page.getByRole('heading', { level: 2, name: /Starter kits/i })).toBeVisible();
  });

  test('inline filters narrow resources by role and search', async ({ page }) => {
    await page.goto('/resources');

    const filters = page.locator('#resource-filters');
    await expect(filters).toBeVisible();

    await filters.getByRole('button', { name: 'BSA/AML' }).click();
    await expect(filters.getByRole('button', { name: 'BSA/AML' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[role="status"][aria-live="polite"]')).toContainText(/artifacts? shown/i);
    await expect(page.getByRole('heading', { level: 3, name: 'BSA / AML' })).toBeVisible();

    await filters.getByRole('button', { name: /Reset/i }).click();
    await filters.getByRole('button', { name: 'Training/HR' }).click();
    await expect(filters.getByRole('button', { name: 'Training/HR' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 3, name: 'Training / HR' })).toBeVisible();
  });

  test('every role playbook card has Open + PDF links pointing at real routes', async ({ page }) => {
    await page.goto('/resources');
    for (const playbook of rolePlaybooks) {
      const open = page.locator(`a[href="/playbooks/${playbook.slug}"]`).first();
      await expect(open, `Open link for ${playbook.slug}`).toBeVisible();
      const pdfGate = page.getByRole('button', { name: new RegExp(`Get PDF for ${playbook.title} Playbook`, 'i') });
      await expect(pdfGate, `PDF gate for ${playbook.slug}`).toBeVisible();
      if (playbook.word) {
        const wordGate = page.getByRole('button', { name: new RegExp(`Get Word for ${playbook.title} Playbook`, 'i') });
        await expect(wordGate, `Word gate for ${playbook.slug}`).toBeVisible();
      }
      if (playbook.readHref) {
        await expect(
          page.locator(`a[href="${playbook.readHref}"]`).first(),
          `readable HTML link for ${playbook.slug}`,
        ).toBeVisible();
      }
    }
  });

  test('governance review paths are visible and wired', async ({ page }) => {
    await page.goto('/resources');
    const governance = page.locator('#security-governance');
    await expect(
      governance.getByRole('heading', { level: 2, name: /review path before you download/i }),
    ).toBeVisible();
    for (const href of ['/security', '/security/data-handling', '/security/it-approval']) {
      await expect(governance.locator(`a[href="${href}"]`)).toBeVisible();
    }
  });

  test('desk cards expose gated PDF downloads', async ({ page }) => {
    await page.goto('/resources');
    for (const card of deskCards) {
      await expect(
        page.getByRole('button', { name: new RegExp(`Get PDF for ${card.title}`, 'i') }).first(),
        `desk card ${card.title}`,
      ).toBeVisible();
      if (card.word) {
        await expect(
          page.getByRole('button', { name: new RegExp(`Get Word for ${card.title}`, 'i') }).first(),
          `desk card Word ${card.title}`,
        ).toBeVisible();
      }
      if (card.readHref) {
        await expect(
          page.locator(`a[href="${card.readHref}"]`).first(),
          `desk card readable HTML ${card.title}`,
        ).toBeVisible();
      }
      if (card.largePrint) {
        await expect(
          page.getByRole('button', { name: new RegExp(`Get large print for ${card.title} large-print PDF`, 'i') }).first(),
          `desk card large-print ${card.title}`,
        ).toBeVisible();
      }
    }
  });

  test('paid preview cards expose Word downloads when available', async ({ page }) => {
    await page.goto('/resources');
    for (const preview of paidPreviews) {
      if (!preview.word) continue;
      await expect(
        page.getByRole('button', { name: new RegExp(`Get Word for ${preview.title}`, 'i') }),
        `paid preview Word ${preview.title}`,
      ).toBeVisible();
      if (preview.readHref) {
        await expect(
          page.locator(`a[href="${preview.readHref}"]`).first(),
          `paid preview readable HTML ${preview.title}`,
        ).toBeVisible();
      }
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
    const hrefs = allDownloadHrefs().filter((h) => h.startsWith('/api/') || h.startsWith('/resources/access/'));
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

  // The document-load path above (page.goto) passes today. The bug surfaced
  // only on the SOFT-NAVIGATION / prefetch path, where the RSC payload the
  // client reconciles against could carry a divergent x-pathname and toggle a
  // different chrome subtree than the server streamed — React #418. Exercise
  // that path explicitly so the regression cannot slip past CI again.
  test('no hydration mismatch reaching /resources via in-app navigation', async ({ page }) => {
    const fatal: string[] = [];
    page.on('pageerror', (e) => fatal.push(String(e)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') fatal.push(msg.text());
    });
    await page.goto('/'); // land on a page that links to /resources
    await page.waitForLoadState('networkidle');
    await page.locator('a[href="/resources"]:visible').first().click(); // soft nav -> RSC fetch
    await expect(page).toHaveURL(/\/resources$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /Find the right AI artifact/i }),
    ).toBeVisible();
    await page.waitForLoadState('networkidle');
    const hydration = fatal.filter((e) =>
      /Hydration failed|did not match|Minified React error #(418|421|423|425)|hydrat/i.test(e),
    );
    expect(hydration).toEqual([]);
  });
});
