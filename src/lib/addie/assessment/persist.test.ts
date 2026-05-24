// persistAssessment — identity resolution + idempotency.
//
// We replace getAddieServiceClient with an in-memory table mock that supports
// .from('assessment_results').select().eq()…maybeSingle / .update().eq() /
// .insert().select().single().

import { describe, it, expect, beforeEach, vi } from 'vitest';

interface Row {
  id: string;
  user_id: string | null;
  lead_id: string | null;
  email: string;
  stripe_session_id: string | null;
  dimension_scores: Record<string, number>;
  raw_answers: unknown;
  plan_md: string | null;
  ideas_prompts_md: string | null;
  ctas_md: string | null;
  created_at: string;
}

const state: { rows: Row[]; idSeq: number } = { rows: [], idSeq: 0 };

function nextId(): string {
  state.idSeq += 1;
  return `00000000-0000-0000-0000-${String(state.idSeq).padStart(12, '0')}`;
}

// ---- supabase mock --------------------------------------------------------

interface Filter {
  col: string;
  op: 'eq' | 'gte' | 'lt';
  val: unknown;
}

function makeSelectChain(rows: Row[], filters: Filter[]) {
  function applyFilters(): Row[] {
    return rows.filter((r) =>
      filters.every((f) => {
        const v = (r as unknown as Record<string, unknown>)[f.col];
        if (f.op === 'eq') return v === f.val;
        if (f.op === 'gte') return typeof v === 'string' && v >= (f.val as string);
        return typeof v === 'string' && v < (f.val as string);
      }),
    );
  }
  const chain = {
    eq(col: string, val: unknown) {
      filters.push({ col, op: 'eq', val });
      return chain;
    },
    gte(col: string, val: unknown) {
      filters.push({ col, op: 'gte', val });
      return chain;
    },
    lt(col: string, val: unknown) {
      filters.push({ col, op: 'lt', val });
      return chain;
    },
    order() {
      return chain;
    },
    limit() {
      return chain;
    },
    async maybeSingle() {
      const matches = applyFilters();
      return { data: matches[0] ?? null, error: null };
    },
  };
  return chain;
}

function makeFrom() {
  return (table: string) => {
    if (table !== 'assessment_results') {
      // upsertLead writes to 'leads' — give it a minimal noop chain.
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: 'lead-x' }, error: null }),
          }),
        }),
        update: () => ({ eq: async () => ({ error: null }) }),
      };
    }
    return {
      select() {
        return makeSelectChain(state.rows, []);
      },
      update(patch: Partial<Row>) {
        return {
          async eq(_col: string, val: string) {
            const row = state.rows.find((r) => r.id === val);
            if (row) Object.assign(row, patch);
            return { error: null };
          },
        };
      },
      insert(values: Partial<Row>) {
        return {
          select() {
            return {
              async single() {
                const row: Row = {
                  id: nextId(),
                  user_id: values.user_id ?? null,
                  lead_id: values.lead_id ?? null,
                  email: values.email ?? '',
                  stripe_session_id: values.stripe_session_id ?? null,
                  dimension_scores: values.dimension_scores ?? {},
                  raw_answers: values.raw_answers ?? [],
                  plan_md: values.plan_md ?? null,
                  ideas_prompts_md: values.ideas_prompts_md ?? null,
                  ctas_md: values.ctas_md ?? null,
                  created_at: new Date().toISOString(),
                };
                state.rows.push(row);
                return { data: { id: row.id }, error: null };
              },
            };
          },
        };
      },
    };
  };
}

vi.mock('@/lib/addie/supabase/service', () => ({
  getAddieServiceClient: () => ({ from: makeFrom() }),
  normalizeEmail: (x: string) => x.trim().toLowerCase(),
  isValidEmail: () => true,
}));

const upsertLeadMock = vi.fn(async () => ({
  id: 'lead-fresh',
  email: 'cu@example.com',
  created: true,
}));

vi.mock('@/lib/addie/leads/upsert', () => ({
  upsertLead: (...args: unknown[]) => upsertLeadMock(...(args as [])),
}));

import { persistAssessment } from './persist';
import { DIMENSION_KEYS } from './dimensions';

const SCORES = Object.fromEntries(DIMENSION_KEYS.map((k) => [k, 12])) as Record<
  string,
  number
>;
const ANSWERS = [{ question_id: 'q1', value: 3 }];

beforeEach(() => {
  state.rows = [];
  state.idSeq = 0;
  upsertLeadMock.mockClear();
});

describe('persistAssessment', () => {
  it('inserts a new row when no identity, creating a lead first', async () => {
    const res = await persistAssessment({
      email: 'banker@cu.example.com',
      raw_answers: ANSWERS,
      dimension_scores: SCORES,
    });
    expect(res.created).toBe(true);
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0].lead_id).toBe('lead-fresh');
    expect(state.rows[0].user_id).toBeNull();
    expect(upsertLeadMock).toHaveBeenCalledTimes(1);
  });

  it('uses provided user_id and ignores lead_id when both supplied', async () => {
    const res = await persistAssessment({
      email: 'banker@cu.example.com',
      raw_answers: ANSWERS,
      dimension_scores: SCORES,
      user_id: 'user-A',
      lead_id: 'lead-B',
    });
    expect(res.created).toBe(true);
    expect(state.rows[0].user_id).toBe('user-A');
    expect(state.rows[0].lead_id).toBeNull();
    expect(upsertLeadMock).not.toHaveBeenCalled();
  });

  it('uses provided lead_id without creating a fresh lead', async () => {
    const res = await persistAssessment({
      email: 'banker@cu.example.com',
      raw_answers: ANSWERS,
      dimension_scores: SCORES,
      lead_id: 'lead-existing',
    });
    expect(res.created).toBe(true);
    expect(state.rows[0].lead_id).toBe('lead-existing');
    expect(upsertLeadMock).not.toHaveBeenCalled();
  });

  it('is idempotent on duplicate stripe_session_id (UPSERT, not duplicate row)', async () => {
    const first = await persistAssessment({
      email: 'banker@cu.example.com',
      raw_answers: ANSWERS,
      dimension_scores: SCORES,
      user_id: 'user-A',
      stripe_session_id: 'cs_test_1',
    });
    const second = await persistAssessment({
      email: 'banker@cu.example.com',
      raw_answers: ANSWERS,
      dimension_scores: { ...SCORES, 'current-ai-usage': 18 },
      user_id: 'user-A',
      stripe_session_id: 'cs_test_1',
      plan_md: 'updated plan',
    });
    expect(first.id).toBe(second.id);
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0].plan_md).toBe('updated plan');
    expect(state.rows[0].dimension_scores['current-ai-usage']).toBe(18);
  });

  it('falls back to (email, date) idempotency when stripe_session_id absent', async () => {
    const first = await persistAssessment({
      email: 'banker@cu.example.com',
      raw_answers: ANSWERS,
      dimension_scores: SCORES,
      user_id: 'user-A',
    });
    const second = await persistAssessment({
      email: 'banker@cu.example.com',
      raw_answers: ANSWERS,
      dimension_scores: SCORES,
      user_id: 'user-A',
      plan_md: 'second attempt same day',
    });
    expect(first.id).toBe(second.id);
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0].plan_md).toBe('second attempt same day');
  });
});
