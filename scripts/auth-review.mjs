#!/usr/bin/env node
// Auth & lead-capture audit harness — drives a real Chromium browser
// through every email/user/payment capture surface, captures a
// screenshot at each step, records the network calls, and emits a
// single self-contained HTML report at
//
//   audit/auth-review/index.html
//
// Designed to be re-runnable: deletes prior screenshots + raw logs on
// each run and rewrites them cleanly. The audit happens against a
// local dev server on http://localhost:3000 (override with BASE_URL).
//
// Coverage is grouped per the plan:
//   A. Email-only captures (assessment gate, research downloads,
//      playbook PDFs, safe-AI guide, certification inquiry)
//   B. Auth surfaces (signup, login, forgot/reset password, callback
//      interstitial, device trust)
//   C. Payment captures (Foundation purchase, In-Depth purchase,
//      Stripe success-page validation)
//   D. Protected-route redirect matrix
//
// Findings logic: the harness does not fail on any single error.
// Every observation — including 404s, redirects to /auth/login, and
// API 503s — is recorded and rendered in the report so the reviewer
// can see the actual behavior, not just "test passed."

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audit', 'auth-review');
const SCREEN_DIR = path.join(OUT_DIR, 'screenshots');
const RAW_DIR = path.join(OUT_DIR, 'raw');
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

const findings = [];
const observations = [];

function logStep(msg) {
  process.stdout.write(`  · ${msg}\n`);
}

function logSection(msg) {
  process.stdout.write(`\n[${msg}]\n`);
}

async function ensureDirs() {
  await fs.rm(SCREEN_DIR, { recursive: true, force: true });
  await fs.rm(RAW_DIR, { recursive: true, force: true });
  await fs.mkdir(SCREEN_DIR, { recursive: true });
  await fs.mkdir(RAW_DIR, { recursive: true });
}

function makeRecorder(page) {
  const requests = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith(BASE_URL)) return;
    const u = new URL(url);
    if (!u.pathname.startsWith('/api/') && !u.pathname.startsWith('/auth/')) return;
    requests.push({
      method: req.method(),
      path: u.pathname + (u.search || ''),
      postData: req.postData()?.slice(0, 2_000) ?? null,
    });
  });
  const responses = [];
  page.on('response', (res) => {
    const url = res.url();
    if (!url.startsWith(BASE_URL)) return;
    const u = new URL(url);
    if (!u.pathname.startsWith('/api/') && !u.pathname.startsWith('/auth/')) return;
    responses.push({
      status: res.status(),
      path: u.pathname + (u.search || ''),
    });
  });
  return { requests, responses };
}

// Wrap page.goto so navigation aborts (caused by dev-server compilation
// kicking off a same-URL refetch, or by a route redirecting off-origin)
// don't bubble as harness errors. The post-navigation screenshot still
// captures what actually landed.
async function safeGoto(page, url) {
  try {
    return await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  } catch (e) {
    const msg = e?.message || String(e);
    if (/ERR_ABORTED|interrupted by another navigation|ERR_CERT_AUTHORITY_INVALID|ERR_NAME_NOT_RESOLVED/i.test(msg)) {
      // Give the page a beat to settle on whatever it landed on, then
      // continue. The screenshot path will show the result.
      await page.waitForTimeout(500).catch(() => {});
      return null;
    }
    throw e;
  }
}

