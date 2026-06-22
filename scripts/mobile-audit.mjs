// Mobile audit v2 — 390×844 (iPhone 14) renders with sticky-CTA verification.
//
// Succeeds the original mobile-audit-2026-05-28.html, which was captured
// BEFORE StickyMobileCta landed (PR #373). This pass verifies whether the
// sticky bar actually solves the swipe-gap problem and surfaces what else
// still needs compression per route.
//
// Usage: npm run dev (other terminal) then:
//   node scripts/mobile-audit.mjs

import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ROOT = process.cwd();
const DEVICE = devices['iPhone 14']; // 390×844, devicePixelRatio 3

const ROUTES = [
  {
    path: '/',
    title: 'Home',
    expectedStickyLabel: 'Get my AI readiness score',
    commentary: {
      whatChanged: 'StickyMobileCta now anchors "Get my AI readiness score" → /assessment/take after the user scrolls past the hero. Previously the hero was the only primary action.',
      stillBroken: [
        'ROI calculator is still 4 stacked sliders on mobile — ~600px of vertical scroll for an interactive that 90% of mobile users will scroll past',
        'Bottom "Get readiness score" CtaBand is still in the DOM — now competing with the sticky for the same action',
        'Four-pillar value-path still renders as a vertical stack of 4 cards instead of a horizontal swipe rail',
      ],
      nextFixes: [
        'Drop the bottom CtaBand on mobile only (`.mk-cta-band-desktop` pattern is already used on /assessment — copy it)',
        'Collapse ROI calculator into a single accordion ("See what an hour saved is worth →") that opens the 4 sliders inline',
        'Convert the four-pillar section to horizontal-scroll snap rail on mobile',
      ],
    },
  },
  {
    path: '/assessment',
    title: 'Assessment',
    expectedStickyLabel: 'Start the free assessment',
    commentary: {
      whatChanged: 'Assessment is the cleanest of the five — desktop CtaBand is wrapped in `mk-cta-band-desktop` so it does NOT render on mobile, and the sticky carries "Start the free assessment" to /assessment/take.',
      stillBroken: [
        'Two hero cards (free v3 + In-Depth $99) still stack — ~1500px before the buyer scrolls',
        '12-dimension grid still renders as 12 stacked rows — predictable wall of text in the middle of the page',
        'Live demo (4-question quiz) eats ~2000px in the middle and most mobile users decide before reaching it',
      ],
      nextFixes: [
        'Hero: collapse to ONE card (free v3); In-Depth becomes a chip link below ("or buy the In-Depth ($99 →)")',
        'Live demo: collapse to a "Try the demo →" button that expands inline',
        '12 dimensions: show top 3 weakest with "See all 12 →" accordion',
      ],
    },
  },
  {
    path: '/courses',
    title: 'Courses',
    expectedStickyLabel: 'Enroll · $295',
    commentary: {
      whatChanged: 'StickyMobileCta carries "Enroll · $295" → purchase page. The price is now visible at every scroll position on mobile, which solves the audit\'s "$295 not visible until late" complaint.',
      stillBroken: [
        '18-module list can still read as stacked rows unless the mobile view groups modules by outcome and current next action',
        'CoursePreview interactive (5-module learning path + animated illustrations) is brilliant on desktop but renders as two stacked panels on mobile — the left rail of module buttons is buried under the right detail panel',
        'Bottom enrollment CtaBand restates the sticky — same action, two surfaces',
      ],
      nextFixes: [
        'CoursePreview on mobile: render only the active module detail by default with a "5 modules →" disclosure that opens the picker as a bottom sheet',
        '18-module list: render as compact grouped mini cards on mobile so the added modules do not add scroll burden',
        'Drop the bottom CtaBand on mobile (sticky already covers it)',
      ],
    },
  },
  {
    path: '/for-institutions',
    title: 'For Institutions',
    expectedStickyLabel: 'Book a briefing',
    commentary: {
      whatChanged: 'Sticky carries "Book a briefing" → /for-institutions/advisory — the original audit\'s 6.3-swipe dead zone now has a persistent CTA. This was the highest-impact wire.',
      stillBroken: [
        '5-step Assess→Train→Document→Govern→Consult sequence still renders vertically — ~1500px of process flow that should be a horizontal stepper',
        'Sample dashboard preview is still small and decorative on mobile — not legible',
        '"Three ways to build" section still duplicates content from /for-institutions/advisory',
        'No pricing band — institutional buyer still has to "book a briefing" to find out what it costs',
      ],
      nextFixes: [
        '5-step process: horizontal-scroll rail with snap-points OR collapse to 1-line stepper',
        'Sample dashboard: replace with a single named metric on mobile ("Compliance 67/100") + "See full chart →" link',
        'Add a transparent pricing band ("Cohorts start at $X for up to N seats")',
        'Cut "Three ways to build" entirely on mobile; link to /for-institutions/advisory',
      ],
    },
  },
  {
    path: '/research',
    title: 'Research',
    expectedStickyLabel: 'Take the free assessment',
    commentary: {
      whatChanged: 'Sticky carries "Take the free assessment" → /assessment. GuidedFilter (PR #375) added a role/problem/format picker at the top — this is the right pattern but lives above the fold and demands engagement before content.',
      stillBroken: [
        'GuidedFilter forces the buyer to engage with a UI before they see any content — desktop has the space for this, mobile should default to "show me the best stuff"',
        'After filter, each section renders as vertical card stacks — same problem as before',
        'DownloadGate (email-capture-before-download) appears per card — mobile users tapping 3 articles get the same form 3 times',
      ],
      nextFixes: [
        'Default state: 3 featured essays ABOVE the filter; filter becomes "Or browse by role →" disclosure',
        'Replace per-card DownloadGate with a session-scoped capture: ungate every subsequent download after the first',
        'Card stacks: horizontal-scroll rail (1.5 cards per swipe) with snap-points',
      ],
    },
  },
  {
    path: '/resources',
    title: 'Resources',
    expectedStickyLabel: null, // intentionally — flag the gap
    commentary: {
      whatChanged: 'New page (shipped 2026-05-28 in feature/resources-redesign → main). NOT YET wired with StickyMobileCta — this is the obvious gap.',
      stillBroken: [
        'No sticky mobile CTA at all — buyer scrolling through 4 kit cards has no persistent action',
        'Four kit cards stack vertically on mobile (no surprise) but each one already has its own ZIP-download CTA, which competes for attention',
        'FeaturedKit panel on mobile collapses the side-by-side desktop layout but is still ~800px tall on its own',
      ],
      nextFixes: [
        'Add StickyMobileCta to /resources with label "Get readiness score" → /assessment (matches the audit feedback recommendation)',
        'Kit cards on mobile: render as 1-card horizontal rail (swipe between kits) instead of vertical stack',
        'FeaturedKit on mobile: just the ZIP download CTA + title, drop the kit-picker rail (the cards below already let you switch)',
      ],
    },
  },
];

