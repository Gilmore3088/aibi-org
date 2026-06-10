#!/usr/bin/env node
// Scenario-level auth journey audit — independent of scripts/auth-review.mjs
// (which walks individual surfaces). This harness walks the five END-TO-END
// customer journeys the operator cares about and records what actually
// happens at each decision point:
//
//   S1  First-time visitor, no login → free assessment → email gate → results → download
//   S2  First-time visitor → paid In-Depth assessment (checkout → success → take)
//   S3  First-time visitor → AiBI-Foundation course purchase (checkout → success → module 1)
//   S4  Returning free-assessment lead comes back and pays
//   S5  Returning paid user re-enters (login → device trust → dashboard)
//
// It also harvests every CTA link off the two Stripe success pages and the
// assessment surfaces and verifies none of them resolve to a 404.
//
// Run against local dev (degraded mode, no Supabase/Stripe) or production:
//   node scripts/auth-scenario-audit.mjs
//   BASE_URL=https://www.aibankinginstitute.com node scripts/auth-scenario-audit.mjs
//
// Output: audit/auth-scenarios/report.json + screenshots/

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'audit', 'auth-scenarios');
const SHOTS = path.join(OUT, 'screenshots');
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const CHROME = process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const log = (m) => process.stdout.write(`  · ${m}\n`);
const steps = [];

// Navigation aborts (dev-server recompiles, redirect races) shouldn't kill
// the run — record whatever the page settled on.
async function go(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  } catch (e) {
    if (/ERR_ABORTED|interrupted by another navigation/i.test(e?.message || '')) {
      await page.waitForTimeout(800).catch(() => {});
      return;
    }
    throw e;
  }
}

async function shot(page, id) {
  const f = path.join(SHOTS, `${id}.png`);
  await page.screenshot({ path: f, fullPage: true }).catch(() => {});
  return path.relative(OUT, f);
}

function recordStep(scenario, id, note, data = {}) {
  steps.push({ scenario, id, note, ...data });
  log(`${id}: ${note}`);
}

async function status(page, url) {
  const res = await page.request.get(url).catch(() => null);
  return res?.status() ?? 0;
}

// Walk the 12-question free assessment by clicking answer options.
async function answerFreeAssessment(page) {
  for (let i = 0; i < 14; i++) {
    // v3 take UI renders answer options as buttons/radios inside the question card.
    const opts = page.locator('button[data-answer], [role="radio"], .mk-take-option, button.mk-option');
    let target = opts.first();
    if (!(await target.isVisible().catch(() => false))) {
      // generic fallback: buttons whose text looks like a Likert label
      target = page
        .getByRole('button')
        .filter({ hasText: /agree|disagree|not yet|getting started|in progress|fully|never|rarely|sometimes|often|always|yes|no/i })
        .first();
    }
    if (!(await target.isVisible().catch(() => false))) break;
    await target.click().catch(() => {});
    await page.waitForTimeout(180);
    // some versions need an explicit Next
    const next = page.getByRole('button', { name: /^next$|continue/i }).first();
    if (await next.isVisible().catch(() => false)) {
      const disabled = await next.isDisabled().catch(() => false);
      if (!disabled) await next.click().catch(() => {});
      await page.waitForTimeout(150);
    }
    // stop when an email input shows up (the gate)
    if (await page.locator('input[type="email"]').first().isVisible().catch(() => false)) return true;
  }
  return page.locator('input[type="email"]').first().isVisible().catch(() => false);
}

async function harvestLinks(page) {
  return page.$$eval('a[href]', (as) =>
    as
      .map((a) => ({ text: (a.textContent || '').trim().slice(0, 60), href: a.getAttribute('href') }))
      .filter((l) => l.href && (l.href.startsWith('/') || l.href.includes('localhost') )),
  );
}

