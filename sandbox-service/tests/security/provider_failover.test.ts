/**
 * §14.6 — provider failover. Mock anthropic to throw, openai to succeed,
 * assert the dispatcher returns openai's response with no exception.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config', () => ({
  getConfig: () => ({
    supabaseUrl: 'http://localhost',
    supabaseServiceRoleKey: 'srv',
    providers: {
      anthropic: { apiKey: 'a', defaultModel: 'claude', anonModel: 'claude-haiku' },
      openai: { apiKey: 'b', defaultModel: 'gpt-4o', anonModel: 'gpt-4o-mini' },
      google: { apiKey: 'c', defaultModel: 'gemini', anonModel: 'gemini-flash' },
    },
    providerPriority: ['anthropic', 'openai', 'google'],
    requestTimeoutMs: 10_000,
  }),
  resetConfigForTests: () => undefined,
}));

vi.mock('../../src/gateway/anthropic', () => ({
  callAnthropic: vi.fn(async () => {
    throw new Error('boom');
  }),
}));

vi.mock('../../src/gateway/openai', () => ({
  callOpenAI: vi.fn(async () => ({ outputText: 'ok-from-openai', tokensUsed: 42 })),
}));

vi.mock('../../src/gateway/google', () => ({
  callGoogle: vi.fn(async () => ({ outputText: 'ok-from-google', tokensUsed: 50 })),
}));

describe('§14.6 provider failover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.resetModules();
  });

  it('falls over from anthropic to openai on error', async () => {
    const { dispatch } = await import('../../src/gateway');
    const result = await dispatch({
      request: { system: 's', userContent: 'u', maxTokens: 100, temperature: 0.2 },
      preferredProvider: 'anthropic',
      useAnonModel: false,
    });
    expect(result.provider).toBe('openai');
    expect(result.outputText).toBe('ok-from-openai');
    expect(result.tokensUsed).toBe(42);
  });
});
