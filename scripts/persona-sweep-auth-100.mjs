// 100-persona AUTHENTICATED (post-login) site-walk — the gap the read-only
// pre-login sweep (persona-sweep-100.mjs) could never reach.
//
// For each roster persona this:
//   1. Seeds a real .test-TLD account in the state the persona's "completion
//      behavior" implies (account-only, free, in-depth, foundation learner at
//      varied progress) via scripts/lib/seed-bridge.mts -> e2e/helpers/seed.ts.
//   2. Injects the trusted-device cookie and logs in through the real
//      /auth/login form, so the walk starts fully authenticated.
//   3. Takes a seeded, intent-biased random walk across GATED routes
//      (/dashboard, /courses/foundation/program, /assessment/in-depth, …),
//      recording HTTP status, console + uncaught JS errors, dead-ends,
//      CLICKS-TO-VALUE (first value moment reached) and CIRCULAR navigation.
//   4. Tears the account down. cleanupAllSeededUsers() is the final backstop.
//
// MUST run under tsx (imports the TypeScript seed helpers):
//   E2E_ALLOW_PRODUCTION_SUPABASE=true SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
//     BASE_URL=https://www.aibankinginstitute.com npx tsx scripts/persona-sweep-auth-100.mjs
//
// SAFETY: same-origin GET navigation only. Never submits payment, never hits
// real checkout/stripe, never logs out. Seeding is gated by
// E2E_ALLOW_PRODUCTION_SUPABASE inside seed.ts and uses .test emails.

import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadRoster, buildPersonas, rng, DEFAULT_ROSTER_MD } from './lib/persona-roster.mjs';
import { seedRecipeFor } from './lib/account-states.mjs';
import { matchValueMoment } from './lib/value-moments.mjs';
import { clicksToValue, detectCircular, summarizeClicksToValue } from './lib/nav-analysis.mjs';
import { seedPersona, cleanupSeededUser, cleanupAllSeededUsers } from './lib/seed-bridge.mts';

const BASE = (process.env.BASE_URL || 'https://www.aibankinginstitute.com').replace(/\/$/, '');
const ORIGIN = new URL(BASE).origin;
const DATE = process.env.SWEEP_DATE || new Date().toISOString().slice(0, 10);
const OUT_DIR = resolve(process.cwd(), `docs/handoffs/persona-sweep-auth-100-${DATE}`);
const SHOT_DIR = resolve(OUT_DIR, 'shots');

const CONCURRENCY = Number(process.env.CONCURRENCY || 5);
const PERSONA_LIMIT = Number(process.env.PERSONA_LIMIT || 0); // 0 = all
const STEPS_MIN = Number(process.env.STEPS_MIN || 6);
const STEPS_MAX = Number(process.env.STEPS_MAX || 9);

// Routes an authenticated nav walk must never enter (side effects / churn).
// Note: we intentionally DO allow /dashboard, /courses/*, /assessment/* —
// that's the whole point of the post-login sweep.
const SKIP = [
  /^\/api\//,
  /create-checkout|\/checkout/i,
  /stripe/i,
  /\/auth\/(logout|signout|sign-out)/i,
  /\/auth\/callback/i,
];

function eligibleHref(href) {
  if (!href) return false;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return false;
  let u;
  try { u = new URL(href, BASE); } catch { return false; }
  if (u.origin !== ORIGIN) return false;
  if (SKIP.some((re) => re.test(u.pathname))) return false;
  return true;
}

const abs = (path) => new URL(path, BASE).toString();
const pathOf = (url) => { try { return new URL(url, BASE).pathname; } catch { return url; } };

async function gatherLinks(page) {
  return page.$$eval('a[href]', (els) =>
    els
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((el) => ({ href: el.getAttribute('href') || '', text: (el.textContent || '').trim().slice(0, 60) })),
  ).catch(() => []);
}

async function bodySnippet(page) {
  return (await page.locator('main, body').first().innerText({ timeout: 2000 }).catch(() => '')).slice(0, 800);
}

// Post-login destination per account state (remediation plan P0-1). Starting
// login at /auth/login?next=<dest> measures the real intended journey and lets
// us assert each state lands where it should within one redirect.
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

// Thrown when a seeded user never leaves /auth/login — a HARD audit failure,
// not a silent anonymous walk (the bug that invalidated the prior run, where
// 95/100 personas stayed on /auth/login).
class LoginError extends Error {
  constructor(message, diag) {
    super(message);
    this.name = 'LoginError';
    this.diag = diag;
  }
}

