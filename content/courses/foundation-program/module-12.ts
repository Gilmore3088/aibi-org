// AiBI-Foundation Module 12: Final Foundation Lab
// Pillar: Application | Estimated: 45 minutes
// Key Output: Final Foundation Lab Package

import type { Module } from './types';

export const module12: Module = {
  number: 12,
  id: 'm12-final-practitioner-lab',
  title: 'Final Foundation Lab',
  pillar: 'application',
  estimatedMinutes: 45,
  keyOutput: 'Final Foundation Lab Package',
  activities: [
    {
      id: '12.1',
      title: 'Plan Your Final Foundation Lab',
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