async function shot(page, id) {
  const file = path.join(SCREEN_DIR, `${id}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => {});
  return path.relative(OUT_DIR, file);
}

async function record({ page, id, group, title, run, expected = '', codeRefs = [] }) {
  logStep(`${id} — ${title}`);
  const { requests, responses } = makeRecorder(page);
  const startUrl = page.url();
  const screens = [];
  const apiProbes = []; // { method, path, status, body } captured manually via probe()
  let error = null;
  try {
    await run({
      shot: async (suffix) => screens.push(await shot(page, `${id}-${suffix}`)),
      probe: async (method, urlPath, body) => {
        const res = await page.request.fetch(`${BASE_URL}${urlPath}`, {
          method,
          headers: { 'content-type': 'application/json' },
          data: body !== undefined ? JSON.stringify(body) : undefined,
        }).catch((e) => null);
        const status = res?.status() ?? 0;
        const text = res ? await res.text().catch(() => '') : '';
        apiProbes.push({ method, path: urlPath, status, body: text.slice(0, 1000), reqBody: body ? JSON.stringify(body).slice(0, 1000) : null });
        return { status, text };
      },
    });
  } catch (e) {
    error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }
  const finalUrl = page.url();
  const obs = {
    id,
    group,
    title,
    startUrl,
    finalUrl,
    screens,
    requests,
    responses,
    apiProbes,
    expected,
    codeRefs,
    error,
  };
  observations.push(obs);
  await fs.writeFile(path.join(RAW_DIR, `${id}.json`), JSON.stringify(obs, null, 2));
  return obs;
}

function addFinding({ severity, area, summary, evidence }) {
  findings.push({ severity, area, summary, evidence });
}

// ── Walkers ────────────────────────────────────────────────────────────────

async function walkAuthSurfaces(page) {
  logSection('B. Auth surfaces');

  // B1 — signup render
  await record({
    page,
    id: 'B1-signup-render',
    group: 'B',
    title: 'Signup form renders',
    expected: 'Page renders with fullName, email, password, confirm, institution, terms checkbox',
    codeRefs: ['src/app/auth/signup/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/signup`);
      await shot('initial');
    },
  });

  // B1b — signup invalid email
  await record({
    page,
    id: 'B1b-signup-invalid-email',
    group: 'B',
    title: 'Signup rejects invalid email (HTML5 validation)',
    expected: 'Browser blocks submit on type="email" validation',
    codeRefs: ['src/app/auth/signup/page.tsx:138-184'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/signup`);
      await page.fill('input[name="fullName"]', 'Audit Bot');
      await page.fill('input[name="email"]', 'not-an-email');
      await page.fill('input[name="password"]', 'goodpassword1');
      await page.fill('input[name="confirmPassword"]', 'goodpassword1');
      await page.check('input[name="terms"]');
      await shot('filled');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
      await shot('after-submit');
    },
  });

  // B1c — signup short password
  await record({
    page,
    id: 'B1c-signup-short-password',
    group: 'B',
    title: 'Signup rejects short password',
    expected: 'validatePassword() rejects sub-minimum-length',
    codeRefs: ['src/app/auth/signup/page.tsx:154', 'src/lib/auth/password-policy.ts'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/signup`);
      await page.fill('input[name="fullName"]', 'Audit Bot');
      await page.fill('input[name="email"]', 'short@aibankinginstitute.test');
      await page.fill('input[name="password"]', 'abc');
      await page.fill('input[name="confirmPassword"]', 'abc');
      await page.check('input[name="terms"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
      await shot('after-submit');
    },
  });

  // B1d — signup terms unchecked
  await record({
    page,
    id: 'B1d-signup-terms-unchecked',
    group: 'B',
    title: 'Signup rejects when terms unchecked',
    expected: '"You must accept the terms" alert',
    codeRefs: ['src/app/auth/signup/page.tsx:150-153'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/signup`);
      await page.fill('input[name="fullName"]', 'Audit Bot');
      await page.fill('input[name="email"]', 'terms@aibankinginstitute.test');
      await page.fill('input[name="password"]', 'goodpassword1');
      await page.fill('input[name="confirmPassword"]', 'goodpassword1');
      // intentionally do not check terms
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
      await shot('after-submit');
    },
  });

  // B1e — signup password mismatch
  await record({
    page,
    id: 'B1e-signup-password-mismatch',
    group: 'B',
    title: 'Signup rejects mismatched passwords',
    expected: '"Passwords do not match" alert',
    codeRefs: ['src/app/auth/signup/page.tsx:159-162'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/signup`);
      await page.fill('input[name="fullName"]', 'Audit Bot');
      await page.fill('input[name="email"]', 'mismatch@aibankinginstitute.test');
      await page.fill('input[name="password"]', 'goodpassword1');
      await page.fill('input[name="confirmPassword"]', 'goodpassword2');
      await page.check('input[name="terms"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
      await shot('after-submit');
    },
  });

  // B1f — signup full submit (will fail because Supabase is not configured; capture error UI)
  await record({
    page,
    id: 'B1f-signup-supabase-down',
    group: 'B',
    title: 'Signup with Supabase not configured surfaces error',
    expected: '"Auth is not configured" error (signUp() guard)',
    codeRefs: ['src/lib/supabase/auth.ts:47-71'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/signup`);
      await page.fill('input[name="fullName"]', 'Audit Bot');
      await page.fill('input[name="email"]', 'ok@aibankinginstitute.test');
      await page.fill('input[name="password"]', 'goodpassword1');
      await page.fill('input[name="confirmPassword"]', 'goodpassword1');
      await page.check('input[name="terms"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1500);
      await shot('after-submit');
    },
  });

  // B2 — login form render
  await record({
    page,
    id: 'B2-login-render',
    group: 'B',
    title: 'Login form renders',
    expected: 'Email + password, forgot-password link, dev-skip button (NODE_ENV=development)',
    codeRefs: ['src/app/auth/login/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/login`);
      await shot('initial');
    },
  });

  // B2b — login with email prefill via ?email=
  await record({
    page,
    id: 'B2b-login-email-prefill',
    group: 'B',
    title: 'Login pre-fills ?email= from URL (post-Stripe deep link)',
    expected: 'Email field shows prefilled value',
    codeRefs: ['src/app/auth/login/page.tsx:262-264'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/login?email=buyer%40bank.test`);
      await shot('initial');
    },
  });

  // B2c — login with garbage email param (open-redirect / pre-fill defense)
  await record({
    page,
    id: 'B2c-login-bad-email-prefill',
    group: 'B',
    title: 'Login rejects malformed ?email= and shows blank',
    expected: 'EMAIL_RE_LOGIN regex rejects junk → field empty',
    codeRefs: ['src/app/auth/login/page.tsx:252', 'src/app/auth/login/page.tsx:264'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/login?email=javascript:alert(1)`);
      await shot('initial');
    },
  });

  // B2d — login with malicious next param (open-redirect defense)
  await record({
    page,
    id: 'B2d-login-next-open-redirect',
    group: 'B',
    title: 'Login sanitizes ?next= against open-redirect (//evil.com)',
    expected: 'sanitizeNext() rejects protocol-relative URL, falls back to /dashboard',
    codeRefs: ['src/lib/supabase/auth.ts:11-21'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/login?next=//evil.example.com/x`);
      await shot('initial');
    },
  });

  // B2e — login with ?error= rendering
  await record({
    page,
    id: 'B2e-login-error-banner',
    group: 'B',
    title: 'Login renders ?error= banner',
    expected: 'Error banner present at top of card',
    codeRefs: ['src/app/auth/login/page.tsx:274-282'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/login?error=missing_code`);
      await shot('initial');
    },
  });

  // B2f — login submit with Supabase down
  await record({
    page,
    id: 'B2f-login-supabase-down',
    group: 'B',
    title: 'Login submit with Supabase not configured',
    expected: '"Auth is not configured" error from signIn() guard',
    codeRefs: ['src/lib/supabase/auth.ts:76-82'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/login`);
      await page.fill('input[name="email"]', 'nobody@aibankinginstitute.test');
      await page.fill('input[name="password"]', 'whatever');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1500);
      await shot('after-submit');
    },
  });

  // B3 — forgot password
  await record({
    page,
    id: 'B3-forgot-render',
    group: 'B',
    title: 'Forgot password form renders',
    expected: 'Single email input',
    codeRefs: ['src/app/auth/forgot-password/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/forgot-password`);
      await shot('initial');
    },
  });

  // B3b — forgot password submit (Supabase not configured)
  await record({
    page,
    id: 'B3b-forgot-submit',
    group: 'B',
    title: 'Forgot password submit (Supabase down)',
    expected: 'Either "Auth not configured" error OR generic success ("if that address is in our system…")',
    codeRefs: ['src/lib/supabase/auth.ts:113-123'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/forgot-password`);
      await page.fill('input[name="email"]', 'forgot@aibankinginstitute.test');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1500);
      await shot('after-submit');
    },
  });

  // B4 — reset password without recovery session
  await record({
    page,
    id: 'B4-reset-no-session',
    group: 'B',
    title: 'Reset password page reached without a recovery session',
    expected: 'Page renders; submit would fail since updateUser requires recovery session',
    codeRefs: ['src/app/auth/reset-password/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/reset-password`);
      await shot('initial');
    },
  });

  // B5 — confirm interstitial with no params
  await record({
    page,
    id: 'B5-confirm-no-params',
    group: 'B',
    title: 'Confirm interstitial (no params) — dead-letter path',
    expected: 'Renders fallback "this link is missing required information" + return-to-login',
    codeRefs: ['src/app/auth/confirm/page.tsx:50-194'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/confirm`);
      await shot('initial');
    },
  });

  // B5b — confirm interstitial with token (signup)
  await record({
    page,
    id: 'B5b-confirm-signup-token',
    group: 'B',
    title: 'Confirm interstitial with fake signup token',
    expected: 'Renders "Confirm your email" button; user must click to consume token',
    codeRefs: ['src/app/auth/confirm/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/confirm?token_hash=fake_token_hash&type=signup`);
      await shot('initial');
    },
  });

  // B5c — confirm with recovery flow framing
  await record({
    page,
    id: 'B5c-confirm-recovery',
    group: 'B',
    title: 'Confirm interstitial for recovery flow',
    expected: 'Headline = "Confirm to set a new password"',
    codeRefs: ['src/app/auth/confirm/page.tsx:60-72'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/confirm?token_hash=fake&type=recovery`);
      await shot('initial');
    },
  });

  // B6 — callback GET no params (should redirect to /auth/confirm)
  await record({
    page,
    id: 'B6-callback-no-params',
    group: 'B',
    title: 'GET /auth/callback with no params redirects to /auth/confirm',
    expected: 'No 500; lands on /auth/confirm (which then shows dead-letter UI)',
    codeRefs: ['src/app/auth/callback/route.ts:79-85'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/callback`);
      await shot('after-redirect');
    },
  });

  // B6b — callback GET with token (should redirect to /auth/confirm preserving qs)
  await record({
    page,
    id: 'B6b-callback-token-redirect',
    group: 'B',
    title: 'GET /auth/callback?token=fake redirects to /auth/confirm preserving querystring',
    expected: 'Lands on /auth/confirm with token_hash + type forwarded',
    codeRefs: ['src/app/auth/callback/route.ts:79-85'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/callback?token_hash=abc&type=signup&next=/dashboard`);
      await shot('after-redirect');
    },
  });

  // B7 — confirm-device-pending
  await record({
    page,
    id: 'B7-confirm-device-pending',
    group: 'B',
    title: 'Confirm-device-pending render',
    expected: 'Holding page for new-device sign-in (sends one-time email)',
    codeRefs: ['src/app/auth/confirm-device-pending/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/confirm-device-pending?email=audit%40aibankinginstitute.test`);
      await shot('initial');
    },
  });

  // B8 — confirm-device with fake token
  await record({
    page,
    id: 'B8-confirm-device-fake',
    group: 'B',
    title: 'GET /auth/confirm-device?token=fake — invalid token path',
    expected: 'Bounces to login with error param',
    codeRefs: ['src/app/auth/confirm-device/route.ts'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/auth/confirm-device?token=ZZZZ-not-a-real-token`);
      await shot('initial');
    },
  });
}

async function walkProtectedRoutes(page) {
  logSection('D. Protected-route redirect matrix');
  const targets = [
    { id: 'D1-dashboard', path: '/dashboard', expectLogin: true },
    { id: 'D2-dashboard-toolbox', path: '/dashboard/toolbox', expectLogin: true },
    { id: 'D3-dashboard-assessments', path: '/dashboard/assessments', expectLogin: true },
    { id: 'D4-foundation-program', path: '/courses/foundation/program', expectLogin: true },
    { id: 'D5-foundation-module', path: '/courses/foundation/program/3', expectLogin: true },
    { id: 'D6-foundation-purchase', path: '/courses/foundation/program/purchase', expectLogin: false },
    { id: 'D7-foundation-gallery', path: '/courses/foundation/program/gallery', expectLogin: true },
    { id: 'D8-indepth-access', path: '/assessment/in-depth/access', expectLogin: true },
    { id: 'D9-my-toolbox', path: '/my-toolbox', expectLogin: false /* unknown — observe */ },
    { id: 'D10-assessment-page', path: '/assessment', expectLogin: false },
    { id: 'D11-indepth-page', path: '/assessment/in-depth', expectLogin: false },
  ];
  for (const t of targets) {
    await record({
      page,
      id: t.id,
      group: 'D',
      title: `Visit ${t.path}`,
      expected: t.expectLogin
        ? 'Redirects to /auth/login?next=… with original path preserved'
        : 'Renders without auth gate',
      codeRefs: [],
      run: async ({ shot }) => {
        await page.context().clearCookies();
        await safeGoto(page, `${BASE_URL}${t.path}`);
        await page.waitForTimeout(300);
        await shot('landed');
      },
    });
  }
}

async function walkEmailCaptureSurfaces(page) {
  logSection('A. Email-only capture surfaces');

  // A1 — assessment results gate (walk the assessment to reach EmailGate)
  await record({
    page,
    id: 'A1-assessment-take-render',
    group: 'A',
    title: 'Assessment take page renders',
    expected: 'Assessment quiz shell',
    codeRefs: ['src/app/assessment/take/_client.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/assessment/take`);
      await page.waitForTimeout(800);
      await shot('initial');
    },
  });

  // A1b — try to drive the assessment far enough to hit EmailGate.
  // Best-effort: if the question UI doesn't match expected selectors,
  // record what we found and move on.
  await record({
    page,
    id: 'A1b-assessment-email-gate',
    group: 'A',
    title: 'Drive assessment to EmailGate (best-effort)',
    expected: 'Reach 12-question completion → EmailGate renders preview score + email form',
    codeRefs: ['src/app/assessment/_components/EmailGate.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/assessment/take`);
      await page.waitForTimeout(800);
      // Click any "begin" / "start" CTA if present.
      const start = page.getByRole('button', { name: /(begin|start)/i }).first();
      if (await start.isVisible().catch(() => false)) await start.click().catch(() => {});
      await page.waitForTimeout(500);

      // Walk 12 questions by clicking the first option group choice.
      for (let i = 0; i < 12; i++) {
        const options = page.getByRole('button').filter({ hasText: /agree|disagree|sometimes|often|rarely|always|never|yes|no|^[1-4]$/i });
        const count = await options.count().catch(() => 0);
        if (count === 0) break;
        // Pick something in the middle.
        await options.nth(Math.min(1, count - 1)).click().catch(() => {});
        await page.waitForTimeout(120);
      }
      await page.waitForTimeout(1200);
      await shot('after-walk');
    },
  });

  // A2 — research downloads
  await record({
    page,
    id: 'A2-research-render',
    group: 'A',
    title: 'Research library page renders with DownloadGate buttons',
    expected: 'Each artifact card exposes "Get the PDF" button',
    codeRefs: ['src/components/research/DownloadGate.tsx', 'src/app/resources/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/resources`);
      await page.waitForTimeout(500);
      await shot('initial');
    },
  });

  // A3 — playbooks index
  await record({
    page,
    id: 'A3-playbooks-index',
    group: 'A',
    title: 'Playbooks index renders',
    expected: 'Six role tiles linking to /playbooks/[role]',
    codeRefs: ['src/app/playbooks/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/playbooks`);
      await shot('initial');
    },
  });

  // A3b — one playbook role page, open download modal
  await record({
    page,
    id: 'A3b-playbook-role-modal',
    group: 'A',
    title: 'Playbook role page opens PlaybookDownloadModal',
    expected: 'Modal asks for name/email/institution; submits to /api/inquiry',
    codeRefs: ['src/app/playbooks/_components/PlaybookDownloadModal.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/playbooks/compliance`);
      await page.waitForTimeout(500);
      await shot('role-page');
      // Try to open the download modal.
      const dl = page.getByRole('button', { name: /(download|get).*playbook|email.*me/i }).first();
      if (await dl.isVisible().catch(() => false)) {
        await dl.click().catch(() => {});
        await page.waitForTimeout(400);
        await shot('modal-open');
      }
    },
  });

  // A3c — submit playbook modal → /api/inquiry
  await record({
    page,
    id: 'A3c-playbook-submit',
    group: 'A',
    title: 'Submit playbook download form → /api/inquiry POST',
    expected: '200 OK; ensureAuthUser + subscribeToPlaybookForm fire',
    codeRefs: ['src/app/api/inquiry/route.ts'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/playbooks/compliance`);
      await page.waitForTimeout(500);
      const dl = page.getByRole('button', { name: /(download|get).*playbook|email.*me/i }).first();
      if (await dl.isVisible().catch(() => false)) {
        await dl.click().catch(() => {});
        await page.waitForTimeout(400);
        // Try common field selectors.
        const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
        const emailInput = page.locator('input[name="email"], input[type="email"]').first();
        const instInput = page.locator('input[name="institution"], input[placeholder*="institution" i]').first();
        if (await nameInput.isVisible().catch(() => false)) await nameInput.fill('Audit Bot');
        if (await emailInput.isVisible().catch(() => false)) await emailInput.fill('audit@aibankinginstitute.test');
        if (await instInput.isVisible().catch(() => false)) await instInput.fill('Audit Bank');
        await shot('filled');
        const submit = page.getByRole('button', { name: /(submit|download|send|email me)/i }).last();
        if (await submit.isVisible().catch(() => false)) await submit.click().catch(() => {});
        await page.waitForTimeout(1500);
        await shot('after-submit');
      }
    },
  });

  // A4 — Safe-AI Use guide form
  await record({
    page,
    id: 'A4-safe-ai-guide-render',
    group: 'A',
    title: '/security renders Safe-AI-Use guide request form',
    expected: 'Form with name/email/institution',
    codeRefs: ['src/app/security/_components/GuideRequestForm.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/security`);
      await page.waitForTimeout(500);
      await shot('initial');
    },
  });

  // A4b — Safe-AI submit
  await record({
    page,
    id: 'A4b-safe-ai-submit',
    group: 'A',
    title: 'Submit Safe-AI guide request → /api/inquiry (type=guide-request)',
    expected: '200 OK; PDF download trigger',
    codeRefs: ['src/app/security/_components/GuideRequestForm.tsx', 'src/app/api/inquiry/route.ts'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/security`);
      await page.waitForTimeout(500);
      // Best-effort fill of the visible form.
      const nameInput = page.locator('input[name="name"], input[type="text"]').first();
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const instInput = page.locator('input[name="institution"]').first();
      if (await nameInput.isVisible().catch(() => false)) await nameInput.fill('Audit Bot');
      if (await emailInput.isVisible().catch(() => false)) await emailInput.fill('audit-guide@aibankinginstitute.test');
      if (await instInput.isVisible().catch(() => false)) await instInput.fill('Audit Bank');
      await shot('filled');
      const submit = page.getByRole('button', { name: /(get|send|download|submit)/i }).first();
      if (await submit.isVisible().catch(() => false)) await submit.click().catch(() => {});
      await page.waitForTimeout(2000);
      await shot('after-submit');
    },
  });

  // A5 — certifications inquiry form
  await record({
    page,
    id: 'A5-cert-inquiry-render',
    group: 'A',
    title: '/certifications renders inquiry form',
    expected: 'Form with name/email/institution/track',
    codeRefs: ['src/app/certifications/_components/InquiryForm.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/certifications`);
      await page.waitForTimeout(500);
      await shot('initial');
    },
  });

  // A6 — direct /api/capture-email assessment shape (no UI)
  await record({
    page,
    id: 'A6-capture-email-api-direct',
    group: 'A',
    title: 'POST /api/capture-email (assessment shape) — direct API probe',
    expected: '200 OK; profileId may be null without Supabase',
    codeRefs: ['src/app/api/capture-email/route.ts'],
    run: async ({ shot, probe }) => {
      const { status, text } = await probe('POST', '/api/capture-email', {
        email: 'audit-api@aibankinginstitute.test',
        score: 30,
        tier: 'building-momentum',
        tierLabel: 'Building Momentum',
        answers: [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2],
        version: 'v2',
        maxScore: 48,
        marketingOptIn: false,
      });
      const safeBody = JSON.stringify({ status, body: text.slice(0, 2000) }, null, 2);
      await page.setContent(`<pre style="font:14px/1.4 ui-monospace,Menlo,monospace;padding:24px;background:#f6f6f6;color:#111;white-space:pre-wrap;">${safeBody.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;')}</pre>`);
      await shot('response');
    },
  });

  // A6b — direct /api/inquiry shape
  await record({
    page,
    id: 'A6b-inquiry-api-direct',
    group: 'A',
    title: 'POST /api/inquiry (guide-request) — direct API probe',
    expected: '200 OK',
    codeRefs: ['src/app/api/inquiry/route.ts'],
    run: async ({ shot, probe }) => {
      const { status, text } = await probe('POST', '/api/inquiry', {
        name: 'Audit Bot',
        email: 'audit-inq@aibankinginstitute.test',
        institution: 'Audit Bank',
        track: 'safe-ai-use',
        notes: '',
        type: 'guide-request',
      });
      const safeBody = JSON.stringify({ status, body: text.slice(0, 2000) }, null, 2);
      await page.setContent(`<pre style="font:14px/1.4 ui-monospace,Menlo,monospace;padding:24px;background:#f6f6f6;color:#111;white-space:pre-wrap;">${safeBody.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;')}</pre>`);
      await shot('response');
    },
  });

  // A6c — direct /api/inquiry with bogus type
  await record({
    page,
    id: 'A6c-inquiry-bad-type',
    group: 'A',
    title: 'POST /api/inquiry with disallowed type — should 400',
    expected: '400 Invalid payload',
    codeRefs: ['src/app/api/inquiry/route.ts:26-31'],
    run: async ({ shot, probe }) => {
      const { status, text } = await probe('POST', '/api/inquiry', {
        name: 'Audit Bot',
        email: 'audit-inq2@aibankinginstitute.test',
        institution: 'Audit Bank',
        track: 'x',
        notes: '',
        type: 'arbitrary-type-from-attacker',
      });
      const safeBody = JSON.stringify({ status, body: text.slice(0, 2000) }, null, 2);
      await page.setContent(`<pre style="font:14px/1.4 ui-monospace,Menlo,monospace;padding:24px;background:#f6f6f6;color:#111;white-space:pre-wrap;">${safeBody.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;')}</pre>`);
      await shot('response');
    },
  });
}

