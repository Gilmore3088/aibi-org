// AiBI-S Week 4: Measure and Evaluate
// Phase: First Build | Estimated: 90 min live + 90-120 min assignment
// Key Output: Time savings report with before/after data, calculation, quality comparison, executive summary

import type { CohortWeek } from '../types';

export const week4: CohortWeek = {
  number: 4,
  phase: 'first-build',
  title: 'Measure and Evaluate',
  estimatedLiveMinutes: 90,
  estimatedAssignmentMinutes: 105,
  keyOutput:
    'Time savings report with at least 3 timed before/after data points, calculation worksheet, quality comparison, and one-paragraph board-presentable executive summary',
  whyThisWeekExists: `Unmeasured AI adoption is indistinguishable from AI hype. The entire value proposition of The AI Banking Institute rests on the claim that AI can measurably improve community bank operations. Week 4 is where that claim is tested with real data from the learner's own department.

Community bank leaders are skeptical of AI ROI claims for a good reason: most claims they encounter are vendor projections, not measured institutional results. The time savings report produced this week is different — it is based on the learner's institution's actual data, their department's actual workflows, and their team's actual behavior. This report is the internal champion's primary tool for advocating further AI adoption at their institution.

This week is also where many learners discover their first automation needs refinement. The output may be good enough for personal use but not for the team. The evaluation methodology provides the framework for identifying and closing that gap.`,

  keyTakeaways: [
    'Measure actual time savings with 3+ timed before/after data points per workflow',
    'Apply the four-level output quality framework to assess automation reliability',
    'Produce a one-paragraph board-presentable executive summary of measured results',
  ],

  learningGoals: [
    'Measure actual time savings from the Week 3 deployment using real before/after data — not estimates',
    'Apply the four-level output quality framework to assess automation reliability consistently',
    'Use the departmental Litmus Test to determine whether the skill works for users who did not build it',
    'Apply the vendor evaluation framework to score the primary platforms used in their role track',
    'Produce a one-paragraph executive summary that could be included in a board report or management presentation',
  ],

  sections: [
    {
      id: 'w4-why-measurement',
      title: 'Why Measurement Is Non-Negotiable',
      content: `The FDIC BankFind Suite (banks.data.fdic.gov) provides efficiency ratio data for every FDIC-insured institution. Community bank median is approximately 65% (FDIC CEIC data, 1992–2025). Every hour of proven AI-driven time savings moves that number. The key word is proven.

Most AI ROI claims circulating in the community banking market are vendor projections built on industry averages, not measured results from a specific institution's specific workflows. Your time savings report is categorically different. It is built on 3+ timed occurrences before deployment and 3+ timed occurrences after. It measures an actual workflow at an actual institution. That specificity is what makes it persuasive to a board, to a CFO, or to a regulator asking what the institution is getting from its AI investment.

**What counts as time saved:**
- Staff time eliminated: the workflow no longer needs to be done manually
- Staff time reduced: the workflow still happens but takes less time per occurrence
- Wait time eliminated: the workflow no longer requires waiting for input from another person or system

**What does not count:**
- Time "freed up" but not redirected to measurable productive use
- Vendor-estimated savings not backed by institutional timing data
- Projected savings from workflows not yet deployed

The assessment rubric has a hard gate on this dimension. A score below 3 on Measured Impact automatically fails the capstone regardless of total score. Estimated or projected time savings without actual measurement data will not pass.`,
    },
    {
      id: 'w4-quality-threshold',
      title: 'The Four-Level Output Quality Framework',
      content: `Time savings is one dimension of value. Output quality is the other. An automation that saves time but produces unreliable output has negative value — it creates risk, erodes trust, and eventually gets abandoned.

The four-level quality framework answers the fundamental question for any departmental automation: is the output good enough to use without editing?

**Use directly:** Output can be forwarded, filed, or acted on without any changes. This is the target state. When a skill consistently produces "use directly" output, measure the time saved and document it. This is the evidence the capstone requires.

**Light editing:** Output needs minor corrections — formatting adjustments, word choice changes, one or two factual details to fill in. The automation is saving meaningful time, but the skill needs iteration. Identify which component is producing the need for editing. Usually it is the output format specification or a gap in the gotcha section.

**Heavy editing:** Output structure is correct but significant content changes are needed. The automation saves some time (not starting from scratch) but the skill is underperforming. Root cause is almost always in the Context or Task components — the skill lacks enough institutional context, or the task specification is too vague for consistent output.

**Unusable:** Output would need to be completely rewritten. The automation is not saving time — it may be costing time because the user must review and discard before doing the work manually. If this persists after two rounds of skill iteration, revisit the automation candidate selection. The workflow may not be agent-shaped.

**The practical threshold:** A skill that consistently produces "light editing" output is worth keeping and iterating. A skill that produces "heavy editing" or "unusable" output more than 30% of the time needs root cause analysis before it enters the skill library in Week 5.`,
    },
    {
      id: 'w4-time-calculation',
      title: 'The Time Savings Calculation',
      content: `The calculation methodology must be consistent and conservative. Inflated projections undermine the credibility of the entire report.

**The formula:**
\`\`\`
Time saved per occurrence = Before average − After average (minutes)
Weekly time saved = Time saved per occurrence × Weekly frequency
Annual time saved = Weekly time saved × 50 weeks
Annual dollar value = Annual hours saved × (Department avg salary ÷ 2080)
\`\`\`

**Before measurement — establishing the baseline:**
Measure at least 3 actual occurrences of the manual process before deployment. Record: date, duration in minutes, who performed the task, and notes on output quality. If direct measurement was not possible before deployment, use calendar records, time-tracking tool data, or email timestamps as retrospective evidence. Label any retrospective estimates as estimates with a source note.

**After measurement — documenting the change:**
Measure at least 3 actual occurrences using the automation after deployment. Same fields. Track from when the user begins the automation process (opening the tool, preparing input) to when the output is ready to use (after any necessary review).

**Hourly rate sourcing:** Use the department's actual fully-loaded hourly cost if available. If not, use the Bureau of Labor Statistics community banking wage data for your region, or use a conservative institutional estimate labeled as such. Do not use $45/hour generic defaults without noting that it is an estimate — the board-presentable summary must be defensible if questioned.

**Conservative presentation:** Annual projections are projections, not guarantees. The executive summary should label them as projections and note the assumptions (weekly frequency, annual working weeks, hourly rate source). A conservative, sourced projection is more credible than an unsourced optimistic one.`,
    },
    {
      id: 'w4-litmus-test',
      title: 'The Departmental Litmus Test',
      content: `In AiBI-P, the Litmus Test was personal: "If you find yourself having to iterate and refine the output after the skill runs, then the skill itself needs improvement." At department scale, the test adds a second dimension: "Would a new team member produce the same quality output?"

If the answer is no — if the skill only works well when the person who built it runs it — then the skill has an implicit knowledge dependency. The builder is compensating for gaps in the skill instructions by applying institutional knowledge they have and did not document. That undocumented knowledge disappears if the builder changes roles.

**Three Litmus Test questions for departmental skills:**

**Output quality:** Does the skill produce output that can be used without editing? Pass criteria: 4 out of 5 runs produce "use directly" or "light editing" output. If this test fails, the skill needs iteration before it enters the library in Week 5.

**User independence:** Can someone who did not build the skill get the same quality output? Pass criteria: a colleague runs the skill 3 times independently and achieves the same quality level as the builder. If this fails, there is implicit knowledge in the builder's inputs or process that needs to be made explicit in the skill instructions or gotcha section.

**Consistency:** Does the skill produce consistent output across different inputs? Pass criteria: no more than 1 "heavy editing" result in 10 runs with varied inputs. If this fails, the skill's output format or branching logic needs to handle a wider range of inputs.

The Litmus Test connects directly to Assessment Rubric Dimension 2 (Skill Quality): "Can a colleague who did not build the skill maintain it?" A skill that fails user independence cannot be handed off, and a skill that cannot be handed off is not institutional-grade.`,
    },
    {
      id: 'w4-vendor-evaluation',
      title: 'Vendor Evaluation Framework',
      content: `AiBI-P surveyed six platforms. AiBI-S asks a sharper question: which platforms should your department standardize on? Standardization matters because inconsistent platform choices create training overhead, security exposure, and uneven output quality across the team.

The framework scores any AI platform on five questions designed to surface the considerations that matter for departmental adoption — not just personal preference or feature richness.

**Q1 — Enterprise agreement:** Does the platform have an enterprise agreement option with data protection terms? A platform without an enterprise DPA cannot be used with Tier 2 internal data. Score 4 if active; 3 if available but not yet signed; 2 if terms of service only; 1 if no enterprise option exists.

**Q2 — Team workspace features:** Does the platform support shared workspaces, custom instructions, or team-level configuration? Score 4 for full team workspace features; 3 for shared templates or Custom GPTs; 2 for personal configuration only; 1 for no customization.

**Q3 — Data classification fit:** Can the platform handle the data tier required by your department's workflows? Score 4 if an enterprise DPA covers Tier 2; 3 if acceptable for Tier 2 with documented precautions; 2 if Tier 1 only; 1 if data handling terms are unclear.

**Q4 — Functional performance:** How does the platform perform on your department's specific task types — based on actual Week 3-4 experience? Score 4 if it consistently produces "use directly" output; 3 if "light editing"; 2 if "heavy editing"; 1 if output is unusable for your primary task type.

**Q5 — ROI:** What is the total cost per user per year, and is it justified by the time savings measured in Activity 4.1? Score 4 if cost is under 10% of annual time savings value; 3 if 10-25%; 2 if 25-50%; 1 if cost exceeds 50% of savings.

**Maximum score: 20. Departmental recommendation threshold: 14.** A platform scoring below 14 should not be the primary departmental standard, even if individual team members find it useful.`,
    },
  ],

  tables: [
    {
      id: 'w4-quality-levels',
      caption: 'Four-Level Output Quality Framework',
      columns: [
        { header: 'Quality Level', key: 'level' },
        { header: 'Definition', key: 'definition' },
        { header: 'Implication', key: 'implication' },
      ],
      rows: [
        {
          level: 'Use directly',
          definition: 'Output can be forwarded, filed, or acted on without any changes',
          implication: 'Automation is working. Measure time saved vs. manual process.',
        },
        {
          level: 'Light editing',
          definition: 'Output needs minor corrections — formatting, word choice, one or two factual details',
          implication: 'Automation is useful but skill needs iteration. Identify which component to fix.',
        },
        {
          level: 'Heavy editing',
          definition: 'Output structure is correct but significant content changes needed',
          implication: 'Skill underperforming. Root cause likely in Context or Task components.',
        },
        {
          level: 'Unusable',
          definition: 'Output would need to be completely rewritten',
          implication: 'Fundamental skill design problem. Revisit automation candidate selection.',
        },
      ],
    },
    {
      id: 'w4-litmus-test-table',
      caption: 'Departmental Litmus Test — Three Questions',
      columns: [
        { header: 'Question', key: 'question' },
        { header: 'What It Tests', key: 'tests' },
        { header: 'Pass Criteria', key: 'criteria' },
      ],
      rows: [
        {
          question: 'Output quality',
          tests: 'Does the skill produce output that can be used without editing?',
          criteria: '4 out of 5 runs produce "use directly" or "light editing" output',
        },
        {
          question: 'User independence',
          tests: 'Can someone who did not build the skill get the same quality output?',
          criteria: 'A colleague runs the skill 3 times and achieves the same quality level as the builder',
        },
        {
          question: 'Consistency',
          tests: 'Does the skill produce consistent output across different inputs?',
          criteria: 'No more than 1 "heavy editing" result in 10 runs with varied inputs',
        },
      ],
    },
    {
      id: 'w4-vendor-framework',
      caption: 'Vendor Evaluation Framework — Five Questions (Maximum Score: 20, Threshold: 14)',
      columns: [
        { header: 'Question', key: 'question' },
        { header: 'Score 4', key: 'score4' },
        { header: 'Score 3', key: 'score3' },
        { header: 'Score 2', key: 'score2' },
        { header: 'Score 1', key: 'score1' },
      ],
      rows: [
        {
          question: '1. Enterprise agreement',
          score4: 'Enterprise agreement active',
          score3: 'Available, not yet signed',
          score2: 'Terms of service only',
          score1: 'No enterprise option',
        },
        {
          question: '2. Team workspace features',
          score4: 'Full team workspace features',
          score3: 'Shared templates or Custom GPTs',
          score2: 'Personal configuration only',
          score1: 'No customization',
        },
        {
          question: '3. Data classification fit',
          score4: 'Enterprise DPA covers Tier 2',
          score3: 'Acceptable for Tier 2 with precautions',
          score2: 'Tier 1 only',
          score1: 'Unclear data handling terms',
        },
        {
          question: '4. Functional performance',
          score4: 'Consistently "use directly" output',
          score3: '"Light editing" output',
          score2: '"Heavy editing" output',
          score1: 'Unusable for primary task type',
        },
        {
          question: '5. ROI',
          score4: 'Cost under 10% of annual savings',
          score3: 'Cost 10-25% of annual savings',
          score2: 'Cost 25-50% of annual savings',
          score1: 'Cost exceeds 50% of annual savings',
        },
      ],
    },
  ],

  activities: [
    {
      id: '4.1',
      title: 'Document Measured Time Savings',
      description: `Document the measured time savings from your Week 3 deployment. This must use actual data, not estimates.

**This is the most important submission in the course.** The assessment rubric has a hard gate on Measured Impact (Dimension 3) — a score below 3 automatically fails the capstone regardless of total score. "We think it saves about 2 hours" is not sufficient. Actual timed measurements are required.

**Five required components:**

1. **Before data** — At least 3 timed occurrences of the manual process before deployment. For each: date, duration in minutes, who performed the task, notes on output quality. If retrospective, note the source (calendar records, time-tracking data, email timestamps) and flag as reconstructed.

2. **After data** — At least 3 timed occurrences using the automation. Same fields. These should be from actual Weeks 3-4 runs. Track from when the user begins the automation process to when the output is ready to use after review.

3. **Calculation** — Time saved per occurrence, weekly projection, annual projection, and dollar value using the standard formula. Label any estimated inputs (hourly rate, frequency) and cite the source.

4. **Quality comparison** — At minimum one before/after output comparison: an example of manual output next to an example of automated output for the same input type. Qualitative assessment using the four-level framework, with evidence.

5. **Board-presentable executive summary** — One paragraph in institutional voice, conservative in claims, all numbers sourced. Format guide: "The [Department] team deployed an AI automation for [workflow] in [month]. Before deployment, the task required an average of [X] minutes per occurrence. After deployment, the same task requires an average of [Y] minutes — a reduction of [Z]%. At a frequency of [N] occurrences per week, this represents an estimated annual time savings of [H] hours, equivalent to approximately $[D] in staff time at [rate source]. Output quality has been assessed as [level] across [N] documented runs."`,
      type: 'form',
      estimatedMinutes: 105,
      submissionFormat:
        'Before data table (date, duration, who, quality notes). After data table (same fields). Calculation worksheet. Quality comparison with before/after output examples. One-paragraph executive summary.',
      dueBy: 'Before the W5 live session',
      peerReview: false,
      fields: [
        {
          id: 'workflow-automated',
          label: 'Workflow Automated (from Activity 3.1)',
          type: 'text',
          required: true,
        },
        {
          id: 'before-data',
          label: 'Before Data (3+ timed occurrences — date, minutes, who performed, quality notes)',
          type: 'textarea',
          required: true,
          minLength: 150,
          placeholder: 'Run 1: [date], [X] min, [who], quality: [notes]\nRun 2: ...\nRun 3: ...\nAverage: [X] min',
        },
        {
          id: 'after-data',
          label: 'After Data (3+ timed occurrences — same format)',
          type: 'textarea',
          required: true,
          minLength: 150,
          placeholder: 'Run 1: [date], [X] min, [who], quality: [notes]\nRun 2: ...\nRun 3: ...\nAverage: [X] min',
        },
        {
          id: 'calculation',
          label: 'Time Savings Calculation (show all steps)',
          type: 'textarea',
          required: true,
          minLength: 100,
          placeholder: 'Time saved per occurrence: [before avg] - [after avg] = [X] min\nWeekly: [X] × [frequency]/week = [Y] min\nAnnual hours: [Y] × 50 ÷ 60 = [Z] hrs\nAnnual value: [Z] × $[rate]/hr = $[amount]',
        },
        {
          id: 'quality-comparison',
          label: 'Quality Comparison (before/after output examples + quality level assessment)',
          type: 'textarea',
          required: true,
          minLength: 200,
        },
        {
          id: 'litmus-test-result',
          label: 'Litmus Test: User Independence Result',
          type: 'radio',
          required: true,
          options: [
            { value: 'pass', label: 'Pass — colleague achieved same quality in 3 independent runs' },
            { value: 'partial', label: 'Partial — colleague needed guidance on input preparation' },
            { value: 'fail', label: 'Fail — colleague could not replicate quality (skill revision needed)' },
          ],
        },
        {
          id: 'executive-summary',
          label: 'Board-Presentable Executive Summary (one paragraph)',
          type: 'textarea',
          required: true,
          minLength: 200,
        },
      ],
      completionTrigger: 'save-response',
    },
  ],

  roleTrackContent: {
    operations: {
      platformFocus: 'Measuring time savings on exception triage, meeting action tracking, or scorecard narratives',
      deepDiveTopics: [
        'Before measurement for operations: exception reports and meeting follow-ups have clear time profiles. Calendar records and email timestamps are reliable retrospective sources. Track from when the exception data arrives to when the processed summary goes out.',
        'After measurement: Power Automate flow logs provide exact timestamps for automated runs. Copilot meeting summary sessions are timestamped in Teams. Track from when the transcript is available to when the action item email is sent.',
        'Quality comparison: compare a manually produced exception summary to an automated one on completeness (did the AI catch all exceptions?), consistency (same format every time?), and action-orientation (clear owners and deadlines in every item?).',
        'Vendor evaluation for operations: Copilot in Microsoft 365 typically scores high on enterprise agreement (active in most M365 institutions) and team workspace features. Power Automate scores high on functional performance for trigger-action workflows. Evaluate both formally using the five-question framework.',
      ],
      activityVariations:
        'Operations time savings data is typically the most accessible of all five tracks because exception counts, processing times, and meeting volumes are already tracked operationally. Use existing operational metrics where they exist. For Power Automate flows, the flow run history provides exact timestamps for every automated execution.',
      skillExamples: [
        'Exception triage: before 45 min manual review → after 8 min with skill = 37 min saved × 3 reports/week = 111 min/week = 92.5 hours/year at 50 weeks',
        'Meeting action tracker: before 25 min per meeting to write follow-up → after 4 min = 21 min saved × 4 meetings/week = 87.5 hours/year',
        'Operational scorecard narrative: before 90 min per month → after 15 min = 75 min saved × 12 months = 15 hours/year',
      ],
    },
    lending: {
      platformFocus: 'Measuring time savings on loan file completeness checks, pipeline reports, or research tasks',
      deepDiveTopics: [
        'Before measurement for lending: loan file completeness checks have consistent time profiles because they follow a fixed checklist. The before measurement should isolate the completeness check step specifically, not the entire file processing workflow.',
        'After measurement: Claude Project sessions with the completeness check skill are date-and-time stamped in the project history. Track from when the document list is entered to when the condition letter draft is ready for review.',
        'Quality comparison: the completeness check quality comparison should include a false positive/false negative analysis. Did the AI flag any items as missing that were actually present (false positive)? Did it miss any actual gaps (false negative)? False negatives are more serious — they create downstream risk.',
        'Vendor evaluation for lending: Claude Projects scores high on functional performance for document analysis. ChatGPT Custom GPTs score well for research workflows. Both have enterprise agreement limitations at most community banks — this is a realistic constraint to note in the evaluation.',
      ],
      activityVariations:
        'Lending time savings requires tracking actual file processing time before and after. The most reliable approach: ask processors to note start and end time for the completeness check step on 3 files before deployment, then track 3 files after. The comparison should isolate the completeness check specifically — not the total loan origination timeline.',
      skillExamples: [
        'Loan file completeness check: before 25 min manual checklist review → after 5 min with skill = 20 min saved × 8 files/week = 139 hours/year',
        'Pipeline status report: before 60 min weekly manual assembly → after 12 min = 48 min saved × 50 weeks = 40 hours/year',
        'CRE market research: before 45 min per transaction → after 10 min = 35 min saved × 2 transactions/week = 58 hours/year',
      ],
    },
    compliance: {
      platformFocus: 'Measuring time savings on regulatory research, policy gap analysis, or staff communications',
      deepDiveTopics: [
        'Before measurement for compliance: regulatory monitoring time is variable — the volume of regulatory activity varies week to week. Use a rolling average over 4-6 weeks, not a single measurement, for the most defensible baseline.',
        'After measurement: Perplexity and Claude session timestamps provide the after data. For regulatory change monitoring, track from when the guidance is identified to when the staff memo is distributed.',
        'Quality comparison for compliance: citation accuracy is the most critical quality dimension. Compare an AI-assisted regulatory change memo to a manually produced one. Verify every citation against the primary source. A regulatory digest with an inaccurate citation is worse than no digest — it creates false confidence that could affect examination readiness.',
        'Vendor evaluation for compliance: Perplexity scores high on functional performance for regulatory research and citation quality. NotebookLM scores high on policy library search. Both typically score lower on enterprise agreement at community banks that have not yet procured enterprise licenses.',
      ],
      activityVariations:
        'Compliance time savings must pair speed data with accuracy data. Speed without accuracy is not a valid measurement for compliance workflows. If the AI-assisted output requires more verification time than the manual process saves in drafting time, the net savings may be negative — and the measurement should say so honestly. An accurate negative result is more valuable than an inflated positive one.',
      skillExamples: [
        'Regulatory change monitor: before 75 min (research + summarize + draft + distribute) → after 18 min = 57 min saved × 2 developments/week = 99 hours/year',
        'Policy gap analysis: before 3 hours per guidance document → after 45 min = 135 min saved × 1 document/2 weeks = 56 hours/year',
        'Staff compliance communication: before 30 min per communication → after 8 min = 22 min saved × 3 communications/week = 92 hours/year',
      ],
    },
    finance: {
      platformFocus: 'Measuring time savings on variance analysis narratives, ALCO materials, or board reports',
      deepDiveTopics: [
        'Before measurement for finance: variance analysis and board reporting have well-documented time requirements tied to reporting cycles. Finance staff typically have explicit calendar blocks for board prep. Use calendar records to reconstruct the before baseline if direct timing was not possible.',
        'After measurement: Claude Project session timestamps provide the after data. Track from when the budget-vs-actual data is ready to when the narrative draft is approved for inclusion in the board package.',
        'Quality comparison for finance: board-ready output standard means quality assessment is the most demanding of all five tracks. Every number in the AI-generated narrative must be verified against the source data before the comparison is valid. The quality comparison document should include a "numbers verified" notation for every figure in the sample output.',
        'Vendor evaluation for finance: Claude Projects scores high for narrative generation. Copilot in Excel scores high for in-spreadsheet analysis. The enterprise agreement question is particularly important for finance — most financial data is Tier 2, and using it in a platform without an enterprise DPA is a documented compliance risk that the vendor evaluation must surface.',
      ],
      activityVariations:
        'Finance time savings is most credible when it covers an actual reporting cycle. If the Week 3 deployment coincided with the monthly board reporting cycle, the measurement can cover the full variance analysis and narrative generation workflow. If not, focus on a measurable sub-component (narrative generation specifically) and apply the calculation to the full cycle by extrapolation — labeled explicitly as an extrapolation.',
      skillExamples: [
        'Variance analysis narrative: before 45 min for 12 variance items → after 8 min = 37 min saved × 12 months = 7.4 hours/year on this component alone',
        'Board financial package narratives: before 2 hours/month total → after 25 min = 95 min saved × 12 months = 19 hours/year',
        'ALCO scenario narrative: before 60 min per ALCO meeting → after 15 min = 45 min saved × 12 ALCO meetings = 9 hours/year',
      ],
    },
    retail: {
      platformFocus: 'Measuring time savings on member communications, FAQ responses, or branch briefings',
      deepDiveTopics: [
        'Before measurement for retail: member inquiry response time is distributed throughout the day and harder to isolate than batch workflows. Best approach: structured sampling — time 10 consecutive inquiries of the same type on a representative day before deployment, then 10 after deployment. This provides a defensible sample.',
        'After measurement: for Copilot in Outlook, track response drafting time specifically — from when the inquiry email is opened to when the draft is ready for the staff member to personalize and send. For the FAQ Custom GPT, track from question asked to answer ready for use.',
        'Quality comparison for retail: member-facing output quality is measured on accuracy (does the response answer the question correctly?), voice consistency (does it sound like the institution?), and compliance safety (no rate promises, no product misrepresentations, no unintended commitments). Have a colleague who did not build the automation rate the voice consistency — their fresh perspective is more objective.',
        'Vendor evaluation for retail: Copilot in Microsoft 365 typically scores high if the institution has an M365 enterprise agreement. ChatGPT Custom GPTs score well on functional performance but may score lower on enterprise agreement for smaller institutions that have not procured ChatGPT Enterprise.',
      ],
      activityVariations:
        'Retail time savings benefits from volume data. If a branch handles 30 member inquiries per day, even a 3-minute reduction per inquiry represents 90 minutes of daily staff time. Tracking 10 inquiries before and after deployment is sufficient for the baseline — scale the calculation to the full daily volume with an explicit "scaled from sample" notation.',
      skillExamples: [
        'Member inquiry response: before 6 min per response → after 2 min = 4 min saved × 20 inquiries/day × 250 working days = 333 hours/year',
        'Branch daily briefing: before 15 min per morning → after 3 min = 12 min saved × 250 working days = 50 hours/year',
        'Service recovery communication: before 20 min per complaint → after 6 min = 14 min saved × 5 complaints/week = 58 hours/year',
      ],
    },
  },
};
