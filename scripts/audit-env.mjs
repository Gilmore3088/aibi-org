#!/usr/bin/env node
// Audit every process.env.X reference in the codebase and report which
// ones are set in the current environment. Helps operator catch missing
// Vercel env vars before deploy.
//
// Usage:
//   node scripts/audit-env.mjs            # list
//   node scripts/audit-env.mjs --strict   # exit 1 if any required missing
//
// Closes §1.9 of tasks/launch-checklist.md.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SRC_DIRS = ['src', 'scripts'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.js']);
const EXCLUDE = new Set(['node_modules', '.next', '.git', 'playwright-report']);

const OPTIONAL = new Set([
  'NODE_ENV', 'VERCEL_ENV', 'VERCEL_URL',
  'SKIP_CONVERTKIT', 'SKIP_MAILERLITE', 'SKIP_ENROLLMENT_GATE',
  'SKIP_CRON_AUTH', 'SKIP_DEV_BYPASS', 'COMING_SOON',
  'E2E_ALLOW_PRODUCTION_SUPABASE', 'PLAYWRIGHT_BASE_URL', 'CI',
]);

const HAS_FALLBACK = new Set([
  'STRIPE_AIBIP_PRICE_ID', 'STRIPE_AIBIP_INSTITUTION_PRICE_ID',
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE.has(entry)) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (EXTENSIONS.has(extname(entry))) out.push(full);
  }
  return out;
}

function collectEnvRefs() {
  const refs = new Map();
  for (const top of SRC_DIRS) {
    let files;
    try { files = walk(join(ROOT, top)); } catch { continue; }
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      const re = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
      let m;
      while ((m = re.exec(content)) !== null) {
        const name = m[1];
        if (!refs.has(name)) refs.set(name, new Set());
        refs.get(name).add(file.replace(ROOT + '/', ''));
      }
    }
  }
  return refs;
}

const refs = collectEnvRefs();
const names = [...refs.keys()].sort();
const missing = [];
const present = [];
const optional = [];

for (const name of names) {
  const isSet = name in process.env && process.env[name] !== '';
  if (OPTIONAL.has(name)) {
    optional.push({ name, isSet });
  } else if (isSet) {
    present.push(name);
  } else if (HAS_FALLBACK.has(name)) {
    const newName = name.replace('AIBIP', 'FOUNDATION');
    if (process.env[newName]) present.push(`${name} (via ${newName})`);
    else missing.push({ name, files: refs.get(name) });
  } else {
    missing.push({ name, files: refs.get(name) });
  }
}

console.log(`\nEnvironment audit — ${names.length} unique references\n${'='.repeat(60)}`);
if (present.length) {
  console.log(`\n  ✓ ${present.length} required present:`);
  present.forEach((n) => console.log(`     ${n}`));
}
if (missing.length) {
  console.log(`\n  ✗ ${missing.length} required MISSING:`);
  missing.forEach((r) => {
    const files = [...r.files].slice(0, 3).join(', ');
    const extra = r.files.size > 3 ? ` (+${r.files.size - 3})` : '';
    console.log(`     ${r.name}\n       used in: ${files}${extra}`);
  });
}
if (optional.length) {
  const set = optional.filter((o) => o.isSet).length;
  console.log(`\n  · ${optional.length} optional (${set} set)`);
}
console.log('');

if (process.argv.includes('--strict') && missing.length > 0) {
  console.error(`Strict mode: ${missing.length} required env vars missing.`);
  process.exit(1);
}
