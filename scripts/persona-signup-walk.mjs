// Signup-flow persona walk — the SECOND auth process (the post-login sweep
// only exercises returning-user LOGIN). For a deterministic sample of roster
// personas this drives the REAL /auth/signup form with a fresh
// `e2e+signup-<short>@aibankinginstitute.test` address, submits, and records
// the outcome (created / error / unexpected), landing, messaging, console +
// uncaught JS errors, and time-to-submit.
//
// SAFETY: `.test` TLD (RFC 6761) never reaches a real inbox; no checkout, no
// real email delivery. Brand-new accounts are created UNCONFIRMED and removed
// by the cleanupAllSeededUsers backstop (matches the e2e+...@…test pattern).
//
//   E2E_ALLOW_PRODUCTION_SUPABASE=true SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
//     BASE_URL=https://www.aibankinginstitute.com \
//     ROSTER_MD=docs/persona-audit-2026-06-25/01-persona-roster-150.md \
//     npx tsx scripts/persona-signup-walk.mjs

import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { loadRoster, buildPersonas, DEFAULT_ROSTER_MD } from './lib/persona-roster.mjs';
import { accountStateFor } from './lib/account-states.mjs';
import { cleanupAllSeededUsers } from './lib/seed-bridge.mts';

const BASE = (process.env.BASE_URL || 'https://www.aibankinginstitute.com').replace(/\/$/, '');
const DATE = process.env.SWEEP_DATE || new Date().toISOString().slice(0, 10);
const OUT_DIR = resolve(process.cwd(), `docs/handoffs/persona-signup-walk-${DATE}`);
const SHOT_DIR = resolve(OUT_DIR, 'shots');
const CONCURRENCY = Number(process.env.CONCURRENCY || 4);
const SIGNUP_LIMIT = Number(process.env.SIGNUP_LIMIT || 24);

const LANDING_FOR_STATE = {
  'account-only': '/dashboard',
  'free-assessment': '/dashboard',
  'in-depth': '/assessment/in-depth/take',
  'foundation-onboarding-pending': '/courses/foundation/program/onboarding',
  'foundation-early': '/courses/foundation/program',
  'foundation-mid': '/courses/foundation/program',
  'foundation-complete': '/courses/foundation/program/certificate',
  'unconfirmed': '/dashboard',
};

const abs = (p) => new URL(p, BASE).toString();
const pathOf = (url) => { try { return new URL(url, BASE).pathname; } catch { return url; } };

// Evenly sample across the roster so we cover varied roles + devices.
function sample(personas, limit) {
  if (personas.length <= limit) return personas;
  const step = personas.length / limit;
  const out = [];
  for (let i = 0; i < limit; i += 1) out.push(personas[Math.floor(i * step)]);
  return out;
}

