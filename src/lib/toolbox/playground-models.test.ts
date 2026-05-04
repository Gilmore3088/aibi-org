import { describe, expect, it } from 'vitest';
import { PLAYGROUND_MODELS, isAllowedModel } from './playground-models';

describe('PLAYGROUND_MODELS', () => {
  it('contains exactly the six v1 spec-locked models', () => {
    const ids = PLAYGROUND_MODELS.map((m) => m.id).sort();
    expect(ids).toEqual([
      'claude-haiku-4-5-20251001',
      'claude-sonnet-4-6',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gpt-4o',
      'gpt-4o-mini',
    ]);
  });

  it('groups by the three providers', () => {
    const providers = new Set(PLAYGROUND_MODELS.map((m) => m.provider));
    expect(providers).toEqual(new Set(['anthropic', 'openai', 'gemini']));
  });

  it('every entry has a non-empty displayName and description', () => {
    for (const m of PLAYGROUND_MODELS) {
      expect(m.displayName.length).toBeGreaterThan(0);
      expect(m.description.length).toBeGreaterThan(0);
    }
  });
});

describe('isAllowedModel', () => {
  it('accepts a valid provider + model pair', () => {
    expect(isAllowedModel('anthropic', 'claude-sonnet-4-6')).toBe(true);
    expect(isAllowedModel('openai', 'gpt-4o-mini')).toBe(true);
    expect(isAllowedModel('gemini', 'gemini-2.5-flash')).toBe(true);
  });

  it('rejects a model from a different provider', () => {
    expect(isAllowedModel('anthropic', 'gpt-4o')).toBe(false);
    expect(isAllowedModel('openai', 'gemini-2.5-pro')).toBe(false);
  });

  it('rejects unknown providers and models', () => {
    expect(isAllowedModel('mistral' as 'anthropic', 'claude-sonnet-4-6')).toBe(false);
    expect(isAllowedModel('anthropic', 'claude-opus-4-6')).toBe(false); // not on v1 menu
  });
});
