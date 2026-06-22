#!/usr/bin/env node
// Fails if repository files contain live-looking service secrets.
//
// This is not a substitute for rotating a key that was already exposed
// outside the repo. It is a cheap pre-promotion/CI guard against committing
// live Stripe/Supabase/Resend-style secrets into source, docs, or artifacts.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const EXCLUDE_DIRS = new Set([
  '.git',
  '.next',
  'node_modules',
  'coverage',
  'playwright-report',
]);
const EXCLUDE_FILES = new Set([
  'package-lock.json',
]);

const PATTERNS = [
  {
    label: 'Stripe live secret key',
    re: /\bsk_live_[A-Za-z0-9]{16,}\b/g,
  },
  {
    label: 'Stripe restricted live key',
    re: /\brk_live_[A-Za-z0-9]{16,}\b/g,
  },
  {
    label: 'Stripe webhook signing secret',
    re: /\bwhsec_[A-Za-z0-9]{16,}\b/g,
  },
  {
    label: 'Supabase service-role JWT',
    re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    label: 'Resend API key',
    re: /\bre_[A-Za-z0-9]{16,}\b/g,
  },
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(entry)) continue;
    if (EXCLUDE_FILES.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walk(full));
    } else if (stat.isFile() && stat.size <= 5_000_000) {
      files.push(full);
    }
  }
  return files;
}

function lineAndColumn(source, index) {
  const before = source.slice(0, index);
  const lines = before.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

const findings = [];

for (const file of walk(ROOT)) {
  let source;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  for (const pattern of PATTERNS) {
    pattern.re.lastIndex = 0;
    let match;
    while ((match = pattern.re.exec(source)) !== null) {
      const loc = lineAndColumn(source, match.index);
      findings.push({
        label: pattern.label,
        file: relative(ROOT, file),
        line: loc.line,
        column: loc.column,
      });
    }
  }
}

if (findings.length > 0) {
  console.error(`Secret scan failed: ${findings.length} live-looking secret(s) found.`);
  for (const finding of findings) {
    console.error(
      `  ${finding.label}: ${finding.file}:${finding.line}:${finding.column}`,
    );
  }
  process.exit(1);
}

console.log('Secret scan passed: no live-looking service secrets found.');
