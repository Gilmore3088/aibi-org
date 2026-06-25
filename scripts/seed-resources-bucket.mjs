#!/usr/bin/env node
/**
 * One-off: upload /public/downloads/* to Supabase Storage bucket `resources`
 * and seed the `resources` metadata table.
 *
 * Run with: node scripts/seed-resources-bucket.mjs
 *
 * Idempotent — re-running upserts metadata and overwrites storage objects.
 */

import { createClient } from '@supabase/supabase-js';
import { readFile, readdir, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Minimal .env.local loader (no dotenv dependency).
const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
try {
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
    if (m && !process.env[m[1]]) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] = val;
    }
  }
} catch (e) {
  // .env.local optional; the env vars may already be set in the shell
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DOWNLOADS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'downloads');
const BUCKET = 'resources';

/** Per-file metadata: slug → { title, category, tier_required, display_order } */
const META = {
  // Sector playbooks
  'bsa-aml-playbook':           { title: 'BSA / AML Playbook',          category: 'playbook',     order: 10 },
  'compliance-playbook':        { title: 'Compliance Playbook',         category: 'playbook',     order: 11 },
  'infosec-playbook':           { title: 'IT / InfoSec Playbook',       category: 'playbook',     order: 12 },
  'lending-playbook':           { title: 'Lending Playbook',            category: 'playbook',     order: 13 },
  'marketing-playbook':         { title: 'Marketing Playbook',          category: 'playbook',     order: 14 },
  'retail-playbook':            { title: 'Branch / Retail Playbook',    category: 'playbook',     order: 15 },
  'executive-playbook':         { title: 'Executive / Leadership Playbook', category: 'playbook', order: 16 },
  'operations-playbook':        { title: 'Operations Playbook',          category: 'playbook',     order: 17 },
  'training-hr-playbook':       { title: 'Training / HR Playbook',       category: 'playbook',     order: 18 },
  'in-depth-playbook':          { title: 'In-Depth Assessment Playbook',category: 'paid-preview', order: 20 },
  // Starter kits (ZIPs)
  'governance-starter-kit':     { title: 'AI Governance Starter Kit',   category: 'starter-kit',  order: 30 },
  'frontline-enablement-kit':   { title: 'Frontline Enablement Kit',    category: 'starter-kit',  order: 31 },
  'marketing-review-kit':       { title: 'Marketing Review Kit',        category: 'starter-kit',  order: 32 },
  'lending-review-kit':         { title: 'Lending Review Kit',          category: 'starter-kit',  order: 33 },
  // Templates
  'template-ai-use-policy-starter':       { title: "The Banker's AI Use Policy Starter", category: 'template', order: 40 },
  'template-ai-workflow-sop':             { title: 'AI Workflow SOP',                 category: 'template', order: 41 },
  'template-board-briefing-checklist':    { title: 'The AI Board Briefing Checklist', category: 'template', order: 42 },
  'template-gtm-plan':                    { title: 'AI GTM Plan',                     category: 'template', order: 43 },
  // Artifacts
  'artifact-ai-use-case-inventory':         { title: 'The Bank AI Use-Case Inventory Template', category: 'artifact', order: 50 },
  'artifact-data-handling-reference-card':  { title: 'Data Handling Reference Card',  category: 'artifact', order: 51 },
  'artifact-fair-lending-ai-review-checklist': { title: 'Fair-Lending AI Review Checklist', category: 'artifact', order: 52 },
  // Desk cards / references
  'red-yellow-green-use-card':  { title: 'Red / Yellow / Green Use Card',     category: 'desk-card', order: 60 },
  'safe-ai-use-checklist':      { title: 'Safe AI Use Checklist',             category: 'desk-card', order: 61 },
  'prompt-strategy-cheat-sheet':{ title: 'Prompt Strategy Cheat Sheet',       category: 'desk-card', order: 62 },
  'regulatory-cheatsheet':      { title: 'Regulatory Cheatsheet',             category: 'desk-card', order: 63 },
  'platform-feature-reference-card': { title: 'Platform Feature Reference Card', category: 'desk-card', order: 64 },
  // Paid previews / samples
  'sample-readiness-report':    { title: 'Sample Readiness Report',           category: 'paid-preview', order: 70 },
};

