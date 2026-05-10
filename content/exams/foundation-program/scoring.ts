// AiBI-P Proficiency Assessment — Scoring
// No pass/fail. Proficiency levels indicate readiness for certification submission.

export interface ProficiencyLevel {
  readonly id: 'foundational' | 'developing' | 'proficient' | 'advanced';
  readonly label: string;
  readonly minPct: number;
  readonly maxPct: number;
  readonly colorVar: string;
  readonly headline: string;
  readonly summary: string;
  readonly recommendation: string;
}

export const proficiencyLevels: readonly ProficiencyLevel[] = [
  {
    id: 'foundational',
    label: 'Foundational',
    minPct: 0,
    maxPct: 40,
    colorVar: 'var(--color-error)',
    headline: 'You are building the foundation.',
    summary:
      'Your understanding of AI in a banking context is in its early stages. This is normal if you have not yet worked through the AI Foundations curriculum.',
    recommendation:
      'Start with the AI Foundations course ($97). It covers the core concepts assessed here — Gen AI fundamentals, the RTFC prompting framework, safe use, use case identification, and measurement. After completing the course, retake this assessment to see your progress.',
  },
  {
    id: 'developing',
    label: 'Developing',
    minPct: 41,
    maxPct: 60,
    colorVar: 'var(--color-terra)',
    headline: 'You have a working base. Specific gaps remain.',
    summary:
      'You understand several core concepts but have gaps in specific areas. Your topic breakdown below shows where to focus your study before submitting a work product for certification.',
    recommendation:
      'Review the topic breakdown below. Focus your study on the one or two weakest areas. When your retake places you at Proficient or above, you are ready to submit your work product for the Practitioner credential.',
  },
  {
    id: 'proficient',
    label: 'Proficient',
    minPct: 61,
    maxPct: 80,
    colorVar: 'var(--color-terra-light)',
    headline: 'You are ready to pursue certification.',
    summary:
      'You have demonstrated sufficient knowledge across the five assessment dimensions to submit a work product for the Practitioner credential. Your submission will be evaluated against the AiBI-P rubric.',
    recommendation:
      'Proceed to the Practitioner certification inquiry form. You will submit a real work product — something you would actually present to a supervisor — assessed across five rubric dimensions (Accuracy, Completeness, Tone, Judgment, Usability).',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    minPct: 81,
    maxPct: 100,
    colorVar: 'var(--color-sage)',
    headline: 'Strong mastery. Proceed with confidence.',
    summary:
      'You have demonstrated strong knowledge across all five assessment dimensions. Your readiness for the Practitioner credential is clear.',
    recommendation:
      'Submit your work product for the Practitioner credential and consider whether the Specialist track (AiBI-S) is the right next step for your role. Your topic mastery suggests you may be ready for department-level AI leadership.',
  },
];

export function getProficiencyLevel(pctCorrect: number): ProficiencyLevel {
  const clamped = Math.min(Math.max(pctCorrect, 0), 100);
  const match = proficiencyLevels.find(
    (l) => clamped >= l.minPct && clamped <= l.maxPct
  );
  return match ?? proficiencyLevels[0];
}
