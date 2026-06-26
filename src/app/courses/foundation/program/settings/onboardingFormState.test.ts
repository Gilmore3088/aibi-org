import { describe, it, expect } from 'vitest';
import { deriveInitialFormState } from './onboardingFormState';
import type { OnboardingAnswers } from '@/types/course';

describe('deriveInitialFormState', () => {
  it('returns an empty form when answers is null', () => {
    expect(deriveInitialFormState(null)).toEqual({
      uses_m365: null,
      personal_ai_subscriptions: [],
      exclusive_selection: null,
      primary_role: null,
    });
  });

  it('does not throw and defaults subscriptions to [] when personal_ai_subscriptions is missing', () => {
    // Regression: the dev-enrollment bypass and partial/legacy real records can
    // omit personal_ai_subscriptions. This previously crashed the settings page
    // with "TypeError: Cannot read properties of undefined (reading 'filter')".
    const partial = { uses_m365: 'yes', primary_role: 'other' } as unknown as OnboardingAnswers;
    expect(() => deriveInitialFormState(partial)).not.toThrow();
    const state = deriveInitialFormState(partial);
    expect(state.personal_ai_subscriptions).toEqual([]);
    expect(state.uses_m365).toBe('yes');
    expect(state.primary_role).toBe('other');
  });

  it('does not throw on a completely malformed answers object', () => {
    expect(() => deriveInitialFormState({} as unknown as OnboardingAnswers)).not.toThrow();
  });

  it('keeps only known subscriptions and detects the exclusive sentinel', () => {
    const answers = {
      uses_m365: 'no',
      personal_ai_subscriptions: ['ChatGPT Plus', 'free_tiers', 'Bogus Tool'],
      primary_role: 'lending',
    } as unknown as OnboardingAnswers;
    const state = deriveInitialFormState(answers);
    expect(state.personal_ai_subscriptions).toEqual(['ChatGPT Plus']);
    expect(state.exclusive_selection).toBe('free_tiers');
  });
});
