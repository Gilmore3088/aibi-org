// 100-persona randomized site-walk against production (read-only CX/QA audit).
//
// Reuses the massive-persona roster (docs/persona-audit-2026-06-23/01-persona-roster.md)
// by PARSING it at runtime, so the live browser walk lines up 1:1 with the prior
// code-grounded audit and never drifts from the source roster.
//
// Each persona starts on the page their journey implies, then takes a SEEDED
// random walk through in-domain <a href> navigation (GET only), biased toward
// links matching their goal/role intent. Per step it records HTTP status,
// console errors, and uncaught page (JS) errors.
//
// SAFETY (production): navigation-only. Never submits forms, never clicks
// non-link buttons, skips /api, checkout/Stripe/create-checkout, auth sign-out,
// mailto/tel/#/javascript:, and any external origin — it cannot purchase, send
// an email, enroll, or mutate anything.
//
// Output: docs/handoffs/persona-sweep-100-<date>/sweep.json + summary.md, plus
// screenshots of every issue page and each persona's final page.

import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'https://www.aibankinginstitute.com';
const DATE = process.env.SWEEP_DATE || '2026-06-23';
const OUT_DIR = resolve(process.cwd(), `docs/handoffs/persona-sweep-100-${DATE}`);
const SHOT_DIR = resolve(OUT_DIR, 'shots');
const ROSTER_MD = resolve(process.cwd(), 'docs/persona-audit-2026-06-23/01-persona-roster.md');

const CONCURRENCY = Number(process.env.CONCURRENCY || 5);
const PERSONA_LIMIT = Number(process.env.PERSONA_LIMIT || 0); // 0 = all
const STEPS_MIN = Number(process.env.STEPS_MIN || 6);
const STEPS_MAX = Number(process.env.STEPS_MAX || 9);

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
  if (u.origin !== ORIGIN) return false; // same-origin only
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

// --- roster parsing -------------------------------------------------------
async function loadRoster() {
  const md = await readFile(ROSTER_MD, 'utf8');
  const rows = [];
  for (const line of md.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    // | # | Archetype | FI type | Role | Personality | Source | Goal | Journey | Completion |
    if (!/^\d+$/.test(cells[1] || '')) continue; // skip header + separator
    rows.push({
      n: Number(cells[1]), archetype: cells[2], fiType: cells[3], role: cells[4],
      personality: cells[5], source: cells[6], goal: cells[7], journey: cells[8], completion: cells[9],
    });
  }
  return rows;
}

// --- intent mapping (journey/goal/role -> start, keywords, device) --------
function startFor(journey) {
  const j = (journey || '').toLowerCase();
  const first = j.split('→')[0].trim();
  if (/re-?login/.test(j)) return '/courses/foundation/program/purchase';
  if (/re-?enter|resume/.test(j)) return '/assessment';
  if (first.includes('roi')) return '/';
  if (first.includes('home') || first.includes('lands home')) return '/';
  if (first.includes('free')) return '/assessment';
  if (first.includes('resources')) return '/resources';
  if (first.includes('security')) return '/security';
  if (first.includes('foundation')) return '/courses/foundation/program/purchase';
  if (first.includes('verify')) return '/certifications';
  if (first.includes('team')) return '/assessment/team';
  if (first.includes('pricing')) return '/';
  if (first.includes('$99')) return '/assessment/in-depth';
  if (first.includes('$295')) return '/courses/foundation/program/purchase';
  return '/';
}

function keywordsFor(goal, role, journey) {
  const s = `${goal} ${role} ${journey}`.toLowerCase();
  const kw = new Set();
  const add = (...xs) => xs.forEach((x) => kw.add(x));
  if (/ready/.test(s)) add('assessment', 'readiness', 'report', 'score');
  if (/cert|certif/.test(s)) add('certificate', 'foundation', 'course', 'module');
  if (/template|artifact|exam|policy/.test(s)) add('template', 'resource', 'download', 'policy', 'guide');
  if (/roi|compar|pricing|cost/.test(s)) add('roi', 'pricing', 'foundation', 'cost');
  if (/team|cohort|whole team|pilot|upskill team/.test(s)) add('team', 'institution', 'cohort', 'seats');
  if (/refund|money back/.test(s)) add('refund', 'support', 'help');
  if (/verify/.test(s)) add('verify', 'certificate', 'credential');
  if (/playground|practice|sandbox|\btry\b|tool/.test(s)) add('playground', 'practice', 'tool', 'sandbox');
  if (/data handling|\bvet\b|security/.test(s)) add('security', 'data', 'privacy', 'guide');
  if (/brows/.test(s)) add('resource', 'about', 'education');
  if (/compliance|bsa|aml|audit|risk|examiner|counsel|cco/.test(s)) add('compliance', 'risk', 'governance');
  if (/lend|credit/.test(s)) add('lending', 'credit');
  if (/hr|l&d|training/.test(s)) add('education', 'course', 'foundation', 'cohort');
  if (/ceo|cfo|coo|president|board|cro|cio|ciso|cmo|chro|strateg/.test(s)) add('about', 'roi', 'institutions');
  if (kw.size === 0) add('assessment', 'education', 'resource');
  return [...kw];
}

