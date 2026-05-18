// AiBI-Foundation Module 10: Role-Based Use Cases
// Pillar: Application | Estimated: 35 minutes
// Key Output: Role Use-Case Card

import type { Module } from './types';

export const module10: Module = {
  number: 10,
  id: 'm10-role-based-use-cases',
  title: 'Role-Based Use Cases',
  pillar: 'application',
  estimatedMinutes: 35,
  keyOutput: 'Role Use-Case Card',
  roleSpecific: true,
  activities: [
    {
      id: '10.1',
      title: 'Create a Role Use-Case Card',
      description:
        'Select one useful role-based AI use case and document its task, data boundary, review step, and expected output.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'roleUseCaseCard',
          label: 'Role use-case card',
          type: 'textarea',
          placeholder:
            'Role: ... Use case: ... Input: ... Output: ... Safety boundary: ... Review step: ...',
          minLength: 180,
          required: true,
        },
      ],
    },
  ],
} as const;
