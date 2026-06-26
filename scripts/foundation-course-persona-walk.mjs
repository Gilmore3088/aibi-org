// Foundation course — comprehensive post-login persona walk.
//
// Dedicated review of the actual learning experience (the user's "separate test
// for the course"). It seeds learners at varied progress and walks the gated
// course surface that read-only sweeps can never reach:
//   - a COMPLETER: every module 1..N + /submit + /certificate + /post-assessment
//     (the first harness that can actually reach /certificate — prior P0-1).
//   - an EARLY learner (current module 3): verifies forward-only access control
//     (modules beyond current must redirect back; completed modules stay open).
//
// Per page it records HTTP status, redirect target, uncaught JS errors, dead-end
// signal, and whether the expected module chrome rendered.
//
// MUST run under tsx:
//   E2E_ALLOW_PRODUCTION_SUPABASE=true SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
//     BASE_URL=https://www.aibankinginstitute.com npx tsx scripts/foundation-course-persona-walk.mjs

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { FOUNDATION_MODULE_COUNT } from '@content/courses/foundation-program/course-config';
import { seedPersona, cleanupSeededUser, cleanupAllSeededUsers } from './lib/seed-bridge.mts';

const BASE = (process.env.BASE_URL || 'https://www.aibankinginstitute.com').replace(/\/$/, '');
const ORIGIN = new URL(BASE).origin;
const DATE = process.env.SWEEP_DATE || new Date().toISOString().slice(0, 10);
const OUT_DIR = resolve(process.cwd(), `docs/handoffs/foundation-course-personas-${DATE}`);
const SHOT_DIR = resolve(OUT_DIR, 'shots');
const N = FOUNDATION_MODULE_COUNT;

const ONBOARDING = { uses_m365: 'yes', personal_ai_subscriptions: ['ChatGPT'], primary_role: 'lending' };
const abs = (p) => new URL(p, BASE).toString();
const pathOf = (u) => { try { return new URL(u, BASE).pathname; } catch { return u; } };