function deviceFor(personality, journey) {
  const s = `${personality} ${journey}`.toLowerCase();
  return /mobile|\(mobile\)|on (the )?phone/.test(s) ? 'mobile' : 'desktop';
}

// --- gather links on the current page ------------------------------------
async function gatherLinks(page) {
  return page.$$eval('a[href]', (els) =>
    els
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((el) => ({ href: el.getAttribute('href') || '', text: (el.textContent || '').trim().slice(0, 60) })),
  );
}

async function runPersona(browser, persona) {
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

  let current = new URL(persona.start, BASE).toString();
  for (let i = 0; i < persona.steps; i++) {
    consoleErrors = []; pageErrors = [];
    let status = 0, ok = true, errMsg = null;
    try {
      const res = await page.goto(current, { waitUntil: 'domcontentloaded', timeout: 30000 });
      status = res?.status() ?? 0;
      await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(250);
    } catch (e) { ok = false; errMsg = String(e?.message || e).slice(0, 160); }

    const path = (() => { try { return new URL(current).pathname; } catch { return current; } })();
    visited.set(path, (visited.get(path) || 0) + 1);
    const ce = [...consoleErrors], pe = [...pageErrors];
    steps.push({ i: i + 1, path, status, navError: errMsg, consoleErrors: ce.length, pageErrors: pe.length });

    const isIssue = !ok || status >= 400 || pe.length > 0;
    if (isIssue) {
      issues.push({ persona: persona.id, path, status, navError: errMsg, pageErrors: pe, consoleErrors: ce.slice(0, 3) });
      await page.screenshot({ path: resolve(SHOT_DIR, `${persona.id}-step${i + 1}-ISSUE.png`), fullPage: false }).catch(() => {});
    }
    if (!ok) break;

    let links = (await gatherLinks(page).catch(() => [])).filter((l) => eligibleHref(l.href));
    if (links.length === 0) {
      issues.push({ persona: persona.id, path, status, deadEnd: true });
      break;
    }
    const scored = links.map((l) => {
      const hay = (l.text + ' ' + l.href).toLowerCase();
      const kw = persona.keywords.some((k) => hay.includes(k)) ? 2 : 0;
      const vp = (() => { try { return new URL(l.href, BASE).pathname; } catch { return l.href; } })();
      const seen = visited.get(vp) ? -3 : 0;
      return { ...l, score: kw + seen + rand() };
    }).sort((a, b) => b.score - a.score);
    const pick = rand() < 0.65 ? scored[0] : scored[Math.floor(rand() * scored.length)];
    current = new URL(pick.href, BASE).toString();
  }

  await page.screenshot({ path: resolve(SHOT_DIR, `${persona.id}-final.png`), fullPage: false }).catch(() => {});
  await page.close(); await ctx.close();

  return {
    id: persona.id, archetype: persona.archetype, role: persona.role, fiType: persona.fiType,
    source: persona.source, goal: persona.goal, journey: persona.journey, completion: persona.completion,
    device: persona.device, start: persona.start, keywords: persona.keywords,
    stepsPlanned: persona.steps, stepsTaken: steps.length,
    pathString: steps.map((s) => `${s.path}${s.status >= 400 ? `[${s.status}]` : ''}`).join(' → '),
    pagesVisited: [...visited.keys()],
    issueCount: issues.length, steps, issues,
  };
}

// --- bounded-concurrency pool --------------------------------------------
async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const cur = idx++;
      results[cur] = await worker(items[cur]);
      const r = results[cur];
      console.log(`${r.id.padEnd(34)} ${String(r.stepsTaken).padStart(2)} steps · ${r.pagesVisited.length} pages · ${r.issueCount} issue(s)`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  return results;
}

