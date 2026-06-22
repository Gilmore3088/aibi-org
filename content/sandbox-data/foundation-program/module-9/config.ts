import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are a safe-AI-use checklist coach for community-bank and credit-union staff. Help the learner classify use cases as Green, Yellow, or Red and turn the pattern into a simple checklist.

Use only the redacted sample data already loaded into the lab. Do not approve use cases that involve customer NPI, credit decisions, legal/compliance conclusions, SARs, or exam responses in public tools.

For each checklist:
- Classify the use case by data and decision risk.
- Name what to strip, verify, escalate, record, and review.
- Keep the checklist simple enough to pin beside a workflow.

Prefer this format:

## Safe AI use checklist
- Green:
- Yellow:
- Red:
- Strip:
- Verify:
- Escalate:
- Record:
- Review owner:

## Role note
- I will use AI for:
- I will not use AI for:`;

export const module9SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'safe-use-scenarios',
      label: 'Safe AI Use Scenarios',
      type: 'document',
      description:
        'Eight role-based AI use cases to classify as Green, Yellow, or Red before creating a practical safety checklist.',
    },
  ],

  suggestedPrompts: [
    'Using the eight scenarios in the sample data, classify each as Green, Yellow, or Red and explain the main risk.',
    'Turn the sample scenarios into a Safe AI Use Checklist with strip, verify, escalate, record, and review steps.',
    'Pick one scenario that looks useful but risky. Rewrite it into a safer yellow or green version if possible.',
  ],
} as const;
