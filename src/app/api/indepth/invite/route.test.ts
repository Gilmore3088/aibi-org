// Tests for POST /api/indepth/invite.
//
// Supabase clients and the Resend send call are mocked. The auth surface is
// driven by `authUserMock`; the data surface is driven by a single-table
// mock matching the chained calls used in route.ts after the schema
// collapse (everything goes through `indepth_takes`).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: () => ({ getAll: () => [] }),
}));

const authUserMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServerClientWithCookies: () => ({
    auth: { getUser: authUserMock },
  }),
  createServiceRoleClient: () => serviceRoleClient,
}));

const sendInviteMock = vi.fn((_args: unknown) => Promise.resolve({ skipped: false }));
vi.mock('@/lib/resend', () => ({
  sendIndepthInstitutionInvite: (args: unknown) => sendInviteMock(args),
}));

type LeaderRow = {
  id: string;
  institution_name: string;
  leader_user_id: string | null;
  leader_email: string;
  seats_purchased: number;
};

let leaderRow: LeaderRow | null = null;
let leaderLoadError: { message: string } | null = null;
let updateError: { message: string } | null = null;
let takersUsedCount = 0;
let takerInsertError: { code?: string; message: string } | null = null;
const insertCalls: Array<Record<string, unknown>> = [];
const updateCalls: Array<Record<string, unknown>> = [];

// Builder for `.eq('id', ...).eq('is_leader', ...).maybeSingle()` etc.
function indepthTakesBuilder() {
  let invocation: 'leaderLoad' | 'seatCount' | null = null;

  const select = (
    _cols: string,
    opts?: { count?: string; head?: boolean },
  ) => {
    if (opts?.count === 'exact' && opts?.head) {
      invocation = 'seatCount';
    } else {
      invocation = 'leaderLoad';
    }
    return chain;
  };

  const chain: Record<string, unknown> = {};
  chain.eq = (_col: string, _val: unknown) => chain;
  chain.maybeSingle = async () => ({
    data: leaderRow,
    error: leaderLoadError,
  });
  // Resolve seat-count when this chain is `await`-ed directly (no maybeSingle
  // call). The route does `.eq(...)` then awaits; that triggers `then`.
  chain.then = (resolve: (v: unknown) => unknown) => {
    if (invocation === 'seatCount') {
      return resolve({ count: takersUsedCount, error: null });
    }
    return resolve({ data: [], error: null });
  };

  const update = (payload: Record<string, unknown>) => {
    updateCalls.push(payload);
    return {
      eq: async () => ({ error: updateError }),
    };
  };

  const insert = (payload: Record<string, unknown>) => {
    insertCalls.push(payload);
    return Promise.resolve({ error: takerInsertError });
  };

  return { select, update, insert };
}

const serviceRoleClient = {
  from(table: string) {
    if (table === 'indepth_takes') {
      return indepthTakesBuilder();
    }
    throw new Error(`unmocked table: ${table}`);
  },
};

import { POST } from './route';

