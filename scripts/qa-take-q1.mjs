// QA capture: /assessment/take at iPhone 14 (390x844) after the
// mobile-assessment-flow-fix. Snaps fold + full into
// docs/handoffs/mobile-flow-audit-2026-05-28/after/.

import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const TODAY = '2026-05-28';
const OUT = resolve(process.cwd(), `docs/handoffs/mobile-flow-audit-${TODAY}/after`);

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 14'] });
const page = await ctx.newPage();

await mkdir(OUT, { recursive: true });
await page.goto(`${BASE}/assessment/take`, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(800);

await page.screenshot({ path: resolve(OUT, '03-assessment-take-q1-fold.png'), fullPage: false });
await page.screenshot({ path: resolve(OUT, '03-assessment-take-q1-full.png'), fullPage: true });

const height = await page.evaluate(() => document.documentElement.scrollHeight);
const folds = Math.round((height / 844) * 10) / 10;

const aboveFold = await page.evaluate(() => {
  const h2 = document.querySelector('.mk-take-q-prompt h2');
  if (!h2) return { found: false };
  const rect = h2.getBoundingClientRect();
  return {
    found: true,
    text: h2.textContent.slice(0, 80),
    top: Math.round(rect.top),
    bottom: Math.round(rect.bottom),
    inViewport: rect.bottom < window.innerHeight,
  };
});

console.log(JSON.stringify({ heightPx: height, folds, aboveFold }, null, 2));

await browser.close();
