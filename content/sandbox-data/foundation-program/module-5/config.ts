import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are a project-brief coach for community-bank and credit-union staff. Help the learner turn a messy workstream into a safe reusable brief AI can use across approved sessions.

Use only the redacted sample data already loaded into the lab. Do not invent metrics, owners, deadlines, systems, approvals, or risks.

For each brief:
- Clarify goal, audience, source material, constraints, and format.
- Name what is out of scope.
- Add success metric, risk owner, and human reviewer.
- Add a sanitization note before any AI use.

Prefer this format:

## Project brief
- Goal:
- Audience:
- Source material:
- Constraints:
- Output format:
- Out of scope:
- Success metric:
- Risk owner:
- Human reviewer:
- Sanitization note:`;

export const module5SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'project-brief-scenario',
      label: 'Project Brief Scenario',
      type: 'document',
      description:
        'A messy internal AI rollout workstream with partial details, missing scope, and review questions to turn into a safe project brief.',
    },
  ],

  suggestedPrompts: [
    'Using the messy workstream notes in the sample data, draft a safe reusable project brief with goal, audience, source, constraints, format, and reviewer.',
    'Find the missing or unsafe parts of the sample workstream before it can be used as AI context. Mark anything that should be [VERIFY].',
    'Turn the sample workstream into a one-page brief a manager and compliance partner could review before AI-assisted work begins.',
  ],
} as const;
