// AiBI-Foundation Module 11: Personal Prompt Library
// Pillar: Application | Estimated: 35 minutes
// Key Output: Personal Prompt Library

import type { Module } from './types';

export const module11: Module = {
  number: 11,
  id: 'm11-personal-prompt-library',
  title: 'Personal Prompt Library',
  pillar: 'application',
  estimatedMinutes: 35,
  keyOutput: 'Personal Prompt Library',
  activities: [
    {
      id: '11.1',
      title: 'Build a Personal Prompt Card',
      description:
        'Create one reusable prompt card for a task you expect to perform again.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'personalPromptCard',
          label: 'Prompt card',
          type: 'textarea',
          placeholder:
            'Title, when to use it, what to paste, what not to paste, prompt text, example output, safety notes...',
          minLength: 220,
          required: true,
        },
      ],
    },
  ],
} as const;
