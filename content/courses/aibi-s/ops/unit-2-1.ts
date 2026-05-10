import type { Unit } from '@/lib/aibi-s/types';
import { opsResistantTeamMemberPhase2 } from './persona-resistant-team-member-phase-2';

export const opsUnit2_1: Unit = {
  id: '2.1',
  trackCode: 'ops',
  phase: 2,
  title: 'Build Your First Departmental Automation',
  summary: 'RTFC+D+G skill authoring — the structured format that turns a personal prompt into an institutional asset with a data-tier declaration and a governance block your Compliance team can actually review.',
  beats: [
    {
      kind: 'learn',
      title: 'RTFC+D+G: The skill authoring standard',
      body: `A personal prompt is a note to yourself. An institutional skill is a document with an owner, a scope, and a governance block. The difference between them is the difference between a workflow that disappears when you leave and one that runs the department after you do.

**The RTFC+D+G framework:**

**R — Role.** Who is the AI acting as in this skill?
*Example:* "You are an operations analyst at a federally insured community bank. Your task is to summarize exception reports for daily management review."

The Role declaration sets the contextual scope. It also signals to reviewers — and to an examiner — that this skill was authored for a specific, bounded purpose, not pasted in from a generic AI assistant session.

**T — Task.** What exactly is the AI being asked to do — inputs, outputs, and constraints?
*Example:* "You will receive a redacted exception-report table (account numbers removed). Summarize each exception in one sentence. Group by exception type. Flag any row where the exception code is not in the approved code list."

**F — Format.** What does the output look like?
*Example:* "Return a markdown table: columns Exception Code | Count | Summary | Escalation Flag. One row per exception type."

**C — Constraint.** What must the AI never do in this skill?
*Example:* "Do not infer exception causes beyond what the data states. Do not produce narrative text about individual accounts. Do not use exception codes not present in the input."

**+D — Data Tier.** What classification governs this skill's inputs?
*Example:* "Data tier: 2 (internal). Inputs must be redacted to remove Tier 3 identifiers (account numbers, routing numbers, member names) before submission. Responsibility: workflow operator."

The +D block is the single most important documentation addition for Compliance. Without it, every reviewer who touches this skill has to re-derive the classification themselves — and they may not all reach the same answer.

**+G — Governance Block.** Who owns this skill, who reviews outputs, and how does it get retired?
*Example:* "Owner: [Name], Operations Manager. HITL checkpoint: daily output reviewed by [Role] before distribution. Versioning: filename includes YYYY-MM-DD. Retire trigger: core platform field-name change or exception-code schema update."

**Why the governance block matters for HITL:** The AIEOG AI Lexicon defines human-in-the-loop as a specific checkpoint in a consequential workflow — not a generic aspiration to "keep humans informed." Your +G block must name who reviews what, at what cadence, and what "review" means operationally.`,
      workedExample: `**Worked example — exception-report summarization skill:**

*R:* You are an operations analyst at a federally insured community bank. Your task is to produce a daily exception-report summary for management review.

*T:* You will receive a redacted exception table exported from the core processing system. Columns present: Exception Code, Product Type, Dollar Amount, Resolution Status. No account numbers, routing numbers, or member names are present in the input. Summarize exceptions by type. Flag any "Open" status items older than 3 business days.

*F:* Return a markdown table (Exception Code | Count | Avg Amount | Open >3 Days). After the table, a 2-sentence plain-English summary of the day's exception volume compared to the prior 5-day average.

*C:* Do not infer causes. Do not reference individual accounts. Do not produce categories not present in the input data.

*+D:* Data tier: 2 (internal). Source data must be redacted by workflow operator before submission. PII scrubbing checklist: [link to procedure].

*+G:* Owner: Operations Manager. HITL: daily output reviewed by Ops Supervisor before distribution to management. Version: exception-summary-skill-YYYY-MM-DD.md. Retire trigger: any core field-name change or exception-code schema revision.`,
      hooks: {
        pillar: 'B',
        frameworks: ['AIEOG'],
        dataTiers: [2],
      },
    },

    {
      kind: 'practice',
      simKind: 'decision',
      scenario: `You've drafted an exception-report summarization skill. Here is the draft:

**R:** You are a bank operations assistant. Summarize the exception report.

**T:** Summarize the attached exception report. Group by type. Flag anything that looks serious.

**F:** Return a bullet list.

**C:** None specified.

**+D:** Not specified.

**+G:** Not specified.

Your manager asks you to review the draft before submitting it to Compliance for use-case inventory approval.`,
      question: 'Which single missing element would cause the MOST significant production failure or compliance finding?',
      options: [
        {
          id: 'opt-no-format',
          label: 'The Format spec is too vague — "bullet list" could produce inconsistent output structures.',
          isCorrect: false,
          feedback: 'Format vagueness is a real problem — inconsistent output structures waste time and erode trust. But it\'s a usability failure, not a compliance failure. The missing Format spec won\'t cause an exam finding. It will cause your colleagues to complain. Fix it, but it\'s not the most critical gap.',
        },
        {
          id: 'opt-no-constraint',
          label: 'The Constraint block is missing — the AI could speculate about account-level causes or infer information not in the data.',
          isCorrect: false,
          feedback: 'Missing constraints are a real risk — without them, the AI may produce narrative about individual accounts or flag things based on pattern-matching rather than stated data. But this is recoverable with a HITL checkpoint. It\'s a quality failure, not the most critical gap in a production sense.',
        },
        {
          id: 'opt-no-data-tier',
          label: 'The +D (Data Tier) declaration is missing — there\'s no record of what data enters this skill or who is responsible for redaction.',
          isCorrect: true,
          feedback: 'Correct. The missing +D block is the most critical gap. Without a data-tier declaration, there is no documented evidence that the workflow operator knows what data classification applies, who is responsible for pre-processing PII out of the input, or whether the platform handling the data has been approved for that classification. Under AIEOG data-tier requirements and Interagency TPRM guidance, this is the gap most likely to produce an exam finding — "AI use case in production without documented data-handling controls."',
        },
        {
          id: 'opt-no-governance',
          label: 'The +G (Governance Block) is missing — there\'s no owner, no HITL checkpoint, and no retire trigger.',
          isCorrect: false,
          feedback: 'The missing governance block is the second-most-critical gap and would be flagged in any use-case inventory review. But it\'s one step removed from the production failure path: without +D, you may not even know you\'re running a Tier 3 workflow without approval. Fix +D first, then +G.',
          consequenceIfWrong: 'In practice, both +D and +G missing is a compounded finding. But the data-tier declaration is the foundational document — the governance block depends on knowing the tier first.',
        },
      ],
      hooks: {
        pillar: 'B',
        frameworks: ['AIEOG', 'Interagency TPRM'],
        dataTiers: [2, 3],
      },
    },

    {
      kind: 'apply',
      prompt: `Write the first draft of your departmental skill using the RTFC+D+G framework.

Your skill should be for the workflow you identified and ranked in Units 1.1 and 1.2. Include all six components:
- **R** (Role): Who is the AI in this skill?
- **T** (Task): Inputs, outputs, and what the AI is being asked to do
- **F** (Format): Exact output structure
- **C** (Constraint): What the AI must never do
- **+D** (Data Tier): Classification, rationale, and redaction responsibility
- **+G** (Governance Block): Owner, HITL checkpoint, versioning, retire trigger

After the skill draft, write a 2-sentence note explaining your +D classification decision — specifically, what evidence or data-field inventory led you to that tier assignment.`,
      guidance: `A good draft is specific enough that someone who has never seen your workflow could operate it correctly. Generic Tasks ("summarize the report") and missing Constraints are the two most common first-draft failures. Read your draft back as if you were the Compliance Liaison reviewing it — does every component answer the question a reviewer would ask?`,
      minWords: 100,
    },

    {
      kind: 'defend',
      persona: opsResistantTeamMemberPhase2,
      hooks: {
        pillar: 'C',
        frameworks: ['AIEOG'],
        dataTiers: [2],
      },
    },

    {
      kind: 'refine',
      guidance: `Sarah raised real concerns about trust, blame attribution, and her role in the new workflow. Before refining the skill itself — revise the +G governance block to explicitly address: (1) who owns the error-catch process and with what mechanism, and (2) how Sarah's contextual knowledge of legacy exception codes gets embedded into the Constraint block. Then rewrite the full skill draft incorporating both changes.`,
    },

    {
      kind: 'capture',
      artifactLabel: 'Unit 2.1 — /Ops — RTFC+D+G skill draft with governance block',
    },
  ],
};
