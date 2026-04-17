// AiBI-S Week 6: Capstone and Certification
// Phase: Scale and Orchestrate | Estimated: 90 min live + 120-180 min assignment
// Key Output: Full process improvement package submitted (7 components)

import type { CohortWeek } from '../types';

export const week6: CohortWeek = {
  number: 6,
  phase: 'scale-and-orchestrate',
  title: 'Capstone and Certification',
  estimatedLiveMinutes: 90,
  estimatedAssignmentMinutes: 150,
  keyOutput:
    'Full process improvement package: work audit, deployed automation, time savings report, skill library, training materials, capstone presentation, and 500-word reflection note',
  whyThisWeekExists: `Week 6 is the synthesis. The learner has audited their department (Week 1), mastered their platforms (Week 2), built and deployed an automation (Week 3), measured its impact (Week 4), and created a skill library with documentation (Week 5). The capstone assembles all of this into a single, board-presentable process improvement package.

The cross-department sharing session in Week 6 is one of the most valuable components of the entire AiBI-S cohort. A compliance officer presenting their regulatory change monitor to operations managers and lending officers creates cross-functional awareness that no individual course module can replicate. Learners consistently report that the ideas they take from other tracks are as valuable as the skills they built in their own. The cohort format was designed for this moment.`,

  learningGoals: [
    'Assemble all six weeks of work into a cohesive, board-presentable process improvement package',
    'Present a 10-minute capstone to the cohort covering problem, solution, results, library, handoff, and reflection',
    'Receive and integrate cross-track feedback from cohort peers',
    'Write a 500-word reflection demonstrating the self-assessment capability that distinguishes a specialist from a practitioner',
    'Submit the complete capstone package for assessment against the five-dimension rubric',
  ],

  sections: [
    {
      id: 'w6-synthesis',
      title: 'The Capstone as Synthesis',
      content: `Every element of the process improvement package traces back to a specific week. The work audit is from Week 1. The workspace setup guide is from Week 2. The deployed automation is from Week 3. The time savings report is from Week 4. The skill library and training materials are from Week 5. The capstone presentation and reflection note are new.

This is not an arbitrary collection of deliverables. Each piece is evidence of a specific capability:

- **Work audit** — Evidence that the learner can identify and prioritize automation opportunities systematically, not by intuition
- **Deployed automation** — Evidence that the learner can build institutional-grade skills that work for colleagues, not just themselves
- **Time savings report** — Evidence that the learner can measure AI impact with real data, not estimates
- **Skill library** — Evidence that the learner can build infrastructure that outlasts their direct involvement
- **Training materials** — Evidence that the learner can transfer knowledge — that what they built is teachable
- **Capstone presentation** — Evidence that the learner can present AI work credibly to colleagues, management, and board
- **Reflection note** — Evidence that the learner can self-assess honestly — the capability that drives continued improvement after the course ends

The assessment rubric evaluates these capabilities, not the polish of the deliverables. A rigorous work audit with honest scores matters more than a formatted spreadsheet. A reflection note that identifies one real thing to do differently matters more than 500 words of self-congratulation.`,
    },
    {
      id: 'w6-presentation',
      title: 'The 10-Minute Capstone Presentation',
      content: `The capstone presentation covers six topics in ten minutes. The format — slides, a structured document, or a memo — should match what is appropriate at the learner's institution. Some institutions present to boards via PowerPoint. Others use Word memos. The content is assessed, not the slide design.

**Topic 1 — The problem (2 minutes):** What workflow did you automate and why? Present the work audit data for the selected workflow: frequency, time per occurrence, standardization value score. Explain why this workflow ranked at the top of your audit. Connect it to a department priority — efficiency, consistency, compliance readiness, or capacity.

**Topic 2 — The solution (2 minutes):** What did you build? Describe the skill architecture (pattern: single-step, sequential, branching, or chaining), the platform chosen and why, and how the deployment works. How does a team member access and run the skill? This is not a technical demo — it is an explanation that a non-technical colleague or executive can follow.

**Topic 3 — The results (2 minutes):** What happened? Present the time savings data from Week 4: before average, after average, time saved per occurrence, weekly projection, annual projection, dollar value. State the quality level of automated output across documented runs. Conservative claims with real data are more credible than optimistic claims with estimates.

**Topic 4 — The library (1 minute):** What else did you build? Briefly describe the 3-skill library: names, categories, what each skill does. Show the ownership matrix — who owns what and when the next review is scheduled. This demonstrates that the automation was not a one-time experiment.

**Topic 5 — The handoff (1 minute):** Can someone else maintain this? Describe the training materials. Has a colleague used the skill independently? What does the Litmus Test result say about user independence? This topic answers the question every executive asks: "What happens when you leave?"

**Topic 6 — What you would do differently (1 minute):** One thing you would change if starting over. This is the most revealing topic in the presentation. It demonstrates the self-awareness and honest self-assessment that distinguishes a specialist from a practitioner. Weak answers: "Nothing, it went well." Strong answers name a specific decision — a different automation candidate, a different platform, a different documentation approach — and explain what you learned that would change that decision.`,
    },
    {
      id: 'w6-cross-department-session',
      title: 'The Cross-Department Sharing Session',
      content: `The Week 6 live session is structured differently from Weeks 1-5. There is no new content delivery. The entire 90 minutes is presentations and cross-track discussion.

**Session structure:**

- 0-5 min: Session overview and presentation order announced
- 5-65 min: Presentations (10 minutes each, 6 presenters per session)
- 65-80 min: Cross-track discussion — "What did you hear from another track that applies to your department?"
- 80-90 min: Capstone submission instructions and Q&A

For cohorts larger than 6, presentations are split across two sessions in Week 6. Every learner presents. No one submits without presenting.

**Why the cross-track discussion matters:** The compliance officer presenting their regulatory change monitor to operations managers and lending officers often produces the most valuable 15 minutes of the entire course. An operations manager hears how a systematic process (monitor regulatory changes → assess impact → draft communication → distribute) could apply to operational policy changes. A lending officer hears how the same research skill pattern could support CRE market monitoring. Neither connection would occur without the cohort format.

**What to listen for in other tracks:** Not "how do I copy this" but "what is the underlying pattern here, and does that pattern apply to something in my department?" The skill chaining pattern a compliance officer used for regulatory monitoring is the same pattern a finance team could use for ALCO scenario analysis. The branch daily briefing a retail manager built is the same reporting pattern an operations team could use for exception management daily stand-ups.`,
    },
    {
      id: 'w6-reflection-note',
      title: 'The Reflection Note',
      content: `The 500-word reflection note is the most personal document in the capstone. It is also the one that most reliably predicts whether the learner will continue building after the course ends.

Four questions structure the reflection:

**What worked?** Be specific. Not "the course was valuable" but "the work audit in Week 1 produced a prioritized backlog I am still drawing from. I have identified two more automation candidates beyond the three I built." Specific answers demonstrate that the learning was concrete, not abstract.

**What did not work?** Be honest. Every AiBI-S learner encounters at least one thing that failed: a skill that did not perform as expected, a colleague who did not adopt, a measurement that revealed smaller savings than projected. Acknowledging this demonstrates the self-awareness that separates a specialist from someone who completed the assignments.

**What would you do differently?** This question asks for a forward-looking decision change. "If I started again, I would have chosen the pipeline report as my Week 3 automation instead of the market research skill, because the pipeline report runs three times per week while the market research is ad hoc. My time savings data would have been stronger." A specific counterfactual demonstrates strategic thinking.

**One recommendation for your institution's AI strategy:** This is the question that turns the capstone into a business artifact. The AiBI-S graduate who can tell their CEO "based on what I measured and built, I recommend the institution prioritize these three workflow categories for AI adoption in the next 12 months, for these specific reasons" is the internal champion the course was designed to create. The recommendation should be specific, sourced in the course work, and conservative — not "we should adopt AI across all departments" but "based on the time savings I measured in operations, I recommend we replicate this approach in lending and compliance first, where the standardization value of the workflows is highest."`,
    },
    {
      id: 'w6-assessment-rubric',
      title: 'The Assessment Rubric: What Is Being Evaluated',
      content: `The capstone is assessed on five dimensions. Maximum total: 20. Passing score: 14. Hard gate on Dimension 3.

**Dimension 1 — Process Selection:** Did the learner pick a workflow that matters? The work audit score is the evidence. A workflow scoring 9-10 meets standard. A workflow scoring 11-12 with articulated strategic alignment exceeds standard.

**Dimension 2 — Skill Quality:** Are the deployed skills institutional-grade? "Institutional-grade" means: all extended anatomy components present, gotcha sections reflect real observed failure modes, constraints are specific and enforceable, a colleague could maintain the skill without the builder present.

**Dimension 3 — Measured Impact (HARD GATE):** Real time savings data, not estimates. Minimum 3 timed data points before and after. Sound calculation methodology. Conservative and defensible executive summary. A score below 3 on this dimension automatically fails the submission regardless of total score.

**Dimension 4 — Documentation:** Can someone who did not build this maintain and iterate on it? The test is whether a new team member with AiBI-P-level proficiency could use and maintain the skills from the documentation alone — without asking the builder.

**Dimension 5 — Change Adoption:** Has anyone else on the team actually used it? Evidence required. Screenshots, colleague confirmation, or usage logs. Multiple team members using the automation regularly, with feedback incorporated, exceeds standard.

**Distinction:** Total score of 18 or above with no dimension below 3.

**Resubmission:** One resubmission permitted. Written feedback identifies specific dimension shortfalls and actionable guidance. 14 calendar days to resubmit. For hard gate failures on Measured Impact, additional measurement time may be granted at the instructor's discretion. Resubmissions reviewed within 7 business days.`,
    },
  ],

  tables: [
    {
      id: 'w6-capstone-package',
      caption: 'The 7-Component Capstone Package',
      columns: [
        { header: 'Component', key: 'component' },
        { header: 'Produced In', key: 'week' },
        { header: 'What It Demonstrates', key: 'demonstrates' },
      ],
      rows: [
        {
          component: '1. Departmental Work Audit',
          week: 'Week 1 (updated if priorities changed)',
          demonstrates: 'Systematic identification and prioritization of automation opportunities',
        },
        {
          component: '2. Deployed Automation',
          week: 'Week 3 (skill file, context files, data classification)',
          demonstrates: 'Ability to build institutional-grade skills that work for colleagues',
        },
        {
          component: '3. Time Savings Report',
          week: 'Week 4 (before/after data, calculation, executive summary)',
          demonstrates: 'Ability to measure AI impact with real data, not estimates',
        },
        {
          component: '4. Skill Library',
          week: 'Week 5 (3 skill files, library index, ownership matrix)',
          demonstrates: 'Ability to build infrastructure that outlasts direct involvement',
        },
        {
          component: '5. Training Materials',
          week: 'Week 5 (3 quick start guides)',
          demonstrates: 'Ability to transfer knowledge — what was built is teachable',
        },
        {
          component: '6. Capstone Presentation',
          week: 'Week 6 (delivered live, then submitted)',
          demonstrates: 'Ability to present AI work credibly to colleagues, management, and board',
        },
        {
          component: '7. Reflection Note',
          week: 'Week 6 (500 words)',
          demonstrates: 'Honest self-assessment — the capability that drives continued improvement',
        },
      ],
    },
    {
      id: 'w6-rubric',
      caption: 'AiBI-S Assessment Rubric — Five Dimensions (Maximum: 20, Pass: 14)',
      columns: [
        { header: 'Dimension', key: 'dimension' },
        { header: '1 — Does Not Meet', key: 'score1' },
        { header: '2 — Approaching', key: 'score2' },
        { header: '3 — Meets Standard', key: 'score3' },
        { header: '4 — Exceeds', key: 'score4' },
      ],
      rows: [
        {
          dimension: '1. Process Selection',
          score1: 'Low-frequency or low-impact workflow. Score 6 or below.',
          score2: 'Reasonable but not highest-value. Score 7-8.',
          score3: 'High-value workflow. Score 9-10. Clear justification tied to department priorities.',
          score4: 'Highest-impact available. Score 11-12. Strategic alignment with institutional goals articulated.',
        },
        {
          dimension: '2. Skill Quality',
          score1: 'Missing components, contradictions, or would not produce consistent output for a non-builder user.',
          score2: 'Most components present but gotcha sections thin, constraints generic, or assumes builder knowledge.',
          score3: 'All extended anatomy components. Gotcha sections reflect real failure modes. A colleague could maintain the skill.',
          score4: 'Exemplary: modular, version-controlled, comprehensive gotcha sections. Could be handed to another department as a template.',
        },
        {
          dimension: '3. Measured Impact (HARD GATE: minimum 3)',
          score1: 'No baseline data. Savings estimated or projected without measurement.',
          score2: 'Some measurement attempted but fewer than 3 data points or inconsistent methodology.',
          score3: 'At least 3 timed occurrences before and after. Sound methodology. Conservative executive summary.',
          score4: '5+ data points each side. Documented methodology. Dollar value projection is conservative and sourced. Board-presentable.',
        },
        {
          dimension: '4. Documentation',
          score1: 'Incomplete or assumes the reader is the builder. Quick start guides missing or unusable.',
          score2: 'Covers basics but a new user would have questions. Quick start guides vague on inputs or output interpretation.',
          score3: 'Complete. A new team member with AiBI-P proficiency could use and maintain skills from documentation alone.',
          score4: 'Exemplary. Library index, ownership matrix, and training materials could be adopted by another department without modification.',
        },
        {
          dimension: '5. Change Adoption',
          score1: 'No evidence that anyone other than the builder has used the automation.',
          score2: 'One colleague tried it once. No evidence of ongoing use or feedback incorporation.',
          score3: 'At least one colleague used the automation multiple times. Feedback received and incorporated. Evidence provided.',
          score4: 'Multiple team members using regularly. Feedback loop active. Automation has become part of standard department workflow.',
        },
      ],
    },
    {
      id: 'w6-session-structure',
      caption: 'Week 6 Live Session Structure',
      columns: [
        { header: 'Time', key: 'time' },
        { header: 'Activity', key: 'activity' },
      ],
      rows: [
        { time: '0-5 min', activity: 'Session overview and presentation order announced' },
        { time: '5-65 min', activity: 'Presentations (10 minutes each, 6 per session)' },
        {
          time: '65-80 min',
          activity: 'Cross-track discussion: "What did you hear from another track that applies to your department?"',
        },
        { time: '80-90 min', activity: 'Capstone submission instructions and Q&A' },
      ],
    },
  ],

  activities: [
    {
      id: '6.1',
      title: 'Capstone Submission',
      description: `Assemble and submit the full process improvement package. All 7 components are required. The submission is due 5 calendar days after the Week 6 live session — this window is for any final polish after the live presentation and for incorporating feedback from the cross-track discussion.

**The 7 components:**

1. **Departmental Work Audit** (from Activity 1.1, updated if automation priorities changed during the course). The update should note which workflows were automated and which were deferred.

2. **Deployed Automation** — skill file (.md), context files, data classification statement, deployment evidence, test run documentation (from Activity 3.1).

3. **Time Savings Report** — before/after data tables, calculation worksheet, quality comparison, executive summary (from Activity 4.1).

4. **Skill Library** — 3 skill files, library index, ownership matrix (from Activity 5.1).

5. **Training Materials** — 3 quick start guides, one per skill (from Activity 5.1).

6. **Capstone Presentation** — slides, structured document, or memo as appropriate for the learner's institution. 5-7 slides or equivalent. Delivered live in the Week 6 session and submitted as a file.

7. **Reflection Note** — 500 words addressing four questions: what worked, what did not work, what you would do differently, and one recommendation for the institution's AI strategy.

**Submission folder structure:**

\`\`\`
[LastName]-AiBI-S-Capstone/
  W1-Work-Audit/
    departmental-work-audit.md (or .xlsx)
  W2-Workspace/
    workspace-setup-guide.md
  W3-Automation/
    [skill-name]-v[n].md
    context-files/
    data-classification.md
    deployment-evidence/
    test-runs/
  W4-Measurement/
    before-data.md (or .xlsx)
    after-data.md (or .xlsx)
    time-savings-calculation.md
    executive-summary.md
  W5-Library/
    skill-files/
    library-index.md
    ownership-matrix.md
    training-materials/
  W6-Capstone/
    presentation.pdf (or .pptx or .md)
    reflection-note.md
\`\`\``,
      type: 'builder',
      estimatedMinutes: 150,
      submissionFormat:
        'Single compressed folder organized by week as specified above. All 7 components required. Due 5 calendar days after the W6 live session.',
      dueBy: '5 calendar days after the W6 live session',
      peerReview: false,
      fields: [
        {
          id: 'presentation-summary',
          label: 'Capstone Presentation Summary (paste the 6 topic headers with 1-2 sentence summaries of each)',
          type: 'textarea',
          required: true,
          minLength: 300,
        },
        {
          id: 'reflection-note',
          label: 'Reflection Note (500 words: what worked, what did not, what you would do differently, one institutional recommendation)',
          type: 'textarea',
          required: true,
          minLength: 400,
        },
        {
          id: 'cross-track-insight',
          label: 'Cross-Track Insight: What did you hear from another role track in the W6 session that you will apply to your department?',
          type: 'textarea',
          required: true,
          minLength: 100,
        },
        {
          id: 'total-time-saved',
          label: 'Total Projected Annual Hours Saved (from your Activity 4.1 calculation)',
          type: 'text',
          required: true,
          placeholder: 'e.g. 92.5 hours/year for the deployed automation',
        },
        {
          id: 'skills-deployed',
          label: 'Number of Skills Deployed and in Active Use by Team Members',
          type: 'select',
          required: true,
          options: [
            { value: '1', label: '1 skill (minimum — the Week 3 automation)' },
            { value: '2', label: '2 skills' },
            { value: '3', label: '3 skills (full library)' },
            { value: '3+', label: 'More than 3 skills' },
          ],
        },
      ],
      completionTrigger: 'module-advance',
    },
  ],

  roleTrackContent: {
    operations: {
      platformFocus: 'Presenting operational efficiency gains in board-appropriate format',
      deepDiveTopics: [
        'Operations capstone framing: connect the automation work to the institution efficiency ratio. Exception triage time savings and scorecard narrative automation both reduce the cost of operational oversight. The CFO and board can follow that connection.',
        'Presentation format for operations: operations managers typically present to the COO or CEO. A structured memo or a short slide deck (5 slides) is more appropriate than an elaborate presentation. Lead with the numbers.',
        'Cross-track insights for operations: watch for compliance and finance presentations — both tracks often automate batch processing and reporting workflows that have direct operational parallels. The exception triage pattern maps to BSA/AML case triage. The scorecard narrative pattern maps to variance analysis.',
        'Institutional recommendation for operations: an operations AiBI-S graduate might recommend "prioritize Power Automate deployment for document routing and approval chain automation in the next 6 months — the skills and workspace are built, the training materials exist, and the team has demonstrated adoption."',
      ],
      activityVariations:
        'Operations capstone should emphasize the operational metrics impact: not just hours saved but exception processing time reduced, meeting action completion rate improved, or scorecard production cycle shortened. Operations leaders and boards respond to operational metrics, not just dollar value projections. Include both in the executive summary and presentation.',
      skillExamples: [
        'Capstone presentation Topic 3 — Results: "Before deployment, exception report triage required 45 minutes per report. After deployment: 8 minutes. At 3 reports per week, this represents 111 minutes of weekly staff time — 92.5 hours annually. Output quality assessed as use-directly across 13 of 15 documented runs."',
        'Reflection note recommendation: "I recommend the institution extend the exception triage automation to the BSA/AML exception workflow. The pattern is identical — exceptions received, classified, summarized — and the BSA team has a similar volume problem. The skill architecture is already built."',
      ],
    },
    lending: {
      platformFocus: 'Presenting loan production efficiency gains and pipeline visibility improvements',
      deepDiveTopics: [
        'Lending capstone framing: connect the automation work to loan production efficiency. File completeness check time savings reduce loan cycle time — which affects closing ratios, referral relationships, and competitive positioning against larger banks with automated origination platforms.',
        'Presentation format for lending: lending managers typically present to the CLO or CEO. The pipeline report automation has direct revenue relevance — faster pipeline visibility means faster management decisions. Lead with the business impact, not the technical architecture.',
        'Cross-track insights for lending: watch for compliance presentations — BSA/AML documentation patterns are directly relevant to lending regulatory compliance documentation. The research skill pattern from compliance maps to CRE market research. The quality check pattern from operations maps to loan file completeness.',
        'Institutional recommendation for lending: a lending AiBI-S graduate might recommend "extend the file completeness automation to consumer lending — the checklist is different but the skill pattern is identical, and consumer loan volume is 3x commercial volume at our institution, making the time savings proportionally larger."',
      ],
      activityVariations:
        'Lending capstone should include a loan cycle time component in addition to staff time savings. If the completeness check automation reduces the time from application to complete file by even one business day, that has downstream effects on closing timelines that are worth quantifying conservatively. Note it as a secondary benefit in the executive summary, clearly labeled as an estimate.',
      skillExamples: [
        'Capstone presentation Topic 3 — Results: "Before deployment, file completeness checks required 25 minutes per file. After deployment: 5 minutes. At 8 files per week, this is 139 hours annually at 50 weeks. Output quality assessed as light editing — one false positive per 10 runs on average, requiring 2 minutes of correction."',
        'Reflection note recommendation: "I would choose the pipeline status report as my Week 3 automation rather than the completeness check. The pipeline report runs 3 times weekly while the completeness check is triggered by file arrivals. The pipeline report would have produced stronger weekly time savings data for the Week 4 measurement."',
      ],
    },
    compliance: {
      platformFocus: 'Presenting examination readiness improvement and regulatory monitoring efficiency',
      deepDiveTopics: [
        'Compliance capstone framing: connect the automation work to examination readiness. A regulatory change monitor that reduces the time from guidance publication to staff communication from 5 days to 1 day directly improves the institution\'s examination readiness posture. Examiners ask about the timeliness of regulatory awareness.',
        'Presentation format for compliance: compliance officers present to the CCO and often to the board\'s audit/compliance committee. The documentation quality of the skill library is particularly relevant for this audience — they understand the governance value of versioning, ownership, and review schedules.',
        'Cross-track insights for compliance: watch for operations and lending presentations. The exception triage pattern operations uses is directly applicable to compliance exception management. The document analysis pattern lending uses maps to policy document management. The pipeline report pattern maps to examination findings tracking.',
        'Institutional recommendation for compliance: a compliance AiBI-S graduate might recommend "build a comprehensive policy library in NotebookLM covering all 12 institutional policy documents before the next examination cycle. The technology is in place — the Week 2 workspace is built. The investment is uploading and organizing the remaining documents, which I estimate at 4 hours."',
      ],
      activityVariations:
        'Compliance capstone has additional presentation requirements compared to other tracks: every output referenced in the presentation should note whether it received human review before being acted on. The board audit committee or examiners who might eventually see this package need to see that human oversight was built into the process, not just the automation.',
      skillExamples: [
        'Capstone presentation Topic 2 — Solution: "The regulatory change monitor uses a two-platform approach: Perplexity for research with citations, then Claude for impact assessment and staff communication drafting. Every output has a [HUMAN REVIEW REQUIRED] flag. The compliance officer reviews and approves before distribution. The skill does not replace compliance judgment — it eliminates the research and drafting time."',
        'Reflection note what did not work: "The initial NotebookLM policy library was too broad — I uploaded 15 documents including some that were outdated. The AI cited outdated policy sections 3 times before I audited the sources. Lesson: verify every uploaded document is the current version before adding it to the library."',
      ],
    },
    finance: {
      platformFocus: 'Presenting board-ready financial reporting efficiency and ALCO analysis improvement',
      deepDiveTopics: [
        'Finance capstone framing: connect the automation work to the board reporting cycle. A variance analysis narrative automation that reduces the CFO\'s monthly reporting preparation time by 37 minutes compresses the reporting cycle and improves the quality of management attention during the cycle.',
        'Presentation format for finance: finance managers often present to the CFO and board finance committee. The quality of the capstone presentation itself is evaluated against the standard the learner\'s own institution sets for board materials. A finance AiBI-S capstone should look like it belongs in a board packet.',
        'Cross-track insights for finance: watch for operations and compliance presentations. The exception triage time savings from operations maps directly to variance exception triage in finance. The regulatory change monitor from compliance maps to accounting standards change monitoring. Both patterns are underexploited in most community bank finance departments.',
        'Institutional recommendation for finance: a finance AiBI-S graduate might recommend "extend the variance narrative automation to the branch-level monthly performance reporting — currently each branch manager produces their own variance commentary without a consistent format or quality standard. Centralizing this through the shared skill would both save time and produce more consistent board-quality reporting."',
      ],
      activityVariations:
        'Finance capstone numbers must be verified to a higher standard than any other track. Every figure in the time savings report and executive summary should be marked with a source or verification note. The capstone package will likely be reviewed by the CFO, and a number that cannot be defended is more damaging to the learner\'s credibility than a smaller number that is rigorously sourced.',
      skillExamples: [
        'Capstone presentation Topic 3 — Results: "Before deployment, the monthly variance commentary required an average of 45 minutes. After deployment: 8 minutes, including verification of all numbers against the source data. Over 12 months, this is 7.4 hours on this component alone. The board package narrative — which includes three additional sections — saves an estimated 19 hours annually. All numbers verified against institutional data."',
        'Reflection note what worked: "The Claude Project with the chart of accounts uploaded was the single highest-leverage investment of the course. Once the chart of accounts was in context, every narrative skill had access to the account structure it needed to produce accurate output. I should have done this in Week 2, not Week 3."',
      ],
    },
    retail: {
      platformFocus: 'Presenting member experience improvement and branch efficiency gains',
      deepDiveTopics: [
        'Retail capstone framing: connect the automation work to member experience and branch capacity. A member inquiry response library that reduces response time from 6 minutes to 2 minutes does not just save staff time — it improves the member experience (faster responses) and frees branch staff for higher-value member interactions.',
        'Presentation format for retail: retail managers present to the CCO, COO, or CEO. Member experience impact is as persuasive as time savings for this audience. Include both in the executive summary.',
        'Cross-track insights for retail: watch for operations and lending presentations. The document routing pattern from operations maps to member inquiry routing. The pipeline report pattern from lending maps to branch performance reporting. The training materials pattern from any track maps to branch staff onboarding.',
        'Institutional recommendation for retail: a retail AiBI-S graduate might recommend "deploy the member inquiry response library to all 4 branches simultaneously — the infrastructure is built, the training materials exist, and branch staff adoption at the pilot branch has been strong. The incremental investment is 2 hours of training at each additional branch."',
      ],
      activityVariations:
        'Retail capstone should include a member experience dimension in addition to time savings. Survey 3-5 staff members on whether AI-assisted responses improved their confidence in the accuracy and quality of member communications. Even qualitative evidence ("4 of 5 staff said they felt more confident the response was complete") adds a member experience dimension that time savings data alone does not capture.',
      skillExamples: [
        'Capstone presentation Topic 5 — Handoff: "The one-page quick start guide has been tested with 3 staff members who had no prior AI experience. All 3 successfully ran the member inquiry response skill on their first attempt without assistance. The training materials include 5 example outputs so new staff understand the expected tone before using the skill with members."',
        'Reflection note one recommendation: "I recommend the institution deploy the branch daily briefing skill institution-wide before the next staff meeting. The setup time per branch is under 30 minutes — I can train each branch manager individually. The daily time savings at scale (12 minutes per branch per day × 4 branches × 250 working days) represents 200 hours annually across the institution."',
      ],
    },
  },
};
