// loadTeamDashboard — unit tests with a mocked service client.

import { describe, it, expect, vi, beforeEach } from 'vitest';

interface ChainState {
  table: string | null;
  filters: Record<string, unknown>;
  result: { data: unknown; error: unknown };
}

function makeBuilder(state: ChainState, results: Record<string, { data: unknown; error: unknown }>) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn((col: string, val: unknown) => {
      state.filters[col] = val;
      return builder;
    }),
    order: vi.fn(() => builder),
    limit: vi.fn(() => {
      const key = state.table ?? '';
      const r = results[key] ?? { data: [], error: null };
      state.result = r;
      // Mimic supabase: chainable AND awaitable.
      return Promise.resolve(r);
    }),
    // Awaitable form (for queries without .limit()).
    then(onfulfilled: (v: unknown) => unknown, onrejected?: (e: unknown) => unknown) {
      const key = state.table ?? '';
      const r = results[key] ?? { data: [], error: null };
      return Promise.resolve(r).then(onfulfilled, onrejected);
    },
  };
  return builder;
}

function makeMockClient(results: Record<string, { data: unknown; error: unknown }>) {
  const states: ChainState[] = [];
  return {
    states,
    from: vi.fn((table: string) => {
      const state: ChainState = { table, filters: {}, result: { data: null, error: null } };
      states.push(state);
      return makeBuilder(state, results);
    }),
  };
}

let currentMock: ReturnType<typeof makeMockClient>;

vi.mock('@/lib/addie/supabase/service', () => ({
  getAddieServiceClient: () => currentMock,
}));

import { loadTeamDashboard } from './dashboard';

describe('loadTeamDashboard', () => {
  beforeEach(() => {
    currentMock = makeMockClient({});
  });

  it('returns null when admin_user_id is empty', async () => {
    const snap = await loadTeamDashboard('');
    expect(snap).toBeNull();
  });

  it('returns null when no team is owned by the admin', async () => {
    currentMock = makeMockClient({
      teams: { data: [], error: null },
    });
    const snap = await loadTeamDashboard('user-1');
    expect(snap).toBeNull();
  });

  it('returns snapshot with correct budget math when admin owns a team', async () => {
    currentMock = makeMockClient({
      teams: {
        data: [
          {
            id: 'team-1',
            name: 'First National',
            seats_purchased: 10,
            admin_user_id: 'user-1',
            stripe_subscription_id: 'sub_123',
          },
        ],
        error: null,
      },
      seats: {
        data: [
          { id: 's1', invited_email: 'a@b.co', status: 'invited', learner_user_id: null },
          { id: 's2', invited_email: 'c@d.co', status: 'assigned', learner_user_id: 'u2' },
          { id: 's3', invited_email: 'e@f.co', status: 'assigned', learner_user_id: 'u3' },
          { id: 's4', invited_email: 'g@h.co', status: 'revoked', learner_user_id: null },
        ],
        error: null,
      },
      team_progress_v: {
        data: [
          {
            seat_id: 's2',
            invited_email: 'c@d.co',
            seat_status: 'assigned',
            user_id: 'u2',
            track: 'risk',
            lessons_completed: 5,
            sandbox_runs: 12,
            artifacts_saved: 3,
            artifacts_reused: 1,
            last_activity_at: '2026-05-22T12:00:00Z',
          },
          {
            seat_id: 's3',
            invited_email: 'e@f.co',
            seat_status: 'assigned',
            user_id: 'u3',
            track: 'ops',
            lessons_completed: 2,
            sandbox_runs: 4,
            artifacts_saved: 1,
            artifacts_reused: 0,
            last_activity_at: '2026-05-23T08:00:00Z',
          },
        ],
        error: null,
      },
    });

    const snap = await loadTeamDashboard('user-1');
    expect(snap).not.toBeNull();
    if (!snap) return;
    expect(snap.team.id).toBe('team-1');
    expect(snap.team.name).toBe('First National');
    expect(snap.seats).toHaveLength(4);
    // Budget: purchased=10, used = invited(1) + assigned(2) = 3, revoked excluded.
    expect(snap.budget.purchased).toBe(10);
    expect(snap.budget.used).toBe(3);
    expect(snap.budget.remaining).toBe(7);

    // Progress merged in for assigned rows; zeros for invited/revoked.
    const s1 = snap.seats.find((s) => s.seat_id === 's1');
    const s2 = snap.seats.find((s) => s.seat_id === 's2');
    const s4 = snap.seats.find((s) => s.seat_id === 's4');
    expect(s1?.lessons_completed).toBe(0);
    expect(s2?.lessons_completed).toBe(5);
    expect(s2?.sandbox_runs).toBe(12);
    expect(s2?.track).toBe('risk');
    expect(s4?.lessons_completed).toBe(0);
  });

  it('clamps remaining to 0 when used exceeds purchased', async () => {
    currentMock = makeMockClient({
      teams: {
        data: [
          {
            id: 'team-2',
            name: 'Edge Case CU',
            seats_purchased: 10,
            admin_user_id: 'user-2',
            stripe_subscription_id: null,
          },
        ],
        error: null,
      },
      seats: {
        data: Array.from({ length: 12 }, (_, i) => ({
          id: `s${i}`,
          invited_email: `x${i}@y.co`,
          status: 'assigned' as const,
          learner_user_id: `u${i}`,
        })),
        error: null,
      },
      team_progress_v: { data: [], error: null },
    });
    const snap = await loadTeamDashboard('user-2');
    if (!snap) throw new Error('expected snapshot');
    expect(snap.budget.used).toBe(12);
    expect(snap.budget.remaining).toBe(0);
  });
});
