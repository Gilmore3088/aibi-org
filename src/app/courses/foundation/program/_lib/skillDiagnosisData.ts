// Constants and pure helpers for Module 6 Activity 6.1 (SkillDiagnosis).
// Extracted from SkillDiagnosis.tsx per #245 so the orchestrator stays
// focused on render + submission orchestration.

export const WEAK_PROMPT =
  '"Check this quarterly statement for errors and tell me if the portfolio looks healthy compared to last year. Write it in an email."';

/**
 * Files in the Skill Template Library — the artifact the learner earns
 * by completing Activity 6.1. The PDF is rendered server-side from these
 * same five .md templates so the public download set stays in sync.
 */
export const TEMPLATE_FILES: ReadonlyArray<{
  readonly name: string;
  readonly label: string;
}> = [
  { name: 'meeting-summary.md', label: 'Meeting Summary' },
  { name: 'regulatory-research.md', label: 'Regulatory Research' },
  { name: 'loan-pipeline.md', label: 'Loan Pipeline Report' },
  { name: 'exception-report.md', label: 'Exception Report' },
  { name: 'marketing-content.md', label: 'Marketing Content' },
];

export const MIN_IMPROVED_SKILL_LENGTH = 100;

export interface DiagnosisState {
  missingComponent: string;
  improvedSkill: string;
  errors: Record<string, string>;
  submitting: boolean;
  submitted: boolean;
  serverError: string | null;
}

export function validateDiagnosis(
  missingComponent: string,
  improvedSkill: string,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!missingComponent) {
    errors['missing-components'] = 'Please select a missing component.';
  }
  if (improvedSkill.trim().length === 0) {
    errors['improved-skill'] = 'Improved skill is required.';
  } else if (improvedSkill.length < MIN_IMPROVED_SKILL_LENGTH) {
    errors['improved-skill'] =
      `Must be at least ${MIN_IMPROVED_SKILL_LENGTH} characters (currently ${improvedSkill.length}).`;
  }
  return errors;
}
