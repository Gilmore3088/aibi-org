import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type Stripe from 'stripe';

// ─── Module mocks (must be declared before SUT import) ──────────────

vi.mock('@/lib/supabase/client', () => {
  // Per-table query builder. Each table gets its own state so a single
  // test can stage existing-row vs insert behavior independently.
  const tableState: Record<
    string,
    {
      selectResult: { data: unknown[] | null; error: unknown };
      insertResult: { error: unknown; data?: unknown };
    }
  > = {};

  function getState(name: string) {
    if (!tableState[name]) {
      tableState[name] = {
        selectResult: { data: [], error: null },
        insertResult: { error: null, data: { id: `row-${name}` } },
      };
    }
    return tableState[name];
  }

  const from = vi.fn((tableName: string) => {
    const state = getState(tableName);
    const limit = vi.fn(() => Promise.resolve(state.selectResult));
    const eq = vi.fn(() => ({ limit, eq, maybeSingle: () => Promise.resolve({ data: null, error: null }) }));
    const select = vi.fn(() => ({
      eq,
      limit,
      single: () =>
        Promise.resolve({
          data: state.insertResult.data ?? { id: `row-${tableName}` },
          error: state.insertResult.error,
        }),
    }));
    const insert = vi.fn(() => ({
      ...Promise.resolve(state.insertResult),
      select: () => ({
        single: () =>
          Promise.resolve({
            data: state.insertResult.data ?? { id: `row-${tableName}` },
            error: state.insertResult.error,
          }),
      }),
      then: (resolve: (v: { error: unknown }) => unknown) =>
        Promise.resolve(state.insertResult).then(resolve),
    }));
    const updateEq = vi.fn(() => Promise.resolve({ error: null }));
    const update = vi.fn(() => ({ eq: updateEq }));
    return { select, insert, update, eq, limit };
  });

  const listUsers = vi.fn(() => Promise.resolve({ data: { users: [] } }));
  const client = { from, auth: { admin: { listUsers } } };

  return {
    createServiceRoleClient: vi.fn(() => client),
    __mock: { from, tableState, reset: () => {
      for (const k of Object.keys(tableState)) delete tableState[k];
    } },
  };
});

vi.mock('@/lib/resend', () => ({
  sendIndepthIndividualInvite: vi.fn(() => Promise.resolve({ status: 'sent' })),
}));

vi.mock('@/lib/convertkit/sequences', () => ({
  tagSubscriberByEnv: vi.fn(() => Promise.resolve({ status: 'tagged' })),
}));

vi.mock('@/lib/indepth/tokens', () => ({
  generateInviteToken: vi.fn(() => 'fixed-test-token-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
}));

import { provisionEnrollment, type ProvisionResult } from './provision-enrollment';
import * as supabaseClient from '@/lib/supabase/client';
import * as resend from '@/lib/resend';
import * as ckSeq from '@/lib/convertkit/sequences';

const supaMock = (supabaseClient as unknown as {
  __mock: {
    from: ReturnType<typeof vi.fn>;
    tableState: Record<
      string,
      { selectResult: { data: unknown[] | null; error: unknown }; insertResult: { error: unknown } }
    >;
    reset: () => void;
  };
}).__mock;

function setSelect(table: string, data: unknown[] | null, error: unknown = null) {
  supaMock.tableState[table] = supaMock.tableState[table] ?? {
    selectResult: { data: [], error: null },
    insertResult: { error: null },
  };
  supaMock.tableState[table].selectResult = { data, error };
}

function setInsertError(table: string, error: unknown) {
  supaMock.tableState[table] = supaMock.tableState[table] ?? {
    selectResult: { data: [], error: null },
    insertResult: { error: null },
  };
  supaMock.tableState[table].insertResult = { error };
}

function buildSession(metadata: Record<string, string>, email = 'buyer@example.com'): Pick<
  Stripe.Checkout.Session,
  'id' | 'customer_details' | 'metadata'
> {
  return {
    id: 'cs_test_' + Math.random().toString(36).slice(2),
    customer_details: { email } as Stripe.Checkout.Session['customer_details'],
    metadata,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  supaMock.reset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── Type contract ────────────────────────────────────────────────────

describe('ProvisionResult type', () => {
  it('accepts the new indepth union members at the type level', () => {
    const a: ProvisionResult = { action: 'created', type: 'indepth-individual' };
    const b: ProvisionResult = { action: 'skipped', type: 'indepth-institution' };
    const c: ProvisionResult = { action: 'created', type: 'individual' };
    const d: ProvisionResult = { action: 'skipped', type: 'institution' };
    expect([a, b, c, d]).toHaveLength(4);
  });
});

// ─── indepth-individual branch ────────────────────────────────────────

describe('provisionEnrollment — indepth-assessment / individual', () => {
  const baseMeta = {
    product: 'indepth-assessment',
    mode: 'individual',
    leader_email: 'leader@bank.example',
  };

  it('creates a takers row, fires invite email + CK tag', async () => {
    const session = buildSession(baseMeta);
    const result = await provisionEnrollment(session);

    expect(result).toEqual({ action: 'created', type: 'indepth-individual' });
    expect(supaMock.from).toHaveBeenCalledWith('indepth_takes');
    expect(resend.sendIndepthIndividualInvite).toHaveBeenCalledTimes(1);
    expect(ckSeq.tagSubscriberByEnv).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'leader@bank.example',
        tagIdEnv: 'CONVERTKIT_TAG_ID_INDEPTH_INDIVIDUAL',
        tagName: 'indepth-assessment-individual',
      }),
    );
  });

  it('falls back to customer_details.email when leader_email metadata is absent', async () => {
    const session = buildSession(
      { product: 'indepth-assessment', mode: 'individual' },
      'fallback@example.com',
    );
    const result = await provisionEnrollment(session);
    expect(result).toEqual({ action: 'created', type: 'indepth-individual' });
    expect(resend.sendIndepthIndividualInvite).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'fallback@example.com' }),
    );
  });

  it('returns missing_metadata when no email is available anywhere', async () => {
    const session = {
      id: 'cs_x',
      customer_details: null,
      metadata: { product: 'indepth-assessment', mode: 'individual' },
    } as unknown as Pick<Stripe.Checkout.Session, 'id' | 'customer_details' | 'metadata'>;
    const result = await provisionEnrollment(session);
    expect(result).toMatchObject({ code: 'missing_metadata' });
  });

  it('returns skipped (idempotent) when stripe_session_id row already exists', async () => {
    setSelect('indepth_takes', [{ id: 'existing-id' }]);
    const result = await provisionEnrollment(buildSession(baseMeta));
    expect(result).toEqual({ action: 'skipped', type: 'indepth-individual' });
    expect(resend.sendIndepthIndividualInvite).not.toHaveBeenCalled();
  });

  it('treats a 23505 unique-violation on insert as skipped (race idempotency)', async () => {
    setInsertError('indepth_takes', { code: '23505', message: 'unique violation' });
    const result = await provisionEnrollment(buildSession(baseMeta));
    expect(result).toEqual({ action: 'skipped', type: 'indepth-individual' });
  });

  it('returns db_error on non-unique insert failure', async () => {
    setInsertError('indepth_takes', { code: '42P01', message: 'oops' });
    const result = await provisionEnrollment(buildSession(baseMeta));
    expect(result).toMatchObject({ code: 'db_error' });
  });
});

