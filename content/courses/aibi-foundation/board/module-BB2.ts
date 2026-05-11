// Board Briefing — Module BB2: Governance Questions Every Director Should Ask
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/board-briefing/module-BB2-spec.md

import type { FoundationModule } from '../types';

export const moduleBB2: FoundationModule = {
  number: 2,
  id: 'bb2-director-questions',
  trackId: 'board',
  trackPosition: 'BB2',
  title: 'Governance Questions Every Director Should Ask',
  estimatedMinutes: 30,
  keyOutput: 'Director Question Playbook — 15 questions sorted by topic and meeting type',
  dailyUseOutcomes: [
    'A printed playbook of 15 questions covering vendor approvals, model risk reports, and examiner correspondence.',
    'A meeting-type filter so directors can ask the right question at the right time.',
  ],
  activityTypes: ['adaptive-scenario', 'single-prompt'],
  whyThisExists: `BB1 gives the director vocabulary; BB2 gives them a playbook. Fifteen questions sorted by the three topics that account for almost every AI item that reaches a board: vendor and tool approvals, model risk and validation reports, and examiner-related correspondence and incidents.

Questions are sorted by meeting type — full board, audit committee, technology committee — so the director knows which questions belong where. The playbook is durable: it works for the next AI tool, the next regulator, the next vendor presentation.`,
  learningObjectives: [
    'Ask the right governance question at the right meeting.',
    'Distinguish a vendor approval question from a model risk question from an examiner-readiness question.',
    'Walk away with a personal Director Question Playbook.',
  ],
  sections: [
    {
      id: 'bb2-three-categories',
      title: 'The three categories that cover almost everything',
      content: `**Vendor and tool approvals.** Every new AI tool, every AI feature added to an existing vendor product, every AI partnership. The right questions surface whether TPRM has actually run, whether contract language addresses AI specifically, and whether the data classification of the use case matches the contract.

**Model risk and validation reports.** Periodic reports about AI systems already in production. The right questions surface whether the model has been re-validated since deployment, whether monitoring has caught any drift, and whether the human-in-the-loop step is actually happening or has decayed into a rubber stamp.

**Examiner correspondence and incidents.** The exam letter that asks about the AI program, the supervisory letter that mentions an AI-related finding, the incident report that involves an AI tool. The right questions surface whether the response has been coordinated with counsel, whether the same finding has come up before, and what the institution learned.`,
      tryThis: 'Look at the last three AI items on your board minutes. Sort each into one of the three categories. The frequency tells you which questions you will need most.',
    },
    {
      id: 'bb2-meeting-fit',
      title: 'Meeting-type fit',
      content: `Not every question belongs at every meeting. The full board hears the strategic frame. The audit committee hears the validation, monitoring, and incident detail. The technology committee (where one exists) hears the architecture and tooling.

A question asked at the wrong forum either gets a pre-formed answer (unhelpful) or signals a governance gap (overbroad). The playbook tags each question with where it lands best. Use the tag.`,
    },
  ],
  activities: [
    {
      id: 'BB2.1',
      title: 'Match questions to scenarios',
      description: 'Three meeting scenarios with mixed-in questions; pick the three best questions for each. Adaptive feedback explains why some choices were better fits than others.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 18,
      fields: [
        {
          id: 'pairings',
          label: 'For each scenario, list the three questions you picked.',
          type: 'textarea',
          minLength: 100,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: 'BB2.2',
      title: 'Build your Director Question Playbook',
      description: 'Personalized playbook — 15 questions tagged by topic and meeting type, formatted to fit in a board binder.',
      activityType: 'single-prompt',
      estimatedMinutes: 12,
      fields: [
        {
          id: 'committee-membership',
          label: 'Which committees do you sit on?',
          type: 'textarea',
          minLength: 20,
          required: true,
        },
        {
          id: 'top-concerns',
          label: 'Which AI agenda items most need a structured question on your board today?',
          type: 'textarea',
          minLength: 30,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'BB2-director-question-playbook',
    },
  ],
  artifacts: [
    {
      id: 'BB2-director-question-playbook',
      title: 'Director Question Playbook',
      description: '15 questions sorted by topic (vendor approvals, model risk, examiner) and meeting type (full board, audit, technology). Personalized to the director and committee.',
      format: 'pdf+md',
      triggeredBy: 'BB2.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/BB2-director-question-playbook.md',
    },
  ],
  dependencies: ['bb1-vocabulary'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/board-briefing/module-BB2-spec.md',
} as const;
