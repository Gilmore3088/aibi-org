// qa-site-walk.mjs — Playwright walk-through of the public site.
//
// For every reachable public page, records:
//   - HTTP status, page title, H1
//   - Internal + external links (and which are 404)
//   - Brand v1 mark present? (.aibi-mark CSS class or the bracketed [Ai] glyphs)
//   - Visible primary CTAs (their text + href)
//   - Dead-end signal: no primary CTA + no nav links in the main content
//   - Click-distance to /assessment/take (free conversion) and
//     /assessment/in-depth (paid conversion) by BFS from the homepage
//
// Output: docs/handoffs/qa-site-walk-YYYY-MM-DD/{index.html,results.json}
//
// Usage:
//   node scripts/qa-site-walk.mjs                              # production
//   BASE_URL=http://localhost:3000 node scripts/qa-site-walk.mjs

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = (process.env.BASE_URL || 'https://www.aibankinginstitute.com').replace(/\/$/, '');
const ROOT = process.cwd();
const TODAY = new Date().toISOString().slice(0, 10);
const OUT_DIR = resolve(ROOT, `docs/handoffs/qa-site-walk-${TODAY}`);

// INCLUDE_AUTH=1 unlocks the auth-gated routes (dashboard, course program).
// Set BASE_URL to a Vercel preview that has PREVIEW_AUTH_BYPASS=true on
// the Preview scope; production is always inert per the bypass module.
const INCLUDE_AUTH = process.env.INCLUDE_AUTH === '1';

const ALWAYS_SKIP_PREFIXES = ['/api/', '/auth/'];
const AUTH_GATED_PREFIXES = ['/dashboard', '/courses/foundation/program'];

const SKIP_PREFIXES = INCLUDE_AUTH
  ? ALWAYS_SKIP_PREFIXES
  : [...ALWAYS_SKIP_PREFIXES, ...AUTH_GATED_PREFIXES];

const AUTH_SEEDS = INCLUDE_AUTH
  ? [
      '/dashboard',
      '/dashboard/toolbox',
      '/dashboard/profile',
      '/courses/foundation/program',
      '/courses/foundation/program/m1',
    ]
  : [];

// Seed routes — homepage + any route we know shouldn't get pruned by the
// "only follow links you've seen" rule. The crawler will discover the rest.
const SEEDS = [
  '/',
  '/assessment',
  '/assessment/take',
  '/assessment/in-depth',
  '/security',
  '/research',
  '/resources',
  '/playbooks',
  '/for-institutions',
  '/courses/foundation',
  '/services',
  '/faq',
  '/terms',
  '/privacy',
  '/ai-use-disclaimer',
];

// Conversion targets for click-distance analysis
const CONVERSION_TARGETS = {
  freeAssessment: '/assessment/take',
  paidAssessment: '/assessment/in-depth',
  foundationCourse: '/courses/foundation',
};

function isInternal(href) {
  if (!href) return false;
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  try {
    const u = new URL(href);
    return u.hostname === 'www.aibankinginstitute.com' || u.hostname === 'aibankinginstitute.com';
  } catch {
    return false;
  }
}

function pathOf(href) {
  if (!href) return '';
  if (href.startsWith('/')) return href.split('#')[0].split('?')[0];
  try {
    return new URL(href).pathname;
  } catch {
    return '';
  }
}

function shouldSkip(path) {
  return SKIP_PREFIXES.some((p) => path.startsWith(p));
}

// Downloads aren't navigable — Playwright rejects with "Download is starting"
// when goto'd. Treat them as a separate category to avoid false dead-link
// flags. Their health is checked by scripts/qa-downloads.mjs.
function isDownloadLink(path) {
  return /\.(pdf|zip|csv|xlsx|docx?)$/i.test(path);
}

