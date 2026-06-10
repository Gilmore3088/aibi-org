#!/usr/bin/env node
// scripts/audit-stripe-webhooks.mjs
//
// Audits the Stripe Dashboard webhook subscription against the four
// events the live-mode handler depends on (per CLAUDE.md + the auth
// review's finding #2 in the Stripe section).
//
// USAGE:
//   # Sandbox (CLI is paired here by default):
//   node scripts/audit-stripe-webhooks.mjs
//
//   # Live account (pair first):
//   stripe login --interactive   # pick the production account
//   node scripts/audit-stripe-webhooks.mjs --live
//
// What it checks for each webhook endpoint:
//   - URL matches the canonical /api/webhooks/stripe (any other path
//     is a misconfiguration that 404s as HTML)
//   - status === 'enabled'
//   - enabled_events ⊇ REQUIRED_EVENTS (or ['*'])
//
// Exits 0 if every endpoint passes, 1 otherwise. Designed to be a
// one-command Go/No-Go on the Stripe side before merging code that
// depends on these events.

import { spawnSync } from 'node:child_process';

const REQUIRED_EVENTS = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
];

const CANONICAL_PATH = '/api/webhooks/stripe';

const args = process.argv.slice(2);
const live = args.includes('--live');
const mode = live ? 'LIVE' : 'SANDBOX';

function dim(s) { return `\x1b[2m${s}\x1b[0m`; }
function red(s) { return `\x1b[31m${s}\x1b[0m`; }
function green(s) { return `\x1b[32m${s}\x1b[0m`; }
function yellow(s) { return `\x1b[33m${s}\x1b[0m`; }
function bold(s) { return `\x1b[1m${s}\x1b[0m`; }

function runStripe(cliArgs) {
  const result = spawnSync('stripe', cliArgs, { encoding: 'utf8' });
  if (result.error) {
    console.error(red('stripe CLI not found on PATH.'));
    console.error('Install: brew install stripe/stripe-cli/stripe');
    process.exit(2);
  }
  if (result.status !== 0) {
    console.error(red(`stripe ${cliArgs.join(' ')} exited ${result.status}`));
    console.error(result.stderr);
    process.exit(2);
  }
  return result.stdout;
}

function fetchAccountId() {
  const out = runStripe(['config', '--list']);
  const m = out.match(/account_id\s*=\s*'([^']+)'/);
  return m ? m[1] : 'unknown';
}

function fetchEndpoints() {
  const cliArgs = ['webhook_endpoints', 'list', '--limit', '50'];
  if (live) cliArgs.push('--live');
  const stdout = runStripe(cliArgs);
  try {
    return JSON.parse(stdout);
  } catch {
    console.error(red('Could not parse `stripe webhook_endpoints list` JSON.'));
    console.error(stdout.slice(0, 400));
    process.exit(2);
  }
}

function reportEndpoint(ep, index) {
  const id = ep.id ?? '<no id>';
  const url = ep.url ?? '<no url>';
  const status = ep.status ?? 'unknown';
  const enabled = ep.enabled_events ?? [];
  const wildcard = enabled.includes('*');
  const missing = wildcard
    ? []
    : REQUIRED_EVENTS.filter((e) => !enabled.includes(e));

  console.log(bold(`\n[${index + 1}] ${id}`));
  console.log(`    url:     ${url}`);
  console.log(`    status:  ${status === 'enabled' ? green(status) : red(status)}`);
  console.log(
    `    events:  ${wildcard ? green('* (all)') : `${enabled.length} subscribed`}`,
  );

  const issues = [];
  if (status !== 'enabled') {
    issues.push(`endpoint status is "${status}" (expected "enabled")`);
  }
  if (!url.endsWith(CANONICAL_PATH)) {
    issues.push(
      `URL does not end with ${CANONICAL_PATH} — Next.js will 404 and Stripe will record failed deliveries`,
    );
  }
  if (missing.length > 0) {
    issues.push(
      `missing required events: ${missing.join(', ')}`,
    );
  }

  if (issues.length === 0) {
    console.log(`    verdict: ${green('PASS')}`);
    return true;
  }
  console.log(`    verdict: ${red('FAIL')}`);
  for (const issue of issues) console.log(`             ${red('•')} ${issue}`);
  return false;
}

function main() {
  console.log(bold(`Stripe webhook audit — ${mode} mode`));
  console.log(dim(`account: ${fetchAccountId()}${live ? '' : ' (CLI default; pair to live with `stripe login --interactive`)'}`));
  console.log(dim(`required: ${REQUIRED_EVENTS.join(', ')}`));

  const list = fetchEndpoints();
  const endpoints = Array.isArray(list?.data) ? list.data : [];

  if (endpoints.length === 0) {
    console.log(red('\nNo webhook endpoints configured. Refund + failed-payment handling will never fire.'));
    process.exit(1);
  }

  let allPass = true;
  endpoints.forEach((ep, i) => {
    if (!reportEndpoint(ep, i)) allPass = false;
  });

  console.log(`\n${bold('Summary:')} ${allPass ? green('all endpoints PASS') : red('one or more endpoints FAIL')}`);
  console.log(
    dim(
      `Mode flag: ${live ? '--live (production)' : '(sandbox — default)'}.`,
    ),
  );
  console.log(
    dim('Sandbox endpoints will normally fail the URL check unless you have one pointed at production; that is expected for the sandbox account.'),
  );

  process.exit(allPass ? 0 : 1);
}

main();
