// generate-kit-zips.mjs — rebuild the 4 downloadable kit ZIPs in brand v1.
//
// Each kit ZIP bundles brand-v1 PDFs + a per-kit START-HERE.pdf
// (regenerated brand v1) + a README.md. Core kit assets ship as PDFs so the
// public downloads are branded, readable, and consistent.
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
    title: 'Governance Starter Kit',
    lede: 'First 30 days of governing AI tool use.',
    forWhom:
      'For compliance, risk, and executive teams establishing the first approved AI path: rules, staff safety, use-case inventory, and workflow documentation.',
    pdfs: [
      ['safe-ai-use-checklist.pdf',          'Staff-facing habits before using AI: strip data, ask clearly, fact-check, escalate.'],
      ['red-yellow-green-use-card.pdf',      'Ten-second classification card for safe, review-required, and prohibited AI uses.'],
      ['artifact-ai-use-case-inventory.pdf', 'Fillable AI use-case register with owners, data classes, vendor controls, risk tiers, and review cadence.'],
      ['template-ai-workflow-sop.pdf',       'Template for documenting tool, input, output, review, approval, and retention.'],
    ],
    markdowns: [],
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
      ['artifact-fair-lending-ai-review-checklist.pdf', 'Reviewer checklist for fair-lending and disparate-impact concerns on AI-assisted decisions.'],
      ['artifact-ai-use-case-inventory.pdf', 'Fillable AI use-case register with owners, data classes, vendor controls, risk tiers, and review cadence.'],
      ['template-ai-workflow-sop.pdf',       'Template for documenting tool, input, output, review, approval, and retention.'],
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

function renderStartHereHtml(kitSlug, kit) {
  const items = [
    ...kit.pdfs.map(([f, d]) => `<li><strong>${f}</strong><br><span class="d">${d}</span></li>`),
    ...kit.markdowns.map(([f, d]) => `<li><strong>${f}</strong><br><span class="d">${d}</span></li>`),
  ].join('');
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><title>${kit.title} — Start here</title>
<link rel="stylesheet" href="file://${SRC_HTML_DIR}/_brand.css">
<style>
  .page { padding: 0; }
  .cover { padding: 0.9in 0.85in; }
  .kit-body { padding: 0.6in 0.85in; }
  .kit-body h2 { margin: 0 0 6pt; font-size: 18pt; }
  .kit-body p { margin: 6pt 0 14pt; font-size: 11pt; color: #475569; }
  .kit-body ol { padding-left: 16pt; font-size: 10.5pt; line-height: 1.55; color: #475569; }
  .kit-body ol > li { margin: 8pt 0; }
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
    <ol>${items}</ol>
    <h2 style="margin-top:28pt">How to use this kit</h2>
    <p>Read this page first. Then read the playbook PDF for context. Then adapt the template and inventory files to your institution — replace anything in [brackets] before adoption.</p>
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
    ...kit.pdfs.map(([f, d]) => `- \`${f}\` — ${d}`),
    ...kit.markdowns.map(([f, d]) => `- \`${f}\` — ${d}`),
    '',
    '## Recommended first step',
    '',
    'Open `START-HERE.pdf` first.',
    '',
  ];
  return lines.join('\n');
}

// ── Build ──────────────────────────────────────────────────────────────────

async function buildKit(browser, kitSlug, kit) {
  console.log(`\n▸ ${kitSlug}`);
  const kitWork = resolve(WORK_DIR, kitSlug);
  await mkdir(kitWork, { recursive: true });

  // 1. PDFs — prefer committed artifacts, then fall back to production.
  const seen = new Set();
  for (const [filename] of kit.pdfs) {
    if (seen.has(filename)) continue;
    seen.add(filename);
    const slug = filename.replace(/\.pdf$/, '');
    const url = `${BASE}/api/resources/${slug}/download`;
    process.stdout.write(`  pdf  ${filename} ... `);
    let buf;
    try {
      buf = await readFile(resolve(OUT_DIR, filename));
    } catch {
      buf = await fetchToBuffer(url);
    }
    await writeFile(resolve(kitWork, filename), buf);
    console.log(`${buf.length.toLocaleString()}b`);
  }

  // 2. Markdowns — copy from public/artifacts
  for (const [filename] of kit.markdowns) {
    process.stdout.write(`  md   ${filename} ... `);
    const buf = await readFile(resolve(ROOT, 'public/artifacts', filename));
    await writeFile(resolve(kitWork, filename), buf);
    console.log(`${buf.length.toLocaleString()}b`);
  }

  // 3. README.md
  process.stdout.write(`  doc  README.md ... `);
  const readme = renderReadmeMd(kit);
  await writeFile(resolve(kitWork, 'README.md'), readme);
  console.log(`${Buffer.byteLength(readme).toLocaleString()}b`);

  // 4. START-HERE.pdf — Playwright render
  process.stdout.write(`  doc  START-HERE.pdf ... `);
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
  await writeFile(resolve(kitWork, 'START-HERE.pdf'), pdf);
  console.log(`${pdf.length.toLocaleString()}b`);
  await page.close();

  // 5. Bundle ZIP via the system `zip` command — no JS dep needed.
  const zipPath = resolve(OUT_DIR, `${kitSlug}.zip`);
  process.stdout.write(`  zip  → ${zipPath.replace(ROOT + '/', '')} ... `);
  await rm(zipPath, { force: true });
  await rm(resolve(kitWork, '_start-here.html'), { force: true });
  const fileList = [
    ...kit.pdfs.map(([f]) => f),
    ...kit.markdowns.map(([f]) => f),
    'START-HERE.pdf',
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
  const browser = await chromium.launch();
  const built = [];
  for (const [slug, def] of Object.entries(KITS)) {
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
