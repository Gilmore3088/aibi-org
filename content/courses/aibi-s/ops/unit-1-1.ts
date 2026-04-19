import type { Unit } from '../../../../lib/aibi-s/types';
import { opsDepartmentHeadPhase1 } from './persona-dept-head-phase-1';

export const opsUnit1_1: Unit = {
  id: '1.1',
  trackCode: 'ops',
  phase: 1,
  title: 'From Personal Skills to Institutional Assets',
  summary: 'The shift from personal AI productivity to institutional AI capability. You arrive with a skill. You leave with a skill that can be deployed, measured, and handed off.',
  beats: [
    {
      kind: 'learn',
      title: 'The shift from personal to institutional',
      body: `In AiBI-P you built a skill that makes **one person faster** — you. That skill lives in your personal account, has the documentation you wrote for yourself, and would disappear if you left the institution tomorrow.

AiBI-S starts at a different question: *how do you make your department faster?*

The answer is not "give everyone my skill." That would be like solving the department's Excel problem by emailing everyone your personal spreadsheet. You'd create:
- **Version drift.** Ten people, ten slightly different copies. Three months in, nobody knows which one is current.
- **Data-handling risk.** Your personal skill may have been fine for your own workflow. Your colleagues will paste things you never would.
- **Single point of failure.** If you leave, the whole thing goes with you.

The institutional version requires governance, documentation, versioning, ownership, and measurement. This unit introduces each — and this week you will begin **auditing your department's work** to find the one workflow that's worth deploying a real skill against.`,
      workedExample: `**Worked example.** A Compliance Officer at a $400M credit union built a personal NotebookLM skill for navigating their policy library. It saved her an hour a week. She told three colleagues about it, and within a month, two of them were pasting member PII (Tier 3) into their own NotebookLM accounts trying to replicate it — because her workflow documentation was three bullet points in a Teams message.

The skill itself was good. The deployment was a shadow-AI incident waiting to be written up. AiBI-S is the difference between those two things.`,
      hooks: {
        pillar: 'A',
        frameworks: ['AIEOG'],
        dataTiers: [2],
      },
    },

    {
      kind: 'practice',
      simKind: 'decision',
      scenario: `You are the Operations Manager for a community bank. Your team runs a weekly exception-report review. Today's queue includes 14 rows. Two of the rows contain a member's full account number, routing number, and name. Four rows contain institution-internal process codes not visible to members. The remaining eight rows contain dollar amounts and generic product descriptions visible on public rate sheets.

You're considering pasting the entire 14-row report into your institution-sanctioned Copilot environment to get a summary.`,
      question: 'What data tier governs this workflow, and what must you do before any AI processing?',
      options: [
        {
          id: 'opt-tier-1',
          label: 'Tier 1 (public). Paste the whole report — rate data is published.',
          isCorrect: false,
          feedback: 'Incorrect. The PRESENCE of Tier 3 data in two rows makes the whole package Tier 3, regardless of what surrounds it. The highest-tier element governs.',
          consequenceIfWrong: 'In a real incident, this becomes a shadow-AI write-up: member PII entered into an AI system without the required redaction step. Under the AIEOG lexicon this is an "AI use case" that must be in the institutional inventory with explicit data-handling controls.',
        },
        {
          id: 'opt-tier-2',
          label: 'Tier 2 (internal). Paste it — Copilot is our sanctioned platform.',
          isCorrect: false,
          feedback: 'Incorrect. Sanctioned-platform status is necessary but not sufficient. The data classification is about what is IN the payload, not where it goes. Two rows contain member account identifiers, which is Tier 3.',
          consequenceIfWrong: 'Sanctioned platforms can still create compliance exposure if they ingest Tier 3 data outside an approved use case. Your Compliance Liaison will ask whether this specific use case is in the inventory and what TPRM due diligence has been done on the vendor\'s AI-data-handling terms.',
        },
        {
          id: 'opt-tier-3-redact',
          label: 'Tier 3 (restricted). Redact account and routing numbers first, then paste the redacted report.',
          isCorrect: true,
          feedback: 'Correct. The two PII rows make the whole workflow Tier 3. Tier 3 requires either (a) explicit institutional approval of an AI-data-handling agreement covering this use case, or (b) redaction to Tier 2 before processing. Redaction is the right first step for a departmental automation you haven\'t yet governed through the full institutional approval flow.',
        },
        {
          id: 'opt-tier-3-block',
          label: 'Tier 3 (restricted). Do not use AI for this workflow at all.',
          isCorrect: false,
          feedback: 'Partially correct on the classification, wrong on the action. Blanket "no AI for Tier 3" is a common over-correction that blocks legitimate, well-governed use cases. The right default is tier the data, redact what you can, and document what you cannot — then evaluate whether the residual is worth the workflow.',
          consequenceIfWrong: 'An Ops department that defaults to "no AI" for any workflow touching Tier 3 data will miss most of its real automation opportunities. AiBI-S is about deploying responsibly, not avoiding.',
        },
      ],
      hooks: {
        pillar: 'B',
        frameworks: ['AIEOG', 'Interagency TPRM'],
        dataTiers: [3],
      },
    },

    {
      kind: 'apply',
      prompt: `Identify ONE recurring workflow in YOUR actual department — one you'd like to pilot for AI automation.

Write 4–6 sentences covering:
- What the workflow is (name it and describe it in two sentences)
- Who does it today and how often
- Roughly how long it takes per occurrence
- Which data tier(s) are involved and any redaction you'd need to do
- Why you think it's the right first candidate (vs. something lower-risk)`,
      guidance: `A good response is specific. "The weekly funding-exception review" is specific. "Meeting notes" is not. You'll use this workflow in the next beat to defend your choice to your Department Head — so pick something real.`,
      minWords: 60,
    },

    {
      kind: 'defend',
      persona: opsDepartmentHeadPhase1,
      hooks: {
        pillar: 'B',
        frameworks: ['AIEOG', 'Interagency TPRM'],
        dataTiers: [2, 3],
      },
    },

    {
      kind: 'refine',
      guidance: `You've seen how Dana graded your rebuttal. Rewrite it now, applying the feedback. The refined version is what gets captured into your AiBI-S portfolio as the defended artifact for this unit — so make it the version you'd be comfortable actually sending.`,
    },

    {
      kind: 'capture',
      artifactLabel: 'Unit 1.1 — /Ops — Defended departmental-automation proposal',
    },
  ],
};
