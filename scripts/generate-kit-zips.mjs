// generate-kit-zips.mjs — rebuild the 4 downloadable kit ZIPs in brand v1.
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
//   node scripts/generate-kit-zips.mjs               # build all 4
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
  'frontline-enablement-kit': {
    title: 'Frontline Enablement Kit',
    lede: 'What every branch and contact-center teammate needs at their desk.',
    forWhom:
      'For retail, branch, and contact center teams using AI to reduce typing, improve follow-up, summarize calls, and coach staff without exposing customer data.',
    pdfs: [
      ['retail-playbook.pdf',                'Role playbook for safe frontline AI use: summaries, replies, coaching, training, and customer signal.'],
      ['safe-ai-use-checklist.pdf',          'Staff-facing safety habits before using any AI tool.'],
      ['prompt-strategy-cheat-sheet.pdf',    'Prompt pattern for useful, safe, reviewable AI output.'],
      ['artifact-data-handling-reference-card.pdf', 'Desk reference for what data can and cannot be used with AI tools.'],
    ],
    markdowns: [],
  },
  'lending-review-kit': {
    title: 'Lending Review Kit',
    lede: 'Reviewable AI for the lending desk.',
    forWhom:
      'For lending and credit teams reviewing AI-assisted denials, decisions, and adverse-action notices with documented human checks.',
    pdfs: [
      ['lending-playbook.pdf',               'Role playbook for safe lending AI use: adverse-action tuner, decision summaries, fair-lending pre-checks.'],
      ['artifact-fair-lending-ai-review-checklist.pdf', 'Reviewer checklist for AI-assisted credit decisions, protected-basis outcome-gap checks, adverse-action explainability, and recurring monitoring.'],
      ['artifact-ai-use-case-inventory.pdf', 'One-page AI use-case inventory card for owners, data classes, risk tiers, vendor controls, and review cadence.'],
      ['template-ai-workflow-sop.pdf',       'Template for documenting tool, input, output, review, approval, and retention.'],
    ],
    files: [
      ['artifact-fair-lending-ai-review-worksheet.xlsx', 'Editable testing worksheet for population, sample, protected bases, proxy methodology, baseline, materiality threshold, remediation owner, adverse-action review, and next review date.'],
      ['artifact-ai-use-case-inventory-spreadsheet.xlsx', 'Editable spreadsheet companion for maintaining owner, data class, risk tier, vendor status, human review, evidence retained, and next review date.'],
    ],
    markdowns: [],
  },
  'marketing-review-kit': {
    title: 'Marketing Review Kit',
    lede: 'Brand-safe, disclosure-clean AI marketing.',
    forWhom:
      'For marketing and member-service teams drafting campaigns, plain-language translations, and member communications with reviewer-friendly outputs.',
    pdfs: [
      ['marketing-playbook.pdf',             'Role playbook for safe marketing AI use: campaign briefs, disclosure review, plain-language translation.'],
      ['prompt-strategy-cheat-sheet.pdf',    'Prompt pattern for useful, safe, reviewable AI output.'],
      ['template-ai-workflow-sop.pdf',       'Template for documenting tool, input, output, review, approval, and retention.'],
      ['template-ai-use-policy-starter.pdf', 'Starter AI use policy a team can adapt in an afternoon.'],
    ],
    markdowns: [],
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
