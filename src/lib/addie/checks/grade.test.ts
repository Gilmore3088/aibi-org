// Knowledge check grading — focused on the correctness lookup.

import { describe, it, expect, vi, beforeEach } from 'vitest';

interface CheckRow {
  id: string;
  options: Array<{ id: string; label: string; correct?: boolean; explanation?: string }>;
}

const state: { row: CheckRow | null } = { row: null };
const inserts: unknown[] = [];

vi.mock('@/lib/addie/supabase/service', () => ({
  getAddieServiceClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () =>
            table === 'knowledge_checks'
              ? { data: state.row, error: null }
              : { data: null, error: null },
        }),
      }),
      insert: (row: unknown) => {
        inserts.push({ table, row });
        return { error: null };
      },
    }),
  }),
}));

import { gradeKnowledgeCheck } from './grade';

beforeEach(() => {
  state.row = {
    id: 'c1',
    options: [
      { id: 'a', label: 'wrong' },
      { id: 'b', label: 'right', correct: true, explanation: 'because reasons' },
    ],
  };
  inserts.length = 0;
});

describe('gradeKnowledgeCheck', () => {
  it('returns correct=true when learner picks the correct option', async () => {
    const r = await gradeKnowledgeCheck({
      check_id: 'c1',
      selected_option: 'b',
      user_id: 'u1',
      anon_session_id: null,
    });
    expect(r?.correct).toBe(true);
    expect(r?.correct_option_id).toBe('b');
  });

  it('returns correct=false when learner picks a wrong option', async () => {
    const r = await gradeKnowledgeCheck({
      check_id: 'c1',
      selected_option: 'a',
      user_id: 'u1',
      anon_session_id: null,
    });
    expect(r?.correct).toBe(false);
    expect(r?.correct_option_id).toBe('b');
  });

  it('returns null when no identity is supplied', async () => {
    const r = await gradeKnowledgeCheck({
      check_id: 'c1',
      selected_option: 'a',
      user_id: null,
      anon_session_id: null,
    });
    expect(r).toBeNull();
  });

  it('returns null when no row exists', async () => {
    state.row = null;
    const r = await gradeKnowledgeCheck({
      check_id: 'missing',
      selected_option: 'a',
      user_id: 'u1',
      anon_session_id: null,
    });
    expect(r).toBeNull();
  });

  it('returns null when the row has no correct option', async () => {
    state.row = {
      id: 'c1',
      options: [{ id: 'a', label: 'no marker' }],
    };
    const r = await gradeKnowledgeCheck({
      check_id: 'c1',
      selected_option: 'a',
      user_id: 'u1',
      anon_session_id: null,
    });
    expect(r).toBeNull();
  });
});