async function visit(page, path) {
  const url = `${BASE}${path}`;
  const start = Date.now();
  let status = 0;
  let title = '';
  let h1 = '';
  let hasBrandMark = false;
  let hasOldWordmark = false;
  let internalLinks = [];
  let externalLinks = [];
  let ctas = [];
  let bodyText = '';
  let error = null;

  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    status = res ? res.status() : 0;
    if (status >= 200 && status < 400) {
      title = await page.title().catch(() => '');
      h1 = await page.locator('h1').first().textContent({ timeout: 2000 }).catch(() => '') || '';
      hasBrandMark = await page.locator('.aibi-mark').count() > 0;
      hasOldWordmark = await page.evaluate(() => {
        // Old Geist two-line wordmark or Ledger seal — look for known
        // signals that should NOT be present on a brand v1 page.
        const txt = document.body.innerText;
        return /THE AI BANKING\s+INSTITUTE/i.test(txt) && !document.querySelector('.aibi-mark');
      });
      const linkData = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map((a) => ({
          href: a.getAttribute('href'),
          text: (a.innerText || a.textContent || '').trim().slice(0, 80),
        }));
      });
      for (const l of linkData) {
        if (isInternal(l.href)) internalLinks.push(l);
        else externalLinks.push(l);
      }
      ctas = await page.evaluate(() => {
        // Broader CTA detection — matches the mockup button classes
        // (.mk-btn, .mk-cta) and Tailwind-style buttons too. Includes
        // visible, large-ish links/buttons in the page (>=120px wide).
        const SELECTORS = [
          'a[class*="gold"]',
          'a[class*="cta"]',
          'a[class*="mk-btn"]',
          'a[class*="mk-cta"]',
          'button[class*="gold"]',
          'button[class*="cta"]',
          'button[class*="mk-btn"]',
          'button[class*="mk-cta"]',
        ];
        return Array.from(document.querySelectorAll(SELECTORS.join(',')))
          .filter((el) => {
            if (el.offsetParent === null) return false;
            const r = el.getBoundingClientRect();
            return r.width >= 80 && r.height >= 28;
          })
          .slice(0, 10)
          .map((el) => ({
            text: (el.innerText || el.textContent || '').trim().slice(0, 80),
            href: el.tagName === 'A' ? el.getAttribute('href') : null,
          }));
      });
      bodyText = (await page.locator('main, body').first().innerText({ timeout: 2000 }).catch(() => '')).slice(0, 300);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return {
    path,
    url,
    status,
    title,
    h1: h1.trim(),
    hasBrandMark,
    hasOldWordmark,
    internalLinks,
    externalLinks,
    ctas,
    bodyTextSnippet: bodyText.trim(),
    elapsedMs: Date.now() - start,
    error,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`▸ site walk against ${BASE}\n`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: 'aibi-qa-walk/1.0' });
  const page = await ctx.newPage();

  const queue = [...SEEDS, ...AUTH_SEEDS];
  const seen = new Set(queue);
  const results = [];

  while (queue.length > 0) {
    const path = queue.shift();
    if (shouldSkip(path)) {
      console.log(`  skip ${path}`);
      continue;
    }
    process.stdout.write(`  ${path} ... `);
    const r = await visit(page, path);
    results.push(r);
    process.stdout.write(
      `${r.status}${r.hasBrandMark ? ' [Ai]' : ''}${r.hasOldWordmark ? ' OLD!' : ''}${r.error ? ` ERR: ${r.error}` : ''}  ${r.elapsedMs}ms\n`,
    );

    // BFS — enqueue new internal links that aren't seen yet.
    // Skip downloads (Playwright can't navigate to them) — verified
    // separately by scripts/qa-downloads.mjs.
    for (const l of r.internalLinks) {
      const p = pathOf(l.href);
      if (!p || p === '' || seen.has(p) || shouldSkip(p) || isDownloadLink(p)) continue;
      seen.add(p);
      queue.push(p);
    }
  }

  // Click-distance BFS from / to each conversion target
  const adjacency = new Map();
  for (const r of results) {
    const out = new Set();
    for (const l of r.internalLinks) {
      const p = pathOf(l.href);
      if (p) out.add(p);
    }
    adjacency.set(r.path, out);
  }
  function shortestPath(from, to) {
    if (from === to) return { hops: 0, path: [from] };
    const q = [[from, [from]]];
    const visited = new Set([from]);
    while (q.length) {
      const [node, trail] = q.shift();
      for (const next of adjacency.get(node) || []) {
        if (visited.has(next)) continue;
        if (next === to) return { hops: trail.length, path: [...trail, next] };
        visited.add(next);
        q.push([next, [...trail, next]]);
      }
    }
    return null;
  }
  const distances = {};
  for (const [name, target] of Object.entries(CONVERSION_TARGETS)) {
    distances[name] = shortestPath('/', target);
  }

  // Dead-end detection: page has no internal links AND no CTAs
  const deadEnds = results
    .filter((r) => r.status === 200 && r.internalLinks.length < 3 && r.ctas.length === 0)
    .map((r) => r.path);

  // Dead-link detection: links pointing to paths whose visit returned 4xx/5xx
  const failedPaths = new Set(
    results.filter((r) => r.status >= 400 || r.error).map((r) => r.path),
  );
  const deadLinks = [];
  for (const r of results) {
    for (const l of r.internalLinks) {
      const p = pathOf(l.href);
      // Skip download URLs — Playwright rejects on them ("Download is
      // starting") so the "failed" status is a false signal. Their
      // health is verified by scripts/qa-downloads.mjs.
      if (isDownloadLink(p)) continue;
      if (failedPaths.has(p)) deadLinks.push({ from: r.path, to: p, text: l.text });
    }
  }

  await browser.close();

  // Save report
  const summary = {
    base: BASE,
    walkedAt: new Date().toISOString(),
    totalPages: results.length,
    okPages: results.filter((r) => r.status >= 200 && r.status < 400).length,
    failedPages: results.filter((r) => r.status >= 400 || r.error).length,
    brandV1Pages: results.filter((r) => r.hasBrandMark).length,
    oldWordmarkPages: results.filter((r) => r.hasOldWordmark).length,
    deadEnds,
    deadLinks,
    distances,
  };
  await writeFile(resolve(OUT_DIR, 'results.json'), JSON.stringify({ summary, results }, null, 2));

  // ── Console summary ────────────────────────────────────────────────────────
  console.log(`\n════════════════════════════════════════`);
  console.log(`  walked         : ${summary.totalPages}`);
  console.log(`  ok             : ${summary.okPages}`);
  console.log(`  failed         : ${summary.failedPages}`);
  console.log(`  brand v1 mark  : ${summary.brandV1Pages}`);
  console.log(`  old wordmark   : ${summary.oldWordmarkPages}`);
  console.log(`  dead-end pages : ${summary.deadEnds.length}`);
  console.log(`  dead links     : ${summary.deadLinks.length}`);
  console.log(`════════════════════════════════════════\n`);

  if (summary.deadEnds.length) {
    console.log('DEAD-END PAGES (no internal links + no CTA):');
    summary.deadEnds.forEach((p) => console.log(`  - ${p}`));
    console.log();
  }
  if (summary.deadLinks.length) {
    console.log('DEAD LINKS:');
    for (const d of summary.deadLinks.slice(0, 20)) {
      console.log(`  ${d.from}  →  ${d.to}  ("${d.text}")`);
    }
    if (summary.deadLinks.length > 20) console.log(`  ... +${summary.deadLinks.length - 20} more`);
    console.log();
  }

  console.log('CONVERSION CLICK-DISTANCE FROM HOMEPAGE:');
  for (const [name, info] of Object.entries(distances)) {
    if (!info) {
      console.log(`  ${name.padEnd(20)} : NOT REACHABLE`);
    } else {
      const flag = info.hops > 3 ? '  ⚠ >3' : '';
      console.log(`  ${name.padEnd(20)} : ${info.hops} hop(s)${flag}  via ${info.path.join(' → ')}`);
    }
  }
  console.log();

  if (summary.oldWordmarkPages > 0) {
    console.log('PAGES WITHOUT BRAND V1 MARK (potential brand debt):');
    results.filter((r) => r.hasOldWordmark || (!r.hasBrandMark && r.status === 200)).forEach((r) => {
      console.log(`  - ${r.path}  (status ${r.status}, h1: "${r.h1.slice(0, 60)}")`);
    });
    console.log();
  }

  console.log(`▸ full results → ${OUT_DIR.replace(ROOT + '/', '')}/results.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
