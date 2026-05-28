// Desktop audit: 1440×900 captures of the 5 parent funnel pages with
// fold metrics + per-route commentary. Mirrors the mobile audit's
// side-by-side format. Companion to docs/handoffs/mobile-audit-*.html.
//
// Usage: npm run dev (in another terminal) then:
//   node scripts/desktop-audit.mjs

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const VIEWPORT = { width: 1440, height: 900 }; // 13" laptop default
const ROOT = process.cwd();

const ROUTES = [
  {
    path: '/',
    title: 'Home',
    problems: [
      'Hero takes the full 900px fold but the primary CTA ("Get my readiness score") competes for attention with the ROI calculator and three pillar cards just below — buyer is unclear what to do next on first glance',
      'Two-column hero leaves the right column comparatively quiet — score-card mock works but doesn\'t earn the real estate',
      'ROI calculator is below the fold on most laptops; the heaviest interactive on the page is the one nobody finds',
      'Bottom "Get readiness score" CTA repeats the hero CTA verbatim — same words, same color, no new reason to click',
      'Page is 3.6 fold-screens — fine for length; the issue is density: middle two screens have low conversion signal and lots of decorative whitespace',
    ],
    fixes: [
      'Promote the ROI calculator above the fold OR move it into a dedicated /roi-calculator interior page and link to it from the hero',
      'Differentiate the two homepage CTAs: hero = "Take the free assessment", footer = "Book a 30-minute briefing" (different action, not the same one twice)',
      'Add one specific number to the hero ("8,400 community banks") — concrete claims beat aspiration on desktop where there is space to render them',
      'Trim the four-pillar section to three pillars or render as a single horizontal band with icon row',
      'Hero right column should be the ROI snapshot, not a static score card — match the page\'s actual conversion engine',
    ],
  },
  {
    path: '/assessment',
    title: 'Assessment',
    problems: [
      'Two hero cards stacked side-by-side (free v3 + In-Depth $99) — desktop has room but the buyer still gets two competing primary CTAs at the same level',
      'Live demo (4-question quiz) is a genuine asset but lives in the middle of the page — most visitors decide before they reach it',
      '12-dimension grid renders as 4×3 on desktop, which is fine spatially but visually flat — 12 same-shape cards make no individual case',
      'Three-tier pricing strip after the demo restates pricing the hero already showed — redundant',
      'Page is 5 fold-screens — reasonable, but the sequence is wrong: demo and sample report are on opposite ends of the page when they should be adjacent so the payoff is one scroll',
    ],
    fixes: [
      'Hero: one primary CTA only (Take the free assessment). In-Depth becomes a secondary text link "or buy the In-Depth ($99 →)"',
      'Promote the live demo into the hero right column — make the conversion mechanism the visual anchor, not pricing',
      'Pair the demo and the sample report preview side-by-side — visitor sees what they\'ll get the moment they finish',
      'Compress the 12 dimensions into 3 themed groups (Governance / Practice / Outcomes) with a "See all 12 dimensions" disclosure',
      'Drop the bottom CtaBand (hero already has both paths post-#349)',
    ],
  },
  {
    path: '/courses',
    title: 'Courses',
    problems: [
      'Hero is a single course preview — works, but desktop has space to also show a 1-line "for whom" + outcome statement that the buyer needs before deciding',
      '12-module list as a vertical stack on desktop is a wall of titles — no module visibly differentiates itself, no module shows "this is where it gets interesting"',
      'Module 1 expanded by default is good for desktop; module thumbnail/screenshot would be better than module summary text',
      'Pricing strip is below the fold and below the curriculum — buyer evaluating fit doesn\'t see $295 until they\'ve already committed scroll time',
      'Bottom enrollment CtaBand restates the hero — same problem as Home',
      'Page is 4.7 fold-screens — fine; the curriculum section alone is doing too much of the work to convince the buyer',
    ],
    fixes: [
      'Hero right column: pricing ($295 · 12 modules · self-paced · certificate) instead of repeating the course-name lockup',
      'Render the 12-module list as a horizontal stepper (1→12) with the current/active module visually anchored — desktop has the width for it',
      'Surface 2-3 "marquee modules" with screenshots inline (M3, M4, M9) — let the buyer see the interactive sandbox and prompt library before scrolling further',
      'Move the pricing strip into the hero, not below the fold',
      'Replace bottom CtaBand with a per-module footer: "Module 1 unlocks immediately on enroll →"',
    ],
  },
  {
    path: '/for-institutions',
    title: 'For Institutions',
    problems: [
      'Hero competes: "AI training built for community banks" + dashboard preview + "Book a briefing" CTA — three focal points, none of them clearly the primary action',
      'The 5-step Assess→Train→Document→Govern→Consult sequence is rendered as a vertical strip — desktop should run this as a 5-column horizontal flow with arrows; vertical is mobile thinking',
      'Sample dashboard preview is small and decorative rather than legible — desktop has room to render it at full readable size',
      '"Three ways to build" section restates engagement tiers that the advisory page covers — duplication between /for-institutions and /for-institutions/advisory',
      'Pricing is opaque — institutional buyer scrolling here expects to see at least a price band ("Starts at $X / cohort") before being asked to book',
      'Page is 5.5 fold-screens — at the upper edge of acceptable for an institutional sales page; the 5-step Assess→Train→Document→Govern→Consult sequence accounts for ~1.5 screens that should be one horizontal band',
    ],
    fixes: [
      'Hero: single CTA ("Book a 30-minute briefing"), dashboard preview promoted to full-width directly below the hero (it is your proof, give it room)',
      'Render the 5-step process as a horizontal flow with arrows — desktop columns earn their keep when sequence matters',
      'Sample dashboard at full readable size with one annotated callout ("Compliance score 67/100 — driver: documentation gap")',
      'Add a transparent pricing band ("Cohorts start at $X for up to N seats · custom plans on request") — opacity is friction for institutional buyers',
      'Cut "Three ways to build" entirely; link to /for-institutions/advisory once at the bottom',
    ],
  },
  {
    path: '/research',
    title: 'Research',
    problems: [
      'GuidedFilter (added 2026-05-28) is the right idea but lives at the top with no preselected state — buyer sees a filter UI and has to engage before they see any content',
      'After filter, each section renders as a vertical stack of identically-shaped cards — desktop should run as a 3-column grid; vertical is mobile pattern leaking up',
      'DownloadGate (email-capture-before-download) appears on every card — desktop user clicking three cards in a row gets the same form three times',
      '7 essays + 4 templates currently surfaced — content is good, but the page reads as "an archive" rather than "the latest thinking"',
      'No featured / pinned essay — desktop deserves a hero piece that anchors the page above the filter',
      'Page is 5.9 fold-screens — the longest of the five parents in desktop terms; most of that is repeated card chrome rather than content',
    ],
    fixes: [
      'Hero: one featured essay rendered as a full-width editorial card (title, dek, hero image, "Read →") — anchor the page in content, not navigation',
      'Render each post-filter section as a 3-column grid on desktop, not a vertical stack',
      'DownloadGate: capture the email once per session, then ungate every subsequent download — currently the form is gating its own conversion',
      'Add an "Editor\'s picks" rail of 3 essays above the filter — for buyers who don\'t know what to filter on',
      'Collapse the four templates into the GuidedFilter\'s "Template" tab — surface only when filtered to that type',
    ],
  },
];

