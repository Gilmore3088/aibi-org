// Foundation Full — Module 9: Your AI Work Profile
// NOTE: Activity Type 8 (real-world capture) is deferred at v2 launch.
// Module 9 ships with the Type 8 inventory replaced by a build-test inventory
// against synthetic-but-realistic task examples.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-09-spec.md

import type { FoundationModule } from '../types';

export const module09: FoundationModule = {
  number: 9,
  id: 'f9-work-profile',
  trackId: 'full',
  trackPosition: '9',
  title: 'Your AI Work Profile',
  pillar: 'understanding',
  estimatedMinutes: 20,
  keyOutput: 'AI Work Profile with top-3 candidates and signed boundaries',
  dailyUseOutcomes: [
    'A scored task inventory showing where AI fits and where it does not.',
    'A top-3 list of candidate workflows ready for Module 10 to project-ize.',
    "Five signed 'I will not use AI for' boundaries personalized to the role.",
  ],
  activityTypes: ['build-test'],
  whyThisExists: `By Module 9, the learner has the literacy floor (Modules 1-4), threat awareness and member-conversation skills (5-6), the regulatory routing (7), and the prompting toolkit (8). Module 9 turns those skills inward: which of *my* work tasks does AI fit, and which does it not?

The answer is not a list of all tasks. It is a top-3 — the three highest-leverage candidates that are AI-fit, safely-tiered, and high-frequency enough that any productivity gain compounds. Those three become the projects, the workflows, and the library entries in subsequent modules.`,
  learningObjectives: [
    'Inventory your week and tag each task by AI fit, data tier, and frequency.',
    'Apply a scoring rubric (high-fit + safe-tier + high-frequency = high score) to find the top 3.',
    'Articulate at least five tasks where AI does not belong and sign the boundary.',
    'Walk away with an AI Work Profile your manager can read.',
  ],
  sections: [
    {
      id: 'f9-task-types',
      title: 'The four task types',
      content: `| Task type | AI fit |
|---|---|
| Language tasks (drafting, rewriting, summarizing) | High |
| Lookup / reference tasks | Low to medium (verify with grounded Q&A) |
| Decision tasks (approving, dispositioning) | AI assists, never decides |
| Production tasks (posting transactions, running reports) | No fit |

The first column is what you *do*. The second is the calibration. Most banker tasks fall into the first two rows; the highest-leverage AI uses are language tasks at high frequency on internal-tier or sanitized data.`,
    },
    {
      id: 'f9-boundaries',
      title: 'The boundaries you sign',
      content: `Standard categories of "I will not use AI for…" — pick at least five and personalize:

- Decisions affecting members (always with a human signature).
- Sensitive personal communications (condolence notes, hardship letters, grievance responses).
- Regulator or examiner correspondence.
- Public-AI-with-NPI (always — restated from Module 4).
- Voice-as-value tasks (where the bank's voice is the point — board minutes, founder letters, retiring-employee tributes).
- Current or specific facts without verification (anything dated, dollared, named).

The list is signed. It lives on the back of the AI Work Profile. The signature is what makes the boundary a commitment instead of a preference.`,
      tryThis: 'Pick the boundary you are most likely to violate when in a hurry. Add a one-line trigger that catches you in the moment ("if I am about to email an examiner, slow down").',
    },
  ],
  activities: [
    {
      id: '9.1',
      title: 'Inventory your week',
      description: 'Daily / weekly / monthly task inventory. For each: name, time spent, AI fit (adaptive question), data tier, frequency.',
      activityType: 'build-test',
      estimatedMinutes: 10,
      fields: [
        {
          id: 'inventory',
          label: 'List 8-12 representative tasks with the four tags (name, time, fit, tier, frequency).',
          type: 'textarea',
          minLength: 200,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '9.2',
      title: 'Find your top 3',
      description: 'Platform applies the scoring rubric. Confirm the top 3 candidates.',
      activityType: 'build-test',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'top-3',
          label: 'Your three candidates and one-line rationale each.',
          type: 'textarea',
          minLength: 100,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '9.3',
      title: 'Set your boundaries',
      description: 'At least five "I will not use AI for…" items. Sign and save.',
      activityType: 'build-test',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'boundaries',
          label: 'Your five boundaries.',
          type: 'textarea',
          minLength: 80,
          required: true,
        },
        {
          id: 'signature',
          label: 'Sign your name.',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '09-ai-work-profile',
    },
  ],
  artifacts: [
    {
      id: '09-ai-work-profile',
      title: 'AI Work Profile',
      description: 'Task inventory + top-3 candidates + signed boundaries. Shareable with manager (M2 reviews these).',
      format: 'pdf+md',
      triggeredBy: '9.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/09-ai-work-profile.md',
    },
  ],
  forwardLinks: ['f10-projects-context', 'f16-role-cases', 'f17-prompt-library', 'm2-library-review'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-09-spec.md',
} as const;
