// Regression tests for F1 (refund/checkout audit, 2026-06-07):
// an individual enrollment must NEVER be inserted with a null user_id.
//
// Why this matters: the entitlements sync trigger (migrations 00015/00035)
// fires AFTER INSERT on course_enrollments and writes
// entitlements.user_id = course_enrollments.user_id. entitlements.user_id is
// NOT NULL, so a null-user_id enrollment makes the trigger throw and rolls
// back the whole enrollment — the buyer is charged but never provisioned.
// This previously broke the anonymous In-Depth purchase path (no prior
// account). The fix ensures the auth account exists (ensureAuthUser) before
// the insert, so user_id is always resolved.

import { describe, expect, it, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';

const fromMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));

vi.mock('@/lib/supabase/auth-admin', () => ({
  ensureAuthUser: vi.fn(),
}));

import { provisionEnrollment } from './provision-enrollment';
import { ensureAuthUser } from '@/lib/supabase/auth-admin';

const ensureAuthUserMock = vi.mocked(ensureAuthUser);

type MinimalSession = Pick<Stripe.Checkout.Session, 'id' | 'customer_details' | 'metadata'>;

const BUYER_EMAIL = 'leader@firstcommunity.bank';

function makeIndividualSession(product: string): MinimalSession {
  return {
    id: 'cs_test_indepth_anon',
    customer_details: { email: BUYER_EMAIL } as unknown as Stripe.Checkout.Session['customer_details'],
    metadata: { product, mode: 'individual', tier: 'individual' },
  };
}

let insertSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fromMock.mockReset();
  ensureAuthUserMock.mockReset();
  insertSpy = vi.fn(async () => ({ error: null }));
  // course_enrollments query builder: the idempotency check
  // (.select().eq().limit()) resolves to no existing rows, and .insert()
  // captures the payload so we can assert on user_id.
  fromMock.mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn(async () => ({ data: [], error: null })),
    insert: insertSpy,
  }));
});

describe('provisionEnrollment — F1: enrollment user_id is never null', () => {
  it('ensures an auth account first and inserts the resolved user_id (anonymous In-Depth buyer)', async () => {
    ensureAuthUserMock.mockResolvedValue({ userId: 'user-new-123', created: true });

    const result = await provisionEnrollment(makeIndividualSession('in-depth-assessment'));

    expect(ensureAuthUserMock).toHaveBeenCalledWith(BUYER_EMAIL);
    expect(insertSpy).toHaveBeenCalledTimes(1);
    const payload = insertSpy.mock.calls[0][0] as { user_id: unknown; product: string };
    expect(payload.user_id).toBe('user-new-123');
    expect(payload.product).toBe('in-depth-assessment');
    expect(result).toEqual({ action: 'created', type: 'individual' });
  });

  it('inserts the resolved user_id for a Foundation purchase too', async () => {
    ensureAuthUserMock.mockResolvedValue({ userId: 'user-existing-456', created: false });

    const result = await provisionEnrollment(makeIndividualSession('foundation'));

    const payload = insertSpy.mock.calls[0][0] as { user_id: unknown; product: string };
    expect(payload.user_id).toBe('user-existing-456');
    expect(payload.product).toBe('foundation');
    expect(result).toEqual({ action: 'created', type: 'individual' });
  });

  it('does NOT insert a null-user_id row when the account cannot be ensured (returns retryable db_error)', async () => {
    ensureAuthUserMock.mockResolvedValue({
      userId: null,
      created: false,
      skipped: 'create-and-lookup-failed',
    });

    const result = await provisionEnrollment(makeIndividualSession('in-depth-assessment'));

    expect(insertSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ error: 'Could not resolve buyer account', code: 'db_error' });
  });
});
