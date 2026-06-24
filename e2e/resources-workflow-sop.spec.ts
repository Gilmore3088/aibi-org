import { test, expect } from '@playwright/test';

// /resources/templates/ai-workflow-sop — interactive working template
//
// Validates the form-driven builder: hero snapshot reactivity, field
// edits, markdown preview reflection, review checklist state, gated copy +
// gated download wiring, and the /resources entry point that links here.

test.describe('/resources/templates/ai-workflow-sop builder', () => {
  test('renders hero + builder + preview', async ({ page }) => {
    await page.goto('/resources/templates/ai-workflow-sop');
    await expect(page).toHaveTitle(/AI Workflow SOP.*AI Banking Institute/i);
    await expect(
      page.getByRole('heading', { level: 1, name: /Document one AI-assisted workflow end to end/i }),
    ).toBeVisible();
    await expect(page.getByTestId('sop-hero-card')).toBeVisible();
    await expect(page.getByTestId('markdown-preview')).toBeVisible();
  });

  test('editing the workflow name updates the hero snapshot + markdown preview', async ({ page }) => {
    await page.goto('/resources/templates/ai-workflow-sop');
    const nameField = page.getByLabel('Workflow name');
    await nameField.fill('Adverse-Action Draft Generation');

    // Hero snapshot reflects the new name.
    await expect(page.getByTestId('sop-hero-card')).toContainText('Adverse-Action Draft Generation');
    // Markdown preview reflects the new name.
    await expect(page.getByTestId('markdown-preview')).toContainText('# Adverse-Action Draft Generation');
  });

  test('changing risk tier updates the hero snapshot', async ({ page }) => {
    await page.goto('/resources/templates/ai-workflow-sop');
    await page.getByLabel('Risk tier').selectOption('Red');
    await expect(page.getByTestId('sop-hero-card')).toContainText('Red');
    await expect(page.getByTestId('markdown-preview')).toContainText('**Risk tier:** Red');
  });

  test('review checklist updates counter and unlocks Mark SOP reviewed', async ({ page }) => {
    await page.goto('/resources/templates/ai-workflow-sop');
    const counter = page.getByTestId('review-counter');
    await expect(counter).toContainText('0/8 complete');
    const markBtn = page.getByRole('button', { name: /Mark SOP reviewed/i });
    await expect(markBtn).toBeDisabled();

    for (const item of [
      'Business purpose is clear',
      'Approved tool is named',
      'Allowed inputs are defined',
      'Prohibited inputs are explicit',
      'Human reviewer is identified',
      'Approval checkpoint is documented',
      'Retention rule is defined',
      'Escalation triggers are listed',
    ]) {
      await page.getByLabel(item).check();
    }

    await expect(counter).toContainText('8/8 complete');
    await expect(markBtn).toBeEnabled();
  });

  test('gates Copy Markdown behind email capture, then writes rendered markdown', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit', 'clipboard-read permission unsupported in WebKit');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.route('/api/capture-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.goto('/resources/templates/ai-workflow-sop');
    await expect(page.getByTestId('markdown-preview')).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy Markdown/i })).toHaveCount(0);

    await page
      .getByRole('button', { name: /Get Markdown for AI Workflow SOP Markdown/i })
      .first()
      .click();
    await page.getByLabel(/Work email/i).fill('ops@bank.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('# AI-Assisted Procedure Summary Workflow');
    expect(clip).toContain('## 10. Retention Rule');
  });

  test('gates markdown file download behind email capture', async ({ page }) => {
    await page.route('/api/capture-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.goto('/resources/templates/ai-workflow-sop');
    await expect(page.getByRole('button', { name: /Download \.md/i })).toHaveCount(0);
    await page
      .getByRole('button', { name: /Get \.md for AI Workflow SOP Markdown file/i })
      .first()
      .click();
    await page.getByLabel(/Work email/i).fill('ops@bank.com');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Get file/i }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('ai-workflow-sop-template.md');
  });

  test('/resources Open CTA for AI Workflow SOP routes here', async ({ page }) => {
    await page.goto('/resources');
    // The template card's Open button is a same-tab Next <Link>. The
    // FeaturedKit "Includes" list also references this href but opens
    // in a new tab — filter to a same-tab link by avoiding target=_blank.
    const sopOpen = page
      .locator('a[href="/resources/templates/ai-workflow-sop"]:not([target="_blank"])')
      .first();
    await expect(sopOpen).toBeVisible();
    await sopOpen.click();
    await expect(page).toHaveURL(/\/resources\/templates\/ai-workflow-sop/);
    await expect(
      page.getByRole('heading', { level: 1, name: /Document one AI-assisted workflow/i }),
    ).toBeVisible();
  });
});
