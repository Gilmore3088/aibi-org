// Full-page audit: every active route, captured at desktop (1440 wide)
// AND mobile (390 wide / iPhone 14), full-page screenshots saved to
// disk as JPEG, plus two HTML reports (one per viewport).
//
// Re-uses the route inventory + classification from .site-audit-data.json
// so each route entry shows CTAs, downloads, interactivity, and notes.
//
// Usage: npm run dev (other terminal), then:
//   node scripts/full-audit.mjs

import { chromium, devices } from '@playwright/test';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const TODAY = new Date().toISOString().slice(0, 10);
const SHOTS_DIR = resolve(ROOT, `docs/handoffs/screenshots-${TODAY}`);

const data = JSON.parse(
  await readFile(resolve(ROOT, 'docs/handoffs/.site-audit-data.json'), 'utf8'),
);

// Substitute dynamic params with known sample slugs (same map as site-audit.mjs).
const SAMPLE_PARAMS = {
  '/research/[slug]': '/research/the-widening-ai-gap',
  '/research/templates/[slug]': '/research/templates/ai-workflow-sop',
  '/playbooks/[role]': '/playbooks/compliance',
  '/playbooks/[role]/[asset]': null,
  '/courses/foundation/program/[module]': '/courses/foundation/program/awareness-1',
  '/courses/foundation/program/artifacts/[artifactId]': null,
  '/dashboard/toolbox/cookbook/[slug]': null,
  '/dashboard/toolbox/library/[slug]': null,
  '/my-toolbox/skills/[slug]': null,
  '/practice/[repId]': '/practice/first-role-prompt',
  '/results/[id]': '/results/sample',
  '/verify/[certificateId]': null,
  '/assessment/in-depth/results/[id]': null,
  '/assessment/results/print/[id]': null,
};

function resolvable(route) {
  if (!route.includes('[')) return route;
  return SAMPLE_PARAMS[route] ?? null;
}

function slugFor(route) {
  if (route === '/') return 'home';
  return route.replace(/^\//, '').replace(/[/[\]]/g, '-');
}

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'mobile', ...devices['iPhone 14'] },
];

