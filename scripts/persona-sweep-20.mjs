// 20-persona randomized site-walk against production (read-only CX/QA audit).
//
// Each persona starts on a page that fits their intent, then takes a SEEDED
// random walk through in-domain <a href> navigation (GET only). Per step it
// captures HTTP status, console errors, and uncaught page (JS) errors, then
// picks the next link — biased toward links matching the persona's intent
// keywords, with randomness so the walk spreads "throughout the page".
//
// SAFETY (production): navigation-only. It never submits forms, never clicks
// non-link buttons, and skips /api, checkout/Stripe/create-checkout, auth
// sign-out, mailto/tel, #anchors, javascript:, and any external origin — so
// it cannot start a purchase, send an email, or mutate anything.
//
// Output: docs/handoffs/persona-sweep-<date>/sweep.json + summary.md, plus
// screenshots of any error pages and each persona's final page.

import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'https://www.aibankinginstitute.com';
const DATE = process.env.SWEEP_DATE || '2026-06-14';
const OUT_DIR = resolve(process.cwd(), `docs/handoffs/persona-sweep-${DATE}`);
const SHOT_DIR = resolve(OUT_DIR, 'shots');

const ORIGIN = new URL(BASE).origin;

// Paths a read-only audit must never navigate into (side effects / noise).
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
  if (u.origin !== ORIGIN) return false;            // same-origin only
  if (u.hash && u.pathname === '/' && !u.search) { /* allow anchor on home */ }
  if (SKIP.some((re) => re.test(u.pathname))) return false;
  return true;
}

// mulberry32 seeded PRNG — reproducible per persona, varies by index.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const START_POOL = ['/', '/education', '/assessment', '/for-institutions', '/security',
  '/resources', '/about', '/courses/foundation/program/purchase', '/certifications', '/services'];

// 20 personas: role + intent keywords (bias link choice) + viewport + start + steps.
const ROLES = [
  ['Compliance Officer', ['security', 'compliance', 'risk', 'governance', 'examiner', 'sr 11-7'], 'desktop'],
  ['Branch Manager', ['quick', 'staff', 'start', 'learn', 'resource', 'playbook'], 'mobile'],
  ['CFO', ['roi', 'pricing', 'institutions', 'advisory', 'cost', 'efficiency'], 'desktop'],
  ['InfoSec Lead', ['security', 'privacy', 'data', 'tool', 'disclaimer'], 'desktop'],
  ['Marketing VP', ['resource', 'template', 'playbook', 'content', 'brief'], 'mobile'],
  ['Chief Operating Officer', ['ops', 'starter', 'kit', 'desk card', 'workflow'], 'desktop'],
  ['Commercial Lender', ['lending', 'credit', 'memo', 'playbook', 'template'], 'desktop'],
  ['CEO', ['about', 'roi', 'institutions', 'board', 'foundation'], 'desktop'],
  ['Teller', ['quick', 'start', 'learn', 'resource'], 'mobile'],
  ['BSA / AML Analyst', ['compliance', 'risk', 'security', 'governance'], 'desktop'],
  ['Board Member', ['about', 'roi', 'institutions', 'advisory'], 'desktop'],
  ['HR / L&D Director', ['education', 'course', 'foundation', 'certificate', 'cohort'], 'desktop'],
  ['Skeptical First-Timer', ['about', 'faq', 'pricing', 'how'], 'mobile'],
  ['Credit Union CIO', ['security', 'tool', 'data', 'institutions'], 'desktop'],
  ['Retail Banking Lead', ['resource', 'playbook', 'quick', 'start'], 'mobile'],
  ['Internal Auditor', ['security', 'compliance', 'governance', 'privacy'], 'desktop'],
  ['Product Manager', ['education', 'foundation', 'course', 'assessment'], 'desktop'],
  ['Frontline Supervisor', ['quick', 'desk card', 'staff', 'start'], 'mobile'],
  ['Chief Lending Officer', ['lending', 'credit', 'roi', 'institutions'], 'desktop'],
  ['Curious Banker', ['assessment', 'readiness', 'score', 'learn', 'education'], 'mobile'],
];

