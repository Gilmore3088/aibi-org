// Foundation Full — Module 18: Incident Response Drill (NEW in v2)
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-18-spec.md

import type { FoundationModule } from '../types';

export const module18: FoundationModule = {
  number: 18,
  id: 'f18-incident-response',
  trackId: 'full',
  trackPosition: '18',
  title: 'Incident Response Drill',
  pillar: 'application',
  estimatedMinutes: 30,
  keyOutput: 'Incident Response Checklist + Member Notification Template',
  dailyUseOutcomes: [
    'A seven-step IR runbook the learner has walked through.',
    'A starter notification template for the first AI-related data event.',
    'A pre-built call-tree using the First-Call List from Module 7.',
  ],
  activityTypes: ['tabletop-sim', 'single-prompt'],
  whyThisExists: `Every other module has built capacity. Module 18 builds the response. The drill walks the learner through a realistic scenario — a Restricted-tier paste into a public AI tool — and produces both the checklist that turns confusion into action and the notification template the bank may need within 72 hours.

The drill is text-based and deliberately uncomfortable. Bankers need to feel what the first 30 minutes after an incident looks like before it happens for real, because the cost of a confused first 30 minutes is measured in regulatory exposure and member trust.`,
  learningObjectives: [
    'Walk through a realistic AI-related incident from discovery to closure.',
    'Distinguish coachable, documentable, escalatable, and reportable severity.',
    'Apply the First-Call List from Module 7 in a live decision sequence.',
    'Walk away with both the IR Checklist and a Member Notification Template.',
  ],
  sections: [
    {
      id: 'f18-seven-steps',
      title: 'The seven-step IR runbook',
      content: `1. **Stop the action.** Whatever was happening (paste, send, file, transmit) — pause. The first damage is what already happened; the second damage is anything you do in the next sixty seconds without thinking.

2. **Document at the time.** Open a fresh note. Write: what happened, who, when, what data, what tool, what was the next planned step. Date and time. The note exists for the institution.

3. **Notify the named owners.** Use the First-Call List. For an NPI paste: GLBA/privacy first (compliance officer + IT/security lead). For an AI-decided action: model risk owner + compliance.

4. **Preserve evidence.** Do not delete the prompt, the response, the email, the document. Take screenshots. Preserve metadata.

5. **Coordinate the response.** Compliance leads. The manager owns documentation and member-facing communication. IT owns tool boundary verification.

6. **Determine notification obligation.** GLBA notification rules apply when NPI has been compromised. Compliance + counsel make the call within 72 hours; the manager prepares the draft.

7. **After-action review.** Within 14 days. What was the workflow gap that produced this? What changes? Who follows up?

The seven steps are durable. The specifics rotate per scenario. The drill exists to make the steps reflexive.`,
      tryThis: 'Without looking, recite the seven steps. The ones you cannot recite are the ones you would skip in a real incident.',
    },
  ],
  activities: [
    {
      id: '18.1',
      title: 'Tabletop: an NPI paste happened',
      description: 'Walk through a real near-miss. 12 steps with decision points. Wrong picks branch to consequences. Platform shows the rubric path at the end.',
      activityType: 'tabletop-sim',
      estimatedMinutes: 22,
      fields: [
        {
          id: 'path-record',
          label: 'Path record (auto-populated)',
          type: 'text',
          required: true,
        },
        {
          id: 'after-action',
          label: 'In two sentences: what would change at your bank tomorrow based on this drill?',
          type: 'textarea',
          minLength: 50,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '18-incident-response-checklist',
    },
    {
      id: '18.2',
      title: 'Draft the member notification',
      description: 'Build a starter template you would adapt for the first AI-related data event. Plain language; honest; aligned with GLBA notification expectations.',
      activityType: 'single-prompt',
      estimatedMinutes: 8,
      fields: [
        {
          id: 'audience',
          label: 'Audience for the notification',
          type: 'select',
          required: true,
          options: [
            { value: 'single-member', label: 'Single member (1:1 letter)' },
            { value: 'affected-segment', label: 'Affected segment (templated mailer)' },
            { value: 'public', label: 'Public statement' },
          ],
        },
        {
          id: 'draft',
          label: 'Your draft notification.',
          type: 'textarea',
          minLength: 200,
          required: true,
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '18-member-notification-template',
    },
  ],
  artifacts: [
    {
      id: '18-incident-response-checklist',
      title: 'Incident Response Checklist',
      description: 'Seven-step IR runbook with the First-Call List embedded. Reusable across AI incident types.',
      format: 'pdf+md',
      triggeredBy: '18.1',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/18-incident-response-checklist.md',
    },
    {
      id: '18-member-notification-template',
      title: 'Member Notification Template',
      description: 'Starter template for the first AI-related data event. Adapt with counsel before use.',
      format: 'pdf+md',
      triggeredBy: '18.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/18-member-notification-template.md',
    },
  ],
  dependencies: ['f5-cybersecurity', 'f6-talking-with-members', 'f7-regulatory-landscape'],
  forwardLinks: ['f19-examiner-prep', 'f20-final-lab', 'm3-spotting-misuse'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-18-spec.md',
} as const;
