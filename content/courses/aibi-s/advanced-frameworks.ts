// AiBI-S Advanced Frameworks — Exclusive Content
// Access: AiBI-S enrolled learners only. AiBI-P completers can see these resources exist but cannot access them.
// These five frameworks are the primary justification for the $1,495 price difference between AiBI-P and AiBI-S.
// All content is Markdown strings for Kajabi-migration-readiness.
// Cobalt accent system throughout — AiBI-S color discipline.

// ---- Types ----

export interface AdvancedFramework {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly estimatedMinutes: number;
  readonly prerequisiteWeek: number;   // Earliest AiBI-S week at which this framework is actionable
  readonly keyOutput: string;
  readonly sections: readonly FrameworkSection[];
  readonly tables?: readonly FrameworkTable[];
  readonly templates?: readonly FrameworkTemplate[];
}

export interface FrameworkSection {
  readonly id: string;
  readonly title: string;
  readonly content: string;   // Markdown prose
}

export interface FrameworkTable {
  readonly id: string;
  readonly caption: string;
  readonly columns: readonly { readonly header: string; readonly key: string }[];
  readonly rows: readonly Record<string, string>[];
}

export interface FrameworkTemplate {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly body: string;   // Pre-filled template content in Markdown
}

// ---- Framework 1: Multi-Step Skill Architecture Guide ----

export const multiStepSkillArchitecture: AdvancedFramework = {
  id: 'multi-step-skill-architecture',
  title: 'Multi-Step Skill Architecture Guide',
  subtitle: 'Chaining skills into governed automation pipelines',
  estimatedMinutes: 45,
  prerequisiteWeek: 3,
  keyOutput: 'A documented multi-step skill chain with defined handoff points, data flow, and governance checkpoints',

  sections: [
    {
      id: 'mssa-concept',
      title: 'From Single Skills to Skill Chains',
      content: `AiBI-P teaches you to build skills that do one thing well. AiBI-S introduces the next architectural question: what do you do when a valuable workflow requires multiple distinct AI steps in sequence?

A single skill handles a single transformation: a document goes in, a summary comes out. A skill chain handles a workflow: a regulatory update goes in, and a draft board memo — with impact analysis and training brief attached — comes out. Between entry and exit, three or four separate skills execute in sequence, each receiving the structured output of the previous step.

This is not automation for its own sake. Skill chains are justified when:

1. The intermediate outputs are meaningful checkpoints where a human should review before proceeding.
2. The steps require different context or constraints (research steps need wide latitude; compliance drafting steps need tight constraints).
3. The workflow happens regularly enough that the overhead of building and maintaining the chain is recovered by time savings within weeks.

**The core principle of a skill chain: the output of each skill is designed to be a valid input for the next one.** This sounds obvious. In practice, it requires deliberate output formatting in every skill except the last. A skill that produces a casual narrative cannot feed a skill that expects a structured checklist. The chain designer specifies the handoff format before writing any individual skill.`,
    },
    {
      id: 'mssa-anatomy',
      title: 'Anatomy of a Skill Chain',
      content: `Every skill chain has four structural elements: trigger, steps, handoff points, and terminal output.

**Trigger:** What event or input initiates the chain? Triggers can be document arrivals (a new regulatory circular, a loan application), scheduled events (monthly board report cycle), or manual initiation by a named staff member. The trigger must be specific — "when compliance receives a new regulatory update" is a trigger. "When something happens" is not.

**Steps:** The numbered sequence of AI skill executions. Each step has:
- A descriptive name (what it does, not what it is)
- The skill file that executes it
- The input it receives (from trigger or from the previous step's output)
- The output format it produces
- A governance flag: HITL-required, HITL-optional, or automated

**Handoff points:** The moments where a human reviews the output of one step before the next step begins. Governance requires HITL at any step whose output will influence a decision affecting customers, compliance, or the institution's regulatory posture. Handoff points are not optional checkpoints — they are mandatory pauses in the chain where an accountable human reviews, approves, and initiates the next step.

**Terminal output:** The final deliverable the chain produces. Always specify this first, before designing any intermediate step. The terminal output defines what the chain is for.

**Notation convention for skill chains:**

\`\`\`
TRIGGER → [Step Name | skill-file.md | HITL] → [Step Name | skill-file.md | HITL] → TERMINAL OUTPUT
\`\`\`

Use HITL-R (required) or HITL-O (optional) to distinguish mandatory review points from recommended ones.`,
    },
    {
      id: 'mssa-banking-example',
      title: 'Banking Example: Regulatory Change Response Chain',
      content: `**Workflow:** A compliance officer receives a new regulatory circular. The chain takes the circular from raw document to board-ready memo with attached training brief.

**Trigger:** Compliance officer downloads a new regulatory document (OCC bulletin, Fed guidance, CFPB update) and places it in the designated inbox folder.

**Chain:**

\`\`\`
TRIGGER: New regulatory document received
  ↓
[Step 1: Regulatory Research | compliance-reg-research-v1.md | HITL-R]
  Input: Raw regulatory document + institution's current policy inventory
  Output: Structured summary — key requirements, effective dates, penalties, applicability scope
  Human checkpoint: Compliance officer reviews summary for accuracy before proceeding

  ↓
[Step 2: Policy Gap Analysis | compliance-gap-analysis-v1.md | HITL-R]
  Input: Structured regulatory summary (from Step 1) + policy inventory (from context file)
  Output: Gap analysis table — each requirement mapped to existing policy, with gap/no gap/partial flag
  Human checkpoint: Compliance officer validates gaps and marks any false positives

  ↓
[Step 3: Draft Update Memo | compliance-policy-memo-v1.md | HITL-R]
  Input: Validated gap analysis table (from Step 2) + policy memo template (from context file)
  Output: Draft policy update memo in institutional voice, ready for legal review
  Human checkpoint: Compliance officer reviews draft before routing to legal or management

  ↓
[Step 4: Staff Training Brief | compliance-training-brief-v1.md | HITL-O]
  Input: Policy update memo (from Step 3) + department-specific application examples (from context file)
  Output: Two-page staff training brief — what changed, what staff must do differently, effective date
  Human checkpoint: Optional — compliance officer may use output directly or refine
\`\`\`

**Terminal output:** Board-ready policy memo + staff training brief.

**Estimated time with chain:** 45-60 minutes (versus 3-4 hours manually). The primary time savings are in Step 1 (regulatory research and synthesis) and Step 2 (gap analysis), where the chain replaces 1-2 hours of manual cross-referencing.

**Governance note:** All four steps have HITL review. This is non-negotiable for compliance workflows. The human is not rubber-stamping — they are adding judgment that the skill chain cannot provide: institutional context, relationship history, strategic priorities, and regulatory examiner expectations specific to the institution.`,
    },
    {
      id: 'mssa-skill-dispatcher',
      title: 'The Skill Dispatcher Pattern for Large Libraries',
      content: `When a department has 10 or more skills, routing becomes a problem. A staff member who needs to run a skill chain must know which skills exist, which one applies to their situation, and in what order to run them. With 15+ skills, this knowledge is non-trivial — and it creates a single point of failure if only a few people carry it.

The Skill Dispatcher solves this. A Skill Dispatcher is a meta-skill: a skill whose purpose is to interpret an incoming request and route it to the appropriate skill or skill chain.

**How a Skill Dispatcher works:**

\`\`\`
SKILL: [dept]-dispatcher-v1.md

ROLE: You are the [Department] AI Skill Dispatcher. Your job is to read an incoming request and determine which skill or skill chain should handle it.

CONTEXT: [Skill library index — name, one-sentence description, trigger condition for each skill]

TASK: The user will describe what they need. You will:
1. Identify which skill or chain best matches their need.
2. State the name of the skill or chain.
3. Provide the exact input format that skill expects.
4. List any context files they need to attach.
5. Flag any HITL checkpoints they should expect.

OUTPUT FORMAT:
Skill or chain: [name]
Input to prepare: [specification]
Context files needed: [list]
HITL checkpoints: [list with brief description]
Estimated completion time: [minutes]

CONSTRAINTS:
- If no existing skill matches the request, say so explicitly. Do not improvise a skill.
- Never route a Tier 2 data request to a skill that is not cleared for Tier 2.
- If the request involves a credit or compliance decision, always flag the HITL checkpoints regardless of which skill handles it.
\`\`\`

**When to build a Dispatcher:**

Build a Dispatcher when the skill library contains 10 or more skills that are actively used by staff who were not involved in building them. Below 10 skills, a one-page quick reference index is sufficient. Above 10, the cognitive overhead of skill selection creates friction that reduces adoption.

**Dispatcher maintenance:** The Dispatcher is only as useful as its skill library index. Every time a skill is added, updated, or deprecated, the library index in the Dispatcher context file must be updated. Make the Dispatcher index update part of the mandatory checklist for any skill library change.`,
    },
    {
      id: 'mssa-loop-skills',
      title: 'Loop Skills: Monitoring and Exception Tracking',
      content: `A loop skill is a skill designed to run on a regular schedule against a changing data source, comparing current state to a defined baseline or threshold, and producing an exception report when variance is detected.

Loop skills are distinct from standard skills in three ways:
1. They are triggered by schedule or event, not by human initiation.
2. They compare current state to a reference state, rather than transforming a single input.
3. Their most useful output is often "nothing to report" — the absence of an exception is itself meaningful information.

**Banking applications for loop skills:**

**BSA Transaction Monitoring Support:**
\`\`\`
LOOP SKILL: bsa-exception-triage-v1.md
Schedule: Daily, after overnight transaction processing
Input: Daily transaction summary from core processor (Tier 2 — enterprise account required)
Reference: Baseline transaction patterns by account tier (from context file)
Output: Exception report — transactions that deviate from pattern, grouped by type
HITL: Required — BSA officer reviews all flagged items before any action
Note: This skill supports the BSA officer's review. It does NOT replace SAR determination,
which requires human judgment and cannot be delegated to AI.
\`\`\`

**Policy Monitoring:**
\`\`\`
LOOP SKILL: compliance-reg-monitor-v1.md
Schedule: Weekly (Monday morning)
Input: New items from defined regulatory source list (OCC, Fed, CFPB, FinCEN bulletins)
Reference: Current policy inventory (from context file, updated quarterly)
Output: New items that may require policy review — headline, source, effective date, preliminary applicability flag
HITL: Required — compliance officer reviews all flagged items
\`\`\`

**Exception Tracking — Operational:**
\`\`\`
LOOP SKILL: ops-exception-tracker-v1.md
Schedule: Weekly (Friday afternoon)
Input: Weekly exception log from operations system (Tier 1)
Reference: Exception threshold definitions and escalation criteria (from context file)
Output: Exception summary — open items over threshold, new items, resolved items, trend flag
HITL: Optional — operations manager reviews and routes
\`\`\`

**Governance requirements for loop skills:**
- All loop skills that touch Tier 2 data must run under an enterprise data processing agreement.
- Loop skill outputs must never be acted upon without human review. The loop skill flags; the human decides.
- Loop skills must be reviewed quarterly to verify that the reference baseline and threshold definitions remain current.
- Every loop skill must have a named owner who is accountable for reviewing its outputs and maintaining its reference files.`,
    },
  ],

  tables: [
    {
      id: 'mssa-hitl-matrix',
      caption: 'HITL Requirement Matrix by Output Type',
      columns: [
        { header: 'Output Type', key: 'outputType' },
        { header: 'HITL Requirement', key: 'hitl' },
        { header: 'Regulatory Basis', key: 'basis' },
        { header: 'Example', key: 'example' },
      ],
      rows: [
        {
          outputType: 'Credit or lending decision input',
          hitl: 'Required — no exceptions',
          basis: 'ECOA/Reg B; SR 11-7 model risk management',
          example: 'Loan file completeness check that influences credit approval',
        },
        {
          outputType: 'Compliance determination or SAR-adjacent output',
          hitl: 'Required — no exceptions',
          basis: 'BSA/AML; SR 11-7',
          example: 'BSA exception triage output before SAR determination',
        },
        {
          outputType: 'Board or management communication',
          hitl: 'Required',
          basis: 'Institutional governance; examiner expectations',
          example: 'Draft board memo from policy update chain',
        },
        {
          outputType: 'Internal operational report',
          hitl: 'Recommended',
          basis: 'Best practice',
          example: 'Weekly exception summary for operations manager',
        },
        {
          outputType: 'Staff training content',
          hitl: 'Recommended',
          basis: 'Best practice',
          example: 'Staff training brief generated from policy update',
        },
        {
          outputType: 'Internal research or synthesis',
          hitl: 'Optional',
          basis: 'Judgment call by skill owner',
          example: 'Regulatory research synthesis for compliance officer review',
        },
        {
          outputType: 'Scheduling, routing, or administrative output',
          hitl: 'Optional',
          basis: 'Judgment call',
          example: 'Meeting agenda draft from weekly action items',
        },
      ],
    },
  ],

  templates: [
    {
      id: 'skill-chain-documentation-template',
      title: 'Skill Chain Documentation Template',
      description: 'Standard documentation format for a multi-step skill chain. Complete this before writing any individual skill in the chain.',
      body: `# [Chain Name]

## Chain Overview
**Purpose:** [One sentence — what workflow does this chain handle?]
**Trigger:** [What event initiates the chain?]
**Terminal output:** [What is the final deliverable?]
**Estimated time with chain:** [minutes or hours]
**Estimated time without chain:** [minutes or hours]
**Owner:** [Named staff member]
**Last reviewed:** [date]
**Data tier:** [Tier 1 / Tier 2 — determines platform requirements]

---

## Step Sequence

### Step 1: [Step Name]
- **Skill file:** \`[filename].md\`
- **Input:** [What does this step receive?]
- **Output format:** [What must this step produce for Step 2 to accept it?]
- **HITL:** Required / Optional / N/A
- **Human action at checkpoint:** [What does the human do before proceeding?]

### Step 2: [Step Name]
- **Skill file:** \`[filename].md\`
- **Input:** [Output from Step 1 + any additional context files]
- **Output format:** [Specification]
- **HITL:** Required / Optional / N/A
- **Human action at checkpoint:** [Specification]

[Repeat for each step]

---

## Context Files Required
| File | Purpose | Update Frequency |
|------|---------|-----------------|
| [filename] | [purpose] | [frequency] |

---

## Governance Notes
- [Any regulatory frameworks that apply to this chain's outputs]
- [Data classification notes]
- [Escalation path if a step produces unexpected output]

---

## Change Log
| Version | Date | Change | Changed by |
|---------|------|--------|-----------|
| 1.0 | [date] | Initial build | [name] |
`,
    },
  ],
};

