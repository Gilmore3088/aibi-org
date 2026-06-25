// generate-kit-zips.mjs — rebuild the downloadable kit ZIPs in brand v1.
//
// Each kit ZIP bundles brand-v1 PDFs, optional companion files, a per-kit
// START-HERE.pdf (regenerated brand v1), and a README.md. Core kit assets ship
// as PDFs so the public downloads are branded, readable, and consistent.
//
// PDF sources: prefer committed files in public/downloads; fall back to the
// production download endpoint when a local file is not present.
// README: cached per-kit in public/downloads/kits/<slug>/README.md (this
// script writes them on first run from inline strings).
// START-HERE: rendered via Playwright from a small per-kit HTML template
// that uses public/downloads/source/_brand.css (same brand chrome as the
// rest of the regenerated PDFs).
//
// Usage:
//   node scripts/generate-kit-zips.mjs               # build all kits
//   node scripts/generate-kit-zips.mjs --only <slug> # build one kit
//   node scripts/generate-kit-zips.mjs --upload      # also upload to Supabase

import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const BASE = process.env.BASE_URL || 'https://www.aibankinginstitute.com';
const OUT_DIR = resolve(ROOT, 'public/downloads');
const WORK_DIR = resolve(ROOT, '.tmp/kit-bundles');
const SRC_HTML_DIR = resolve(ROOT, 'public/downloads/source');

// ── Kit definitions ────────────────────────────────────────────────────────

