// generate-playbook-pdfs.mjs — Render /playbooks/[role] pages to PDFs.
//
// Each playbook ships as a downloadable PDF the role can take to a desk
// or print for a working session. The /playbooks/[role] pages are the
// canonical source — this script renders them via Playwright (so brand
// v1, current copy, current data all flow through automatically).
//
// Usage:
//   node scripts/generate-playbook-pdfs.mjs
//
// Override BASE_URL only when intentionally rendering from a preview URL.

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'https://www.aibankinginstitute.com';
const ROLES = [
  'compliance',
  'retail',
  'marketing',
  'lending',
  'bsa-aml',
  'infosec',
  'executive',
  'operations',
  'training-hr',
];
const OUT_DIR = resolve(process.cwd(), 'public/downloads');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  for (const role of ROLES) {
    const url = `${BASE}/playbooks/${role}`;
    process.stdout.write(`→ ${role}: ${url} ... `);
    const res = await page.goto(url, { waitUntil: 'networkidle' });
    if (!res || !res.ok()) {
      throw new Error(`HTTP ${res?.status() ?? 'no-response'} on ${url}`);
    }
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({
      format: 'Letter',
      margin: { top: '0.75in', bottom: '0.75in', left: '0.75in', right: '0.75in' },
      printBackground: true,
    });
    const out = resolve(OUT_DIR, `${role}-playbook.pdf`);
    await writeFile(out, pdf);
    process.stdout.write(
      `${pdf.length.toLocaleString()}b → ${out.replace(process.cwd() + '/', '')}\n`,
    );
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
