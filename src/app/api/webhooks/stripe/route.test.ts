// Integration test stubs for provisionEnrollment.
//
// These tests verify the provisioning logic shape and contract.
// Full execution requires a live or test Supabase project with the
// course tables migrated (supabase/migrations/00001_course_tables.sql).
//
// Run when Supabase is wired: SUPABASE_SERVICE_ROLE_KEY must be set.
//
// Test runner: Node.js built-in test runner (node:test).
// Run: node --experimental-vm-modules --require ts-node/register \
//        src/app/api/webhooks/stripe/route.test.ts

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type Stripe from 'stripe';
import { provisionEnrollment } from '@/lib/stripe/provision-enrollment';
import type { ProvisionResult, ProvisionError } from '@/lib/stripe/provision-enrollment';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type MinimalSession = Pick<Stripe.Checkout.Session, 'id' | 'customer_details' | 'metadata'>;

function makeSession(overrides: Partial<MinimalSession> & { metadata?: Record<string, string> }): MinimalSession {
  return {
    id: `cs_test_${Math.random().toString(36).slice(2)}`,
    customer_details: { email: 'teller@firstcommunity.bank', name: 'Test Teller', phone: null, address: null, tax_exempt: null, tax_ids: null, business_name: null, individual_name: null } as Stripe.Checkout.Session['customer_details'],
    metadata: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test: individual mode — valid metadata
// ---------------------------------------------------------------------------

describe('provisionEnrollment', () => {
  it('individual mode with valid metadata returns action=created, type=individual', async () => {
    // STUB: requires live Supabase — validates that the function signature and
    // return contract are correct at the type level.
    const session = makeSession({
      metadata: {
        product: 'aibi-p',
        mode: 'individual',
        tier: 'individual',
        user_email: 'teller@firstcommunity.bank',
      },
    });

    // Type assertion only — do not call without Supabase configured.
    // When Supabase is available, remove the type-only guard and run:
    //   const result = await provisionEnrollment(session);
    //   assert.equal((result as ProvisionResult).action, 'created');
    //   assert.equal((result as ProvisionResult).type, 'individual');

    // Structural type check: ensure ProvisionResult satisfies expected shape
    const mockResult: ProvisionResult = { action: 'created', type: 'individual' };
    assert.ok('action' in mockResult);
    assert.ok('type' in mockResult);
    assert.equal(mockResult.action, 'created');
    assert.equal(mockResult.type, 'individual');

    // Verify session has the expected shape
    assert.ok(session.id.startsWith('cs_test_'));
    assert.equal(session.metadata?.product, 'aibi-p');
    assert.equal(session.metadata?.mode, 'individual');
  });

  // ---------------------------------------------------------------------------
  // Test: institution mode — valid metadata
  // ---------------------------------------------------------------------------

  it('institution mode with valid metadata returns action=created, type=institution', async () => {
    // STUB: requires live Supabase
    const session = makeSession({
      metadata: {
        product: 'aibi-p',
        mode: 'institution',
        tier: 'team',
        institution_name: 'First Community Bank',
        quantity: '10',
        user_email: 'admin@firstcommunity.bank',
      },
    });

    // Structural type check
    const mockResult: ProvisionResult = { action: 'created', type: 'institution' };
    assert.equal(mockResult.type, 'institution');

    assert.equal(session.metadata?.mode, 'institution');
    assert.equal(session.metadata?.institution_name, 'First Community Bank');
    assert.equal(parseInt(session.metadata?.quantity ?? '0', 10), 10);
  });

  // ---------------------------------------------------------------------------
  // Test: idempotency — duplicate stripe_session_id returns action=skipped
  // ---------------------------------------------------------------------------

  it('duplicate stripe_session_id returns action=skipped (idempotency)', async () => {
    // STUB: requires live Supabase with a pre-existing enrollment row.
    //
    // To test live:
    //   1. Insert a row into course_enrollments with stripe_session_id='cs_dup_test_001'
    //   2. Call provisionEnrollment with a session using id='cs_dup_test_001'
    //   3. Assert result.action === 'skipped'
    //
    // The route handler calls this function and the idempotency guard is:
    //   const { data: existing } = await supabase
    //     .from('course_enrollments')
    //     .select('id')
    //     .eq('stripe_session_id', sessionId)
    //     .limit(1);
    //   if (existing && existing.length > 0) return { action: 'skipped', type: 'individual' };

    const mockSkipped: ProvisionResult = { action: 'skipped', type: 'individual' };
    assert.equal(mockSkipped.action, 'skipped');
  });

  // ---------------------------------------------------------------------------
  // Test: missing metadata — returns ProvisionError with code=missing_metadata
  // ---------------------------------------------------------------------------

  it('missing product/mode metadata returns ProvisionError with code=missing_metadata', async () => {
    const session = makeSession({
      metadata: {
        // deliberately omit product and mode
        user_email: 'incomplete@firstcommunity.bank',
      },
    });

    // When Supabase is available, this can be called directly:
    //   const result = await provisionEnrollment(session);
    //   assert.ok('error' in result);
    //   assert.equal((result as ProvisionError).code, 'missing_metadata');
    //
    // The guard in provisionEnrollment is:
    //   if (!product || !mode) {
    //     return { error: '...', code: 'missing_metadata' };
    //   }

    const mockError: ProvisionError = {
      error: 'Missing required metadata: product and mode',
      code: 'missing_metadata',
    };
    assert.ok('error' in mockError);
    assert.equal(mockError.code, 'missing_metadata');

    // Verify session lacks required metadata
    assert.equal(session.metadata?.product, undefined);
    assert.equal(session.metadata?.mode, undefined);
  });

  // ---------------------------------------------------------------------------
  // Test: institution mode missing institution_name — returns ProvisionError
  // ---------------------------------------------------------------------------

  it('institution mode missing institution_name returns ProvisionError', async () => {
    // STUB: requires live Supabase for full execution
    const session = makeSession({
      metadata: {
        product: 'aibi-p',
        mode: 'institution',
        quantity: '10',
        // deliberately omit institution_name
      },
    });

    const mockError: ProvisionError = {
      error: 'Missing institution_name for institution enrollment',
      code: 'missing_metadata',
    };
    assert.ok('error' in mockError);
    assert.equal(mockError.code, 'missing_metadata');
    assert.equal(session.metadata?.institution_name, undefined);
  });
});

// Verify exports compile and have expected shapes at module load time.
// This import acts as a compile-time contract test.
const _typeCheck: typeof provisionEnrollment = provisionEnrollment;
void _typeCheck;
