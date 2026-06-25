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
} catch {
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
  'bsa-aml-playbook':           { title: "The BSA/AML Officer's AI-Native Playbook", category: 'playbook', order: 10 },
  'compliance-playbook':        { title: "The Compliance Officer's AI Governance Playbook", category: 'playbook', order: 11 },
  'infosec-playbook':           { title: 'The Bank InfoSec AI Control Plane Kit', category: 'playbook', order: 12 },
  'lending-playbook':           { title: 'The Lending AI Control Kit',  category: 'playbook',     order: 13 },
  'marketing-playbook':         { title: 'The Bank Marketing AI Control Kit', category: 'playbook', order: 14 },
  'retail-playbook':            { title: 'The Bank Retail AI Service Kit', category: 'playbook',   order: 15 },
  'executive-playbook':         { title: 'The Executive AI Governance Kit for Community Banks', category: 'playbook', order: 16 },
  'operations-playbook':        { title: 'The Bank Operations AI Workflow Kit', category: 'playbook', order: 17 },
  'training-hr-playbook':       { title: 'The Bank AI Role Readiness Kit', category: 'playbook',     order: 18 },
  'in-depth-playbook':          { title: 'In-Depth Assessment Playbook',category: 'paid-preview', order: 20 },
  // Starter kits (ZIPs)
  'governance-starter-kit':     { title: 'The Bank AI Governance Starter Kit', category: 'starter-kit',  order: 30 },
  'frontline-enablement-kit':   { title: 'The Frontline AI Enablement Kit', category: 'starter-kit',  order: 31 },
  'marketing-review-kit':       { title: 'The Bank Marketing AI Review Kit', category: 'starter-kit',  order: 32 },
  'lending-review-kit':         { title: 'The Lending AI Review Kit', category: 'starter-kit',  order: 33 },
  // Templates
  'template-ai-use-policy-starter':       { title: "The Banker's AI Use Policy Starter", category: 'template', order: 40 },
  'template-ai-workflow-sop':             { title: 'The Bank AI Workflow SOP Template', category: 'template', order: 41 },
  'template-board-briefing-checklist':    { title: 'The AI Board Briefing Checklist', category: 'template', order: 42 },
  'template-gtm-plan':                    { title: 'AI GTM Plan',                     category: 'template', order: 43 },
  // Artifacts
  'artifact-ai-use-case-inventory':         { title: 'The Bank AI Use-Case Inventory Card', category: 'artifact', order: 50 },
  'artifact-data-handling-reference-card':  { title: 'Data Handling Reference Card',  category: 'artifact', order: 51 },
  'artifact-fair-lending-ai-review-checklist': { title: 'The Fair-Lending AI Review Checklist', category: 'artifact', order: 52 },
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
  'bsa-aml-playbook': 'Five controlled AI plays for safer narratives, cleaner documentation, analyst training, and evidence-ready oversight.',
  'compliance-playbook': 'Five controls for moving from AI policy to inventory, architecture, human review, evidence, and board reporting.',
  'infosec-playbook': 'Route, inspect, log, gate, and govern AI use before shadow AI becomes your architecture.',
  'lending-playbook': 'Five controls for lending AI use without losing explainability, file support, or human accountability.',
  'marketing-playbook': 'Campaign velocity, brand consistency, and compliance review discipline for community banks and credit unions.',
  'retail-playbook': 'Five frontline workflows for faster replies, better coaching, cleaner handoffs, and safer customer service.',
  'executive-playbook': 'Five board decisions, one funded pilot, one data line, and one evidence dashboard.',
  'operations-playbook': 'Turn one useful AI shortcut into a documented SOP your team can run, review, measure, and hand off.',
  'training-hr-playbook': 'Turn generic AI awareness into role-specific practice, safe-use scenarios, and visible readiness tracking.',
  'in-depth-playbook': 'How the $99 report turns assessment results into a 90-day AI win.',
  'governance-starter-kit': 'Four tools to set the data line, classify AI use, start the inventory, and document your first workflow.',
  'frontline-enablement-kit': 'Desk cards, prompts, and manager tools for safer branch and contact-center AI use.',
  'marketing-review-kit': 'Draft faster, verify every claim, review every disclosure, and retain every campaign decision.',
  'lending-review-kit': 'Review one AI-assisted lending workflow and prove the decision stayed human, explainable, fair-lending aware, and file-supported.',
  'template-ai-use-policy-starter': 'Editable starter clauses defining tools, data, review, incidents, and ownership.',
  'template-ai-workflow-sop': 'Document AI-assisted work, human review, data handling, vendor controls, monitoring, and shutoff triggers.',
  'template-board-briefing-checklist': 'Four facts, four motions, and four evidence items for a controlled bank AI rollout.',
  'template-gtm-plan': 'AI go-to-market plan template.',
  'artifact-ai-use-case-inventory': 'One-page register and editable spreadsheet for AI workflows, owners, data classes, risk tiers, vendor controls, and review cadence.',
  'artifact-data-handling-reference-card': 'Data classification, allowed tools, and escalation paths at a glance.',
  'artifact-fair-lending-ai-review-checklist': 'Pre-deployment and recurring-review card plus worksheet for AI-assisted credit decisions, pricing, eligibility, triage, and adverse-action support.',
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
