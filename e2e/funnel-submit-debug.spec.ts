import { test } from '@playwright/test';

test('debug — capture submit response', async ({ page }) => {
  page.on('response', async (resp) => {
    if (resp.url().includes('/api/capture-email')) {
      const body = await resp.text().catch(() => '<no body>');
      console.log(`>> /api/capture-email ${resp.status()} ${resp.url()}\n   body: ${body.slice(0, 400)}`);
    }
  });
  page.on('console', (m) => {
    if (m.type() === 'error') console.log(`[browser err] ${m.text()}`);
  });

  await page.goto('/assessment');
  for (let i = 0; i < 12; i++) {
    await page.locator('button[role="radio"]').nth(i % 4).click();
    await page.waitForTimeout(200);
  }

  // Use a unique email per run so rate limiting / dedup doesn't muddy results
  const email = `debug-${Date.now()}@example-bank.com`;
  await page.locator('input#gate-email').fill(email);
  await page.locator('input#gate-fullname').fill('Debug User');
  await page.locator('input#gate-institution').fill('Debug Bank');
  await page.getByRole('button', { name: /show my full results/i }).click();
  await page.waitForTimeout(5000);
  console.log('Final URL:', page.url());
  console.log(
    'localStorage:',
    await page.evaluate(() => window.localStorage.getItem('aibi-user')),
  );
});