async function captureOne(page, route, viewportName) {
  const url = resolvable(route);
  if (!url) return { skipped: true, reason: 'requires-auth-or-data' };

  try {
    // Use networkidle + 1500ms settle to let React hydration + lazy-loaded
    // IntersectionObserver sections finish before the screenshot. The prior
    // 'domcontentloaded' + 700ms was too aggressive on heavy pages
    // (/assessment, /courses, /resources, /research/[slug]) and captured
    // the page mid-hydration — looked like "metadata only" in the audit
    // because hero chrome rendered but section bodies were still skeletons.
    const res = await page.goto(`${BASE}${url}`, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });
    await page.waitForTimeout(1500);
    // Scroll the page to force lazy-loaded images + IntersectionObserver
    // sections, then back to top. Slower step (150ms) gives each section
    // time to settle before the next scroll.
    await page.evaluate(async () => {
      const total = document.documentElement.scrollHeight;
      for (let y = 0; y < total; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const slug = slugFor(route);
    const outPath = resolve(SHOTS_DIR, viewportName, `${slug}.jpg`);
    await page.screenshot({
      path: outPath,
      type: 'jpeg',
      quality: 65,
      fullPage: true,
    });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    return {
      status: res?.status() ?? 0,
      probedAs: url,
      screenshotPath: relative(resolve(ROOT, 'docs/handoffs'), outPath),
      pageHeight: height,
    };
  } catch (e) {
    return { status: 'error', error: String(e).slice(0, 200) };
  }
}

/* ─── Capture ─────────────────────────────────────────────────────── */

async function main() {
  // Fresh screenshots directory.
  if (existsSync(SHOTS_DIR)) await rm(SHOTS_DIR, { recursive: true });
  await mkdir(resolve(SHOTS_DIR, 'desktop'), { recursive: true });
  await mkdir(resolve(SHOTS_DIR, 'mobile'), { recursive: true });

  const browser = await chromium.launch();
  const results = { desktop: new Map(), mobile: new Map() };

  for (const v of VIEWPORTS) {
    process.stdout.write(`\n=== ${v.name.toUpperCase()} (${v.viewport.width}px) ===\n`);
    const ctx = await browser.newContext(v);
    const page = await ctx.newPage();
    for (const r of data.routes) {
      process.stdout.write(`  ${r.route} ... `);
      const result = await captureOne(page, r.route, v.name);
      results[v.name].set(r.route, result);
      if (result.skipped) process.stdout.write(`skip (${result.reason})\n`);
      else if (result.status === 'error') process.stdout.write(`ERROR: ${result.error}\n`);
      else process.stdout.write(`HTTP ${result.status} · ${result.pageHeight}px\n`);
    }
    await ctx.close();
  }
  await browser.close();

  /* ─── Emit HTML reports ────────────────────────────────────────── */

  for (const v of VIEWPORTS) {
    const html = buildHtml(v.name, results[v.name]);
    const out = resolve(ROOT, `docs/handoffs/${v.name}-full-audit-${TODAY}.html`);
    await writeFile(out, html);
    console.log(`✓ Wrote ${relative(ROOT, out)} (${(html.length / 1024).toFixed(0)} KB HTML + ${data.routes.length} JPEG screenshots in ${relative(ROOT, SHOTS_DIR)}/${v.name}/)`);
  }
}

/* ─── HTML rendering ──────────────────────────────────────────────── */

function pill(cls, text) {
  return `<span class="pill pill-${cls}">${text}</span>`;
}

function statusPill(r) {
  if (r.skipped) return pill('muted', 'skipped');
  if (r.status === 'error') return pill('bad', 'error');
  if (r.status === 200) return pill('ok', '200');
  if (r.status === 308 || r.status === 307) return pill('warn', String(r.status));
  if (r.status === 404) return pill('bad', '404');
  return pill('muted', String(r.status ?? '—'));
}

function detailRows(routeInfo, captureResult) {
  const r = routeInfo;
  const rows = [];

  // CTAs / interactivity
  const features = [];
  if (r.hasCTA) features.push('CTA');
  if (r.interactive) features.push('interactive');
  if (r.hasForm) features.push('form');
  if (r.hasCalendly) features.push('Calendly');
  if (r.hasStripe) features.push('Stripe');
  if (features.length) {
    rows.push(`<div class="row"><span class="row-k">Features</span><span class="row-v">${features.map(f => `<code>${f}</code>`).join(' · ')}</span></div>`);
  }

  // Outbound CTAs (internal hrefs from this route)
  if (r.internalHrefs && r.internalHrefs.length) {
    const links = r.internalHrefs.slice(0, 10).map(h => `<a href="${h}" class="ref">${h}</a>`).join(' · ');
    rows.push(`<div class="row"><span class="row-k">Goes to (internal)</span><span class="row-v">${links}${r.internalHrefs.length > 10 ? ` <span class="muted">+${r.internalHrefs.length - 10} more</span>` : ''}</span></div>`);
  }

  // External CTAs (Calendly etc.)
  if (r.externalHrefs && r.externalHrefs.length) {
    const links = r.externalHrefs.map(h => `<a href="${h}" class="ref" target="_blank" rel="noopener">${h.length > 60 ? h.slice(0, 60) + '…' : h}</a>`).join(' · ');
    rows.push(`<div class="row"><span class="row-k">Goes to (external)</span><span class="row-v">${links}</span></div>`);
  }

  // Downloads
  if (r.downloads && r.downloads.length) {
    const dl = r.downloads.map(d => `<a href="${d}" class="ref" target="_blank">${d.split('/').pop()}</a>`).join(' · ');
    rows.push(`<div class="row"><span class="row-k">Downloadables</span><span class="row-v">${dl}</span></div>`);
  }

  // Page height
  if (captureResult.pageHeight) {
    rows.push(`<div class="row"><span class="row-k">Page height</span><span class="row-v"><code>${captureResult.pageHeight.toLocaleString()}px</code></span></div>`);
  }

  // Probed-as if substituted
  if (captureResult.probedAs && captureResult.probedAs !== r.route) {
    rows.push(`<div class="row"><span class="row-k">Probed as</span><span class="row-v"><code>${captureResult.probedAs}</code></span></div>`);
  }

  // Skip reason
  if (captureResult.skipped) {
    rows.push(`<div class="row"><span class="row-k">Skipped</span><span class="row-v">${captureResult.reason} — dynamic route requires a real ID or signed-in session</span></div>`);
  }

  if (captureResult.error) {
    rows.push(`<div class="row"><span class="row-k">Error</span><span class="row-v"><code>${captureResult.error}</code></span></div>`);
  }

  // File path
  rows.push(`<div class="row"><span class="row-k">Source</span><span class="row-v"><code>${r.file}</code></span></div>`);

  return rows.join('');
}

function buildHtml(viewportName, captureMap) {
  const isDesktop = viewportName === 'desktop';
  const frameWidth = isDesktop ? 720 : 360; // displayed width in the audit page
  const maxHeight = isDesktop ? 900 : 760;

  // Group routes by parent prefix for navigation.
  const groups = {};
  for (const r of data.routes) {
    const segments = r.route.split('/').filter(Boolean);
    const parent = segments.length === 0 ? '/' : '/' + segments[0];
    (groups[parent] = groups[parent] || []).push(r);
  }
  const groupKeys = Object.keys(groups).sort();

  const sections = data.routes.map((r) => {
    const cap = captureMap.get(r.route);
    const id = slugFor(r.route);
    return `
      <section class="route" id="${id}">
        <header class="route-h">
          <div>
            <h2><code>${r.route}</code></h2>
          </div>
          <div class="meta">${statusPill(r)} ${cap.pageHeight ? `<span class="pill pill-meta">${cap.pageHeight.toLocaleString()}px</span>` : ''}</div>
        </header>
        <div class="route-body">
          <div class="frame frame-${viewportName}" style="--frame-w:${frameWidth}px;--frame-max-h:${maxHeight}px">
            ${cap.skipped || cap.status === 'error'
              ? `<div class="frame-empty">No screenshot — ${cap.skipped ? cap.reason : 'capture error'}</div>`
              : `<img src="${cap.screenshotPath}" alt="${r.route} ${viewportName} full-page" loading="lazy" />`
            }
          </div>
          <div class="details">${detailRows(r, cap)}</div>
        </div>
      </section>`;
  }).join('');

  const tocHtml = groupKeys.map((parent) => `
    <details class="toc-group" ${parent === '/' ? 'open' : ''}>
      <summary>${parent === '/' ? '/ (home)' : parent} <span class="toc-count">${groups[parent].length}</span></summary>
      <ul>${groups[parent].map((r) => `<li><a href="#${slugFor(r.route)}"><code>${r.route}</code></a></li>`).join('')}</ul>
    </details>
  `).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>AiBI ${viewportName} full-page audit — ${TODAY}</title>
<style>
  :root {
    --ink:#071A2F; --gold:#C8A24A; --gold-deep:#9A7A2F;
    --cream:#F7F3EA; --cream-2:#EFE7D7;
    --slate-100:#F1F5F9; --slate-200:#E2E8F0; --slate-500:#64748B; --slate-600:#475569;
    --emerald-50:#ECFDF5; --emerald-700:#047857;
    --amber-50:#FEF3C7; --amber-700:#92400E;
    --red-50:#FEF2F2; --red-700:#B91C1C;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--cream); color:var(--ink); font:14px/1.55 "Inter",-apple-system,system-ui,sans-serif; }
  header.top { background:var(--ink); color:#fff; padding:24px 28px; border-bottom:4px solid var(--gold); position:sticky; top:0; z-index:50; }
  header.top h1 { margin:0; font-size:20px; font-weight:700; letter-spacing:-.01em; }
  header.top p { margin:4px 0 0; font-size:13px; opacity:.78; }
  .layout { display:grid; grid-template-columns:280px 1fr; min-height:calc(100vh - 80px); }
  @media (max-width: 900px) { .layout { grid-template-columns:1fr; } nav.toc { display:none; } }
  nav.toc { background:#fff; border-right:1px solid var(--slate-200); padding:16px; overflow-y:auto; height:calc(100vh - 80px); position:sticky; top:80px; }
  nav.toc strong { font-size:11px; text-transform:uppercase; letter-spacing:.14em; color:var(--gold-deep); display:block; margin-bottom:12px; }
  .toc-group { margin-bottom:6px; }
  .toc-group summary { cursor:pointer; padding:6px 8px; border-radius:6px; font-weight:600; font-size:12px; user-select:none; }
  .toc-group summary:hover { background:var(--cream-2); }
  .toc-group .toc-count { color:var(--slate-500); font-weight:400; margin-left:4px; font-size:10px; }
  .toc-group ul { margin:4px 0 0; padding-left:18px; list-style:none; }
  .toc-group li { margin:2px 0; }
  .toc-group li a { color:var(--ink); text-decoration:none; font-size:11px; display:block; padding:3px 6px; border-radius:4px; line-height:1.3; }
  .toc-group li a:hover { background:var(--cream-2); }
  .toc-group li code { font-size:11px; }
  main { padding:24px 28px 80px; max-width:1280px; }
  .route { background:#fff; border:1px solid var(--slate-200); border-radius:14px; margin-bottom:24px; overflow:hidden; scroll-margin-top:96px; }
  .route-h { background:var(--cream-2); padding:14px 18px; border-bottom:1px solid var(--slate-200); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
  .route-h h2 { margin:0; font-size:15px; font-weight:600; }
  .route-h code { background:transparent; font-size:14px; }
  .meta { display:flex; gap:6px; flex-wrap:wrap; }
  .pill { display:inline-block; padding:2px 9px; border-radius:999px; font-size:11px; font-weight:700; }
  .pill-ok { background:var(--emerald-50); color:var(--emerald-700); }
  .pill-bad { background:var(--red-50); color:var(--red-700); }
  .pill-warn { background:var(--amber-50); color:var(--amber-700); }
  .pill-muted { background:var(--slate-100); color:var(--slate-500); }
  .pill-meta { background:var(--cream); color:var(--slate-600); }
  .route-body { display:grid; grid-template-columns:auto 1fr; gap:0; align-items:start; }
  @media (max-width: 1100px) { .route-body { grid-template-columns:1fr; } }
  .frame { background:var(--ink); padding:10px; border-right:1px solid var(--slate-200); display:flex; align-items:flex-start; justify-content:center; }
  .frame img { display:block; width:var(--frame-w); max-width:100%; max-height:var(--frame-max-h); border-radius:6px; object-fit:contain; object-position:top; box-shadow:0 8px 16px -8px rgba(0,0,0,.5); }
  .frame-mobile img { max-height:760px; }
  .frame-empty { color:var(--slate-500); padding:80px 20px; text-align:center; background:#fff; border-radius:6px; font-size:12px; width:var(--frame-w); max-width:100%; }
  .details { padding:16px 18px; font-size:13px; }
  .row { display:grid; grid-template-columns:140px 1fr; gap:10px; padding:8px 0; border-bottom:1px solid var(--slate-100); }
  .row:last-child { border-bottom:0; }
  .row-k { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--gold-deep); font-weight:700; }
  .row-v { word-break:break-all; }
  .row-v code { background:var(--cream); padding:1px 5px; border-radius:3px; font-size:12px; }
  .ref { color:var(--ink); text-decoration:none; border-bottom:1px dotted var(--slate-500); }
  .ref:hover { color:var(--gold-deep); }
  .muted { color:var(--slate-500); font-size:11px; }
</style>
</head>
<body>
  <header class="top">
    <h1>AiBI ${viewportName} full-page audit — ${TODAY}</h1>
    <p>Every active route rendered at ${isDesktop ? '1440×900' : '390×844 (iPhone 14)'}. Full-page screenshots (saved as JPEG in <code>screenshots-${TODAY}/${viewportName}/</code>). ${data.routes.length} routes total · use the left rail to jump.</p>
  </header>
  <div class="layout">
    <nav class="toc">
      <strong>Routes by parent</strong>
      ${tocHtml}
    </nav>
    <main>${sections}</main>
  </div>
</body>
</html>`;
}

main().catch((err) => {
  console.error('Full audit failed:', err);
  process.exit(1);
});
