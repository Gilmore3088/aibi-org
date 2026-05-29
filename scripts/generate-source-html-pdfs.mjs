// generate-source-html-pdfs.mjs — render every public/downloads/source/*.html
// to public/downloads/*.pdf via Playwright. These HTML files are the
// hand-authored source of truth for PDFs that don't have a generator route
// (in-depth-playbook, sample-readiness-report, prompt-strategy-cheat-sheet,
// safe-ai-use-checklist, red-yellow-green-use-card, the 6 role playbooks,
// platform-feature-reference-card, regulatory-cheatsheet).
//
// HTML loads _brand.css (brand v1 colors + the bracketed [Ai] seal mark).
// We render via file:// URL so no dev server is required.
//
// Usage:  node scripts/generate-source-html-pdfs.mjs [--only slug1,slug2]

import { chromium } from '@playwright/test';
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SRC_DIR = resolve(ROOT, 'public/downloads/source');
const OUT_DIR = resolve(ROOT, 'public/downloads');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const onlyArg = process.argv.includes('--only')
    ? process.argv[process.argv.indexOf('--only') + 1].split(',')
    : null;

  const all = (await readdir(SRC_DIR))
    .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
    .map((f) => f.replace(/\.html$/, ''));

  const slugs = onlyArg ? all.filter((s) => onlyArg.includes(s)) : all;
  console.log(`▸ rendering ${slugs.length} HTML source(s) → PDF\n`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  for (const slug of slugs) {
    const htmlPath = resolve(SRC_DIR, `${slug}.html`);
    const url = pathToFileURL(htmlPath).href;
    process.stdout.write(`→ ${slug} ... `);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({
      format: 'Letter',
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
      printBackground: true,
    });
    const out = resolve(OUT_DIR, `${slug}.pdf`);
    await writeFile(out, pdf);
    const { size } = await stat(out);
    process.stdout.write(`${size.toLocaleString()}b → ${out.replace(ROOT + '/', '')}\n`);
  }

  await browser.close();
  console.log(`\n✓ done`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
