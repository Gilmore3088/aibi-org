// Pure helper: derive the settings form's initial state from stored
// onboarding answers. Extracted from OnboardingSettings so it can be unit
// tested without importing the client component (which pulls in
// next/navigation and a server action).

import type { OnboardingAnswers, LearnerRole } from '@/types/course';
import { AI_SUBSCRIPTION_OPTIONS } from '../onboarding/SurveyQuestionOptions';

export type ExclusiveValue = 'free_tiers' | 'none';

export interface FormState {
  uses_m365: OnboardingAnswers['uses_m365'] | null;
  personal_ai_subscriptions: string[];
  exclusive_selection: ExclusiveValue | null;
  primary_role: LearnerRole | null;
}

const KNOWN_SUBSCRIPTIONS = new Set<string>(AI_SUBSCRIPTION_OPTIONS);

export function deriveInitialFormState(answers: OnboardingAnswers | null): FormState {
  if (!answers) {
    return {
      uses_m365: null,
      personal_ai_subscriptions: [],
      exclusive_selection: null,
      primary_role: null,
    };
  }

  // Defensive: the dev-enrollment bypass and partial/legacy records can omit
  // personal_ai_subscriptions. Never assume it is an array (the old `as string[]`
  // cast hid this and crashed the settings page).
  const subscriptions: readonly string[] = Array.isArray(answers.personal_ai_subscriptions)
    ? answers.personal_ai_subscriptions
    : [];
  const knownSubs = subscriptions.filter((s) => KNOWN_SUBSCRIPTIONS.has(s));
  // Detect the exclusive sentinel ('free_tiers' / 'none') encoded into
  // personal_ai_subscriptions on submit, so re-opening settings keeps the
  // original selection.
  const exclusive: ExclusiveValue | null = subscriptions.includes('free_tiers')
    ? 'free_tiers'
    : subscriptions.includes('none')
      ? 'none'
      : null;

  return {
    uses_m365: answers.uses_m365 ?? null,
    personal_ai_subscriptions: knownSubs,
    exclusive_selection: exclusive,
    primary_role: answers.primary_role ?? null,
  };
}