// Drive the real /auth/login form, starting from the state's intended
// destination via ?next=. Returns the post-login landing URL, or throws
// LoginError (with diagnostics) when the session is still on /auth/login.
async function login(page, user, state) {
  const next = LANDING_FOR_STATE[state] || '/dashboard';
  const loginUrl = `${abs('/auth/login')}?next=${encodeURIComponent(next)}`;
  const checkDevice = [];
  page.on('response', (r) => {
    if (r.url().includes('/api/auth/check-device')) checkDevice.push(r.status());
  });

  await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Name/type selectors proven against production (e2e/auth-prod.spec.ts).
  // The prior run used getByLabel(/email/i), which silently matched nothing,
  // so the form submitted empty and never left /auth/login. No silent catch
  // here: a missing field must surface as a failure, not a fake walk.
  await page.locator('input[name="email"]').first().fill(user.email);
  await page.locator('input[type="password"]').first().fill(user.password);
  await page.getByRole('button', { name: /sign in|log in/i }).first().click();

  let landed = true;
  try {
    await page.waitForURL(
      (url) => !url.pathname.startsWith('/auth/') || url.pathname.startsWith('/auth/confirm-device-pending'),
      { timeout: 15000 },
    );
  } catch {
    landed = false;
  }
  await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});

  const url = page.url();
  if (!landed && /^\/auth\/login/.test(pathOf(url))) {
    const alertText = await page
      .locator('[role="alert"], [data-error], .text-red-600, .error')
      .first()
      .innerText({ timeout: 1500 })
      .catch(() => '');
    await page
      .screenshot({ path: resolve(SHOT_DIR, `LOGINFAIL-${user.email.replace(/[^a-z0-9]/gi, '_')}.png`) })
      .catch(() => {});
    throw new LoginError(`login stuck on /auth/login`, { url, alertText, checkDevice });
  }
  return url;
}

