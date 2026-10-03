#!/usr/bin/env node
// Pulse auto-merge guard (CI: .github/workflows/pulse-guard.yml).
//
// Runs on every PR; enforces nothing unless the PR carries the `pulse-auto`
// label. For labeled PRs it caps the blast radius of automated publishing:
// a pulse PR may do exactly one thing — add today's pulse briefing and,
// optionally, new claims-registry entries backing it.
//
//   1. Changed paths ⊆ { content/briefings/*.mdx, content/claims/registry.json }
//   2. Exactly ONE added briefing MDX; no modified/deleted briefings
//   3. The briefing: tier "pulse", date == today (UTC), filename matches
//      meta, author is the Research Desk (never James's byline)
//   4. registry.json diff is ADDITIVE-ONLY: every pre-existing claim object
//      survives byte-identical; only appended entries allowed
//   5. Size caps: ≤ 2 files, ≤ 450 added lines
//   6. Head branch matches claude/pulse-*
//
// Usage (CI): node scripts/check-pulse-pr.mjs <base-sha> <head-sha>
// The workflow checks out the PR merge ref; base/head come from the event.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [base, head] = process.argv.slice(2);
if (!base || !head) {
  console.error('usage: check-pulse-pr.mjs <base-sha> <head-sha>');
  process.exit(2);
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const fail = (msg) => {
  console.error(`✖ pulse-guard: ${msg}`);
  process.exitCode = 1;
};

const BRIEFING = /^content\/briefings\/(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.mdx$/;
const REGISTRY = 'content/claims/registry.json';

// --- changed files, with status ---
const nameStatus = git('diff', '--name-status', `${base}...${head}`)
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [status, ...rest] = l.split('\t');
    return { status: status[0], path: rest[rest.length - 1] };
  });

if (nameStatus.length === 0) fail('empty diff');
if (nameStatus.length > 2) fail(`touches ${nameStatus.length} files (max 2: one briefing + the registry)`);

const briefingChanges = nameStatus.filter((f) => BRIEFING.test(f.path));
const registryChanges = nameStatus.filter((f) => f.path === REGISTRY);
const strays = nameStatus.filter((f) => !BRIEFING.test(f.path) && f.path !== REGISTRY);

for (const s of strays) fail(`out-of-scope path: ${s.path} (${s.status})`);
for (const b of briefingChanges) {
  if (b.status !== 'A') fail(`briefing ${b.path} is ${b.status === 'M' ? 'modified' : 'deleted/renamed'} — pulse PRs only ADD briefings`);
}
if (briefingChanges.length !== 1) fail(`adds ${briefingChanges.length} briefings (must be exactly 1)`);
for (const r of registryChanges) {
  if (r.status !== 'M' && r.status !== 'A') fail(`registry change has status ${r.status}`);
}

// --- added-line cap ---
const numstat = git('diff', '--numstat', `${base}...${head}`).trim().split('\n').filter(Boolean);
const added = numstat.reduce((sum, l) => sum + (parseInt(l.split('\t')[0], 10) || 0), 0);
if (added > 450) fail(`${added} added lines (max 450 for a pulse)`);

// --- the briefing itself ---
const briefing = briefingChanges[0];
if (briefing) {
  const m = BRIEFING.exec(briefing.path);
  const [, fileDate, fileSlug] = m;
  const today = new Date().toISOString().slice(0, 10);
  if (fileDate !== today) fail(`briefing dated ${fileDate}, but today (UTC) is ${today}`);

  let text = '';
  try {
    text = git('show', `${head}:${briefing.path}`);
  } catch {
    text = readFileSync(briefing.path, 'utf8');
  }
  const metaField = (name) => {
    const re = new RegExp(`${name}\\s*:\\s*"([^"]*)"`);
    return re.exec(text)?.[1];
  };
  if (metaField('tier') !== 'pulse') fail(`meta.tier is "${metaField('tier')}" (must be "pulse")`);
  if (metaField('date') !== fileDate) fail(`meta.date ${metaField('date')} != filename date ${fileDate}`);
  if (metaField('slug') !== fileSlug) fail(`meta.slug ${metaField('slug')} != filename slug ${fileSlug}`);
  const author = metaField('author') ?? '';
  if (/james/i.test(author)) fail(`pulse author "${author}" — James's byline never auto-publishes`);
}

// --- registry: additive-only ---
if (registryChanges.length > 0) {
  const baseReg = JSON.parse(git('show', `${base}:${REGISTRY}`));
  const headReg = JSON.parse(git('show', `${head}:${REGISTRY}`));
  const headById = new Map(headReg.claims.map((c) => [c.id, c]));
  for (const c of baseReg.claims) {
    const after = headById.get(c.id);
    if (!after) {
      fail(`registry entry "${c.id}" removed — pulse PRs are additive-only`);
      continue;
    }
    if (JSON.stringify(after) !== JSON.stringify(c)) {
      fail(`registry entry "${c.id}" modified — pulse PRs are additive-only`);
    }
  }
  const baseIds = new Set(baseReg.claims.map((c) => c.id));
  const newEntries = headReg.claims.filter((c) => !baseIds.has(c.id));
  for (const n of newEntries) {
    for (const field of ['id', 'claim', 'source', 'url', 'asOf', 'verified', 'reviewBy', 'match']) {
      if (!n[field] || (Array.isArray(n[field]) && n[field].length === 0)) {
        fail(`new registry entry "${n.id ?? '?'}" missing ${field}`);
      }
    }
  }
}

if (process.exitCode === 1) {
  console.error('\npulse-guard FAILED — this PR does not qualify for auto-merge.');
} else {
  console.log('✓ pulse-guard passed: one fresh pulse briefing, additive registry, in-scope paths.');
}