async function runSignup(browser, persona) {
  const state = accountStateFor(persona);
  const next = LANDING_FOR_STATE[state] || '/dashboard';
  const short = randomBytes(4).toString('hex');
  const email = `e2e+signup-${short}@aibankinginstitute.test`;
  const password = `Aibi-${short}-Qa9!`; // upper+lower+digit+symbol, >=10 chars
  const ctx = persona.device === 'mobile'
    ? await browser.newContext({ ...devices['iPhone 14'] })
    : await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e).slice(0, 200)));

  const t0 = Date.now();
  let outcome = 'unknown';
  let landing = null;
  let message = '';
  let navError = null;
  try {
    await page.goto(`${abs('/auth/signup')}?next=${encodeURIComponent(next)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.locator('input[name="email"]').first().fill(email);
    await page.locator('input[name="password"]').first().fill(password);
    const confirm = page.locator('input[name="confirmPassword"]').first();
    if (await confirm.count()) await confirm.fill(password);
    await page.getByRole('button', { name: /create|sign up|start|continue/i }).first().click({ timeout: 8000 });
    // Wait for one of: a redirect off /auth/signup, the "check your email"
    // success message, or an inline error.
    await Promise.race([
      page.waitForURL((u) => !u.pathname.startsWith('/auth/signup'), { timeout: 12000 }).catch(() => {}),
      page.locator('text=/confirmation link|sent .*link|check your (inbox|email)|activate your account/i')
        .first().waitFor({ timeout: 12000 }).catch(() => {}),
      page.locator('[role="alert"], [data-error], .text-red-600').first().waitFor({ timeout: 12000 }).catch(() => {}),
    ]);
    await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
    landing = pathOf(page.url());
    const bodyText = await page.locator('main, body').first().innerText({ timeout: 2000 }).catch(() => '');
    const errText = await page.locator('[role="alert"], [data-error], .text-red-600').first()
      .innerText({ timeout: 1000 }).catch(() => '');
    if (/confirmation link|sent .*link|check your (inbox|email)|activate your account/i.test(bodyText)) {
      outcome = 'created-confirm-email';
      message = 'check-your-email shown';
    } else if (landing && !landing.startsWith('/auth/signup')) {
      outcome = 'redirected';
      message = `landed ${landing}`;
    } else if (errText) {
      outcome = 'error';
      message = errText.slice(0, 200);
    } else {
      outcome = 'no-progress';
      message = 'still on /auth/signup, no success/error message';
    }
    await page.screenshot({ path: resolve(SHOT_DIR, `${persona.id}-signup-${outcome}.png`) }).catch(() => {});
  } catch (e) {
    navError = String(e?.message || e).slice(0, 200);
    outcome = 'exception';
    await page.screenshot({ path: resolve(SHOT_DIR, `${persona.id}-signup-EXC.png`) }).catch(() => {});
  } finally {
    await page.close().catch(() => {});
    await ctx.close().catch(() => {});
  }
  return {
    id: persona.id, role: persona.role, device: persona.device, state, email, next,
    outcome, landing, message, navError,
    ms: Date.now() - t0, consoleErrors: consoleErrors.length, pageErrors,
  };
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const cur = idx++;
      results[cur] = await worker(items[cur]);
      const r = results[cur];
      console.log(`${r.id.padEnd(34)} ${r.device.padEnd(7)} ${String(r.outcome).padEnd(20)} ${r.ms}ms · ${r.message}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  return results;
}

async function main() {
  if (process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true') {
    console.error('Refusing to run: set E2E_ALLOW_PRODUCTION_SUPABASE=true plus SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(2);
  }
  await mkdir(SHOT_DIR, { recursive: true });
  const rosterMd = process.env.ROSTER_MD ? resolve(process.cwd(), process.env.ROSTER_MD) : DEFAULT_ROSTER_MD;
  const personas = sample(buildPersonas(await loadRoster(rosterMd)), SIGNUP_LIMIT);
  console.log(`Signup-flow walk — ${personas.length} personas vs ${BASE} (concurrency ${CONCURRENCY})\n`);

  const browser = await chromium.launch();
  let results = [];
  try {
    results = await runPool(personas, (p) => runSignup(browser, p), CONCURRENCY);
  } finally {
    await browser.close().catch(() => {});
    const cleaned = await cleanupAllSeededUsers().catch((e) => ({ deleted: -1, failed: -1, error: String(e) }));
    console.log(`\ncleanup backstop: ${JSON.stringify(cleaned)}`);
  }

  const byOutcome = {};
  for (const r of results) byOutcome[r.outcome] = (byOutcome[r.outcome] || 0) + 1;
  const jsErr = results.filter((r) => r.pageErrors.length);
  const summary = {
    runAt: new Date().toISOString(), base: BASE, mode: 'signup', personas: results.length,
    byOutcome, jsErrorWalks: jsErr.length, results,
  };
  await writeFile(resolve(OUT_DIR, 'signup.json'), JSON.stringify(summary, null, 2));

  const md = [
    `# Signup-Flow Persona Walk — ${BASE}`, ``, `Run: ${summary.runAt} · personas: ${summary.personas}`, ``,
    `## Outcomes`,
    ...Object.entries(byOutcome).map(([o, n]) => `- ${o}: ${n}`),
    ``, `## Walks with uncaught JS errors`,
    jsErr.length ? jsErr.map((r) => `- ${r.id} (${r.landing}): ${r.pageErrors.join(' | ')}`).join('\n') : '- none',
    ``, `## Errors / no-progress`,
    results.filter((r) => ['error', 'no-progress', 'exception'].includes(r.outcome))
      .map((r) => `- ${r.id} [${r.outcome}] ${r.device}: ${r.message || r.navError}`).join('\n') || '- none',
  ].join('\n');
  await writeFile(resolve(OUT_DIR, 'signup.md'), md);
  console.log(`\n=== SIGNUP TOTALS === ${JSON.stringify(byOutcome)}`);
  console.log(`report: ${resolve(OUT_DIR, 'signup.md')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
