// Toolbox items — server-side helpers test.
// Focused on the free-tier 4-cap enforcement and identity guards.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

interface MockState {
  count: number;
  paid: boolean;
}

const state: MockState = {
  count: 0,
  paid: false,
};

// The chain is `.from(t).select(cols, opts).eq(k, v)[.eq(k, v)]` and the
// final `.eq()` is awaited. We make every chain method return a thenable
// that resolves to {count, error: null}.
function makeChain(): unknown {
  const result = { count: state.count, error: null };
  const thenable: Record<string, unknown> = {
    then: (resolve: (v: typeof result) => unknown) => resolve(result),
  };
  thenable.eq = () => thenable;
  thenable.in = () => thenable;
  thenable.order = () => thenable;
  thenable.maybeSingle = async () => ({ data: null, error: null });
  return thenable;
}

vi.mock('@/lib/addie/supabase/service', () => ({
  getAddieServiceClient: () => ({
    from: () => ({
      select: () => makeChain(),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: { id: 'abc' }, error: null }),
        }),
      }),
    }),
  }),
  isValidEmail: () => true,
  normalizeEmail: (x: string) => x.toLowerCase(),
}));

vi.mock('@/lib/addie/entitlements/check', () => ({
  hasAnyFoundationEntitlement: async () => state.paid,
  hasEntitlement: async () => state.paid,
}));

import {
  isOverFreeCap,
  FREE_TIER_ARTIFACT_CAP,
  isArtifactType,
} from './items';

beforeEach(() => {
  state.count = 0;
  state.paid = false;
});
afterEach(() => {
  vi.clearAllMocks();
});

describe('toolbox/items', () => {
  describe('FREE_TIER_ARTIFACT_CAP', () => {
    it('is exactly 4 (PRD §6.3)', () => {
      expect(FREE_TIER_ARTIFACT_CAP).toBe(4);
    });
  });

  describe('isArtifactType', () => {
    it('accepts known artifact types', () => {
      expect(isArtifactType('data_discipline_card')).toBe(true);
      expect(isArtifactType('skill')).toBe(true);
      expect(isArtifactType('problem_backlog')).toBe(true);
    });
    it('rejects unknown values', () => {
      expect(isArtifactType('foo')).toBe(false);
      expect(isArtifactType(null)).toBe(false);
      expect(isArtifactType(123)).toBe(false);
      expect(isArtifactType(undefined)).toBe(false);
    });
  });

  describe('isOverFreeCap', () => {
    it('returns unlimited for paid foundation user', async () => {
      state.paid = true;
      state.count = 99;
      const r = await isOverFreeCap({ user_id: 'u1', lead_id: null });
      expect(r.unlimited).toBe(true);
      expect(r.over).toBe(false);
    });

    it('returns over=true once count reaches the cap', async () => {
      state.count = 4;
      const r = await isOverFreeCap({ user_id: null, lead_id: 'L1' });
      expect(r.unlimited).toBe(false);
      expect(r.over).toBe(true);
    });

    it('returns over=false below cap', async () => {
      state.count = 3;
      const r = await isOverFreeCap({ user_id: null, lead_id: 'L1' });
      expect(r.over).toBe(false);
    });

    it('returns 0 when no identity provided', async () => {
      const r = await isOverFreeCap({ user_id: null, lead_id: null });
      expect(r.count).toBe(0);
      expect(r.over).toBe(false);
    });
  });
});
