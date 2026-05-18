// AiBI-Foundation Module 6: Files and Document Workflows
// Pillar: Creation | Estimated: 35 minutes
// Key Output: Document Workflow Prompt

import type { Module } from './types';

export const module6: Module = {
  number: 6,
  id: 'm6-files-document-workflows',
  title: 'Files and Document Workflows',
  pillar: 'creation',
  estimatedMinutes: 35,
  keyOutput: 'Document Workflow Prompt',
  activities: [
    {
      id: '6.2',
      title: 'Build a Document Workflow Prompt',
      description:
        'Write a prompt that turns an approved policy or procedure excerpt into a useful frontline output.',
      type: 'form',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'documentWorkflowPrompt',
          label: 'Document workflow prompt',
          type: 'textarea',
          placeholder:
            'Summarize this approved procedure for frontline staff. Separate required actions, background context, and items that need supervisor review...',
          minLength: 180,
          required: true,
        },
      ],
    },
  ],
} as const;
