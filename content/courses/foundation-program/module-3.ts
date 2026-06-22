// AiBI-Foundation Module 3: Prompting Fundamentals
// Pillar: Understanding | Estimated: 35 minutes
// Key Output: A prompt that gets to the CORE (built in the Prompt Wizard)
//
// Rebuilt 2026-06 around the CORE anatomy + the strategy shelf, with the
// Prompt Wizard (Activity 3.1) as the interactive practice. CORE is how you
// build any one prompt; the strategy shelf is which kind to reach for. The
// two safety moves (Check, Escalate) are deliberately deferred to Module 9 —
// Module 3 lights up the first three moves of the 5-move card.

import type { Module } from './types';

export const module3: Module = {
  number: 3,
  id: 'm3-prompting-fundamentals',
  title: 'Prompting Fundamentals',
  pillar: 'understanding',
  estimatedMinutes: 35,
  keyOutput: 'A prompt that gets to the CORE',
  roleSpecific: true,
  tables: [
    {
      id: 'm3-core-anatomy',
      caption: 'The CORE of every good prompt',
      columns: [
        { header: 'Element', key: 'element' },
        { header: 'What it does', key: 'does' },
        { header: 'Banking example', key: 'example' },
      ],
      rows: [
        {
          element: 'Context / role',
          does: 'Tells the AI who it is and who the answer is for.',
          example: '"You are a branch banking assistant helping a teller answer a member."',
        },
        {
          element: 'Objective',
          does: 'States the exact task — not just the topic.',
          example: '"Tell me whether this $12 fee can be waived, and the conditions."',
        },
        {
          element: 'Resources',
          does: 'Points the AI at the approved source and forbids guessing.',
          example: '"Use only the fee-waiver policy below. If it is not covered, say so."',
        },
        {
          element: 'Expectations',
          does: 'Constrains the output shape and limits.',
          example: '"Answer in 2–3 plain-English sentences; flag anything needing approval."',
        },
      ],
    },
    {
      id: 'm3-prompt-strategy-map',
      caption: 'The strategy shelf — six prompt styles for daily banking work',
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
      title: 'Match the task to the strategy',
      description:
        'Quick-fire reps on the strategy shelf: a banking task appears, you pick the right prompt strategy, and you get instant feedback with a one-line reason. Eight tasks, untimed, no penalty — learn which kind of prompt to reach for before you build one.',
      type: 'drill',
      completionTrigger: 'save-response',
      fields: [
        {
          id: 'strategy_drill_result',
          label: 'Strategy drill result',
          type: 'textarea',
          minLength: 10,
          required: true,
          placeholder: 'The drill records how many tasks you matched to the right strategy.',
        },
      ],
    },
    {
      id: '3.2',
      title: 'Build a prompt that gets to the CORE',
      description:
        'Write a freeform prompt for a real banking task in the Prompt Wizard. Each run scores your prompt on the four CORE elements and shows how the AI answer changes — invented numbers when you skip the source, buried answers when you skip the format. You get six tries per scenario across a warm-up (fee waiver) and a graded task (CD early-withdrawal penalty). Save the prompt you land on.',
      type: 'builder',
      completionTrigger: 'save-response',
      artifactId: 'prompt-strategy-cheat-sheet',
      fields: [
        {
          id: 'final_prompt',
          label: 'The prompt you landed on',
          type: 'textarea',
          minLength: 60,
          required: true,
          placeholder:
            'The wizard fills this from your best attempt — a prompt that names the role, states the task, grounds the answer in the approved source, and sets the format.',
        },
      ],
    },
  ],
  artifacts: [
    {
      id: 'prompt-strategy-cheat-sheet',
      title: 'Prompt Strategy Cheat Sheet',
      description:
        'The CORE anatomy plus the strategy shelf — how to build any prompt and which style to reach for.',
      format: 'pdf+md',
      triggeredBy: '3.2',
      dynamic: false,
    },
  ],
} as const;
