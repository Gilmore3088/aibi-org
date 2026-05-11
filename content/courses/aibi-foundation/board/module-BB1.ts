// Board Briefing — Module BB1: AI in Banking — What You Need to Know as a Director
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/board-briefing/module-BB1-spec.md

import type { FoundationModule } from '../types';

export const moduleBB1: FoundationModule = {
  number: 1,
  id: 'bb1-vocabulary',
  trackId: 'board',
  trackPosition: 'BB1',
  title: 'AI in Banking — What You Need to Know as a Director',
  estimatedMinutes: 30,
  keyOutput: 'Board AI Vocabulary Card',
  dailyUseOutcomes: [
    'A pocket card with the seven AI terms a director needs to follow management briefings.',
    'Four sharp follow-up questions a director can ask in any AI agenda item.',
  ],
  activityTypes: ['single-prompt', 'find-flaw'],
  whyThisExists: `Directors are not technologists. The board's job is governance, not implementation. But the AI agenda items are coming — vendor approvals, model risk reports, examiner correspondence — and a director who cannot follow the vocabulary cannot govern the program.

BB1 gives the director the seven terms that show up in every well-run AI program (governance, model risk, third-party AI risk, hallucination, human-in-the-loop, AI use-case inventory, explainability) and four follow-up questions that work for any AI agenda item regardless of topic. The card is small enough to live inside a binder; the questions are durable enough to outlast any specific tool.`,
  learningObjectives: [
    'Recognize and define the seven foundational AI governance terms.',
    'Distinguish governance from operations in an AI program.',
    'Ask four follow-up questions that surface what management has not yet said.',
  ],
  sections: [
    {
      id: 'bb1-seven-terms',
      title: 'The seven terms a director needs',
      content: `From the AIEOG AI Lexicon (US Treasury, FBIIC, FSSCC — published February 2026):

**AI Governance** — The institutional structure for how the bank develops, deploys, monitors, and retires AI. Distinct from any single model's risk management.

**Model Risk** — The risk that a model produces wrong answers and the bank acts on them. SR 11-7 governs this. AI systems used in credit, fraud, and compliance fall under it.

**Third-Party AI Risk** — Risk from AI systems run by vendors. Every AI feature in a vendor product is a TPRM matter — including features quietly added without changing the vendor contract.

**Hallucination** — A confidently-wrong AI output. Not a bug. A property of the architecture. The verification habit is the only mitigation.

**Human-in-the-Loop (HITL)** — A required review step before AI-influenced decisions take effect. Required for any member-affecting decision.

**AI Use-Case Inventory** — A current list of every AI tool in production at the bank, the data it touches, and the controls that govern it. Examiners will ask for this in 2026 and beyond.

**Explainability** — The ability to give a human-understandable reason for an AI output. ECOA requires this for adverse credit actions. Many AI systems do not have it natively.`,
      tryThis: 'At your next board meeting, when management mentions an AI tool, ask which of the seven terms applies most directly. The answer reveals whether the program has matured beyond a single point tool.',
    },
    {
      id: 'bb1-four-questions',
      title: 'Four questions for any AI agenda item',
      content: `**1. What decision does this AI influence, and who has the final signature?**

The answer separates governed from ungoverned use in one sentence.

**2. Where is this on our AI use-case inventory, and who owns it?**

If the answer is *we are working on the inventory,* the program is earlier-stage than the briefing implies.

**3. What happens when this AI is wrong, and how would we know?**

The presence or absence of a monitoring story tells you whether model risk has been thought through.

**4. What would an examiner ask, and what is our answer today?**

A management team that cannot answer this in real time has not run the practice yet.`,
      tryThis: 'Pick the next AI agenda item before the meeting. Write down what you predict the answers will be. Compare to what management says. The gap is your governance signal.',
    },
  ],
  activities: [
    {
      id: 'BB1.1',
      title: 'Vocabulary in context',
      description: 'Six short scenarios; pick which of the seven terms applies most directly. Adaptive feedback explains the precedence when more than one applies.',
      activityType: 'find-flaw',
      estimatedMinutes: 18,
      fields: [
        {
          id: 'matches',
          label: 'For each scenario, name the term and write a one-sentence rationale.',
          type: 'textarea',
          minLength: 100,
          required: true,
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: 'BB1.2',
      title: 'Build your Vocabulary Card',
      description: 'Personalized card with the seven terms and the four follow-up questions, formatted for a binder pocket.',
      activityType: 'single-prompt',
      estimatedMinutes: 8,
      fields: [
        {
          id: 'committee',
          label: 'Which committee will see AI agenda items most often at your institution?',
          type: 'select',
          required: true,
          options: [
            { value: 'audit', label: 'Audit / Risk' },
            { value: 'tech', label: 'Technology' },
            { value: 'full-board', label: 'Full Board' },
            { value: 'other', label: 'Other / committee-of-the-whole' },
          ],
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: 'BB1-board-ai-vocabulary-card',
    },
  ],
  artifacts: [
    {
      id: 'BB1-board-ai-vocabulary-card',
      title: 'Board AI Vocabulary Card',
      description: 'Pocket card. Seven AIEOG terms with one-line definitions. Four follow-up questions for any AI agenda item.',
      format: 'pdf+md',
      triggeredBy: 'BB1.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/BB1-board-ai-vocabulary-card.md',
    },
  ],
  forwardLinks: ['bb2-director-questions'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/board-briefing/module-BB1-spec.md',
} as const;
