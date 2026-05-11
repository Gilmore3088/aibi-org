// AiBI-Foundation Module 12: Final Practitioner Lab
// Pillar: Application | Estimated: 45 minutes
// Key Output: Final Practitioner Lab Package

import type { Module } from './types';

export const module12: Module = {
  number: 12,
  id: 'm12-final-practitioner-lab',
  title: 'Final Practitioner Lab',
  pillar: 'application',
  estimatedMinutes: 45,
  keyOutput: 'Final Practitioner Lab Package',
  sections: [
    {
      id: 'm12-lab-purpose',
      title: 'Demonstrate Practical Judgment',
      content: `The final lab proves that you can use AI safely and usefully on a real work pattern. It is not a theory test. It is a reviewed work product package.

Choose a low-risk workflow, use sanitized or approved context, create a prompt, capture the AI-assisted output, review it, and submit the final version with notes about what you changed and why.`,
    },
    {
      id: 'm12-package',
      title: 'What to Submit',
      content: `Your final practitioner lab package should include:

1. Workflow description
2. Source context description with sensitive data removed
3. Prompt used
4. Raw AI-assisted output
5. Human review notes
6. Final edited output
7. Safety boundary and escalation note

The review notes matter. They show that you did not blindly accept the AI output.`,
      tryThis:
        'Draft the outline for your final lab package before producing the final output.',
    },
    {
      id: 'm12-banking-boundary',
      title: 'Banking Boundary',
      content: `Do not submit customer PII, account details, credit decisions, SAR-related material, confidential records, or any material your institution would not approve for training use.

The final lab should demonstrate safe judgment, not risky ambition.`,
    },
  ],
  activities: [
    {
      id: '12.1',
      title: 'Plan Your Final Practitioner Lab',
      description:
        'Define your final workflow, prompt, source context, review step, and artifact evidence.',
      type: 'form',
      completionTrigger: 'module-advance',
      fields: [
        {
          id: 'finalLabPlan',
          label: 'Final lab plan',
          type: 'textarea',
          placeholder:
            'Workflow, source context, prompt, raw output plan, review notes, final artifact, safety boundary...',
          minLength: 240,
          required: true,
        },
      ],
    },
  ],
} as const;
