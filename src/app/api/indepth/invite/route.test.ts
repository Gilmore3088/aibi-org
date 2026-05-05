// Tests for POST /api/indepth/invite.
//
// Supabase clients and the Resend send call are mocked. The auth surface is
// driven by `authUserMock`; the data surface is driven by per-table mock
// builders that match the chained calls used in route.ts.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// next/headers cookies() is read inside the route — return a no-op store.
vi.mock('next/headers', () => ({
  cookies: () => ({ getAll: () => [] }),
}));

// Auth mock — tests mutate this to simulate signed-in / signed-out states.
const authUserMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServerClientWithCookies: () => ({
    auth: { getUser: authUserMock },
  }),
  createServiceRoleClient: () => serviceRoleClient,
}));

// Resend send is mocked to a no-op success; tests assert call counts.
const sendInviteMock = vi.fn((_args: unknown) => Promise.resolve({ skipped: false }));
vi.mock('@/lib/resend', () => ({
  sendIndepthInstitutionInvite: (args: unknown) => sendInviteMock(args),
}));

// Service-role client mock surface. Tests override per-table behavior.
type InstRow = {
  id: string;
  institution_name: string;
  leader_user_id: string | null;
  leader_email: string;
  seats_purchased: number;
};

let instRow: InstRow | null = null;
let instLoadError: { message: string } | null = null;
let updateError: { message: string } | null = null;
let takersUsedCount = 0;
let takerInsertError: { code?: string; message: string } | null = null;
const insertCalls: Array<Record<string, unknown>> = [];
const updateCalls: Array<Record<string, unknown>> = [];

const serviceRoleClient = {
  from(table: string) {
    if (table === 'indepth_assessment_institutions') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: instRow,
              error: instLoadError,
            }),
          }),
        }),
        update: (payload: Record<string, unknown>) => {
          updateCalls.push(payload);
          return {
            eq: async () => ({ error: updateError }),
          };
        },
      };
    }
    if (table === 'indepth_assessment_takers') {
      return {
        select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
          if (opts?.count === 'exact' && opts?.head) {
            return {
              eq: async () => ({ count: takersUsedCount, error: null }),
            };
          }
          return { eq: async () => ({ data: [], error: null }) };
        },
        insert: (payload: Record<string, unknown>) => {
          insertCalls.push(payload);
          return Promise.resolve({ error: takerInsertError });
        },
      };
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

const INST_ID = '11111111-1111-1111-1111-111111111111';
const LEADER_ID = '22222222-2222-2222-2222-222222222222';

beforeEach(() => {
  authUserMock.mockReset();
  sendInviteMock.mockClear();
  insertCalls.length = 0;
  updateCalls.length = 0;
  instRow = {
    id: INST_ID,
    institution_name: 'Test Bank',
    leader_user_id: LEADER_ID,
    leader_email: 'leader@bank.com',
    seats_purchased: 10,
  };
  instLoadError = null;
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
    const res = await POST(req({ institutionId: INST_ID, emails: ['a@b.com'] }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when institutionId is missing', async () => {
    signedInAs();
    const res = await POST(req({ emails: ['a@b.com'] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when institutionId is not a string', async () => {
    signedInAs();
    const res = await POST(req({ institutionId: 123, emails: ['a@b.com'] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when emails array is empty', async () => {
    signedInAs();
    const res = await POST(req({ institutionId: INST_ID, emails: [] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when emails is not an array', async () => {
    signedInAs();
    const res = await POST(req({ institutionId: INST_ID, emails: 'a@b.com' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on malformed JSON', async () => {
    signedInAs();
    const res = await POST(req('not json'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when institution does not exist', async () => {
    signedInAs();
    instRow = null;
    const res = await POST(req({ institutionId: INST_ID, emails: ['a@b.com'] }));
    expect(res.status).toBe(404);
  });

  it('returns 403 when caller is not the bound leader', async () => {
    signedInAs({ id: 'someone-else', email: 'intruder@x.com' });
    const res = await POST(req({ institutionId: INST_ID, emails: ['a@b.com'] }));
    expect(res.status).toBe(403);
  });

  it('returns 403 when leader_user_id is null and caller email mismatches', async () => {
    instRow = {
      ...instRow!,
      leader_user_id: null,
      leader_email: 'leader@bank.com',
    };
    signedInAs({ id: 'new-user', email: 'wrong@x.com' });
    const res = await POST(req({ institutionId: INST_ID, emails: ['a@b.com'] }));
    expect(res.status).toBe(403);
  });

  it('binds leader_user_id on first call when email matches', async () => {
    instRow = {
      ...instRow!,
      leader_user_id: null,
      leader_email: 'leader@bank.com',
    };
    signedInAs({ id: 'fresh-user-id', email: 'leader@bank.com' });
    const res = await POST(
      req({ institutionId: INST_ID, emails: ['hire@bank.com'] }),
    );
    expect(res.status).toBe(200);
    expect(updateCalls).toEqual([{ leader_user_id: 'fresh-user-id' }]);
    const body = (await res.json()) as { created: number; errors: unknown[] };
    expect(body.created).toBe(1);
  });

  it('returns 400 when emails exceed remaining seats with descriptive message', async () => {
    signedInAs();
    instRow = { ...instRow!, seats_purchased: 10 };
    takersUsedCount = 8; // 2 seats remaining
    const res = await POST(
      req({
        institutionId: INST_ID,
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
        institutionId: INST_ID,
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
      req({ institutionId: INST_ID, emails: ['dup@bank.com'] }),
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
});
