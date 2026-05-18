// AiBI-Foundation Module 7: AI Tools Landscape
// Pillar: Creation | Estimated: 35 minutes
// Key Output: Tool Choice Map

import type { Module } from './types';

export const module7: Module = {
  number: 7,
  id: 'm7-ai-tools-landscape',
  title: 'AI Tools Landscape',
  pillar: 'creation',
  estimatedMinutes: 35,
  keyOutput: 'Tool Choice Map',
  activities: [
    {
      id: '7.2',
      title: 'Choose the Right Tool',
      description:
        'Match three common banking tasks to the right tool category and explain the safety boundary.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'toolChoiceMap',
          label: 'Tool choice map',
          type: 'textarea',
          placeholder:
            'Task 1: ... Tool category: ... Why: ... Safety boundary: ...',
          minLength: 180,
          required: true,
        },
      ],
    },
  ],
} as const;
