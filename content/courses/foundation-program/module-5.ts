// AiBI-Foundation Module 5: Projects and Context
// Pillar: Understanding | Estimated: 35 minutes
// Key Output: Project Brief Template

import type { Module } from './types';

export const module5: Module = {
  number: 5,
  id: 'm5-projects-and-context',
  title: 'Projects and Context',
  pillar: 'understanding',
  estimatedMinutes: 35,
  keyOutput: 'Project Brief Template',
  activities: [
    {
      id: '5.1',
      title: 'Write a Project Brief',
      description:
        'Create a reusable project brief for one recurring banking task using placeholders instead of sensitive details.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'projectBrief',
          label: 'Project brief',
          type: 'textarea',
          placeholder:
            'Project, role, audience, source context, output format, constraints, and review step...',
          minLength: 200,
          required: true,
        },
      ],
    },
  ],
} as const;
