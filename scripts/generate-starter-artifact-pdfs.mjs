// Render the eight post-assessment starter artifacts in
// content/assessments/v2/starter-artifacts.ts to branded PDFs in
// public/downloads/starter-artifacts/<dimension>.pdf.
//
// Why: /api/assessment/starter-artifact/[dimension] serves these committed
// PDFs verbatim. The react-pdf component that originally produced them
// (src/lib/pdf/StarterArtifactDocument.tsx) was removed as orphaned, which
// left the PDFs frozen and drifting from their source. starter-artifacts.ts
// is the source of truth; re-run this script whenever it changes.
//
// Styling comes from the shared brand shell, public/downloads/source/_brand.css,
// inlined into each page so no dev server or file:// base URL is required.
//
// Usage (tsx is needed to import the TypeScript content module):
//   npx tsx scripts/generate-starter-artifact-pdfs.mjs
//   npx tsx scripts/generate-starter-artifact-pdfs.mjs --only leadership-buy-in,security-posture

import { chromium } from '@playwright/test';
import { marked } from 'marked';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getStarterArtifact } from '../content/assessments/v2/starter-artifacts.ts';
import { DIMENSION_LABELS } from '../content/assessments/v2/types.ts';

const ROOT = process.cwd();
const BRAND_CSS_PATH = resolve(ROOT, 'public/downloads/source/_brand.css');
const OUT_DIR = resolve(ROOT, 'public/downloads/starter-artifacts');

// Artifact-specific layer on top of _brand.css: a compact masthead instead of
// the full-bleed cover page (these are one- to two-page handouts), and
// blockquotes styled as the copy-paste prompt block.
const ARTIFACT_STYLES = `
.masthead {
  background: var(--ink); color: #fff;
  border-radius: 16pt; border-bottom: 4pt solid var(--gold);
  padding: 22pt 24pt 20pt; margin: 0 0 18pt;
}
.masthead .seal-mark {
  display: inline-flex; align-items: baseline; line-height: 1;
  font-family: "Inter", -apple-system, sans-serif;
  font-weight: 600; font-size: 13pt; letter-spacing: -.012em; color: var(--cream);
}
.masthead .seal-mark .bk { color: var(--gold); font-weight: 500; padding: 0 .03em; }
.masthead .seal-mark .ai { padding: 0 0 0 .02em; }
.masthead .seal-mark .si {
  font-family: "Instrument Serif", Georgia, serif;
  font-style: italic; font-weight: 400; font-size: 1.14em;
  line-height: 0; margin: 0 .005em 0 -.04em; color: inherit;
}
.masthead .seal-mark .full { margin-left: .32em; }
.masthead .kicker {
  margin-top: 14pt; font-size: 8pt; letter-spacing: 1.8px; text-transform: uppercase;
  color: var(--gold-soft); font-weight: 600;
}
.masthead h1 { margin: 6pt 0 6pt; font-size: 21pt; line-height: 1.15; font-weight: 700; letter-spacing: -0.3px; }
.masthead .lede { margin: 0; font-size: 11pt; color: #D8E0EA; }
.page h2 {
  font-size: 13pt; margin: 18pt 0 6pt; padding-bottom: 4pt;
  border-bottom: 1px solid var(--slate-200);
}
.page blockquote {
  background: var(--cream); border-left: 3pt solid var(--gold);
  border-radius: 12pt; margin: 10pt 0; padding: 10pt 14pt;
  break-inside: avoid; page-break-inside: avoid;
}
.page blockquote p { color: var(--ink); margin: 0; }
.page code {
  background: var(--cream); color: var(--ink); border-radius: 3pt; padding: 1pt 4pt;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9.5pt;
}
.nowrap { white-space: nowrap; }
.legal { margin-top: 20pt; font-size: 8pt; color: var(--slate-500); }
`;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// The masthead already shows the title, so drop the body's leading "# Title".
function stripLeadingH1(md) {
  return md.replace(/^#\s+.+?(\r?\n+)/, '');
}

// Keep regulatory codes like "SR 26-2" on one line; a break at the hyphen
// reads badly and splits the token for text extraction and claims checks.
function keepCitationCodesTogether(html) {
  return html.replace(/\bSR \d+-\d+\b/g, (code) => `<span class="nowrap">${code}</span>`);
}

function pageHtml({ brandCss, title, subtitle, contentHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)} - The AI Banking Institute</title>
<style>${brandCss}
${ARTIFACT_STYLES}</style>
</head>
<body>
  <section class="page">
    <header class="masthead">
      <span class="seal-mark"><span class="bk">[</span><span class="ai">A</span><span class="si">i</span><span class="bk">]</span><span class="full">Banking Institute</span></span>
      <div class="kicker">Starter artifact · AI Readiness Assessment</div>
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(subtitle)}</p>
    </header>
    ${contentHtml}
    <p class="legal">© 2026 The AI Banking Institute · For internal use at your institution. · AIBankingInstitute.com</p>
  </section>
</body>
</html>`;
}

function parseOnlyArg(argv) {
  const idx = argv.indexOf('--only');
  if (idx === -1) return null;
  return (argv[idx + 1] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const brandCss = await readFile(BRAND_CSS_PATH, 'utf8');

  const allDimensions = Object.keys(DIMENSION_LABELS);
  const only = parseOnlyArg(process.argv);
  const unknown = (only ?? []).filter((d) => !allDimensions.includes(d));
  if (unknown.length > 0) {
    throw new Error(`Unknown dimension(s): ${unknown.join(', ')}. Valid: ${allDimensions.join(', ')}`);
  }
  const dimensions = only ?? allDimensions;

  // PW_EXECUTABLE_PATH: render against a specific pre-installed Chromium when
  // the bundled browser version differs from the @playwright/test pin.
  const browser = await chromium.launch(
    process.env.PW_EXECUTABLE_PATH ? { executablePath: process.env.PW_EXECUTABLE_PATH } : {},
  );
  const page = await (await browser.newContext()).newPage();

  for (const dimension of dimensions) {
    const { title, subtitle, body } = getStarterArtifact(dimension);
    const contentHtml = keepCitationCodesTogether(
      marked.parse(stripLeadingH1(body), { async: false }),
    );
    await page.setContent(pageHtml({ brandCss, title, subtitle, contentHtml }), {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });
    const out = resolve(OUT_DIR, `${dimension}.pdf`);
    await writeFile(out, pdf);
    process.stdout.write(`✓ ${dimension}: ${pdf.length.toLocaleString()}b → ${out.replace(ROOT + '/', '')}\n`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error('Starter artifact PDF generation failed:', err);
  process.exit(1);
});