// ---- Framework 2: Departmental Workflow Orchestration Playbook ----

export const departmentalWorkflowPlaybook: AdvancedFramework = {
  id: 'departmental-workflow-orchestration',
  title: 'Departmental Workflow Orchestration Playbook',
  subtitle: 'Five complete multi-skill workflows — one per role track',
  estimatedMinutes: 60,
  prerequisiteWeek: 3,
  keyOutput: 'Documented workflow chain for your role track, adapted to your department',

  sections: [
    {
      id: 'dwop-intro',
      title: 'How to Use This Playbook',
      content: `This playbook contains five complete multi-skill workflows — one for each AiBI-S role track. Each workflow is production-ready: it includes the full skill chain, a text-based data flow diagram, estimated time savings, and governance requirements.

These are not templates to be adapted. They are documented implementations that have been designed to work at community banks and credit unions with the platforms covered in AiBI-S. Adapt the context files and department-specific details, but do not change the HITL checkpoints or data classification requirements without explicit review.

**How to read each workflow:**

1. Read the overview and estimated time savings first. If the savings estimate does not apply to your institution (low volume, different process), this workflow may not be worth building right now.
2. Review the governance requirements before building anything. Platform choices, HITL requirements, and data tier constraints are non-negotiable.
3. Build the skills in order. Each skill's output format is designed to feed the next skill. Building them out of order creates integration problems.
4. Run the chain manually end-to-end before deploying it to your team. A chain that works in testing may have edge cases that only appear with real data.`,
    },
    {
      id: 'dwop-operations',
      title: 'Operations Track: Meeting to Weekly Summary Chain',
      content: `**Workflow: Meeting → Action Items → Follow-Up Tracking → Weekly Summary**

**Who this is for:** Operations managers, back-office leads, and project managers who run recurring team meetings and need consistent action item tracking and weekly rollup reporting.

**Trigger:** A meeting concludes. The manager has a transcript or meeting notes.

---

**Chain Diagram:**

\`\`\`
[TRIGGER: Meeting transcript or notes]
         |
         v
[Step 1: Meeting Synthesis | ops-meeting-synthesis-v1.md | HITL-O]
 Input: Raw transcript or meeting notes
 Output: Structured meeting record — decisions, action items (owner, due date, priority), blockers
         |
         v (Manager reviews and corrects action item assignments)
[Step 2: Action Item Routing | ops-action-routing-v1.md | HITL-R]
 Input: Structured meeting record (from Step 1)
 Output: Individual action item cards per owner — formatted for email or task system
         |
         v (Manager sends or assigns; action items tracked in shared log)
[Step 3: Follow-Up Status Triage | ops-followup-triage-v1.md | HITL-O]
 Input: Open action item log (from context file, updated weekly) + due date reference
 Output: Status summary — on track, at risk (due within 3 days, no update), overdue
         |
         v
[Step 4: Weekly Summary Draft | ops-weekly-summary-v1.md | HITL-R]
 Input: Status summary (from Step 3) + completed items this week + upcoming week priorities
 Output: Weekly operations summary in board-adjacent institutional voice
\`\`\`

**Terminal output:** Weekly operations summary, ready for distribution to management.

---

**Estimated time savings:**

| Step | Manual time | With chain | Savings per occurrence |
|------|------------|------------|----------------------|
| Meeting synthesis | 20-30 min | 3-5 min | 17-25 min |
| Action item routing | 10-15 min | 2-3 min | 8-12 min |
| Follow-up triage | 15-20 min | 2-3 min | 13-17 min |
| Weekly summary | 30-45 min | 5-8 min | 25-37 min |
| **Weekly total** | **75-110 min** | **12-19 min** | **63-91 min** |

At an operations manager salary of $75,000 ($36/hour), this chain saves approximately $47-$65 per week, or $2,400-$3,400 per year. ROI on AiBI-S tuition recovers in 6-7 months on this workflow alone.

---

**Governance requirements:**

- Platforms: Copilot in Teams (Steps 1-2), Copilot in Outlook (Step 4). Power Automate can automate trigger if Teams meeting transcription is enabled.
- Data tier: Tier 1 (internal operational data, no customer PII). Standard Copilot enterprise license is sufficient.
- HITL-R at Step 2: The manager must review and confirm action item assignments before routing. Misrouted action items are an operational failure that the chain cannot catch.
- HITL-R at Step 4: The weekly summary may be distributed to senior management. Human review of tone, completeness, and accuracy is required.
- Retention: Weekly summaries are institutional records. Store per document retention policy.`,
    },
    {
      id: 'dwop-lending',
      title: 'Lending Track: Application Processing Chain',
      content: `**Workflow: Application Intake → Completeness Check → Risk Assessment Prep → Committee Packet**

**Who this is for:** Loan officers, credit analysts, and lending managers who process commercial and consumer loan applications and need to accelerate the underwriting preparation workflow.

**Trigger:** A completed loan application package arrives (new application or complete submission after initial checklist).

---

**Chain Diagram:**

\`\`\`
[TRIGGER: Loan application package received]
         |
         v
[Step 1: Document Completeness Check | lending-completeness-check-v1.md | HITL-R]
 Input: Application package contents list (not the documents themselves — Tier 1)
 Output: Completeness checklist — present, missing, incomplete for each required document
         |
         v (Loan officer reviews and requests missing items before proceeding)
[Step 2: Borrower Profile Synthesis | lending-borrower-profile-v1.md | HITL-R]
 Input: Application data (financial statements, credit summary — Tier 2, enterprise account required)
 Output: Structured borrower profile — entity type, purpose, sources of repayment, key ratios, flags
         |
         v (Credit analyst reviews profile for accuracy; no credit decision yet)
[Step 3: Policy Compliance Screening | lending-policy-screen-v1.md | HITL-R]
 Input: Borrower profile (from Step 2) + lending policy context file (from context file)
 Output: Policy compliance matrix — each policy requirement screened, pass/flag/review-needed
         |
         v (Senior officer reviews policy flags before committee prep)
[Step 4: Committee Packet Assembly | lending-committee-prep-v1.md | HITL-R]
 Input: Borrower profile + policy compliance matrix + standard committee template (from context file)
 Output: Draft committee memo — executive summary, borrower profile, policy compliance, recommendation section placeholder
\`\`\`

**Terminal output:** Draft committee memo. The recommendation section is intentionally blank — the credit decision is made by a human and inserted by the reviewing officer.

---

**CRITICAL GOVERNANCE NOTE:** This chain prepares the underwriting file. It does not make or recommend a credit decision. Steps 1-3 are research and organization workflows. Step 4 produces a committee memo with a blank recommendation section. The credit officer completes the recommendation using their judgment after reviewing the full file. Any implementation that inserts a recommendation or approval/denial signal into the chain output is a violation of ECOA/Reg B and SR 11-7.

---

**Estimated time savings:**

| Step | Manual time | With chain | Savings per application |
|------|------------|------------|------------------------|
| Completeness check | 20-40 min | 5-8 min | 15-32 min |
| Borrower profile | 45-90 min | 10-15 min | 35-75 min |
| Policy screening | 30-60 min | 8-12 min | 22-48 min |
| Committee prep | 60-120 min | 15-20 min | 45-100 min |
| **Per application total** | **155-310 min** | **38-55 min** | **117-255 min** |

At a credit analyst salary of $65,000 ($31/hour), and assuming 4 applications per week, this chain saves approximately $1,200-$2,600 per month. AiBI-S tuition ROI: 1-2 months.

---

**Governance requirements:**

- Platforms: Claude for Work (enterprise account required for Steps 2-3, which handle Tier 2 financial data). Step 1 can run on any platform.
- Data tier: Steps 2-3 handle Tier 2 financial data. Enterprise data processing agreement is required before processing borrower financial statements. Confirm your institution's enterprise agreement scope before deploying Steps 2-3.
- All four steps are HITL-R. This is not optional for lending workflows.
- Adverse action: If the committee memo is used in any way that influences a denial, ECOA adverse action notice requirements apply. The chain does not generate adverse action notices — that is a separate human process.
- Model risk: This chain is an AI-assisted process improvement, not a model under SR 11-7. It does not produce a credit score, rating, or recommendation. Document this distinction in your AI Use Case Inventory.`,
    },
    {
      id: 'dwop-compliance',
      title: 'Compliance Track: Regulatory Change Response Chain',
      content: `**Workflow: Regulatory Update → Policy Gap Analysis → Training Brief → Board Report**

**Who this is for:** Compliance officers, BSA/AML analysts, and risk managers who respond to regulatory changes and must translate them into policy updates, staff training, and board reporting.

**Trigger:** A new regulatory document arrives — OCC bulletin, Federal Reserve guidance, CFPB update, FinCEN advisory, or state banking department circular.

---

**Chain Diagram:**

\`\`\`
[TRIGGER: New regulatory document]
         |
         v
[Step 1: Regulatory Summary | compliance-reg-summary-v1.md | HITL-R]
 Input: Full regulatory document (Tier 1 — public regulatory documents only)
 Output: Structured summary — requirements, effective dates, applicability scope, penalties, key definitions
         |
         v (Compliance officer reviews for accuracy and flags applicability to institution)
[Step 2: Policy Gap Analysis | compliance-gap-analysis-v1.md | HITL-R]
 Input: Regulatory summary + policy inventory (from context file, updated quarterly)
 Output: Gap matrix — each new requirement mapped to existing policy section, gap/compliant/partial flag
         |
         v (Compliance officer validates gaps, resolves ambiguous mappings, sets remediation priority)
[Step 3: Staff Training Brief | compliance-training-brief-v1.md | HITL-R]
 Input: Validated gap matrix + affected department list (from context file)
 Output: Two-page training brief — what changed, what staff must do differently, effective date, Q&A section
         |
         v
[Step 4: Board Report Section | compliance-board-section-v1.md | HITL-R]
 Input: Regulatory summary + validated gap matrix + remediation actions taken/planned
 Output: Draft board report section — regulatory change, applicability, gaps identified, remediation plan, projected completion
\`\`\`

**Terminal output:** Staff training brief + board report section, both in institutional voice.

---

**Estimated time savings:**

| Step | Manual time | With chain | Savings per regulatory event |
|------|------------|------------|------------------------------|
| Regulatory synthesis | 60-120 min | 10-15 min | 50-105 min |
| Gap analysis | 90-180 min | 15-20 min | 75-160 min |
| Training brief | 60-90 min | 10-15 min | 50-75 min |
| Board section | 45-90 min | 8-12 min | 37-78 min |
| **Per event total** | **255-480 min** | **43-62 min** | **212-418 min** |

A community bank compliance officer responding to 2-3 significant regulatory events per month recovers 7-21 hours monthly — the equivalent of $300-$900/month in salary cost at $65,000/year.

---

**Governance requirements:**

- Platforms: Perplexity (Step 1, for sourcing regulatory context), NotebookLM (Steps 2-3, with policy library loaded as source), Claude for Work (Step 4).
- Data tier: Tier 1 throughout. Public regulatory documents and your own institution's policies. No customer data enters this chain.
- All four steps are HITL-R. Compliance outputs with errors have regulatory consequences.
- Policy inventory: The gap analysis is only as good as the policy inventory it references. The context file containing your policy inventory must be current. Outdated policy inventories produce false gaps (policies that were already updated) and false compliances (policies that have been superseded). Assign a named owner to maintain the policy inventory context file.
- Board reporting: The board report section from Step 4 is a draft only. The Chief Compliance Officer or equivalent must review and sign off before it reaches the board package.`,
    },
    {
      id: 'dwop-finance',
      title: 'Finance Track: Board Reporting Chain',
      content: `**Workflow: Data Collection → Variance Analysis → Narrative Draft → Board Memo**

**Who this is for:** CFOs, controllers, financial analysts, and ALCO members who prepare monthly or quarterly board financial reports and want to accelerate the analysis-to-narrative workflow.

**Trigger:** Month-end (or quarter-end) financial data is final and available for reporting.

---

**Chain Diagram:**

\`\`\`
[TRIGGER: Final financial data available for the reporting period]
         |
         v
[Step 1: Data Validation and Organization | finance-data-prep-v1.md | HITL-R]
 Input: Key metrics for current period vs. prior period vs. budget (Tier 2 — enterprise account required)
 Output: Validated comparison table — current, prior, budget, variance (absolute and %), flagged outliers
         |
         v (Controller or CFO reviews data table for accuracy before analysis)
[Step 2: Variance Analysis | finance-variance-analysis-v1.md | HITL-R]
 Input: Validated comparison table + metric definitions context file + threshold context file
 Output: Variance commentary — explanation of significant variances, causal analysis, trend assessment
         |
         v (CFO reviews analysis for accuracy and strategic framing)
[Step 3: Narrative Draft | finance-narrative-draft-v1.md | HITL-R]
 Input: Variance analysis + board report template (from context file) + strategic priorities memo (from context file)
 Output: Draft financial narrative — executive summary, key metrics, variance explanation, outlook paragraph
         |
         v
[Step 4: Board Memo Assembly | finance-board-memo-v1.md | HITL-R]
 Input: Financial narrative + supporting tables (from Step 1) + prior board memo for continuity reference
 Output: Complete draft board financial memo — cover memo, financial tables, narrative, appendix structure
\`\`\`

**Terminal output:** Complete draft board financial memo, ready for CFO review and formatting.

---

**Estimated time savings:**

| Step | Manual time | With chain | Savings per reporting cycle |
|------|------------|------------|----------------------------|
| Data organization | 30-60 min | 5-8 min | 25-52 min |
| Variance analysis | 60-120 min | 10-15 min | 50-105 min |
| Narrative draft | 90-150 min | 15-20 min | 75-130 min |
| Memo assembly | 45-90 min | 8-12 min | 37-78 min |
| **Per cycle total** | **225-420 min** | **38-55 min** | **187-365 min** |

For a community bank CFO at $130,000/year ($62/hour), this chain saves $193-$378 per reporting cycle. Monthly reporting cycles recover AiBI-S tuition within 5-8 months.

---

**Governance requirements:**

- Platforms: Copilot in Excel (Steps 1-2), Claude for Work (Steps 3-4, enterprise account required for financial data).
- Data tier: Tier 2 throughout (non-public financial data). Enterprise data processing agreement required for all steps that handle actual financial figures.
- All four steps are HITL-R. Board financial reporting errors have regulatory and governance consequences.
- ALCO context: If this chain is used for ALCO reporting, the ALCO chair must review all outputs before distribution. ALCO minutes and materials are examined by regulators.
- Historical continuity: The prior board memo context file is important for narrative consistency. Board members notice when financial narrative tone or framing changes without explanation. The continuity reference helps maintain institutional voice across reporting cycles.
- Never automate the outlook or forward-looking statements section. Projections, guidance, and strategic outlook require CFO judgment and cannot be delegated to AI. The chain produces a placeholder in the outlook paragraph that the CFO completes manually.`,
    },
    {
      id: 'dwop-retail',
      title: 'Retail Track: Member Service Response Chain',
      content: `**Workflow: Member Inquiry → Research → Response Draft → Quality Check**

**Who this is for:** Branch managers, member services leads, and contact center managers who handle complex member inquiries and want to reduce response time while maintaining compliance-reviewed accuracy.

**Trigger:** A member inquiry arrives that requires research beyond FAQ — a complaint, a complex product question, an escalation, or a request for information that requires policy verification.

---

**Chain Diagram:**

\`\`\`
[TRIGGER: Member inquiry requiring research (email, letter, portal message, escalated call)]
         |
         v
[Step 1: Inquiry Classification and Research Brief | retail-inquiry-classify-v1.md | HITL-O]
 Input: Member inquiry text (redacted — remove account numbers, SSN, card numbers before input)
 Output: Classification (complaint / product question / policy question / escalation) + research brief (what needs to be verified to respond)
         |
         v
[Step 2: Policy and Product Research | retail-policy-research-v1.md | HITL-O]
 Input: Research brief (from Step 1) + product and policy context file
 Output: Factual basis for response — relevant policy, applicable fees, member rights, regulatory obligations
         |
         v
[Step 3: Response Draft | retail-response-draft-v1.md | HITL-R]
 Input: Inquiry text + factual basis (from Step 2) + response tone guidelines (from context file)
 Output: Draft member response in institutional voice — accurate, empathetic, compliant
         |
         v
[Step 4: Compliance and Tone Quality Check | retail-quality-check-v1.md | HITL-R]
 Input: Draft response (from Step 3) + compliance checklist (from context file)
 Output: Quality check report — tone assessment, regulatory compliance flags, factual accuracy flags, suggested edits
\`\`\`

**Terminal output:** Quality-checked draft member response, ready for staff review and send.

---

**DATA HANDLING NOTE:** Member names, account numbers, SSNs, card numbers, and other PII must never be entered into any AI platform — even those with enterprise agreements — unless the enterprise agreement explicitly covers PII processing and your institution's data classification policy permits it. Step 1 requires redaction before input. The research and drafting steps work with inquiry content, not member identity data. If a response must reference the member by name, the staff member inserts it after receiving the quality-checked draft.

---

**Estimated time savings:**

| Step | Manual time | With chain | Savings per inquiry |
|------|------------|------------|---------------------|
| Classification and research brief | 10-15 min | 2-3 min | 8-12 min |
| Policy research | 20-40 min | 3-5 min | 17-35 min |
| Response drafting | 20-45 min | 3-5 min | 17-40 min |
| Quality check | 10-20 min | 2-3 min | 8-17 min |
| **Per inquiry total** | **60-120 min** | **10-16 min** | **50-104 min** |

For a contact center handling 10 complex inquiries per day, this chain saves 500-1,040 minutes daily (8-17 hours). The institutional value is not just time — it is consistency of response quality, reduction of compliance risk, and faster member resolution.

---

**Governance requirements:**

- Platforms: Copilot in Outlook (Steps 3-4), Claude for Work (Steps 1-2 if using complex policy context).
- Data tier: Tier 1 only. All PII must be redacted before input. No account numbers, SSNs, card numbers, or member-identifying information.
- Steps 3 and 4 are HITL-R: All member-facing communications must be reviewed by a staff member before sending. This is a regulatory and member relations requirement, not just a best practice.
- Complaint handling: Inquiries classified as complaints in Step 1 trigger a different approval path — complaints require manager review, not just staff review. The quality check output should flag complaints for manager routing.
- UDAAP: All member communications are subject to UDAAP standards. The quality check context file must include UDAAP guidance for the response review step.`,
    },
  ],

  tables: [
    {
      id: 'dwop-governance-summary',
      caption: 'Governance Requirements Summary — All Five Workflows',
      columns: [
        { header: 'Track', key: 'track' },
        { header: 'Data Tier', key: 'dataTier' },
        { header: 'Platform Requirement', key: 'platform' },
        { header: 'HITL-R Steps', key: 'hitlRequired' },
        { header: 'Key Regulatory Framework', key: 'regulation' },
      ],
      rows: [
        {
          track: 'Operations',
          dataTier: 'Tier 1',
          platform: 'Copilot enterprise license',
          hitlRequired: 'Steps 2, 4',
          regulation: 'Internal governance; management reporting standards',
        },
        {
          track: 'Lending',
          dataTier: 'Tier 1 (Step 1) / Tier 2 (Steps 2-4)',
          platform: 'Enterprise DPA required for Steps 2-4',
          hitlRequired: 'All 4 steps',
          regulation: 'ECOA/Reg B; SR 11-7 model risk management',
        },
        {
          track: 'Compliance',
          dataTier: 'Tier 1',
          platform: 'Standard enterprise license sufficient',
          hitlRequired: 'All 4 steps',
          regulation: 'BSA/AML; SR 11-7; applicable regulation being monitored',
        },
        {
          track: 'Finance',
          dataTier: 'Tier 2',
          platform: 'Enterprise DPA required for all steps',
          hitlRequired: 'All 4 steps',
          regulation: 'Board governance requirements; ALCO policy',
        },
        {
          track: 'Retail',
          dataTier: 'Tier 1 (PII-redacted)',
          platform: 'Standard enterprise license sufficient',
          hitlRequired: 'Steps 3, 4',
          regulation: 'UDAAP; complaint handling requirements',
        },
      ],
    },
  ],
};