// ─── indepth-institution branch ───────────────────────────────────────

describe('provisionEnrollment — indepth-assessment / institution', () => {
  const baseMeta = {
    product: 'indepth-assessment',
    mode: 'institution',
    leader_email: 'leader@bank.example',
    institution_name: 'First Bank of Test',
    quantity: '15',
  };

  it('creates a leader row and tags the leader', async () => {
    const session = buildSession(baseMeta);
    const result = await provisionEnrollment(session);

    expect(result).toEqual({ action: 'created', type: 'indepth-institution' });
    expect(supaMock.from).toHaveBeenCalledWith('indepth_takes');
    expect(ckSeq.tagSubscriberByEnv).toHaveBeenCalledWith(
      expect.objectContaining({
        tagIdEnv: 'CONVERTKIT_TAG_ID_INDEPTH_LEADER',
        tagName: 'indepth-assessment-leader',
      }),
    );
    // No individual-invite email for institution buyers.
    expect(resend.sendIndepthIndividualInvite).not.toHaveBeenCalled();
  });

  it('rejects seat counts below the 10-seat minimum', async () => {
    const result = await provisionEnrollment(buildSession({ ...baseMeta, quantity: '9' }));
    expect(result).toMatchObject({ code: 'missing_metadata' });
  });

  it('rejects missing institution_name', async () => {
    const result = await provisionEnrollment(
      buildSession({ ...baseMeta, institution_name: '   ' }),
    );
    expect(result).toMatchObject({ code: 'missing_metadata' });
  });

  it('rejects non-numeric quantity', async () => {
    const result = await provisionEnrollment(buildSession({ ...baseMeta, quantity: 'lots' }));
    expect(result).toMatchObject({ code: 'missing_metadata' });
  });

  it('returns skipped when stripe_session_id row already exists', async () => {
    setSelect('indepth_takes', [{ id: 'existing' }]);
    const result = await provisionEnrollment(buildSession(baseMeta));
    expect(result).toEqual({ action: 'skipped', type: 'indepth-institution' });
    expect(ckSeq.tagSubscriberByEnv).not.toHaveBeenCalled();
  });

  it('treats 23505 unique-violation on insert as skipped', async () => {
    setInsertError('indepth_takes', {
      code: '23505',
      message: 'unique violation',
    });
    const result = await provisionEnrollment(buildSession(baseMeta));
    expect(result).toEqual({ action: 'skipped', type: 'indepth-institution' });
  });

  it('returns db_error on non-unique insert failure', async () => {
    setInsertError('indepth_takes', { code: '42P01', message: 'oops' });
    const result = await provisionEnrollment(buildSession(baseMeta));
    expect(result).toMatchObject({ code: 'db_error' });
  });
});
