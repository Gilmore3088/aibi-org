#!/usr/bin/env node
/**
 * Local QA seed for the paid Team AI Readiness Assessment.
 *
 * Usage:
 *   node scripts/seed-team-assessment.mjs --buyer-email you@example.com
 *   node scripts/seed-team-assessment.mjs --buyer-email you@example.com --responses 9
 *   node scripts/seed-team-assessment.mjs --buyer-email you@example.com --responses 12
 *   node scripts/seed-team-assessment.mjs --buyer-email you@example.com --dry-run
 *
 * Safety:
 * - Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * - Refuses remote Supabase URLs unless --allow-remote is supplied.
 * - Creates a new cohort each run; it never touches existing cohorts.
 */

import { createClient } from '@supabase/supabase-js';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_ORIGIN = 'http://localhost:3062';
const DEFAULT_INSTITUTION = 'First Community Bank Test';
const DEFAULT_SEATS = 12;
const DEFAULT_RESPONSES = 10;

const DIMENSION_LABELS = {
  'ai-access-architecture': 'Approved AI Access',
  'model-risk-validation': 'Model Oversight',
  'compliance-explainability': 'Compliance Clarity',
  'data-security-guardrails': 'Data Safety',
  'workflow-orchestration': 'Workflow Fit',
  'bounded-autonomy-human-review': 'Human Control',
  'vendor-risk-interoperability': 'Vendor Control',
  'governance-roles-human-capital': 'People & Governance',
};

const MATURITY_BANDS = [
  { id: 'unstructured', label: 'Unstructured', min: 0, max: 39 },
  { id: 'emerging', label: 'Emerging', min: 40, max: 59 },
  { id: 'building-momentum', label: 'Building Momentum', min: 60, max: 74 },
  { id: 'controlled-scale', label: 'Controlled Scale', min: 75, max: 89 },
  { id: 'advanced', label: 'Advanced', min: 90, max: 100 },
];

const RESPONSE_FIXTURES = [
  {
    email: 'ops.one@firstcommunity.test',
    department: 'operations',
    role: 'operations',
    base: 3,
    lifts: { 'workflow-orchestration': 4, 'bounded-autonomy-human-review': 4 },
  },
  {
    email: 'ops.two@firstcommunity.test',
    department: 'operations',
    role: 'operations',
    base: 3,
    lifts: { 'data-security-guardrails': 4, 'workflow-orchestration': 4 },
  },
  {
    email: 'ops.three@firstcommunity.test',
    department: 'operations',
    role: 'operations',
    base: 2,
    lifts: { 'workflow-orchestration': 4, 'governance-roles-human-capital': 3 },
  },
  {
    email: 'ops.four@firstcommunity.test',
    department: 'operations',
    role: 'operations',
    base: 3,
    lifts: { 'ai-access-architecture': 4, 'workflow-orchestration': 4 },
  },
  {
    email: 'ops.five@firstcommunity.test',
    department: 'operations',
    role: 'operations',
    base: 3,
    lifts: { 'workflow-orchestration': 4, 'vendor-risk-interoperability': 2 },
  },
  {
    email: 'ops.six@firstcommunity.test',
    department: 'operations',
    role: 'operations',
    base: 2,
    lifts: { 'workflow-orchestration': 3, 'bounded-autonomy-human-review': 3 },
  },
  {
    email: 'risk.one@firstcommunity.test',
    department: 'compliance-risk',
    role: 'compliance-risk',
    base: 3,
    lifts: { 'compliance-explainability': 4, 'model-risk-validation': 4 },
  },
  {
    email: 'risk.two@firstcommunity.test',
    department: 'compliance-risk',
    role: 'compliance-risk',
    base: 2,
    lifts: { 'compliance-explainability': 4, 'data-security-guardrails': 3 },
  },
  {
    email: 'risk.three@firstcommunity.test',
    department: 'compliance-risk',
    role: 'compliance-risk',
    base: 2,
    lifts: { 'model-risk-validation': 3, 'compliance-explainability': 4 },
  },
  {
    email: 'lending.one@firstcommunity.test',
    department: 'lending-credit',
    role: 'lending-credit',
    base: 2,
    lifts: { 'bounded-autonomy-human-review': 3, 'compliance-explainability': 3 },
  },
  {
    email: 'it.one@firstcommunity.test',
    department: 'it-infosec',
    role: 'it-infosec',
    base: 3,
    lifts: { 'data-security-guardrails': 4, 'ai-access-architecture': 4 },
  },
  {
    email: 'training.one@firstcommunity.test',
    department: 'training-hr',
    role: 'training-hr',
    base: 2,
    lifts: { 'governance-roles-human-capital': 4, 'workflow-orchestration': 3 },
  },
];

