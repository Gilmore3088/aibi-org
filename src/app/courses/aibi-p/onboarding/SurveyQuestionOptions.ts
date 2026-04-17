// SurveyQuestionOptions — Shared option arrays for OnboardingSurvey step questions.

import type { OnboardingAnswers, LearnerRole } from '@/types/course';

export const USES_M365_OPTIONS = [
  { value: 'yes' as const, label: 'Yes, we use M365' },
  { value: 'no' as const, label: 'Not currently' },
  { value: 'not_sure' as const, label: "Not sure" },
] satisfies { value: OnboardingAnswers['uses_m365']; label: string }[];

export const AI_SUBSCRIPTION_OPTIONS = [
  'ChatGPT Plus',
  'Claude Pro',
  'Perplexity Pro',
  'Google Gemini',
  'Microsoft Copilot Pro',
  'Other',
] as const;

export const EXCLUSIVE_OPTIONS = [
  { value: 'free_tiers', label: 'No, just free tiers' },
  { value: 'none', label: 'None — no AI tools' },
] as const;

export const ROLE_OPTIONS: { value: LearnerRole; label: string }[] = [
  { value: 'lending', label: 'Lending' },
  { value: 'operations', label: 'Operations' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'it', label: 'IT' },
  { value: 'retail', label: 'Retail' },
  { value: 'executive', label: 'Executive' },
  { value: 'other', label: 'Other' },
];
