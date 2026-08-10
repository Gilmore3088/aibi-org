#!/usr/bin/env node
// Claims staleness + coverage gate.
//
// Enforces two invariants against content/claims/registry.json:
//   1. No registry entry is past its reviewBy date (facts have expiry).
//   2. Every regulatory token (SR NN-N, GAO-NN-NNNNNN) in a scanned surface
//      is covered by a registry entry - and entries with requireContext
//      (e.g. SR 11-7, superseded April 2026) only pass when the surrounding
//      line carries the required historical framing.
//   3. Statistic tokens (NN% / NN.N%) in the *email text* (tags stripped, so
//      CSS percentages don't count) must be covered by a registry entry.
//
// Run: node scripts/check-claims.mjs   (CI: .github/workflows/claims.yml)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const registry = JSON.parse(readFileSync(join(ROOT, 'content/claims/registry.json'), 'utf8'));

const TODAY = new Date().toISOString().slice(0, 10);
const errors = [];
const warnings = [];

// ---------- 1. Expiry ----------
for (const c of registry.claims) {
  if (c.reviewBy < TODAY) {
    errors.push(`EXPIRED: claim "${c.id}" was due for re-verification by ${c.reviewBy} (source: ${c.source}). Re-verify it and bump reviewBy in content/claims/registry.json.`);
  }
}

// ---------- surface collection ----------
const SURFACE_DIRS = ['src/app', 'src/lib', 'content', 'docs/mailerlite-emails', 'docs/nurture-build/emails'];
const EXT = /\.(tsx?|mdx?|json|html)$/;
// Deliberate exceptions - each with a reason.
const ALLOWLIST = [
  // Sandbox teaching artifacts are deliberately time-fixed samples; module 3's
  // "with-errors" file even contains PLANTED false citations students must
  // catch. Do not "fix" these to current guidance.
  'content/sandbox-data/',
  // Negative assertions (expect(...).not.toContain('SR 11-7')) pin that
  // sanitized output excludes the token.
  '.test.ts',
  '.test.tsx',
  // The registry itself.
  'content/claims/registry.json',
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (EXT.test(name)) yield p;
  }
}

const files = SURFACE_DIRS.flatMap((d) => {
  try { return [...walk(join(ROOT, d))]; } catch { return []; }
});

const covered = (line, entry) => entry.match.some((m) => line.includes(m));
const findEntry = (token) => registry.claims.find((c) => c.match.some((m) => token.includes(m) || m.includes(token)));

// ---------- 2. Regulatory tokens ----------
const REG_TOKEN = /SR(?:\s|&nbsp;)\d{2}-\d+|GAO-\d{2}-\d+/g;

for (const file of files) {
  const rel = relative(ROOT, file);
  if (ALLOWLIST.some((a) => rel.includes(a))) continue;
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(REG_TOKEN)) {
      const token = m[0].replace('&nbsp;', ' ');
      const entry = registry.claims.find((c) => c.match.some((s) => s.replace('&nbsp;', ' ') === token));
      if (!entry) {
        errors.push(`UNREGISTERED: "${token}" at ${rel}:${i + 1} - add it to content/claims/registry.json or correct the citation.`);
        continue;
      }
      if (entry.requireContext) {
        // Context window: the line itself plus two neighbours.
        const ctx = lines.slice(Math.max(0, i - 2), i + 3).join(' ');
        if (!entry.requireContext.some((r) => ctx.toLowerCase().includes(r.toLowerCase()))) {
          errors.push(`STALE ANCHOR: "${token}" at ${rel}:${i + 1} appears without historical framing (${entry.requireContext.slice(0, 3).join(' / ')}...). ${entry.claim}`);
        }
      }
    }
  });
}

// ---------- 3. Statistics in email text ----------
const EMAIL_DIRS = ['docs/mailerlite-emails', 'docs/nurture-build/emails'];
const STAT = /\b\d{1,2}(?:\.\d)?%/g;

for (const dir of EMAIL_DIRS) {
  let emailFiles = [];
  try { emailFiles = [...walk(join(ROOT, dir))].filter((f) => f.endsWith('.html')); } catch { continue; }
  for (const file of emailFiles) {
    const rel = relative(ROOT, file);
    // Strip tags so CSS percentages (width:100%) don't count as claims.
    const textOnly = readFileSync(file, 'utf8')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ');
    for (const m of textOnly.matchAll(STAT)) {
      const token = m[0];
      if (!findEntry(token)) {
        errors.push(`UNREGISTERED STAT: "${token}" in ${rel} - every statistic in outbound email must have a registry entry with a source and reviewBy date.`);
      }
    }
  }
}

// ---------- 4. Drift (warn only) ----------
for (const c of registry.claims) {
  const anywhere = files.some((f) => {
    const text = readFileSync(f, 'utf8');
    return c.match.some((m) => text.includes(m));
  });
  if (!anywhere) warnings.push(`UNUSED: claim "${c.id}" matches nothing - copy may have moved on; consider pruning.`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✖ ${e}`);
  console.error(`\n${errors.length} claim check failure(s). See content/claims/registry.json.`);
  process.exit(1);
}
console.log(`✓ claims check passed: ${registry.claims.length} registered claims, ${files.length} files scanned, ${warnings.length} warning(s).`);
