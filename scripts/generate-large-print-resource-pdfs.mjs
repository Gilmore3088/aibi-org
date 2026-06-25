// Render selected source-backed resources to large-print PDFs.
//
// Source HTML remains the canonical content. This script applies a
// large-print stylesheet at render time and writes committed artifacts under
// public/downloads/large-print/<slug>.pdf.
//
// Usage:
//   node scripts/generate-large-print-resource-pdfs.mjs
//   node scripts/generate-large-print-resource-pdfs.mjs --only safe-ai-use-checklist,regulatory-cheatsheet

import { chromium } from '@playwright/test';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SOURCE_DIR = resolve(ROOT, 'public/downloads/source');
const OUT_DIR = resolve(ROOT, 'public/downloads/large-print');
const MANIFEST_PATH = resolve(ROOT, 'src/lib/resources/freeResources.manifest.json');
const LARGE_PRINT_CATEGORIES = new Set(['desk-card', 'artifact']);

const LARGE_PRINT_CSS = `
@page {
  size: Letter;
  margin: 0.72in;
  @bottom-left {
    content: "The AI Banking Institute";
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    font-size: 11pt;
    font-weight: 700;
    color: #475569;
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    font-size: 11pt;
    font-weight: 700;
    color: #475569;
  }
}
@page cover {
  margin: 0.72in;
  @bottom-left { content: "The AI Banking Institute"; }
  @bottom-right { content: counter(page) " / " counter(pages); }
}
html,
body {
  font-size: 16pt !important;
  line-height: 1.58 !important;
  color: #071A2F !important;
}
.cover {
  page: auto !important;
  width: auto !important;
  min-height: auto !important;
  padding: 0 !important;
  color: #071A2F !important;
  background: #ffffff !important;
  border-bottom: 5pt solid #C8A24A !important;
  page-break-after: always !important;
  break-after: page !important;
  display: block !important;
}
.cover .seal {
  margin-bottom: 20pt !important;
}
.cover .seal-name,
.cover .seal-tag,
.cover .kicker,
.cover .footer-row,
.page .section-kicker,
.callout .label,
.cite {
  font-size: 13pt !important;
  line-height: 1.45 !important;
}
.cover .seal-mark {
  color: #071A2F !important;
  font-size: 22pt !important;
}
.cover .seal-name,
.cover .seal-tag,
.cover .footer-row {
  color: #475569 !important;
}
.cover .kicker,
.page .section-kicker,
.callout .label {
  color: #9A7A2F !important;
  letter-spacing: 1px !important;
}
.cover h1 {
  color: #071A2F !important;
  font-size: 32pt !important;
  line-height: 1.08 !important;
  margin: 16pt 0 12pt !important;
}
.cover .lede {
  color: #334155 !important;
  font-size: 16pt !important;
  line-height: 1.5 !important;
  max-width: none !important;
}
.page {
  margin-top: 0 !important;
  page-break-before: always !important;
  break-before: page !important;
  page-break-after: auto !important;
}
.page h2 {
  font-size: 26pt !important;
  line-height: 1.14 !important;
  margin: 0 0 12pt !important;
}
.page h3 {
  font-size: 20pt !important;
  line-height: 1.25 !important;
  margin: 22pt 0 8pt !important;
}
.page h4 {
  font-size: 17pt !important;
  line-height: 1.3 !important;
}
.page p,
.page li,
.page td,
.page th,
.callout p,
.cite {
  font-size: 16pt !important;
  line-height: 1.58 !important;
}
.page ul,
.page ol {
  margin-left: 24pt !important;
}
.page li {
  margin: 8pt 0 !important;
}
.card-grid,
.two-col,
.vs {
  display: block !important;
}
.card,
.callout,
.role-card,
.threat,
.tier,
.two-col .card {
  border-radius: 10pt !important;
  padding: 14pt !important;
  margin: 14pt 0 !important;
  break-inside: auto !important;
}
.risk-band {
  border-radius: 10pt !important;
  padding: 14pt !important;
  margin: 14pt 0 !important;
  break-inside: avoid-page !important;
  page-break-inside: avoid !important;
}
table {
  display: none !important;
}
.lp-table {
  margin: 18pt 0 26pt !important;
}
.lp-table-note {
  margin: 0 0 12pt !important;
  color: #64748B !important;
  font-size: 14pt !important;
  line-height: 1.45 !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.8px !important;
}
.lp-table-group {
  border: 2pt solid #E2E8F0 !important;
  border-left: 5pt solid #C8A24A !important;
  border-radius: 12pt !important;
  padding: 12pt !important;
  margin: 0 0 14pt !important;
  background: #ffffff !important;
  break-inside: avoid-page !important;
  page-break-inside: avoid !important;
}
.lp-table-group h4 {
  margin: 0 0 10pt !important;
  color: #071A2F !important;
  font-size: 19pt !important;
  line-height: 1.18 !important;
}
.lp-table-cells {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 7pt 10pt !important;
}
.lp-table-cell {
  border-top: 1.5pt solid #E2E8F0 !important;
  padding: 6pt 0 0 !important;
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
.lp-table-cell-label {
  display: block !important;
  margin: 0 0 3pt !important;
  color: #9A7A2F !important;
  font-size: 11.5pt !important;
  font-weight: 800 !important;
  line-height: 1.35 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.7px !important;
}
.lp-table-cell-value {
  display: block !important;
  margin: 0 !important;
  color: #334155 !important;
  font-size: 13.5pt !important;
  line-height: 1.38 !important;
}
.footer,
.page-footer {
  display: none !important;
}
.signoff-block {
  display: none !important;
}
`;

