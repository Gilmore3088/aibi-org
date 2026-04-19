import type { DefendBeatPersona } from '../../../../lib/aibi-s/types';

export const opsComplianceLiaisonPhase2: DefendBeatPersona = {
  id: 'ops-compliance-liaison-p2',
  displayName: 'Compliance Liaison — Operations',
  trackCode: 'ops',
  phase: 2,
  maxChatTurns: 3,
  memoMarkdown: `**FROM:** Marcus Patel, Compliance Analyst
**TO:** [Learner]
**RE:** Your deployed skill — pre-approval documentation review

I've been asked to review your departmental automation before it goes into the use-case inventory. I'm not here to block it. I'm here to make sure it survives an exam.

I have three documentation gaps I need addressed before I can sign off.

1. **HITL checkpoint.** Your skill summary describes an automated exception-report summary. Who reviews the AI output before it becomes an official record? Name the person or role, the review cadence, and what "review" actually means — rubber stamp, or line-by-line check? The AIEOG AI Lexicon requires human-in-the-loop controls for consequential outputs. Exception reports are consequential.

2. **Data-tier declaration.** You've described the workflow but I don't see an explicit Tier designation in the documentation. If this workflow ever touches account numbers, routing numbers, or member identifiers — even intermittently — it is Tier 3. Interagency TPRM guidance requires vendor-level due diligence on how AI systems handle Tier 3 data. Has that been done for the platform you're using?

3. **Regulatory framework applicability.** Which framework governs this use case — and why? "It's just summarization" is not an answer I can write in a file. If the exception report includes BSA/AML flagged transactions, SR 11-7 model-risk principles apply even if this is not a formal model. Walk me through your framework analysis.

I need written answers. If the answers are solid, this goes into the inventory this week.

— Marcus`,

  chatSystemPrompt: `You are Marcus Patel, Compliance Analyst at a $600M community bank. You are the department-level compliance partner for Operations — not an examiner, not the BSA Officer, not Legal. You review departmental AI use cases before they enter the institutional inventory.

Your personality: precise, citation-oriented, non-hostile but unforgiving on documentation gaps. You do not moralize. You identify what is missing and ask for it. If the learner supplies a solid answer, you acknowledge it clearly and move on.

Your approach:
1. Ask exactly one question per turn. Do not lecture.
2. Always ground your concern in a specific framework (SR 11-7, AIEOG, Interagency TPRM, BSA/AML, ECOA/Reg B). If you raise a concern without a framework hook, you're not doing your job.
3. If the learner cites the framework correctly, accept it. If they dodge or generalize, name the gap once more with the specific framework reference.
4. You are not adversarial. You want to get this use case approved.

Scope: Phase 2 departmental automation — measurement, HITL, audit trail, framework applicability. Do NOT raise board-governance or formal model-validation issues — those are out of scope at the departmental level.`,

  rubric: {
    id: 'ops-compliance-liaison-p2',
    dimensions: [
      {
        id: 'hitl-specificity',
        label: 'HITL specificity',
        description: 'Did the learner name a specific reviewer role, a cadence, and define what "review" means operationally — not just acknowledge that HITL exists?',
        maxScore: 4,
      },
      {
        id: 'data-tier-declaration',
        label: 'Data-tier declaration',
        description: 'Did the learner explicitly declare the data tier, explain how they determined it, and address what happens when Tier 3 data enters the workflow?',
        maxScore: 4,
      },
      {
        id: 'regulatory-citation',
        label: 'Regulatory citation',
        description: 'Did the learner identify the applicable framework(s) by name, explain why they apply, and connect them to specific features of the workflow — not generic "we follow all regulations"?',
        maxScore: 4,
      },
      {
        id: 'audit-trail',
        label: 'Audit trail',
        description: 'Did the learner describe how AI outputs are logged, versioned, or otherwise traceable for exam purposes?',
        maxScore: 4,
      },
      {
        id: 'documentation-completeness',
        label: 'Documentation completeness',
        description: 'Did the learner demonstrate that their documentation package would survive an exam — no hand-waving, no deferred items without owners?',
        maxScore: 4,
      },
    ],
    passingTotal: 15,
    passingMinPerDimension: 3,
  },
};
