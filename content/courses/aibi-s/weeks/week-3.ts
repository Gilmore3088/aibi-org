// AiBI-S Week 3: Build Your First Departmental Automation
// Phase: First Build | Estimated: 90 min live + 120-180 min assignment
// Key Output: Deployed automation serving the entire department

import type { CohortWeek } from '../types';

export const week3: CohortWeek = {
  number: 3,
  phase: 'first-build',
  title: 'Build Your First Departmental Automation',
  estimatedLiveMinutes: 90,
  estimatedAssignmentMinutes: 150,
  keyOutput:
    'One automation deployed and in use by at least one colleague, with skill file, context files, data classification statement, and 3 documented test runs',
  whyThisWeekExists: `This is the hardest week of the course. In AiBI Foundations, the learner built a skill for personal use. The margin of error was high — if the skill produced imperfect output, only the learner saw it. In Week 3, the learner deploys something that colleagues will use. The margin of error drops to medium. The skill must be robust enough that someone who did not build it can run it and get consistently acceptable output.

The week also introduces advanced skill patterns that were not covered in AiBI Foundations: multi-step skills, skill chaining, and context engineering at institutional scale. These patterns are what separate a personal productivity tool from a departmental asset.`,

  learningGoals: [
    'Build a complete institutional-grade skill using the extended skill anatomy with gotcha section and data classification enforcement',
    'Apply multi-step skill architecture patterns appropriate to the workflow being automated',
    'Deploy the skill so that at least one colleague can use it — not just the builder',
    'Understand the 5 Skill Killers at institutional scale and how each one affects colleagues differently from how they affect the builder',
  ],

  sections: [
    {
      id: 'w3-advanced-architecture',
      title: 'Advanced Skill Architecture',
      content: `AiBI Foundations introduced the RTFC framework (Role, Task, Format, Constraint) and the extended skill anatomy (name, description, instructions, output format, gotcha section, constraints). AiBI-S builds on this foundation with patterns for institutional-grade skills that need to work for people who did not build them.

**Why architecture matters more at the departmental level**

A personal skill can have rough edges. You know where the edges are, and you smooth them out manually on each run. A departmental skill cannot rely on the builder being present for every run. The architecture must handle the edge cases automatically — through the gotcha section, through explicit constraints, through clear instructions that anticipate the inputs a new user might provide.

The skill architecture questions change at AiBI-S:
- Not "does this work for me?" but "does this work for someone who has never seen the internals?"
- Not "what is the ideal input?" but "what happens when someone gives it a non-ideal input?"
- Not "what does good output look like?" but "how does a user know whether to use the output directly, edit it, or flag it for review?"`,
    },
    {
      id: 'w3-multi-step',
      title: 'Multi-Step Skills and Skill Chaining',
      content: `A personal skill typically does one thing: summarize a meeting, draft a response, analyze a document. A departmental skill often needs to do multiple things in sequence: receive input, classify it, apply the appropriate template, produce formatted output, and flag items that require human review.

**Single-step skills** work when there is one input, one output, and the transformation is consistent every time. A meeting summary skill is single-step: transcript in, structured summary out.

**Sequential multi-step skills** work when input flows through two or three processing stages before producing output. A loan file completeness check is sequential: document received, checklist applied stage by stage, gap list produced, condition letter drafted from the gap list. Each stage feeds the next.

**Branching multi-step skills** work when the output format depends on how the input is classified. An exception triage skill is branching: exception received, classified by type (operational, compliance, fraud indicator), routed to the appropriate response template based on classification. The classification result determines which branch executes.

**Skill chaining** works when the output of Skill A is designed to become the input of Skill B. A regulatory monitoring chain might look like: Skill A researches a new regulatory development and produces a structured summary → that summary becomes the input to Skill B which assesses impact against current institutional policies → that impact assessment becomes the input to Skill C which drafts a staff communication. Each skill is independent but designed to hand off cleanly.

**The practical rule for choosing a pattern:** Start with the simplest pattern that produces acceptable output. Single-step is easier to build, easier to maintain, and easier for new users to understand. Upgrade to multi-step only when the single-step approach produces output that requires significant manual restructuring before it can be used.`,
    },
    {
      id: 'w3-skill-killers',
      title: 'The 5 Skill Killers at Institutional Scale',
      content: `AiBI Foundations introduced the 5 Skill Killers from the AIDB pedagogy. At the personal level, each killer creates friction for the builder. At the institutional level, each killer creates failures for colleagues who did not build the skill and cannot diagnose what went wrong.

**Killer 1: Description does not trigger properly.** At the personal level, you run the wrong skill and notice immediately. At the institutional level, a colleague activates the wrong skill for their task because the description was ambiguous — and they may not realize the mismatch until after they have used the output.

**Killer 2: Over-defining the process.** At the personal level, over-specification makes output rigid when you wanted flexibility. At the institutional level, team members cannot adapt the skill to their specific sub-tasks because every step is hardcoded. The skill becomes a bottleneck rather than an accelerator.

**Killer 3: Stating the obvious.** At the personal level, unnecessary instructions waste tokens. At the departmental level, a skill used 20 times per day by 5 people accumulates wasted tokens from unnecessary context. At scale, this becomes a cost issue — and in Claude Projects, it consumes context window that could hold more useful institutional information.

**Killer 4: Missing gotcha section.** This is the most costly killer at institutional scale. At the personal level, you encounter a failure mode and fix it on the fly. At the departmental level, a colleague encounters the same failure mode, does not recognize it as a skill limitation, and submits or acts on flawed output. The gotcha section is the institutional memory of what goes wrong. Every failure mode you discover during testing belongs in it.

**Killer 5: Monolithic blob.** At the personal level, a long skill file is manageable because you know where everything is. At the departmental level, a colleague trying to maintain or update the skill cannot find the component they need to change. Modular structure — separate sections clearly labeled, references in separate files — is a handoff requirement, not a preference.`,
    },
    {
      id: 'w3-context-engineering',
      title: 'Context Engineering for Departmental Workflows',
      content: `Context engineering is the practice of selecting, structuring, and maintaining the background information that an AI skill needs to produce institutionally accurate output. At the personal level, context is "what I need the AI to know about me." At the departmental level, context is "what the AI needs to know about how this department works."

The four context layers for a departmental skill:

**Institution layer:** The foundational context that applies to every skill in the institution. Name, charter, asset size, regulators, strategic priorities. This layer is set once in the departmental workspace (Week 2) and inherited by all skills.

**Department layer:** The context specific to how this department operates. Mission, team structure, key processes, technology stack. Also set in the workspace — skills reference it rather than repeating it.

**Workflow layer:** The context specific to this skill. Process steps, input/output formats, quality standards, approval requirements. This layer lives in the skill file itself and is updated whenever the workflow changes.

**Regulatory layer:** The applicable frameworks for this workflow. Which regulations constrain the output, what disclosures are required, what outputs must include human review flags. For most community banking workflows, this layer draws on the AiBI Foundations Module 1 framework knowledge already embedded in the workspace regulatory context block.

**Why layering matters:** A skill file should not repeat context that already lives in the workspace. If the institution name appears in every skill file, it needs to be updated in every skill file when anything changes. If it lives in the workspace and skills reference it, one update propagates everywhere. This is the institutional-scale version of the "state the obvious" killer — except at the context level rather than the instruction level.`,
    },
    {
      id: 'w3-data-classification',
      title: 'Data Classification Enforcement in Departmental Skills',
      content: `In AiBI Foundations, data classification was a personal awareness exercise. You learned the three tiers and applied them to your own inputs consciously. In AiBI-S, data classification becomes an enforcement mechanism built into the skill itself — because your colleagues may not have the same intuitive awareness you developed during AiBI Foundations.

**Tier 1 — Public information:** No restrictions. Can be used freely in any AI platform. Market data, published regulatory guidance, public financial statements, press releases.

**Tier 2 — Internal non-public information:** Can be used in AI platforms with enterprise agreements in place. Internal processes, procedures, performance metrics, non-public strategic plans. Skill documentation must specify "Tier 2 data handling" and include redaction instructions for any output that will leave the department. Most operational, lending, compliance, and finance workflows involve Tier 2 data.

**Tier 3 — Restricted information:** Never entered into any external AI platform. Member PII (names, SSNs, addresses, account numbers), transaction data, examination findings, board minutes, SAR information. Skills that operate near Tier 3 workflows must include an explicit constraint: "Do not include member names, account numbers, SSNs, or any data that identifies a specific individual or account." If the workflow requires Tier 3 data, the skill processes a redacted version — and the documentation must specify exactly what to redact before inputting.

**The enforcement principle:** Do not rely on users remembering the rules. Embed the rules in the skill. A constraint that reads "Input must be redacted of all member names, account numbers, and transaction identifiers before use" tells the user exactly what to do before they run the skill — and creates a documented record that the skill was designed with data handling in mind.`,
    },
  ],

  tables: [
    {
      id: 'w3-skill-patterns',
      caption: 'Multi-Step Skill Patterns — When to Use Each',
      columns: [
        { header: 'Pattern', key: 'pattern' },
        { header: 'When to Use', key: 'when' },
        { header: 'Banking Example', key: 'example' },
      ],
      rows: [
        {
          pattern: 'Single-step',
          when: 'One input, one output, consistent transformation every time',
          example: 'Meeting summary from Teams transcript',
        },
        {
          pattern: 'Sequential multi-step',
          when: 'Input flows through 2-3 processing stages, each feeding the next',
          example: 'Loan file received → completeness check → gap list → condition letter drafted',
        },
        {
          pattern: 'Branching multi-step',
          when: 'Output format depends on how the input is classified',
          example: 'Exception received → classified by type → routed to appropriate response template',
        },
        {
          pattern: 'Skill chaining',
          when: 'Output of Skill A is designed to become the input of Skill B',
          example: 'Regulatory change researched (Skill A) → impact assessed (Skill B) → staff communication drafted (Skill C)',
        },
      ],
    },
    {
      id: 'w3-skill-killers',
      caption: 'The 5 Skill Killers: Personal Impact vs. Institutional Impact',
      columns: [
        { header: 'Killer', key: 'killer' },
        { header: 'Personal Impact (AiBI Foundations)', key: 'personal' },
        { header: 'Institutional Impact (AiBI-S)', key: 'institutional' },
      ],
      rows: [
        {
          killer: '1. Description does not trigger properly',
          personal: 'You run the wrong skill and notice immediately',
          institutional: 'A colleague activates the wrong skill — and may not realize until after acting on flawed output',
        },
        {
          killer: '2. Over-defining the process',
          personal: 'Output is rigid when you wanted flexibility',
          institutional: 'Team members cannot adapt the skill to sub-tasks — it becomes a bottleneck',
        },
        {
          killer: '3. Stating the obvious',
          personal: 'You waste tokens on instructions the model does not need',
          institutional: 'At 20 runs per day across 5 people, unnecessary context accumulates into a real cost and context window problem',
        },
        {
          killer: '4. Missing gotcha section',
          personal: 'You encounter a failure mode and fix it on the fly',
          institutional: 'A colleague encounters the same failure mode, does not recognize it, and acts on flawed output',
        },
        {
          killer: '5. Monolithic blob',
          personal: 'Long file is manageable because you know where everything is',
          institutional: 'Colleague trying to maintain the skill cannot find the component to change — handoff fails',
        },
      ],
    },
    {
      id: 'w3-data-tiers',
      caption: 'Data Classification Enforcement in Departmental Skills',
      columns: [
        { header: 'Tier', key: 'tier' },
        { header: 'Definition', key: 'definition' },
        { header: 'Departmental Skill Rule', key: 'rule' },
      ],
      rows: [
        {
          tier: 'Tier 1: Public',
          definition: 'Information available to anyone — published data, regulatory guidance, press releases',
          rule: 'No restrictions. Use freely in any AI platform.',
        },
        {
          tier: 'Tier 2: Internal',
          definition: 'Non-public institutional information — processes, metrics, internal communications',
          rule: 'Permitted in platforms with enterprise agreements. Skill documentation must specify Tier 2 handling and include redaction instructions for output that leaves the department.',
        },
        {
          tier: 'Tier 3: Restricted',
          definition: 'Member PII, account data, transaction data, examination findings, SAR information, board minutes',
          rule: 'Never entered into any external AI platform. Skills must include explicit constraint: what to redact before input. Skill processes redacted version only.',
        },
      ],
    },
  ],

  activities: [
    {
      id: '3.1',
      title: 'Build and Deploy One Departmental Automation',
      description: `Select the highest-scoring feasible workflow from your Work Audit (Activity 1.1). Build a complete skill that automates it at departmental scale and deploy it so at least one colleague can use it.

**Requirements:**

1. **Skill file** — Complete extended skill anatomy: name, description (trigger format per RTFC), instructions, output format, gotcha section with at least 2 documented failure modes, constraints including data handling rules. Skill file under 500 lines. References in separate files if needed.

2. **Context files** — All relevant context documents assembled: institution context, department context, any templates or reference materials the skill needs that are not already in the departmental workspace. Label each file clearly.

3. **Data classification statement** — One paragraph explicitly documenting: what data tier this skill handles, what must be redacted before input, what restrictions apply to the output, and whether any component of the workflow requires human review before the output is acted on.

4. **Deployment** — The skill is running and accessible. At least one colleague has used it (not just the builder). "Deployed" means: the skill is available in a shared workspace, a shared folder, or a location where authorized team members can find and activate it. A skill that only exists in your personal account is not deployed.

5. **Test run documentation** — At least 3 runs with different inputs documented. For each run: the input provided (redacted of any Tier 3 data), the output received, and a quality assessment using the four-level scale: Use directly / Light editing / Heavy editing / Unusable.

**Critical timeline constraint:** This automation must be running before Week 4 begins. Week 4 measures the results. If the skill is not deployed and in use by the time the Week 4 session starts, the learner cannot complete the time savings measurement required for the capstone assessment.`,
      type: 'builder',
      estimatedMinutes: 150,
      submissionFormat:
        'Skill file (.md), context files, data classification statement (.md), deployment evidence (screenshot of colleague using the workspace or written confirmation from the colleague), and 3 test run documents (each: input summary, output excerpt, quality assessment).',
      dueBy: 'Before the W4 live session',
      peerReview: false,
      fields: [
        {
          id: 'workflow-selected',
          label: 'Workflow Selected from Work Audit (name + total score)',
          type: 'text',
          placeholder: 'e.g. Exception report triage — score 10',
          required: true,
        },
        {
          id: 'skill-name',
          label: 'Skill Name (follow naming convention: [dept]-[function]-v[n].md)',
          type: 'text',
          placeholder: 'e.g. ops-exception-triage-v1.md',
          required: true,
        },
        {
          id: 'skill-pattern',
          label: 'Skill Architecture Pattern Used',
          type: 'select',
          required: true,
          options: [
            { value: 'single-step', label: 'Single-step' },
            { value: 'sequential-multi-step', label: 'Sequential multi-step' },
            { value: 'branching-multi-step', label: 'Branching multi-step' },
            { value: 'skill-chaining', label: 'Skill chaining' },
          ],
        },
        {
          id: 'data-tier',
          label: 'Data Tier This Skill Handles',
          type: 'select',
          required: true,
          options: [
            { value: 'tier-1', label: 'Tier 1 — Public only' },
            { value: 'tier-2', label: 'Tier 2 — Internal non-public' },
            { value: 'tier-2-with-tier-3-adjacent', label: 'Tier 2 with Tier 3 adjacent (redaction required)' },
          ],
        },
        {
          id: 'gotcha-summary',
          label: 'Gotcha Section Summary (list 2+ documented failure modes)',
          type: 'textarea',
          required: true,
          minLength: 100,
        },
        {
          id: 'deployment-evidence',
          label: 'Deployment Evidence (describe how colleague accessed and used the skill)',
          type: 'textarea',
          required: true,
          minLength: 100,
        },
        {
          id: 'test-run-1',
          label: 'Test Run 1: Input summary, output excerpt, quality assessment',
          type: 'textarea',
          required: true,
          minLength: 150,
        },
        {
          id: 'test-run-2',
          label: 'Test Run 2: Input summary, output excerpt, quality assessment',
          type: 'textarea',
          required: true,
          minLength: 150,
        },
        {
          id: 'test-run-3',
          label: 'Test Run 3: Input summary, output excerpt, quality assessment',
          type: 'textarea',
          required: true,
          minLength: 150,
        },
      ],
      completionTrigger: 'save-response',
    },
  ],

  roleTrackContent: {
    operations: {
      platformFocus: 'Copilot in Microsoft 365, Power Automate for trigger-action workflows',
      deepDiveTopics: [
        'Exception report triage: structuring a skill that classifies exceptions by type (operational, compliance, fraud indicator) and routes them to the correct response template',
        'Meeting action tracker: processing a Teams transcript into structured action items with owners, deadlines, and escalation flags',
        'Operational scorecard narrative: converting raw monthly metrics into a structured narrative for board reporting — the output format must match what management already expects',
        'Power Automate for deployment: using Power Automate flows to trigger AI skill runs automatically when an email arrives, a form is submitted, or a SharePoint document is updated',
      ],
      activityVariations:
        'Operations automation should be a workflow the entire team touches regularly. The exception report triage and meeting action tracker are the highest-value candidates for most operations teams because they are daily, time-consuming, and highly standardized. The skill should be deployed in a shared Claude Project or through a Power Automate flow accessible to the team — not in a personal account.',
      skillExamples: [
        'Exception report triage: raw exception data pasted in, skill classifies by type (operational risk / BSA flag / processing error), produces prioritized summary with recommended owner assignments',
        'Meeting action tracker: Teams meeting transcript pasted in, skill extracts all action items with stated owners and deadlines, produces formatted follow-up email draft',
        'Operational scorecard narrative: 12 metrics pasted from Excel, skill produces narrative commentary explaining trends, flagging variances over 10%, and noting items requiring management attention',
        'Document routing skill: incoming document type identified from header, skill produces routing recommendation with appropriate workflow steps for that document type',
      ],
    },
    lending: {
      platformFocus: 'Claude Projects for document analysis, ChatGPT for research-based workflows',
      deepDiveTopics: [
        'Loan file completeness check: building a skill that compares uploaded document summaries against the institution checklist and produces a structured gap list',
        'Pipeline status report: processing a raw CRM export into a stage-by-stage pipeline summary with conversion rates and month-over-month comparison',
        'Credit policy check: evaluating a loan scenario description against institution credit policy, flagging exceptions, and identifying required documentation for any exception approval',
        'Condition letter drafting: converting a gap list into a formatted condition letter using the institution template language',
      ],
      activityVariations:
        'Lending automation should address a workflow the team runs at least weekly. The loan file completeness check is the highest-value candidate for most lending teams — it is run on every file, takes meaningful manual time, and has high standardization value because the checklist never changes. Critical constraint: borrower PII must never enter the skill. The completeness check skill works on a checklist comparison, not on actual borrower data.',
      skillExamples: [
        'Loan file completeness check: list of documents received pasted in, skill compares against 47-point checklist, produces gap list sorted by required vs. conditional items with suggested condition letter language',
        'Pipeline status report: CRM export pasted in (redacted of borrower names), skill produces stage-by-stage summary with counts, dollar volumes, and month-over-month change',
        'Credit policy check: loan scenario described (property type, LTV, DSCR, borrower profile in general terms), skill identifies policy exceptions and documentation requirements',
        'Market research synthesis: CRE submarket and property type specified, skill produces structured underwriting context from publicly available market data',
      ],
    },
    compliance: {
      platformFocus: 'Perplexity and NotebookLM for research workflows, Claude for analysis',
      deepDiveTopics: [
        'Regulatory change monitor: building a skill that takes a regulatory development as input and produces a structured impact assessment against the institution policy inventory',
        'BSA/AML SAR narrative assistance: structuring a skill that processes redacted transaction timelines and produces structured narrative drafts with mandatory human review flags',
        'Policy gap analysis: comparing new regulatory guidance against the current policy set and producing a structured remediation recommendation',
        'Examination preparation: organizing scattered documentation into structured examination response packages using an institution-specific format',
      ],
      activityVariations:
        'Compliance automation must be built with the strictest data handling discipline of all five tracks. The recommended first automation is the regulatory change monitor — it handles Tier 1 and Tier 2 data only (regulatory guidance is public, institutional policy is Tier 2), produces high-value output, and is used weekly by most compliance teams. SAR narrative assistance is higher-value but higher-risk — it should only be built after the learner has strong command of the data handling rules and the mandatory human review constraint.',
      skillExamples: [
        'Regulatory change monitor: regulatory development summarized (Perplexity research output pasted), skill assesses impact on each affected policy area and produces structured memo with recommended policy changes',
        'Policy gap analysis: new guidance text pasted alongside current policy text (both Tier 2 or public), skill identifies gaps, inconsistencies, and areas requiring remediation',
        'BSA/AML narrative draft: transaction timeline entered in fully redacted form (no names, no account numbers, no SSNs — dates and amounts only), skill produces structured SAR narrative draft with [HUMAN REVIEW REQUIRED] at the top and [BSA OFFICER APPROVAL REQUIRED BEFORE FILING] at the bottom',
        'Staff compliance communication: regulatory change summary pasted, skill drafts a plain-language staff communication explaining the change, what it means for their work, and the effective date',
      ],
    },
    finance: {
      platformFocus: 'Claude Projects for narrative, Copilot in Excel for data processing',
      deepDiveTopics: [
        'Variance analysis narrative: building a skill that converts a budget-vs-actual table into a structured narrative with explanations for material variances and an executive summary',
        'Efficiency ratio analysis: processing quarterly financial data into trends, peer context (using publicly available FDIC data), and improvement opportunity identification',
        'ALCO scenario narrative: converting a rate scenario data table into a structured balance sheet impact analysis with conservative projections',
        'Board report executive summary: assembling departmental metrics into a concise executive narrative in the voice the board expects',
      ],
      activityVariations:
        'Finance automation should address the most time-consuming narrative generation task the team runs regularly. The variance analysis narrative is the highest-value candidate for most finance teams — it is produced monthly, takes 30-60 minutes of writing time, and has high standardization value because the format never changes. All financial data entered should be current-period aggregate data, not member-level data — no individual loan or deposit account details enter any AI platform.',
      skillExamples: [
        'Variance analysis narrative: budget-vs-actual table pasted (aggregate institutional data, no account-level detail), skill produces structured narrative with explanation for each variance over $50K or 5%, plus executive summary paragraph',
        'Efficiency ratio analysis: quarterly income and expense data pasted, skill calculates efficiency ratio trend, produces narrative commentary, and identifies the 2-3 expense categories with the highest improvement opportunity',
        'ALCO rate scenario narrative: scenario data table pasted (rate shock assumptions and projected NII impact), skill produces structured analysis narrative with balance sheet implications labeled as projections',
        'Board financial package summary: key metrics from the monthly package entered, skill produces 200-word executive summary in institutional voice suitable for inclusion in board materials',
      ],
    },
    retail: {
      platformFocus: 'Copilot in Outlook/Teams for communications, Claude for template-driven outputs',
      deepDiveTopics: [
        'Member inquiry response library: building a skill that classifies inquiry types and generates response drafts calibrated to institution voice with appropriate placeholder fields',
        'Branch daily briefing: assembling calendar events, pending items, and operational metrics into a structured morning brief for branch managers',
        'Service recovery communication: processing complaint details (redacted) through a structured empathy-resolution-next-steps framework',
        'Staff communication drafts: generating internal communications for policy changes, product launches, and service updates in a consistent institutional voice',
      ],
      activityVariations:
        'Retail automation should address a communication workflow the team handles daily. The member inquiry response library is the highest-value candidate for most retail teams — branch staff answer the same questions dozens of times per day, consistent responses reduce errors, and a well-built response skill reduces the time per response from 5-7 minutes (looking up information, drafting) to under 90 seconds. Critical: all member-facing drafts must use placeholder language for any identifying information — staff fill in the actual names and details before sending.',
      skillExamples: [
        'Member inquiry response library: inquiry type selected from menu (CD rates / savings products / loan options / fee disputes / account access), skill produces a complete draft response in institution voice with [MEMBER NAME] and [SPECIFIC DETAIL] placeholders',
        'Branch daily briefing: date, scheduled appointments count, pending follow-up count, and key operational metrics pasted, skill produces structured 1-page morning brief',
        'Service recovery communication: complaint type and resolution offered described (no member name or account number), skill produces draft communication with empathy opening, explanation, resolution, and next-steps closing in institution voice',
        'New product launch staff communication: product details pasted, skill produces internal announcement with key features, rate details, talking points for member conversations, and FAQs',
      ],
    },
  },
};
