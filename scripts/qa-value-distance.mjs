// Authenticated clicks-to-value analyzer.
//
// The read-only qa-site-walk.mjs computes click-distance from the homepage to
// the public conversion targets (/assessment/take, /assessment/in-depth). This
// is its post-login twin: for a representative logged-in account state, it
// authenticates, BFS-crawls the GATED experience from the post-login landing,
// and computes the THEORETICAL-MINIMUM click distance to that state's primary
// value moment. Where an authenticated sweep.json is present, it contrasts that
// minimum with what personas ACTUALLY achieved (the median from the sweep).
//
// Answers: "How many clicks should it take a logged-in customer to get value —
// and how far is the real experience from that floor?"
//
// MUST run under tsx:
//   E2E_ALLOW_PRODUCTION_SUPABASE=true SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
//     BASE_URL=https://www.aibankinginstitute.com npx tsx scripts/qa-value-distance.mjs

import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ACCOUNT_STATE } from './lib/account-states.mjs';
import { VALUE_MOMENTS, PRIMARY_VALUE_MOMENT } from './lib/value-moments.mjs';
import { seedPersona, cleanupSeededUser, cleanupAllSeededUsers } from './lib/seed-bridge.mts';

const BASE = (process.env.BASE_URL || 'https://www.aibankinginstitute.com').replace(/\/$/, '');
const ORIGIN = new URL(BASE).origin;
const DATE = process.env.SWEEP_DATE || new Date().toISOString().slice(0, 10);
const OUT_DIR = resolve(process.cwd(), `docs/handoffs/qa-value-distance-${DATE}`);
const MAX_PAGES = Number(process.env.MAX_PAGES || 60);
const AUTH_SWEEP = process.env.AUTH_SWEEP ||
  resolve(process.cwd(), `docs/handoffs/persona-sweep-auth-100-${DATE}/sweep.json`);

const ONBOARDING = { uses_m365: 'yes', personal_ai_subscriptions: ['ChatGPT'], primary_role: 'operations' };

// Representative recipe per state we measure (one account each).
const TARGETS = [
  { state: ACCOUNT_STATE.ACCOUNT_ONLY, recipe: { state: ACCOUNT_STATE.ACCOUNT_ONLY, kind: 'account-only' } },
  { state: ACCOUNT_STATE.FREE_ASSESSMENT, recipe: { state: ACCOUNT_STATE.FREE_ASSESSMENT, kind: 'free', readiness: 'free', role: 'operations' } },
  { state: ACCOUNT_STATE.IN_DEPTH, recipe: { state: ACCOUNT_STATE.IN_DEPTH, kind: 'in-depth', readiness: 'in-depth', role: 'executive' } },
  { state: ACCOUNT_STATE.FOUNDATION_EARLY, recipe: { state: ACCOUNT_STATE.FOUNDATION_EARLY, kind: 'foundation', onboarding: ONBOARDING, currentModule: 3, completedModules: [1, 2] } },
  { state: ACCOUNT_STATE.FOUNDATION_COMPLETE, recipe: { state: ACCOUNT_STATE.FOUNDATION_COMPLETE, kind: 'foundation', onboarding: ONBOARDING, allComplete: true } },
];