// ---- Framework 3: Vendor AI Evaluation Toolkit ----

export const vendorAiEvaluationToolkit: AdvancedFramework = {
  id: 'vendor-ai-evaluation-toolkit',
  title: 'Vendor AI Evaluation Toolkit',
  subtitle: 'Complete scoring framework, sample scorecards, red flags, and contract requirements',
  estimatedMinutes: 40,
  prerequisiteWeek: 4,
  keyOutput: 'Completed vendor scorecard for each AI platform your department has evaluated or is considering',

  sections: [
    {
      id: 'vaet-framework',
      title: 'The Five-Question Scoring Framework',
      content: `The vendor evaluation framework provides a consistent, defensible basis for recommending or declining AI platform adoption at the departmental level. It is not a replacement for your institution's full third-party risk management (TPRM) process — it is the departmental due diligence that feeds into that process.

**The five questions:**

**Question 1: Does the platform have an enterprise agreement option with data protection terms?**

This question determines whether the platform is eligible for departmental standardization. Consumer-tier AI products (ChatGPT Free, Claude.ai Free, Copilot without an enterprise license) do not have data protection terms that satisfy typical community bank data governance policies. Without an enterprise agreement, Tier 2 data must never enter the platform.

Score 4: Enterprise agreement is active and confirmed in writing. Data protection terms cover your institution's Tier 2 categories.
Score 3: Enterprise agreement is available and your institution is in the process of executing it. Tier 2 data not yet permitted but pathway is clear.
Score 2: Terms of service only. Platform can be used for Tier 1 data only.
Score 1: No enterprise agreement option exists. This platform is not eligible for departmental standardization.

**Question 2: Does the platform support shared workspaces, custom instructions, or team-level configuration?**

This question determines whether the platform can scale from one user to a department. A platform that cannot hold shared context, custom instructions, or team-accessible skill libraries requires every user to configure the platform from scratch — eliminating the institutional knowledge that makes a skill library valuable.

Score 4: Full team workspace features. Shared projects, custom instructions at the workspace level, skill files accessible to all team members, centralized management.
Score 3: Shared templates or custom GPTs (ChatGPT Teams), shared project spaces (Claude.ai Teams), or equivalent partial team features.
Score 2: Personal configuration only. Each user maintains their own skills. Skills can be shared via copy-paste but not centrally managed.
Score 1: No customization capability. Raw interface only.

**Question 3: Can the platform handle the data tier required by your department's workflows?**

This question applies your institution's data classification policy to the platform. The answer depends on both the platform's data protection terms and your institution's specific policy.

Score 4: Enterprise DPA explicitly covers all data tiers your department handles, including Tier 2. Legal and IT have reviewed and approved.
Score 3: Enterprise DPA covers most Tier 2 categories with documented exceptions. Some workflows may require additional precautions.
Score 2: Platform is cleared for Tier 1 only. Useful for research, synthesis, and public-document workflows.
Score 1: Data handling terms are unclear or inadequate. Treat as Tier 1 only and consult IT/legal before any expansion.

**Question 4: How does the platform perform on your department's specific task types?**

This question requires testing, not assumption. Run at least 5 representative task samples from your work audit through the platform before scoring this question. Score based on actual output quality, not marketing materials.

Score 4: Consistently produces "use directly" output (the Litmus Test standard) on your department's task types. Fewer than 1 in 5 runs requires substantive editing.
Score 3: Produces "light editing" output. Most runs are usable with minor corrections. 2-3 in 5 runs require only light editing.
Score 2: Produces "heavy editing" output. The platform provides a useful starting point but output requires significant work before use. More than half of runs require substantial revision.
Score 1: Output is unusable for your department's task types without complete rewriting.

**Question 5: What is the total cost per user per year, and is it justified by the time savings measured?**

This question applies the ROI discipline from Activity 4.1 to the platform cost decision. Use your actual measured time savings from Week 4, not estimates.

Score 4: Annual platform cost per user is under 10% of the measured annual time savings value for that user.
Score 3: Annual cost is 10-25% of measured savings.
Score 2: Annual cost is 25-50% of measured savings.
Score 1: Annual cost exceeds 50% of measured savings. The platform costs more than it saves — do not standardize unless strategic reasons outweigh the negative ROI.

**Scoring interpretation:**
- 18-20: Strong recommendation for departmental standardization
- 14-17: Recommend with documented conditions or upgrade path
- 9-13: Limited adoption only — specific use cases, Tier 1 only, or awaiting enterprise agreement
- Below 9: Do not standardize at this time; revisit if data protection terms or functionality improve`,
    },
    {
      id: 'vaet-scorecards',
      title: 'Sample Completed Scorecards — Three Vendor Categories',
      content: `These three completed scorecards illustrate how the framework applies to common AI vendor categories at community banks and credit unions. They are illustrative — actual scores will depend on your institution's specific enterprise agreements, data classification policies, and task testing results.

---

**Scorecard 1: Core Processor AI Features (e.g., Fiserv DNA AI, Jack Henry Banno Intelligence)**

| Question | Score | Rationale |
|----------|-------|-----------|
| Enterprise agreement with data protection | 4 | Core processor relationship already includes enterprise data processing terms. AI features are additive to an existing enterprise agreement. |
| Team workspace and shared configuration | 3 | Core processor AI features typically operate within the existing user administration framework. Shared configuration varies by platform — some allow template libraries, most do not yet offer full shared AI workspace functionality. |
| Data tier handling | 4 | Core processor data is already covered under the enterprise agreement. The AI features operate within the same data environment, so Tier 2 financial data is typically permitted. Verify specific AI feature data handling with your core processor account manager. |
| Task performance (operations/compliance tasks) | 3 | Core processor AI features excel at tasks native to their platform (transaction categorization, report generation, workflow assistance within the core system). Performance on general drafting, research, or analysis tasks is typically moderate. |
| ROI vs. cost | 3 | Core processor AI features are often bundled with existing contracts or add-on pricing. ROI depends heavily on which features are active and whether staff are trained to use them. Many institutions pay for core processor AI features they do not actively use. |
| **Total** | **17** | **Recommendation: Adopt with conditions. Prioritize activation of existing features before purchasing new platforms. Identify which features generate measurable time savings using the Activity 4.1 methodology.** |

---

**Scorecard 2: Document Management AI (e.g., Ocrolus, Encapture, nCino Document Extraction)**

| Question | Score | Rationale |
|----------|-------|-----------|
| Enterprise agreement with data protection | 4 | Document management AI vendors targeting regulated financial institutions universally offer enterprise agreements with data protection terms. Verify that the agreement covers the specific document types your institution processes (financial statements, tax returns, identification documents). |
| Team workspace and shared configuration | 4 | Document processing AI platforms are built for multi-user institutional deployment. Configuration, extraction templates, and output formats are centrally managed by administrators. |
| Data tier handling | 3 | Financial statements, tax returns, and borrower identification are Tier 2 or Tier 3 (NPPI). Enterprise agreement must explicitly cover these document types. Most document management AI vendors have designed their data handling specifically for this requirement — verify with your vendor. |
| Task performance (lending/compliance document tasks) | 4 | Purpose-built document extraction AI typically produces highly accurate structured output for the document types it is designed to handle. Field-by-field extraction accuracy is typically 95%+ for trained document types. |
| ROI vs. cost | 3 | Document management AI is typically priced per document or per seat at the enterprise level. ROI is strong for high-volume lending departments (100+ applications per month) but may be harder to justify at lower volumes. Calculate using your actual document volume from the work audit. |
| **Total** | **18** | **Recommendation: Strong adoption candidate for lending departments with meaningful application volume. TPRM review required — document AI vendors handle NPPI and require full third-party risk assessment.** |

---

**Scorecard 3: Compliance Monitoring AI (e.g., Continuity, Ncontracts, Temenos Financial Crime)**

| Question | Score | Rationale |
|----------|-------|-----------|
| Enterprise agreement with data protection | 4 | Regulatory technology vendors are among the most rigorous on data protection. Enterprise agreements are standard. Verify that the agreement covers the specific regulatory frameworks your compliance department monitors. |
| Team workspace and shared configuration | 4 | Compliance monitoring platforms are built for team use — shared dashboards, configurable alerts, role-based access, and audit trails are standard features. |
| Data tier handling | 4 | Regtech vendors that handle transaction data, member profiles, or SAR-adjacent workflows operate under the strictest data protection requirements. Most have dedicated compliance certifications (SOC 2 Type II, ISO 27001). Verify certifications are current before contract execution. |
| Task performance (compliance monitoring tasks) | 4 | Purpose-built compliance monitoring AI performs well on tasks it is designed for. Evaluate performance on your institution's specific alert patterns and false positive rates — regtech vendors should provide benchmark data from comparable institutions. |
| ROI vs. cost | 2 | Compliance monitoring AI is typically priced at the enterprise level with significant minimum commitments. ROI is harder to quantify than operational automation because the value is partly in risk avoidance rather than direct time savings. Conduct a full cost-benefit analysis including the cost of a regulatory finding that the platform would have caught. |
| **Total** | **18** | **Recommendation: Strong technical candidate. ROI calculation requires institutional risk assessment — work with your CFO and CCO on the cost-benefit analysis. Full TPRM process required before contract execution.** |`,
    },
    {
      id: 'vaet-red-flags',
      title: 'Red Flags Checklist: 10 Indicators to Reject or Pause Evaluation',
      content: `These red flags are based on common patterns in AI vendor proposals that warrant immediate pause or rejection. Any single red flag is sufficient reason to pause the evaluation pending resolution. Multiple red flags warrant outright rejection or escalation to your TPRM committee.

**Red Flag 1: "Your data trains our models."**
The vendor's terms of service or data processing agreement contains language allowing the vendor to use customer inputs for model training. This is incompatible with community bank data governance requirements for any Tier 2 data. Acceptable language: "Customer data is not used for model training without explicit customer consent." Reject any proposal that does not contain this or equivalent language.

**Red Flag 2: No enterprise data processing agreement exists.**
The vendor offers only consumer terms of service. There is no enterprise agreement pathway. This is an immediate disqualifier for any workflow involving Tier 2 data. Some vendors offer "business" tiers that are not true enterprise agreements — verify data protection terms specifically, not just pricing tier labels.

**Red Flag 3: Vendor cannot answer data residency questions.**
When asked where customer data is stored and processed, the vendor gives a vague or evasive answer ("in secure cloud environments" without specifics). Community banks in certain jurisdictions have data residency requirements. Sovereign or state-chartered institutions may have additional requirements. If the vendor cannot answer data residency questions specifically, escalate to your IT security and legal team before proceeding.

**Red Flag 4: No audit rights in the contract.**
The vendor's proposed contract does not include provisions giving your institution the right to audit the vendor's AI practices or receive audit reports (SOC 2, third-party assessments). Interagency TPRM Guidance requires that institutions maintain oversight of AI-enabled vendors. Audit rights are a prerequisite for vendor approval under this guidance.

**Red Flag 5: The vendor cannot explain how the model works.**
When asked to explain the AI model's decision-making process for outputs that will be used in banking decisions, the vendor cannot provide a conceptually sound explanation. SR 11-7 requires explainability for models used in banking decisions. A vendor that cannot explain their model is a vendor you cannot use for any decision-adjacent workflow.

**Red Flag 6: No documented incident response process.**
The vendor has no written incident response plan for AI errors, data breaches, or model failures. Ask: "What happens if your model produces an output that causes a regulatory or member harm at our institution?" If the vendor cannot describe a specific incident response process, their product is not ready for institutional use.

**Red Flag 7: Accuracy claims without methodology.**
The vendor claims a specific accuracy percentage (e.g., "98% accurate") without explaining how accuracy was measured, on what dataset, and under what conditions. Accuracy figures are meaningless without methodology. Ask for the specific benchmark conditions and compare them to your use cases. Document accuracy benchmarks in the scorecard — do not accept verbal claims.

**Red Flag 8: The contract assigns all AI error liability to your institution.**
Standard vendor contracts include indemnification clauses. Review specifically how the contract handles liability for AI-generated errors. A contract that assigns full liability for AI errors to your institution — while the vendor retains no accountability for model performance — is unacceptable. Work with legal to negotiate shared accountability for model performance.

**Red Flag 9: No version control or change notification for model updates.**
The vendor updates their AI model without notifying customers or providing advance notice. In banking, a silent model update can change output behavior in ways that affect compliance-adjacent workflows without your knowledge. Require contractual notice periods (minimum 30 days) for significant model changes, and the right to continue on the prior version during your review period.

**Red Flag 10: No reference customers in community banking.**
The vendor cannot provide reference customers who are community banks or credit unions of similar size and complexity. AI products designed for large enterprise customers may have performance, pricing, or data handling characteristics that are mismatched to community banking requirements. Require at least two community bank or credit union references with 5-10 years of experience with this vendor.`,
    },
    {
      id: 'vaet-contract-clauses',
      title: 'Required Contract Clause Language for AI Vendors',
      content: `These contract requirements apply to any AI vendor handling Tier 2 data or producing outputs used in banking operations. Share this list with your legal counsel before contract negotiation. These are minimum requirements — your institution's TPRM committee may require additional provisions.

**Data handling clauses:**

*Required:* A data processing agreement (DPA) that explicitly defines: (1) the categories of data the vendor may process; (2) the purposes for which data may be processed; (3) data retention and deletion schedules; (4) prohibitions on using customer data for model training without explicit written consent; (5) sub-processor notification requirements.

*Sample language:* "Vendor shall process Customer Data solely for the purposes of providing the Services as described in this Agreement. Vendor shall not use Customer Data for any purpose related to the training, fine-tuning, or improvement of Vendor's AI models or systems without the prior written consent of Customer."

**Model updates and change notification:**

*Required:* Contractual notice period (minimum 30 days) for any significant update to the AI models used in services covered by this agreement, with the right to continue on the prior model version during the notice period.

*Sample language:* "Vendor shall provide Customer with no less than thirty (30) days written notice prior to deploying any significant update, retrain, or version change to the AI models underlying the Services. For purposes of this Agreement, 'significant update' means any change that materially affects the accuracy, output format, or behavior of the Service for Customer's documented use cases."

**Audit rights:**

*Required:* The right to receive the vendor's most recent third-party security audit (SOC 2 Type II or equivalent) upon request, and the right to conduct or commission a security assessment of the vendor's AI systems not more than once per calendar year.

*Sample language:* "Vendor shall provide Customer with a copy of Vendor's most recent SOC 2 Type II report, or equivalent third-party security assessment, within ten (10) business days of Customer's written request. Vendor shall permit Customer or Customer's designated auditor to conduct one (1) security assessment of the Services per calendar year."

**Accuracy and performance accountability:**

*Required:* A baseline performance specification that defines the accuracy or output quality standard the vendor is contractually committed to maintaining, with remediation rights if performance falls below the standard.

*Sample language:* "Vendor represents that the Services will perform in accordance with the accuracy specifications set forth in Exhibit A. If Customer demonstrates, through documented testing using the methodology described in Exhibit A, that Service performance has materially declined below the specified accuracy standard, Vendor shall use commercially reasonable efforts to restore performance within thirty (30) days, and Customer may terminate this Agreement for cause if performance is not restored within sixty (60) days."

**Incident response:**

*Required:* Vendor must notify your institution within 24 hours of any security incident, AI error, or model failure that affects the Services or your institution's data. Vendor must provide a root cause analysis within 14 days.

**TPRM alignment:**

The following statement maps these contract requirements to the applicable regulatory framework. Include this in your TPRM documentation for any AI vendor.

"This vendor agreement has been evaluated for alignment with: (1) Interagency Guidance on Third-Party Relationships (July 2023) — risk management obligations for critical third parties; (2) SR 11-7 — model risk management requirements for AI systems used in banking decisions; (3) [Your institution's data classification policy, version and date]. The following requirements have been confirmed in the executed agreement: data processing agreement with prohibited-use provisions; model change notification (30-day minimum); audit rights (SOC 2 Type II); incident notification (24-hour)."`,
    },
  ],

  tables: [
    {
      id: 'vaet-scoring-framework',
      caption: 'Vendor Evaluation Scoring Framework — Quick Reference',
      columns: [
        { header: '#', key: 'num' },
        { header: 'Question', key: 'question' },
        { header: 'Score 4', key: 'score4' },
        { header: 'Score 3', key: 'score3' },
        { header: 'Score 2', key: 'score2' },
        { header: 'Score 1', key: 'score1' },
      ],
      rows: [
        {
          num: '1',
          question: 'Enterprise agreement with data protection?',
          score4: 'Active enterprise DPA, confirmed in writing',
          score3: 'Available; contract in process',
          score2: 'Terms of service only; Tier 1 use only',
          score1: 'No enterprise option',
        },
        {
          num: '2',
          question: 'Team workspace and shared configuration?',
          score4: 'Full team workspace; centralized admin',
          score3: 'Shared templates or partial team features',
          score2: 'Personal config only; manual skill sharing',
          score1: 'No customization capability',
        },
        {
          num: '3',
          question: 'Can handle required data tier?',
          score4: 'DPA covers all Tier 2 categories; legal-approved',
          score3: 'Covers most Tier 2 with documented exceptions',
          score2: 'Tier 1 only',
          score1: 'Terms unclear; treat as Tier 1 pending review',
        },
        {
          num: '4',
          question: 'Performance on your task types?',
          score4: '"Use directly" on 4+ of 5 test runs',
          score3: '"Light editing" on most runs',
          score2: '"Heavy editing" required on most runs',
          score1: 'Output unusable without full rewrite',
        },
        {
          num: '5',
          question: 'Cost vs. measured time savings?',
          score4: 'Cost < 10% of measured annual savings',
          score3: 'Cost 10-25% of savings',
          score2: 'Cost 25-50% of savings',
          score1: 'Cost exceeds 50% of savings',
        },
      ],
    },
  ],

  templates: [
    {
      id: 'vendor-scorecard-blank',
      title: 'Vendor Evaluation Scorecard (Blank)',
      description: 'Complete one scorecard per vendor being evaluated. Archive all completed scorecards in your TPRM documentation.',
      body: `# Vendor AI Evaluation Scorecard

**Vendor:** ___________________________
**Product:** ___________________________
**Evaluator:** ___________________________
**Date:** ___________________________
**Use case(s) being evaluated:** ___________________________

---

## Scoring

| # | Question | Score (1-4) | Rationale |
|---|----------|-------------|-----------|
| 1 | Enterprise agreement with data protection terms? | | |
| 2 | Team workspace and shared configuration? | | |
| 3 | Can handle the data tier required by our workflows? | | |
| 4 | Performance on our department's specific task types? | | |
| 5 | Cost vs. measured time savings? | | |
| | **Total** | **/20** | |

---

## Red Flags Checklist (check any that apply)

- [ ] "Your data trains our models" language in terms
- [ ] No enterprise DPA available
- [ ] Cannot answer data residency questions
- [ ] No audit rights in proposed contract
- [ ] Cannot explain model decision-making process
- [ ] No documented incident response process
- [ ] Accuracy claims without methodology
- [ ] Contract assigns all liability to our institution
- [ ] No model change notification provision
- [ ] No reference customers in community banking

**Red flags identified:** ___/10

---

## Task Performance Testing Notes

Describe 3-5 test runs performed:

1. Task: ___ | Output quality: ___ | Notes: ___
2. Task: ___ | Output quality: ___ | Notes: ___
3. Task: ___ | Output quality: ___ | Notes: ___

---

## Recommendation

- [ ] Adopt — score 14+ with 0-1 red flags
- [ ] Adopt with conditions — score 14+ with documented conditions
- [ ] Limited adoption only — score 9-13 or specific use cases only
- [ ] Do not adopt — score below 9 or 3+ red flags

**Conditions or limitations:** ___________________________

**Next step:** ___________________________
**TPRM referral required:** Yes / No
**Estimated TPRM completion date:** ___________________________
`,
    },
  ],
};

