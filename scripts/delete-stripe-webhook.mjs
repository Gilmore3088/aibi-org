#!/usr/bin/env node
// scripts/delete-stripe-webhook.mjs
//
// Interactive, confirmation-gated deletion of a Stripe webhook endpoint.
//
// CLAUDE.md rule: "NEVER delete, drop, or destroy ANY external resource
// without EXPLICIT user approval." This wrapper makes deletion a
// deliberate three-step action:
//
//   1. Shows what's about to be deleted (URL, status, event count).
//   2. Refuses --live unless --i-mean-live is also passed.
//   3. Requires the operator to retype the endpoint ID exactly.
//
// USAGE:
//   # Sandbox endpoint:
//   node scripts/delete-stripe-webhook.mjs we_1TTmbRRy9NIFjtIIi8nUIPVJ
//
//   # Live endpoint (rare — both flags required):
//   stripe login --interactive   # pair to production account first
//   node scripts/delete-stripe-webhook.mjs we_xxx --live --i-mean-live

import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const args = process.argv.slice(2);
const endpointId = args.find((a) => a.startsWith('we_'));
const live = args.includes('--live');
const liveConfirm = args.includes('--i-mean-live');

if (!endpointId) {
  console.error('Usage: node scripts/delete-stripe-webhook.mjs we_<id> [--live --i-mean-live]');
  process.exit(2);
}

if (live && !liveConfirm) {
  console.error(
    '\n\x1b[31m✗ Refusing --live without --i-mean-live.\x1b[0m\n\n' +
      'Production webhook endpoints fulfill real $99 / $295 purchases.\n' +
      'If you really want to delete a LIVE endpoint, pass both flags:\n\n' +
      `  node scripts/delete-stripe-webhook.mjs ${endpointId} --live --i-mean-live\n`,
  );
  process.exit(2);
}

function red(s) { return `\x1b[31m${s}\x1b[0m`; }
function green(s) { return `\x1b[32m${s}\x1b[0m`; }
function bold(s) { return `\x1b[1m${s}\x1b[0m`; }
function dim(s) { return `\x1b[2m${s}\x1b[0m`; }

function runStripe(cliArgs) {
  const result = spawnSync('stripe', cliArgs, { encoding: 'utf8' });
  if (result.error) {
    console.error(red('stripe CLI not found on PATH.'));
    process.exit(2);
  }
  if (result.status !== 0) {
    console.error(red(`stripe ${cliArgs.join(' ')} exited ${result.status}`));
    console.error(result.stderr);
    process.exit(2);
  }
  return result.stdout;
}

function accountId() {
  const out = runStripe(['config', '--list']);
  const m = out.match(/account_id\s*=\s*'([^']+)'/);
  return m ? m[1] : 'unknown';
}

function retrieve(id) {
  const cli = ['webhook_endpoints', 'retrieve', id];
  if (live) cli.push('--live');
  const stdout = runStripe(cli);
  try {
    return JSON.parse(stdout);
  } catch {
    console.error(red('Could not parse `stripe webhook_endpoints retrieve` JSON.'));
    console.error(stdout.slice(0, 400));
    process.exit(2);
  }
}

const mode = live ? 'LIVE PRODUCTION' : 'SANDBOX';
const ep = retrieve(endpointId);

console.log(`\n${bold(`About to delete a ${mode} webhook endpoint`)}`);
console.log(`  account:    ${accountId()}`);
console.log(`  endpoint:   ${ep.id}`);
console.log(`  url:        ${ep.url}`);
console.log(`  status:     ${ep.status}`);
console.log(`  events:     ${(ep.enabled_events ?? []).length} subscribed`);
console.log(dim(`              (${(ep.enabled_events ?? []).join(', ').slice(0, 200)}${(ep.enabled_events ?? []).join(', ').length > 200 ? '…' : ''})`));
console.log(`  created:    ${new Date((ep.created ?? 0) * 1000).toISOString()}`);

console.log(red(`\n⚠️  DELETING A WEBHOOK ENDPOINT IS PERMANENT.`));
console.log(red(`   Events fired by Stripe will stop reaching this URL via this endpoint.`));
if (live) console.log(red(`   THIS IS THE LIVE ACCOUNT. Real purchases depend on these events.`));

const rl = createInterface({ input: stdin, output: stdout });
const answer = await rl.question(
  `\nType the endpoint ID exactly (${ep.id}) to confirm, or anything else to abort: `,
);
rl.close();

if (answer.trim() !== ep.id) {
  console.log(green('\n✓ Aborted. No changes made.'));
  process.exit(0);
}

const deleteCli = ['webhook_endpoints', 'delete', endpointId];
if (live) deleteCli.push('--live');
console.log(dim(`\n→ stripe ${deleteCli.join(' ')}`));
const out = runStripe(deleteCli);
console.log(green('\n✓ Deleted.'));
console.log(dim(out.trim().slice(0, 400)));
