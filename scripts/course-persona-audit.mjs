// Course persona audit for AiBI-Foundation.
//
// Runs 20 role-based learner personas through the local course UI with
// Playwright, captures screenshots, and writes an HTML/Markdown report.
//
// Usage:
//   SKIP_ENROLLMENT_GATE=true node scripts/course-persona-audit.mjs
//
// Notes:
// - This is a local UX/content audit. The local bypass unlocks all modules,
//   so this does not prove real paid-enrollment sequencing.
// - It exercises visible pages, tabs, Module 1 artifact save, and role-relevant
//   module surfaces.

import { chromium, devices } from '@playwright/test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const ROOT = process.cwd();
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const RUN_DATE = process.env.AUDIT_DATE ?? '2026-06-26';
const OUT_DIR = resolve(ROOT, `docs/course-persona-audit-${RUN_DATE}`);
const SHOTS_DIR = resolve(OUT_DIR, 'shots');

const MODULES = [
  [1, 'What AI Can and Cannot Do'],
  [2, 'Rewrite a Low-Risk Message'],
  [3, 'Spot Weak AI Output'],
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

const PERSONAS = [
  {
    id: 'P01',
    label: 'Branch manager',
    role: 'Branch manager at a 7-branch community bank',
    device: 'desktop',
    confidence: 'new AI user',
    goal: 'Get one safe staff-facing win without creating compliance risk.',
    modules: [1, 2, 4],
    focusPhase: 'Build',
    concern: 'Needs concrete examples and a fast next step.',
  },
  {
    id: 'P02',
    label: 'Compliance officer',
    role: 'Compliance officer supporting lending and marketing reviews',
    device: 'desktop',
    confidence: 'skeptical reviewer',
    goal: 'See where human review, claim verification, and evidence live.',
    modules: [1, 3, 15, 16],
    focusPhase: 'Save',
    concern: 'Will reject vague safety language or unsupported regulatory claims.',
  },
  {
    id: 'P03',
    label: 'Lending underwriter',
    role: 'Commercial lending underwriter',
    device: 'desktop',
    confidence: 'moderate tool user',
    goal: 'Use AI to organize loan-review work without affecting credit decisions.',
    modules: [1, 3, 8, 16],
    focusPhase: 'Try',
    concern: 'Needs crisp boundaries around source material and decisions.',
  },
  {
    id: 'P04',
    label: 'BSA analyst',
    role: 'BSA/AML analyst',
    device: 'desktop',
    confidence: 'data-sensitive power user',
    goal: 'Improve alert writeups while preserving auditability.',
    modules: [1, 6, 12, 16],
    focusPhase: 'Build',
    concern: 'Looks for structured output and evidence notes.',
  },
  {
    id: 'P05',
    label: 'IT security admin',
    role: 'IT/security administrator',
    device: 'desktop',
    confidence: 'technical reviewer',
    goal: 'Check whether the course discourages personal-tool leakage.',
    modules: [1, 5, 12, 15],
    focusPhase: 'Save',
    concern: 'Needs data boundary language and escalation gates.',
  },
  {
    id: 'P06',
    label: 'Ops manager',
    role: 'Deposit operations manager',
    device: 'desktop',
    confidence: 'workflow owner',
    goal: 'Turn repeated operating work into reusable prompts or skills.',
    modules: [1, 10, 14, 17],
    focusPhase: 'Build',
    concern: 'Needs workflow mapping before automation.',
  },
  {
    id: 'P07',
    label: 'HR training lead',
    role: 'HR and training lead',
    device: 'tablet',
    confidence: 'enablement owner',
    goal: 'Package the course into repeatable staff training.',
    modules: [1, 4, 9, 18],
    focusPhase: 'Understand',
    concern: 'Needs teachable language and a final packet story.',
  },
  {
    id: 'P08',
    label: 'Marketing manager',
    role: 'Marketing and community relations manager',
    device: 'desktop',
    confidence: 'daily AI drafter',
    goal: 'Use AI for low-risk message drafts without invented facts.',
    modules: [1, 2, 9, 10],
    focusPhase: 'Try',
    concern: 'Needs reusable templates and review reminders.',
  },
  {
    id: 'P09',
    label: 'Executive sponsor',
    role: 'COO sponsoring AI adoption',
    device: 'desktop',
    confidence: 'strategic buyer',
    goal: 'See whether the curriculum leads to operational adoption.',
    modules: [1, 11, 14, 18],
    focusPhase: 'Save',
    concern: 'Needs visible proof that outputs become governed work products.',
  },
  {
    id: 'P10',
    label: 'Internal auditor',
    role: 'Internal audit lead',
    device: 'desktop',
    confidence: 'audit-first reviewer',
    goal: 'Evaluate whether the course leaves a review trail.',
    modules: [1, 3, 16, 18],
    focusPhase: 'Save',
    concern: 'Looks for traceability, not inspiration.',
  },
  {
    id: 'P11',
    label: 'Call center supervisor',
    role: 'Member contact center supervisor',
    device: 'tablet',
    confidence: 'practical manager',
    goal: 'Help frontline staff rewrite safe service communications.',
    modules: [1, 2, 7, 10],
    focusPhase: 'Build',
    concern: 'Needs simple language and clear coaching cues.',
  },
  {
    id: 'P12',
    label: 'Commercial lender',
    role: 'Commercial relationship manager',
    device: 'desktop',
    confidence: 'occasional AI user',
    goal: 'Draft better borrower-facing internal prep without decision risk.',
    modules: [1, 4, 8, 13],
    focusPhase: 'Try',
    concern: 'Needs source boundaries before using live borrower context.',
  },
  {
    id: 'P13',
    label: 'Risk officer',
    role: 'Enterprise risk officer',
    device: 'desktop',
    confidence: 'policy owner',
    goal: 'Check whether staff learn a risk-control mental model.',
    modules: [1, 5, 12, 15],
    focusPhase: 'Understand',
    concern: 'Needs decisions, data, and controls separated plainly.',
  },
  {
    id: 'P14',
    label: 'Credit union CEO',
    role: 'Credit union CEO',
    device: 'mobile',
    confidence: 'time-constrained executive',
    goal: 'Scan whether this is credible enough to sponsor.',
    modules: [1, 11, 18],
    focusPhase: 'Understand',
    concern: 'Needs mobile clarity and fast proof of value.',
  },
  {
    id: 'P15',
    label: 'New teller',
    role: 'New teller moving into a universal banker role',
    device: 'mobile',
    confidence: 'beginner',
    goal: 'Understand what is safe to try without embarrassment.',
    modules: [1, 2, 4],
    focusPhase: 'Try',
    concern: 'Needs plain language and small wins.',
  },
  {
    id: 'P16',
    label: 'Vendor manager',
    role: 'Vendor management lead',
    device: 'desktop',
    confidence: 'risk reviewer',
    goal: 'Check if the training reinforces third-party and tool-approval discipline.',
    modules: [1, 5, 12, 16],
    focusPhase: 'Save',
    concern: 'Needs evidence and tool-boundary reminders.',
  },
  {
    id: 'P17',
    label: 'Data analyst',
    role: 'Finance and data analyst',
    device: 'desktop',
    confidence: 'technical analyst',
    goal: 'Make AI outputs structured enough to review.',
    modules: [1, 6, 8, 13],
    focusPhase: 'Build',
    concern: 'Needs structure and source discipline.',
  },
  {
    id: 'P18',
    label: 'Transformation lead',
    role: 'AI transformation lead',
    device: 'desktop',
    confidence: 'program builder',
    goal: 'Assess whether artifacts compound into reusable workflows.',
    modules: [1, 11, 14, 17],
    focusPhase: 'Save',
    concern: 'Needs continuity across modules.',
  },
  {
    id: 'P19',
    label: 'Board member',
    role: 'Skeptical board member',
    device: 'tablet',
    confidence: 'governance lens',
    goal: 'Look for accountable AI use, not tool hype.',
    modules: [1, 11, 15, 18],
    focusPhase: 'Understand',
    concern: 'Needs the course to sound board-safe and non-promotional.',
  },
  {
    id: 'P20',
    label: 'Busy back-office learner',
    role: 'Back-office employee taking the course between tasks',
    device: 'mobile',
    confidence: 'low time, low confidence',
    goal: 'Finish Module 1 without getting lost.',
    modules: [1, 2, 7],
    focusPhase: 'Build',
    concern: 'Needs obvious progress and low reading load.',
  },
];

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function shotRel(path) {
  return relative(OUT_DIR, path).replaceAll('\\', '/');
}

function pushUnique(list, value) {
  if (!list.includes(value)) list.push(value);
}

function contextOptions(deviceName) {
  if (deviceName === 'mobile') return { ...devices['iPhone 14'] };
  if (deviceName === 'tablet') {
    return {
      viewport: { width: 900, height: 900 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: true,
    };
  }
  return {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  };
}

async function clickPhase(page, phase) {
  const locator = page.locator('button[role="tab"]').filter({ hasText: phase });
  const count = await locator.count();
  if (count === 0) return false;
  await locator.first().click();
  await page.waitForTimeout(120);
  return true;
}

async function collectState(page) {
  return page.evaluate(() => {
    const visibleText = (selector) =>
      Array.from(document.querySelectorAll(selector))
        .map((el) => el.textContent?.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    const bodyText = document.body.innerText.replace(/\s+/g, ' ').trim();
    const tabs = Array.from(document.querySelectorAll('button[role="tab"]')).map((button) => ({
      label: button.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      selected: button.getAttribute('aria-selected') === 'true',
    }));
    const lowerText = bodyText.toLowerCase();
    const lowerTabs = tabs.map((tab) => tab.label.toLowerCase());
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map((a) => ({
        label: a.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        href: a.getAttribute('href') ?? '',
      }))
      .filter((item) => item.label || item.href)
      .slice(0, 40);

    return {
      title: document.title,
      url: location.href,
      h1: visibleText('h1'),
      h2: visibleText('h2'),
      h3: visibleText('h3').slice(0, 12),
      tabs,
      activeTab: tabs.find((tab) => tab.selected)?.label ?? '',
      wordCount: bodyText.split(/\s+/).filter(Boolean).length,
      textSample: bodyText.slice(0, 900),
      textareaCount: document.querySelectorAll('textarea').length,
      buttonCount: document.querySelectorAll('button').length,
      linkCount: document.querySelectorAll('a[href]').length,
      links,
      hasHorizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 4,
      hasPacketSaved: lowerText.includes('packet saved'),
      hasToolboxSaved: lowerText.includes('saved to toolbox'),
      hasCourseMenu: bodyText.includes('Course menu'),
      hasModuleTabs:
        lowerTabs.some((label) => label.includes('understand')) &&
        lowerTabs.some((label) => label.includes('try')) &&
        lowerTabs.some((label) => label.includes('build')) &&
        lowerTabs.some((label) => label.includes('save')),
    };
  });
}

async function fillModuleOneArtifact(page, persona) {
  await clickPhase(page, 'Build');

  const values = {
    artifact_draft:
      `${persona.label}: AI can draft and organize low-risk work, but the banker verifies facts, policy fit, and final decisions.`,
    review_note:
      `Checked for no customer data, a visible human owner, and a clear boundary between drafting help and decision authority.`,
    first_use:
      `Use this limit card before ${persona.role.toLowerCase()} work that involves unfamiliar AI-assisted drafting.`,
  };
  const judgment =
    `I verified this is support only: the human owner keeps accountability and no sensitive customer detail is included.`;
  const transfer =
    `I will reuse this before the next approved low-risk ${persona.label.toLowerCase()} task.`;

  const artifact = page.locator('#artifact_draft');
  if ((await artifact.count()) === 0) {
    return { submitted: false, reason: 'Module 1 artifact form was not visible.' };
  }

  await artifact.fill(values.artifact_draft);
  await page.locator('#review_note').fill(values.review_note);
  await page.locator('#first_use').fill(values.first_use);

  const judgmentField = page.locator('textarea[placeholder^="Example: I removed customer details"]');
  if ((await judgmentField.count()) > 0) {
    await judgmentField.first().fill(judgment);
  }
  const transferField = page.locator('textarea[placeholder^="Example: I will use this on the branch rollout"]');
  if ((await transferField.count()) > 0) {
    await transferField.first().fill(transfer);
  }

  const saveButton = page.getByRole('button', { name: 'Save artifact step' });
  if ((await saveButton.count()) === 0) {
    return { submitted: false, reason: 'Save artifact step button was not visible.' };
  }

  await saveButton.click();
  await page.waitForTimeout(750);
  const state = await collectState(page);
  return {
    submitted: state.hasPacketSaved || state.textSample.includes('Activity submitted successfully'),
    reason: state.hasPacketSaved ? 'Packet saved confirmation appeared.' : 'Saved state was partial.',
    values,
    judgment,
    transfer,
  };
}

function buildFeedback({ persona, moduleOneState, focusState, submitResult, errors, badResponses }) {
  const wins = [];
  const frictions = [];
  const recommendations = [];

  if (moduleOneState.hasModuleTabs) {
    wins.push('The four-phase course pattern is visible and repeatable: Understand, Try, Build, Save.');
  } else {
    frictions.push('The phase structure was not clearly detectable on Module 1.');
  }

  if (submitResult.submitted) {
    wins.push('Module 1 artifact saving was reachable from the Build tab.');
  } else {
    frictions.push(submitResult.reason);
  }

  if (focusState.hasHorizontalOverflow) {
    frictions.push('The selected viewport showed horizontal overflow.');
    recommendations.push('Tighten the responsive layout for this phase before relying on mobile learners.');
  }

  if (focusState.h1.length > 0 && focusState.h1[0] && !focusState.h1[0].includes(MODULE_TITLE[1])) {
    frictions.push(
      `The visible H1 emphasizes the artifact ("${focusState.h1[0]}") more than the module concept.`,
    );
    recommendations.push('Add the module concept near the artifact title so first-time learners keep their bearings.');
  }

  if (persona.device === 'mobile' && !focusState.hasCourseMenu) {
    frictions.push('The mobile course menu cue was not visible in the captured state.');
  }

  if (focusState.textareaCount >= 5 && persona.confidence.includes('beginner')) {
    frictions.push('Beginners face several open text areas in one Build surface.');
    recommendations.push('For beginner personas, add one completed example directly above the Module 1 save button.');
  }

  if (errors.length > 0 || badResponses.length > 0) {
    frictions.push(
      `Browser captured ${errors.length} console/page error(s) and ${badResponses.length} HTTP 4xx/5xx response(s).`,
    );
    recommendations.push('Review the captured errors before treating this persona path as clean.');
  }

  if (persona.concern.includes('evidence') || persona.concern.includes('audit')) {
    if (focusState.textSample.toLowerCase().includes('proof') || focusState.textSample.toLowerCase().includes('evidence')) {
      wins.push('Evidence/proof language is present for the review-oriented persona.');
    } else {
      frictions.push('The selected module did not surface evidence language strongly enough for this persona.');
    }
  }

  if (persona.device !== 'desktop') {
    recommendations.push('Re-test this persona on a physical device; browser emulation only proves layout basics.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep the module flow, but make the next required action more explicit after each save.');
  }

  return {
    summary:
      frictions.length === 0
        ? `${persona.label} can orient, save the first artifact, and reach the role-relevant module.`
        : `${persona.label} can reach the course, but ${frictions.length} friction point(s) surfaced.`,
    wins,
    frictions,
    recommendations,
  };
}

async function runPersona(browser, persona) {
  const context = await browser.newContext(contextOptions(persona.device));
  const page = await context.newPage();
  const errors = [];
  const badResponses = [];

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      pushUnique(errors, `${message.type()}: ${message.text()}`.slice(0, 240));
    }
  });
  page.on('pageerror', (error) =>
    pushUnique(errors, `pageerror: ${error.message}`.slice(0, 240)),
  );
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes('/icon.svg')) {
      pushUnique(badResponses, `${status} ${url.replace(BASE_URL, '')}`.slice(0, 240));
    }
  });

  const safe = `${persona.id}-${slug(persona.label)}`;
  const overviewShot = resolve(SHOTS_DIR, `${safe}-overview.png`);
  const moduleOneShot = resolve(SHOTS_DIR, `${safe}-module-01-build.png`);
  const focusModule = persona.modules[persona.modules.length - 1];
  const focusShot = resolve(
    SHOTS_DIR,
    `${safe}-module-${String(focusModule).padStart(2, '0')}-${slug(persona.focusPhase)}.png`,
  );

  await page.goto(`${BASE_URL}/courses/foundation/program`, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: overviewShot, fullPage: false });
  const overviewState = await collectState(page);

  await page.goto(`${BASE_URL}/courses/foundation/program/1`, { waitUntil: 'domcontentloaded' });
  const moduleOneStart = await collectState(page);
  const submitResult = await fillModuleOneArtifact(page, persona);
  await page.screenshot({ path: moduleOneShot, fullPage: false });
  const moduleOneState = await collectState(page);

  const visited = [];
  for (const moduleNumber of persona.modules) {
    await page.goto(`${BASE_URL}/courses/foundation/program/${moduleNumber}`, {
      waitUntil: 'domcontentloaded',
    });
    const phaseStates = [];
    for (const phase of ['Understand', 'Try', 'Build', 'Save']) {
      const clicked = await clickPhase(page, phase);
      if (!clicked) continue;
      const state = await collectState(page);
      phaseStates.push({
        phase,
        activeTab: state.activeTab,
        h1: state.h1[0] ?? '',
        h2: state.h2[0] ?? '',
        wordCount: state.wordCount,
        textareaCount: state.textareaCount,
        hasHorizontalOverflow: state.hasHorizontalOverflow,
      });
    }
    visited.push({ moduleNumber, title: MODULE_TITLE[moduleNumber], phaseStates });
  }

  await page.goto(`${BASE_URL}/courses/foundation/program/${focusModule}`, {
    waitUntil: 'domcontentloaded',
  });
  await clickPhase(page, persona.focusPhase);
  await page.screenshot({ path: focusShot, fullPage: false });
  const focusState = await collectState(page);

  await context.close();

  const feedback = buildFeedback({
    persona,
    moduleOneState,
    focusState,
    submitResult,
    errors,
    badResponses,
  });

  return {
    persona,
    overviewState,
    moduleOneStart,
    moduleOneState,
    focusState,
    submitResult,
    visited,
    errors,
    badResponses,
    screenshots: {
      overview: shotRel(overviewShot),
      moduleOne: shotRel(moduleOneShot),
      focus: shotRel(focusShot),
    },
    feedback,
  };
}

