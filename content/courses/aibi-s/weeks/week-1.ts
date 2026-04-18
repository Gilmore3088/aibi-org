// AiBI-S Week 1: From Personal Skills to Institutional Assets
// Phase: Foundation | Estimated: 90 min live + 90-120 min assignment
// Key Output: Departmental work audit (10+ workflows scored)

import type { CohortWeek } from '../types';

export const week1: CohortWeek = {
  number: 1,
  phase: 'foundation',
  title: 'From Personal Skills to Institutional Assets',
  estimatedLiveMinutes: 90,
  estimatedAssignmentMinutes: 105,
  keyOutput: 'Departmental work audit with 10+ workflows scored by frequency, time, and standardization value',
  whyThisWeekExists: `AiBI-P graduates arrive with a skill that works for them. Most are using it daily. But that skill lives in their personal account, has no documentation beyond what they wrote for themselves, has no version control, and would be lost if they left the institution. Week 1 closes that gap. The personal skill becomes a template for institutional deployment.

The organizing question of Week 1 is not "what can AI do?" — every AiBI-P graduate already knows the answer to that. The question is "what changes when other people depend on what I build?" Governance, documentation, versioning, ownership, and measurement each answer a different part of that question. The work audit grounds all of it in the learner's actual department.`,

  keyTakeaways: [
    'Distinguish a personal AI skill from an institutional asset across six governance dimensions',
    'Complete a departmental work audit scoring 10+ workflows by automation potential',
    'Identify the top 3 automation candidates in your department ranked by hours saved',
  ],

  learningGoals: [
    'Distinguish between a personal AI skill and an institutional AI asset across six governance dimensions',
    'Apply the work decomposition framework to identify the highest-value automation candidates in their department',
    'Complete a departmental work audit scoring 10+ workflows by frequency, time per occurrence, and standardization value',
    'Understand how the margin of error shifts when skills serve a team rather than one person',
  ],

  sections: [
    {
      id: 'w1-opening',
      title: 'The Shift from Personal to Institutional',
      content: `In AiBI-P, you built a skill and automated a personal task. That skill makes one person faster. It was designed for your margin of error — if it produced imperfect output, only you saw it, and you fixed it on the fly.

In AiBI-S, the question changes: how do you make your department faster? The answer is not "give everyone my skill." The answer requires governance, documentation, versioning, ownership, and measurement. Each of those words represents a gap between a personal productivity tool and an institutional asset.

This week examines that gap systematically. You will leave with a clear picture of what your personal skill needs to become before colleagues can rely on it — and a ranked list of which department workflows are worth automating first.`,
    },
    {
      id: 'w1-governance',
      title: 'Skill Governance: What Changes When a Skill Serves a Team',
      content: `Every dimension of a skill changes when it serves a team rather than an individual. Understanding these changes is the conceptual foundation of AiBI-S.

**Ownership:** A personal skill is owned by the person who built it. They iterate on it when they want to. An institutional skill has a named owner. Changes go through a review. If the owner leaves, someone takes over. Ownership is not bureaucracy — it is the difference between infrastructure that sustains itself and a tool that disappears when one person changes roles.

**Versioning:** At the personal level, you save over the old file. Maybe you have a v2. At the institutional level, every change is documented. Previous versions are recoverable. If a model update causes your skill to behave differently, you can roll back and investigate.

**Documentation:** You know how your personal skill works because you built it. Institutional documentation means someone who did not build the skill can read it and use it correctly — including the parts that only come up in edge cases.

**Handoff:** Personal skills have no handoff. Institutional skills have documentation and ownership specifically so that they survive when the builder changes roles, goes on leave, or leaves the institution. Single points of failure are institutional risks.

**Data handling:** You apply the data classification tiers to your own inputs as a personal awareness exercise. Institutional skills embed data handling rules into the skill documentation itself — what tier this skill handles, what must be redacted before input, and what the output may not contain.

**Failure modes:** You catch your own errors by noticing them. The institutional gotcha section documents failure modes so that colleagues can recognize and handle them without escalating every edge case.`,
    },
    {
      id: 'w1-skill-library',
      title: 'The Team Skill Library Concept',
      content: `A skill library is not a shared folder full of .md files. A skill library is a curated, maintained, reviewed collection of skills that a department relies on. The distinction matters at every stage of its lifecycle.

**Curated:** Not every skill belongs in the library. A skill earns its place by demonstrating value — measured time savings, consistent output quality, and use by more than one person. The curation process prevents the library from becoming a graveyard of experiments that nobody uses.

**Maintained:** Skills degrade. AI models change. Processes change. Regulations change. Every skill in the library has an owner who reviews it on a set schedule and updates it when something breaks. A skill library without maintenance is a liability, not an asset.

**Reviewed:** Before a skill enters the library, someone other than the author tests it. This is not bureaucracy — it is quality assurance. The reviewer brings the perspective of a first-time user, which surfaces assumptions the author baked in without noticing.

The skill library concept is introduced this week and built in Week 5. The work audit you complete in Activity 1.1 is the discovery phase of the five-stage organizational skill process that concludes with your capstone in Week 6.`,
    },
    {
      id: 'w1-agent-shaped',
      title: 'Work Decomposition: Identifying Agent-Shaped Tasks',
      content: `Not every task in a department is a good automation candidate. The work decomposition framework identifies which tasks are worth the investment of building, deploying, and maintaining an institutional skill.

A task is agent-shaped when it meets three criteria simultaneously:

**Frequency:** It happens regularly — at least weekly, ideally daily. A task that happens once a quarter may be worth automating eventually, but it will not generate the weekly time savings that demonstrate AiBI-S value in a 6-week course.

**Time:** It takes meaningful time each occurrence — at minimum 15 minutes. A task that takes two minutes to do manually will not produce a measurable ROI even if the skill reduces it to 30 seconds. The time savings must be large enough to matter.

**Standardization value:** The output needs to be consistent every time — same format, same quality, same completeness. Tasks where the value lies in the judgment, creativity, or relationship context of the person doing them are not good automation candidates. Tasks where the value lies in completeness, consistency, and speed are ideal.

The three criteria compound. A task that scores high on all three is a strong automation candidate. A task that scores 4 on frequency but 1 on standardization value (ad hoc creative work) is a poor candidate regardless of how often it occurs. A task that scores 4 on standardization value but 1 on frequency (annual audit preparation) may be worth automating eventually but will not demonstrate value during the course.

**Minimum automation threshold: a total score of 7 or above.** Workflows scoring below 7 are logged in the audit for future reference but are not primary automation candidates for AiBI-S.`,
    },
    {
      id: 'w1-margin-of-error',
      title: 'The Margin of Error Shift',
      content: `AiBI-P operated at the personal margin of error: high tolerance for failure, iterate freely, no one else sees your mistakes. AiBI-S operates at two overlapping margins.

**Team margin of error:** Colleagues catch mistakes. Reputation has some risk but is recoverable. A flawed output that goes to a colleague is embarrassing — it may require a correction email or an apology. It is not a regulatory event. The team margin permits learning through deployment, which is why AiBI-S starts building in Week 3 rather than spending six weeks in theory.

**Institutional margin of error:** Documented, governed, examined. Errors have compliance and operational consequences. When an AI skill produces output that enters a regulatory report, a board memo, or a member communication, the institution is accountable for that output regardless of whether it was AI-assisted. The institutional margin is why data classification enforcement, gotcha sections, and human-in-the-loop requirements appear in the skill architecture.

AiBI-S teaches you to build at the team level while designing for the institutional level. The skill you build in Week 3 is deployed to your department — team margin. The documentation, constraints, and data handling rules you build into it are institutional-grade — designed to hold up if an examiner asks who approved this and what guardrails were in place.

The customer-facing margin (zero tolerance, full governance, full accountability) is AiBI-L territory. AiBI-S graduates are ready to build and measure. AiBI-L graduates are ready to govern at scale.`,
    },
  ],

  tables: [
    {
      id: 'w1-personal-vs-institutional',
      caption: 'Personal Skill vs. Institutional Asset: Six Governance Dimensions',
      columns: [
        { header: 'Dimension', key: 'dimension' },
        { header: 'Personal Skill (AiBI-P)', key: 'personal' },
        { header: 'Institutional Skill (AiBI-S)', key: 'institutional' },
      ],
      rows: [
        {
          dimension: 'Ownership',
          personal: 'You own it. You iterate when you want to.',
          institutional: 'A named owner. Changes go through review. Ownership transfers if person leaves.',
        },
        {
          dimension: 'Versioning',
          personal: 'Save over the old file. Maybe a v2.',
          institutional: 'Version-controlled. Every change documented. Previous versions recoverable.',
        },
        {
          dimension: 'Documentation',
          personal: 'You know how it works because you built it.',
          institutional: 'Someone who did not build it can read the documentation and use it correctly.',
        },
        {
          dimension: 'Handoff',
          personal: 'Not applicable — you are the only user.',
          institutional: 'If you leave, the skill continues to function. No single point of failure.',
        },
        {
          dimension: 'Data handling',
          personal: 'Personal awareness of the classification tiers.',
          institutional: 'Explicit data tier documented in skill. Redaction instructions included. Output restrictions stated.',
        },
        {
          dimension: 'Failure modes',
          personal: 'You catch your own errors and fix them on the fly.',
          institutional: 'Gotcha section documents failure modes so colleagues recognize them without escalating every edge case.',
        },
      ],
    },
    {
      id: 'w1-scoring-matrix',
      caption: 'Work Audit Scoring Matrix — Maximum 12 Points Per Workflow',
      columns: [
        { header: 'Score', key: 'score' },
        { header: 'Frequency', key: 'frequency' },
        { header: 'Time per Occurrence', key: 'time' },
        { header: 'Standardization Value', key: 'standardization' },
      ],
      rows: [
        {
          score: '4',
          frequency: 'Daily',
          time: '60+ minutes',
          standardization: 'Output must be identical every time — template-driven, no judgment required',
        },
        {
          score: '3',
          frequency: '2-3x per week',
          time: '30-59 minutes',
          standardization: 'Output follows a standard structure with predictable variations',
        },
        {
          score: '2',
          frequency: 'Weekly',
          time: '15-29 minutes',
          standardization: 'Output has a general structure but varies meaningfully by case',
        },
        {
          score: '1',
          frequency: 'Monthly or less',
          time: 'Under 15 minutes',
          standardization: 'Output is highly variable — judgment and context drive every instance',
        },
      ],
    },
    {
      id: 'w1-margin-of-error-table',
      caption: 'The Margin of Error Progression Across the AiBI Curriculum',
      columns: [
        { header: 'Level', key: 'level' },
        { header: 'Margin of Error', key: 'margin' },
        { header: 'Who Is Affected', key: 'affected' },
        { header: 'Course', key: 'course' },
      ],
      rows: [
        {
          level: 'Personal',
          margin: 'High — fail privately, learn fast, iterate freely',
          affected: 'Only you',
          course: 'AiBI-P',
        },
        {
          level: 'Team',
          margin: 'Medium — colleagues catch mistakes, reputation has some risk but is recoverable',
          affected: 'Your immediate colleagues',
          course: 'AiBI-S (this course)',
        },
        {
          level: 'Institution',
          margin: 'Low — documented, governed, examined. Errors have compliance and operational consequences',
          affected: 'The whole organization and examiners',
          course: 'AiBI-S (this course)',
        },
        {
          level: 'Customer-facing',
          margin: 'Zero — touches members, borrowers, or depositors. Full governance, full accountability',
          affected: 'Members and the public',
          course: 'AiBI-L',
        },
      ],
    },
  ],

  activities: [
    {
      id: '1.1',
      title: 'Departmental Work Audit',
      description: `Conduct a work audit of your department. Map a minimum of 10 recurring workflows. For each workflow, document nine fields, then sort by total score descending and highlight your top 3 automation candidates.

This audit is the foundation of everything you build in this course. The automation you deploy in Week 3 and the skill library you build in Week 5 both come from this list. Time spent on a thorough audit here compounds across six weeks.

**The nine fields for each workflow:**

1. **Name** — What is the task called? Use the name your team uses. (Examples: "Weekly exception report review," "Loan file completeness check," "Monday morning pipeline pull")
2. **Current owner** — Who does this today? Is it one person or distributed? What happens when that person is out?
3. **Frequency** — How often does it happen? (Daily / 2-3x week / Weekly / Monthly)
4. **Time per occurrence** — How long does it take each time? Estimate in minutes. If unsure, track it for one cycle before submitting.
5. **Standardization value** — How consistent does the output need to be? Use the 1-4 scoring scale.
6. **Total score** — Frequency score + Time score + Standardization score. Maximum 12. Minimum automation threshold: 7.
7. **Current tools** — What tools are used today? Be specific. (Core system export, Excel pivot, Word template, email thread, manual review checklist)
8. **Data sensitivity** — What data tier does this task involve? (Tier 1: public. Tier 2: internal non-public. Tier 3: member PII, account data, examination findings)
9. **Automation feasibility notes** — Any obvious barriers? (Examples: "Requires real-time core system access that cannot be exported," "Output requires relationship judgment," "BSA review required before any output is acted on")`,
      type: 'audit',
      estimatedMinutes: 105,
      submissionFormat:
        'Completed work audit table (10+ workflows), sorted by total score descending. Top 3 workflows highlighted as primary automation candidates. Submitted as structured document (Markdown, Word, or Excel).',
      dueBy: 'Before the W2 live session',
      peerReview: true,
      peerReviewPrompt:
        "Review your assigned peer's work audit (from a different role track). Answer: Based on the scores and feasibility notes, would you prioritize the same top 3 workflows? Why or why not? What does their audit reveal about automation opportunities you had not considered for your own department?",
      fields: [
        {
          id: 'workflow-name',
          label: 'Workflow Name',
          type: 'text',
          placeholder: 'e.g. Weekly exception report review',
          required: true,
        },
        {
          id: 'current-owner',
          label: 'Current Owner(s)',
          type: 'text',
          placeholder: 'e.g. Operations Manager — single owner, no backup',
          required: true,
        },
        {
          id: 'frequency-score',
          label: 'Frequency Score (1-4)',
          type: 'radio',
          required: true,
          options: [
            { value: '4', label: '4 — Daily' },
            { value: '3', label: '3 — 2-3x per week' },
            { value: '2', label: '2 — Weekly' },
            { value: '1', label: '1 — Monthly or less' },
          ],
        },
        {
          id: 'time-score',
          label: 'Time per Occurrence Score (1-4)',
          type: 'radio',
          required: true,
          options: [
            { value: '4', label: '4 — 60+ minutes' },
            { value: '3', label: '3 — 30-59 minutes' },
            { value: '2', label: '2 — 15-29 minutes' },
            { value: '1', label: '1 — Under 15 minutes' },
          ],
        },
        {
          id: 'standardization-score',
          label: 'Standardization Value Score (1-4)',
          type: 'radio',
          required: true,
          options: [
            { value: '4', label: '4 — Output must be identical every time' },
            { value: '3', label: '3 — Output follows a standard structure' },
            { value: '2', label: '2 — Output has general structure but varies' },
            { value: '1', label: '1 — Output is highly variable by case' },
          ],
        },
        {
          id: 'current-tools',
          label: 'Current Tools',
          type: 'text',
          placeholder: 'e.g. Core system export, Excel pivot table, Word template',
          required: true,
        },
        {
          id: 'data-tier',
          label: 'Data Sensitivity Tier',
          type: 'select',
          required: true,
          options: [
            { value: 'tier-1', label: 'Tier 1 — Public information' },
            { value: 'tier-2', label: 'Tier 2 — Internal non-public information' },
            { value: 'tier-3', label: 'Tier 3 — Member PII, account data, examination findings' },
          ],
        },
        {
          id: 'feasibility-notes',
          label: 'Automation Feasibility Notes',
          type: 'textarea',
          placeholder: 'Any obvious barriers, dependencies, or human judgment requirements',
          required: false,
        },
      ],
      completionTrigger: 'save-response',
    },
  ],

  roleTrackContent: {
    operations: {
      platformFocus: 'Copilot in Microsoft 365 (Teams, Outlook, Excel), Power Automate',
      deepDiveTopics: [
        'Mapping back-office workflows: exception management, reconciliation, reporting cycles',
        'Identifying automation candidates in operational scorecards and management reporting',
        'Power Automate trigger patterns for operational event-driven tasks',
      ],
      activityVariations:
        'Operations work audit focuses on: exception reports, meeting action tracking, operational scorecard narratives, document routing, approval chains, and recurring management reporting. Priority workflows typically score high on frequency and standardization value — operations teams run many repeatable, template-driven processes.',
      skillExamples: [
        'Exception report triage: raw exception data classified by type and priority, summary produced for management review',
        'Meeting action tracker: Teams meeting transcript processed, action items extracted with owners and deadlines',
        'Operational scorecard narrative: monthly metrics data processed into narrative commentary for board reporting',
        'Document routing: incoming operational documents classified and routed to correct workflow owner',
      ],
    },
    lending: {
      platformFocus: 'Claude Projects for document analysis, ChatGPT Custom GPTs for research',
      deepDiveTopics: [
        'Mapping the loan origination workflow: intake, completeness check, underwriting support, conditions tracking',
        'Identifying document analysis opportunities: loan files, appraisals, environmental reports, financials',
        'Pipeline reporting workflows and the data they currently require manually',
      ],
      activityVariations:
        'Lending work audit focuses on: loan file completeness checks, pipeline status reporting, credit policy verification, condition letter drafting, and CRE market research. Lending teams have high standardization value on compliance-driven tasks (completeness checklists, condition tracking) but variable standardization on credit judgment tasks — the audit helps distinguish the two.',
      skillExamples: [
        'Loan file completeness check: uploaded documents compared against institution checklist, gaps identified, condition letter drafted',
        'Pipeline status report: raw data structured into stage-by-stage summary with month-over-month comparison',
        'Credit policy check: loan scenario evaluated against institution policy, exceptions flagged with documentation requirements',
        'CRE market research: property type and market data synthesized into structured underwriting context',
      ],
    },
    compliance: {
      platformFocus: 'Perplexity for regulatory research, NotebookLM for policy library, Claude Projects for analysis',
      deepDiveTopics: [
        'Mapping regulatory change monitoring workflows: frequency, sources, distribution, impact assessment',
        'Identifying policy library use cases: how staff currently find and apply policy guidance',
        'BSA/AML documentation workflows that have high standardization value (SAR narratives, CDD documentation)',
      ],
      activityVariations:
        'Compliance work audit focuses on: regulatory change monitoring, policy gap analysis, examination preparation, SAR narrative drafting, CDD documentation, and staff compliance communication. Compliance workflows often have the highest standardization value in the institution — regulatory responses and examination materials must be consistent and defensible.',
      skillExamples: [
        'Regulatory change monitor: new guidance researched, summarized, and assessed for policy impact, staff communication drafted',
        'Policy gap analysis: new guidance compared against current policies, gaps identified, remediation recommendations drafted',
        'SAR narrative assistance: transaction details processed into structured draft with mandatory [HUMAN REVIEW REQUIRED] flags',
        'Examination preparation: scattered documentation organized into structured examination response packages',
      ],
    },
    finance: {
      platformFocus: 'Claude Projects for narrative generation, Copilot in Excel for financial analysis',
      deepDiveTopics: [
        'Mapping board and ALCO reporting workflows: data collection, narrative generation, formatting, distribution',
        'Identifying variance analysis patterns: budget-vs-actual, peer comparison, trend identification',
        'ALCO scenario analysis workflows and the narrative components that are template-driven',
      ],
      activityVariations:
        'Finance work audit focuses on: variance analysis narrative generation, efficiency ratio tracking, board report preparation, ALCO scenario analysis, and budget-vs-actual commentary. Finance workflows often have the highest time-per-occurrence in the institution — board packages can take days to prepare — and significant standardization value in the narrative components.',
      skillExamples: [
        'Variance analysis narrative: budget-vs-actual data processed into structured narrative with material variance explanations',
        'Efficiency ratio analysis: quarterly data processed into trends, peer comparison, and improvement opportunity identification',
        'ALCO scenario narrative: rate scenario data processed into structured analysis with balance sheet impact projections',
        'Board report executive summary: departmental metrics assembled into a concise executive narrative',
      ],
    },
    retail: {
      platformFocus: 'Copilot in Outlook/Teams for member communications, ChatGPT Custom GPTs for FAQ automation',
      deepDiveTopics: [
        'Mapping member communication workflows: inquiry response, complaint handling, service recovery',
        'Identifying FAQ automation opportunities: recurring inquiry types with standardizable responses',
        'Branch operations workflows: daily briefing, scheduling, staff communication',
      ],
      activityVariations:
        'Retail work audit focuses on: member inquiry responses, complaint handling, service recovery communications, branch daily briefings, staff announcements, and new employee onboarding. Retail workflows score high on frequency — branch teams handle dozens of similar communications daily — which means automation delivers visible daily time savings.',
      skillExamples: [
        'Member inquiry response library: common inquiry types classified, response templates generated calibrated to institution voice',
        'Branch daily briefing: calendar, pending items, and key metrics assembled into structured morning brief',
        'Service recovery communication: complaint details processed, root cause classified, recovery draft produced',
        'New employee onboarding guide: role-specific information assembled into personalized first-week orientation materials',
      ],
    },
  },
};