async function runPersona(browser, persona) {
  const recipe = seedRecipeFor(persona);
  let seeded = null;
  const ctx = persona.device === 'mobile'
    ? await browser.newContext({ ...devices['iPhone 14'] })
    : await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const rand = rng(persona.seed);
  const steps = [];
  const visited = new Map();
  const issues = [];
  let consoleErrors = [];
  let pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e).slice(0, 200)));

  let loginLanding = null;
  let authError = null;
  try {
    seeded = await seedPersona(recipe);

    // Inject trusted-device cookie BEFORE login so check-device returns trusted
    // (mirrors e2e/dashboard-personas.spec.ts#trustAndLogin).
    if (seeded.trustedDevice) {
      await ctx.addCookies([{
        name: seeded.trustedDevice.cookieName,
        value: seeded.trustedDevice.cookieToken,
        domain: new URL(BASE).hostname,
        path: '/',
        httpOnly: true,
        secure: BASE.startsWith('https:'),
        sameSite: 'Lax',
      }]);
    }

    loginLanding = await login(page, seeded.user, recipe.state);

    // Walk starts from the login landing page (canonical post-login entry),
    // so clicks-to-value measures the real logged-in journey.
    let current = loginLanding && loginLanding.startsWith(ORIGIN) ? loginLanding : abs('/dashboard');

    for (let i = 0; i < persona.steps; i++) {
      consoleErrors = []; pageErrors = [];
      let status = 0, ok = true, errMsg = null;
      try {
        const res = await page.goto(current, { waitUntil: 'domcontentloaded', timeout: 30000 });
        status = res?.status() ?? 0;
        await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
        await page.waitForTimeout(200);
      } catch (e) { ok = false; errMsg = String(e?.message || e).slice(0, 160); }

      const path = pathOf(current);
      visited.set(path, (visited.get(path) || 0) + 1);
      const snippet = ok ? await bodySnippet(page) : '';
      const moment = ok ? matchValueMoment(recipe.state, path, snippet) : null;
      const ce = [...consoleErrors], pe = [...pageErrors];
      steps.push({
        i: i + 1, path, status, navError: errMsg,
        consoleErrors: ce.length, pageErrors: pe.length,
        matchedMoment: moment ? { id: moment.id, label: moment.label } : null,
      });

      const isIssue = !ok || status >= 400 || pe.length > 0;
      if (isIssue) {
        issues.push({ persona: persona.id, path, status, navError: errMsg, pageErrors: pe, consoleErrors: ce.slice(0, 3) });
        await page.screenshot({ path: resolve(SHOT_DIR, `${persona.id}-step${i + 1}-ISSUE.png`) }).catch(() => {});
      }
      if (!ok) break;

      const links = (await gatherLinks(page)).filter((l) => eligibleHref(l.href));
      if (links.length === 0) {
        issues.push({ persona: persona.id, path, status, deadEnd: true });
        break;
      }
      const scored = links.map((l) => {
        const hay = (l.text + ' ' + l.href).toLowerCase();
        const kw = persona.keywords.some((k) => hay.includes(k)) ? 2 : 0;
        const vp = pathOf(new URL(l.href, BASE).toString());
        const seen = visited.get(vp) ? -3 : 0;
        return { ...l, score: kw + seen + rand() };
      }).sort((a, b) => b.score - a.score);
      const pick = rand() < 0.65 ? scored[0] : scored[Math.floor(rand() * scored.length)];
      current = new URL(pick.href, BASE).toString();
    }

    await page.screenshot({ path: resolve(SHOT_DIR, `${persona.id}-final.png`) }).catch(() => {});
  } catch (e) {
    const isLogin = e?.name === 'LoginError';
    authError = `${isLogin ? 'LOGIN' : 'SEED'}: ${String(e?.message || e).slice(0, 160)}`;
    issues.push({
      persona: persona.id,
      path: '(seed/login)',
      status: 0,
      navError: authError,
      failKind: isLogin ? 'login' : 'seed',
      loginDiag: isLogin ? e.diag : undefined,
    });
  } finally {
    await page.close().catch(() => {});
    await ctx.close().catch(() => {});
    if (seeded?.user?.id) await cleanupSeededUser(seeded.user.id).catch(() => {});
  }

  const pathSeq = steps.map((s) => s.path);
  const ctv = clicksToValue(steps);
  const circular = detectCircular(pathSeq);

  return {
    id: persona.id, archetype: persona.archetype, role: persona.role, fiType: persona.fiType,
    source: persona.source, goal: persona.goal, journey: persona.journey, completion: persona.completion,
    device: persona.device, state: recipe.state, loginLanding: loginLanding ? pathOf(loginLanding) : null,
    authError,
    stepsPlanned: persona.steps, stepsTaken: steps.length,
    pathString: pathSeq.map((p, i) => `${p}${steps[i].status >= 400 ? `[${steps[i].status}]` : ''}${steps[i].matchedMoment ? ' ★' : ''}`).join(' → '),
    pagesVisited: [...visited.keys()],
    clicksToValue: ctv, circular,
    issueCount: issues.length, steps, issues,
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
      const ctv = r.clicksToValue.clicks != null ? `value@${r.clicksToValue.clicks}` : 'NO VALUE';
      console.log(`${r.id.padEnd(34)} ${r.state.padEnd(26)} ${String(r.stepsTaken).padStart(2)} steps · ${ctv} · ${r.circular.looped ? 'LOOP' : 'ok'} · ${r.issueCount} issue(s)`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  return results;
}

async function main() {
  if (process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true') {
    console.error('Refusing to run: set E2E_ALLOW_PRODUCTION_SUPABASE=true (acknowledges seeding .test users) plus SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(2);
  }
  await mkdir(SHOT_DIR, { recursive: true });
  const rosterMd = process.env.ROSTER_MD ? resolve(process.cwd(), process.env.ROSTER_MD) : DEFAULT_ROSTER_MD;
  let roster = await loadRoster(rosterMd);
  if (PERSONA_LIMIT) roster = roster.slice(0, PERSONA_LIMIT);
  const personas = buildPersonas(roster, { stepsMin: STEPS_MIN, stepsMax: STEPS_MAX });

  console.log(`Authenticated persona sweep — ${personas.length} personas vs ${BASE} (concurrency ${CONCURRENCY})\n`);
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, proxy: process.env.PLAYWRIGHT_PROXY_SERVER ? { server: process.env.PLAYWRIGHT_PROXY_SERVER } : undefined });
  let results = [];
  try {
    results = await runPool(personas, (p) => runPersona(browser, p), CONCURRENCY);
  } finally {
    await browser.close().catch(() => {});
    // Backstop: remove any seeded users a crashed worker left behind.
    const cleaned = await cleanupAllSeededUsers().catch((e) => ({ deleted: -1, error: String(e) }));
    console.log(`\ncleanup backstop: ${JSON.stringify(cleaned)}`);
  }

  const allIssues = results.flatMap((r) => r.issues);
  const broken = allIssues.filter((x) => x.status >= 400 || x.navError);
  const jsErr = allIssues.filter((x) => x.pageErrors && x.pageErrors.length);
  const deadEnds = allIssues.filter((x) => x.deadEnd);
  const loops = results.filter((r) => r.circular.looped);
  const pageVisits = {};
  for (const r of results) for (const p of r.pagesVisited) pageVisits[p] = (pageVisits[p] || 0) + 1;
  const ctvSummary = summarizeClicksToValue(results);

  const summary = {
    runAt: new Date().toISOString(), base: BASE, mode: 'authenticated', personas: results.length,
    config: { concurrency: CONCURRENCY, stepsMin: STEPS_MIN, stepsMax: STEPS_MAX },
    totals: {
      totalSteps: results.reduce((a, r) => a + r.stepsTaken, 0),
      uniquePages: Object.keys(pageVisits).length,
      issues: allIssues.length, brokenOr4xx: broken.length, jsErrorPages: jsErr.length, deadEnds: deadEnds.length,
      personasWithIssue: results.filter((r) => r.issueCount > 0).length,
      personasLooped: loops.length,
      personasReachedValue: ctvSummary.reachedValue,
      personasNeverReachedValue: ctvSummary.neverReachedValue,
    },
    clicksToValue: ctvSummary,
    broken: broken.map((b) => ({ persona: b.persona, path: b.path, status: b.status, navError: b.navError || null })),
    jsErrors: jsErr.map((j) => ({ persona: j.persona, path: j.path, errors: j.pageErrors })),
    deadEnds: deadEnds.map((d) => ({ persona: d.persona, path: d.path })),
    loops: loops.map((r) => ({ persona: r.id, state: r.state, incidents: r.circular.incidents })),
    coverage: Object.entries(pageVisits).sort((a, b) => b[1] - a[1]),
    results,
  };
  await writeFile(resolve(OUT_DIR, 'sweep.json'), JSON.stringify(summary, null, 2));

  const md = [
    `# Authenticated ${summary.personas}-Persona Site Walk — ${BASE}`, ``, `Run: ${summary.runAt}`, ``,
    `## Totals`,
    `- Personas: ${summary.personas} · steps: ${summary.totals.totalSteps} · unique gated pages: ${summary.totals.uniquePages}`,
    `- Reached value: **${summary.totals.personasReachedValue}/${summary.personas}** · never reached value: **${summary.totals.personasNeverReachedValue}**`,
    `- Median clicks-to-value: **${ctvSummary.medianClicks}** · avg: ${ctvSummary.avgClicks} · max: ${ctvSummary.maxClicks}`,
    `- Personas hitting >=1 issue: **${summary.totals.personasWithIssue}** · circular navigation: **${summary.totals.personasLooped}**`,
    `- Issues: ${summary.totals.issues} (4xx/nav: ${summary.totals.brokenOr4xx}, JS-error: ${summary.totals.jsErrorPages}, dead-ends: ${summary.totals.deadEnds})`,
    ``, `## Clicks-to-value by account state`,
    ...Object.entries(ctvSummary.byState).map(([s, b]) => `- ${s}: avg ${b.avgClicks ?? 'n/a'} clicks · ${b.reached}/${b.total} reached · ${b.never} never`),
    ``, `## Circular navigation`,
    loops.length ? loops.map((r) => `- ${r.id} (${r.state}): ${r.circular.incidents.map((x) => x.detail).join('; ')}`).join('\n') : '- none',
    ``, `## Broken / 4xx / nav failures`,
    broken.length ? broken.map((b) => `- [${b.status || 'ERR'}] ${b.path} (${b.persona})${b.navError ? ' — ' + b.navError : ''}`).join('\n') : '- none',
    ``, `## Pages with uncaught JS errors`,
    jsErr.length ? jsErr.map((j) => `- ${j.path} (${j.persona}): ${j.pageErrors.join(' | ')}`).join('\n') : '- none',
    ``, `## Gated-page coverage (visits)`,
    summary.coverage.map(([p, n]) => `- ${p} — ${n}`).join('\n'),
  ].join('\n');
  await writeFile(resolve(OUT_DIR, 'summary.md'), md);

  console.log(`\n=== TOTALS ===`);
  console.log(`personas=${summary.personas} reachedValue=${summary.totals.personasReachedValue} medianCTV=${ctvSummary.medianClicks} loops=${summary.totals.personasLooped} issues=${summary.totals.issues} 4xx/nav=${summary.totals.brokenOr4xx} jsErr=${summary.totals.jsErrorPages} deadEnds=${summary.totals.deadEnds}`);
  console.log(`report: ${resolve(OUT_DIR, 'summary.md')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
