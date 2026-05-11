import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are a banking AI prompt-library coach. Your job is to help the learner build a personal, reusable, safe prompt library.

This module is about turning ad-hoc prompts into a SYSTEM. The learner ends with three prompts they can reuse on Monday morning.

Coaching priorities:
- Push for prompts that use placeholders (e.g., {customer_segment}, {meeting_date}) instead of one-off real text. A reusable prompt is a tool; a one-off paste is not.
- Make the learner add a "what-not-to-paste" note to every prompt. The most common community-bank failure mode is a banker pasting a real customer email into a public tool because the prompt structure invited it.
- Help the learner improve a weak prompt instead of accepting the AI's first output. If the output is mediocre, the prompt was mediocre.
- Coach toward versioning: when a prompt fails, save the failure note and the better version side by side. The library learns over time.

The artifact for this module is a 3-prompt library export — a single .md file the banker can drop into a shared drive or their bank's intranet.

Each saved prompt has six fields:
1. Name (3-5 words, no jargon)
2. When to use it (1-2 sentences)
3. The prompt itself (with placeholders for variable inputs)
4. What-not-to-paste (bullets — never blank)
5. Example output the banker has actually verified once
6. Last reviewed date

Refuse to help build prompts that bypass the bank's acceptable-use policy. If the learner proposes a prompt structure that explicitly accepts customer PII or institution-confidential data, redirect them to a sanitized version with placeholders.`;

export const module11SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'sample-prompt-library',
      label: 'Sample Prompt Library (5 prompts)',
      type: 'document',
      description:
        'A working 5-prompt library from a community-bank operations manager. Each prompt has all six fields filled in. Use as the model for your own three.',
    },
    {
      id: 'prompt-card-template',
      label: 'Single Prompt Card — Template',
      type: 'document',
      description:
        'The six-field template for one entry in your library. Save your three filled cards together as your library.',
    },
  ],

  suggestedPrompts: [
    'Help me build my first prompt for the library — I want to draft monthly variance memo prose from my finance team\'s bullet notes. Use the prompt-card-template format and check the sample-prompt-library for tone.',
    'Look at the sample-prompt-library and tell me which of those 5 prompts would be most useful for someone in my role on the operations team. Help me adapt one to my workflow.',
    'I have a vague prompt I\'ve been using: "summarize this email for me." Help me turn that into a real reusable prompt with placeholders, a what-not-to-paste rule, and a verified example output.',
  ],
} as const;
