// qa-downloads.mjs — Playwright validation for every PDF / downloadable
// resource on the site.
//
// What it tests:
//   1. Every /api/resources/<slug>/download endpoint listed in
//      src/app/resources/data.ts and src/app/research/page.tsx. These should
//      302-redirect to a signed Supabase Storage URL that returns a valid
//      PDF (magic bytes %PDF, content-length > 1KB).
//   2. Every static /downloads/*.pdf file linked from src code.
//   3. Every role playbook PDF (/downloads/<role>-playbook.pdf), one per
//      slug listed in the roles taxonomy.
//   4. Every gated lead-capture PDF endpoint that is not listed in the
//      resource catalog.
//
// Usage:
//   node scripts/qa-downloads.mjs                       # against production
//   BASE_URL=https://preview... node scripts/qa-downloads.mjs
//   node scripts/qa-downloads.mjs --json out/report.json # machine-readable
//
// Exit code is 0 only if every resource passed. Any failure → exit 1.

import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const BASE = process.env.BASE_URL || 'https://www.aibankinginstitute.com';
const ROOT = process.cwd();
const PDF_MAGIC = Buffer.from('%PDF', 'utf8');
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const MIN_PAYLOAD_BYTES = 1024;

// ── Enumerate download URLs from source files ──────────────────────────────
//
// Single source of truth: grep the actual data files instead of hardcoding,
// so the test stays in sync with whatever ships in the resource catalog.

const DOWNLOAD_HREF_RE = /'(\/api\/resources\/[a-z0-9-]+\/download)'/g;
const STATIC_PDF_HREF_RE = /'(\/downloads\/[a-z0-9-]+\.pdf)'/g;

async function readUrlsFrom(files) {
  const apiUrls = new Set();
  const staticUrls = new Set();
  for (const f of files) {
    const body = await readFile(resolve(ROOT, f), 'utf8');
    for (const m of body.matchAll(DOWNLOAD_HREF_RE)) apiUrls.add(m[1]);
    for (const m of body.matchAll(STATIC_PDF_HREF_RE)) staticUrls.add(m[1]);
  }
  return { apiUrls: [...apiUrls].sort(), staticUrls: [...staticUrls].sort() };
}

// Role playbooks are produced via PlaybookDownloadButton with /downloads/<role>-playbook.pdf.
// Enumerate from the role taxonomy so we cover them even though grep won't
// find them as literal hrefs.
const ROLE_PLAYBOOK_SLUGS = [
  'lending',
  'marketing',
  'retail',
  'bsa-aml',
  'infosec',
  'compliance',
  'in-depth',
];

const GATED_DOWNLOAD_URLS = [
  '/api/guides/safe-ai-use',
  '/api/prompt-cards/download',
];

const PUBLIC_ARTIFACT_URLS = [
  '/api/courses/cards/core',
  '/api/courses/cards/five-move-zones',
  '/api/assessment/starter-artifact/current-ai-usage',
  '/api/assessment/starter-artifact/experimentation-culture',
  '/api/assessment/starter-artifact/ai-literacy-level',
  '/api/assessment/starter-artifact/quick-win-potential',
  '/api/assessment/starter-artifact/leadership-buy-in',
  '/api/assessment/starter-artifact/security-posture',
  '/api/assessment/starter-artifact/training-infrastructure',
  '/api/assessment/starter-artifact/builder-potential',
];

// ── Test runner ────────────────────────────────────────────────────────────

