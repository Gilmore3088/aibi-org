// AiBI-S Week 4 — Measure and Evaluate
// Phase: First Build | Week 4 of 6

import type { CohortWeek } from '../types';

export const week4: CohortWeek = {
  number: 4,
  phase: 'first-build',
  title: 'Measure and Evaluate',
  estimatedLiveMinutes: 90,
  estimatedAssignmentMinutes: 105,
  whyThisWeekExists:
    'Automation without measurement is theater. W4 converts the W3 deployment into evidence — time savings with before/after data, output quality evaluation, and a documented ROI calculation. This measurement becomes the business case for scaling in W5–W6 and for presenting to leadership after certification.',
  learningGoals: [
    'Calculate time savings from the W3 automation using before/after timing data',
    'Apply a structured output quality evaluation rubric to assess automation reliability',
    'Identify the top enhancement to the W3 automation based on evaluation findings',
    'Produce a time savings report suitable for sharing with department leadership',
  ],
  keyOutput: 'Time savings report with before/after data, output quality evaluation, and enhancement roadmap',
  sections: [
    {
      id: 'w4-s1',
      title: 'Why Measurement Is Non-Negotiable',
      content: `Community bank leaders are skeptical of AI ROI claims for a good reason: most of the claims they encounter are vendor projections, not measured institutional results. Your time savings report is different — it is based on your institution's actual data, your department's actual workflows, and your team's actual behavior.

This report is one of the most valuable documents you will produce in this course. Use it to:

- **Justify continuing.** Leadership support for AI adoption at community institutions correlates strongly with demonstrated savings. Anecdotal reports do not move budgets. Measured data does.
- **Set realistic expectations.** You may find the savings are smaller than expected. That is useful information — it tells you whether to invest in optimizing this automation or move to a different candidate.
- **Calibrate quality thresholds.** Measuring output quality forces you to articulate what "good enough" means for your department. This becomes the standard for evaluating future automations.

The FDIC BankFind Suite (banks.data.fdic.gov) provides efficiency ratio data for every FDIC-insured institution. Community bank median is approximately 65% (FDIC CEIC data, 1992–2025). Every hour of proven AI-driven time savings moves that number in the right direction.`,
    },
    {
      id: 'w4-s2',
      title: 'The Time Savings Calculation',
      content: `The time savings calculation uses your W3 baseline data. Here is the framework:

**Step 1: Confirm baseline.**
From your W3 submission: how many minutes did this workflow take without automation? How many times per week (or month) does it run?

**Step 2: Measure with automation.**
Time the workflow with automation for at least 3 runs. Calculate the average time per run, including setup time (opening the tool, copying in context) and review time (editing the output).

**Step 3: Calculate savings.**
Weekly savings = (baseline time - automated time) x runs per week

**Step 4: Annualize.**
Annual hours saved = weekly savings x 50
(50 working weeks, accounting for holidays and PTO)

**Step 5: Apply hourly rate.**
Use your fully-loaded hourly rate or the standard $35-$55/hour proxy for community bank professional staff. If you do not know the figure, use $45/hour as a conservative default.

Annual value = annual hours saved x hourly rate

**What counts as time saved:**
- Staff time eliminated (the workflow no longer needs to be done)
- Staff time reduced (the workflow still happens but takes less time)
- Wait time eliminated (the workflow no longer requires waiting for someone else)

**What does not count:**
- Time "freed up" but not redirected to measurable productive use
- Vendor-estimated savings that are not backed by your actual timing data`,
    },
    {
      id: 'w4-s3',
      title: 'Output Quality Evaluation',
      content: `Time savings is one dimension of value. Output quality is the other. An automation that saves time but produces unreliable output has negative value — it creates risk.

The AiBI-S output quality rubric has four dimensions:

**1. Accuracy.** Is the factual content correct? For compliance and lending workflows, this means regulatory citations are correct and calculations match the source data. For operations and retail, this means the summary reflects the actual data.

**2. Completeness.** Does the output include everything the workflow requires? Missing items create work downstream — someone has to find and add what was left out.

**3. Tone consistency.** Does the output match your institution's voice? A board narrative that sounds like a ChatGPT demo, or a member communication that uses terms your members don't recognize, has quality problems that waste editorial time.

**4. Verification burden.** How long does it take to verify the output? If verification takes longer than the pre-automation workflow took, the automation has not removed work — it has added a layer.

Score each dimension 1–4:
- **4 — Excellent:** Meets or exceeds human performance; minimal editing required
- **3 — Good:** Occasionally needs editing; output is a strong starting point
- **2 — Adequate:** Frequently needs editing; output is a usable draft but not a finished product
- **1 — Poor:** Output requires substantial rework; marginal time savings at best`,
    },
  ],
  activities: [
    {
      id: '4.1',
      title: 'Time Savings Report',
      description:
        'Using the framework from the W4 materials, produce a time savings report for your W3 automation. Include the calculation methodology, your quality evaluation scores with evidence, and a one-paragraph enhancement recommendation. This report should be written in a format suitable for sharing with your department head.',
      type: 'form',
      estimatedMinutes: 90,
      submissionFormat: 'Structured form',
      dueBy: 'Before the W5 live session',
      peerReview: false,
      fields: [
        {
          id: 'time_calculation',
          label: 'Time savings calculation (show your work: baseline, automated time, weekly savings, annual hours, annual value)',
          type: 'textarea',
          placeholder: 'Baseline: [X] minutes/run × [Y] runs/week = [Z] minutes/week\nWith automation: [A] minutes/run × [Y] runs/week = [B] minutes/week\nWeekly savings: [C] minutes\nAnnual hours: [C × 50 / 60]\nAnnual value at $[rate]/hr: $[amount]',
          minLength: 150,
          required: true,
        },
        {
          id: 'quality_scores',
          label: 'Quality evaluation scores (accuracy, completeness, tone consistency, verification burden — score 1–4 each with evidence)',
          type: 'textarea',
          placeholder: 'Accuracy: [score] — Evidence: [specific example]\nCompleteness: [score] — Evidence: ...\nTone consistency: [score] — Evidence: ...\nVerification burden: [score] — Evidence: ...',
          minLength: 200,
          required: true,
        },
        {
          id: 'enhancement_recommendation',
          label: 'Top enhancement recommendation based on your quality evaluation',
          type: 'textarea',
          placeholder: 'Based on my evaluation, the highest-priority enhancement is [specific change] because [evidence from quality scoring]. This would address the [dimension] score of [X] by [mechanism].',
          minLength: 100,
          required: true,
        },
        {
          id: 'leadership_summary',
          label: 'One-paragraph summary suitable for sharing with your department head',
          type: 'textarea',
          placeholder: 'Since [date], our department has been using an AI-assisted automation for [workflow]. In [X] weeks of use, it has saved approximately [Y] hours per week...',
          minLength: 100,
          required: true,
        },
      ],
    },
  ],
  roleTrackContent: {
    operations: {
      platformFocus: 'Copilot in Excel, Power Automate',
      deepDiveTopics: [
        'Measuring Power Automate flow execution time vs. manual process',
        'Tracking exception report accuracy against manual review',
        'Calculating downstream time savings from routing automation',
      ],
      activityVariations:
        'Operations metrics often have clear before/after data because exception counts and processing times are already tracked. Use your existing operational metrics where possible. If your Power Automate flow routes exceptions, measure the response time reduction from routing to resolution.',
      skillExamples: [
        'Time measurement: How long did it take to produce the exception report manually? How long with Copilot in Excel?',
        'Quality metric: What percentage of exceptions were correctly categorized by the automation vs. manually?',
        'Enhancement candidate: Adding a confidence indicator to the exception categorization',
      ],
    },
    lending: {
      platformFocus: 'Claude Projects, ChatGPT Custom GPTs',
      deepDiveTopics: [
        'Measuring pipeline report time: data assembly + narrative vs. automation',
        'Evaluating completeness of AI-generated loan summaries',
        'Accuracy verification for covenant tracking automation',
      ],
      activityVariations:
        'Lending quality evaluation should focus on accuracy and verification burden. A pipeline report that is fast but inaccurate creates downstream risk. Run your quality evaluation against at least 5 real pipeline states to get a meaningful quality score.',
      skillExamples: [
        'Time measurement: Pipeline status summary — manual compilation vs. automation including review time',
        'Quality metric: Loan application checklist completeness rate vs. manual review',
        'Enhancement candidate: Adding a "flag for human review" prompt trigger for ambiguous application items',
      ],
    },
    compliance: {
      platformFocus: 'Perplexity, NotebookLM',
      deepDiveTopics: [
        'Measuring regulatory research time: manual vs. Perplexity-assisted',
        'Evaluating citation accuracy in regulatory digests',
        'Quality rubric for policy Q&A tools',
      ],
      activityVariations:
        'Compliance quality evaluation must weight accuracy very highly. A regulatory digest with a citation error is worse than no digest — it creates false confidence. Score accuracy first, and be conservative. If you cannot verify a citation independently, score it as 2 or below.',
      skillExamples: [
        'Time measurement: Weekly regulatory digest — manual search + synthesis vs. Perplexity prompt',
        'Quality metric: Citation accuracy rate — percentage of citations verified against actual source documents',
        'Enhancement candidate: Adding a secondary verification prompt that asks the AI to flag uncertain citations',
      ],
    },
    finance: {
      platformFocus: 'Claude Projects, Copilot in Excel',
      deepDiveTopics: [
        'Measuring variance commentary time: data assembly + writing vs. automation',
        'Evaluating tone consistency in board-ready financial narrative',
        'Accuracy verification protocol for AI-generated financial summaries',
      ],
      activityVariations:
        'Finance quality evaluation should include a tone consistency check against a previous period\'s board-approved narrative. Pull a board report section from 3 months ago and compare the tone, vocabulary, and structure to what the automation produces. This is your tone consistency evidence.',
      skillExamples: [
        'Time measurement: Monthly variance commentary — manual writing vs. Claude prompt including data paste and review',
        'Quality metric: Number of edits required before board distribution over 3 months',
        'Enhancement candidate: Adding prior period narrative to the context file to improve tone consistency',
      ],
    },
    retail: {
      platformFocus: 'Copilot in Outlook, ChatGPT Custom GPTs',
      deepDiveTopics: [
        'Measuring branch report time: data gathering + summary vs. automation',
        'Evaluating tone consistency in member communication drafts',
        'Verification burden for AI-drafted service communications',
      ],
      activityVariations:
        'Retail quality evaluation should include a review of whether the automation produces outputs that sound like your institution. Member communications especially need tone consistency evaluation. Have a colleague who did not build the automation rate the tone quality — their fresh perspective is more valuable than your own.',
      skillExamples: [
        'Time measurement: Daily branch briefing — manual compilation vs. Copilot prompt',
        'Quality metric: Percentage of FAQ responses that required no editing before staff use',
        'Enhancement candidate: Adding branch-specific context to the FAQ automation to reduce generic responses',
      ],
    },
  },
};