async function main() {
  await mkdir(SHOT_DIR, { recursive: true });
  let roster = await loadRoster();
  if (PERSONA_LIMIT) roster = roster.slice(0, PERSONA_LIMIT);
  const personas = roster.map((r, i) => ({
    id: `P${String(r.n).padStart(3, '0')}-${r.archetype.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    archetype: r.archetype, role: r.role, fiType: r.fiType, source: r.source,
    goal: r.goal, journey: r.journey, completion: r.completion,
    start: startFor(r.journey),
    keywords: keywordsFor(r.goal, r.role, r.journey),
    device: deviceFor(r.personality, r.journey),
    steps: STEPS_MIN + (i % (STEPS_MAX - STEPS_MIN + 1)),
    seed: 100000 + i * 101,
  }));

  console.log(`Persona sweep — ${personas.length} personas vs ${BASE} (concurrency ${CONCURRENCY})\n`);
  const browser = await chromium.launch();
  const results = await runPool(personas, (p) => runPersona(browser, p), CONCURRENCY);
  await browser.close();

  const allIssues = results.flatMap((r) => r.issues);
  const broken = allIssues.filter((x) => x.status >= 400 || x.navError);
  const jsErr = allIssues.filter((x) => x.pageErrors && x.pageErrors.length);
  const deadEnds = allIssues.filter((x) => x.deadEnd);
  const pageVisits = {};
  for (const r of results) for (const p of r.pagesVisited) pageVisits[p] = (pageVisits[p] || 0) + 1;

  const summary = {
    runAt: new Date().toISOString(), base: BASE, personas: results.length,
    config: { concurrency: CONCURRENCY, stepsMin: STEPS_MIN, stepsMax: STEPS_MAX },
    totals: {
      totalSteps: results.reduce((a, r) => a + r.stepsTaken, 0),
      uniquePages: Object.keys(pageVisits).length,
      issues: allIssues.length, brokenOr4xx: broken.length, jsErrorPages: jsErr.length, deadEnds: deadEnds.length,
      personasWithIssue: results.filter((r) => r.issueCount > 0).length,
    },
    broken: broken.map((b) => ({ persona: b.persona, path: b.path, status: b.status, navError: b.navError || null })),
    jsErrors: jsErr.map((j) => ({ persona: j.persona, path: j.path, errors: j.pageErrors })),
    deadEnds: deadEnds.map((d) => ({ persona: d.persona, path: d.path })),
    coverage: Object.entries(pageVisits).sort((a, b) => b[1] - a[1]),
    results,
  };
  await writeFile(resolve(OUT_DIR, 'sweep.json'), JSON.stringify(summary, null, 2));

  const md = [
    `# ${summary.personas}-Persona Live Site Walk — ${BASE}`, ``, `Run: ${summary.runAt}`, ``,
    `## Totals`,
    `- Personas: ${summary.personas} · steps: ${summary.totals.totalSteps} · unique pages reached: ${summary.totals.uniquePages}`,
    `- Personas hitting >=1 issue: **${summary.totals.personasWithIssue}/${summary.personas}**`,
    `- Issues: **${summary.totals.issues}** (4xx/nav-fail: ${summary.totals.brokenOr4xx}, JS-error pages: ${summary.totals.jsErrorPages}, dead-ends: ${summary.totals.deadEnds})`,
    ``, `## Broken / 4xx / nav failures`,
    broken.length ? broken.map((b) => `- [${b.status || 'ERR'}] ${b.path} (${b.persona})${b.navError ? ' — ' + b.navError : ''}`).join('\n') : '- none',
    ``, `## Pages with uncaught JS errors`,
    jsErr.length ? jsErr.map((j) => `- ${j.path} (${j.persona}): ${j.pageErrors.join(' | ')}`).join('\n') : '- none',
    ``, `## Dead ends (no in-domain links to continue)`,
    deadEnds.length ? deadEnds.map((d) => `- ${d.path} (${d.persona})`).join('\n') : '- none',
    ``, `## Page coverage (visits)`,
    summary.coverage.map(([p, n]) => `- ${p} — ${n}`).join('\n'),
  ].join('\n');
  await writeFile(resolve(OUT_DIR, 'summary.md'), md);

  console.log(`\n=== TOTALS ===`);
  console.log(`personas=${summary.personas} steps=${summary.totals.totalSteps} uniquePages=${summary.totals.uniquePages} issues=${summary.totals.issues} 4xx/nav=${summary.totals.brokenOr4xx} jsErrPages=${summary.totals.jsErrorPages} deadEnds=${summary.totals.deadEnds} personasWithIssue=${summary.totals.personasWithIssue}`);
  console.log(`report: ${resolve(OUT_DIR, 'summary.md')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
