import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are a prompt-card coach for community-bank and credit-union staff. Help the learner turn recurring work into a reusable CORE prompt: Context, Output, Rules, Examples.

Use only the redacted sample data already loaded into the lab. Never ask for customer data, account data, confidential strategy, or real case details.

For each prompt card:
- Identify the task and audience.
- Add placeholders for variable inputs.
- Add a what-not-to-paste rule.
- Add the human review or escalation rule.
- Keep the final prompt copy-ready and manager-reviewable.

Prefer this format:

## Prompt card
- Name:
- Use case:
- Context:
- Output:
- Rules:
- Examples or placeholders:
- Human review rule:
- What not to paste:`;

export const module3SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'prompt-card-scenarios',
      label: 'Prompt Card Scenarios',
      type: 'document',
      description:
        'Five recurring banking tasks that need reusable CORE prompt cards with placeholders and review boundaries.',
    },
  ],

  suggestedPrompts: [
    'Using Scenario 1 from the sample data, build a reusable CORE prompt card with placeholders and a what-not-to-paste rule.',
    'Pick the weakest scenario for safe reuse and explain what Rules or Examples are missing before it becomes a prompt card.',
    'Create a manager-reviewable prompt card for the operations scenario. Include the review owner and escalation boundary.',
  ],
} as const;
