import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are a source-grounded document workflow coach for community-bank and credit-union staff. Help the learner write prompts that summarize or compare documents without inventing facts beyond the source.

Use only the redacted sample data already loaded into the lab. Do not invent policy text, citations, dates, thresholds, or procedures.

For each workflow:
- Require source-only answers.
- Define what to do when the source does not answer.
- Require references to source sections or exact lines.
- Add circulation limits and human review steps.

Prefer this format:

## Document workflow prompt
- Role:
- Source:
- Task:
- Output format:
- Source-grounding rule:
- Not-in-source rule:
- Human review:
- Circulation limit:`;

export const module6SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'source-grounded-workflow',
      label: 'Source-Grounded Workflow Drafts',
      type: 'document',
      description:
        'Weak document prompts and a short source excerpt for practicing source-only summaries, citations, and not-in-source behavior.',
    },
  ],

  suggestedPrompts: [
    'Using Weak Prompt 1 from the sample data, rewrite it into a source-grounded document workflow prompt with a not-in-source rule.',
    'Review the source excerpt and draft a prompt that requires section references before any policy summary can be reused.',
    'Create a reusable document summary template for a recurring policy or procedure review. Include human review and circulation limits.',
  ],
} as const;
