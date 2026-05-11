// Manager Track — Module M3: Spotting Misuse and Closing the Loop
// EDITORIAL: voice-clone / deepfake elements deferred per 2026-05-09 decision.
// M3 ships text-based misuse patterns only.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/manager-track/module-M3-spec.md

import type { FoundationModule } from '../types';

export const moduleM3: FoundationModule = {
  number: 3,
  id: 'm3-spotting-misuse',
  trackId: 'manager',
  trackPosition: 'M3',
  title: 'Spotting Misuse and Closing the Loop',
  estimatedMinutes: 30,
  keyOutput: 'Escalation Decision Card',
  dailyUseOutcomes: [
    'A tiered Escalation Decision Card distinguishing coach, document, escalate, and report.',
    'A documented next-step pattern for the four most common misuse signals.',
  ],
  activityTypes: ['find-flaw', 'tabletop-sim', 'single-prompt'],
  whyThisExists: `Coaching covers the everyday case. M3 covers the cases that are not coaching — when something has crossed a line and the manager has to know which line and what to do.

The four signals managers learn to read are: shadow-AI use (a personal account on a personal device for bank work), Restricted-tier paste (NPI into a public AI tool), AI-decided action (the report skipped human-in-the-loop on a member-affecting decision), and quiet decay (a library entry generating wrong outputs because the model behavior changed and no one re-tested).

Each signal maps to a tier on the Escalation Decision Card: coach, document, escalate, or report.`,
  learningObjectives: [
    'Recognize the four most common AI misuse signals at the manager level.',
    'Distinguish coachable from documentable from escalatable.',
    'Walk through the after-action of a Restricted-tier paste.',
    'Build a personal Escalation Decision Card.',
  ],
  sections: [
    {
      id: 'm3-four-signals',
      title: 'The four signals',
      content: `**Shadow AI.** A direct report is using a personal AI account on a personal device for bank work. Even with no NPI in play, this is a TPRM violation in the making — the bank cannot govern a tool it does not know about. Action: stop the use; coach on the approved tools; escalate if it recurs.

**Restricted-tier paste.** NPI or PII has gone into a public AI tool. This is an incident, not a coachable moment. Action: document the incident immediately, notify compliance and IT/security, treat as a privacy event subject to GLBA notification analysis. The manager's role is to escalate cleanly and quickly — they do not run the incident response.

**AI-decided action.** The report skipped human review on a decision that affects a member. Adverse action without a human signature, an AI-drafted credit decision sent without review, an AI-generated denial letter mailed unread. Action: pull the artifact, document the chain, escalate to compliance for member-impact analysis.

**Quiet decay.** A library entry that worked at certification has started producing wrong outputs because model behavior changed. Action: re-run the test; update the entry's last-tested date; if the outputs cannot be made reliable, retire the entry.`,
      tryThis: 'Audit your own most-used AI workflow against quiet decay. When did you last verify the output against the source? If the answer is "I have not," you are running the same risk you are about to coach your reports out of.',
    },
    {
      id: 'm3-loop-closure',
      title: 'Closing the loop',
      content: `Every escalation has three steps the manager owns: **document**, **notify**, **follow up**.

*Document* means a written record at the time of the event — what happened, who, when, what was pasted or said, what tool, what the report did next. The record exists for the institution, not for the report's file.

*Notify* means the right party. Compliance for member-impact issues. IT or security for tool boundary violations. The AI program owner for governance gaps. The model-risk owner for AI-decided action issues. The First-Call List from Foundation Module 7 lives here.

*Follow up* means the manager checks in two weeks later. The report needs to know the loop closed. The bank needs to know the gap was repaired. Without follow-up, the same incident shows up next quarter from a different report.`,
    },
  ],
  activities: [
    {
      id: 'M3.1',
      title: 'Diagnose four signals',
      description: 'Four short scenarios — one per signal type. Tag each with the right escalation tier. Wrong picks branch to "what happens next" so the consequences land.',
      activityType: 'find-flaw',
      estimatedMinutes: 12,
      fields: [
        {
          id: 'tagging',
          label: 'For each scenario, name the signal and the escalation tier.',
          type: 'textarea',
          minLength: 80,
          required: true,
          placeholder: 'Scenario 1: signal = shadow-AI use; tier = coach + document.\nScenario 2: …',
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: 'M3.2',
      title: 'Tabletop: a Restricted-tier paste happens',
      description: '8-step walkthrough of a real near-miss. Decision points test document, notify, and follow-up choices. The platform shows the rubric path at the end.',
      activityType: 'tabletop-sim',
      estimatedMinutes: 12,
      fields: [
        {
          id: 'tabletop-record',
          label: 'Decision-by-decision record (auto-populated by the platform)',
          type: 'text',
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: 'M3.3',
      title: 'Build your Escalation Decision Card',
      description: 'AI drafts the card with your bank-specific First-Call List names plugged in. You confirm and download.',
      activityType: 'single-prompt',
      estimatedMinutes: 6,
      fields: [
        {
          id: 'first-call-list',
          label: 'Names and contacts for the four roles you would escalate to.',
          type: 'textarea',
          minLength: 60,
          required: true,
          placeholder: 'Compliance Officer: …\nIT/Security Lead: …\nAI Program Owner: …\nModel Risk Owner: …',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'M3-escalation-decision-card',
    },
  ],
  artifacts: [
    {
      id: 'M3-escalation-decision-card',
      title: 'Escalation Decision Card',
      description: 'Tiered escalation criteria — coach, document, escalate, or report — with bank-specific First-Call List entries.',
      format: 'pdf+md',
      triggeredBy: 'M3.3',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/M3-escalation-decision-card.md',
    },
  ],
  dependencies: ['m2-library-review'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/manager-track/module-M3-spec.md',
} as const;
