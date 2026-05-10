// IterationTrackerData — Field definitions, step config, validation, and
// markdown utilities for IterationTracker.

import type { FieldDef } from './IterationFields';

export const FIELD_IDS = {
  testInput1: 'test-input-1',
  outputAssessment1: 'output-assessment-1',
  testInput2: 'test-input-2',
  outputAssessment2: 'output-assessment-2',
  revisionNotes: 'revision-notes',
  sharingLadderLevel: 'sharing-ladder-level',
} as const;

export const SHARING_LADDER_OPTIONS = [
  { value: 'personal', label: 'Personal — still in testing, not ready to share' },
  { value: 'team', label: 'Team — ready to share with my immediate team for peer review' },
  { value: 'institution', label: 'Institution — polished enough for institution-wide distribution' },
  { value: 'not-sure', label: 'Not sure — needs one more iteration' },
] as const;

export const STEPS = [
  {
    number: 1,
    id: 'stress-test',
    label: 'Stress Test',
    description:
      'Run your skill against two real work inputs — not ideal examples, but messy or edge-case inputs from your actual workflow. Observe the outputs carefully.',
    fieldIds: [FIELD_IDS.testInput1, FIELD_IDS.testInput2],
  },
  {
    number: 2,
    id: 'diagnose',
    label: 'Diagnose',
    description:
      'Categorize each failure or unexpected output by RTFC component — Role, Task, Format, or Constraint. This prevents patching symptoms instead of root causes.',
    fieldIds: [FIELD_IDS.outputAssessment1, FIELD_IDS.outputAssessment2],
  },
  {
    number: 3,
    id: 'revise',
    label: 'Revise and Version',
    description:
      'Make targeted revisions and document what changed and why. Then identify where your iterated skill sits on the Sharing Ladder.',
    fieldIds: [FIELD_IDS.revisionNotes, FIELD_IDS.sharingLadderLevel],
  },
] as const;

export const FIELDS: FieldDef[] = [
  {
    id: FIELD_IDS.testInput1,
    label:
      'Describe the first real input you tested your skill against (do not include Tier 3 data — describe the type and general content)',
    type: 'textarea',
    minLength: 20,
    placeholder:
      'e.g., A loan document package with incomplete collateral documentation and an unusual property type. Three items were missing from the standard checklist.',
  },
  {
    id: FIELD_IDS.outputAssessment1,
    label: 'How did the skill perform on input 1? What worked well? What failed?',
    type: 'textarea',
    minLength: 30,
    placeholder:
      'Describe what the AI produced. Did it follow the Role, Task, Format, and Constraints? Were there unexpected outputs? Which component failed if something went wrong?',
  },
  {
    id: FIELD_IDS.testInput2,
    label: 'Describe the second real input you tested (edge case or challenging scenario)',
    type: 'textarea',
    minLength: 20,
    placeholder:
      'e.g., A more complex or unusual version of the same task type. The edge case is where skills most often break.',
  },
  {
    id: FIELD_IDS.outputAssessment2,
    label: 'How did the skill perform on input 2? Did the edge case reveal any failures?',
    type: 'textarea',
    minLength: 30,
    placeholder:
      'Describe the output and any failures. Edge cases often reveal constraint gaps — what should have been prevented but was not?',
  },
  {
    id: FIELD_IDS.revisionNotes,
    label:
      'What changes did you make to improve the skill? Describe the revision and the component it addressed.',
    type: 'textarea',
    minLength: 30,
    placeholder:
      'e.g., "Added a Constraint: Never produce output in paragraph form — always use the specified table format." or "Strengthened the Role: Added specific expertise in [topic] to improve the quality of [specific output type]."',
  },
  {
    id: FIELD_IDS.sharingLadderLevel,
    label:
      'Where does this skill sit on the Sharing Ladder? Is it ready to share with your team, or still in personal sandbox testing?',
    type: 'radio',
    options: SHARING_LADDER_OPTIONS,
  },
];

export function getInitialValues(
  existingResponse?: Record<string, string> | null,
): Record<string, string> {
  const initial: Record<string, string> = {};
  for (const field of FIELDS) {
    initial[field.id] = existingResponse?.[field.id] ?? '';
  }
  return initial;
}

export function validateValues(values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of FIELDS) {
    const value = values[field.id] ?? '';
    if (field.type === 'radio') {
      if (!value) errors[field.id] = `${field.label} is required.`;
    } else {
      if (!value.trim()) {
        errors[field.id] = 'This field is required.';
      } else if (field.minLength && value.length < field.minLength) {
        errors[field.id] = `Must be at least ${field.minLength} characters (currently ${value.length}).`;
      }
    }
  }
  return errors;
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateIteratedMarkdown(
  originalMd: string,
  values: Record<string, string>,
): string {
  const revisionNotes = values[FIELD_IDS.revisionNotes] ?? '';
  const sharingLevel = values[FIELD_IDS.sharingLadderLevel] ?? '';

  const iterationHeader =
    `<!-- Iteration Log -->\n` +
    `<!-- Version: 1.1 -->\n` +
    `<!-- Changes: ${revisionNotes.replace(/\n/g, ' ')} -->\n` +
    `<!-- Sharing Level: ${sharingLevel} -->\n\n`;

  const bumpedOriginal = originalMd.replace(/# (.+) - v1\.0/, '# $1 - v1.1');
  return iterationHeader + bumpedOriginal;
}

export function buildIteratedFilename(originalMd: string): string {
  const match = /^# (.+?) - v1/m.exec(originalMd);
  if (match) {
    return (
      match[1]
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60) + '-v1.1.md'
    );
  }
  return 'Banking-AI-Skill-v1.1.md';
}