const SKIP = [/^\/api\//, /create-checkout|\/checkout/i, /stripe/i, /\/auth\/(logout|signout|sign-out)/i, /\/auth\/callback/i];
const eligible = (href) => {
  if (!href || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return false;
  let u; try { u = new URL(href, BASE); } catch { return false; }
  return u.origin === ORIGIN && !SKIP.some((re) => re.test(u.pathname));
};
const abs = (p) => new URL(p, BASE).toString();
const pathOf = (u) => { try { return new URL(u, BASE).pathname; } catch { return u; } };

function primaryMoment(state) {
  const id = PRIMARY_VALUE_MOMENT[state];
  return (VALUE_MOMENTS[state] || []).find((m) => m.id === id) || (VALUE_MOMENTS[state] || [])[0] || null;
}

async function login(page, user) {
  // /auth/login renders 3 forms each with input[name="email"]; scope fills to
  // the password (sign-in) form. One retry absorbs transient prod flakes; a
  // persistent failure THROWS so the row records a real login error rather than
  // reporting the value moment as "unreached" from an unauthenticated crawl.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto(abs('/auth/login'), { waitUntil: 'domcontentloaded', timeout: 30000 });
    const form = page.locator('form').filter({ has: page.locator('input[type="password"]') });
    await form.locator('input[name="email"]').fill(user.email);
    await form.locator('input[name="password"]').fill(user.password);
    await form.getByRole('button', { name: /sign in|log in/i }).click();
    let landed = true;
    try {
      await page.waitForURL((url) => !url.pathname.startsWith('/auth/') || url.pathname.startsWith('/auth/confirm-device-pending'), { timeout: 15000 });
    } catch { landed = false; }
    await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
    if (landed || !/^\/auth\/login/.test(pathOf(page.url()))) return page.url();
    if (attempt === 2) throw new Error(`login failed (stuck on /auth/login) for ${user.email}`);
    await page.waitForTimeout(600);
  }
}

async function gatherLinks(page) {
  return page.$$eval('a[href]', (els) =>
    els.filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((el) => el.getAttribute('href') || ''),
  ).catch(() => []);
}

// BFS from the landing page to the first path matching the value moment.
async function distanceToValue(page, startPath, moment) {
  const queue = [{ path: startPath, trail: [startPath] }];
  const seen = new Set([startPath]);
  let pagesVisited = 0;
  while (queue.length && pagesVisited < MAX_PAGES) {
    const { path, trail } = queue.shift();
    pagesVisited++;
    let bodyText = '';
    try {
      await page.goto(abs(path), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
      bodyText = (await page.locator('main, body').first().innerText({ timeout: 1500 }).catch(() => '')).slice(0, 800);
    } catch { /* treat as unreachable, keep crawling */ }

    if (moment && moment.urlRe.test(path) && (!moment.textRe || !bodyText || moment.textRe.test(bodyText))) {
      return { hops: trail.length - 1, trail, pagesVisited, reached: true };
    }

    const links = (await gatherLinks(page)).filter(eligible);
    for (const href of links) {
      const p = pathOf(new URL(href, BASE).toString());
      if (!p || seen.has(p)) continue;
      seen.add(p);
      queue.push({ path: p, trail: [...trail, p] });
    }
  }
  return { hops: null, trail: null, pagesVisited, reached: false };
}

async function loadAchieved() {
  try {
    const sweep = JSON.parse(await readFile(AUTH_SWEEP, 'utf8'));
    return sweep?.clicksToValue?.byState || null;
  } catch {
    return null;
  }
}

async function main() {
  if (process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true') {
    console.error('Refusing to run: set E2E_ALLOW_PRODUCTION_SUPABASE=true plus SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(2);
  }
  await mkdir(OUT_DIR, { recursive: true });
  const achieved = await loadAchieved();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, proxy: process.env.PLAYWRIGHT_PROXY_SERVER ? { server: process.env.PLAYWRIGHT_PROXY_SERVER } : undefined });
  const rows = [];
  try {
    for (const { state, recipe } of TARGETS) {
      const moment = primaryMoment(state);
      let seeded = null;
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      try {
        seeded = await seedPersona(recipe);
        if (seeded.trustedDevice) {
          await ctx.addCookies([{
            name: seeded.trustedDevice.cookieName, value: seeded.trustedDevice.cookieToken,
            domain: new URL(BASE).hostname, path: '/', httpOnly: true,
            secure: BASE.startsWith('https:'), sameSite: 'Lax',
          }]);
        }
        const landing = await login(page, seeded.user);
        const startPath = landing && landing.startsWith(ORIGIN) ? pathOf(landing) : '/dashboard';
        const dist = await distanceToValue(page, startPath, moment);
        const achievedAvg = achieved?.[state]?.avgClicks ?? null;
        rows.push({
          state, moment: moment ? moment.label : null, startPath,
          theoreticalMinClicks: dist.hops, reached: dist.reached, pagesCrawled: dist.pagesVisited,
          shortestTrail: dist.trail, achievedAvgClicks: achievedAvg,
          gap: dist.hops != null && achievedAvg != null ? Number((achievedAvg - dist.hops).toFixed(2)) : null,
        });
        console.log(`${state.padEnd(26)} min=${dist.reached ? dist.hops : 'unreached'} achieved=${achievedAvg ?? 'n/a'} via ${dist.trail ? dist.trail.join(' → ') : '—'}`);
      } catch (e) {
        rows.push({ state, error: String(e?.message || e).slice(0, 200) });
        console.log(`${state.padEnd(26)} ERROR ${String(e?.message || e).slice(0, 120)}`);
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

  const out = { runAt: new Date().toISOString(), base: BASE, maxPages: MAX_PAGES, authSweep: achieved ? AUTH_SWEEP : null, rows };
  await writeFile(resolve(OUT_DIR, 'distance.json'), JSON.stringify(out, null, 2));

  const md = [
    `# Authenticated clicks-to-value — ${BASE}`, ``, `Run: ${out.runAt}`, ``,
    `Theoretical minimum = shortest authenticated click-path (BFS, cap ${MAX_PAGES} pages) from the post-login landing to each state's primary value moment. "Achieved" = average clicks-to-value from the authenticated persona sweep (if present).`, ``,
    `| Account state | Value moment | Min clicks | Achieved avg | Gap | Shortest path |`,
    `|---|---|---|---|---|---|`,
    ...rows.map((r) => r.error
      ? `| ${r.state} | — | ERROR | — | — | ${r.error} |`
      : `| ${r.state} | ${r.moment ?? '—'} | ${r.reached ? r.theoreticalMinClicks : 'unreached'} | ${r.achievedAvgClicks ?? 'n/a'} | ${r.gap ?? 'n/a'} | ${r.shortestTrail ? r.shortestTrail.join(' → ') : '—'} |`),
    ``,
    `> Gap = achieved − minimum. A large positive gap means personas wander well past the shortest path (efficiency opportunity). "unreached" means the value moment was not found within the crawl cap — a potential dead-end or over-deep placement.`,
  ].join('\n');
  await writeFile(resolve(OUT_DIR, 'summary.md'), md);
  console.log(`\nreport: ${resolve(OUT_DIR, 'summary.md')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