// ---- Framework 4: Team Adoption Playbook ----

export const teamAdoptionPlaybook: AdvancedFramework = {
  id: 'team-adoption-playbook',
  title: 'Team Adoption Playbook',
  subtitle: 'Five adoption barriers, champion framework, 30/60/90 day timeline, and measurement',
  estimatedMinutes: 35,
  prerequisiteWeek: 5,
  keyOutput: 'A 90-day adoption plan for your department with named champions, measurement criteria, and countermeasures for each known barrier',

  sections: [
    {
      id: 'tap-barriers',
      title: 'The Five Adoption Barriers and Countermeasures',
      content: `Building a skill library is engineering. Getting your department to use it consistently is change management. These are different disciplines, and confusing them is the most common reason departmental AI initiatives stall after a promising start.

The five adoption barriers are not unique to AI — they are the same barriers that appear in any workplace technology change. What makes AI adoption different is that the barriers are layered: a team member who has worked through skepticism may still hit fear when they first run a skill on a real file. The countermeasures below address each barrier at the point where it typically appears.

---

**Barrier 1: Skepticism — "I can do it faster manually."**

*Why it appears:* Skepticism is most common in experienced staff who have developed efficient manual processes over years of practice. They are not wrong that their manual process is fast — for them, with their expertise and pattern recognition, it often is. They are comparing their skilled manual performance to the skill's output, not to how long a new staff member would take.

*When it appears:* Before first use, and again after any run that produces below-expectations output.

*Countermeasures:*

1. Show real time savings data. The Activity 4.1 before/after methodology is designed to produce data that defeats theoretical objections. "I measured it — my manual process takes 47 minutes; the skill produces the same output in 8 minutes" is not debatable in the same way that "I think this will save time" is.

2. Acknowledge the expertise gap honestly. "You're faster than the skill at first. The skill is for when you're training someone new, or when you're out and a colleague has to do this task." This reframes the skill's value from personal productivity to institutional capability — which is the true AiBI-S frame.

3. Invite comparison rather than replacement. Run the skill on a task they've just completed manually. Compare the outputs side by side. If the skill output is genuinely inferior for their use case, find out why and fix it. If the outputs are comparable, the comparison has done the persuasion work.

---

**Barrier 2: Fear — "What if I break something?"**

*Why it appears:* Fear is most common in staff who feel accountable for quality and are uncertain about how AI errors propagate. They have seen hallucination discussed in the news. They do not trust outputs they did not produce themselves. This is healthy skepticism miscategorized as fear.

*When it appears:* Before first use. May resurface after any highly visible error.

*Countermeasures:*

1. Walk through the gotcha section before first use. The gotcha section exists for this conversation. Read through each known failure mode with the staff member. "Here's what goes wrong, and here's how you catch it." Knowing the failure modes reduces fear because the unknown is more frightening than the catalogued known.

2. Establish a low-stakes first run. The first task a staff member runs through a skill should be one where the stakes of an error are minimal. A draft email to an internal committee is lower stakes than a draft response to a member complaint. Build confidence on low-stakes tasks before applying the skill to high-stakes ones.

3. Emphasize HITL explicitly. "The skill produces a draft. You are the reviewer. Nothing goes out without your sign-off." HITL is not just a governance requirement — it is a confidence mechanism that removes the fear that the AI is acting autonomously.

---

**Barrier 3: Inertia — "I'll try it later."**

*Why it appears:* Inertia is not resistance — it is the absence of a trigger. The staff member has no objection to the skill; they simply have not found a moment where using it is obviously the right choice. Their manual process is present, familiar, and available. The skill requires a small overhead of activation that inertia makes feel large.

*When it appears:* After initial introduction. May persist indefinitely without a structured intervention.

*Countermeasures:*

1. Set up the workspace on their machine. Do not email instructions. Sit down with the staff member and configure their AI workspace together. Open the platform. Load the skill. Run through one example. The single biggest reducer of inertia is removing the configuration step.

2. Create a trigger-based reminder. Inertia dissolves when the skill is associated with a specific recurring trigger. "Every time you get a new exception report, run the triage skill before you start manual review." The trigger makes the skill adoption automatic rather than volitional.

3. The buddy system. Pair each new skill user with someone who is already using the skill consistently. The social accountability of a peer relationship reduces inertia more effectively than manager pressure.

---

**Barrier 4: Not-invented-here — "I have my own way of doing this."**

*Why it appears:* Not-invented-here is most common in highly competent, independent staff who have developed personal workflows they are proud of. They view the institutional skill as a replacement for their approach — a demotion of their expertise.

*When it appears:* After initial introduction. May intensify if the staff member feels their approach is being dismissed.

*Countermeasures:*

1. Invite their approach into the library. "Can I see how you do this? I want to understand your approach and build it into the skill." This is not manipulation — it is genuinely good skill design practice (the shadow skill discovery method, covered in the next section). Ownership creates buy-in; co-authorship creates ownership.

2. Position the skill as the backup, not the replacement. "This is how we do it when you're not available. Your approach is the gold standard; this is how we make sure the department can match it without you." This reframes the skill as protecting their expertise rather than replacing it.

3. Give them editorial credit. In the skill documentation, where appropriate, note the expert contributor. "This skill was developed with input from [name], who refined the [specific section] based on [years] of experience." Recognition converts opponents into advocates.

---

**Barrier 5: Lack of trust — "How do I know the output is accurate?"**

*Why it appears:* Trust is earned through demonstrated performance. Staff who have not yet seen the skill produce accurate, usable output consistently have no rational basis for trusting it. This barrier is not irrational — it is appropriate professional skepticism about a new tool.

*When it appears:* Before consistent use is established. May resurface after any visible error.

*Countermeasures:*

1. Show the validation data from W3-W4. The Litmus Test results and before/after comparisons are not just capstone documentation — they are trust-building evidence. Present the validation data as the basis for the skill's deployment. "I ran this skill on 15 real examples. Here's the accuracy. Here's where it struggled. Here's what I adjusted."

2. Explain the constraints. The constraints section of a well-written skill is the trust section. Every constraint says: "I anticipated this failure mode and built a guardrail." Walk through the constraints with skeptical staff members. The fact that the skill knows its own limitations is evidence of rigor.

3. Build trust incrementally. Deploy the skill first on tasks where the staff member can compare AI output to their own work before any action is taken. Visible accuracy on real tasks builds trust faster than any documentation.`,
    },
    {
      id: 'tap-champion',
      title: 'Champion Identification Framework',
      content: `Every successful departmental AI adoption has at least one internal champion — a staff member who becomes the visible, credible, enthusiastic advocate for the skill library. The AiBI-S graduate is the initial champion. But for adoption to be durable, at least one additional champion must emerge from the team.

Champions are not evangelists. They are practitioners who have personally experienced meaningful time savings, can speak specifically about the skills they use, and are willing to share their experience with skeptical colleagues. The key word is credible — a champion who has not actually used the skills extensively is worse than no champion.

**The three-part champion identification test:**

1. **They are already using the skills.** The champion candidate is in the top quartile of skill usage in the department — not just the person who is most enthusiastic about AI in theory.

2. **They can describe specific benefits.** Ask them: "Tell me about the last time you used the skill and what happened." A real champion gives a specific, recent example. A nominal champion gives a general statement.

3. **Their peers respect their judgment.** This is the hardest criterion to assess directly. Indirect signals: colleagues come to them with work questions, they are consulted informally on decisions, they have been in the department long enough to have credibility.

**Champion development:**

Once identified, champions need three things to be effective:

1. **Access to the skills and skill builder.** Champions should have write access to the skill library, not just read access. They should be authorized to propose new skills and improvements to existing ones.

2. **Regular coaching from the AiBI-S graduate.** Monthly 30-minute conversations: what are they using, what are colleagues saying, what is not working. Champions need an internal expert to escalate to.

3. **Visibility with leadership.** The AiBI-S graduate should make champions visible to the department manager and, where appropriate, senior management. "Sarah has been using the exception triage skill every day for three months. She would be the right person to talk to about expanding it to the audit team." This investment in champion visibility pays returns in retention and institutional knowledge.

**The champion-to-adoption multiplier:**

In departments with one active champion beyond the AiBI-S graduate, adoption rates are typically 2x higher than in departments where only the AiBI-S graduate is actively using the library. In departments with two or more champions, adoption rates are 3-4x higher. Investing in champion development is the highest-leverage adoption action available after the initial library launch.`,
    },
    {
      id: 'tap-timeline',
      title: '30/60/90 Day Adoption Timeline',
      content: `The 30/60/90 timeline provides a structured adoption plan from skill library launch through sustained departmental use. Adapt it to your institution's pace and culture — the milestones are more important than the specific day counts.

---

**Days 1-30: Foundation**

*Objective:* Every team member has been introduced to the skill library and has completed at least one run.

Week 1 actions:
- Announce the skill library to the department. Frame it as a tool, not a mandate. "I built this during AiBI-S. I want to show you what it does."
- Set up workspaces for all team members who will use the library. Do not email setup instructions — configure in person or via a 15-minute live session.
- Run a demo for the full team. Use a real task, not a contrived example. Show the before and after.

Week 2-3 actions:
- Schedule one-on-one 15-minute check-ins with each team member. Ask: "Have you had a chance to try it? What happened? What questions do you have?"
- Identify your first champion candidate — who is asking the most questions, using it most naturally?
- Document the first reported time savings from a team member other than yourself.

Week 4 actions:
- Publish the first usage report. "In the first month, the team ran the [skill name] 47 times. Estimated time savings: 12 hours." Real numbers from the first month establish the library as a functioning institutional asset, not an experiment.
- Identify the first improvement request. What has a team member asked for that the current skill does not do? Log it for the next library update cycle.

**30-day success metric:** 100% of team members have completed at least one run. At least one time savings report has been documented and shared.

---

**Days 31-60: Deepening**

*Objective:* Consistent use on 3+ tasks per week across the team, with the first champion actively promoting the library.

Week 5-6 actions:
- The first champion candidate receives a formal invitation to co-own the library. Give them write access. Schedule the first coaching conversation.
- Introduce the second skill in the library. Frame it as natural expansion: "Now that you've seen what [Skill 1] does, here's [Skill 2] — it does the same thing for [different task type]."
- Begin tracking usage formally. Who is using what, how often? This data is the foundation for the 60-day report.

Week 7-8 actions:
- Address the stragglers. Every team has members who have not yet adopted. Identify who they are and which barrier is active (skepticism, fear, inertia, not-invented-here, lack of trust). Apply the specific countermeasure.
- Run the first skill improvement cycle. Take the improvement requests logged in Week 4 and update the skill. Document the change in the change log. Notify the team: "Based on your feedback, here is what changed." This demonstrates that the library is a living tool, not a static document.

**60-day success metric:** At least one champion is active and co-promoting the library. Usage rate across the team is above 50% weekly. At least one skill has been updated based on team feedback.

---

**Days 61-90: Sustainability**

*Objective:* The skill library operates without requiring the AiBI-S graduate's daily involvement. The champion network can support new users and handle routine questions.

Week 9-10 actions:
- Champions run the new team member onboarding for the skill library. The AiBI-S graduate is available for questions but is not the primary trainer for new users.
- Present the 90-day usage report to department leadership. Include: total runs, time savings calculated using the Activity 4.1 methodology, number of active users, skills added or updated, and the first cross-department referral if applicable.
- Identify the third skill candidate for the library. It should come from the team — either a champion's recommendation or a frequently-expressed need.

Week 11-12 actions:
- Conduct the first formal quarterly review of the skill library. Review each skill against the ownership matrix. Verify accuracy. Update context files if policies or processes have changed.
- Document the first case study: one staff member, one skill, three months of use, specific time savings and quality observations. This case study becomes the primary onboarding document for new team members.

**90-day success metric:** The library is operating without daily involvement from the AiBI-S graduate. At least one champion can independently support new users. Leadership has been briefed and has approved continued operation. The first quarterly review is complete.`,
    },
    {
      id: 'tap-measurement',
      title: 'Measuring Actual Adoption: Proving Your Team Is Using the Skills',
      content: `The primary failure mode of departmental AI adoption programs is over-reporting usage. A manager who asks "Is everyone using the skills?" and receives "yes" — because staff believe this is the expected answer — has no information. Actual measurement requires data, not self-reporting.

**Three measurement methods, in increasing rigor:**

**Method 1: Output tracking (low overhead)**

Every task that passes through the skill chain produces a characteristic output format. Track the number of tasks completed using that format versus the total number of tasks. Example: the Operations meeting synthesis skill produces meeting records in a specific format. Count meeting records in that format divided by total meetings held. If 8 of 10 meetings produce a skill-formatted record, adoption is 80%.

This method works for skills whose outputs are stored and reviewable. It does not work well for skills whose outputs are ephemeral (verbal summaries) or highly customized.

**Method 2: Time tracking comparison (medium overhead)**

Use the Activity 4.1 methodology on an ongoing basis. Have team members log time on the target task using two categories: "manual" and "with skill." After 30 days, compare the distribution. A skill with high adoption should show a clear shift toward "with skill" time categories and lower average task duration.

This method requires team members to accurately categorize their time — which means they must know they are being measured and why. Transparent measurement ("I'm tracking this to show leadership the ROI, not to evaluate you") produces better data.

**Method 3: Platform usage analytics (high accuracy)**

Enterprise AI platforms — Copilot for Microsoft 365, Claude for Work, ChatGPT Enterprise — provide usage analytics at the administrative level. These show: which users are active, how many sessions they run, and (in some platforms) which custom instructions or GPTs they are using. Usage analytics do not tell you what tasks the skill ran on, but they confirm that the platform is being accessed consistently.

Platform analytics are the most objective measurement method but require admin access and familiarity with the platform's reporting tools. Work with your IT or M365 administrator to access the relevant reports.

**What "adoption" actually looks like:**

A team that has genuinely adopted the skill library shows four behaviors simultaneously:
1. Consistent usage at the expected frequency (tracked via output or analytics)
2. Unprompted mentions: team members reference the skill in work conversations without being asked
3. Improvement suggestions: team members request changes to existing skills or propose new ones
4. Peer teaching: experienced users explain the skills to new team members without being asked

The fourth behavior — peer teaching without prompting — is the strongest adoption signal. It means the skill library has become part of how the department talks about its work, not just a tool some people use.`,
    },
    {
      id: 'tap-shadow-skill',
      title: 'The Shadow Skill Discovery Method for Departments',
      content: `In AiBI-P, shadow AI refers to staff using AI tools without institutional knowledge — ungoverned use that creates data classification and compliance risk. AiBI-S inverts this insight: shadow AI is also an intelligence source.

The shadow skill discovery method is a structured approach to surfacing the AI use that is already happening in your department — informally, personally, and outside the institutional skill library — and converting the most valuable examples into governed institutional assets.

**Why this matters:**

By the time an AiBI-S cohort begins, the average community bank department has 2-5 staff members who are already using AI tools regularly for work tasks. They are not telling anyone. They built their own personal skills in AiBI-P or through self-directed learning. They are getting measurable value. And none of that knowledge is captured anywhere that the institution can access, maintain, or use if those staff members change roles.

The shadow skill discovery method finds these practitioners, learns from their practice, and converts their personal skills into institutional assets — with their full participation and credit.

**The four-step discovery process:**

**Step 1: The informal audit**

Do not announce a formal AI skills audit. Instead, have informal conversations with team members over two weeks. Ask: "Have you tried using any AI tools for work tasks? Even just for drafting emails?" The goal is to identify who is using AI, for what tasks, and with what results. Take notes but do not create a formal record during this phase.

**Step 2: The skills interview**

For each staff member who reveals AI usage, schedule a 30-minute skills interview. The interview has three parts:
- "Show me what you built." Ask them to demonstrate their skill or workflow in real time.
- "Tell me what it replaced." Understand the manual process and the time savings.
- "What does it not do well?" Understand the failure modes they've encountered.

The skills interview produces three outputs: a documented personal skill, a time savings estimate, and a failure mode log that belongs in the gotcha section.

**Step 3: Library candidacy evaluation**

Apply the three-step adoption evaluation to each discovered skill:
1. Frequency: Does this task happen regularly across the department, or just for this person?
2. Institutional value: Would others benefit from this skill, or is it highly personal to this individual's role?
3. Standardization potential: Can the skill be generalized without losing the expert's specific insight?

Skills that pass all three criteria are library candidates. Skills that are too personal or too specialized become reference examples in the skill documentation rather than library entries.

**Step 4: Co-authorship and attribution**

The staff member whose skill is being elevated to the library becomes a named co-author. The library entry credits them: "Original approach developed by [name]; institutionalized for departmental use in [date]." This credit is not cosmetic — it is the mechanism that converts the staff member from a potential not-invented-here resister into an invested champion.

**The shadow skill audit as a recurring practice:**

Run a shadow skill discovery process every six months. The AI tool landscape changes quickly, and new staff join departments with skills from other institutions or personal practice. A six-month audit cycle ensures that the institutional skill library remains connected to actual practitioner knowledge rather than drifting toward what was best practice two years ago.`,
    },
  ],

  tables: [
    {
      id: 'tap-barrier-quick-reference',
      caption: 'Five Adoption Barriers — Quick Reference for Department Managers',
      columns: [
        { header: 'Barrier', key: 'barrier' },
        { header: 'Diagnostic Signal', key: 'signal' },
        { header: 'When It Appears', key: 'timing' },
        { header: 'Primary Countermeasure', key: 'countermeasure' },
      ],
      rows: [
        {
          barrier: 'Skepticism',
          signal: '"I can do it faster myself"',
          timing: 'Before first use; after subpar output',
          countermeasure: 'Show measured time savings data (Activity 4.1 results)',
        },
        {
          barrier: 'Fear',
          signal: '"What if I break something?"',
          timing: 'Before first use; after visible errors',
          countermeasure: 'Walk through gotcha section; emphasize HITL requirement',
        },
        {
          barrier: 'Inertia',
          signal: '"I\'ll try it later" — indefinitely',
          timing: 'After introduction; may persist without intervention',
          countermeasure: 'Set up workspace in person; establish a recurring trigger',
        },
        {
          barrier: 'Not-invented-here',
          signal: '"I have my own way of doing this"',
          timing: 'After introduction; intensifies if expertise feels dismissed',
          countermeasure: 'Invite their approach into the library as co-author',
        },
        {
          barrier: 'Lack of trust',
          signal: '"How do I know the output is accurate?"',
          timing: 'Before consistent use; resurfaces after any visible error',
          countermeasure: 'Show W3-W4 validation data; walk through constraints',
        },
      ],
    },
  ],
};

