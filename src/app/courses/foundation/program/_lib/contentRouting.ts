// Pure content routing helpers — no Supabase imports, no side effects.
// Reads OnboardingAnswers and returns platform/role routing decisions
// consumed by module pages to select platform-specific content variants.

import type { OnboardingAnswers, LearnerRole } from '@/types/course';

const DEFAULT_PLATFORM_ORDER = [
  'ChatGPT',
  'Claude',
  'Copilot',
  'Gemini',
  'Perplexity',
  'NotebookLM',
] as const;

/**
 * Return an ordered list of platforms to highlight for this learner.
 *
 * Priority rules:
 *   1. M365 institution → Copilot moved to front.
 *   2. Personal ChatGPT Plus subscription → ChatGPT moved to front (if not already).
 *   3. Otherwise, default order applies.
 *
 * When both M365 and ChatGPT Plus are true, M365 takes precedence (institution
 * context is more actionable for professional training).
 */
export function getPlatformPriority(answers: OnboardingAnswers): string[] {
  const order = [...DEFAULT_PLATFORM_ORDER];

  if (answers.uses_m365 === 'yes') {
    // Bring Copilot to front
    const copilotIndex = order.indexOf('Copilot');
    if (copilotIndex > 0) {
      order.splice(copilotIndex, 1);
      order.unshift('Copilot');
    }
    return order;
  }

  if (answers.personal_ai_subscriptions.includes('ChatGPT Plus')) {
    // Bring ChatGPT to front
    const chatGptIndex = order.indexOf('ChatGPT');
    if (chatGptIndex > 0) {
      order.splice(chatGptIndex, 1);
      order.unshift('ChatGPT');
    }
    return order;
  }

  return order;
}

/**
 * Return the learner's primary role for role-specific content selection.
 */
export function getRoleSpotlight(answers: OnboardingAnswers): LearnerRole {
  return answers.primary_role;
}

/**
 * Combine platform priority and role into a single content variant descriptor
 * for a given module number.
 *
 * showM365Path: true when the learner is on M365 AND the module is Module 3
 * (the Copilot activation module where platform paths diverge most significantly).
 */
export function getContentVariant(
  answers: OnboardingAnswers,
  moduleNumber: number,
): {
  readonly platformOrder: string[];
  readonly role: LearnerRole;
  readonly showM365Path: boolean;
} {
  return {
    platformOrder: getPlatformPriority(answers),
    role: getRoleSpotlight(answers),
    showM365Path: answers.uses_m365 === 'yes' && moduleNumber === 3,
  };
}
