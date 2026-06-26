// Course capture for the AiBI-Foundation persona audit.
//
// Single thorough Playwright pass over the real, locally-unlocked course.
// Writes per-module judge-ready Markdown (full phase content), a compact
// course map, surface captures, screenshots, and an objective functional
// report (console/network errors, tab-switch checks, mobile overflow,
// Module 1 save reachability).
//
// This is the SHARED, OBJECTIVE layer. The 100 persona evaluations read
// these files so their findings are grounded in real captured content,
// never hallucinated.
//
// Usage:
//   node scripts/course-capture.mjs
//   PLAYWRIGHT_BASE_URL=http://localhost:3000 node scripts/course-capture.mjs

import { chromium } from '@playwright/test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const ROOT = process.cwd();
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = resolve(ROOT, 'docs/course-persona-audit-100');
const CAP_DIR = resolve(OUT_DIR, 'capture');
const SHOTS_DIR = resolve(OUT_DIR, 'shots');

const MODULES = [
  [1, 'What AI Can and Cannot Do'],
  [2, 'Rewrite a Low-Risk Message'],
  [3, 'Write a Prompt That Gets to the Core'],
  [4, 'Build Your First Prompt'],
  [5, 'Add Context and Constraints'],
  [6, 'Ask for Structured Output'],
  [7, 'Review AI Output Like a Banker'],
  [8, 'Use Source Material Safely'],
  [9, 'Turn a Prompt Into a Template'],
  [10, 'Build a Role-Based Prompt'],
  [11, 'Choose the Right AI Use Case'],
  [12, 'Apply Data-Safety Boundaries'],
  [13, 'Build a Simple Reusable Skill'],
  [14, 'Map a Workflow Before Automating'],
  [15, 'Set the Human Review Gate'],
  [16, 'Keep the Proof'],
  [17, 'Create the Reusable Workflow Kit'],
  [18, 'Final Foundation Packet Review'],
];
const MODULE_TITLE = Object.fromEntries(MODULES);

const PHASES = [
  ['Understand', 'learn'],
  ['Try', 'practice'],
  ['Build', 'apply'],
  ['Save', 'save'],
];

const SURFACES = [
  ['home', '/courses/foundation/program'],
  ['onboarding', '/courses/foundation/program/onboarding'],
  ['toolkit', '/courses/foundation/program/toolkit'],
  ['prompt-library', '/courses/foundation/program/prompt-library'],
  ['quick-wins', '/courses/foundation/program/quick-wins'],
  ['tool-guides', '/courses/foundation/program/tool-guides'],
  ['gallery', '/courses/foundation/program/gallery'],
  ['submit', '/courses/foundation/program/submit'],
  ['certificate', '/courses/foundation/program/certificate'],
  ['post-assessment', '/courses/foundation/program/post-assessment'],
  ['settings', '/courses/foundation/program/settings'],
];

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const shotRel = (p) => relative(OUT_DIR, p);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pad = (n) => String(n).padStart(2, '0');

function pushUnique(arr, value) {
  if (!arr.includes(value)) arr.push(value);
}

// Attach diagnostic listeners; returns the error/response buckets.
function instrument(page) {
  const errors = [];
  const badResponses = [];
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) {
      pushUnique(errors, `${m.type()}: ${m.text()}`.slice(0, 280));
    }
  });
  page.on('pageerror', (e) => pushUnique(errors, `pageerror: ${e.message}`.slice(0, 280)));
  page.on('response', (r) => {
    const s = r.status();
    const u = r.url();
    if (s >= 400 && !u.includes('/icon.svg') && !u.includes('favicon')) {
      pushUnique(badResponses, `${s} ${u.replace(BASE_URL, '')}`.slice(0, 280));
    }
  });
  return { errors, badResponses };
}