async function walkPaymentSurfaces(page) {
  logSection('C. Payment capture surfaces');

  // C1 — Foundation purchase page
  await record({
    page,
    id: 'C1-foundation-purchase',
    group: 'C',
    title: '/courses/foundation/program/purchase renders',
    expected: 'EnrollButton present (logged-out path)',
    codeRefs: ['src/app/courses/foundation/program/purchase/page.tsx', 'src/app/api/create-checkout/route.ts'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/courses/foundation/program/purchase`);
      await page.waitForTimeout(800);
      await shot('initial');
    },
  });

  // C2 — Direct POST /api/create-checkout individual (Stripe should 503 without key)
  await record({
    page,
    id: 'C2-create-checkout-individual',
    group: 'C',
    title: 'POST /api/create-checkout (individual) — direct probe',
    expected: 'Without STRIPE_FOUNDATION_PRICE_ID → 503 "Payment system not configured."',
    codeRefs: ['src/app/api/create-checkout/route.ts:119-122'],
    run: async ({ shot, probe }) => {
      const { status, text } = await probe('POST', '/api/create-checkout', {
        mode: 'individual',
        user_email: 'audit@aibankinginstitute.test',
      });
      const safeBody = JSON.stringify({ status, body: text.slice(0, 2000) }, null, 2);
      await page.setContent(`<pre style="font:14px/1.4 ui-monospace,Menlo,monospace;padding:24px;background:#f6f6f6;color:#111;white-space:pre-wrap;">${safeBody.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;')}</pre>`);
      await shot('response');
    },
  });

  // C2b — institution with quantity < 10 (validation)
  await record({
    page,
    id: 'C2b-create-checkout-low-qty',
    group: 'C',
    title: 'POST /api/create-checkout (institution, qty=5) — should 400',
    expected: '400 "Team purchases require quantity >= 10"',
    codeRefs: ['src/app/api/create-checkout/route.ts:73-79'],
    run: async ({ shot, probe }) => {
      const { status, text } = await probe('POST', '/api/create-checkout', {
        mode: 'institution',
        quantity: 5,
        institution_name: 'Audit Bank',
      });
      const safeBody = JSON.stringify({ status, body: text.slice(0, 2000) }, null, 2);
      await page.setContent(`<pre style="font:14px/1.4 ui-monospace,Menlo,monospace;padding:24px;background:#f6f6f6;color:#111;white-space:pre-wrap;">${safeBody.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;')}</pre>`);
      await shot('response');
    },
  });

  // C3 — in-depth purchase page
  await record({
    page,
    id: 'C3-indepth-page',
    group: 'C',
    title: '/assessment/in-depth renders (purchase entry)',
    expected: 'PurchaseButton visible',
    codeRefs: ['src/app/assessment/in-depth/_components/PurchaseButton.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/assessment/in-depth`);
      await page.waitForTimeout(800);
      await shot('initial');
    },
  });

  // C3b — direct POST /api/checkout/in-depth
  await record({
    page,
    id: 'C3b-checkout-indepth',
    group: 'C',
    title: 'POST /api/checkout/in-depth (individual) — direct probe',
    expected: 'Without STRIPE_INDEPTH_PRICE_ID → 503',
    codeRefs: ['src/app/api/checkout/in-depth/route.ts:80-87'],
    run: async ({ shot, probe }) => {
      const { status, text } = await probe('POST', '/api/checkout/in-depth', {
        mode: 'individual',
        user_email: 'audit@aibankinginstitute.test',
      });
      const safeBody = JSON.stringify({ status, body: text.slice(0, 2000) }, null, 2);
      await page.setContent(`<pre style="font:14px/1.4 ui-monospace,Menlo,monospace;padding:24px;background:#f6f6f6;color:#111;white-space:pre-wrap;">${safeBody.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;')}</pre>`);
      await shot('response');
    },
  });

  // C3c — in-depth institution mode (deferred)
  await record({
    page,
    id: 'C3c-checkout-indepth-institution',
    group: 'C',
    title: 'POST /api/checkout/in-depth (institution) — should 503 "coming soon"',
    expected: '503 with "coming soon" message',
    codeRefs: ['src/app/api/checkout/in-depth/route.ts:62-70'],
    run: async ({ shot, probe }) => {
      const { status, text } = await probe('POST', '/api/checkout/in-depth', { mode: 'institution' });
      const safeBody = JSON.stringify({ status, body: text.slice(0, 2000) }, null, 2);
      await page.setContent(`<pre style="font:14px/1.4 ui-monospace,Menlo,monospace;padding:24px;background:#f6f6f6;color:#111;white-space:pre-wrap;">${safeBody.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;')}</pre>`);
      await shot('response');
    },
  });

  // C4 — Stripe success page validation (foundation)
  await record({
    page,
    id: 'C4-foundation-purchased-no-session',
    group: 'C',
    title: '/courses/foundation/program/purchased without session_id',
    expected: 'getValidatedPaidSession returns null; if STRIPE_SECRET_KEY set, redirects back to purchase. Without secret, renders page (preview mode).',
    codeRefs: ['src/app/courses/foundation/program/purchased/page.tsx:71-77'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/courses/foundation/program/purchased`);
      await page.waitForTimeout(800);
      await shot('landed');
    },
  });

  // C4b — Stripe success page with fake session_id
  await record({
    page,
    id: 'C4b-foundation-purchased-fake-session',
    group: 'C',
    title: '/courses/foundation/program/purchased?session_id=fake',
    expected: 'Same as C4 — no Stripe call possible without secret key',
    codeRefs: ['src/app/courses/foundation/program/purchased/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/courses/foundation/program/purchased?session_id=cs_test_fake`);
      await page.waitForTimeout(800);
      await shot('landed');
    },
  });

  // C5 — In-Depth success page validation
  await record({
    page,
    id: 'C5-indepth-purchased-no-session',
    group: 'C',
    title: '/assessment/in-depth/purchased without session_id',
    expected: 'Page renders OR redirects',
    codeRefs: ['src/app/assessment/in-depth/purchased/page.tsx'],
    run: async ({ shot }) => {
      await safeGoto(page, `${BASE_URL}/assessment/in-depth/purchased`);
      await page.waitForTimeout(800);
      await shot('landed');
    },
  });

  // C6 — webhook signature rejection
  await record({
    page,
    id: 'C6-webhook-unsigned',
    group: 'C',
    title: 'POST /api/webhooks/stripe with no signature — should reject',
    expected: '400 "Missing stripe-signature header" OR 503 "Webhook not configured" if STRIPE_WEBHOOK_SECRET unset',
    codeRefs: ['src/app/api/webhooks/stripe/route.ts:46-60'],
    run: async ({ shot, probe }) => {
      const { status, text } = await probe('POST', '/api/webhooks/stripe', { fake: true });
      const safeBody = JSON.stringify({ status, body: text.slice(0, 2000) }, null, 2);
      await page.setContent(`<pre style="font:14px/1.4 ui-monospace,Menlo,monospace;padding:24px;background:#f6f6f6;color:#111;white-space:pre-wrap;">${safeBody.replace(/[<&]/g, (c) => c === '<' ? '&lt;' : '&amp;')}</pre>`);
      await shot('response');
    },
  });
}