const DESCRIPTIONS = {
  'bsa-aml-playbook': 'SAR scaffolds, CDD baselines, synthetic typology training, and alert patterning SOPs.',
  'compliance-playbook': 'Governance, use-case review, workflow SOPs, evidence packets, and board update rhythm.',
  'infosec-playbook': 'Data classes, approved tools, AI vetting memos, gateway rules, and AgentSecOps controls.',
  'lending-playbook': 'Adverse-action traceability, fair-lending checks, decision packet indexes, and language coaching.',
  'marketing-playbook': 'Brand voice, campaign kits, disclosure flags, reporting narratives, and segment-safe messaging.',
  'retail-playbook': 'Frontline summaries, service replies, coaching cards, huddle scripts, and customer signal reports.',
  'executive-playbook': 'Adoption thesis, governance guardrails, board-ready risk posture, and pilot ROI scorecards.',
  'operations-playbook': 'Recurring task maps, reusable working briefs, review checkpoints, and handoff-ready workflow SOPs.',
  'training-hr-playbook': 'Role-specific training paths, safe-use onboarding, scenario packs, and capability tracking.',
  'in-depth-playbook': 'How the $99 report turns assessment results into a 90-day AI win.',
  'governance-starter-kit': 'Start here if your team is beginning to allow AI tools.',
  'frontline-enablement-kit': 'Give branch and contact center teams safer AI practice routines.',
  'marketing-review-kit': 'Create faster campaign drafts without skipping claims and disclosure review.',
  'lending-review-kit': 'Keep adverse-action, fair-lending, and decision packet work traceable.',
  'template-ai-use-policy-starter': 'Editable starter clauses defining tools, data, review, incidents, and ownership.',
  'template-ai-workflow-sop': 'Capture tool, input, output, reviewer, approval checkpoint, and retention rule.',
  'template-board-briefing-checklist': 'Four facts, four motions, and four evidence items for a controlled bank AI rollout.',
  'template-gtm-plan': 'AI go-to-market plan template.',
  'artifact-ai-use-case-inventory': 'Fillable register for AI tools, owners, data classes, vendor controls, risk tiers, and review cadence.',
  'artifact-data-handling-reference-card': 'Data classification, allowed tools, and escalation paths at a glance.',
  'artifact-fair-lending-ai-review-checklist': 'Fair-lending review checklist for AI-assisted lending decisions.',
  'red-yellow-green-use-card': 'Classify AI use cases in ten seconds.',
  'safe-ai-use-checklist': 'Strip data, ask clearly, fact-check, escalate.',
  'prompt-strategy-cheat-sheet': 'Write prompts with role, context, format, constraints, and review.',
  'regulatory-cheatsheet': 'SR 26-2, ECOA / Reg B, TPRM, BSA/AML, and AI lexicon basics.',
  'platform-feature-reference-card': 'Quick reference to AiBI platform features and entitlement tiers.',
  'sample-readiness-report': 'Score, maturity tier, top gap, dimension snapshot, and starter artifact.',
};

function fileToSlug(filename) {
  // 'governance-starter-kit.zip' → 'governance-starter-kit'
  return filename.replace(/\.(pdf|zip)$/i, '');
}

function fileExt(filename) {
  return filename.split('.').pop().toLowerCase();
}

function contentType(ext) {
  return ext === 'pdf' ? 'application/pdf' : 'application/zip';
}

async function main() {
  const entries = await readdir(DOWNLOADS_DIR);
  const files = entries.filter((f) => f.endsWith('.pdf') || f.endsWith('.zip'));

  console.log(`Found ${files.length} files in ${DOWNLOADS_DIR}\n`);

  let uploaded = 0;
  let seeded = 0;
  const errors = [];

  for (const filename of files) {
    const slug = fileToSlug(filename);
    const ext = fileExt(filename);
    const meta = META[slug];

    if (!meta) {
      errors.push(`No metadata mapping for: ${filename}`);
      continue;
    }

    const localPath = join(DOWNLOADS_DIR, filename);
    const stats = await stat(localPath);
    const buf = await readFile(localPath);

    // Upload to storage
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buf, {
        contentType: contentType(ext),
        upsert: true,
      });

    if (upErr) {
      errors.push(`Upload ${filename}: ${upErr.message}`);
      continue;
    }
    uploaded++;

    // Upsert metadata row
    const { error: dbErr } = await supabase
      .from('resources')
      .upsert({
        slug,
        title: meta.title,
        description: DESCRIPTIONS[slug] ?? '',
        category: meta.category,
        file_path: filename,
        file_type: ext,
        file_size_bytes: stats.size,
        tier_required: 'free',
        published: true,
        display_order: meta.order,
      }, { onConflict: 'slug' });

    if (dbErr) {
      errors.push(`Seed row ${slug}: ${dbErr.message}`);
      continue;
    }
    seeded++;

    console.log(`  ✓ ${filename}  (${(stats.size / 1024).toFixed(0)} KB)`);
  }

  console.log(`\nUploaded: ${uploaded}/${files.length}`);
  console.log(`Seeded:   ${seeded}/${files.length}`);

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