// Read the active phase panel (or main fallback) as clean text + structure.
async function readActivePanel(page) {
  return page.evaluate(() => {
    const clean = (t) => (t ?? '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    const panel = document.querySelector('[role="tabpanel"]') || document.querySelector('main') || document.body;
    const headings = (sel, n) =>
      Array.from(panel.querySelectorAll(sel)).map((el) => clean(el.textContent)).filter(Boolean).slice(0, n);
    const text = clean(panel.innerText);
    return {
      headings: { h1: headings('h1', 4), h2: headings('h2', 16), h3: headings('h3', 24) },
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      interactive: {
        textareas: panel.querySelectorAll('textarea').length,
        textInputs: panel.querySelectorAll('input[type="text"], input:not([type])').length,
        selects: panel.querySelectorAll('select').length,
        buttons: panel.querySelectorAll('button').length,
        radios: panel.querySelectorAll('input[type="radio"]').length,
        checkboxes: panel.querySelectorAll('input[type="checkbox"]').length,
      },
      labelGaps: Array.from(panel.querySelectorAll('input, select, textarea')).filter((el) => {
        if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false;
        const id = el.getAttribute('id');
        if (id && panel.querySelector(`label[for="${CSS.escape(id)}"]`)) return false;
        return !el.closest('label');
      }).length,
    };
  });
}

async function pageState(page) {
  return page.evaluate(() => {
    const clean = (t) => (t ?? '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    const main = document.querySelector('main') || document.body;
    const text = clean(main.innerText);
    return {
      title: document.title,
      url: location.href,
      h1: Array.from(main.querySelectorAll('h1')).map((e) => clean(e.textContent)).filter(Boolean).slice(0, 4),
      h2: Array.from(main.querySelectorAll('h2')).map((e) => clean(e.textContent)).filter(Boolean).slice(0, 16),
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 4,
      linkCount: document.querySelectorAll('a[href]').length,
      buttonCount: document.querySelectorAll('button').length,
    };
  });
}

async function clickPhase(page, label) {
  const tab = page.getByRole('tab', { name: label, exact: true });
  if ((await tab.count()) === 0) return false;
  await tab.first().click();
  await page.waitForTimeout(220);
  return true;
}

function fence(s) {
  return s.length > 9000 ? s.slice(0, 9000) + '\n\n…[truncated]' : s;
}

async function captureModule(browser, number) {
  const context = await browser.newContext(DESKTOP);
  const page = await context.newPage();
  const diag = instrument(page);
  const title = MODULE_TITLE[number];
  const result = { number, title, url: `${BASE_URL}/courses/foundation/program/${number}`, phases: [], shots: {}, errors: diag.errors, badResponses: diag.badResponses };

  try {
    await page.goto(`${BASE_URL}/courses/foundation/program/${number}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(500);
    // Available phase tabs.
    const tabLabels = await page.getByRole('tab').allInnerTexts().catch(() => []);
    result.availableTabs = tabLabels.map((t) => t.replace(/\s+/g, ' ').trim());

    let lastHash = '';
    for (const [label, id] of PHASES) {
      const clicked = await clickPhase(page, label);
      if (!clicked) {
        result.phases.push({ label, id, present: false });
        continue;
      }
      const panel = await readActivePanel(page);
      // Tab-switch effectiveness: did content change vs previous phase?
      const hash = panel.text.slice(0, 120);
      const changed = hash !== lastHash;
      lastHash = hash;
      result.phases.push({ label, id, present: true, changedContent: changed, ...panel });

      if (label === 'Understand' || label === 'Build') {
        const shotPath = resolve(SHOTS_DIR, `module-${pad(number)}-${slug(label)}.png`);
        await page.screenshot({ path: shotPath, fullPage: true }).catch(() => {});
        result.shots[label] = shotRel(shotPath);
      }
    }
  } catch (err) {
    result.captureError = String(err).slice(0, 300);
  }

  await context.close();
  return result;
}

async function captureSurface(browser, name, path) {
  const context = await browser.newContext(DESKTOP);
  const page = await context.newPage();
  const diag = instrument(page);
  const out = { name, path, url: `${BASE_URL}${path}` };
  try {
    const resp = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    out.status = resp?.status() ?? 0;
    await page.waitForTimeout(450);
    Object.assign(out, await pageState(page));
    const shotPath = resolve(SHOTS_DIR, `surface-${slug(name)}.png`);
    await page.screenshot({ path: shotPath, fullPage: true }).catch(() => {});
    out.shot = shotRel(shotPath);
  } catch (err) {
    out.captureError = String(err).slice(0, 300);
  }
  out.errors = diag.errors;
  out.badResponses = diag.badResponses;
  await context.close();
  return out;
}

// Functional checks: Module 1 save reachability + mobile overflow on key pages.
async function runFunctionalChecks(browser) {
  const checks = {};

  // Module 1 artifact save reachability (synthetic, dev-only content).
  {
    const context = await browser.newContext(DESKTOP);
    const page = await context.newPage();
    const diag = instrument(page);
    try {
      await page.goto(`${BASE_URL}/courses/foundation/program/1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await clickPhase(page, 'Build');
      await page.waitForTimeout(300);
      const artifact = page.locator('#artifact_draft');
      const hasForm = (await artifact.count()) > 0;
      let saved = false;
      let saveReason = 'Module 1 artifact form not found on Build tab.';
      if (hasForm) {
        await artifact.fill('AI can draft and organize low-risk work; the banker verifies facts, policy fit, and the final decision.');
        const fillIf = async (sel, val) => {
          const loc = page.locator(sel);
          if ((await loc.count()) > 0) await loc.first().fill(val);
        };
        await fillIf('#review_note', 'Checked for no customer data, a visible human owner, and a clear drafting-vs-decision boundary.');
        await fillIf('#first_use', 'Use this limit card before unfamiliar AI-assisted drafting work.');
        await fillIf('textarea[placeholder^="Example: I removed customer details"]', 'Support only: the human owner keeps accountability; no sensitive customer detail included.');
        await fillIf('textarea[placeholder^="Example: I will use this on the branch rollout"]', 'Reuse before the next approved low-risk task.');
        const saveBtn = page.getByRole('button', { name: 'Save artifact step' });
        if ((await saveBtn.count()) > 0) {
          await saveBtn.first().click();
          await page.waitForTimeout(900);
          const body = (await page.evaluate(() => document.body.innerText)).toLowerCase();
          saved = body.includes('packet saved') || body.includes('activity submitted') || body.includes('saved to');
          saveReason = saved ? 'Save confirmation appeared.' : 'Clicked save; no clear confirmation detected.';
        } else {
          saveReason = 'Save artifact step button not found.';
        }
      }
      checks.moduleOneSave = { hasForm, saved, saveReason, errors: diag.errors, badResponses: diag.badResponses };
    } catch (err) {
      checks.moduleOneSave = { error: String(err).slice(0, 300) };
    }
    await context.close();
  }

  // Mobile overflow on home + a sample of module pages.
  {
    const context = await browser.newContext(MOBILE);
    const page = await context.newPage();
    const overflow = [];
    for (const path of ['/courses/foundation/program', '/courses/foundation/program/1', '/courses/foundation/program/9', '/courses/foundation/program/18']) {
      try {
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(400);
        const has = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4);
        overflow.push({ path, hasHorizontalOverflow: has });
        if (path.endsWith('/1')) {
          const shotPath = resolve(SHOTS_DIR, 'mobile-module-01.png');
          await page.screenshot({ path: shotPath, fullPage: false }).catch(() => {});
        }
      } catch (err) {
        overflow.push({ path, error: String(err).slice(0, 200) });
      }
    }
    checks.mobileOverflow = overflow;
    await context.close();
  }

  return checks;
}

function moduleMarkdown(mod) {
  const lines = [];
  lines.push(`# Module ${mod.number}: ${mod.title}`);
  lines.push('');
  lines.push(`Route: \`${mod.url.replace(BASE_URL, '')}\``);
  lines.push(`Available phase tabs: ${mod.availableTabs?.join(', ') || '(none detected)'}`);
  if (mod.captureError) lines.push(`\n> CAPTURE ERROR: ${mod.captureError}`);
  lines.push('');
  for (const phase of mod.phases) {
    lines.push(`## Phase: ${phase.label}`);
    if (!phase.present) {
      lines.push('_This phase tab is not present on this module._\n');
      continue;
    }
    if (phase.headings?.h2?.length) lines.push(`Section headings: ${phase.headings.h2.join(' · ')}`);
    lines.push(`Words: ${phase.wordCount} · textareas: ${phase.interactive.textareas} · selects: ${phase.interactive.selects} · buttons: ${phase.interactive.buttons} · unlabeled inputs: ${phase.labelGaps}` + (phase.changedContent ? '' : ' · (content did NOT change from previous tab)'));
    lines.push('');
    lines.push('```');
    lines.push(fence(phase.text));
    lines.push('```');
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  await rm(CAP_DIR, { recursive: true, force: true });
  await mkdir(CAP_DIR, { recursive: true });
  await mkdir(SHOTS_DIR, { recursive: true });

  const browser = await chromium.launch();
  console.log(`[capture] base=${BASE_URL}`);

  const modules = [];
  for (const [number] of MODULES) {
    process.stdout.write(`[capture] module ${number}… `);
    const mod = await captureModule(browser, number);
    modules.push(mod);
    await writeFile(resolve(CAP_DIR, `module-${pad(number)}.md`), moduleMarkdown(mod), 'utf8');
    console.log(`done (${mod.phases.filter((p) => p.present).length} phases, ${mod.errors.length} errs)`);
  }

  const surfaces = [];
  for (const [name, path] of SURFACES) {
    process.stdout.write(`[capture] surface ${name}… `);
    surfaces.push(await captureSurface(browser, name, path));
    console.log('done');
  }

  console.log('[capture] functional checks…');
  const functional = await runFunctionalChecks(browser);

  await browser.close();

  // Compact course map for continuity context (given to every persona judge).
  const mapLines = ['# AiBI-Foundation — Course Map (18 modules)', ''];
  for (const mod of modules) {
    const understand = mod.phases.find((p) => p.label === 'Understand' && p.present);
    const synopsis = understand ? understand.text.replace(/\s+/g, ' ').slice(0, 320) : '(no Understand content captured)';
    const phaseList = mod.phases.filter((p) => p.present).map((p) => p.label).join('/');
    mapLines.push(`## Module ${mod.number}: ${mod.title}`);
    mapLines.push(`Phases present: ${phaseList}`);
    mapLines.push(`Synopsis: ${synopsis}`);
    mapLines.push('');
  }
  await writeFile(resolve(CAP_DIR, 'course-map.md'), mapLines.join('\n'), 'utf8');

  // Surfaces markdown.
  const surfLines = ['# AiBI-Foundation — Surrounding Surfaces', ''];
  for (const s of surfaces) {
    surfLines.push(`## ${s.name} — \`${s.path}\` (HTTP ${s.status ?? '?'})`);
    if (s.captureError) surfLines.push(`> CAPTURE ERROR: ${s.captureError}`);
    if (s.h1?.length) surfLines.push(`H1: ${s.h1.join(' · ')}`);
    surfLines.push(`Words: ${s.wordCount ?? 0} · overflow: ${s.hasHorizontalOverflow ? 'YES' : 'no'} · errors: ${s.errors?.length ?? 0}`);
    surfLines.push('');
    surfLines.push('```');
    surfLines.push(fence((s.text ?? '').slice(0, 4000)));
    surfLines.push('```');
    surfLines.push('');
  }
  await writeFile(resolve(CAP_DIR, 'surfaces.md'), surfLines.join('\n'), 'utf8');

  // Objective functional report + full structured capture.
  const functionalReport = {
    base: BASE_URL,
    moduleCount: modules.length,
    totalConsoleErrors: modules.reduce((n, m) => n + m.errors.length, 0),
    totalBadResponses: modules.reduce((n, m) => n + m.badResponses.length, 0),
    modulesWithCaptureError: modules.filter((m) => m.captureError).map((m) => m.number),
    phaseContentUnchanged: modules.flatMap((m) =>
      m.phases.filter((p) => p.present && p.changedContent === false).map((p) => ({ module: m.number, phase: p.label })),
    ),
    unlabeledInputsByModule: modules.map((m) => ({
      module: m.number,
      unlabeled: m.phases.filter((p) => p.present).reduce((n, p) => n + (p.labelGaps || 0), 0),
    })).filter((x) => x.unlabeled > 0),
    surfaceStatuses: surfaces.map((s) => ({ name: s.name, status: s.status, overflow: s.hasHorizontalOverflow, errors: s.errors?.length ?? 0, badResponses: s.badResponses?.length ?? 0 })),
    functional,
  };
  await writeFile(resolve(CAP_DIR, 'functional-report.json'), JSON.stringify(functionalReport, null, 2), 'utf8');
  await writeFile(resolve(CAP_DIR, 'capture.json'), JSON.stringify({ modules, surfaces, functional }, null, 2), 'utf8');

  console.log('\n[capture] complete');
  console.log(`  modules captured: ${modules.length}`);
  console.log(`  console errors (modules): ${functionalReport.totalConsoleErrors}`);
  console.log(`  bad HTTP (modules): ${functionalReport.totalBadResponses}`);
  console.log(`  module-1 save: ${functional.moduleOneSave?.saved ? 'OK' : 'NOT confirmed'} (${functional.moduleOneSave?.saveReason ?? functional.moduleOneSave?.error ?? ''})`);
  console.log(`  mobile overflow: ${(functional.mobileOverflow || []).filter((o) => o.hasHorizontalOverflow).length} page(s)`);
  console.log(`  output: ${relative(ROOT, OUT_DIR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