async function login(page, user) {
  await page.goto(abs('/auth/login'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Login page has several email inputs; scope to the password form so the
  // right email is filled. No silent .catch — a fill failure must surface.
  const form = page.locator('form').filter({ has: page.locator('input[type="password"]') });
  await form.locator('input[name="email"]').fill(user.email);
  await form.locator('input[name="password"]').fill(user.password);
  await form.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/') || url.pathname.startsWith('/auth/confirm-device-pending'), { timeout: 15000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
  return page.url();
}

async function newAuthedPage(browser, recipe) {
  const seeded = await seedPersona(recipe);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on('pageerror', (e) => jsErrors.push(String(e.message || e).slice(0, 200)));
  if (seeded.trustedDevice) {
    await ctx.addCookies([{
      name: seeded.trustedDevice.cookieName, value: seeded.trustedDevice.cookieToken,
      domain: new URL(BASE).hostname, path: '/', httpOnly: true,
      secure: BASE.startsWith('https:'), sameSite: 'Lax',
    }]);
  }
  await login(page, seeded.user);
  return { seeded, ctx, page, jsErrors };
}

async function visit(page, jsErrors, path, expectStayOn) {
  jsErrors.length = 0;
  let status = 0, ok = true, err = null;
  try {
    const res = await page.goto(abs(path), { waitUntil: 'domcontentloaded', timeout: 30000 });
    status = res?.status() ?? 0;
    await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(150);
  } catch (e) { ok = false; err = String(e?.message || e).slice(0, 160); }
  const landedPath = pathOf(page.url());
  const redirected = landedPath !== path;
  const headingCount = ok ? await page.locator('h1').count().catch(() => 0) : 0;
  const linkCount = ok ? await page.locator('a[href]').count().catch(() => 0) : 0;
  return {
    path, status, navError: err, landedPath, redirected,
    jsErrors: [...jsErrors],
    deadEnd: ok && linkCount < 3,
    hasHeading: headingCount > 0,
    stayedOnExpected: expectStayOn ? landedPath.startsWith(expectStayOn) : null,
  };
}

async function main() {
  if (process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true') {
    console.error('Refusing to run: set E2E_ALLOW_PRODUCTION_SUPABASE=true plus SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(2);
  }
  await mkdir(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, proxy: process.env.PLAYWRIGHT_PROXY_SERVER ? { server: process.env.PLAYWRIGHT_PROXY_SERVER } : undefined });
  const report = { runAt: new Date().toISOString(), base: BASE, moduleCount: N, completer: null, forwardOnly: null };

  try {
    // 1) COMPLETER — walk every module + the completion surfaces.
    {
      const { seeded, ctx, page, jsErrors } = await newAuthedPage(browser, {
        state: 'foundation-complete', kind: 'foundation', onboarding: ONBOARDING, allComplete: true,
      });
      try {
        const pages = [];
        pages.push(await visit(page, jsErrors, '/courses/foundation/program'));
        for (let m = 1; m <= N; m++) {
          const r = await visit(page, jsErrors, `/courses/foundation/program/${m}`, `/courses/foundation/program/${m}`);
          if (r.navError || r.status >= 400 || r.jsErrors.length || r.redirected) {
            await page.screenshot({ path: resolve(SHOT_DIR, `completer-m${m}.png`) }).catch(() => {});
          }
          pages.push(r);
        }
        for (const endpoint of ['/courses/foundation/program/submit', '/courses/foundation/program/certificate', '/courses/foundation/program/post-assessment']) {
          const r = await visit(page, jsErrors, endpoint, endpoint);
          if (r.navError || r.status >= 400 || r.jsErrors.length) {
            await page.screenshot({ path: resolve(SHOT_DIR, `completer-${endpoint.split('/').pop()}.png`) }).catch(() => {});
          }
          pages.push(r);
        }
        report.completer = {
          modulesWalked: N,
          pagesWithIssue: pages.filter((p) => p.navError || p.status >= 400 || p.jsErrors.length).length,
          unexpectedRedirects: pages.filter((p) => p.redirected && p.path.startsWith('/courses/foundation/program/')).map((p) => ({ from: p.path, to: p.landedPath })),
          certificateReachable: pages.find((p) => p.path.endsWith('/certificate'))?.redirected === false,
          deadEnds: pages.filter((p) => p.deadEnd).map((p) => p.path),
          pages,
        };
      } finally {
        await page.close().catch(() => {});
        await ctx.close().catch(() => {});
        if (seeded?.user?.id) await cleanupSeededUser(seeded.user.id).catch(() => {});
      }
    }

    // 2) EARLY learner — forward-only access control.
    {
      const { seeded, ctx, page, jsErrors } = await newAuthedPage(browser, {
        state: 'foundation-early', kind: 'foundation', onboarding: ONBOARDING, currentModule: 3, completedModules: [1, 2],
      });
      try {
        const checks = [];
        // completed module should stay open; beyond-current should redirect to current (3).
        for (const m of [1, 2, 3, 5, Math.min(N, 10), N]) {
          const r = await visit(page, jsErrors, `/courses/foundation/program/${m}`);
          const beyondCurrent = m > 3;
          checks.push({
            module: m, beyondCurrent, landedPath: r.landedPath, status: r.status,
            gatedCorrectly: beyondCurrent ? r.landedPath !== `/courses/foundation/program/${m}` : r.landedPath === `/courses/foundation/program/${m}`,
            jsErrors: r.jsErrors,
          });
        }
        report.forwardOnly = {
          currentModule: 3,
          checks,
          violations: checks.filter((c) => !c.gatedCorrectly),
        };
      } finally {
        await page.close().catch(() => {});
        await ctx.close().catch(() => {});
        if (seeded?.user?.id) await cleanupSeededUser(seeded.user.id).catch(() => {});
      }
    }
  } finally {
    await browser.close().catch(() => {});
    await cleanupAllSeededUsers().catch(() => {});
  }

  await writeFile(resolve(OUT_DIR, 'walk.json'), JSON.stringify(report, null, 2));

  const c = report.completer;
  const f = report.forwardOnly;
  const md = [
    `# Foundation course persona walk — ${BASE}`, ``, `Run: ${report.runAt} · ${N} modules`, ``,
    `## Completer (all modules complete)`,
    c ? [
      `- Modules walked: ${c.modulesWalked}`,
      `- Pages with issue (4xx / nav-fail / JS error): **${c.pagesWithIssue}**`,
      `- Certificate page reachable: **${c.certificateReachable ? 'YES' : 'NO'}**`,
      `- Unexpected redirects: ${c.unexpectedRedirects.length ? c.unexpectedRedirects.map((r) => `${r.from}→${r.to}`).join(', ') : 'none'}`,
      `- Dead-ends: ${c.deadEnds.length ? c.deadEnds.join(', ') : 'none'}`,
    ].join('\n') : '- (not run)',
    ``, `## Forward-only access control (early learner, current module 3)`,
    f ? [
      `- Checks: ${f.checks.length} · violations: **${f.violations.length}**`,
      ...f.checks.map((c2) => `  - module ${c2.module} (${c2.beyondCurrent ? 'beyond' : 'allowed'}): landed ${c2.landedPath} — ${c2.gatedCorrectly ? 'OK' : 'VIOLATION'}`),
    ].join('\n') : '- (not run)',
  ].join('\n');
  await writeFile(resolve(OUT_DIR, 'summary.md'), md);
  console.log(`report: ${resolve(OUT_DIR, 'summary.md')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
