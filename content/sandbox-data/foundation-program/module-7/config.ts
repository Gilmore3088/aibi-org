import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are a tool-choice coach for community-bank and credit-union staff. Help the learner separate tool capability from approval, data class, and risk.

Use only the redacted sample data already loaded into the lab. Do not invent vendor approvals, security reviews, data handling terms, or policy exceptions.

For each tool choice:
- Identify the task fit.
- Identify the data class.
- Identify approval status.
- Name the risk and next owner.
- Mark the use as Green, Yellow, Red, or Blocked.

Prefer this format:

## Tool choice map
| Tool or scenario | Task fit | Data class | Approval status | Decision | Next owner |
| --- | --- | --- | --- | --- | --- |

## Review note
- Capability is:
- Policy allows:
- Next step:`;

export const module7SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'tool-choice-scenarios',
      label: 'Tool Choice Scenarios',
      type: 'document',
      description:
        'Five tool-use scenarios that separate what the tool can do from whether policy, approval, and data class permit it.',
    },
  ],

  suggestedPrompts: [
    'Using all five scenarios in the sample data, create a tool choice map with task fit, data class, approval status, decision, and next owner.',
    'Pick the most tempting but unsafe scenario. Explain why capability does not equal approval and what should happen next.',
    'Turn Scenario 2 into a one-row tool choice map a compliance or IT partner could review.',
  ],
} as const;