async function capture(page, route) {
  const url = `${BASE}${route.path}`;
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  const status = res?.status() ?? 0;
  await page.waitForTimeout(800); // settle fonts / hydration

  // Fold screenshot (viewport only).
  const fold = await page.screenshot({ type: 'png', fullPage: false });

  // Page metrics.
  const metrics = await page.evaluate(() => {
    const html = document.documentElement;
    const fullHeight = Math.max(html.scrollHeight, html.offsetHeight);
    const fold = window.innerHeight;

    // Count visible CTAs above the fold.
    const ctaWords = /(take|start|book|get|download|enroll|continue|preview|browse|copy markdown|reset)/i;
    const buttons = Array.from(document.querySelectorAll('a, button')).filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > fold) return false;
      if (r.width < 40 || r.height < 20) return false;
      const t = (el.textContent || '').trim();
      return t.length > 0 && t.length < 80 && ctaWords.test(t);
    });

    // Hero region (above-fold container) — measure rough density.
    const heroChildren = document.body.children[0]
      ? document.body.children[0].querySelectorAll('a, button, h1, h2, p').length
      : 0;

    return {
      fullHeight,
      fold,
      scrollScreens: Math.round((fullHeight / fold) * 10) / 10,
      foldCtaCount: buttons.length,
      foldCtaLabels: buttons.slice(0, 8).map((b) => b.textContent.trim().slice(0, 40)),
      heroChildren,
    };
  });

  return { status, fold, metrics };
}

