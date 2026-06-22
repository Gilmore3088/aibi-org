#!/usr/bin/env node
// Verify the Supabase schema needed by the paid Foundation course.
//
// This is intentionally read-only: it checks that the tables the course,
// Toolbox, packet, and E2E seed paths depend on are visible through the
// configured Supabase service-role client. Use `--strict` in CI or before
// calling the DB-backed paid learner E2E complete.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const ENV_FILES = ['.env.local', '.env'];

const TABLE_GROUPS = [
  {
    label: 'Course purchase and progress',
    tables: [
      'course_enrollments',
      'entitlements',
      'activity_responses',
      'work_submissions',
      'certificates',
    ],
  },
  {
    label: 'Foundation packet and practice state',
    tables: [
      'user_artifacts',
      'saved_prompts',
      'practice_rep_completions',
      'quick_wins',
      'user_profiles',
    ],
  },
  {
    label: 'Toolbox and lab runtime',
    tables: [
      'toolbox_skills',
      'toolbox_library_skills',
      'toolbox_library_skill_versions',
      'toolbox_recipes',
      'ai_usage_log',
      'rate_limits',
    ],
  },
  {
    label: 'Authenticated E2E gates',
    tables: ['trusted_devices'],
  },
];

const REQUIRED_TABLES = TABLE_GROUPS.flatMap((group) => group.tables);

function loadEnvFile(file) {
  const path = resolve(ROOT, file);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ||= value;
  }
}

function supabaseTarget(url) {
  try {
    const parsed = new URL(url);
    const isLocal = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
    return {
      url,
      host: parsed.host,
      isLocal,
      projectRef: isLocal ? null : parsed.hostname.split('.')[0],
    };
  } catch {
    return { url, host: 'invalid-url', isLocal: false, projectRef: null };
  }
}

async function checkTable(client, table) {
  const { error } = await client.from(table).select('*').limit(1);
  if (!error) return { table, ok: true };
  return {
    table,
    ok: false,
    code: error.code ?? 'unknown',
    message: error.message,
  };
}

async function main() {
  for (const file of ENV_FILES) loadEnvFile(file);

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const strict = process.argv.includes('--strict');
  const json = process.argv.includes('--json');

  if (!url || !serviceRole) {
    const payload = {
      ok: false,
      missingEnv: [
        !url ? 'SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL' : null,
        !serviceRole ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
      ].filter(Boolean),
    };
    if (json) console.log(JSON.stringify(payload, null, 2));
    else {
      console.error('Course schema check failed: missing Supabase environment.');
      for (const name of payload.missingEnv) console.error(`  - ${name}`);
    }
    process.exit(1);
  }

  const target = supabaseTarget(url);
  const client = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const checks = [];
  for (const table of REQUIRED_TABLES) checks.push(await checkTable(client, table));

  const missing = checks.filter((check) => !check.ok);
  const payload = {
    ok: missing.length === 0,
    target: {
      host: target.host,
      local: target.isLocal,
      projectRef: target.projectRef,
    },
    groups: TABLE_GROUPS.map((group) => ({
      label: group.label,
      tables: group.tables.map((table) => checks.find((check) => check.table === table)),
    })),
    missingTables: missing.map((check) => check.table),
  };

  if (json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log('\nFoundation course Supabase schema check');
    console.log('='.repeat(48));
    console.log(`Target: ${target.host}${target.isLocal ? ' (local)' : ''}`);
    if (target.projectRef) console.log(`Project ref: ${target.projectRef}`);

    for (const group of payload.groups) {
      console.log(`\n${group.label}`);
      for (const check of group.tables) {
        if (check?.ok) {
          console.log(`  ✓ ${check.table}`);
        } else {
          console.log(`  ✗ ${check?.table}`);
          console.log(`    ${check?.code ?? 'unknown'}: ${check?.message ?? 'missing check'}`);
        }
      }
    }

    if (payload.ok) {
      console.log('\nSchema is ready for DB-backed paid-course E2E.');
    } else {
      console.log(`\nMissing ${missing.length} required table(s): ${payload.missingTables.join(', ')}`);
      console.log('Apply Supabase migrations before running the paid learner persistence E2E.');
    }
  }

  if (strict && !payload.ok) process.exit(1);
}

main().catch((error) => {
  console.error('Course schema check failed:', error);
  process.exit(1);
});