const personas = ROLES.map((r, i) => ({
  id: `P${String(i + 1).padStart(2, '0')}-${r[0].toLowerCase().replace(/[^a-z]+/g, '-')}`,
  role: r[0],
  keywords: r[1],
  viewport: r[2],
  start: START_POOL[i % START_POOL.length],
  steps: 6 + (i % 6),       // 6–11 steps
  seed: 1000 + i * 7,
}));

async function gatherLinks(page) {
  return page.$$eval('a[href]', (els) =>
    els
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map((el) => ({ href: el.getAttribute('href') || '', text: (el.textContent || '').trim().slice(0, 60) })),
  );
}

async function runPersona(browser, persona) {
  const ctx = persona.viewport === 'mobile'
    ? await browser.newContext({ ...devices['iPhone 14'] })
    : await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const rand = rng(persona.seed);
  const steps = [];
  const visited = new Map(); // path -> count
  const issues = [];

  let consoleErrors = [];
  let pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e).slice(0, 200)));

  let current = new URL(persona.start, BASE).toString();
  for (let i = 0; i < persona.steps; i++) {
    consoleErrors = []; pageErrors = [];
    let status = 0, ok = true, errMsg = null;
    try {
      const res = await page.goto(current, { waitUntil: 'domcontentloaded', timeout: 30000 });
      status = res?.status() ?? 0;
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
    } catch (e) { ok = false; errMsg = String(e?.message || e).slice(0, 160); }

    const path = (() => { try { return new URL(current).pathname; } catch { return current; } })();
    visited.set(path, (visited.get(path) || 0) + 1);
    const ce = [...consoleErrors], pe = [...pageErrors];
    const stepRec = { i: i + 1, path, status, navError: errMsg, consoleErrors: ce.length, pageErrors: pe.length };
    steps.push(stepRec);

    const isIssue = !ok || status >= 400 || pe.length > 0;
    if (isIssue) {
      issues.push({ persona: persona.id, path, status, navError: errMsg, pageErrors: pe, consoleErrors: ce.slice(0, 3) });
      const shot = resolve(SHOT_DIR, `${persona.id}-step${i + 1}-ISSUE.png`);
      await page.screenshot({ path: shot, fullPage: false }).catch(() => {});
    }
    if (!ok) break;

    // pick next link
    let links = (await gatherLinks(page).catch(() => [])).filter((l) => eligibleHref(l.href));
    if (links.length === 0) {
      issues.push({ persona: persona.id, path, status, deadEnd: true });
      break;
    }
    // bias: score by intent-keyword match + de-prioritize already-visited
    const scored = links.map((l) => {
      const hay = (l.text + ' ' + l.href).toLowerCase();
      const kw = persona.keywords.some((k) => hay.includes(k)) ? 2 : 0;
      const vp = (() => { try { return new URL(l.href, BASE).pathname; } catch { return l.href; } })();
      const seen = visited.get(vp) ? -3 : 0;
      return { ...l, score: kw + seen + rand() }; // rand() spreads the walk
    }).sort((a, b) => b.score - a.score);
    const pick = rand() < 0.65 ? scored[0] : scored[Math.floor(rand() * scored.length)];
    current = new URL(pick.href, BASE).toString();
  }

  // final screenshot
  await page.screenshot({ path: resolve(SHOT_DIR, `${persona.id}-final.png`), fullPage: false }).catch(() => {});
  await page.close(); await ctx.close();

  return {
    id: persona.id, role: persona.role, viewport: persona.viewport, start: persona.start,
    stepsPlanned: persona.steps, stepsTaken: steps.length,
    pagesVisited: [...visited.keys()],
    issueCount: issues.length, steps, issues,
  };
}