function expectedLargePrintRoute(slug) {
  return `/api/resources/${slug}/large-print`;
}

async function loadSlugs() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  return manifest.resources
    .filter((resource) =>
      resource.status === 'public' &&
      LARGE_PRINT_CATEGORIES.has(resource.category) &&
      resource.download?.fileType === 'pdf' &&
      resource.variants?.word === `/api/resources/${resource.slug}/word` &&
      resource.variants?.largePrintPdf === expectedLargePrintRoute(resource.slug)
    )
    .map((resource) => resource.slug);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const allSlugs = await loadSlugs();
  const onlyArg = process.argv.includes('--only')
    ? process.argv[process.argv.indexOf('--only') + 1].split(',').map((slug) => slug.trim()).filter(Boolean)
    : null;
  const slugs = onlyArg ? allSlugs.filter((slug) => onlyArg.includes(slug)) : allSlugs;

  console.log(`Rendering ${slugs.length} large-print resource PDF(s)`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  for (const slug of slugs) {
    const htmlPath = resolve(SOURCE_DIR, `${slug}.html`);
    const url = pathToFileURL(htmlPath).href;
    process.stdout.write(`- ${slug} ... `);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    await reflowTablesForLargePrint(page);
    await page.addStyleTag({ content: LARGE_PRINT_CSS });
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
    });
    const out = resolve(OUT_DIR, `${slug}.pdf`);
    await writeFile(out, pdf);
    const { size } = await stat(out);
    process.stdout.write(`${size.toLocaleString()}b -> ${out.replace(ROOT + '/', '')}\n`);
  }

  await browser.close();
}

async function reflowTablesForLargePrint(page) {
  await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table'));
    for (const table of tables) {
      const headers = Array.from(table.querySelectorAll('thead th')).map((cell) =>
        (cell.textContent ?? '').replace(/\s+/g, ' ').trim(),
      );
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      if (headers.length === 0 || rows.length === 0) continue;

      const wrapper = document.createElement('div');
      wrapper.className = 'lp-table';

      const note = document.createElement('p');
      note.className = 'lp-table-note';
      note.textContent = 'Table reflowed for large print';
      wrapper.append(note);

      rows.forEach((row, index) => {
        const cells = Array.from(row.children).map((cell) =>
          (cell.textContent ?? '').replace(/\s+/g, ' ').trim(),
        );
        if (cells.every((cell) => cell.length === 0)) return;

        const group = document.createElement('section');
        group.className = 'lp-table-group';

        const heading = document.createElement('h4');
        heading.textContent = cells[0] || `Row ${index + 1}`;
        group.append(heading);

        const cellGrid = document.createElement('div');
        cellGrid.className = 'lp-table-cells';
        cells.slice(1).forEach((value, valueIndex) => {
          if (!value) return;

          const item = document.createElement('p');
          item.className = 'lp-table-cell';

          const label = document.createElement('span');
          label.className = 'lp-table-cell-label';
          label.textContent = headers[valueIndex + 1] || `Column ${valueIndex + 2}`;

          const description = document.createElement('span');
          description.className = 'lp-table-cell-value';
          description.textContent = value;

          item.append(label, description);
          cellGrid.append(item);
        });
        group.append(cellGrid);
        wrapper.append(group);
      });

      table.replaceWith(wrapper);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
