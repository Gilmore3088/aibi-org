/**
 * Shared state + builders for the §14 security suite.
 *
 * NOTE on vitest mocking: each test file declares its own `vi.mock(...)`
 * calls at the TOP of the file (they get hoisted). Those mocks read/write
 * the singleton `mockState` exported here, so handlers can be exercised
 * end-to-end without real Supabase or real LLM calls.
 */

import type { Exercise } from '../../src/types';

export const CANARY = '[[AIBI-SYS-7Q]]';

export interface MockState {
  exercise: Exercise | null;
  dispatch: (req: unknown) => Promise<{
    outputText: string;
    tokensUsed: number;
    provider: 'anthropic' | 'openai' | 'google';
  }>;
  // Per-provider mock implementations for failover tests.
  providerImpls: Partial<
    Record<
      'anthropic' | 'openai' | 'google',
      () => Promise<{ outputText: string; tokensUsed: number }>
    >
  >;
  insertedSessions: unknown[];
  insertedSpend: unknown[];
  // Spend lookup feed — used by getDailySpendUsd.
  spendLookup: Partial<Record<string, number>>;
}

export const mockState: MockState = {
  exercise: null,
  dispatch: async () => ({
    outputText: 'OK',
    tokensUsed: 10,
    provider: 'anthropic',
  }),
  providerImpls: {},
  insertedSessions: [],
  insertedSpend: [],
  spendLookup: {},
};

export function resetMockState(): void {
  mockState.exercise = null;
  mockState.dispatch = async () => ({
    outputText: 'OK',
    tokensUsed: 10,
    provider: 'anthropic',
  });
  mockState.providerImpls = {};
  mockState.insertedSessions = [];
  mockState.insertedSpend = [];
  mockState.spendLookup = {};
}

export function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'm3-2-ab',
    lessonId: 'm3-2',
    mode: 'single',
    trackVariant: null,
    systemPrompt: 'You support a banking-training exercise.',
    leverDirectives: {
      role: { compliance: 'You are a compliance analyst at a community bank.' },
      audience: { tellers: 'Write for frontline tellers.' },
    },
    taskScaffold: 'Summarize the regulation change.',
    levers: [
      {
        key: 'role',
        label: 'Role',
        type: 'select',
        options: [{ id: 'compliance', label: 'Compliance' }],
      },
      {
        key: 'audience',
        label: 'Audience',
        type: 'select',
        options: [{ id: 'tellers', label: 'Tellers' }],
      },
    ],
    dataSlots: [
      { key: 'regText', label: 'Regulation text', maxChars: 5000, required: true, piiCheck: true },
    ],
    presetContextBlocks: [],
    defaultProvider: 'anthropic',
    allowProviderSwitch: true,
    gating: { maxOutputTokens: 800, maxOutputChars: 4000 },
    entitlement: 'free',
    ...overrides,
  };
}
