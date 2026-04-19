import type { Unit } from '../../../../lib/aibi-s/types';
import { opsDepartmentHeadPhase1_2 } from './persona-dept-head-phase-1-2';

export const opsUnit1_2: Unit = {
  id: '1.2',
  trackCode: 'ops',
  phase: 1,
  title: 'Work Decomposition for Banking Workflows',
  summary: 'A 3-dimensional scoring matrix to rank your department\'s automation candidates before committing to deployment. The goal is not to find the easiest workflow — it\'s to find the one worth the governance overhead.',
  beats: [
    {
      kind: 'learn',
      title: 'The 12-point prioritization matrix',
      body: `Choosing the wrong workflow first is the most common Phase 1 mistake. It produces either a compliance incident (you picked something that needed more oversight than you planned for) or a failed proof-of-concept (you picked something technically complex that didn't actually save time). The matrix below gives you a defensible ranking before you write a single line of skill documentation.

**The three dimensions (1–4 each, max 12 points):**

**1. Frequency** — How often does this workflow run?
- 1: Quarterly or less
- 2: Monthly
- 3: Weekly
- 4: Daily or continuous

**2. Time-per-occurrence** — How long does it take a person to complete one instance?
- 1: Under 15 minutes
- 2: 15–60 minutes
- 3: 1–3 hours
- 4: More than 3 hours

**3. Standardization Value** — How rule-consistent is the logic?
- 1: Highly variable — every instance requires judgment
- 2: Mostly variable, with some repeating patterns
- 3: Mostly consistent, with occasional judgment calls
- 4: Fully consistent — the same rules apply every time

**Scoring example — three typical Ops workflows:**

| Workflow | Frequency | Time | Std. Value | Total |
|---|---|---|---|---|
| Weekly exception-report summary | 3 | 2 | 3 | **8** |
| Monthly ALCO memo data pull | 2 | 3 | 3 | **8** |
| Daily NSF fee reversal review | 4 | 1 | 4 | **9** |

The NSF reversal review wins on raw score — but before ranking, you must overlay a **governance complexity modifier**: how much Compliance lead time does this use case require? A workflow that touches BSA/AML flags may score 10 on the matrix but need 90 days of documentation before deployment. Factor that in before committing.

**Pillar B implication:** The matrix surfaces deployment candidates; it doesn't approve them. Every candidate above a 7 should have a preliminary AIEOG data-tier classification done before it leaves your desk. If the dominant data type is Tier 3, factor in the TPRM documentation timeline as a real cost.`,
      workedExample: `**Worked example.** A Loan Operations team at a $350M bank scored their top five recurring workflows. The exception-report summary (score 8) looked like the obvious winner. But the team lead noticed two things the matrix doesn't capture: (a) exception reports intermittently include account numbers, making it Tier 3 — requiring explicit AI data-handling approval from Compliance — and (b) their second-ranked workflow, a daily rate-sheet update distribution (score 9), involved only Tier 1 public data and could be approved as a standard use case in under two weeks. They deployed the rate-sheet automation first, captured the ROI, and used that proof point to move the exception-report workflow through the longer Compliance track 60 days later.`,
      hooks: {
        pillar: 'B',
        frameworks: ['AIEOG', 'Interagency TPRM'],
        dataTiers: [1, 2, 3],
      },
    },

    {
      kind: 'practice',
      simKind: 'decision',
      scenario: `Your Ops team has four recurring workflows. You've scored them using the Frequency × Time × Standardization matrix:

**A. Overdraft notice letter generation** — Daily, 30 minutes, fully templated. Score: 9. Involves member names and account numbers.

**B. Weekly loan-exception aging report** — Weekly, 45 minutes, rule-based but requires judgment on 10-15% of rows. Score: 7. Involves internal codes only — no member-identifiable data.

**C. Monthly vendor invoice reconciliation** — Monthly, 2 hours, rules vary by vendor contract. Score: 6. Involves dollar amounts and internal vendor IDs only.

**D. Quarterly ALCO rate sensitivity summary** — Quarterly, 4 hours, highly structured format with consistent data inputs. Score: 7. Involves internal rate data only.`,
      question: 'Which workflow should you deploy FIRST, and why?',
      options: [
        {
          id: 'opt-a-overdraft',
          label: 'A — Overdraft notice letters. Highest score (9), daily frequency means fastest ROI.',
          isCorrect: false,
          feedback: 'Incorrect. Workflow A has the highest matrix score, but it involves member names and account numbers — Tier 3 PII. Under AIEOG data-tier classification and Interagency TPRM guidance, a Tier 3 workflow requires explicit institutional approval of the AI platform\'s data-handling terms before deployment. That approval process typically takes 4-12 weeks. Deploying without it is a compliance incident, not a quick win.',
          consequenceIfWrong: 'Deploying a Tier 3 skill without Compliance approval creates shadow-AI exposure. In an exam, this becomes an "AI use case not in the institutional inventory" finding — the category that appears most frequently in recent FDIC technology examination feedback.',
        },
        {
          id: 'opt-b-loan-exception',
          label: 'B — Loan-exception aging report. No member PII, deployable without the Tier 3 documentation overhead.',
          isCorrect: true,
          feedback: 'Correct. Workflow B\'s score (7) is lower than A\'s, but the absence of member-identifiable data makes it Tier 2 — deployable as a standard internal use case without the full TPRM documentation cycle. The 10-15% judgment-call rows require a HITL checkpoint, but that\'s straightforward to document. This is the right first deployment: meaningful time savings, manageable governance, and a proof of concept you can use to justify the Compliance work for Workflow A.',
        },
        {
          id: 'opt-d-alco',
          label: 'D — ALCO rate sensitivity summary. Quarterly frequency is low, but 4-hour savings per occurrence and Tier 2 data make it the clean win.',
          isCorrect: false,
          feedback: 'Partially correct on the data tier — Workflow D is Tier 2 and deployable. But quarterly frequency means you see the results only four times per year, making it nearly impossible to iterate quickly, measure impact, or build team confidence. A first deployment needs frequent feedback cycles. Save the ALCO workflow for Phase 2 when your skill-authoring practices are established.',
          consequenceIfWrong: 'Low-frequency deployments stall momentum. If the first automation only runs quarterly, you\'ll have no usage data for six months and no story to tell leadership when they ask about progress.',
        },
        {
          id: 'opt-c-vendor',
          label: 'C — Vendor invoice reconciliation. Monthly cadence, no PII, Tier 2 data.',
          isCorrect: false,
          feedback: 'Incorrect. Workflow C scores lowest (6) and the standardization score is poor — rules vary by vendor contract. A low-standardization workflow requires the AI to handle too much variance, which means more exception handling, not less. This is a workflow to consider AFTER you\'ve established your skill-authoring and measurement practices on a higher-standardization candidate.',
          consequenceIfWrong: 'Low-standardization first deployments create noise: unpredictable outputs, frequent escalations, and team frustration. The first deployment should be something that produces consistent results quickly — it builds trust with both your team and Compliance.',
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
      prompt: `Score your department's top 5 recurring workflows using the Frequency × Time × Standardization matrix.

For each workflow include:
- Workflow name and one-sentence description
- Score on each dimension (1-4) and your reasoning for each score
- Total score
- Data tier(s) involved and any redaction required
- Estimated governance complexity (Low / Medium / High) and why

Then rank them by deployment priority — NOT just by raw matrix score — accounting for governance complexity. Explain any case where your priority order differs from the raw score order.`,
      guidance: `The strongest responses identify at least one workflow where the raw score and the deployment priority diverge because of governance complexity. If all five of your workflows rank in raw-score order, revisit your governance-complexity assessments — at least one of your candidates probably has a data-tier or TPRM variable you haven't accounted for.`,
      minWords: 80,
    },

    {
      kind: 'defend',
      persona: opsDepartmentHeadPhase1_2,
      hooks: {
        pillar: 'B',
        frameworks: ['AIEOG', 'Interagency TPRM'],
        dataTiers: [2, 3],
      },
    },

    {
      kind: 'refine',
      guidance: `Dana pushed back on your scoring logic. Rewrite your priority ranking now — incorporating her challenge about the governance-complexity variable and the standardization-score verification. The refined version is your defended artifact for this unit.`,
    },

    {
      kind: 'capture',
      artifactLabel: 'Unit 1.2 — /Ops — Defended workflow priority matrix',
    },
  ],
};
