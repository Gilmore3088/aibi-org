#!/usr/bin/env node
// Audit every process.env.X reference in the codebase and report which
// ones are set in the current environment. Helps operator catch missing
// Vercel env vars before deploy.
//
// Usage:
//   node scripts/audit-env.mjs                         # list
//   node scripts/audit-env.mjs --strict                # exit 1 if required missing
//   node scripts/audit-env.mjs --strict --production   # include launch-only checks
//
// Closes §1.9 of tasks/launch-checklist.md.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import nextEnv from '@next/env';

const ROOT = process.cwd();
const { loadEnvConfig } = nextEnv;
const isProductionFlag =
  process.argv.includes('--production') || process.env.NODE_ENV === 'production';

// Standalone Node scripts do not inherit Next.js environment-file loading.
loadEnvConfig(ROOT, !isProductionFlag);

const SRC_DIRS = ['src'];
const ROOT_FILES = ['next.config.mjs', 'middleware.ts', 'src/middleware.ts'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.js']);
const EXCLUDE = new Set(['node_modules', '.next', '.git', 'playwright-report']);
const EXCLUDE_FILE_RE = /(?:^|\/)(?:.*\.test\.[tj]sx?|.*\.spec\.[tj]sx?|__tests__\/.*)$/;

const OPTIONAL = new Set([
  'ANALYZE',
  'ABANDONED_ASSESSMENT_LOOKBACK_DAYS',
  'ABANDONED_ASSESSMENT_MAX_REMINDERS',
  'ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS',
  'ADMIN_DASHBOARD_EXCLUDED_EMAILS',
  'ADMIN_DASHBOARD_EXCLUDED_EMAIL_PATTERNS',
  'ADMIN_SUPPORT_EMAILS',
  'CERTIFICATE_TRANSFER_LOOKBACK_DAYS',
  'CERTIFICATE_TRANSFER_MAX_CHECKS',
  'CI',
  'COMING_SOON',
  'E2E_ALLOW_PRODUCTION_SUPABASE',
  'ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT',
  'FUNNEL_ADMIN_EMAILS',
  'GEMINI_API_KEY',
  'MAILERLITE_GROUP_ID_ASSESSMENT',
  'MAILERLITE_GROUP_ID_PLAYBOOK',
  'NEXT_PUBLIC_CALENDLY_URL',
  'NEXT_PUBLIC_EXECUTIVE_BRIEFING_URL',
  'NEXT_PUBLIC_LINKEDIN_URL',
  'NEXT_PUBLIC_TWITTER_URL',
  'NEXT_PUBLIC_YOUTUBE_URL',
  'NODE_ENV',
  'OPENAI_API_KEY',
  'OPS_ALERT_EMAIL',
  'OPS_ALERT_WEBHOOK_URL',
  'PAID_REENGAGEMENT_FOUNDATION_NOT_STARTED_AFTER_DAYS',
  'PAID_REENGAGEMENT_FOUNDATION_STALLED_AFTER_DAYS',
  'PAID_REENGAGEMENT_IN_DEPTH_WAITING_AFTER_DAYS',
  'PAID_REENGAGEMENT_LOOKBACK_DAYS',
  'PAID_REENGAGEMENT_MAX_CHECKS',
  'PLAYWRIGHT_BASE_URL',
  'PREVIEW_AUTH_BYPASS',
  'PUPPETEER_LOCAL_CHROME',
  'PUBLIC_PLAYGROUND_DAILY_CAP_CENTS',
  'PUBLIC_PLAYGROUND_PER_IP_PER_DAY',
  'PUBLIC_PLAYGROUND_PER_IP_PER_MINUTE',
  'RESEND_WEBHOOK_SECRET',
  'SKIP_CONVERTKIT',
  'SKIP_CRON_AUTH',
  'SKIP_DEV_BYPASS',
  'SKIP_ENROLLMENT_GATE',
  'SKIP_MAILERLITE',
  'SKIP_PDF_GENERATION',
  'SKIP_RESEND',
  'SKIP_SUPABASE_PROFILES',
  'STRANDED_BUYER_ALERT_AFTER_HOURS',
  'STRANDED_BUYER_LOOKBACK_DAYS',
  'STRANDED_BUYER_MAX_CHECKS',
  'SUPPORT_INBOX_EMAIL',
  'STRIPE_AIBIP_INSTITUTION_PRICE_ID',
  'STRIPE_AIBIP_PRICE_ID',
  'STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID',
  'STRIPE_FOUNDATIONS_PRICE_ID',
  'STRIPE_FOUNDATION_INSTITUTION_PRICE_ID',
  'STRIPE_FOUNDATION_PRICE_ID',
  'STRIPE_TEAM_ASSESSMENT_PRICE_ID',
  'STRIPE_WEBHOOK_SECRET_TEST',
  'VERCEL',
  'VERCEL_ENV',
  'VERCEL_URL',
]);

const HAS_FALLBACK = new Set([
  'STRIPE_AIBIP_PRICE_ID', 'STRIPE_AIBIP_INSTITUTION_PRICE_ID',
]);

const EXPLICIT_ENV_REFS = [
  'ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT',
  'STRIPE_TEAM_ASSESSMENT_PRICE_ID',
];

const PRODUCTION_GROUPS = [
  {
    label: 'ops alert destination',
    names: ['OPS_ALERT_WEBHOOK_URL', 'OPS_ALERT_EMAIL'],
    message:
      'Set OPS_ALERT_WEBHOOK_URL or OPS_ALERT_EMAIL before paid promotion so webhook/email failures alert an operator.',
  },
  {
    label: 'Foundation individual Stripe price',
    names: [
      'STRIPE_FOUNDATION_PRICE_ID',
      'STRIPE_FOUNDATIONS_PRICE_ID',
      'STRIPE_AIBIP_PRICE_ID',
    ],
    message:
      'Set STRIPE_FOUNDATION_PRICE_ID (or a supported legacy fallback) before enabling Foundation checkout.',
  },
  {
    label: 'institution booking URL',
    names: ['NEXT_PUBLIC_EXECUTIVE_BRIEFING_URL', 'NEXT_PUBLIC_CALENDLY_URL'],
    message:
      'Set NEXT_PUBLIC_EXECUTIVE_BRIEFING_URL or NEXT_PUBLIC_CALENDLY_URL for institution inquiry calls to action.',
  },
];

const PRODUCTION_REQUIRED = [
  'ADMIN_SUPPORT_EMAILS',
  'FUNNEL_ADMIN_EMAILS',
  'MAILERLITE_GROUP_ID_ASSESSMENT',
  'MAILERLITE_GROUP_ID_PLAYBOOK',
  'RESEND_WEBHOOK_SECRET',
];

const PRODUCTION_MUST_NOT_EQUAL = [
  {
    name: 'SKIP_RESEND',
    value: 'true',
    message: 'SKIP_RESEND must not be true in production; purchase emails would be suppressed.',
  },
  {
    name: 'SKIP_MAILERLITE',
    value: 'true',
    message: 'SKIP_MAILERLITE must not be true if production nurture is enabled.',
  },
  {
    name: 'SKIP_ENROLLMENT_GATE',
    value: 'true',
    message: 'SKIP_ENROLLMENT_GATE must not be true in production; paid course gates would be bypassed.',
  },
  {
    name: 'SKIP_CRON_AUTH',
    value: 'true',
    message: 'SKIP_CRON_AUTH must not be true in production; cron endpoints would be unauthenticated.',
  },
  {
    name: 'PREVIEW_AUTH_BYPASS',
    value: 'true',
    message: 'PREVIEW_AUTH_BYPASS must not be true in production.',
  },
];

const isStrict = process.argv.includes('--strict');
const isProductionAudit =
  isProductionFlag || process.env.VERCEL_ENV === 'production';

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE.has(entry)) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (EXTENSIONS.has(extname(entry)) && !EXCLUDE_FILE_RE.test(full.replace(ROOT + '/', ''))) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

