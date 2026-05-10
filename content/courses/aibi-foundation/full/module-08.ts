// Foundation Full — Module 8: Prompting Fundamentals
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-08-spec.md

import type { FoundationModule } from '../types';

export const module08: FoundationModule = {
  number: 8,
  id: 'f8-prompting',
  trackId: 'full',
  trackPosition: '8',
  title: 'Prompting Fundamentals',
  pillar: 'understanding',
  estimatedMinutes: 30,
  keyOutput: 'Prompt Strategy Cheat Sheet (multi-model annotated)',
  dailyUseOutcomes: [
    'A cheat sheet built from your own work, annotated with which model handled which technique best.',
    'Four advanced prompt techniques you can apply tomorrow: role assignment, examples, step-by-step, iterative refinement.',
  ],
  activityTypes: ['multi-model', 'build-test', 'find-flaw'],
  whyThisExists: `Module 1 introduced C-A-T-C. Module 8 adds the four techniques that separate one-shot prompts from prompts that stand up to a year of use:

1. Role assignment (you are a community-bank compliance officer reviewing…)
2. Examples (show, don't just tell — one or two good outputs)
3. Step-by-step instructions (numbered steps for multi-part tasks)
4. Iterative refinement (what is missing? three alternatives? what would a regulator question?)

The output is a personal Prompt Strategy Cheat Sheet annotated with multi-model evidence — not a generic best-practices doc, but a record of which technique helped which model on the learner's own work.`,
  learningObjectives: [
    'Diagnose a weak prompt and name the missing C-A-T-C element.',
    'Apply role assignment, examples, step-by-step, and iterative refinement.',
    'Compare technique impact across three models and capture which model benefits most from each.',
    'Walk away with a Prompt Strategy Cheat Sheet personalized to your work.',
  ],
  sections: [
    {
      id: 'f8-four-techniques',
      title: 'The four advanced techniques',
      content: `**Role assignment.** Prefix the prompt with who the AI should be. *"You are a community-bank compliance officer reviewing a vendor's TPRM questionnaire response."* Specific roles outperform generic "you are an assistant" by a wide margin.

**Examples (few-shot).** Show one or two good outputs before asking for a new one. Examples teach style, format, and judgment more reliably than instructions do.

**Step-by-step instructions.** For multi-part tasks, list each step explicitly. Numbered steps reduce skipped work and make the AI's reasoning auditable.

**Iterative refinement.** Treat the AI as a conversation, not a vending machine. Three highly underused follow-ups:
- "What is missing?"
- "Three alternatives: more formal, more casual, shorter."
- "What would a regulator question?"

Each follow-up costs 30 seconds and routinely uncovers the issue that would have shown up in a manager's review three days later.`,
      tryThis: 'Pick your most-used prompt at work. Add one of the four techniques (whichever it lacks most). Run it through two models. Note which model benefited most.',
    },
  ],
  activities: [
    {
      id: '8.1',
      title: 'Diagnose the weak prompt',
      description: 'Three weak prompts. Annotate which C-A-T-C element is missing in each.',
      activityType: 'find-flaw',
      estimatedMinutes: 8,
      fields: [
        {
          id: 'diagnoses',
          label: 'For each of the three weak prompts, name the missing element and rewrite in one line.',
          type: 'textarea',
          minLength: 90,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '8.2',
      title: 'Build & test the four techniques',
      description: 'Four sub-activities. Same task with and without each technique, across three models. Capture which model benefits most from each.',
      activityType: 'build-test',
      estimatedMinutes: 16,
      fields: [
        {
          id: 'role-result',
          label: 'Role assignment: which model benefited most? Why?',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
        {
          id: 'examples-result',
          label: 'Examples: which model benefited most?',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
        {
          id: 'stepwise-result',
          label: 'Step-by-step: did the numbered steps help all three models or only some?',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
        {
          id: 'iteration-result',
          label: 'Iterative refinement: which follow-up most reliably surfaced something useful?',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '8.3',
      title: 'Rewrite a real prompt',
      description: 'Pick one weak prompt from 8.1, rewrite with all four techniques, test against all three models. Save as the first entry in the cheat sheet.',
      activityType: 'build-test',
      estimatedMinutes: 6,
      fields: [
        {
          id: 'rewrite',
          label: 'Final rewritten prompt + the model that handled it best.',
          type: 'textarea',
          minLength: 80,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '08-prompt-strategy-cheat-sheet',
    },
  ],
  artifacts: [
    {
      id: '08-prompt-strategy-cheat-sheet',
      title: 'Prompt Strategy Cheat Sheet',
      description: 'C-A-T-C plus the four advanced techniques, annotated with which model handled which technique best on your work.',
      format: 'pdf+md',
      triggeredBy: '8.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/08-prompt-strategy-cheat-sheet.md',
    },
  ],
  dependencies: ['f1-ai-for-your-workday'],
  forwardLinks: ['f10-projects-context', 'f11-document-workflows', 'f17-prompt-library', 'f20-final-lab'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-08-spec.md',
} as const;
