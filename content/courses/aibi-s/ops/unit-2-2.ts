import type { Unit } from '../../../../lib/aibi-s/types';
import { opsComplianceLiaisonPhase2 } from './persona-compliance-liaison-phase-2';

export const opsUnit2_2: Unit = {
  id: '2.2',
  trackCode: 'ops',
  phase: 2,
  title: 'Measure and Evaluate',
  summary: 'Before/after measurement discipline, failure-mode registers, and HITL checkpoint design. If you cannot show what changed because of the skill — and what it did when it was wrong — you do not have a deployed automation. You have a personal prompt that sometimes runs.',
  beats: [
    {
      kind: 'learn',
      title: 'Measurement discipline: baseline, attribution, and failure-mode register',
      body: `Deployment is not the finish line. A skill that runs without measurement is not an institutional asset — it's a black box that your Compliance team cannot audit and your leadership team cannot evaluate.

**Four measurement components every deployed skill requires:**

**1. Baseline capture** — Before going live, record the current state:
- Time per occurrence (stopwatch, not estimate)
- Error rate in the manual process (how often does the current approach produce a wrong output?)
- Volume (occurrences per week/month)
- Named person doing the work and their fully-loaded hourly rate (for ROI arithmetic)

Baseline data must be collected BEFORE deployment. After the fact, memory is unreliable and leaders will challenge your numbers.

**2. Metric definition** — What does "success" look like 90 days after deployment?
- Primary metric: time saved per occurrence × volume
- Secondary metric: error rate change (AI errors vs. manual errors)
- Be explicit about what you are NOT measuring: "We are not tracking downstream decisions made from this output" is a valid scope declaration

**3. Attribution discipline** — What changed BECAUSE of the skill vs. for other reasons?
- If your exception volume drops 30% after deployment, is that the skill or a change in the underlying product causing fewer exceptions?
- Document any concurrent changes in the environment (system upgrades, staffing changes, policy changes) so you can separate effect from coincidence

**4. Failure-mode register** — Before deployment, list every known failure mode:

| Failure Mode | Probability | Detection Mechanism | Escalation Path |
|---|---|---|---|
| Incorrect exception-code grouping | Medium | HITL reviewer catches misclassification | Ops Supervisor, same day |
| Missing row (report truncation) | Low | Output row count vs. input row count | Workflow owner notifies Compliance |
| Hallucinated exception category | Low | Reviewer verifies all categories against approved code list | Skill retired and re-versioned |

**HITL checkpoints — the AIEOG standard:** A checkpoint is not "someone looks at it sometimes." It requires: a named role, a defined cadence, a documented scope of review, and a documented escalation path. If your HITL checkpoint cannot be described in two sentences, it's not a checkpoint — it's a hope.

**BSA/AML implication:** Exception reports at many institutions include transactions that have been reviewed for potential SAR-filing triggers. An AI summarization that truncates, misclassifies, or omits a flagged transaction — even accidentally — may create a documentation gap in a BSA/AML workflow. Your failure-mode register must account for the regulatory weight of specific exception types, not just treat all exceptions as equivalent.`,
      workedExample: `**Worked example — measurement plan for exception-report summarization:**

*Baseline (captured week of deployment):* Manual summary: 47 minutes per occurrence, 3 occurrences/week, error rate: 2 mis-grouped exceptions per month (identified in Compliance review). Operator: J. Chen, Senior Ops Analyst.

*90-day targets:* Primary: reduce to under 15 minutes per occurrence (68% reduction). Secondary: maintain or improve error rate (target: 0 mis-grouped exceptions in first 90 days). Out of scope: downstream exception-resolution decisions.

*Attribution note:* A core system upgrade is scheduled for week 6. If exception volume changes materially after the upgrade, attribute that variance to the system change — not the skill.

*Failure-mode register:* Three failure modes documented. Detection mechanism for each: HITL reviewer (J. Chen) performs line-by-line comparison of AI output vs. source report for first 30 days; spot-check (10% of rows) for days 31-90. Escalation: Ops Supervisor on same-day basis; Compliance if any BSA-flagged exception code appears in an AI output that misrepresents its status.`,
      hooks: {
        pillar: 'B',
        frameworks: ['AIEOG', 'BSA/AML', 'SR 11-7'],
        dataTiers: [2],
      },
    },

    {
      kind: 'practice',
      simKind: 'decision',
      scenario: `Your exception-report summarization skill has been in production for 6 weeks. This morning, your HITL reviewer (Sarah Chen) flags an issue: the AI output for Wednesday's report shows only 31 exception rows, but the source report had 34 rows. The three missing rows all had exception code E-114 — the code used for potential BSA/AML-related holds.

Sarah is asking what to do. Your measurement plan documented E-114 as a known exception code requiring manual escalation if flagged.`,
      question: 'What is the correct immediate response?',
      options: [
        {
          id: 'opt-rerun',
          label: 'Re-run the skill with the same input to see if the result is reproducible. If it drops the same rows, then escalate.',
          isCorrect: false,
          feedback: 'Incorrect. Re-running first is the wrong sequence. The missing rows involved BSA/AML-flagged exceptions (E-114). Under BSA/AML program requirements, any failure to capture, document, or review a potentially reportable transaction — even an accidental AI omission — must be escalated and logged before any further processing. Re-running the skill without notification first leaves a documentation gap.',
          consequenceIfWrong: 'A delayed escalation on a BSA/AML-adjacent exception omission is the kind of timeline gap that appears in exam findings. The question examiners ask is not "did you notice?" but "when did you notice, and what did you do in the next 30 minutes?"',
        },
        {
          id: 'opt-escalate-compliance',
          label: 'Immediately notify Compliance in writing that three E-114 rows were omitted from the AI output. Attach the source report and the AI output. Suspend the skill pending root-cause analysis.',
          isCorrect: true,
          feedback: 'Correct. BSA/AML-adjacent exceptions require immediate, documented escalation regardless of cause. Your failure-mode register should have pre-named this path: "any omission of E-114 rows → same-day written notification to Compliance with source documentation attached." Suspending the skill pending root cause is the right call — you cannot know whether this is a one-time truncation or a systematic failure until you investigate, and you should not continue deploying a skill with a known active failure mode.',
        },
        {
          id: 'opt-manual-add',
          label: 'Have Sarah manually add the three missing rows to the AI output, document the correction, and treat this as a HITL success — the checkpoint worked as designed.',
          isCorrect: false,
          feedback: 'Partially correct — the HITL did work. Sarah catching the omission is exactly what the checkpoint was designed for. But "document the correction and move on" is insufficient when the missing content is BSA/AML-flagged. The correction must be escalated to Compliance, and the failure mode that allowed E-114 rows to be dropped must be investigated and addressed in the skill before resuming production.',
          consequenceIfWrong: 'Treating this as a simple correction without Compliance notification creates a paper trail where the AI omitted potentially reportable transaction flags and the department self-corrected without disclosure. That\'s an audit finding, not a HITL success story.',
        },
        {
          id: 'opt-retire',
          label: 'Retire the skill immediately. E-114 rows are too high-risk for any AI summarization.',
          isCorrect: false,
          feedback: 'Retirement may ultimately be the right decision for E-114-containing workflows — but immediate retirement without root-cause analysis throws away useful data. Was this a one-time platform truncation? A skill constraint failure? A data-export issue? The answer changes what you do next. Escalate, investigate, then decide on retirement vs. remediation.',
        },
      ],
      hooks: {
        pillar: 'B',
        frameworks: ['BSA/AML', 'AIEOG'],
        dataTiers: [2],
      },
    },

    {
      kind: 'apply',
      prompt: `Write a 1-page measurement plan for your deployed skill. Include:

**1. Baseline** — Time per occurrence, volume, error rate, and operator (use realistic estimates if you haven't measured yet — but flag them as estimates)

**2. 90-day success metrics** — Primary metric, secondary metric, and explicit scope declaration for what you are NOT measuring

**3. Attribution note** — List any concurrent changes in your environment (system upgrades, staffing changes, policy revisions) that could confound your measurement

**4. Failure-mode register** — At least three failure modes with: Probability, Detection Mechanism, and Escalation Path. One failure mode must address what happens if the AI omits or misclassifies a row with regulatory significance (BSA/AML flag, ECOA-relevant field, or similar)

**5. Compliance handoff** — One paragraph describing how and when you share measurement results with your Compliance Liaison, and what they need from you to close the use-case inventory entry`,
      guidance: `The failure-mode register is the component most applicants underinvest in. Three failure modes is the minimum — but the quality of the escalation path matters more than the count. "Escalate to supervisor" is not an escalation path. "Email Compliance Liaison within 4 business hours with source document attached" is.`,
      minWords: 90,
    },

    {
      kind: 'defend',
      persona: opsComplianceLiaisonPhase2,
      hooks: {
        pillar: 'B',
        frameworks: ['BSA/AML', 'SR 11-7', 'AIEOG'],
        dataTiers: [2],
      },
    },

    {
      kind: 'refine',
      guidance: `Marcus identified documentation gaps in your HITL specification, data-tier declaration, or regulatory framework analysis. Revise your measurement plan to address each gap he named. Pay particular attention to: (1) whether your HITL checkpoint names a specific reviewer role and cadence, and (2) whether your failure-mode register addresses regulatory-significance exceptions explicitly. This revised plan is your Compliance-ready submission artifact.`,
    },

    {
      kind: 'capture',
      artifactLabel: 'Unit 2.2 — /Ops — Compliance-ready measurement plan with failure-mode register',
    },
  ],
};
