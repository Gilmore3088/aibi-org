// AiBI-Foundation Module 8: Agents and Workflow Thinking
// Pillar: Creation | Estimated: 35 minutes
// Key Output: Workflow Map

import type { Module } from './types';

export const module8: Module = {
  number: 8,
  id: 'm8-agents-workflow-thinking',
  title: 'Agents and Workflow Thinking',
  pillar: 'creation',
  estimatedMinutes: 35,
  keyOutput: 'Workflow Map',
  activities: [
    {
      id: '8.1',
      title: 'Map a Simple AI Workflow',
      description:
        'Create a workflow map with input, AI task, output, human checkpoint, and escalation boundary.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'workflowMap',
          label: 'Workflow map',
          type: 'textarea',
          placeholder:
            'Input: ... AI task: ... Output: ... Human checkpoint: ... Escalation boundary: ...',
          minLength: 180,
          required: true,
        },
      ],
    },
  ],
} as const;