const KITS = {
  'governance-starter-kit': {
    title: 'The Bank AI Governance Starter Kit',
    lede: 'Four tools to set the data line, classify AI use, start the inventory, and document your first workflow.',
    forWhom:
      'For compliance, risk, operations, and executive teams establishing the first approved AI path: publish safe-use habits, classify use cases, start the inventory, and document one reusable workflow.',
    startHereName: '00-Start-Here.pdf',
    steps: [
      'Set the data line with the Before-You-Paste Safe AI Checklist.',
      'Classify three current AI uses with the Red / Yellow / Green AI Use Card.',
      'Start the editable AI Use-Case Inventory with owner, data class, risk tier, human review, evidence, and next review date.',
      'Use the Workflow SOP Builder before any AI workflow becomes repeatable team practice.',
      'Run the 45-Minute AI Governance Starter Sprint: set the data line, classify three current AI uses, start the inventory, and document one workflow SOP.',
    ],
    assets: [
      { source: 'safe-ai-use-checklist.pdf', target: '01-Before-You-Paste-Safe-AI-Checklist.pdf', description: 'What staff should do before using AI: strip sensitive data, ask clearly, fact-check outputs, and escalate risky decisions.' },
      { source: 'red-yellow-green-use-card.pdf', target: '02-Red-Yellow-Green-AI-Use-Card.pdf', description: 'How to classify an AI use case as allowed, review-required, or prohibited before work begins.' },
      { source: 'artifact-ai-use-case-inventory.pdf', target: '03-AI-Use-Case-Inventory-Card.pdf', description: 'Quick reference for logging AI workflows, owners, data classes, risk tiers, vendor controls, and review cadence.' },
      { source: 'kit-assets/governance-starter-kit/AI-Use-Case-Inventory.xlsx', target: '04-AI-Use-Case-Inventory.xlsx', description: 'Editable portfolio register for status, department, purpose, tool approval, data class, risk tier, customer impact, reviewer, evidence, and review dates.' },
      { source: 'template-ai-workflow-sop.pdf', target: '05-AI-Workflow-SOP-Template.pdf', description: 'Reference PDF for documenting an individual AI-assisted workflow before reuse.' },
      { source: 'kit-assets/governance-starter-kit/AI-Workflow-SOP-Builder.docx', target: '06-AI-Workflow-SOP-Builder.docx', description: 'Editable workflow SOP builder with approved tool, allowed inputs, prohibited inputs, review standard, approval checkpoint, retention rule, and escalation triggers.' },
    ],
  },
  'banker-builder-brief-kit': {
    title: 'The Banker Builder Brief Kit',
    lede:
      'In 45 minutes, turn one workflow problem into a one-page Builder Brief, safe build path, test plan, and launch checklist.',
    forWhom:
      'For operations, branch, compliance, risk, IT, and executive teams that want bankers to turn one annoying workflow into a specific, reviewable internal solution plan before it becomes shadow IT.',
    startHereName: '00-Start-Here.pdf',
    steps: [
      'Read the Banker Builder Guide and complete the Should We Build This? Scorecard.',
      'Complete the Banker Builder Brief before prompting, tracking, automating, or asking IT for a build.',
      'Use the Build Path Selector and Risk Gate to choose the smallest safe path and catch Red triggers early.',
      'Run the Prototype Test Plan with permitted test data and a named reviewer.',
      'Complete the Launch and Handoff Checklist before reuse.',
      'If the workflow becomes repeatable, move it into the AI Workflow SOP Builder.',
    ],
    assets: [
      {
        source: 'kit-assets/banker-builder-brief-kit/Banker-Builder-Guide.pdf',
        target: '01-Banker-Builder-Guide.pdf',
        description:
          'Plain-language guide for turning workflow pain into a build/no-build decision, Builder Brief, safe path, test plan, and handoff.',
      },
      {
        source: 'kit-assets/banker-builder-brief-kit/Should-We-Build-This-Scorecard.xlsx',
        target: '02-Should-We-Build-This-Scorecard.xlsx',
        description:
          'Editable scorecard with yes/no questions, live score, verdict, recommended action, reviewer notes, and evidence location.',
      },
      {
        source: 'kit-assets/banker-builder-brief-kit/Banker-Builder-Brief.docx',
        target: '03-Banker-Builder-Brief.docx',
        description:
          'One-page PRD-style banker brief for problem, user, current workflow, proposed solution, must-do items, must-not-do boundaries, data, review, evidence, and handoff.',
      },
      {
        source: 'kit-assets/banker-builder-brief-kit/Build-Path-And-Risk-Gate.xlsx',
        target: '04-Build-Path-And-Risk-Gate.xlsx',
        description:
          'Editable build-path ladder and data/risk gate workbook with Green, Yellow, Red logic and escalation prompts.',
      },
      {
        source: 'kit-assets/banker-builder-brief-kit/Prototype-Test-Plan.docx',
        target: '05-Prototype-Test-Plan.docx',
        description:
          'Three-user prototype test plan with permitted test data, acceptance criteria, failure modes, reviewer checks, and final decision.',
      },
      {
        source: 'kit-assets/banker-builder-brief-kit/Launch-And-Handoff-Checklist.docx',
        target: '06-Launch-And-Handoff-Checklist.docx',
        description:
          'Launch and handoff checklist for owner, backup owner, access, support, version, review date, evidence, retention, pause triggers, and kill switch.',
      },
      {
        source: 'kit-assets/banker-builder-brief-kit/Safe-First-Builds-Menu.pdf',
        target: '07-Safe-First-Builds-Menu.pdf',
        description:
          'Curated menu of low-risk first builds such as job-aid builders, handoff summaries, review checklists, evidence packets, training scenarios, and issue trackers.',
      },
      {
        source: 'kit-assets/banker-builder-brief-kit/Builder-Brief-Copy-Paste-Template.txt',
        target: '08-Builder-Brief-Copy-Paste-Template.txt',
        description:
          'Plain-text copy/paste pattern for moving the final Builder Brief into an internal ticket, review packet, or handoff note.',
      },
      {
        source: 'template-ai-workflow-sop.pdf',
        target: '09-Workflow-SOP-Next-Step.pdf',
        description:
          'Downstream SOP template for documenting approved AI-assisted workflows before repeatable team use.',
      },
      {
        source: 'operations-playbook.pdf',
        target: '10-Operations-AI-Workflow-Kit.pdf',
        description:
          'Operations playbook context for turning a useful shortcut into something someone else can run, review, measure, and hand off.',
      },
      {
        source: 'red-yellow-green-use-card.pdf',
        target: '11-Red-Yellow-Green-AI-Use-Card.pdf',
        description:
          'Risk classification reference for allowed, review-required, and prohibited AI use cases.',
      },
      {
        source: 'infosec-playbook.pdf',
        target: '12-InfoSec-AI-Control-Plane-Kit.pdf',
        description:
          'InfoSec reference for routing, inspecting, logging, gating, and governing AI traffic before shadow AI becomes architecture.',
      },
      {
        source: 'kit-assets/banker-builder-brief-kit/Design-Dev-Handoff-Brief.docx',
        target: '13-Design-Dev-Handoff-Brief.docx',
        description:
          'Scrubbed designer/developer handoff brief for the future interactive Builder Brief experience.',
      },
    ],
  },
  'prompting-foundation-kit': {
    title: 'The AI Prompting Foundation Kit',
    lede:
      'Turn a vague AI request into a safe, structured, reviewable banker prompt with placeholders, output format, and human review.',
    forWhom:
      'For bankers, managers, analysts, trainers, marketers, lenders, operations teams, and compliance reviewers who want useful AI support without leaking sensitive data, skipping review, or letting AI make decisions.',
    startHereName: '00-Start-Here.pdf',
    steps: [
      'Read the Prompting Foundation Guide and teach the Banker Prompt Formula.',
      'Use the Placeholder Card before anyone pastes source material into an AI tool.',
      'Open /resources/prompting-foundation to assemble a prompt from structured fields.',
      'Use the Prompt Library for role-specific examples, then adapt with placeholders.',
      'Complete the Output Review Checklist before output moves downstream.',
      'If a prompt becomes repeatable team practice, move it into the Reusable AI Working Brief and then the Workflow SOP Builder.',
    ],
    assets: [
      {
        source: 'prompting-foundation-guide.pdf',
        target: '01-Prompting-Foundation-Guide.pdf',
        description:
          'Foundation guide for prompt types, safe placeholders, output formats, Green/Yellow/Red lanes, examples, and review habits.',
      },
      {
        source: 'banker-prompt-formula-card.pdf',
        target: '02-Banker-Prompt-Formula-Card.pdf',
        description:
          'One-page prompt formula reference: role, task, source, constraints, output, verify, and escalate.',
      },
      {
        source: 'safe-prompt-placeholder-card.pdf',
        target: '03-Safe-Prompt-Placeholder-Card.pdf',
        description:
          'Reference card for replacing customer, account, transaction, complaint, credit, BSA/AML, and security details before prompting.',
      },
      {
        source: 'prompt-output-review-checklist.pdf',
        target: '04-Prompt-Output-Review-Checklist.pdf',
        description:
          'Checklist for verifying source accuracy, placeholder use, [VERIFY] items, review ownership, escalation, and retained evidence before downstream use.',
      },
      {
        source: 'kit-assets/prompting-foundation-kit/Prompt-Library.docx',
        target: '05-Prompt-Library.docx',
        description:
          'Editable role-specific prompt examples for retail, operations, marketing, lending, BSA/AML, compliance, training, and executive use.',
      },
      {
        source: 'kit-assets/prompting-foundation-kit/Reusable-AI-Working-Brief.docx',
        target: '06-Reusable-AI-Working-Brief.docx',
        description:
          'Editable working brief for turning a useful one-off prompt into a shared team prompt with owner, reviewer, data boundary, escalation, and evidence fields.',
      },
      {
        source: 'kit-assets/prompting-foundation-kit/Reusable-AI-Working-Brief-Copy-Paste.txt',
        target: '07-Reusable-AI-Working-Brief-Copy-Paste.txt',
        description:
          'Plain-text copy/paste template for moving the prompt brief into an internal ticket, toolkit entry, or SOP draft.',
      },
      {
        source: 'template-ai-workflow-sop.pdf',
        target: '08-Workflow-SOP-Next-Step.pdf',
        description:
          'Downstream SOP template for documenting approved AI-assisted workflows before repeatable team use.',
      },
      {
        source: 'safe-ai-use-checklist.pdf',
        target: '09-Before-You-Paste-Safe-AI-Checklist.pdf',
        description:
          'Four safe-use habits that sit underneath the prompt foundation: strip sensitive data, ask clearly, fact-check, and escalate.',
      },
      {
        source: 'red-yellow-green-use-card.pdf',
        target: '10-Red-Yellow-Green-AI-Use-Card.pdf',
        description:
          'Risk classification reference for allowed, review-required, and prohibited AI use cases.',
      },
      {
        source: 'kit-assets/prompting-foundation-kit/Prompting-Foundation-Design-Dev-Brief.docx',
        target: '11-Design-Dev-Handoff-Brief.docx',
        description:
          'Designer/developer handoff brief for the Prompting Foundation product, prompt builder flow, data model, and acceptance criteria.',
      },
    ],
  },
  'frontline-enablement-kit': {
    title: 'The Frontline AI Enablement Kit',
    lede: 'Desk cards, prompts, and manager tools for safer branch and contact-center AI use.',
    forWhom:
      'For branch managers, contact-center leaders, training teams, and frontline staff who need to reduce typing, improve follow-up, coach faster, and protect customer data without turning AI into the banker.',
    startHereName: '00-Start-Here.pdf',
    steps: [
      'Give every teammate the Frontline Data Handling Card.',
      'Train the four Before-You-Paste Safe AI habits.',
      'Use the Prompt Strategy Cheat Sheet for first drafts and [VERIFY] checks.',
      'Managers use the Retail Branch Manager Guide to pick one frontline workflow.',
      'Save approved prompts, outputs, reviews, and rollout decisions into the branch toolkit.',
    ],
    assets: [
      { source: 'artifact-data-handling-reference-card.pdf', target: '01-Frontline-Data-Handling-Card.pdf', description: 'Desk boundary card for what frontline teams can and cannot put into AI tools.' },
      { source: 'safe-ai-use-checklist.pdf', target: '02-Before-You-Paste-Safe-AI-Checklist.pdf', description: 'The four staff habits: strip sensitive data, ask clearly, fact-check, and escalate risky decisions.' },
      { source: 'prompt-strategy-cheat-sheet.pdf', target: '03-Prompt-Strategy-Cheat-Sheet.pdf', description: 'Prompt pattern for safe, useful, reviewable AI output.' },
      { source: 'retail-playbook.pdf', target: '04-Retail-Branch-Manager-Guide.pdf', description: 'Manager guide for choosing, reviewing, and scaling frontline AI workflows.' },
      { source: 'kit-assets/frontline-enablement-kit/Branch-Style-Brief-Template.docx', target: '05-Branch-Style-Brief-Template.docx', description: 'Editable branch tone, phrase, empathy, escalation, and compliance reminder template.' },
      { source: 'kit-assets/frontline-enablement-kit/First-Draft-Reply-Library.docx', target: '06-First-Draft-Reply-Library.docx', description: 'Editable starter patterns for document requests, appointment follow-ups, service recovery, status updates, branch closures, card delays, and check-hold explanations.' },
      { source: 'kit-assets/frontline-enablement-kit/Procedure-to-Job-Aid-Prompt.docx', target: '07-Procedure-to-Job-Aid-Prompt.docx', description: 'Prompt template for turning approved procedures into frontline job aids without inventing policy.' },
      { source: 'kit-assets/frontline-enablement-kit/Branch-Coaching-Scenario-Pack.docx', target: '08-Branch-Coaching-Scenario-Pack.docx', description: 'Fictional coaching scenarios by difficulty level with manager questions and escalation prompts.' },
      { source: 'kit-assets/frontline-enablement-kit/Customer-Voice-Report-Template.docx', target: '09-Customer-Voice-Report-Template.docx', description: 'Template for de-identified complaint themes, FAQ clusters, branch friction, and call-center patterns.' },
      { source: 'kit-assets/frontline-enablement-kit/Retail-AI-Evidence-Packet.docx', target: '10-Retail-AI-Evidence-Packet.docx', description: 'Evidence packet for use case, approved prompt, data class, output, reviewer, final version, retention location, and metric.' },
      { source: 'kit-assets/frontline-enablement-kit/30-Day-Frontline-Rollout-Tracker.xlsx', target: '11-30-Day-Frontline-Rollout-Tracker.xlsx', description: 'Editable manager tracker for data boundary, first-draft replies, coaching scenarios, customer-signal reporting, and scale decision.' },
    ],
  },
  'lending-review-kit': {
    title: 'The Lending AI Review Kit',
    lede: 'Four tools to review AI-assisted credit workflows before they touch decisions, adverse action, or customer-facing explanations.',
    forWhom:
      'For lending, credit, and compliance teams reviewing one AI-assisted workflow and proving the decision stayed human, explainable, fair-lending aware, and file-supported.',
    startHereName: '00-Start-Here.pdf',
    steps: [
      'Choose one lending AI workflow and log it in the Lending AI Use-Case Register.',
      'Run the fair-lending and adverse-action review before reuse.',
      'Complete the Principal Reason Traceability Table whenever adverse-action language is involved.',
      'Document the workflow in the Lending Workflow SOP Template.',
      'Save the Decision Packet Evidence Index with source documents, AI output, reviewer edits, approval, final notice, and retention location.',
    ],
    assets: [
      { source: 'lending-playbook.pdf', target: '01-Lending-AI-Control-Playbook.pdf', description: 'Context guide for safe lending AI controls, adverse-action support, decision packets, and human accountability.' },
      { source: 'kit-assets/lending-review-kit/Lending-AI-Use-Case-Register.xlsx', target: '02-Lending-AI-Use-Case-Register.xlsx', description: 'Editable lending register with product line, decision influence, adverse-action involvement, customer-facing output, principal-reason traceability, review requirements, and packet location.' },
      { source: 'artifact-fair-lending-ai-review-checklist.pdf', target: '03-Fair-Lending-AI-Review-Checklist.pdf', description: 'Reviewer checklist for AI-assisted credit workflows, adverse-action explainability, protected-basis outcome-gap monitoring, proxy risk, and recurring review.' },
      { source: 'artifact-fair-lending-ai-review-worksheet.xlsx', target: '04-Fair-Lending-AI-Review-Worksheet.xlsx', description: 'Editable worksheet for population, sample, protected bases, proxy methodology, baseline, materiality threshold, remediation owner, adverse-action review, and next review date.' },
      { source: 'kit-assets/lending-review-kit/Principal-Reason-Traceability-Table.xlsx', target: '05-Principal-Reason-Traceability-Table.xlsx', description: 'Trace each principal reason to source file evidence, human reviewer, AI draft use, unsupported language removal, final language, and retention location.' },
      { source: 'kit-assets/lending-review-kit/Adverse-Action-AI-Review-Log.xlsx', target: '06-Adverse-Action-AI-Review-Log.xlsx', description: 'Track each AI-assisted adverse-action drafting or review instance with reviewer, notice location, exception, and escalation notes.' },
      { source: 'kit-assets/lending-review-kit/Lending-Workflow-SOP-Template.docx', target: '07-Lending-Workflow-SOP-Template.docx', description: 'Editable lending-native SOP for approved tool, allowed inputs, prohibited inputs, AI may/may-not boundaries, review, evidence, and current model-risk source language.' },
      { source: 'kit-assets/lending-review-kit/Decision-Packet-Evidence-Index.docx', target: '08-Decision-Packet-Evidence-Index.docx', description: 'Checklist for source documents, AI output, reviewer edits, final memo or notice, approval, and retention location.' },
    ],
  },
  'marketing-review-kit': {
    title: 'The Bank Marketing AI Review Kit',
    lede: 'Draft faster. Verify every claim. Review every disclosure. Retain every campaign decision.',
    forWhom:
      'For marketing, product, compliance, and review teams that need campaign briefs, claim source support, disclosure checks, segment approval, compliance sign-off, and retained evidence before AI-assisted copy goes live.',
    startHereName: '00-Start-Here.pdf',
    steps: [
      'Choose one campaign and complete the Campaign Intake Form before prompting.',
      'Draft with the Bank Marketing Prompt Cheat Sheet using only approved source terms.',
      'Run claims, disclosures, channel, and segment review before approval.',
      'Save the Campaign Evidence Packet with source terms, AI draft, edits, approvals, final copy, send date, audience, metrics, complaint flags, and retention location.',
      'Keep the AI Use Policy Starter as governance appendix material, not the headline workflow.',
    ],
    assets: [
      {
        source: 'marketing-playbook.pdf',
        target: '01-Marketing-AI-Playbook.pdf',
        description:
          'Context guide for campaign controls, marketing red lines, source support, disclosure review, and evidence retention.',
      },
      {
        source: 'kit-assets/marketing-review-kit/Marketing-Prompt-Cheat-Sheet.pdf',
        target: '02-Marketing-Prompt-Cheat-Sheet.pdf',
        description:
          'Marketing-specific prompt patterns for product campaigns, deposit education, social posts, segment variants, disclosure review, and executive reporting.',
      },
      {
        source: 'kit-assets/marketing-review-kit/Campaign-Intake-Form.docx',
        target: '03-Campaign-Intake-Form.docx',
        description:
          'Editable intake form for campaign owner, audience, channel, approved source terms, claims, compliance reviewer, and evidence location.',
      },
      {
        source: 'kit-assets/marketing-review-kit/Marketing-Claim-Control-Matrix.xlsx',
        target: '04-Marketing-Claim-Control-Matrix.xlsx',
        description:
          'Editable claim register for claim, offer term, source document, product owner, disclosure requirement, reviewer, approval date, and final copy location.',
      },
      {
        source: 'kit-assets/marketing-review-kit/AI-Marketing-Review-Checklist.docx',
        target: '05-AI-Marketing-Review-Checklist.docx',
        description:
          'Pre-publication review checklist with Reg DD, Reg Z, CAN-SPAM, Reg B discouragement, and Fair Housing checkpoints.',
      },
      {
        source: 'kit-assets/marketing-review-kit/Segment-Approval-Log.xlsx',
        target: '06-Segment-Approval-Log.xlsx',
        description:
          'Editable log for campaign audience, selection basis, credit/deposit targeting, excluded-group review, reviewer, approval date, and evidence location.',
      },
      {
        source: 'kit-assets/marketing-review-kit/Channel-Review-Grid.xlsx',
        target: '07-Channel-Review-Grid.xlsx',
        description:
          'Channel-by-channel grid for copy assets, source checks, disclosure checks, audience/consent review, approval status, and final asset location.',
      },
      {
        source: 'kit-assets/marketing-review-kit/Campaign-Evidence-Packet.docx',
        target: '08-Campaign-Evidence-Packet.docx',
        description:
          'Evidence packet for campaign brief, source terms, AI draft, edits, approval, final copy, send date, audience, metrics, complaint flags, and retention location.',
      },
      {
        source: 'kit-assets/marketing-review-kit/AI-Campaign-Workflow-SOP.docx',
        target: '09-AI-Campaign-Workflow-SOP.docx',
        description:
          'Marketing-specific workflow SOP for choosing the campaign, verifying source terms, drafting with AI, reviewing claims/disclosures, approving audience, and retaining evidence.',
      },
      {
        source: 'template-ai-use-policy-starter.pdf',
        target: '10-Governance-Appendix-AI-Use-Policy-Starter.pdf',
        description: 'Governance appendix policy starter for tool, data, review, incident, and ownership rules.',
      },
    ],
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchToBuffer(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function kitAssets(kit) {
  if (kit.assets) return kit.assets;

  return [
    ...kit.pdfs.map(([source, description]) => ({ source, target: source, description })),
    ...(kit.files ?? []).map(([source, description]) => ({ source, target: source, description })),
    ...kit.markdowns.map(([source, description]) => ({
      source: `public/artifacts/${source}`,
      target: source,
      description,
    })),
  ];
}

function renderStartHereHtml(kitSlug, kit) {
  const items = kitAssets(kit)
    .map(({ target, description }) => `<li><strong>${target}</strong><br><span class="d">${description}</span></li>`)
    .join('');
  const steps = (kit.steps ?? [
    'Read this page first.',
    'Read the playbook PDF for context.',
    'Adapt the template and inventory files to your institution.',
    'Replace anything in [brackets] before adoption.',
  ])
    .map((step) => `<li>${step}</li>`)
    .join('');

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><title>${kit.title} — Start here</title>
<link rel="stylesheet" href="file://${SRC_HTML_DIR}/_brand.css">
<style>
  .page { padding: 0; }
  .cover { padding: 0.9in 0.85in; }
  .kit-body { padding: 0.52in 0.85in; }
  .kit-body h2 { margin: 0 0 5pt; font-size: 18pt; }
  .kit-body p { margin: 5pt 0 11pt; font-size: 10.6pt; color: #475569; }
  .kit-body ol { padding-left: 16pt; font-size: 10.1pt; line-height: 1.42; color: #475569; }
  .kit-body ol > li { margin: 5pt 0; }
  .asset-list { columns: 2; column-gap: 24pt; }
  .asset-list > li { break-inside: avoid; }
  .steps-list { columns: 1; }
  .kit-body strong { color: #071A2F; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10pt; }
  .kit-body .d { display: block; margin-top: 2pt; }
</style></head>
<body>
  <section class="page cover">
    <div class="kicker">${kit.title.toUpperCase()}</div>
    <h1>Start here.</h1>
    <p class="lede">${kit.lede}</p>
    <div class="seal">
      <div class="seal-mark"><span class="bk">[</span><span class="ai">A</span><span class="si">i</span><span class="bk">]</span></div>
      <div class="seal-text">
        <div class="seal-name">The AI Banking Institute</div>
        <div class="seal-tag">Turning Bankers into Builders</div>
      </div>
    </div>
  </section>
  <section class="page kit-body">
    <h2>Inside this kit</h2>
    <p>${kit.forWhom}</p>
    <ol class="asset-list">${items}</ol>
    <h2 style="margin-top:28pt">How to use this kit</h2>
    <ol class="steps-list">${steps}</ol>
  </section>
</body></html>`;
}

function renderReadmeMd(kit) {
  const lines = [
    `# ${kit.title}`,
    '',
    `${kit.lede}`,
    '',
    `${kit.forWhom}`,
    '',
    '## Included files',
    '',
    ...kitAssets(kit).map(({ target, description }) => `- \`${target}\` — ${description}`),
    '',
    '## Recommended first step',
    '',
    `Open \`${kit.startHereName ?? 'START-HERE.pdf'}\` first.`,
    '',
    '## Use sequence',
    '',
    ...((kit.steps ?? ['Read this page first.']).map((step, index) => `${index + 1}. ${step}`)),
    '',
  ];
  return lines.join('\n');
}

// ── Build ──────────────────────────────────────────────────────────────────

async function buildKit(browser, kitSlug, kit) {
  console.log(`\n▸ ${kitSlug}`);
  const kitWork = resolve(WORK_DIR, kitSlug);
  await mkdir(kitWork, { recursive: true });

  // 1. Assets — prefer committed artifacts, then fall back to production for PDFs.
  const seen = new Set();
  for (const { source, target } of kitAssets(kit)) {
    if (seen.has(target)) continue;
    seen.add(target);
    const sourcePath = source.startsWith('public/')
      ? resolve(ROOT, source)
      : resolve(OUT_DIR, source);
    const slug = source.split('/').pop().replace(/\.pdf$/, '');
    const url = `${BASE}/api/resources/${slug}/download`;
    process.stdout.write(`  file ${target} ... `);
    let buf;
    try {
      buf = await readFile(sourcePath);
    } catch {
      if (!source.endsWith('.pdf')) throw new Error(`missing kit asset ${sourcePath}`);
      buf = await fetchToBuffer(url);
    }
    await writeFile(resolve(kitWork, target), buf);
    console.log(`${buf.length.toLocaleString()}b`);
  }

  // 2. README.md
  process.stdout.write(`  doc  README.md ... `);
  const readme = renderReadmeMd(kit);
  await writeFile(resolve(kitWork, 'README.md'), readme);
  console.log(`${Buffer.byteLength(readme).toLocaleString()}b`);

  // 3. START-HERE.pdf — Playwright render
  const startHereName = kit.startHereName ?? 'START-HERE.pdf';
  process.stdout.write(`  doc  ${startHereName} ... `);
  const html = renderStartHereHtml(kitSlug, kit);
  const tmpHtml = resolve(kitWork, '_start-here.html');
  await writeFile(tmpHtml, html);
  const page = await browser.newContext().then((c) => c.newPage());
  await page.goto('file://' + tmpHtml, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  const pdf = await page.pdf({
    format: 'Letter',
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
    printBackground: true,
  });
  await writeFile(resolve(kitWork, startHereName), pdf);
  console.log(`${pdf.length.toLocaleString()}b`);
  await page.close();

  // 4. Bundle ZIP via the system `zip` command — no JS dep needed.
  const zipPath = resolve(OUT_DIR, `${kitSlug}.zip`);
  process.stdout.write(`  zip  → ${zipPath.replace(ROOT + '/', '')} ... `);
  await rm(zipPath, { force: true });
  await rm(resolve(kitWork, '_start-here.html'), { force: true });
  const fileList = [
    startHereName,
    ...kitAssets(kit).map(({ target }) => target),
    'README.md',
  ];
  execFileSync('zip', ['-9j', zipPath, ...fileList.map((f) => resolve(kitWork, f))], {
    stdio: 'pipe',
  });
  const { size } = await stat(zipPath);
  console.log(`${size.toLocaleString()}b`);
  return { kitSlug, size };
}

async function uploadKit(kitSlug) {
  const name = `${kitSlug}.zip`;
  process.stdout.write(`  upload ${name} ... `);
  try {
    execFileSync('supabase', ['storage', 'rm', `ss:///resources/${name}`, '--linked', '--experimental', '--yes'], { stdio: 'pipe' });
  } catch {
    // ok if not present
  }
  execFileSync(
    'supabase',
    ['storage', 'cp', `public/downloads/${name}`, `ss:///resources/${name}`, '--linked', '--experimental'],
    { stdio: 'pipe' },
  );
  console.log('ok');
}

async function main() {
  await mkdir(WORK_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });
  const upload = process.argv.includes('--upload');
  const onlyIndex = process.argv.indexOf('--only');
  const only = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : null;
  if (only && !KITS[only]) {
    throw new Error(`Unknown kit slug for --only: ${only}`);
  }
  const browser = await chromium.launch();
  const built = [];
  for (const [slug, def] of Object.entries(KITS).filter(([slug]) => !only || slug === only)) {
    built.push(await buildKit(browser, slug, def));
  }
  await browser.close();
  if (upload) {
    console.log('\n▸ uploading to Supabase Storage');
    for (const { kitSlug } of built) {
      await uploadKit(kitSlug);
    }
  }
  console.log(`\n✓ ${built.length} kits built${upload ? ' + uploaded' : ''}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
