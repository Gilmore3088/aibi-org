// Foundation Full — Module 16: Role-Based Use Cases
// NOTE: Activity Type 8 (real-world capture) deferred at v2 launch.
// Module 16 ships using synthetic role scenarios + adaptive scenario instead.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-16-spec.md

import type { FoundationModule } from '../types';

export const module16: FoundationModule = {
  number: 16,
  id: 'f16-role-cases',
  trackId: 'full',
  trackPosition: '16',
  title: 'Role-Based Use Cases',
  pillar: 'application',
  estimatedMinutes: 40,
  keyOutput: 'Role Use-Case Card',
  dailyUseOutcomes: [
    'A specific application of AI to your role mapped to the patterns from Modules 11-15.',
    'Three concrete scenarios with starter prompts ready to copy into the Personal Prompt Library.',
    'A working sense of which patterns transfer across roles and which are role-specific.',
  ],
  activityTypes: ['adaptive-scenario', 'build-test'],
  whyThisExists: `Modules 1-15 built the toolkit. Module 16 applies it to *your* role specifically. The activity branches by role family — Operations, Lending, Compliance, Finance, Retail — and surfaces three scenarios that are common in that role today, with starter prompts and pattern references back to the modules where each pattern was taught.

The Role Use-Case Card is the bridge from generic Foundation skills to the role-specific Specialist track. Foundation graduates whose Role Use-Case Card is rich are the ones ready for Specialist enrollment in their track.`,
  learningObjectives: [
    'Apply the Foundation toolkit to three real scenarios from your role.',
    'Identify which scenarios benefit from project-level deployment (Module 10) and which are one-shot.',
    'Map your Module 9 top-3 candidates to specific patterns from Modules 11-15.',
    'Walk away with a Role Use-Case Card sized for the binder.',
  ],
  sections: [
    {
      id: 'f16-role-tracks',
      title: 'Five role families, five emphases',
      content: `| Role family | High-leverage patterns | Specialist track code |
|---|---|---|
| **Operations** | Document workflows, agent design, multi-step automation, exception narratives | /Ops |
| **Lending** | Loan-pipeline summarization, credit-policy compliance, document Q&A on guidelines | /Lending |
| **Compliance** | Regulatory research (grounded Q&A), policy gap analysis, examination prep | /Compliance |
| **Finance** | Variance commentary, board narrative, scenario summarization | /Finance |
| **Retail** | Member communications, FAQ automation, service-script generation | /Retail |

The patterns from Modules 11-15 (document workflows, spreadsheet patterns, tool comparison, agents, vendor pitch decoder) apply across all five — the *emphasis* differs. A loan officer leans on grounded Q&A; an operations manager leans on workflow mapping; a CFO leans on variance commentary.`,
    },
  ],
  activities: [
    {
      id: '16.1',
      title: 'Three role scenarios',
      description: 'Pick the role family closest to yours. Branch through three scenarios with adaptive feedback. Each scenario surfaces a pattern from Modules 11-15 and the matching tool tier.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 25,
      fields: [
        {
          id: 'role-family',
          label: 'Role family',
          type: 'select',
          required: true,
          options: [
            { value: 'operations', label: 'Operations' },
            { value: 'lending', label: 'Lending' },
            { value: 'compliance', label: 'Compliance' },
            { value: 'finance', label: 'Finance' },
            { value: 'retail', label: 'Retail' },
          ],
        },
        {
          id: 'scenarios',
          label: 'For each of the three scenarios, name the pattern from Modules 11-15 you applied and the tool you used.',
          type: 'textarea',
          minLength: 200,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '16.2',
      title: 'Build your Role Use-Case Card',
      description: 'Map your Module 9 top-3 candidates to specific patterns and tools. Save with starter prompts ready for Module 17.',
      activityType: 'build-test',
      estimatedMinutes: 15,
      fields: [
        {
          id: 'top-3-mapped',
          label: 'For each of your top-3 candidates: pattern, tool tier, starter prompt.',
          type: 'textarea',
          minLength: 200,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '16-role-use-case-card',
    },
  ],
  artifacts: [
    {
      id: '16-role-use-case-card',
      title: 'Role Use-Case Card',
      description: 'Three role-specific applications mapped to Foundation patterns. Bridge to the matching AiBI-Specialist track.',
      format: 'pdf+md',
      triggeredBy: '16.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/16-role-use-case-card.md',
    },
  ],
  dependencies: ['f9-work-profile', 'f11-document-workflows', 'f12-spreadsheet-workflows', 'f13-tools-comparison', 'f14-agents'],
  forwardLinks: ['f17-prompt-library', 'f20-final-lab'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-16-spec.md',
} as const;
