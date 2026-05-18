// AiBI-Foundation Module 3: Prompting Fundamentals
// Pillar: Understanding | Estimated: 30 minutes
// Key Output: Prompt Strategy Cheat Sheet

import type { Module } from './types';

export const module3: Module = {
  number: 3,
  id: 'm3-prompting-fundamentals',
  title: 'Prompting Fundamentals',
  pillar: 'understanding',
  estimatedMinutes: 30,
  keyOutput: 'Prompt Strategy Cheat Sheet',
  roleSpecific: true,
  tables: [
    {
      id: 'm3-prompt-strategy-map',
      caption: 'Six Prompt Strategies for Daily Banking Work',
      columns: [
        { header: 'Strategy', key: 'strategy' },
        { header: 'Use When', key: 'useWhen' },
        { header: 'Banking Example', key: 'example' },
      ],
      rows: [
        {
          strategy: 'Structured',
          useWhen: 'You need a clear first draft or output.',
          example: 'Draft a customer response with tone, length, and review constraints.',
        },
        {
          strategy: 'Transformation',
          useWhen: 'You already have text or notes and need a better form.',
          example: 'Rewrite a wordy procedure email so the action is obvious.',
        },
        {
          strategy: 'Analysis',
          useWhen: 'You need review, risk detection, comparison, or gap finding.',
          example: 'Identify unsupported claims in an AI-generated answer.',
        },
        {
          strategy: 'Thinking',
          useWhen: 'You need help planning, brainstorming, or breaking down a problem.',
          example: 'Break a process improvement problem into steps and decisions.',
        },
        {
          strategy: 'Template',
          useWhen: 'The task repeats and deserves a reusable pattern.',
          example: 'Create a weekly report prompt with placeholders and safety notes.',
        },
        {
          strategy: 'Sanitization',
          useWhen: 'The source material may contain sensitive or unnecessary data.',
          example: 'Remove customer identifiers before asking for a generic draft.',
        },
      ],
    },
  ],
  activities: [
    {
      id: '3.1',
      title: 'Choose the Right Prompt Strategy',
      description:
        'Match six banking tasks to the right prompt strategy and write one reusable structured prompt for your role.',
      type: 'form',
      completionTrigger: 'save-response',
      artifactId: 'prompt-strategy-cheat-sheet',
      fields: [
        {
          id: 'strategyMap',
          label: 'Prompt strategy map',
          type: 'textarea',
          minLength: 220,
          required: true,
          placeholder:
            'Task: ... Strategy: structured / transformation / analysis / thinking / template / sanitization. Why this strategy fits: ... Human review needed: ...',
        },
      ],
    },
  ],
  artifacts: [
    {
      id: 'prompt-strategy-cheat-sheet',
      title: 'Prompt Strategy Cheat Sheet',
      description: 'A practical guide for choosing the right type of prompt for daily banking work.',
      format: 'pdf+md',
      triggeredBy: '3.1',
      dynamic: false,
    },
  ],
} as const;
