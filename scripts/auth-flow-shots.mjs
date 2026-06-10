// scripts/auth-flow-shots.mjs
// One-shot Playwright capture for every node in the lead-capture + auth +
// payment flows documented in docs/auth-flows-2026-06-07.html.
//
// Run: node scripts/auth-flow-shots.mjs
// Defaults to http://localhost:3000 — override with BASE_URL.
// Writes PNGs to docs/auth-review-shots/.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const SHOT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'docs',
  'auth-review-shots',
);
mkdirSync(SHOT_DIR, { recursive: true });

const VIEWPORT = { width: 1280, height: 800 };

// (slug, path, optional setup fn)
const SHOTS = [
  ['01-home', '/'],
  ['02-assessment-take', '/assessment/take'],
  ['03-assessment-results-sample', '/results/sample'],
  ['04-resources-hub', '/resources'],
  ['05-resources-templates-sop', '/resources/templates/ai-workflow-sop'],
  ['06-auth-signup', '/auth/signup'],
  ['07-auth-login', '/auth/login'],
  ['08-auth-confirm-device-pending', '/auth/confirm-device-pending?email=demo%40example.com'],
  ['09-courses-foundation', '/courses/foundation'],
  ['10-foundation-program-paywall', '/courses/foundation/program'],
  ['11-assessment-in-depth', '/assessment/in-depth'],
  ['12-assessment-in-depth-access-noauth', '/assessment/in-depth/access'],
  ['13-my-toolbox-noauth', '/my-toolbox'],
  ['14-dashboard-noauth', '/dashboard'],
];

async function fillAssessmentToEmailGate(page) {
  // Click through 12 questions; each question shows 4 buttons (1–4 points).
  // We just need ANY pick per question to land on the email gate.
  for (let i = 0; i < 12; i++) {
    // Buttons in question card render as <button> with the point label.
    // Use the first answer option.
    const btn = page
      .locator('button')
      .filter({ hasText: /^(Strongly|Somewhat|Mostly|Not yet|Yes|No|Always|Never)/i })
      .first();
    if ((await btn.count()) === 0) break;
    await btn.click().catch(() => {});
    await page.waitForTimeout(150);
  }
}

async function shoot(page, name, path) {
  try {
    const url = `${BASE_URL}${path}`;
    console.log(`→ ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    // Let any client-side rendering settle.
    await page.waitForTimeout(800);
    if (name === '02-assessment-take') {
      await fillAssessmentToEmailGate(page);
      await page.waitForTimeout(500);
      await page.screenshot({
        path: join(SHOT_DIR, '02b-assessment-email-gate.png'),
        fullPage: true,
      });
      return;
    }
    await page.screenshot({ path: join(SHOT_DIR, `${name}.png`), fullPage: true });
  } catch (err) {
    console.error(`  ✗ ${name}:`, err.message);
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: VIEWPORT });
const page = await context.newPage();

for (const [name, path] of SHOTS) {
  await shoot(page, name, path);
}

await browser.close();
console.log(`\nWrote ${SHOTS.length} shots to ${SHOT_DIR}`);
