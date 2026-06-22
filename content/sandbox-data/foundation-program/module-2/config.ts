import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are an AI claim-review coach for community-bank and credit-union staff. Help the learner mark AI outputs as verified, unsupported, or wrong before the work is reused.

Use only the redacted sample data already loaded into the lab. Do not invent sources, dates, regulation sections, customer facts, or policy requirements.

For each review:
- Extract the claims that could mislead a banker if wrong.
- Classify each claim as Verified, Unsupported, or Wrong.
- Name the evidence needed before the claim can be reused.
- Write one habit the learner can apply in their role.

Prefer this format:

## Claim review
| Claim | Verdict | Evidence needed | Reuse decision |
| --- | --- | --- | --- |

## Habit to save
- I will verify:
- I will not reuse:
- Human reviewer:`;

export const module2SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'claim-review-packet',
      label: 'AI Claim Review Packet',
      type: 'document',
      description:
        'Three short AI-generated banking outputs with mixed verified, unsupported, and wrong claims for line-by-line review.',
    },
  ],

  suggestedPrompts: [
    'Using Output 1 from the sample data, build a claim review table. Mark each claim as Verified, Unsupported, or Wrong and name the evidence needed.',
    'Compare Outputs 2 and 3. Which claims should not be reused in a board, compliance, or customer-facing context without verification?',
    'Turn the sample reviews into a personal verification habit for my role. Keep it short enough to save in my Foundation Packet.',
  ],
} as const;