function addRef(refs, name, file) {
  if (!refs.has(name)) refs.set(name, new Set());
  refs.get(name).add(file.replace(ROOT + '/', ''));
}

function collectEnvRefs() {
  const refs = new Map();
  const filesToScan = [];
  for (const top of SRC_DIRS) {
    let files;
    try { files = walk(join(ROOT, top)); } catch { continue; }
    filesToScan.push(...files);
  }
  for (const file of ROOT_FILES.map((name) => join(ROOT, name))) {
    if (existsSync(file)) filesToScan.push(file);
  }

  for (const file of filesToScan) {
    const content = stripComments(readFileSync(file, 'utf8'));
    const directRe = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
    let m;
    while ((m = directRe.exec(content)) !== null) {
      addRef(refs, m[1], file);
    }

    const destructureRe = /(?:const|let|var)\s*{([^}]+)}\s*=\s*process\.env/g;
    while ((m = destructureRe.exec(content)) !== null) {
      const names = m[1]
        .split(',')
        .map((part) => part.trim().split(':')[0].trim())
        .filter((name) => /^[A-Z_][A-Z0-9_]*$/.test(name));
      for (const name of names) {
        addRef(refs, name, file);
      }
    }
  }

  for (const name of EXPLICIT_ENV_REFS) {
    if (!refs.has(name)) refs.set(name, new Set(['<explicit launch flag>']));
  }

  return refs;
}

const refs = collectEnvRefs();
const names = [...refs.keys()].sort();
const missing = [];
const present = [];
const optional = [];
const productionFailures = [];

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

if (isProductionAudit) {
  for (const name of PRODUCTION_REQUIRED) {
    if (!process.env[name]) {
      productionFailures.push({
        label: name,
        message: `${name} is required in the production environment.`,
        names: [name],
      });
    }
  }

  for (const group of PRODUCTION_GROUPS) {
    const configured = group.names.some((name) => process.env[name]);
    if (!configured) {
      productionFailures.push({
        label: group.label,
        message: group.message,
        names: group.names,
      });
    }
  }

  for (const rule of PRODUCTION_MUST_NOT_EQUAL) {
    if (process.env[rule.name] === rule.value) {
      productionFailures.push({
        label: rule.name,
        message: rule.message,
        names: [rule.name],
      });
    }
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
if (isProductionAudit) {
  if (productionFailures.length) {
    console.log(`\n  ✗ ${productionFailures.length} production launch check(s) failed:`);
    productionFailures.forEach((failure) => {
      console.log(`     ${failure.label}\n       ${failure.message}`);
    });
  } else {
    console.log('\n  ✓ production launch checks passed');
  }
}
console.log('');

const failureCount =
  missing.length + (isProductionAudit ? productionFailures.length : 0);

if (isStrict && failureCount > 0) {
  console.error(`Strict mode: ${failureCount} required env/config checks failed.`);
  process.exit(1);
}