function loadEnvLocal() {
  const envPath = join(ROOT, '.env.local');
  try {
    const raw = readFileSync(envPath, 'utf-8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
      if (!m || process.env[m[1]]) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] = val;
    }
  } catch {
    // .env.local is optional for dry-run and CI-style invocations.
  }
}

function parseArgs(argv) {
  const args = {
    allowRemote: false,
    buyerEmail: '',
    dryRun: false,
    institution: DEFAULT_INSTITUTION,
    origin: DEFAULT_ORIGIN,
    responses: DEFAULT_RESPONSES,
    seats: DEFAULT_SEATS,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--allow-remote') args.allowRemote = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--buyer-email') {
      args.buyerEmail = next ?? '';
      i += 1;
    } else if (arg === '--institution') {
      args.institution = next ?? '';
      i += 1;
    } else if (arg === '--origin') {
      args.origin = (next ?? '').replace(/\/+$/, '');
      i += 1;
    } else if (arg === '--responses') {
      args.responses = Number.parseInt(next ?? '', 10);
      i += 1;
    } else if (arg === '--seats') {
      args.seats = Number.parseInt(next ?? '', 10);
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      printUsage();
      process.exit(1);
    }
  }

  return args;
}

function printUsage() {
  console.log(`Usage:
  node scripts/seed-team-assessment.mjs --buyer-email you@example.com [options]

Options:
  --responses <n>      Number of completed responses to seed. Default: 10. Use 9 for locked, 12 for seat-cap.
  --seats <n>          Seats purchased. Default: 12.
  --institution <name> Institution name. Default: "${DEFAULT_INSTITUTION}".
  --origin <url>       URL printed in QA links. Default: ${DEFAULT_ORIGIN}.
  --dry-run            Build seed payloads and print sample output without writing Supabase.
  --allow-remote       Allow a non-local Supabase URL.
`);
}

function assertArgs(args) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.buyerEmail)) {
    throw new Error('Pass a real test admin email with --buyer-email.');
  }
  if (!args.institution || args.institution.trim().length < 2) {
    throw new Error('--institution must be at least 2 characters.');
  }
  if (!Number.isInteger(args.seats) || args.seats < 10) {
    throw new Error('--seats must be an integer >= 10.');
  }
  if (!Number.isInteger(args.responses) || args.responses < 0 || args.responses > args.seats) {
    throw new Error('--responses must be an integer between 0 and --seats.');
  }
  if (args.responses > RESPONSE_FIXTURES.length) {
    throw new Error(`This script currently has ${RESPONSE_FIXTURES.length} response fixtures.`);
  }
  try {
    new URL(args.origin);
  } catch {
    throw new Error('--origin must be a valid URL.');
  }
}

function isLocalSupabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function loadQuestions() {
  const src = readFileSync(join(ROOT, 'content', 'assessments', 'v4', 'questions.ts'), 'utf-8');
  const output = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module }, { filename: 'questions.ts' });
  const questions = module.exports.questions;
  if (!Array.isArray(questions) || questions.length !== 48) {
    throw new Error(`Expected 48 canonical v4 questions; found ${questions?.length ?? 0}.`);
  }
  return questions;
}

function normalize(raw) {
  const min = 48;
  const max = 192;
  if (raw <= min) return 0;
  if (raw >= max) return 100;
  return Math.round(((raw - min) / (max - min)) * 100);
}

function getMaturityBand(score) {
  const band = MATURITY_BANDS.find((b) => score >= b.min && score <= b.max);
  if (!band) throw new Error(`Score out of range: ${score}`);
  return band;
}

function dimensionBreakdown(questions, answers) {
  const buckets = Object.fromEntries(
    Object.keys(DIMENSION_LABELS).map((dimension) => [dimension, { raw: 0, count: 0 }]),
  );

  questions.forEach((question, index) => {
    const bucket = buckets[question.dimension];
    bucket.raw += answers[index];
    bucket.count += 1;
  });

  return Object.fromEntries(
    Object.entries(buckets).map(([dimension, bucket]) => {
      const max = bucket.count * 4;
      const normalized = max === 0
        ? 0
        : Math.round(((bucket.raw - bucket.count) / (max - bucket.count)) * 100);
      return [
        dimension,
        {
          score: Math.max(0, Math.min(100, normalized)),
          maxScore: 100,
          label: DIMENSION_LABELS[dimension],
        },
      ];
    }),
  );
}