async function main() {
  await mkdir(SHOT_DIR, { recursive: true });
  console.log(`Persona sweep — 20 personas vs ${BASE}\n`);
  const browser = await chromium.launch();
  const results = [];
  for (const p of personas) {
    const r = await runPersona(browser, p);
    results.push(r);
    console.log(`${r.id.padEnd(28)} ${String(r.stepsTaken).padStart(2)} steps · ${r.pagesVisited.length} pages · ${r.issueCount} issue(s)`);
  }
  await browser.close();

  // aggregate
  const allIssues = results.flatMap((r) => r.issues);
  const broken = allIssues.filter((x) => x.status >= 400 || x.navError);
  const jsErr = allIssues.filter((x) => x.pageErrors && x.pageErrors.length);
  const deadEnds = allIssues.filter((x) => x.deadEnd);
  const pageVisits = {};
  for (const r of results) for (const p of r.pagesVisited) pageVisits[p] = (pageVisits[p] || 0) + 1;

  const summary = {
    runAt: new Date().toISOString(), base: BASE, personas: results.length,
    totals: {
      totalSteps: results.reduce((a, r) => a + r.stepsTaken, 0),
      uniquePages: Object.keys(pageVisits).length,
      issues: allIssues.length, brokenOr4xx: broken.length, jsErrorPages: jsErr.length, deadEnds: deadEnds.length,
    },
    broken: broken.map((b) => ({ persona: b.persona, path: b.path, status: b.status, navError: b.navError || null })),
    jsErrors: jsErr.map((j) => ({ persona: j.persona, path: j.path, errors: j.pageErrors })),
    deadEnds: deadEnds.map((d) => ({ persona: d.persona, path: d.path })),
    coverage: Object.entries(pageVisits).sort((a, b) => b[1] - a[1]),
    results,
  };
  await writeFile(resolve(OUT_DIR, 'sweep.json'), JSON.stringify(summary, null, 2));

  const md = [
    `# 20-Persona Site Walk — ${BASE}`, ``, `Run: ${summary.runAt}`, ``,
    `## Totals`,
    `- Personas: ${summary.personas} · steps: ${summary.totals.totalSteps} · unique pages reached: ${summary.totals.uniquePages}`,
    `- Issues: **${summary.totals.issues}** (4xx/nav-fail: ${summary.totals.brokenOr4xx}, JS-error pages: ${summary.totals.jsErrorPages}, dead-ends: ${summary.totals.deadEnds})`,
    ``, `## Broken / 4xx / nav failures`,
    broken.length ? broken.map((b) => `- [${b.status || 'ERR'}] ${b.path} (${b.persona})${b.navError ? ' — ' + b.navError : ''}`).join('\n') : '- none ✅',
    ``, `## Pages with uncaught JS errors`,
    jsErr.length ? jsErr.map((j) => `- ${j.path} (${j.persona}): ${j.pageErrors.join(' | ')}`).join('\n') : '- none ✅',
    ``, `## Dead ends (no in-domain links to continue)`,
    deadEnds.length ? deadEnds.map((d) => `- ${d.path} (${d.persona})`).join('\n') : '- none ✅',
    ``, `## Page coverage (visits)`,
    summary.coverage.map(([p, n]) => `- ${p} — ${n}`).join('\n'),
  ].join('\n');
  await writeFile(resolve(OUT_DIR, 'summary.md'), md);

  console.log(`\n=== TOTALS ===`);
  console.log(`steps=${summary.totals.totalSteps} uniquePages=${summary.totals.uniquePages} issues=${summary.totals.issues} 4xx/nav=${summary.totals.brokenOr4xx} jsErrPages=${summary.totals.jsErrorPages} deadEnds=${summary.totals.deadEnds}`);
  console.log(`report: ${resolve(OUT_DIR, 'summary.md')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