async function capture(page, route) {
  const url = `${BASE}${route.path}`;
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  const status = res?.status() ?? 0;
  await page.waitForTimeout(800);

  // Initial fold screenshot (at top, no scroll).
  const fold = await page.screenshot({ type: 'png', fullPage: false });

  // Scroll past the trigger threshold (600px) to surface the sticky.
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(600);
  const scrolled = await page.screenshot({ type: 'png', fullPage: false });

  // Detect the sticky element + its visible state + its label.
  const sticky = await page.evaluate(() => {
    const el = document.querySelector('.mk-sticky-mobile-cta');
    if (!el) return { present: false, visible: false, label: null };
    const rect = el.getBoundingClientRect();
    const action = el.querySelector('.mk-sticky-mobile-cta-action, a, button');
    const label = action ? (action.textContent || '').trim().slice(0, 80) : null;
    const computedStyle = getComputedStyle(el);
    const visibleByLayout = rect.bottom > 0 && rect.top < window.innerHeight;
    const visibleByDataAttr = el.getAttribute('data-visible') === 'true';
    return {
      present: true,
      visible: visibleByLayout && visibleByDataAttr && computedStyle.display !== 'none',
      label,
    };
  });

  // Page metrics.
  const metrics = await page.evaluate(() => {
    const html = document.documentElement;
    const fullHeight = Math.max(html.scrollHeight, html.offsetHeight);
    const swipeHeight = 800; // rough rule: ~viewport's worth per thumb swipe
    return {
      fullHeight,
      thumbSwipes: Math.round((fullHeight / swipeHeight) * 10) / 10,
    };
  });

  // Reset scroll for the next route.
  await page.evaluate(() => window.scrollTo(0, 0));

  return { status, fold, scrolled, sticky, metrics };
}

function severityPill(swipes) {
  if (swipes <= 4) return ['pill-ok', `~${swipes} swipes`];
  if (swipes <= 7) return ['pill-mid', `~${swipes} swipes`];
  return ['pill-bad', `~${swipes} swipes`];
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...DEVICE });
  const page = await ctx.newPage();

  const captured = [];
  for (const r of ROUTES) {
    process.stdout.write(`→ ${r.path} ... `);
    const c = await capture(page, r);
    captured.push({ ...r, ...c });
    const stickyState = c.sticky.present
      ? c.sticky.visible
        ? `sticky="${c.sticky.label}"`
        : 'sticky present but not visible after scroll'
      : 'NO STICKY';
    process.stdout.write(`HTTP ${c.status} · ${c.metrics.fullHeight}px · ${c.metrics.thumbSwipes} swipes · ${stickyState}\n`);
  }

  await browser.close();

  const today = new Date().toISOString().slice(0, 10);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>AiBI mobile audit v2 — post-#373 StickyMobileCta</title>
