/**
 * §14.8 — payload leakage.
 *
 * The objects returned by runSandbox / runSandboxAb / runSkill must NEVER
 * contain system_prompt, lever_directives, or the canary token.
 *
 * We exercise the handlers end-to-end with mocked supabase, mocked exercise
 * loader, mocked entitlement, and a mocked gateway that returns a clean
 * (non-leaking) response. Then we serialize the result and grep.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CANARY_TOKEN } from '../../src/canary';
import { makeExercise } from './_helpers';

// Hoisted state shared across mocks.
const state = {
  exercise: makeExercise({
    systemPrompt: 'SECRET-SYSTEM-PROMPT body should never leak.',
    leverDirectives: {
      role: { compliance: 'SECRET-DIRECTIVE-COMPLIANCE' },
      audience: { tellers: 'SECRET-DIRECTIVE-TELLERS' },
    },
  }),
};

vi.mock('../../src/config', () => ({
  getConfig: () => ({
    supabaseUrl: 'http://localhost',
    supabaseServiceRoleKey: 'srv',
    providers: {
      anthropic: { apiKey: 'a', defaultModel: 'm', anonModel: 'm-mini' },
      openai: { apiKey: 'b', defaultModel: 'm', anonModel: 'm-mini' },
      google: { apiKey: 'c', defaultModel: 'm', anonModel: 'm-mini' },
    },
    providerPriority: ['anthropic', 'openai', 'google'],
    requestTimeoutMs: 10_000,
  }),
  resetConfigForTests: () => undefined,
}));

vi.mock('../../src/supabase', () => {
  const builder = (table: string) => ({
    insert: (_row: unknown) => ({
      select: () => ({
        single: async () => ({ data: { id: `${table}-id` }, error: null }),
      }),
    }),
    upsert: async () => ({ data: null, error: null }),
    select: () => ({
      eq: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          // For toolbox_items (skill loader path), .eq().eq().eq()...
          // chains. We accept any depth and return null.
        }),
        maybeSingle: async () => ({ data: null, error: null }),
      }),
    }),
  });
  return {
    getServiceClient: () => ({
      from: (t: string) => builder(t),
    }),
  };
});

vi.mock('../../src/exercises/loader', () => ({
  loadExercise: async () => state.exercise,
}));

vi.mock('../../src/auth/entitlement', () => ({
  checkEntitlement: async () => ({ allowed: true }),
}));

vi.mock('../../src/gateway', () => ({
  dispatch: async () => ({
    outputText: 'Plain clean banker-facing output. No secrets here.',
    tokensUsed: 12,
    provider: 'anthropic' as const,
  }),
  AllProvidersFailedError: class AllProvidersFailedError extends Error {},
}));

import { runSandbox } from '../../src/handlers/run';
import { runSandboxAb } from '../../src/handlers/ab';

describe('§14.8 no leakage in response payload', () => {
  const identity = {
    learnerId: '00000000-0000-0000-0000-000000000001',
    anonSessionId: null,
  };

  beforeEach(() => {
    // nothing to reset; mocks are deterministic
  });

  function assertNoLeak(payload: unknown): void {
    const json = JSON.stringify(payload);
    expect(json.includes(CANARY_TOKEN)).toBe(false);
    expect(json.includes('SECRET-SYSTEM-PROMPT')).toBe(false);
    expect(json.includes('SECRET-DIRECTIVE-')).toBe(false);
    expect(json.includes('systemPrompt')).toBe(false);
    expect(json.includes('system_prompt')).toBe(false);
    expect(json.includes('leverDirectives')).toBe(false);
    expect(json.includes('lever_directives')).toBe(false);
  }

  it('runSandbox response carries no server-only fields', async () => {
    const result = await runSandbox({
      exerciseId: 'm3-2-ab',
      leverSelections: { role: 'compliance' },
      dataSlotValues: { regText: 'banker-safe text' },
      presetIds: [],
      identity,
      ipAddress: '203.0.113.1',
    });
    assertNoLeak(result);
  });

  it('runSandboxAb response carries no server-only fields', async () => {
    const result = await runSandboxAb({
      exerciseId: 'm3-2-ab',
      configs: [
        {
          leverSelections: { role: 'compliance' },
          dataSlotValues: { regText: 'banker-safe A' },
          presetIds: [],
        },
        {
          leverSelections: { role: 'compliance' },
          dataSlotValues: { regText: 'banker-safe B' },
          presetIds: [],
        },
      ],
      identity,
      ipAddress: '203.0.113.1',
    });
    assertNoLeak(result);
  });
});