// ── Findings (post-walk evaluation against observations) ────────────────

function evaluateFindings() {
  for (const o of observations) {
    if (o.error) {
      addFinding({
        severity: 'soft',
        area: o.group,
        summary: `${o.id}: harness threw — ${o.error}`,
        evidence: o.finalUrl,
      });
    }
  }

  // Protected-route redirects — confirm next= preservation.
  const dRows = observations.filter((o) => o.group === 'D');
  for (const o of dRows) {
    const requestedPath = new URL(o.startUrl).pathname || o.title.replace('Visit ', '');
    const startedAt = o.startUrl;
    const ended = new URL(o.finalUrl);
    if (o.title.includes('/auth/') || ended.pathname.startsWith('/auth/')) {
      // Was sent to login.
      if (!ended.search.includes('next=')) {
        addFinding({
          severity: 'fail',
          area: 'D',
          summary: `${o.id}: redirected to ${ended.pathname} without next= param — deep-link gets lost`,
          evidence: `${startedAt} → ${o.finalUrl}`,
        });
      }
    }
  }

  // confirm-device hardcodes production origin — observed when
  // harness chased the redirect off-localhost.
  addFinding({
    severity: 'warning',
    area: 'B',
    summary: '/auth/confirm-device GET hardcodes "https://aibankinginstitute.com" as the redirect base for every error path (src/app/auth/confirm-device/route.ts:30). This means errors in local dev redirect to the production host. Should use request.url origin instead so the user stays on the same deployment.',
    evidence: 'src/app/auth/confirm-device/route.ts:27-33',
  });

  // Auto-bypass meta-finding (most important context for this run).
  addFinding({
    severity: 'warning',
    area: 'env',
    summary: 'Local audit ran WITHOUT Supabase credentials, so isPreviewAuthBypassEnabled() returns true and ALL /dashboard/* layout gates auto-pass (src/lib/auth/previewBypass.ts:28-31). That is the documented behavior, but it means the D-row "protected route" screenshots show the page rendering — not the redirect they would do in production. The expected behavior is documented in expected-vs-observed; verify by re-running with real Supabase env vars.',
    evidence: 'src/lib/auth/previewBypass.ts:16-32',
  });

  // Direct-probe expectations.
  const probeChecks = [
    { id: 'A6-capture-email-api-direct', method: 'POST', path: '/api/capture-email', want: 200, severity: 'fail' },
    { id: 'A6b-inquiry-api-direct', method: 'POST', path: '/api/inquiry', want: 200, severity: 'fail' },
    { id: 'A6c-inquiry-bad-type', method: 'POST', path: '/api/inquiry', want: 400, severity: 'fail' },
    { id: 'C2-create-checkout-individual', method: 'POST', path: '/api/create-checkout', want: 503, severity: 'soft' },
    { id: 'C2b-create-checkout-low-qty', method: 'POST', path: '/api/create-checkout', want: 400, severity: 'fail' },
    { id: 'C3b-checkout-indepth', method: 'POST', path: '/api/checkout/in-depth', want: 503, severity: 'soft' },
    { id: 'C3c-checkout-indepth-institution', method: 'POST', path: '/api/checkout/in-depth', want: 503, severity: 'fail' },
    { id: 'C6-webhook-unsigned', method: 'POST', path: '/api/webhooks/stripe', want: [400, 503], severity: 'fail' },
  ];
  for (const c of probeChecks) {
    const o = observations.find((x) => x.id === c.id);
    if (!o) continue;
    const probe = (o.apiProbes ?? []).find((p) => p.method === c.method && p.path === c.path);
    if (!probe) {
      addFinding({ severity: 'soft', area: o.group, summary: `${c.id}: no probe captured for ${c.method} ${c.path}`, evidence: '' });
      continue;
    }
    const wants = Array.isArray(c.want) ? c.want : [c.want];
    if (!wants.includes(probe.status)) {
      addFinding({
        severity: c.severity,
        area: o.group,
        summary: `${c.id}: ${c.method} ${c.path} returned ${probe.status}, expected ${wants.join(' or ')}.`,
        evidence: (probe.body || '').slice(0, 240),
      });
    } else {
      addFinding({
        severity: 'info',
        area: o.group,
        summary: `${c.id}: ${c.method} ${c.path} returned ${probe.status} as expected.`,
        evidence: (probe.body || '').slice(0, 200),
      });
    }
  }

  // Dev-skip button visibility check — code path in /auth/login.
  addFinding({
    severity: 'info',
    area: 'B',
    summary: 'DevSkipButton renders only when process.env.NODE_ENV !== "production" (src/app/auth/login/page.tsx:130-147). Confirmed gated.',
    evidence: 'src/app/auth/login/page.tsx:130',
  });

  // Magic-link retirement check.
  addFinding({
    severity: 'info',
    area: 'B',
    summary: 'Magic-link sign-in retired 2026-05-28 (#187). signInWithMagicLink removed from src/lib/supabase/auth.ts. Post-assessment "set your password" flow uses resetPasswordForEmail (sendPasswordSetupAction).',
    evidence: 'src/lib/supabase/auth.ts:84-89, src/app/auth/actions.ts:23-45',
  });

  // sanitizeNext usage audit.
  addFinding({
    severity: 'info',
    area: 'B',
    summary: 'sanitizeNext() is the canonical open-redirect guard; called from /auth/login, /auth/signup, /api/auth/check-device, /api/capture-email (auth-admin magic link), and /auth/actions.ts. /auth/callback POST does its own startsWith("/") check at route.ts:92 — equivalent guarantee but not centralized.',
    evidence: 'src/lib/supabase/auth.ts:11-21, src/app/auth/callback/route.ts:92',
  });

  // Trusted-device gate enforcement audit.
  addFinding({
    severity: 'warning',
    area: 'B',
    summary: 'Trusted-device check is enforced at /dashboard/layout.tsx:79-82 but verify whether the same gate exists on /courses/foundation/program/layout.tsx, /my-toolbox, and /assessment/in-depth/access. If absent, a stolen Supabase cookie could reach those surfaces without the device-trust handshake. /api/auth/check-device fail-open path (login page line 199-209) makes this gap higher-impact.',
    evidence: 'src/app/dashboard/layout.tsx:79-82, src/app/auth/login/page.tsx:199-209',
  });

  // Stripe webhook event coverage.
  addFinding({
    severity: 'info',
    area: 'C',
    summary: 'Stripe webhook only handles checkout.session.completed (src/app/api/webhooks/stripe/route.ts:77-79). All other events 200-OK silently — refunds, disputes, payment_intent.payment_failed, customer.subscription.* never trigger any action. Acceptable for one-time-charge model but flag if subscription billing is added.',
    evidence: 'src/app/api/webhooks/stripe/route.ts:77',
  });

  // ensureAuthUser fanout.
  addFinding({
    severity: 'info',
    area: 'A/C',
    summary: 'ensureAuthUser is called from /api/capture-email, /api/inquiry, /api/webhooks/stripe. Each is wrapped in try/catch with .warn-and-continue. Confirm idempotency (multiple calls for same email do not create duplicate auth.users rows).',
    evidence: 'src/app/api/capture-email/route.ts:320, src/app/api/inquiry/route.ts:100, src/app/api/webhooks/stripe/route.ts:116',
  });

  // Research path lead_source requirement.
  addFinding({
    severity: 'info',
    area: 'A',
    summary: '/api/capture-email research path requires lead_source. Verify every DownloadGate caller passes a non-empty lead_source string; otherwise the gate 400s silently from the user POV.',
    evidence: 'src/app/api/capture-email/route.ts:168-178',
  });

  // /api/auth/check-device fails open.
  addFinding({
    severity: 'warning',
    area: 'B',
    summary: '/auth/login PasswordForm catches /api/auth/check-device errors and pushes to redirectTo anyway (page.tsx:199-209). Comment says trust is enforced at the layout — make sure every protected layout actually does so, otherwise a transient check-device 500 lets users in untrusted.',
    evidence: 'src/app/auth/login/page.tsx:199-209',
  });

  // Forgot password — generic response (no enumeration).
  addFinding({
    severity: 'info',
    area: 'B',
    summary: '/auth/forgot-password shows generic "if that address is in our system" regardless of whether the email exists — correct anti-enumeration behavior.',
    evidence: 'src/app/auth/forgot-password/page.tsx:148-165',
  });

  // Confirm interstitial — scanner pre-fetch defense.
  addFinding({
    severity: 'info',
    area: 'B',
    summary: '/auth/callback GET never consumes a token — it redirects to /auth/confirm which renders a click-through button. Only the POST consumes. This is the documented email-scanner pre-fetch defense.',
    evidence: 'src/app/auth/callback/route.ts:14-31, 79-85',
  });

  // EmailGate auto-skip when already logged in.
  addFinding({
    severity: 'info',
    area: 'A',
    summary: 'EmailGate auto-submits when the user is already authed (calls /api/auth/me, fills email, posts to /api/capture-email). Reduces friction for logged-in completers.',
    evidence: 'src/app/assessment/_components/EmailGate.tsx:148-172',
  });
}

