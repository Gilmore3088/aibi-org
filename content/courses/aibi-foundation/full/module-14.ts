// Foundation Full — Module 14: Agents and Workflow Thinking
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-14-spec.md

import type { FoundationModule } from '../types';

export const module14: FoundationModule = {
  number: 14,
  id: 'f14-agents',
  trackId: 'full',
  trackPosition: '14',
  title: 'Agents and Workflow Thinking',
  pillar: 'creation',
  estimatedMinutes: 30,
  keyOutput: 'Workflow Map + Agent Design Sketch',
  dailyUseOutcomes: [
    'A multi-step workflow map for one of your top-3 candidates from Module 9.',
    'An Agent Design Sketch the learner can hand to IT or the AI program owner.',
    'A clear sense of where human checkpoints belong in any AI workflow.',
  ],
  activityTypes: ['build-test', 'tabletop-sim'],
  whyThisExists: `Modules 11-13 covered single-tool workflows. Module 14 covers what happens when a task has multiple steps that pass between tools (workflow) or when those steps run with autonomy (agent).

For Foundation, the agent topic is taught at the design level, not the deployment level. Bankers should be able to recognize an agent, sketch one, and understand where the human checkpoints belong — but operational deployment of agents lives in Specialist (which is why MCP and multi-agent orchestration are deferred there).`,
  learningObjectives: [
    'Distinguish workflow (orchestrated steps) from agent (autonomous steps).',
    'Map a multi-step task with explicit human checkpoints.',
    'Sketch an agent design that a non-technical reader could discuss with IT.',
    'Walk through an agent-tabletop scenario that catches a checkpoint failure.',
  ],
  sections: [
    {
      id: 'f14-workflow-vs-agent',
      title: 'Workflow versus agent',
      content: `**Workflow:** *I tell the AI: do step 1, then step 2, then step 3.* The sequence is fixed. The AI does each step, hands the output to the next step, and stops. Examples: summarize transcript → extract action items → draft follow-up emails.

**Agent:** *I tell the AI: here is the goal, here are the tools, work it out.* The AI decides which steps to run, in what order, and when to stop. Examples: a member-complaint triage agent that reads the complaint, classifies it, drafts an acknowledgment, and routes to the right team — choosing which path applies.

Workflows are predictable; agents are leveraged. The trade-off is auditability. A workflow is easy to reason about because the steps are fixed. An agent requires monitoring because the steps are not. For community banks, **most use cases want workflows, not agents**, and the few use cases where agents help benefit from explicit human checkpoints at every step that affects a member.`,
    },
    {
      id: 'f14-checkpoints',
      title: 'Where human checkpoints belong',
      content: `In any AI workflow or agent at a community bank, a human reviews and approves before:

1. Anything goes to a member.
2. Anything is filed with a regulator.
3. Anything is recorded as a decision (credit, dispute resolution, account closure).
4. Anything moves money.
5. Anything is recorded as a vendor evaluation or contract step.

Every other step can run automatically. The five checkpoints are the line between *AI assists* and *AI decides*. Module 14 trains the learner to spot the checkpoint placement in any sketched workflow — yours or someone else's.`,
      tryThis: 'Take a workflow you do today (no AI). Identify which steps would change if AI did them. Now identify which checkpoints you would *not* automate even if you could. The non-automated checkpoints are the governance signal.',
    },
  ],
  activities: [
    {
      id: '14.1',
      title: 'Map a multi-step workflow',
      description: 'Pick one of your top-3 candidates from Module 9. Map the steps explicitly. Mark where AI helps and where the human checkpoints are.',
      activityType: 'build-test',
      estimatedMinutes: 15,
      fields: [
        {
          id: 'workflow-name',
          label: 'Name of the workflow.',
          type: 'text',
          required: true,
        },
        {
          id: 'steps',
          label: 'List the steps in order. Tag each as AI, Human, or AI-with-checkpoint.',
          type: 'textarea',
          minLength: 150,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '14.2',
      title: 'Sketch an agent design',
      description: 'Convert the workflow into a one-paragraph agent sketch IT could read. Include goal, tools available to the agent, and where humans must approve.',
      activityType: 'build-test',
      estimatedMinutes: 10,
      fields: [
        {
          id: 'agent-sketch',
          label: 'Your agent sketch.',
          type: 'textarea',
          minLength: 150,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '14-agent-design-sketch',
    },
    {
      id: '14.3',
      title: 'Tabletop: an agent runs without a checkpoint',
      description: 'A simulated complaint-triage agent skips the human checkpoint and sends a wrong response to a member. Walk through the after-action.',
      activityType: 'tabletop-sim',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'lessons',
          label: 'Two lessons from the tabletop.',
          type: 'textarea',
          minLength: 60,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '14-workflow-map',
    },
  ],
  artifacts: [
    {
      id: '14-workflow-map',
      title: 'Workflow Map',
      description: 'Multi-step task with AI/human/AI-with-checkpoint tags. Reusable template for the rest of your top-3.',
      format: 'pdf+md',
      triggeredBy: '14.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/14-workflow-map.md',
    },
    {
      id: '14-agent-design-sketch',
      title: 'Agent Design Sketch',
      description: 'A conversation-starter for IT or the AI program owner. Goal, tools, checkpoints.',
      format: 'pdf+md',
      triggeredBy: '14.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/14-agent-design-sketch.md',
    },
  ],
  dependencies: ['f9-work-profile', 'f10-projects-context', 'f12-spreadsheet-workflows'],
  forwardLinks: ['f17-prompt-library', 'f20-final-lab'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-14-spec.md',
} as const;