// ---- Framework 5: Advanced Prompt Engineering for Banking ----

export const advancedPromptEngineering: AdvancedFramework = {
  id: 'advanced-prompt-engineering-banking',
  title: 'Advanced Prompt Engineering for Banking',
  subtitle: 'Conditional logic, degrees of freedom calibration, context engineering, and A/B testing at department scale',
  estimatedMinutes: 50,
  prerequisiteWeek: 3,
  keyOutput: 'An updated version of your departmental skill with conditional logic, calibrated degrees of freedom, and documented context architecture',

  sections: [
    {
      id: 'ape-beyond-rtfc',
      title: 'Beyond RTFC: The Advanced Skill Architecture',
      content: `AiBI-P teaches the RTFC framework — Role, Task, Format, Constraints — as the foundation of skill writing. Every skill you submitted for AiBI-P certification used this structure. It works. But it handles linear tasks: one input, one transformation, one output.

Advanced skill architecture extends RTFC to handle the tasks that actually define departmental AI: conditional logic (different outputs for different input types), multi-output formats (the same skill produces both a summary and a detailed table), and error handling (the skill fails gracefully when input is incomplete or out of scope).

**The extended skill anatomy:**

\`\`\`
ROLE: [Who the AI is for this skill — domain, authority level, voice]
TASK: [What the skill does — including conditional branches if applicable]
INPUT FORMAT: [What the skill expects — field by field, with type and requirements]
VALIDATION: [What the skill checks before executing — inputs that trigger an error response]
PROCESS: [Step-by-step reasoning the skill follows — explicit, not implicit]
OUTPUT FORMAT: [What the skill produces — with conditional format specifications]
CONSTRAINTS: [What the skill must not do, must always include, must always flag]
GOTCHA: [Known failure modes, with the input pattern that triggers each one]
VERSION: [Number, date, change summary]
OWNER: [Named staff member]
\`\`\`

The four additions — INPUT FORMAT, VALIDATION, PROCESS, and GOTCHA — are what distinguish a production skill from a prototype. AiBI-P required Role, Task, Format, and Constraints. AiBI-S adds the four production components that make skills reliable enough for institutional use.`,
    },
    {
      id: 'ape-conditional-logic',
      title: 'Conditional Logic in Skills',
      content: `Conditional logic allows a single skill to handle multiple input types correctly, without requiring the user to select between different versions of the same skill.

**The three patterns of conditional logic:**

**Pattern 1: Input-conditional output**

The skill produces different outputs based on a field in the input. Most commonly used when the same workflow applies to multiple asset sizes, relationship types, or document categories — but the appropriate response differs.

\`\`\`
CONDITIONAL OUTPUT:
- If the regulatory document is from the OCC or Federal Reserve AND the institution is state-chartered:
  output a supplementary note explaining that this guidance applies to national banks and that state bank equivalent guidance should be confirmed with your state regulator before applying.
- If the regulatory document is from CFPB: output a consumer protection impact section even if the primary analysis does not flag consumer impact.
- All other sources: standard format.
\`\`\`

**Pattern 2: Completeness-conditional execution**

The skill checks whether the input contains the required fields before executing the main task. If required fields are missing, the skill produces a completeness report rather than a partial analysis.

\`\`\`
VALIDATION:
Before beginning analysis, verify that the following fields are present in the input:
- Financial statement period (required)
- Prior period comparison data (required)
- Budget data (required for variance analysis)

If any required field is missing:
  Output: "INCOMPLETE INPUT — the following required fields are missing: [list]. Please provide these fields and resubmit. Analysis has not been started."
  Stop. Do not attempt analysis with incomplete data.

If all required fields are present: proceed with analysis.
\`\`\`

This pattern prevents the most common institutional failure mode: a skill that produces confident-sounding output from incomplete data, which a reviewer then uses without realizing key inputs were absent.

**Pattern 3: Flag-conditional escalation**

The skill proceeds normally for most inputs, but certain patterns trigger an escalation flag that changes the output.

\`\`\`
ESCALATION FLAGS:
During analysis, if any of the following conditions are detected, add an ESCALATION NOTE section
at the beginning of the output (before the main analysis):

- Any mention of a government investigation, subpoena, or regulatory enforcement action
- Any variance exceeding 25% from prior period on a risk-weighted asset category
- Any vendor contract with a data processing agreement expiration within 90 days

ESCALATION NOTE format:
"ESCALATION: This analysis contains an item that requires management review before distribution.
Item: [specific item]
Required action: [who must review and approve before this output can be used]"
\`\`\`

Escalation flags convert the skill from a time-saving tool into a risk management tool — one that actively catches conditions that require human judgment rather than relying on the reviewer to notice them.`,
    },
    {
      id: 'ape-degrees-of-freedom',
      title: 'Degrees of Freedom Calibration by Task Type',
      content: `Degrees of freedom is the range of valid AI output variation you are willing to accept for a given task. A high-freedom skill produces diverse, creative output — useful for research, brainstorming, and exploratory analysis. A low-freedom skill produces highly consistent, constrained output — required for compliance drafts, regulatory reports, and any output that must be consistent across users and occasions.

Calibrating degrees of freedom is not about making the AI "more creative" or "less creative." It is about matching the variation tolerance of the output to the requirements of the task.

**The calibration spectrum:**

**Tight (compliance tasks):**
- Output must be consistent regardless of which staff member runs the skill
- Format must be identical every time — same headers, same structure, same enumeration style
- Vocabulary must use defined terms — regulatory language, policy terms, institutional voice
- No improvised additions — if a section is not in the specified output format, it must not appear

Calibration signals: explicit output format with labeled sections, strict vocabulary requirements, "Do not add sections not listed above," "Use only the terms defined in [context file]."

\`\`\`
OUTPUT FORMAT (tight example):
The analysis must contain exactly four sections, in this order, using these exact headers:
1. Regulatory Requirement (one sentence per requirement, using the exact language from the source document)
2. Current Policy Response (cite the specific policy section by number)
3. Gap Assessment (one of three options only: COMPLIANT / PARTIAL GAP / FULL GAP)
4. Required Action (if COMPLIANT: "No action required." If PARTIAL or FULL GAP: numbered list of actions)

Do not add commentary, context, or caveats outside these four sections.
Do not rephrase regulatory requirements — quote them exactly.
\`\`\`

**Medium (operational tasks):**
- Output format is specified but has flexibility within sections
- Content should reflect the specific input accurately but doesn't need to match a template exactly
- Some discretion in framing and emphasis is acceptable

Calibration signals: "Following the format in [example]," "Include at a minimum [required elements]," "Adjust emphasis based on the most significant items in this input."

**Loose (research tasks):**
- Output format may vary based on what the source material warrants
- Synthesis and analysis are valued over mechanical completeness
- The skill owner trusts the model to organize the output usefully given the content

Calibration signals: "Synthesize the most important findings," "Organize your output in the way that is most useful for someone making a [specific decision]," "Flag anything surprising or worth attention beyond the standard analysis."

**Calibration by task type:**

| Task Type | Freedom Level | Reason |
|-----------|------------|--------|
| Compliance determination or flagging | Tight | Consistency required; examiner will review |
| Board or management reporting | Tight | Institutional voice; board members notice changes |
| Vendor evaluation | Medium | Structured framework + contextual judgment |
| Regulatory research | Loose | Coverage and synthesis valued over format |
| Member communication drafts | Medium | Tone consistency + contextual empathy |
| Internal meeting synthesis | Medium | Accuracy + practical organization |
| Brainstorming or exploration | Loose | Value comes from range and creativity |

**The calibration trap:**

The most common calibration error is making compliance skills too loose. A compliance officer who builds a policy gap analysis skill with loose calibration will find that the skill produces excellent analysis on some inputs and dangerously incomplete analysis on others — depending on what the model decides to emphasize that day. Loose calibration in compliance creates inconsistent output that may meet the quality standard in testing but fail in production.

When in doubt, calibrate tighter. A skill that is too tight is predictable and can be loosened. A skill that is too loose has already produced inconsistent outputs and may have already created a compliance gap.`,
    },
    {
      id: 'ape-context-engineering',
      title: 'Context Engineering: Skill vs. External Reference',
      content: `Every piece of information a skill needs to operate correctly lives somewhere. Context engineering is the discipline of deciding where that information should live — inside the skill itself, in a context file attached at runtime, or referenced externally but never entered into the AI platform.

This decision has consequences for security, maintenance, and skill reliability. Getting it wrong creates skills that either embed sensitive data inappropriately or require users to manually manage complex context file dependencies.

**The three-tier context architecture:**

**Tier A — Embedded in the skill (static, non-sensitive, infrequently changing):**
Information that is logically part of what the skill does, does not change frequently, and contains no sensitive data. Examples: regulatory framework definitions, evaluation criteria, output format specifications, vocabulary requirements.

Rule: Embed anything that would cause the skill to produce wrong output if it were missing and that does not need to be updated more than once per quarter.

\`\`\`
Embed: The five-question vendor evaluation framework (it defines the skill)
Embed: The HITL requirements for lending workflows (stable, non-sensitive)
Embed: The output format specification for the board memo (stable, institutional)
\`\`\`

**Tier B — Context file attached at runtime (dynamic, institution-specific, updated periodically):**
Information that is institution-specific, changes on a defined schedule, or needs to be updated without changing the skill itself. Examples: policy inventory, skill library index, threshold definitions, active vendor list.

Rule: Externalize anything that will need to change on a schedule, anything that differs between institutions, and anything that is large enough to make the skill file unwieldy.

\`\`\`
Externalize: Policy inventory (updated quarterly — should not require skill update)
Externalize: Exception thresholds (changed by management decision)
Externalize: Skill library index (updated every time a skill is added or changed)
Externalize: Vendor comparison data (updated when vendor contracts change)
\`\`\`

**Tier C — Never enters the AI platform:**
Customer PII, account numbers, SSNs, Tier 3 data, internal investigation records, SAR-adjacent transaction data, anything covered by attorney-client privilege. These data categories must never be entered into any AI platform regardless of enterprise agreement status. Build skills that work with anonymized, aggregated, or redacted versions of this data — or that do not require this data at all.

\`\`\`
Never embed or attach: Member account numbers, SSNs, card numbers
Never embed or attach: SAR narrative details or BSA case records
Never embed or attach: Legal counsel communications or investigation notes
Never embed or attach: Personally identifying information about specific members
\`\`\`

**Context file naming convention:**

Context files follow the same naming convention as skills:
\`\`\`
[dept]-[content-type]-context-[version].md
\`\`\`

Examples:
- \`compliance-policy-inventory-context-v3.md\`
- \`lending-policy-requirements-context-v2.md\`
- \`ops-exception-thresholds-context-v1.md\`

Context files must be stored in the same location as skill files, version-controlled, and listed in the skill library index with their current version number and last update date. An outdated context file produces as much risk as an outdated skill.

**The context dependency map:**

Every skill with context file dependencies should include a context dependency map in its documentation:

\`\`\`
CONTEXT DEPENDENCIES:
| File | Version | Required for Steps | Update Frequency | Owner |
|------|---------|-------------------|-----------------|-------|
| compliance-policy-inventory-context-v3.md | v3 | Step 2 (Gap Analysis) | Quarterly | [name] |
| compliance-escalation-contacts-context-v1.md | v1 | All steps | Annually or on change | [name] |
\`\`\`

A skill that lists its context dependencies explicitly can be audited, maintained, and handed off. A skill with undocumented context dependencies is a liability — when a context file changes, no one knows which skills are affected.`,
    },
    {
      id: 'ape-ab-testing',
      title: 'A/B Testing Methodology for Skills at Department Scale',
      content: `Individual skill iteration — running a skill, reviewing the output, adjusting the prompt, running again — is the method AiBI-P teaches. It is appropriate for personal-use skills where the developer and the user are the same person.

At department scale, skill iteration requires a more systematic approach. Multiple users are running the skill on varied inputs, observing different failure modes, and forming different opinions about what "good output" means for their use case. A/B testing at department scale captures this variation and converts it into data-driven skill improvement.

**The four-step A/B testing methodology:**

**Step 1: Define the hypothesis**

A/B testing starts with a specific, testable claim about a proposed skill change. "Version B is better" is not a hypothesis. "Version B will produce fewer instances of the incomplete-analysis failure mode identified in the October exception report" is a hypothesis.

Hypothesis format:
\`\`\`
Current skill (Version A) produces [specific failure mode] in approximately [frequency] of runs when [specific input condition].
Proposed change (Version B) adds [specific modification].
Hypothesis: Version B will reduce [failure mode] frequency to below [target] without degrading output quality on standard inputs.
\`\`\`

**Step 2: Design the test**

- **Sample size:** Minimum 10 runs per version on comparable inputs. For high-stakes skills (compliance, lending), minimum 20 runs.
- **Input selection:** Use real inputs from the past 30 days — not crafted test cases. Real inputs include the distribution of edge cases that crafted tests do not.
- **Evaluators:** Both the skill builder and at least one other team member evaluate the outputs independently. If their ratings differ by more than one point on any dimension, discuss the disagreement before averaging.
- **Blind evaluation where practical:** Evaluators should not know which runs used Version A and which used Version B until after they have rated all outputs.

**Step 3: Score each output on three dimensions**

| Dimension | What It Measures | Scale |
|-----------|-----------------|-------|
| Task completion | Did the output address everything the skill was supposed to address? | 1-4 (1: major omissions, 4: complete) |
| Output quality | Is the output usable without editing? | 1-4 (1: unusable, 4: use directly) |
| Constraint compliance | Did the output stay within the specified constraints? | 1-4 (1: multiple violations, 4: full compliance) |

Record the scores for all runs in a comparison table. Average by version.

**Step 4: Decision criteria**

Advance Version B to production if it meets all three of the following criteria:
1. Average dimension scores are equal or higher across all three dimensions (no dimension regression)
2. The specific failure mode being addressed is reduced by at least 50%
3. At least one independent evaluator who did not build Version B independently rates it as an improvement

If Version B improves the target dimension but regresses on another, identify and fix the regression before advancing.

**Documenting the test:**

The test and its results belong in the skill's change log:
\`\`\`
Version 1.1 | 2026-05-12 | Changed [specific section] to address incomplete-analysis failure mode.
A/B test: 15 runs per version, 3 evaluators. Task completion: A 3.2 → B 3.8. Output quality: A 3.4 → B 3.5.
Constraint compliance: A 3.9 → B 3.9. Failure mode frequency: A 4/15 → B 1/15.
Decision: Advance to production. Deployed 2026-05-14.
\`\`\`

**The department-scale testing advantage:**

Individual skill testing is limited by one person's use cases and judgment. Department-scale testing across 5-10 users and 20-30 test runs produces something more valuable: statistical confidence about how the skill performs across the actual distribution of tasks your department encounters.

A skill that passes individual testing may fail on edge cases that only appear at scale. A skill that passes department-scale A/B testing has been validated against the real variance of your department's work. This validation is what makes the difference between a skill you trust for critical outputs and one you use only for low-stakes drafts.`,
    },
  ],

  tables: [
    {
      id: 'ape-degrees-of-freedom-reference',
      caption: 'Degrees of Freedom Calibration Reference — Banking Task Types',
      columns: [
        { header: 'Task Type', key: 'task' },
        { header: 'Freedom Level', key: 'freedom' },
        { header: 'Key Signal', key: 'signal' },
        { header: 'Common Calibration Error', key: 'error' },
      ],
      rows: [
        {
          task: 'Policy gap analysis',
          freedom: 'Tight',
          signal: 'Exact output sections; quoted regulatory language',
          error: 'Allowing the model to paraphrase regulatory requirements',
        },
        {
          task: 'Board financial reporting',
          freedom: 'Tight',
          signal: 'Exact format; tabular-nums; no improvised sections',
          error: 'Allowing the model to add commentary outside the specified sections',
        },
        {
          task: 'Vendor evaluation',
          freedom: 'Medium',
          signal: 'Structured framework + contextual evidence',
          error: 'Making it so loose the model ignores the scoring framework',
        },
        {
          task: 'Member communication drafts',
          freedom: 'Medium',
          signal: 'Tone guidelines + factual constraints',
          error: 'Too tight: model produces robotic, unhelpful responses',
        },
        {
          task: 'Regulatory research',
          freedom: 'Loose',
          signal: 'Coverage guidance; synthesis encouraged',
          error: 'Too tight: model misses relevant material not in specified categories',
        },
        {
          task: 'Exception triage summary',
          freedom: 'Medium',
          signal: 'Standard sections + judgment on significance',
          error: 'Too loose: inconsistent identification of what counts as "significant"',
        },
        {
          task: 'Meeting synthesis',
          freedom: 'Medium',
          signal: 'Required elements (decisions, actions, owners) + flexible organization',
          error: 'Too tight: model forces all meetings into a rigid format that misrepresents some sessions',
        },
      ],
    },
  ],

  templates: [
    {
      id: 'ab-test-record-template',
      title: 'A/B Test Record Template',
      description: 'Complete this record for every A/B test before advancing a skill version to production.',
      body: `# A/B Test Record: [Skill Name]

**Skill:** ___________________________
**Current version:** ___________________________
**Proposed version:** ___________________________
**Test conducted by:** ___________________________
**Date:** ___________________________

---

## Hypothesis

Current skill (Version [A]) produces [failure mode] in approximately [X] of [N] runs when [input condition].

Proposed change: [specific change being tested]

Expected result: Version B will [specific improvement] without degrading [other dimensions].

---

## Test Design

- Runs per version: ___
- Input source: ☐ Real department inputs (past 30 days)  ☐ Constructed test cases  ☐ Mixed
- Evaluators: ___________________________
- Blind evaluation: ☐ Yes  ☐ No (reason: ___)

---

## Scoring Results

| Run | Input type | Version | Task completion (1-4) | Output quality (1-4) | Constraint compliance (1-4) | Evaluator notes |
|-----|-----------|---------|----------------------|--------------------|-----------------------------|-----------------|
| 1 | | A | | | | |
| 2 | | A | | | | |
| ... | | | | | | |
| [N+1] | | B | | | | |
| ... | | | | | | |

**Version A averages:** Task completion: ___ / Output quality: ___ / Constraint compliance: ___
**Version B averages:** Task completion: ___ / Output quality: ___ / Constraint compliance: ___

**Failure mode frequency:** Version A: ___/[N] runs | Version B: ___/[N] runs

---

## Decision

☐ Advance Version B to production (all three criteria met)
☐ Revise Version B (regression detected — see notes)
☐ Retain Version A (insufficient improvement — see notes)

**Decision rationale:** ___________________________

**Planned production date:** ___________________________
`,
    },
  ],
};

// ---- Registry: all five frameworks ----

export const ADVANCED_FRAMEWORKS = [
  multiStepSkillArchitecture,
  departmentalWorkflowPlaybook,
  vendorAiEvaluationToolkit,
  teamAdoptionPlaybook,
  advancedPromptEngineering,
] as const satisfies readonly AdvancedFramework[];

export type AdvancedFrameworkId = typeof ADVANCED_FRAMEWORKS[number]['id'];