<style>
  :root {
    --ink:#071A2F; --gold:#C8A24A; --gold-deep:#9A7A2F;
    --cream:#F7F3EA; --cream-2:#EFE7D7;
    --slate-200:#E2E8F0; --slate-500:#64748B; --slate-600:#475569;
    --emerald-50:#ECFDF5; --emerald-700:#047857;
    --amber-50:#FEF3C7; --amber-700:#92400E;
    --red-50:#FEF2F2; --red-700:#B91C1C;
  }
  * { box-sizing: border-box; }
  body { margin:0; font:14px/1.55 "Inter",-apple-system,system-ui,sans-serif; color:var(--ink); background:var(--cream); }
  .container { max-width:1480px; margin:0 auto; padding:32px 24px 80px; }
  header.top { background:var(--ink); color:var(--cream); padding:40px 24px; border-radius:0 0 24px 24px; margin-bottom:32px; border-bottom:4px solid var(--gold); }
  header.top h1 { margin:0 0 8px; font-size:28px; font-weight:700; letter-spacing:-.01em; }
  header.top p { margin:0; opacity:.78; max-width:780px; }
  header.top .small { font-size:12px; margin-top:12px; opacity:.6; }
  nav.toc { background:#fff; border:1px solid var(--slate-200); border-radius:12px; padding:12px 16px; margin-bottom:24px; display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
  nav.toc strong { font-size:11px; text-transform:uppercase; letter-spacing:.14em; color:var(--gold-deep); margin-right:8px; }
  nav.toc a { color:var(--ink); text-decoration:none; padding:5px 12px; border-radius:999px; background:var(--cream-2); font-size:13px; font-weight:600; }
  nav.toc a:hover { background:var(--gold); }
  .route { background:#fff; border:1px solid var(--slate-200); border-radius:16px; padding:0; margin-bottom:28px; overflow:hidden; }
  .route-h { background:var(--cream-2); padding:18px 22px; border-bottom:1px solid var(--slate-200); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
  .route-h h2 { margin:0; font-size:20px; font-weight:600; }
  .route-h .muted { color:var(--slate-500); font-weight:400; font-size:14px; margin-left:6px; }
  .route-h .meta { display:flex; gap:8px; flex-wrap:wrap; }
  .pill { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.02em; }
  .pill-ok { background:var(--emerald-50); color:var(--emerald-700); }
  .pill-mid { background:var(--amber-50); color:var(--amber-700); }
  .pill-bad { background:var(--red-50); color:var(--red-700); }
  .pill-meta { background:var(--cream); color:var(--slate-600); }
  .pill-gap { background:var(--red-50); color:var(--red-700); }
  .route-body { display:grid; grid-template-columns: auto auto 1fr; gap:0; }
  @media (max-width: 1100px) { .route-body { grid-template-columns: 1fr; } }
  .phone-frame { background:var(--ink); padding:14px 8px 8px; border-right:1px solid var(--slate-200); height:fit-content; max-height:82vh; overflow-y:auto; }
  .phone-frame img { display:block; width:300px; max-width:100%; border-radius:14px; }
  .phone-frame .chrome-bar { width:50px; height:5px; background:#3a4a5f; border-radius:999px; margin:0 auto 8px; }
  .phone-frame .frame-label { color:#c8d0d8; font-size:11px; text-align:center; margin-bottom:8px; opacity:.7; }
  .commentary { display:flex; flex-direction:column; gap:14px; padding:18px 22px; }
  .block { background:var(--cream); padding:14px 18px; border-radius:12px; border-left:4px solid var(--slate-200); }
  .block.changed { border-left-color:var(--emerald-700); }
  .block.broken { border-left-color:#dc2626; }
  .block.fixes { border-left-color:var(--gold); }
  .block h3 { margin:0 0 10px; font-size:11px; text-transform:uppercase; letter-spacing:.16em; color:var(--slate-600); font-weight:700; }
  .block p, .block ul { margin:0; padding-left:0; }
  .block ul { padding-left:18px; }
  .block li { margin-bottom:6px; font-size:13.5px; line-height:1.5; }
  .sticky-status { padding:10px 22px; background:#fff; border-bottom:1px solid var(--slate-200); font-size:12px; color:var(--slate-600); }
  .sticky-status strong { color:var(--ink); }
  .reading-guide { background:#fff; border:1px solid var(--slate-200); border-radius:12px; padding:16px 20px; margin-bottom:24px; font-size:13px; color:var(--slate-600); }
  .reading-guide strong { color:var(--ink); }
</style>
</head>
<body>
  <header class="top">
    <h1>AiBI mobile audit v2 — 390×844 renders, post-StickyMobileCta</h1>
    <p>Second-pass mobile audit, captured AFTER PR #373 wired StickyMobileCta on all 5 parent pages. Each route is rendered at iPhone 14 viewport; the audit verifies the sticky CTA's actual label + visibility post-scroll, then flags what mobile work still remains per the original audit's priority list.</p>
    <p class="small">Generated by <code>scripts/mobile-audit.mjs</code> · ${today} · supersedes <code>mobile-audit-2026-05-28.html</code></p>
  </header>
  <div class="container">

    <div class="reading-guide">
      <strong>Reading guide:</strong> first phone frame is the hero fold (scroll=0). Second is the page scrolled past the sticky trigger (~1200px) — that's where the StickyMobileCta should appear at the bottom of the viewport. Right column has: what changed since the previous audit, what's still broken, and the next fixes. Thumb-swipe count = page height ÷ 800px (rough rule).
    </div>

    <nav class="toc">
      <strong>Jump to</strong>
      ${captured.map((r) => `<a href="#${r.path === '/' ? 'home' : r.path.replace(/[/]/g, '-').replace(/^-/, '')}">${r.title}</a>`).join('')}
    </nav>

    ${captured.map((r) => {
      const id = r.path === '/' ? 'home' : r.path.replace(/[/]/g, '-').replace(/^-/, '');
      const [pillClass, pillText] = severityPill(r.metrics.thumbSwipes);
      const foldB64 = r.fold.toString('base64');
      const scrolledB64 = r.scrolled.toString('base64');
      const stickyLabelLine = r.sticky.present
        ? (r.sticky.visible
          ? `<strong>StickyMobileCta visible after scroll:</strong> "${r.sticky.label}" · <span style="color:var(--emerald-700)">wired correctly</span>`
          : `<strong>StickyMobileCta present but not visible after scroll</strong> — check <code>data-visible</code> or scroll trigger`)
        : `<strong style="color:var(--red-700)">No StickyMobileCta on this page</strong> — gap`;
      const stickyPill = r.sticky.present && r.sticky.visible
        ? '<span class="pill pill-ok">sticky ✓</span>'
        : '<span class="pill pill-gap">no sticky</span>';
      return `
        <section class="route" id="${id}">
          <header class="route-h">
            <h2>${r.title} <span class="muted">${r.path}</span></h2>
            <div class="meta">
              <span class="pill ${pillClass}">${pillText}</span>
              <span class="pill pill-meta">${r.metrics.fullHeight.toLocaleString()}px tall</span>
              ${stickyPill}
              <span class="pill pill-meta">HTTP ${r.status}</span>
            </div>
          </header>
          <div class="sticky-status">${stickyLabelLine}</div>
          <div class="route-body">
            <div class="phone-frame">
              <div class="chrome-bar"></div>
              <div class="frame-label">hero fold (scroll=0)</div>
              <img src="data:image/png;base64,${foldB64}" alt="${r.title} mobile fold render" />
            </div>
            <div class="phone-frame">
              <div class="chrome-bar"></div>
              <div class="frame-label">scrolled 1200px (sticky should appear)</div>
              <img src="data:image/png;base64,${scrolledB64}" alt="${r.title} mobile after-scroll render" />
            </div>
            <div class="commentary">
              <div class="block changed">
                <h3>What changed since the prior audit</h3>
                <p>${r.commentary.whatChanged}</p>
              </div>
              <div class="block broken">
                <h3>What's still broken on mobile</h3>
                <ul>${r.commentary.stillBroken.map((p) => `<li>${p}</li>`).join('')}</ul>
              </div>
              <div class="block fixes">
                <h3>Next fixes (priority order)</h3>
                <ul>${r.commentary.nextFixes.map((f) => `<li>${f}</li>`).join('')}</ul>
              </div>
            </div>
          </div>
        </section>`;
    }).join('')}

  </div>
</body>
</html>`;

  const out = resolve(ROOT, `docs/handoffs/mobile-audit-v2-${today}.html`);
  await mkdir(resolve(ROOT, 'docs/handoffs'), { recursive: true });
  await writeFile(out, html);
  console.log(`\n✓ Wrote ${out}`);
  console.log(`  ${(html.length / 1024).toFixed(0)} KB · ${captured.length} routes`);
}

main().catch((err) => {
  console.error('Mobile audit failed:', err);
  process.exit(1);
});