function summarize(results) {
  const modulesCovered = new Set();
  let overflowCount = 0;
  let submitSuccessCount = 0;
  let totalErrors = 0;
  let totalBadResponses = 0;

  for (const result of results) {
    for (const visit of result.visited) modulesCovered.add(visit.moduleNumber);
    if (result.focusState.hasHorizontalOverflow || result.moduleOneState.hasHorizontalOverflow) {
      overflowCount += 1;
    }
    if (result.submitResult.submitted) submitSuccessCount += 1;
    totalErrors += result.errors.length;
    totalBadResponses += result.badResponses.length;
  }

  return {
    personas: results.length,
    modulesCovered: Array.from(modulesCovered).sort((a, b) => a - b),
    overflowCount,
    submitSuccessCount,
    totalErrors,
    totalBadResponses,
  };
}

function renderMarkdown(results, summary) {
  const rows = results
    .map((result) => {
      const p = result.persona;
      return `| ${p.id} | ${p.label} | ${p.device} | ${p.modules.map((m) => `${m}. ${MODULE_TITLE[m]}`).join('<br>')} | ${esc(result.feedback.summary)} |`;
    })
    .join('\n');

  const details = results
    .map((result) => {
      const p = result.persona;
      const frictions = result.feedback.frictions.map((item) => `- ${item}`).join('\n') || '- None captured.';
      const wins = result.feedback.wins.map((item) => `- ${item}`).join('\n') || '- None captured.';
      const recs =
        result.feedback.recommendations.map((item) => `- ${item}`).join('\n') ||
        '- No recommendation.';
      return `## ${p.id} - ${p.label}

**Role:** ${p.role}

**Goal:** ${p.goal}

**Concern:** ${p.concern}

**Evidence image:** ![${p.id} focus screenshot](${result.screenshots.focus})

**Wins**

${wins}

**Friction**

${frictions}

**Recommendations**

${recs}

**Screenshots:** [overview](${result.screenshots.overview}), [Module 1 Build](${result.screenshots.moduleOne}), [focus module](${result.screenshots.focus})
`;
    })
    .join('\n');

  return `# AiBI-Foundation Course Persona Audit

Run date: ${RUN_DATE}

Base URL: ${BASE_URL}

## Scope

This local Playwright run simulated 20 learner personas through the AiBI-Foundation course. It captured screenshots, walked Module 1, submitted the Module 1 artifact save path, and opened role-relevant modules for each persona.

Important limitation: the local server used \`SKIP_ENROLLMENT_GATE=true\`, so every module is unlocked by a synthetic enrollment. This report audits content, layout, navigation, and form reachability. It is not proof of paid enrollment, real learner sequencing, or persisted Supabase progress.

## Summary

- Personas: ${summary.personas}
- Modules covered: ${summary.modulesCovered.map((m) => `${m}. ${MODULE_TITLE[m]}`).join(', ')}
- Module 1 artifact save successes: ${summary.submitSuccessCount}/${summary.personas}
- Personas with horizontal overflow in captured states: ${summary.overflowCount}/${summary.personas}
- Console/page errors: ${summary.totalErrors}
- HTTP 4xx/5xx responses captured: ${summary.totalBadResponses}

## Persona Table

| ID | Persona | Device | Modules walked | Summary |
| --- | --- | --- | --- | --- |
${rows}

${details}
`;
}

