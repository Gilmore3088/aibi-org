// Foundation Full — Module 13: AI Tools Comparison Lab
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-13-spec.md

import type { FoundationModule } from '../types';

export const module13: FoundationModule = {
  number: 13,
  id: 'f13-tools-comparison',
  trackId: 'full',
  trackPosition: '13',
  title: 'AI Tools Comparison Lab',
  pillar: 'creation',
  estimatedMinutes: 30,
  keyOutput: 'Tool Choice Map',
  dailyUseOutcomes: [
    'A decision tree built from your own multi-model comparisons, not vendor marketing.',
    'A Tool Choice Map that names which tool you reach for when, with evidence.',
    'A working sense of where Copilot Chat ends and where Claude Projects or Custom GPTs begin.',
  ],
  activityTypes: ['multi-model', 'build-test'],
  whyThisExists: `By Module 13 the learner has used Claude, ChatGPT, Gemini, and (where available) Copilot Chat across multiple workflows. Module 13 turns that experience into a Tool Choice Map — a personal decision tree that says *for this kind of task, on this kind of data, this is the tool I reach for first*.

The map is evidence-based. Every branch traces back to a multi-model comparison the learner ran. No vendor marketing language. No "best AI for X" claims. Just *I tested these three and this is what I observed.*`,
  learningObjectives: [
    'Compare four tool categories on the same task and document the differences.',
    'Apply the Tool Choice Rule (data tier + task type + tool tier alignment) consistently.',
    'Build a personal Tool Choice Map that survives the next vendor pitch.',
    'Recognize when prompts behave differently across tools and adjust.',
  ],
  sections: [
    {
      id: 'f13-tool-tiers',
      title: 'The four tool tiers (expanded from Module 4)',
      content: `| Tier | Examples | Use for |
|---|---|---|
| **Public AI** | Free ChatGPT, Claude.ai web, Gemini consumer | Public-tier tasks only |
| **Copilot Chat** | M365 Copilot Chat with shield icon | Internal-tier tasks; tenant-grounded |
| **M365 Copilot** | Excel, Outlook, Teams Copilot | Internal/Confidential with manager approval; tenant-grounded |
| **Approved Specialist** | Claude Projects (sanctioned), bank-approved Custom GPTs, vendor-supplied AI features that passed TPRM | Where the bank has done the diligence and signed off |

The Tool Choice Rule: **the tool tier must equal or exceed the data tier**. A Confidential-tier task in a Public AI tool is a never-do. A Public-tier task in M365 Copilot is fine but wasteful.`,
    },
    {
      id: 'f13-prompts-differ',
      title: 'Prompts behave differently across tools',
      content: `The same prompt can produce noticeably different outputs in Claude versus ChatGPT versus Gemini. Beyond model differences, the *system context* of each tool matters: Copilot Chat is grounded in the M365 graph, Claude Projects has the files you attached, a Custom GPT has its own pre-loaded instructions.

Three observations to capture in the Tool Choice Map:

1. **Which tool best handled the most-common task type in your role?**
2. **Which tool surprised you positively?** (often the one you used least.)
3. **Where did the tool boundary matter more than the model?** (the same model behaves differently inside Copilot Chat than on the web.)

The map is the evidence record. The next time someone asks "what's the best AI tool?" the honest answer is "for what task, on what data?" and you point them at your map.`,
      tryThis: 'Pick the task you do most often. Run it through three tools (whichever you have access to). Note the differences. The notes are the first row of the Tool Choice Map.',
    },
  ],
  activities: [
    {
      id: '13.1',
      title: 'Run the same task through four tools',
      description: 'Pick a representative task from your AI Work Profile. Run it through four tool tiers. Document divergence.',
      activityType: 'multi-model',
      estimatedMinutes: 18,
      fields: [
        {
          id: 'task',
          label: 'The task you ran',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
        {
          id: 'observations',
          label: 'Observations across the four tools (one paragraph each).',
          type: 'textarea',
          minLength: 200,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '13.2',
      title: 'Build your Tool Choice Map',
      description: 'Map task type to tool with evidence from 13.1. The map is your decision tree for the rest of the year.',
      activityType: 'build-test',
      estimatedMinutes: 12,
      fields: [
        {
          id: 'map-rows',
          label: 'For each of your top-3 tasks (from Module 9), name the tool you would reach for first and why.',
          type: 'textarea',
          minLength: 150,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '13-tool-choice-map',
    },
  ],
  artifacts: [
    {
      id: '13-tool-choice-map',
      title: 'Tool Choice Map',
      description: 'Evidence-based decision tree mapping task type to tool, with divergence notes from your own comparisons.',
      format: 'pdf+md',
      triggeredBy: '13.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/13-tool-choice-map.md',
    },
  ],
  dependencies: ['f9-work-profile', 'f11-document-workflows'],
  forwardLinks: ['f15-vendor-pitch', 'f16-role-cases', 'f17-prompt-library'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-13-spec.md',
} as const;
