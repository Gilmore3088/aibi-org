// Foundation Full — Module 10: Projects and Context
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-10-spec.md

import type { FoundationModule } from '../types';

export const module10: FoundationModule = {
  number: 10,
  id: 'f10-projects-context',
  trackId: 'full',
  trackPosition: '10',
  title: 'Projects and Context',
  pillar: 'understanding',
  estimatedMinutes: 20,
  keyOutput: 'Project Brief deployable in two platforms',
  dailyUseOutcomes: [
    'A reusable Project Brief covering role, context, rules, format, and what-to-ask-me.',
    'The brief deployed in both Claude Projects and a Custom GPT for direct comparison.',
    'A first-pass system prompt stress-tested against three input attacks.',
  ],
  activityTypes: ['build-test'],
  whyThisExists: `One-shot prompts work for one-time tasks. Anything you do regularly deserves a *project* — persistent context, persistent system prompt, persistent files. Modules 1 and 8 taught the prompt skills. Module 10 teaches the persistence layer.

The five-part system prompt structure introduced here (Role, Context, Rules, Format, What-to-Ask-Me) becomes the contract for every Personal Prompt Library entry. Deploying the same brief in two different platforms makes the deployment story tangible: the brief is portable, the platform is interchangeable.`,
  learningObjectives: [
    'Distinguish one-shot, project, workflow, and agent.',
    'Build a five-part system prompt and stress-test it against input attacks.',
    'Deploy the same brief in two platforms (Claude Projects + Custom GPT) and compare.',
    'Walk away with a Project Brief reusable across the rest of the course.',
  ],
  sections: [
    {
      id: 'f10-project-anatomy',
      title: 'Project versus one-shot versus workflow versus agent',
      content: `**One-shot.** Single prompt, single response. Fast. No persistence. Best for ad-hoc tasks.

**Project.** A persistent context — system prompt + attached files + conversation history — for a specific recurring use case. *"Loan committee minutes drafting"* is a project. *"Member email rewriting"* is a project. The system prompt encodes the bank-specific knowledge so you do not paste it every time.

**Workflow.** Multiple AI steps with handoffs. *Summarize this transcript → extract action items → draft follow-up emails.* Each step might use a different tool. Module 14 covers workflows.

**Agent.** A workflow with autonomy — the AI decides which steps to run and when. Higher leverage, higher risk. Module 14 also covers agents.

Module 10 is about projects. The other patterns build on this layer.`,
    },
    {
      id: 'f10-five-parts',
      title: 'The five-part system prompt',
      content: `| Part | Question it answers |
|---|---|
| **Role** | Who is the AI being? |
| **Context** | What is the operating environment, including bank context, data tier, and tools? |
| **Rules** | What should the AI always or never do? |
| **Format** | How should responses look? |
| **What to ask me** | What context will the AI need from me to do the task well? |

The fifth part is the one most beginners skip. It is the most useful. *"Before producing a draft, ask me about: the member's tenure with the bank, the specific account product involved, and any prior communications on this issue."* The fifth part turns a one-direction tool into a collaborator.`,
      tryThis: 'Take a project you would like to build and write only the fifth part. If the AI cannot do useful work without the answers it asks for, the fifth part is doing its job.',
    },
  ],
  activities: [
    {
      id: '10.1',
      title: 'Build & test the system prompt',
      description: 'System prompt editor with five labeled sections. Platform stress-tests with three attacks: vague input, wrong-tier input, off-task input. Iterate until all three are handled.',
      activityType: 'build-test',
      estimatedMinutes: 12,
      fields: [
        {
          id: 'system-prompt',
          label: 'Your final five-part system prompt.',
          type: 'textarea',
          minLength: 150,
          required: true,
        },
        {
          id: 'attacks-handled',
          label: 'Which of the three attack inputs did your prompt handle correctly?',
          type: 'textarea',
          minLength: 40,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '10.2',
      title: 'Deploy across two platforms',
      description: 'Same system prompt deployed in Claude Projects and a Custom GPT. Compare results on the same input.',
      activityType: 'build-test',
      estimatedMinutes: 5,
      fields: [
        {
          id: 'comparison',
          label: 'Where did the two platforms diverge most? (One sentence.)',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '10.3',
      title: 'Document the Project Brief',
      description: 'Platform pre-fills the brief template from your work in 10.1 and 10.2.',
      activityType: 'build-test',
      estimatedMinutes: 3,
      fields: [
        {
          id: 'brief-confirm',
          label: 'Confirm the brief is ready (or note what is still missing).',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '10-project-brief-template',
    },
  ],
  artifacts: [
    {
      id: '10-project-brief-template',
      title: 'Project Brief Template',
      description: 'Half-page project specification with the five-part system prompt and platform deployment notes.',
      format: 'pdf+md',
      triggeredBy: '10.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/10-project-brief-template.md',
    },
  ],
  dependencies: ['f8-prompting', 'f9-work-profile'],
  forwardLinks: ['f11-document-workflows', 'f14-agents', 'f17-prompt-library'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-10-spec.md',
} as const;