const req = (body: unknown): Request =>
  new Request('http://localhost/api/indepth/invite', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const COHORT_ID = '11111111-1111-1111-1111-111111111111';
const LEADER_ID = '22222222-2222-2222-2222-222222222222';

beforeEach(() => {
  authUserMock.mockReset();
  sendInviteMock.mockClear();
  insertCalls.length = 0;
  updateCalls.length = 0;
  leaderRow = {
    id: COHORT_ID,
    institution_name: 'Test Bank',
    leader_user_id: LEADER_ID,
    leader_email: 'leader@bank.com',
    seats_purchased: 10,
  };
  leaderLoadError = null;
  updateError = null;
  takersUsedCount = 0;
  takerInsertError = null;
});

afterEach(() => {
  vi.clearAllMocks();
});

const signedInAs = (overrides?: Partial<{ id: string; email: string }>) => {
  authUserMock.mockResolvedValue({
    data: {
      user: {
        id: overrides?.id ?? LEADER_ID,
        email: overrides?.email ?? 'leader@bank.com',
        user_metadata: { full_name: 'Pat Leader' },
      },
    },
    error: null,
  });
};

describe('POST /api/indepth/invite', () => {
  it('returns 401 when unauthenticated', async () => {
    authUserMock.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(req({ cohortId: COHORT_ID, emails: ['a@b.com'] }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when cohortId is missing', async () => {
    signedInAs();
    const res = await POST(req({ emails: ['a@b.com'] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when cohortId is not a string', async () => {
    signedInAs();
    const res = await POST(req({ cohortId: 123, emails: ['a@b.com'] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when emails array is empty', async () => {
    signedInAs();
    const res = await POST(req({ cohortId: COHORT_ID, emails: [] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when emails is not an array', async () => {
    signedInAs();
    const res = await POST(req({ cohortId: COHORT_ID, emails: 'a@b.com' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on malformed JSON', async () => {
    signedInAs();
    const res = await POST(req('not json'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when cohort does not exist', async () => {
    signedInAs();
    leaderRow = null;
    const res = await POST(req({ cohortId: COHORT_ID, emails: ['a@b.com'] }));
    expect(res.status).toBe(404);
  });

  it('returns 403 when caller is not the bound leader', async () => {
    signedInAs({ id: 'someone-else', email: 'intruder@x.com' });
    const res = await POST(req({ cohortId: COHORT_ID, emails: ['a@b.com'] }));
    expect(res.status).toBe(403);
  });

  it('returns 403 when leader_user_id is null and caller email mismatches', async () => {
    leaderRow = {
      ...leaderRow!,
      leader_user_id: null,
      leader_email: 'leader@bank.com',
    };
    signedInAs({ id: 'new-user', email: 'wrong@x.com' });
    const res = await POST(req({ cohortId: COHORT_ID, emails: ['a@b.com'] }));
    expect(res.status).toBe(403);
  });

  it('binds leader_user_id on first call when email matches', async () => {
    leaderRow = {
      ...leaderRow!,
      leader_user_id: null,
      leader_email: 'leader@bank.com',
    };
    signedInAs({ id: 'fresh-user-id', email: 'leader@bank.com' });
    const res = await POST(
      req({ cohortId: COHORT_ID, emails: ['hire@bank.com'] }),
    );
    expect(res.status).toBe(200);
    expect(
      updateCalls.some(
        (c) => 'leader_user_id' in c && c.leader_user_id === 'fresh-user-id',
      ),
    ).toBe(true);
    const body = (await res.json()) as { created: number; errors: unknown[] };
    expect(body.created).toBe(1);
  });

  it('returns 400 when emails exceed remaining seats with descriptive message', async () => {
    signedInAs();
    leaderRow = { ...leaderRow!, seats_purchased: 10 };
    takersUsedCount = 8; // 2 seats remaining
    const res = await POST(
      req({
        cohortId: COHORT_ID,
        emails: ['a@b.com', 'c@d.com', 'e@f.com'],
      }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('3 requested');
    expect(body.error).toContain('only 2 seats remaining');
  });

  it('reports invalid email formats in errors[] without aborting valid ones', async () => {
    signedInAs();
    const res = await POST(
      req({
        cohortId: COHORT_ID,
        emails: ['ok@bank.com', 'not-an-email', '   ', 'also@ok.com'],
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      created: number;
      errors: Array<{ email: string; reason: string }>;
    };
    expect(body.created).toBe(2);
    expect(body.errors).toHaveLength(2);
    expect(body.errors.every((e) => e.reason === 'invalid email format')).toBe(true);
    expect(sendInviteMock).toHaveBeenCalledTimes(2);
  });

  it('reports duplicate-email unique-violation as already invited', async () => {
    signedInAs();
    takerInsertError = { code: '23505', message: 'duplicate key' };
    const res = await POST(
      req({ cohortId: COHORT_ID, emails: ['dup@bank.com'] }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      created: number;
      errors: Array<{ email: string; reason: string }>;
    };
    expect(body.created).toBe(0);
    expect(body.errors).toEqual([
      { email: 'dup@bank.com', reason: 'already invited' },
    ]);
    expect(sendInviteMock).not.toHaveBeenCalled();
  });

  it('accepts legacy institutionId alias', async () => {
    signedInAs();
    const res = await POST(
      req({ institutionId: COHORT_ID, emails: ['a@b.com'] }),
    );
    expect(res.status).toBe(200);
  });
});