function renderHtml(results, summary) {
  const personaCards = results
    .map((result) => {
      const p = result.persona;
      const moduleList = p.modules
        .map((m) => `<span class="pill">${m}. ${esc(MODULE_TITLE[m])}</span>`)
        .join('');
      const wins = result.feedback.wins.map((item) => `<li>${esc(item)}</li>`).join('') || '<li>None captured.</li>';
      const frictions =
        result.feedback.frictions.map((item) => `<li>${esc(item)}</li>`).join('') ||
        '<li>None captured.</li>';
      const recs =
        result.feedback.recommendations.map((item) => `<li>${esc(item)}</li>`).join('') ||
        '<li>No recommendation.</li>';
      const errorLine =
        result.errors.length || result.badResponses.length
          ? `<p class="warn">Diagnostics: ${result.errors.length} console/page error(s), ${result.badResponses.length} HTTP 4xx/5xx response(s).</p>`
          : '<p class="ok">Diagnostics: no console/page errors or HTTP 4xx/5xx responses captured.</p>';

      return `<article class="persona" id="${p.id}">
  <div class="persona-head">
    <div>
      <p class="eyebrow">${esc(p.id)} / ${esc(p.device)} / ${esc(p.confidence)}</p>
      <h2>${esc(p.label)}</h2>
      <p class="role">${esc(p.role)}</p>
    </div>
    <a href="${esc(result.screenshots.focus)}">Open image</a>
  </div>
  <p class="goal"><strong>Goal:</strong> ${esc(p.goal)}</p>
  <p class="goal"><strong>Concern:</strong> ${esc(p.concern)}</p>
  <div class="modules">${moduleList}</div>
  <img class="shot" src="${esc(result.screenshots.focus)}" alt="${esc(p.id)} focus module screenshot">
  <p class="summary">${esc(result.feedback.summary)}</p>
  ${errorLine}
  <div class="grid">
    <section><h3>What worked</h3><ul>${wins}</ul></section>
    <section><h3>Friction</h3><ul>${frictions}</ul></section>
    <section><h3>Recommended change</h3><ul>${recs}</ul></section>
  </div>
  <p class="links">Screenshots: <a href="${esc(result.screenshots.overview)}">overview</a> / <a href="${esc(result.screenshots.moduleOne)}">Module 1 Build</a> / <a href="${esc(result.screenshots.focus)}">focus module</a></p>
</article>`;
    })
    .join('\n');

  const moduleCoverage = summary.modulesCovered
    .map((m) => `<span class="pill">${m}. ${esc(MODULE_TITLE[m])}</span>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AiBI-Foundation Course Persona Audit - ${RUN_DATE}</title>
  <style>
    :root {
      --ink: #071a2f;
      --slate: #475569;
      --line: #d8dee8;
      --soft: #f1f5f9;
      --gold: #c99a2e;
      --good: #047857;
      --warn: #9a3412;
    }
    body {
      margin: 0;
      background: var(--soft);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    header, main, footer { max-width: 1180px; margin: 0 auto; padding: 28px; }
    header { padding-top: 42px; }
    .eyebrow { margin: 0 0 8px; color: var(--gold); font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(34px, 5vw, 64px); line-height: .95; letter-spacing: 0; }
    h2 { margin: 0; font-size: 28px; line-height: 1.1; letter-spacing: 0; }
    h3 { margin: 0 0 8px; font-size: 14px; letter-spacing: .1em; text-transform: uppercase; color: var(--slate); }
    .lead { max-width: 860px; color: var(--slate); font-size: 18px; }
    .metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 24px 0; }
    .metric { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 14px; }
    .metric strong { display: block; font-size: 26px; line-height: 1; }
    .metric span { color: var(--slate); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    .scope, .persona { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 20px; margin: 18px 0; }
    .persona-head { display: flex; justify-content: space-between; gap: 18px; align-items: start; }
    .persona-head a, .links a { color: var(--ink); font-weight: 750; }
    .role, .goal, .summary, .links { color: var(--slate); }
    .modules { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 16px; }
    .pill { display: inline-flex; border: 1px solid var(--line); background: var(--soft); border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 750; }
    .shot { width: 100%; max-height: 560px; object-fit: cover; object-position: top left; border: 1px solid var(--line); border-radius: 8px; background: var(--soft); }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
    .grid section { border: 1px solid var(--line); border-radius: 8px; padding: 14px; background: #fbfdff; }
    ul { margin: 0; padding-left: 18px; }
    li { margin: 5px 0; }
    .ok { color: var(--good); font-weight: 700; }
    .warn { color: var(--warn); font-weight: 700; }
    footer { color: var(--slate); font-size: 13px; padding-bottom: 48px; }
    @media (max-width: 800px) {
      header, main, footer { padding: 18px; }
      .metrics, .grid { grid-template-columns: 1fr; }
      .persona-head { display: block; }
    }
  </style>
</head>
<body>
  <header>
    <p class="eyebrow">Local Playwright simulation / ${RUN_DATE}</p>
    <h1>AiBI-Foundation Course Persona Audit</h1>
    <p class="lead">20 personas walked the local course UI, saved the Module 1 artifact path, visited role-relevant modules, and captured screenshots for review.</p>
    <div class="metrics">
      <div class="metric"><strong>${summary.personas}</strong><span>Personas</span></div>
      <div class="metric"><strong>${summary.modulesCovered.length}/18</strong><span>Modules covered</span></div>
      <div class="metric"><strong>${summary.submitSuccessCount}/${summary.personas}</strong><span>M1 saves</span></div>
      <div class="metric"><strong>${summary.overflowCount}</strong><span>Overflow captures</span></div>
      <div class="metric"><strong>${summary.totalErrors + summary.totalBadResponses}</strong><span>Diagnostics</span></div>
    </div>
  </header>
  <main>
    <section class="scope">
      <h2>Scope And Limits</h2>
      <p>This was run against <code>${esc(BASE_URL)}</code> with the local course bypass enabled. It audits content, layout, tab flow, and form reachability. It does not prove paid enrollment, real sequencing, certificate issuance, or durable Supabase progress.</p>
      <h3>Module coverage</h3>
      <div class="modules">${moduleCoverage}</div>
    </section>
    ${personaCards}
  </main>
  <footer>Generated by scripts/course-persona-audit.mjs. Source data: run.json. Screenshots: shots/.</footer>
</body>
</html>`;
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(SHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const persona of PERSONAS) {
    process.stdout.write(`Running ${persona.id} ${persona.label}...\n`);
    results.push(await runPersona(browser, persona));
  }

  await browser.close();

  const summary = summarize(results);
  const runData = {
    runDate: RUN_DATE,
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    summary,
    results,
  };

  await writeFile(resolve(OUT_DIR, 'run.json'), JSON.stringify(runData, null, 2));
  await writeFile(resolve(OUT_DIR, 'report.md'), renderMarkdown(results, summary));
  await writeFile(resolve(OUT_DIR, 'index.html'), renderHtml(results, summary));

  process.stdout.write(`\nWrote ${relative(ROOT, OUT_DIR)}/index.html\n`);
  process.stdout.write(`Wrote ${relative(ROOT, OUT_DIR)}/report.md\n`);
  process.stdout.write(`Wrote ${results.length * 3} screenshots in ${relative(ROOT, SHOTS_DIR)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
