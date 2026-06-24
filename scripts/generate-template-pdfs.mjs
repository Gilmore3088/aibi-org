// Generate static PDFs for /resources/templates/[slug] pages.
//
// Canonical content lives in src/app/resources/templates/data.ts. This
// script renders each template page via Playwright Chromium and emits a
// printable PDF to public/downloads/template-<slug>.pdf so the
// /resources Artifact Library can offer a "PDF" CTA alongside the HTML
// "Open" CTA. Idempotent — safe to re-run any time TEMPLATES changes.
//
// Usage:
//   node scripts/generate-template-pdfs.mjs
//
// Override the base URL with BASE_URL=https://preview.url node scripts/...

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'https://www.aibankinginstitute.com';
const SLUGS = [
  'ai-use-policy-starter',
  'ai-workflow-sop',
  'board-briefing-checklist',
  'gtm-plan',
];

const OUT_DIR = resolve(process.cwd(), 'public/downloads');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  for (const slug of SLUGS) {
    const url = `${BASE}/resources/templates/${slug}`;
    process.stdout.write(`→ ${slug}: ${url} ... `);
    const res = await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    if (!res || !res.ok()) {
      throw new Error(`HTTP ${res?.status() ?? 'no-response'} on ${url}`);
    }
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({
      format: 'Letter',
      margin: { top: '0.75in', bottom: '0.75in', left: '0.75in', right: '0.75in' },
      printBackground: true,
    });
    const out = resolve(OUT_DIR, `template-${slug}.pdf`);
    await writeFile(out, pdf);
    process.stdout.write(`${pdf.length.toLocaleString()}b → ${out.replace(process.cwd() + '/', '')}\n`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