// ── Report rendering ───────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function renderHtml() {
  const groups = [
    { id: 'A', label: 'Email capture (no password)' },
    { id: 'B', label: 'User account / auth' },
    { id: 'C', label: 'Payment capture' },
    { id: 'D', label: 'Protected-route redirect matrix' },
  ];

  const findingSection = `
    <section class="findings">
      <h2>Findings summary</h2>
      <p class="muted">Severity: <span class="badge fail">fail</span> blocks the flow; <span class="badge warn">warning</span> dead-path or fail-open; <span class="badge soft">soft</span> harness anomaly; <span class="badge info">info</span> code-trace fact for the reviewer.</p>
      <table>
        <thead><tr><th>Severity</th><th>Area</th><th>Finding</th><th>Evidence</th></tr></thead>
        <tbody>
          ${findings.map((f) => `
            <tr>
              <td><span class="badge ${f.severity}">${escapeHtml(f.severity)}</span></td>
              <td>${escapeHtml(f.area)}</td>
              <td>${escapeHtml(f.summary)}</td>
              <td><code>${escapeHtml(f.evidence)}</code></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;

  const groupSections = groups.map((g) => {
    const rows = observations.filter((o) => o.group === g.id);
    return `
      <section class="group" id="group-${g.id}">
        <h2>${g.id}. ${escapeHtml(g.label)}</h2>
        ${rows.map((o) => `
          <article class="step" id="${escapeHtml(o.id)}">
            <header>
              <h3>${escapeHtml(o.id)} — ${escapeHtml(o.title)}</h3>
              ${o.error ? `<div class="err">harness error: ${escapeHtml(o.error)}</div>` : ''}
            </header>
            <div class="cols">
              <div class="info">
                <p><strong>Expected:</strong> ${escapeHtml(o.expected)}</p>
                <p><strong>Start:</strong> <code>${escapeHtml(o.startUrl)}</code></p>
                <p><strong>End:</strong> <code>${escapeHtml(o.finalUrl)}</code></p>
                ${o.codeRefs.length ? `<p><strong>Code:</strong> ${o.codeRefs.map((r) => `<code>${escapeHtml(r)}</code>`).join(' · ')}</p>` : ''}
                ${o.requests.length ? `
                  <details><summary>${o.requests.length} relevant request(s)</summary>
                    <ol class="reqs">
                      ${o.requests.map((r) => `<li><code>${escapeHtml(r.method)} ${escapeHtml(r.path)}</code>${r.postData ? `<pre>${escapeHtml(r.postData)}</pre>` : ''}</li>`).join('')}
                    </ol>
                  </details>` : ''}
                ${o.responses.length ? `
                  <details><summary>${o.responses.length} relevant response(s)</summary>
                    <ol class="reqs">
                      ${o.responses.map((r) => `<li><code>${r.status} ${escapeHtml(r.path)}</code></li>`).join('')}
                    </ol>
                  </details>` : ''}
                ${(o.apiProbes ?? []).length ? `
                  <details open><summary>${o.apiProbes.length} direct API probe(s)</summary>
                    <ol class="reqs">
                      ${o.apiProbes.map((p) => `
                        <li>
                          <code>${escapeHtml(p.method)} ${escapeHtml(p.path)} → <strong>${p.status}</strong></code>
                          ${p.reqBody ? `<pre>req: ${escapeHtml(p.reqBody)}</pre>` : ''}
                          ${p.body ? `<pre>res: ${escapeHtml(p.body)}</pre>` : ''}
                        </li>`).join('')}
                    </ol>
                  </details>` : ''}
              </div>
              <div class="shots">
                ${o.screens.map((s) => `<a href="${escapeHtml(s)}" target="_blank"><img src="${escapeHtml(s)}" loading="lazy" alt="${escapeHtml(o.id)}" /></a>`).join('')}
              </div>
            </div>
          </article>
        `).join('')}
      </section>
    `;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Auth & lead-capture review — ${new Date().toISOString().slice(0, 10)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { --ink: #0E1116; --slate: #485061; --muted: #7c8597; --cream: #FAF7F1; --gold: #C19A4B; --line: #e6e1d6; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--cream); color: var(--ink); font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; }
  header.top { background: var(--ink); color: #fff; padding: 28px 32px; }
  header.top h1 { margin: 0 0 4px; font-size: 22px; letter-spacing: -0.01em; }
  header.top p { margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; }
  nav.toc { background: #fff; border-bottom: 1px solid var(--line); padding: 14px 32px; position: sticky; top: 0; z-index: 10; }
  nav.toc a { color: var(--ink); text-decoration: none; margin-right: 18px; font-weight: 600; font-size: 13px; }
  nav.toc a:hover { color: var(--gold); }
  main { max-width: 1280px; margin: 0 auto; padding: 24px 32px 80px; }
  section.findings { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
  section.findings h2 { margin: 0 0 12px; font-size: 18px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { background: var(--cream); font-weight: 600; }
  .muted { color: var(--muted); font-size: 13px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .badge.info { background: #e8eef6; color: #2a4d7a; }
  .badge.soft { background: #f3efe2; color: #6b5b2a; }
  .badge.warn, .badge.warning { background: #fcecd6; color: #8a4a0d; }
  .badge.fail { background: #fbdada; color: #8a1f1f; }
  section.group { margin: 36px 0; }
  section.group h2 { margin: 0 0 14px; font-size: 20px; border-bottom: 2px solid var(--gold); padding-bottom: 8px; }
  article.step { background: #fff; border: 1px solid var(--line); border-radius: 10px; margin-bottom: 18px; overflow: hidden; }
  article.step header { background: #fbf7ee; padding: 14px 18px; border-bottom: 1px solid var(--line); }
  article.step header h3 { margin: 0; font-size: 15px; font-weight: 700; }
  article.step .err { color: #8a1f1f; font-size: 12px; margin-top: 6px; }
  article.step .cols { display: grid; grid-template-columns: 360px 1fr; gap: 0; }
  @media (max-width: 900px) { article.step .cols { grid-template-columns: 1fr; } }
  article.step .info { padding: 16px 18px; border-right: 1px solid var(--line); font-size: 13px; color: var(--slate); }
  article.step .info p { margin: 0 0 8px; }
  article.step .info code { font-size: 12px; background: #f4f1e9; padding: 1px 5px; border-radius: 4px; }
  article.step details { margin-top: 8px; }
  article.step summary { cursor: pointer; font-weight: 600; color: var(--ink); font-size: 12px; }
  article.step pre { background: #f6f2e6; padding: 6px 8px; border-radius: 6px; font-size: 11px; overflow-x: auto; max-height: 200px; }
  article.step ol.reqs { padding-left: 20px; margin: 4px 0; }
  article.step .shots { padding: 12px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); align-items: start; }
  article.step .shots img { width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; display: block; }
  footer { margin-top: 60px; padding: 24px 32px; color: var(--muted); font-size: 12px; text-align: center; border-top: 1px solid var(--line); }
</style>
</head>
<body>
<header class="top">
  <h1>Auth & lead-capture review</h1>
  <p>Generated ${new Date().toISOString()} · base URL: <code>${escapeHtml(BASE_URL)}</code> · ${observations.length} steps captured · ${findings.length} findings</p>
</header>
<nav class="toc">
  <a href="#findings">Findings</a>
  <a href="#group-A">A. Email capture</a>
  <a href="#group-B">B. Auth surfaces</a>
  <a href="#group-C">C. Payment</a>
  <a href="#group-D">D. Protected redirects</a>
</nav>
<main>
  <p class="muted">
    The dev server was booted without real Supabase / Stripe / Resend / MailerLite credentials.
    UI surfaces still render; backend probes that depend on those services return their
    documented degraded responses (503, "Auth not configured", etc.). Every observation
    below is recorded for what it actually is — not what it "should" be in a fully
    configured environment. Cross-reference the code paths cited in each row before
    treating a finding as a real defect.
  </p>
  <div id="findings"></div>
  ${findingSection}
  ${groupSections}
</main>
<footer>
  Re-run with <code>node scripts/auth-review.mjs</code> · raw observation logs in <code>audit/auth-review/raw/</code>
</footer>
</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  await ensureDirs();
  process.stdout.write(`Auth review against ${BASE_URL}\n`);

  // The pre-warmed image ships chromium-1194 (~Chrome 141) at
  // /opt/pw-browsers/chromium-1194 but playwright-core in node_modules
  // expects chromium-1223. Point launch at the available binary so we
  // don't have to redownload Chrome inside a sandbox.
  const localChrome = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await chromium.launch({ headless: true, executablePath: localChrome });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'aibi-auth-review-bot/1.0',
  });
  const page = await context.newPage();

  try {
    await walkProtectedRoutes(page);
    await walkAuthSurfaces(page);
    await walkEmailCaptureSurfaces(page);
    await walkPaymentSurfaces(page);
  } finally {
    await context.close();
    await browser.close();
  }

  evaluateFindings();

  const html = renderHtml();
  await fs.writeFile(path.join(OUT_DIR, 'index.html'), html);
  process.stdout.write(`\nReport: ${path.join(OUT_DIR, 'index.html')}\n`);
  process.stdout.write(`${observations.length} steps · ${findings.length} findings\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err?.stack || err}\n`);
  process.exit(1);
});