async function checkLinks(page, scenario, fromId, links) {
  const seen = new Set();
  for (const l of links) {
    const p = l.href.split('#')[0];
    if (!p || seen.has(p)) continue;
    seen.add(p);
    const url = p.startsWith('http') ? p : `${BASE}${p}`;
    const code = await status(page, url);
    if (code === 404 || code === 500) {
      recordStep(scenario, `${fromId}-deadlink`, `DEAD LINK "${l.text}" → ${p} returned ${code}`, { severity: 'fail', href: p, code });
    }
  }
}

async function s1_freeAssessment(page) {
  log('\n[S1] First-time visitor → free assessment');
  await page.context().clearCookies();
  await go(page, `${BASE}/assessment`, { waitUntil: 'domcontentloaded' });
  recordStep('S1', 'S1-1-landing', `landed ${page.url()}`, { screen: await shot(page, 'S1-1-landing') });

  await go(page, `${BASE}/assessment/take`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const begin = page.getByRole('button', { name: /begin|start/i }).first();
  if (await begin.isVisible().catch(() => false)) await begin.click().catch(() => {});
  await page.waitForTimeout(400);
  recordStep('S1', 'S1-2-take', 'assessment runner', { screen: await shot(page, 'S1-2-take') });

  const reachedGate = await answerFreeAssessment(page);
  await page.waitForTimeout(800);
  recordStep('S1', 'S1-3-email-gate', reachedGate ? 'reached email gate' : 'DID NOT reach email gate', {
    severity: reachedGate ? 'info' : 'warn',
    screen: await shot(page, 'S1-3-email-gate'),
  });
  if (!reachedGate) return;

  // What does the gate promise? Capture the visible copy for the report.
  const gateCopy = (await page.locator('main').innerText().catch(() => '')).slice(0, 1500);
  const mentionsPassword = /password|account|sign\s?up/i.test(gateCopy);
  recordStep('S1', 'S1-3b-gate-copy', `gate copy mentions password/account: ${mentionsPassword}`, { gateCopy: gateCopy.slice(0, 600) });

  await page.locator('input[type="email"]').first().fill('audit-s1@aibankinginstitute.test');
  const nameInput = page.locator('input[name="firstName"], input[placeholder*="first" i]').first();
  if (await nameInput.isVisible().catch(() => false)) await nameInput.fill('Audit');
  const submit = page.getByRole('button', { name: /see|send|get|unlock|results|report/i }).first();
  const respPromise = page.waitForResponse((r) => r.url().includes('/api/capture-email'), { timeout: 15000 }).catch(() => null);
  if (await submit.isVisible().catch(() => false)) await submit.click().catch(() => {});
  const resp = await respPromise;
  await page.waitForTimeout(2500);
  recordStep('S1', 'S1-4-after-capture', `capture-email → ${resp ? resp.status() : 'no call'}; landed ${page.url()}`, {
    screen: await shot(page, 'S1-4-after-capture'),
  });

  // Results surface: harvest download CTAs.
  const links = await harvestLinks(page);
  const dl = links.filter((l) => /download|pdf|brief|artifact|toolkit/i.test(l.text));
  recordStep('S1', 'S1-5-result-ctas', `result CTAs: ${dl.map((l) => `${l.text}→${l.href}`).join(' | ') || 'none harvested'}`);
  await checkLinks(page, 'S1', 'S1-5', links);

  // Click the PDF download button if present — this is where the password modal fires.
  const pdfBtn = page.getByRole('button', { name: /download|pdf/i }).first();
  if (await pdfBtn.isVisible().catch(() => false)) {
    await pdfBtn.click().catch(() => {});
    await page.waitForTimeout(1500);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const passwordModal = /set a password|create.*password|sign in to download/i.test(bodyText);
    recordStep('S1', 'S1-6-download-click', passwordModal ? 'PASSWORD MODAL appeared on download (bug repro)' : 'download proceeded without password prompt', {
      severity: passwordModal ? 'fail' : 'info',
      screen: await shot(page, 'S1-6-download-click'),
    });
  } else {
    recordStep('S1', 'S1-6-download-click', 'no download button rendered (profileId null in degraded mode — gated button hidden)');
  }
}

async function s2_paidInDepth(page) {
  log('\n[S2] First-time visitor → paid In-Depth assessment');
  await page.context().clearCookies();
  await go(page, `${BASE}/assessment/in-depth`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  recordStep('S2', 'S2-1-landing', `landed ${page.url()}`, { screen: await shot(page, 'S2-1-landing') });

  // Click purchase CTA and capture the checkout API response.
  const respPromise = page.waitForResponse((r) => r.url().includes('/api/checkout/in-depth'), { timeout: 15000 }).catch(() => null);
  const buy = page.getByRole('button', { name: /\$99|buy|purchase|get the in-depth|start/i }).first();
  if (await buy.isVisible().catch(() => false)) await buy.click().catch(() => {});
  const resp = await respPromise;
  const body = resp ? await resp.text().catch(() => '') : '';
  recordStep('S2', 'S2-2-checkout-call', `POST /api/checkout/in-depth → ${resp ? resp.status() : 'no call fired'} ${body.slice(0, 160)}`, {
    severity: resp && resp.status() < 400 ? 'info' : 'warn',
    screen: await shot(page, 'S2-2-checkout-call'),
  });

  // Success page as Stripe would land it (no valid session locally).
  await go(page, `${BASE}/assessment/in-depth/purchased?session_id=cs_test_audit`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  recordStep('S2', 'S2-3-success-page', `success page landed ${page.url()}`, { screen: await shot(page, 'S2-3-success-page') });
  const links = await harvestLinks(page);
  recordStep('S2', 'S2-3b-success-ctas', links.map((l) => `${l.text}→${l.href}`).join(' | ').slice(0, 900) || 'none');
  await checkLinks(page, 'S2', 'S2-3', links);

  // The take page: must bounce to login with next= preserved.
  await go(page, `${BASE}/assessment/in-depth/take`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const url = page.url();
  const preserved = /next=/.test(url) && /in-depth/.test(decodeURIComponent(url));
  recordStep('S2', 'S2-4-take-gate', `unauthenticated /take landed on ${url} (next preserved: ${preserved})`, {
    severity: url.includes('/auth/login') || url.includes('/assessment/in-depth') ? 'info' : 'warn',
    screen: await shot(page, 'S2-4-take-gate'),
  });
}

async function s3_course(page) {
  log('\n[S3] First-time visitor → Foundation course purchase');
  await page.context().clearCookies();
  await go(page, `${BASE}/courses/foundation/program/purchase`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  recordStep('S3', 'S3-1-purchase-page', `landed ${page.url()}`, { screen: await shot(page, 'S3-1-purchase-page') });

  const respPromise = page.waitForResponse((r) => r.url().includes('/api/create-checkout'), { timeout: 15000 }).catch(() => null);
  const buy = page.getByRole('button', { name: /enroll|\$295|buy|purchase/i }).first();
  if (await buy.isVisible().catch(() => false)) await buy.click().catch(() => {});
  const resp = await respPromise;
  const body = resp ? await resp.text().catch(() => '') : '';
  recordStep('S3', 'S3-2-checkout-call', `POST /api/create-checkout → ${resp ? resp.status() : 'no call fired'} ${body.slice(0, 160)}`, {
    screen: await shot(page, 'S3-2-checkout-call'),
  });

  await go(page, `${BASE}/courses/foundation/program/purchased?session_id=cs_test_audit`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  recordStep('S3', 'S3-3-success-page', `success page landed ${page.url()}`, { screen: await shot(page, 'S3-3-success-page') });
  const links = await harvestLinks(page);
  recordStep('S3', 'S3-3b-success-ctas', links.map((l) => `${l.text}→${l.href}`).join(' | ').slice(0, 900) || 'none');
  await checkLinks(page, 'S3', 'S3-3', links);

  // Module 1 unauthenticated → login redirect with next preserved.
  await go(page, `${BASE}/courses/foundation/program/1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  recordStep('S3', 'S3-4-module-gate', `unauthenticated module 1 landed on ${page.url()}`, { screen: await shot(page, 'S3-4-module-gate') });
}

async function s4_returningLead(page) {
  log('\n[S4] Returning free-assessment lead comes back to pay');
  await page.context().clearCookies();
  // The journey: email link from free assessment → /results/[id] → upgrade CTA → checkout.
  // Locally there is no row; verify the dead-row experience is explanatory, not a bare 404.
  await go(page, `${BASE}/results/00000000-0000-4000-8000-000000000000`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const text = (await page.locator('body').innerText().catch(() => '')).slice(0, 400);
  recordStep('S4', 'S4-1-stale-result', `stale free-result link UX: ${page.url()} :: ${text.replace(/\s+/g, ' ').slice(0, 200)}`, {
    screen: await shot(page, 'S4-1-stale-result'),
  });

  await go(page, `${BASE}/assessment/in-depth/results/00000000-0000-4000-8000-000000000000`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const text2 = (await page.locator('body').innerText().catch(() => '')).slice(0, 400);
  recordStep('S4', 'S4-2-stale-paid-result', `stale paid-result link UX: ${page.url()} :: ${text2.replace(/\s+/g, ' ').slice(0, 200)}`, {
    screen: await shot(page, 'S4-2-stale-paid-result'),
  });

  // Upgrade path visibility from the sample results page (proxy for a returning lead).
  await go(page, `${BASE}/results/sample`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const links = await harvestLinks(page);
  const upgrade = links.filter((l) => /in-depth|upgrade|\$99/i.test(`${l.text} ${l.href}`));
  recordStep('S4', 'S4-3-upgrade-path', `upgrade CTAs on results surface: ${upgrade.map((l) => `${l.text}→${l.href}`).join(' | ') || 'NONE FOUND'}`, {
    severity: upgrade.length ? 'info' : 'warn',
    screen: await shot(page, 'S4-3-upgrade-path'),
  });
  await checkLinks(page, 'S4', 'S4-3', links);
}

async function s5_returningPaidUser(page) {
  log('\n[S5] Returning paid user re-enters');
  await page.context().clearCookies();
  for (const target of ['/dashboard', '/my-toolbox', '/assessment/in-depth/access']) {
    await go(page, `${BASE}${target}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const url = page.url();
    const gated = url.includes('/auth/login');
    const nextOk = gated ? decodeURIComponent(url).includes(target) : null;
    recordStep('S5', `S5-${target.replace(/\//g, '_')}`, `${target} → ${url}${gated ? ` (next preserved: ${nextOk})` : ' (RENDERED without auth — preview bypass or public)'}`, {
      severity: gated && nextOk === false ? 'fail' : 'info',
      screen: await shot(page, `S5${target.replace(/\//g, '-')}`),
    });
  }
  // Login page with post-Stripe deep link shape.
  await go(page, `${BASE}/auth/login?next=%2Fassessment%2Fin-depth%2Ftake&email=buyer%40bank.test`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  recordStep('S5', 'S5-login-prefill', 'login with next + email prefill (post-purchase re-entry shape)', { screen: await shot(page, 'S5-login-prefill') });
}

async function main() {
  await fs.rm(SHOTS, { recursive: true, force: true });
  await fs.mkdir(SHOTS, { recursive: true });
  process.stdout.write(`Scenario audit against ${BASE}\n`);
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  try {
    await s1_freeAssessment(page);
    await s2_paidInDepth(page);
    await s3_course(page);
    await s4_returningLead(page);
    await s5_returningPaidUser(page);
  } finally {
    await ctx.close();
    await browser.close();
  }
  await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify({ base: BASE, generated: new Date().toISOString(), steps }, null, 2));
  const fails = steps.filter((s) => s.severity === 'fail');
  process.stdout.write(`\n${steps.length} steps recorded, ${fails.length} hard findings → ${path.join(OUT, 'report.json')}\n`);
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e?.stack || e}\n`);
  process.exit(1);
});