function scoreFixture(questions, fixture, index) {
  const answers = questions.map((question, qIndex) => {
    const dimensionOverride = fixture.lifts[question.dimension];
    const wobble = (index + qIndex) % 11 === 0 ? -1 : 0;
    return Math.max(1, Math.min(4, (dimensionOverride ?? fixture.base) + wobble));
  });
  const raw = answers.reduce((sum, answer) => sum + answer, 0);
  const score = normalize(raw);
  const band = getMaturityBand(score);
  return {
    answers,
    questionIds: questions.map((q) => q.id),
    score,
    band,
    dimensionBreakdown: dimensionBreakdown(questions, answers),
  };
}

function buildRows(questions, cohortId, count) {
  return RESPONSE_FIXTURES.slice(0, count).map((fixture, index) => {
    const scored = scoreFixture(questions, fixture, index);
    return {
      cohort_id: cohortId,
      participant_email: fixture.email,
      department: fixture.department,
      department_other: null,
      role: fixture.role,
      answers: scored.answers,
      question_ids: scored.questionIds,
      score: scored.score,
      maturity_band_id: scored.band.id,
      maturity_band_label: scored.band.label,
      dimension_breakdown: scored.dimensionBreakdown,
    };
  });
}

function printLinks({ args, cohort, sampleReportToken }) {
  const participantUrl = `${args.origin}/assessment/team/${cohort.public_token}`;
  const adminUrl = `${args.origin}/assessment/team/admin/${cohort.id}`;
  const printUrl = `${args.origin}/assessment/team/admin/${cohort.id}/print`;
  const reportUrl = sampleReportToken
    ? `${args.origin}/assessment/team/results/${sampleReportToken}`
    : null;

  console.log('\nTeam assessment QA cohort');
  console.log('-------------------------');
  console.log(`Institution: ${cohort.institution_name}`);
  console.log(`Buyer email: ${cohort.buyer_email}`);
  console.log(`Seats:       ${cohort.seats_purchased}`);
  console.log(`Responses:   ${args.responses}`);
  console.log(`Cohort ID:   ${cohort.id}`);
  console.log(`Token:       ${cohort.public_token}`);
  console.log('\nOpen these locally:');
  console.log(`Participant: ${participantUrl}`);
  console.log(`Admin:       ${adminUrl}`);
  console.log(`Print:       ${printUrl}`);
  if (reportUrl) console.log(`Report:      ${reportUrl}`);
  console.log('\nAdmin note: log in with the buyer email above before opening the admin URL.');
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  assertArgs(args);
  const questions = loadQuestions();
  const previewRows = buildRows(questions, '00000000-0000-0000-0000-000000000000', args.responses);

  if (args.dryRun) {
    printLinks({
      args,
      cohort: {
        id: 'dry-run-cohort-id',
        institution_name: args.institution,
        buyer_email: args.buyerEmail,
        seats_purchased: args.seats,
        public_token: 'dry-run-token',
      },
      sampleReportToken: args.responses > 0 ? 'dry-run-personal-report-token' : null,
    });
    console.log('\nDry run only. No Supabase rows were written.');
    console.log(`Sample seeded score: ${previewRows[0]?.score ?? 'n/a'}`);
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  }
  if (!args.allowRemote && !isLocalSupabaseUrl(supabaseUrl)) {
    throw new Error(
      `Refusing to seed non-local Supabase URL: ${supabaseUrl}. Pass --allow-remote only for a disposable staging database.`,
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: cohort, error: cohortError } = await supabase
    .from('team_assessment_cohorts')
    .insert({
      institution_name: args.institution,
      buyer_email: args.buyerEmail.toLowerCase(),
      seats_purchased: args.seats,
      status: 'active',
      report_unlocked_at: args.responses >= 10 ? new Date().toISOString() : null,
    })
    .select('id, institution_name, buyer_email, seats_purchased, public_token')
    .single();

  if (cohortError || !cohort) {
    throw new Error(`Could not create team_assessment_cohorts row: ${cohortError?.message}`);
  }

  let insertedResponses = [];
  if (args.responses > 0) {
    const rows = buildRows(questions, cohort.id, args.responses);
    const { data, error } = await supabase
      .from('team_assessment_responses')
      .insert(rows)
      .select('id, participant_email, personal_report_token, score, department, role');

    if (error) {
      throw new Error(`Could not insert team_assessment_responses rows: ${error.message}`);
    }
    insertedResponses = data ?? [];
  }

  printLinks({
    args,
    cohort,
    sampleReportToken: insertedResponses[0]?.personal_report_token ?? null,
  });
}

main().catch((error) => {
  console.error(`\nseed-team-assessment failed: ${error.message}`);
  process.exit(1);
});