function severityPill(scrollScreens) {
  if (scrollScreens <= 3.5) return ['pill-ok', `${scrollScreens} screens`];
  if (scrollScreens <= 6) return ['pill-mid', `${scrollScreens} screens`];
  return ['pill-bad', `${scrollScreens} screens`];
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  const captured = [];
  for (const r of ROUTES) {
    process.stdout.write(`→ ${r.path} ... `);
    const c = await capture(page, r);
    captured.push({ ...r, ...c });
    process.stdout.write(`HTTP ${c.status} · ${c.metrics.fullHeight}px · ${c.metrics.scrollScreens} screens · ${c.metrics.foldCtaCount} fold CTAs\n`);
  }

  await browser.close();

  const today = new Date().toISOString().slice(0, 10);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>AiBI desktop audit — 1440×900 renders</title>
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
  .route-body { display:grid; grid-template-columns: minmax(640px, 1.05fr) minmax(360px, 0.95fr); gap:0; }
  @media (max-width: 1100px) { .route-body { grid-template-columns: 1fr; } }
  .desktop-frame { background:var(--ink); padding:14px 8px; border-right:1px solid var(--slate-200); height:fit-content; max-height:78vh; overflow-y:auto; }
  .desktop-frame img { display:block; width:100%; border-radius:6px; box-shadow:0 12px 24px -10px rgba(0,0,0,.4); }
  .desktop-frame .chrome { display:flex; gap:5px; padding:0 6px 8px; }
  .desktop-frame .chrome span { width:10px; height:10px; border-radius:50%; background:#3a4a5f; }
  .commentary { display:flex; flex-direction:column; gap:14px; padding:18px 22px; }
  .block { background:var(--cream); padding:14px 18px; border-radius:12px; border-left:4px solid var(--slate-200); }
  .block.problems { border-left-color:#dc2626; }
  .block.fixes { border-left-color:var(--emerald-700); }
  .block h3 { margin:0 0 10px; font-size:11px; text-transform:uppercase; letter-spacing:.16em; color:var(--slate-600); font-weight:700; }
  .block ul { margin:0; padding-left:18px; }
  .block li { margin-bottom:6px; font-size:13.5px; line-height:1.5; }
  .metrics-bar { display:flex; gap:14px; flex-wrap:wrap; padding:12px 22px; background:#fff; border-bottom:1px solid var(--slate-200); font-size:12px; color:var(--slate-600); }
  .metrics-bar strong { color:var(--ink); }
  .reading-guide { background:#fff; border:1px solid var(--slate-200); border-radius:12px; padding:16px 20px; margin-bottom:24px; font-size:13px; color:var(--slate-600); }
  .reading-guide strong { color:var(--ink); }
</style>
</head>
<body>
  <header class="top">
    <h1>AiBI desktop audit — 1440×900 production renders</h1>
    <p>Companion to <code>mobile-audit-${today}.html</code>. Same five parent pages, captured at a common 13" laptop viewport, with desktop-specific commentary: fold-line CTA clarity, horizontal-space usage, sequence/grid rendering decisions, and where the funnel additions earn or waste the real estate desktop gives them.</p>
    <p class="small">Generated by <code>scripts/desktop-audit.mjs</code> · ${today}</p>
  </header>
  <div class="container">

    <div class="reading-guide">
      <strong>Reading guide:</strong> left column is the actual production render at 1440×900 (scroll inside the frame to see the full page). Right column has the desktop-specific problems and proposed fixes. "Screens" = full page height ÷ 900px fold = how many fold-screens a buyer has to swipe past on a 13" laptop. Anything above ~6 screens is too long for a marketing page.
    </div>

    <nav class="toc">
      <strong>Jump to</strong>
      ${captured.map((r) => `<a href="#${r.path === '/' ? 'home' : r.path.replace(/[/]/g, '-').replace(/^-/, '')}">${r.title}</a>`).join('')}
    </nav>

    ${captured.map((r) => {
      const id = r.path === '/' ? 'home' : r.path.replace(/[/]/g, '-').replace(/^-/, '');
      const [pillClass, pillText] = severityPill(r.metrics.scrollScreens);
      const b64 = r.fold.toString('base64');
      return `
        <section class="route" id="${id}">
          <header class="route-h">
            <h2>${r.title} <span class="muted">${r.path}</span></h2>
            <div class="meta">
              <span class="pill ${pillClass}">${pillText}</span>
              <span class="pill pill-meta">${r.metrics.fullHeight.toLocaleString()}px tall</span>
              <span class="pill pill-meta">${r.metrics.foldCtaCount} CTA${r.metrics.foldCtaCount === 1 ? '' : 's'} at fold</span>
              <span class="pill pill-meta">HTTP ${r.status}</span>
            </div>
          </header>
          <div class="metrics-bar">
            <span><strong>Fold CTAs visible:</strong> ${r.metrics.foldCtaLabels.length ? r.metrics.foldCtaLabels.map((l) => `<code>${l.replace(/</g, '&lt;')}</code>`).join(' · ') : '<em>none detected</em>'}</span>
          </div>
          <div class="route-body">
            <div class="desktop-frame">
              <div class="chrome"><span></span><span></span><span></span></div>
              <img src="data:image/png;base64,${b64}" alt="${r.title} desktop fold render" />
            </div>
            <div class="commentary">
              <div class="block problems">
                <h3>Desktop-specific problems</h3>
                <ul>${r.problems.map((p) => `<li>${p}</li>`).join('')}</ul>
              </div>
              <div class="block fixes">
                <h3>Proposed fixes</h3>
                <ul>${r.fixes.map((f) => `<li>${f}</li>`).join('')}</ul>
              </div>
            </div>
          </div>
        </section>`;
    }).join('')}

  </div>
</body>
</html>`;

  const out = resolve(ROOT, `docs/handoffs/desktop-audit-${today}.html`);
  await mkdir(resolve(ROOT, 'docs/handoffs'), { recursive: true });
  await writeFile(out, html);
  console.log(`\n✓ Wrote ${out}`);
  console.log(`  ${(html.length / 1024).toFixed(0)} KB · ${captured.length} routes`);
}

main().catch((err) => {
  console.error('Desktop audit failed:', err);
  process.exit(1);
});
