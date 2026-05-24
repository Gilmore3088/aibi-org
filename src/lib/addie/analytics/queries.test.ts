import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the service client BEFORE importing the module under test.
const mockChain = {
  rows: [] as unknown[],
  count: null as number | null,
  error: null as unknown,
};

interface MockBuilder {
  select: (..._args: unknown[]) => MockBuilder;
  eq: (..._args: unknown[]) => MockBuilder;
  in: (..._args: unknown[]) => MockBuilder;
  gte: (..._args: unknown[]) => MockBuilder;
  lte: (..._args: unknown[]) => MockBuilder;
  not: (..._args: unknown[]) => MockBuilder;
  order: (..._args: unknown[]) => MockBuilder;
  limit: (..._args: unknown[]) => MockBuilder;
  range: (..._args: unknown[]) => Promise<{ data: unknown[]; count: number | null; error: unknown }>;
  maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
  then: <T>(onFulfilled: (v: { data: unknown[]; count: number | null; error: unknown }) => T) => Promise<T>;
}

function makeBuilder(): MockBuilder {
  const result = {
    data: mockChain.rows,
    count: mockChain.count,
    error: mockChain.error,
  };
  const b: MockBuilder = {
    select: () => b,
    eq: () => b,
    in: () => b,
    gte: () => b,
    lte: () => b,
    not: () => b,
    order: () => b,
    limit: () => b,
    range: async () => result,
    maybeSingle: async () => ({ data: mockChain.rows[0] ?? null, error: mockChain.error }),
    then: (onFulfilled) => Promise.resolve(onFulfilled(result)),
  };
  return b;
}

vi.mock('server-only', () => ({}));
vi.mock('@/lib/addie/supabase/service', () => ({
  getAddieServiceClient: () => ({ from: () => makeBuilder() }),
}));

import { loadGateConversion, leadsToCSV } from './queries';

describe('loadGateConversion', () => {
  beforeEach(() => {
    mockChain.rows = [];
    mockChain.count = null;
    mockChain.error = null;
  });

  it('returns zeros and seeded days when no events present', async () => {
    const dto = await loadGateConversion(7);
    expect(dto.error).toBeNull();
    expect(dto.total).toEqual({ paid: 0, email: 0, decline: 0 });
    expect(dto.days.length).toBe(7);
    expect(dto.pct).toEqual({ paid: 0, email: 0, decline: 0 });
  });

  it('tallies forks and computes percentages', async () => {
    const today = new Date().toISOString();
    mockChain.rows = [
      { created_at: today, payload: { fork: 'paid' } },
      { created_at: today, payload: { fork: 'email' } },
      { created_at: today, payload: { fork: 'email' } },
      { created_at: today, payload: { fork: 'decline' } },
      { created_at: today, payload: { fork: 'invalid' } },
      { created_at: today, payload: null },
    ];
    const dto = await loadGateConversion(7);
    expect(dto.error).toBeNull();
    expect(dto.total).toEqual({ paid: 1, email: 2, decline: 1 });
    // 4 valid forks: 25% paid, 50% email, 25% decline.
    expect(dto.pct.paid).toBe(25);
    expect(dto.pct.email).toBe(50);
    expect(dto.pct.decline).toBe(25);
  });

  it('surfaces query errors on the DTO', async () => {
    mockChain.error = new Error('boom');
    const dto = await loadGateConversion(7);
    expect(dto.error).toBe('boom');
  });
});

describe('leadsToCSV', () => {
  it('escapes commas and quotes', () => {
    const csv = leadsToCSV([
      {
        id: '1',
        email: 'a@b.co',
        fi_name: 'First, Bank "Best"',
        gate_decision: 'paid',
        marketing_opt_in: true,
        last_activity_at: '2026-05-23T00:00:00.000Z',
        created_at: '2026-05-20T00:00:00.000Z',
      },
    ]);
    const [header, row] = csv.split('\n');
    expect(header).toBe('email,fi_name,gate_decision,marketing_opt_in,last_activity_at,created_at');
    expect(row).toContain('"First, Bank ""Best"""');
    expect(row).toContain('a@b.co');
  });

  it('handles nulls cleanly', () => {
    const csv = leadsToCSV([
      {
        id: '1',
        email: 'a@b.co',
        fi_name: null,
        gate_decision: null,
        marketing_opt_in: false,
        last_activity_at: null,
        created_at: '2026-05-20T00:00:00.000Z',
      },
    ]);
    expect(csv.split('\n')[1]).toBe('a@b.co,,,false,,2026-05-20T00:00:00.000Z');
  });
});