async function checkOne(page, url, kind) {
  const start = Date.now();
  try {
    const res = await page.request.fetch(`${BASE}${url}`, {
      maxRedirects: 5,
      timeout: 30_000,
    });
    const status = res.status();
    const ct = (res.headers()['content-type'] || '').toLowerCase();
    const body = await res.body();
    const bytes = body.length;
    const head4 = body.subarray(0, 4);
    const isPdf = head4.equals(PDF_MAGIC);
    const isZip = head4.equals(ZIP_MAGIC);
    const fileType = isPdf ? 'pdf' : isZip ? 'zip' : 'unknown';
    const elapsed = Date.now() - start;

    const ok =
      status === 200 &&
      (isPdf || isZip) &&
      bytes >= MIN_PAYLOAD_BYTES;

    return {
      kind,
      url,
      status,
      contentType: ct || '(none)',
      bytes,
      fileType,
      elapsedMs: elapsed,
      ok,
      reason: ok
        ? null
        : !(isPdf || isZip)
        ? `body is not PDF or ZIP (first bytes: ${body
            .subarray(0, 8)
            .toString('hex')})`
        : bytes < MIN_PAYLOAD_BYTES
        ? `body too small (${bytes} bytes)`
        : `status ${status}`,
    };
  } catch (err) {
    return {
      kind,
      url,
      status: 0,
      contentType: '',
      bytes: 0,
      isPdf: false,
      elapsedMs: Date.now() - start,
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  const jsonOut = process.argv.includes('--json')
    ? process.argv[process.argv.indexOf('--json') + 1]
    : null;

  console.log(`▸ QA download check against ${BASE}\n`);

  const { apiUrls, staticUrls } = await readUrlsFrom([
    'src/app/resources/data.ts',
    'src/app/research/page.tsx',
    'src/app/security/page.tsx',
    'src/app/resources/ResourcesExperience.tsx',
  ]);
  const playbookUrls = ROLE_PLAYBOOK_SLUGS.map((s) => `/downloads/${s}-playbook.pdf`);

  console.log(
    `discovered: ${apiUrls.length} API · ${staticUrls.length} static · ` +
      `${playbookUrls.length} role playbooks · ${GATED_DOWNLOAD_URLS.length} gated · ` +
      `${PUBLIC_ARTIFACT_URLS.length} public artifacts\n`,
  );

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: 'aibi-qa-downloads/1.0' });
  const page = await ctx.newPage();

  const results = [];

  for (const url of apiUrls) {
    process.stdout.write(`  api    ${url} ... `);
    const r = await checkOne(page, url, 'api');
    process.stdout.write(`${r.ok ? '✓' : '✗'}  ${r.status}  ${r.fileType.padEnd(3)} ${r.bytes}b  ${r.elapsedMs}ms${r.ok ? '' : `  ← ${r.reason}`}\n`);
    results.push(r);
  }
  for (const url of staticUrls) {
    process.stdout.write(`  static ${url} ... `);
    const r = await checkOne(page, url, 'static');
    process.stdout.write(`${r.ok ? '✓' : '✗'}  ${r.status}  ${r.fileType.padEnd(3)} ${r.bytes}b  ${r.elapsedMs}ms${r.ok ? '' : `  ← ${r.reason}`}\n`);
    results.push(r);
  }
  for (const url of playbookUrls) {
    process.stdout.write(`  static ${url} ... `);
    const r = await checkOne(page, url, 'playbook');
    process.stdout.write(`${r.ok ? '✓' : '✗'}  ${r.status}  ${r.fileType.padEnd(3)} ${r.bytes}b  ${r.elapsedMs}ms${r.ok ? '' : `  ← ${r.reason}`}\n`);
    results.push(r);
  }
  for (const url of GATED_DOWNLOAD_URLS) {
    process.stdout.write(`  gated ${url} ... `);
    const r = await checkOne(page, url, 'gated');
    process.stdout.write(`${r.ok ? '✓' : '✗'}  ${r.status}  ${r.fileType.padEnd(3)} ${r.bytes}b  ${r.elapsedMs}ms${r.ok ? '' : `  ← ${r.reason}`}\n`);
    results.push(r);
  }
  for (const url of PUBLIC_ARTIFACT_URLS) {
    process.stdout.write(`  artifact ${url} ... `);
    const r = await checkOne(page, url, 'artifact');
    process.stdout.write(`${r.ok ? '✓' : '✗'}  ${r.status}  ${r.fileType.padEnd(3)} ${r.bytes}b  ${r.elapsedMs}ms${r.ok ? '' : `  ← ${r.reason}`}\n`);
    results.push(r);
  }

  await browser.close();

  const total = results.length;
  const passed = results.filter((r) => r.ok).length;
  const failed = total - passed;
  const totalBytes = results.reduce((acc, r) => acc + r.bytes, 0);

  console.log(`\n────────────────────────────────────────`);
  console.log(`  total : ${total}`);
  console.log(`  passed: ${passed}`);
  console.log(`  failed: ${failed}`);
  console.log(`  bytes : ${totalBytes.toLocaleString()}`);
  console.log(`────────────────────────────────────────\n`);

  if (failed > 0) {
    console.log('FAILED:');
    for (const r of results.filter((x) => !x.ok)) {
      console.log(`  ✗ [${r.kind}] ${r.url} — ${r.reason}`);
    }
    console.log();
  }

  if (jsonOut) {
    const out = resolve(ROOT, jsonOut);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(
      out,
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          baseUrl: BASE,
          summary: { total, passed, failed, totalBytes },
          results,
        },
        null,
        2,
      ),
    );
    console.log(`▸ wrote ${jsonOut}\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
