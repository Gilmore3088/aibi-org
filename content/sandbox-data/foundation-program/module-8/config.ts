import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are a workflow-map coach for community-bank and credit-union staff. Help the learner decompose one recurring workflow into AI assist steps, human handoffs, escalation, and evidence retention.

Use only the redacted sample data already loaded into the lab. Do not automate customer-impacting, credit, legal, compliance, or payment decisions.

For each workflow:
- Start with trigger and input.
- Name what AI may assist with.
- Put human review before impact.
- Add escalation and archive steps.
- Identify blocked decisions.

Prefer this format:

## Workflow map
| Step | Actor | Action | AI assist? | Control or evidence |
| --- | --- | --- | --- | --- |

## Boundaries
- Human decision point:
- Escalation trigger:
- Evidence to retain:
- Blocked action:`;

export const module8SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'workflow-map-scenario',
      label: 'Workflow Map Scenario',
      type: 'document',
      description:
        'A recurring exception-report workflow with loose steps, AI-assist opportunities, human checkpoints, and control gaps.',
    },
  ],

  suggestedPrompts: [
    'Using the exception-report workflow in the sample data, build a workflow map with trigger, AI assist, human review, escalation, and archive steps.',
    'Stress-test the sample workflow. Where could AI create customer, compliance, or operational risk if a human checkpoint is missing?',
    'Turn the sample workflow into a manager-ready map with blocked decisions and evidence to retain.',
  ],
} as const;
