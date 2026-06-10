// scripts/verify-refund-revocation.mjs
//
// Dry-run for finding #4 in docs/auth-review-2026-06-06.html:
// charge.refunded webhook handler revokes course_enrollments via the
// entitlements trigger.
//
// HOW TO RUN (sandbox only — see CLAUDE.md "Stripe — Two Accounts"):
//
//   1) Confirm CLI is paired to the SANDBOX, not live:
//        stripe config --list   # account.id should be acct_1TTll2Ry9NIFjtII
//
//   2) Start the Next.js app pointing at the SANDBOX webhook secret:
//        STRIPE_WEBHOOK_SECRET=whsec_<sandbox> npm run dev
//
//   3) In another terminal, forward Stripe events to your dev server:
//        stripe listen --forward-to localhost:3000/api/webhooks/stripe
//      Note the whsec_… that `stripe listen` prints — use that as
//      STRIPE_WEBHOOK_SECRET above.
//
//   4) Seed a course_enrollments row with a known stripe_session_id
//      (any value — the refund handler resolves the session from the
//      PaymentIntent on the Charge object, then matches by session id):
//        node scripts/verify-refund-revocation.mjs --seed
//
//   5) Fire the trigger:
//        stripe trigger charge.refunded
//
//   6) Verify revocation:
//        node scripts/verify-refund-revocation.mjs --check
//
// Expected log lines in the dev-server terminal:
//   [webhook] received { type: 'charge.refunded', id: 'evt_…' }
//   [webhook] charge.refunded revoked enrollments { sessionId: '…', revoked: 1 }
//
// Expected outcome:
//   - course_enrollments row deleted (verified by --check)
//   - entitlements row for the same user now has active=false, revoked_at=now()
//
// NEVER run this against production. The CLI must show acct_1TTll2Ry9NIFjtII.

import { createClient } from '@supabase/supabase-js';

const SEED_EMAIL = 'refund-dryrun@example.com';
const SEED_PRODUCT = 'aibi-p';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function seed() {
  const supabase = getSupabase();
  // Stripe's `stripe trigger charge.refunded` produces a charge with a
  // payment_intent, but the session id we'd need to match against is
  // synthetic — the trigger doesn't create a checkout session at all.
  // Use the explicit override: this script seeds a row keyed by a
  // sentinel session id and the operator can swap the handler lookup
  // OR use a real test purchase + manual refund for the full path.
  const sessionId = `dryrun_${Date.now()}`;
  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({
      email: SEED_EMAIL,
      product: SEED_PRODUCT,
      stripe_session_id: sessionId,
    })
    .select('id, email, product, stripe_session_id')
    .single();
  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
  console.log('Seeded course_enrollments row:', data);
  console.log('\nNext:');
  console.log('  1. Create a real $99 In-Depth Assessment checkout via the');
  console.log('     sandbox payment link and complete it with 4242 4242 4242 4242.');
  console.log('  2. From the Stripe dashboard (sandbox), refund the payment.');
  console.log('  3. Watch the dev server log for the [webhook] charge.refunded line.');
  console.log('  4. Run this script with --check to confirm revocation.');
  console.log(
    '\n(Note: `stripe trigger charge.refunded` alone will NOT match the seeded row',
  );
  console.log(
    ' because the trigger fixture has no associated checkout session — use a real',
  );
  console.log(' test purchase + manual refund in the dashboard for end-to-end proof.)');
}

async function check() {
  const supabase = getSupabase();
  const { data: enrollments, error: enrollErr } = await supabase
    .from('course_enrollments')
    .select('id, email, product, stripe_session_id')
    .eq('email', SEED_EMAIL);
  if (enrollErr) {
    console.error('Query failed:', enrollErr.message);
    process.exit(1);
  }
  console.log(`course_enrollments for ${SEED_EMAIL}: ${enrollments?.length ?? 0} rows`);
  if (enrollments?.length === 0) {
    console.log('✓ Revoked — row deleted by charge.refunded handler.');
  } else {
    console.log('✗ Still present:', enrollments);
    console.log(
      'If the refund fired against a different sessionId, that\'s expected.',
    );
  }

  // Cross-check: the entitlements trigger should have flipped active=false
  // on the matching entitlements row.
  const { data: entitlements } = await supabase
    .from('entitlements')
    .select('user_id, product, active, revoked_at, source_ref')
    .eq('source', 'course_enrollment');
  const revoked = entitlements?.filter((e) => !e.active && e.revoked_at) ?? [];
  console.log(`\nRecently-revoked entitlements: ${revoked.length}`);
  for (const e of revoked.slice(0, 5)) {
    console.log(' ', e);
  }
}

const mode = process.argv[2];
if (mode === '--seed') {
  await seed();
} else if (mode === '--check') {
  await check();
} else {
  console.log('Usage:');
  console.log('  node scripts/verify-refund-revocation.mjs --seed');
  console.log('  node scripts/verify-refund-revocation.mjs --check');
  process.exit(1);
}
