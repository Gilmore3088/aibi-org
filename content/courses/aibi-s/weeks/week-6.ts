// AiBI-S Week 6 — Capstone and Certification
// Phase: Scale and Orchestrate | Week 6 of 6

import type { CohortWeek } from '../types';

export const week6: CohortWeek = {
  number: 6,
  phase: 'scale-and-orchestrate',
  title: 'Capstone and Certification',
  estimatedLiveMinutes: 90,
  estimatedAssignmentMinutes: 150,
  whyThisWeekExists:
    'The capstone session is the highest-value component of AiBI-S. Learners from all five role tracks share their best automation — a cross-department exchange that surfaces institutional AI capabilities that siloed work would never reveal. The capstone submission is the documented, governed process improvement package that earns certification.',
  learningGoals: [
    'Prepare and deliver a 5-minute process improvement summary to the full cohort',
    'Complete the capstone submission package with all five required components',
    'Give structured feedback to one peer from a different role track',
    'Reflect on what changed in your department from W1 to W6',
  ],
  keyOutput: 'Full capstone process improvement package submitted for certification review',
  sections: [
    {
      id: 'w6-s1',
      title: 'The W6 Live Session: Cross-Department Exchange',
      content: `The Week 6 live session is different from Weeks 1–5. It is not a lecture or a skill-building session — it is a structured peer exchange. Every learner presents a 5-minute summary of their best automation. The questions come from colleagues in different role tracks.

This is intentional. A compliance officer hearing how an operations manager automated exception routing may realize the same approach applies to examination prep. A lending specialist seeing a finance automation for variance commentary may recognize a parallel in pipeline reporting.

These connections are impossible to create in a self-paced course. They require the live cohort format.

**What to prepare for the W6 live session:**

1. A 5-minute summary of your best automation. Not a demo — a narrative. What did you build, what does it do, what did you learn, what would you do differently?
2. One specific question for a peer in a different role track. Come prepared to be curious.
3. Your capstone submission package, ready to share if the instructor asks for a detail.

**The instructor will time the presentations.** Five minutes is tight on purpose. The constraint forces you to identify what actually matters about your automation.`,
    },
    {
      id: 'w6-s2',
      title: 'The Capstone Submission Package',
      content: `The capstone submission is the official record of your AiBI-S work. A reviewer will assess it against the AiBI-S certification rubric within 10 business days of submission. The five required components are:

**1. Work audit.** Your W1 submission with any updates. This is the evidence of what you chose to automate and why.

**2. Deployed automation description.** Your W3 submission with any enhancements from W4. This is the evidence that you deployed something real.

**3. Skill library.** Your W5 submission. This is the evidence of institutional capability — not just one automation, but a governed library.

**4. Time savings report.** Your W4 submission. This is the evidence of measured value. It must include actual timing data, not estimates.

**5. Training materials.** The one-page job aids from W5 for all three automations. This is the evidence that you built for transferability, not just personal use.

**Certification is not awarded for completing the course.** It is awarded for submitting a package that passes the five-dimension rubric: scope, governance, measurement, transferability, and impact. A package that describes what the learner intended to build, rather than what was actually deployed, will not pass.`,
    },
    {
      id: 'w6-s3',
      title: 'What You Carry Forward After AiBI-S',
      content: `When you receive your AiBI-S credential, you will have built something that most department managers at community banks have not: a documented, measured, governed AI capability that your team actually uses.

That is the credential. Not a badge that says you watched six weeks of videos — a record that you deployed automation, measured the savings, and built the infrastructure for other people to use it.

**What comes next:**

**AiBI-L — Banking AI Leader** is the third tier. Where AiBI-S operates at the team and institution margin of error, AiBI-L operates at the customer-facing and regulatory margin of error. AiBI-L learners design institution-wide AI governance frameworks, lead the fCAIO program, and hold accountability for AI systems that touch members.

If you are a department head who wants to formalize your institution's AI governance — or a manager being considered for a chief AI officer role — AiBI-L is the next step.

**The fCAIO Program** (Fractional Chief AI Officer) is the consulting track for AiBI-S and AiBI-L graduates who want to apply their skills as advisors to other community banks. It is not a course — it is a credentialing and network program for practitioners who want to consult.

**The AI Banking Institute resource library** continues to grow. As a certified AiBI-S specialist, you have access to the full skill library, curriculum updates, and the quarterly specialist cohort calls where new techniques and regulatory updates are shared.

The community bank sector needs 8,400 institutions to build AI capability. You have built a department-level version. The next challenge is helping your peers do the same.`,
    },
  ],
  activities: [
    {
      id: '6.1',
      title: 'Capstone Submission Package',
      description:
        'Submit your complete capstone package: work audit (W1 updated), deployed automation description (W3 with enhancements), skill library (W5), time savings report (W4), and training materials (W5 job aids for all three automations). Each component must reflect the actual state of your deployments, not the intended state.',
      type: 'form',
      estimatedMinutes: 120,
      submissionFormat: 'Five-section structured form',
      dueBy: 'Within 72 hours of the W6 live session',
      peerReview: false,
      fields: [
        {
          id: 'work_audit_summary',
          label: 'Work audit summary (from W1, updated with any changes): top candidates and final selection rationale',
          type: 'textarea',
          placeholder: 'From my W1 audit of [X] workflows, I selected [workflow name] as my primary automation candidate because [rationale]. Since W1, I have [updated/confirmed/revised] this selection because ...',
          minLength: 150,
          required: true,
        },
        {
          id: 'deployed_automation',
          label: 'Deployed automation description (from W3 with W4 enhancements applied): what it does, who uses it, how it is governed',
          type: 'textarea',
          placeholder: 'The primary automation I deployed is [description]. It is used by [roles, not names] in my department [X] times per [period]. The platform is [name] with [data tier] classification. Since W3, I enhanced it by [enhancement from W4 evaluation].',
          minLength: 200,
          required: true,
        },
        {
          id: 'skill_library_summary',
          label: 'Skill library summary (from W5): three automations with library entries and ownership',
          type: 'textarea',
          placeholder: 'My departmental skill library contains three automations:\n1. [Name] — [purpose] — Owner: [role]\n2. [Name] — [purpose] — Owner: [role]\n3. [Name] — [purpose] — Owner: [role]\nAll three are documented in [shared location] and accessible to the full department.',
          minLength: 150,
          required: true,
        },
        {
          id: 'time_savings_summary',
          label: 'Time savings summary (from W4): total measured savings across all three automations',
          type: 'textarea',
          placeholder: 'Total measured time savings across the three automations in my library:\n- Automation 1: [X] hours/month at $[rate]/hr = $[value]/month\n- Automation 2: [X] hours/month = ...\n- Automation 3: ...\nCombined annual value: approximately $[total]',
          minLength: 100,
          required: true,
        },
        {
          id: 'training_materials_description',
          label: 'Training materials (from W5): confirm job aids exist for all three automations and where they are stored',
          type: 'textarea',
          placeholder: 'One-page job aids for all three automations are stored at [shared location]. [Name] (backup owner) has confirmed they can operate all three automations using only the job aids without additional guidance.',
          minLength: 75,
          required: true,
        },
      ],
    },
    {
      id: '6.2',
      title: 'Peer Feedback: Cross-Department Review',
      description:
        'After the W6 live session, provide structured feedback to one peer from a different role track. The instructor will pair you with a peer before the session ends.',
      type: 'free-text',
      estimatedMinutes: 30,
      submissionFormat: 'Short-form structured feedback',
      dueBy: 'Within 48 hours of the W6 live session',
      peerReview: false,
      fields: [
        {
          id: 'peer_track',
          label: 'Your peer\'s role track',
          type: 'select',
          required: true,
          options: [
            { value: 'operations', label: 'Operations' },
            { value: 'lending', label: 'Lending' },
            { value: 'compliance', label: 'Compliance' },
            { value: 'finance', label: 'Finance' },
            { value: 'retail', label: 'Retail' },
          ],
        },
        {
          id: 'cross_track_insight',
          label: 'What you learned from their automation that is applicable to your own department',
          type: 'textarea',
          placeholder: 'Seeing how [peer\'s role track] automated [workflow], I realized that a similar approach could work for [your workflow] because ...',
          minLength: 75,
          required: true,
        },
        {
          id: 'governance_observation',
          label: 'One governance observation: something in their approach you would adopt or adapt',
          type: 'textarea',
          placeholder: 'Their approach to [governance element — data classification / ownership / training materials] was notable because ...',
          minLength: 50,
          required: true,
        },
      ],
    },
  ],
  roleTrackContent: {
    operations: {
      platformFocus: 'All W1–W5 platforms consolidated',
      deepDiveTopics: [
        'Operations capstone framing: process improvement at the team level',
        'Presenting automation impact to a non-technical audience',
        'Cross-track learning: what compliance and finance built that operations can use',
      ],
      activityVariations:
        'Operations capstone presentations should lead with the efficiency number — time saved per week and what that time is now redirected toward. Operations leaders need to demonstrate ROI to leadership in terms that connect to the institution\'s efficiency ratio.',
      skillExamples: [
        'Operations capstone story: "We went from [X hours/week] on exception reporting to [Y hours/week]. The time savings is now redirected to [specific higher-value work]."',
        'Cross-track question to ask: Ask the compliance learner how they handle regulatory change triggers in their skill library — operations change management has the same problem.',
      ],
    },
    lending: {
      platformFocus: 'All W1–W5 platforms consolidated',
      deepDiveTopics: [
        'Lending capstone framing: throughput and pipeline velocity',
        'Connecting lending automation to credit quality and loan committee preparation',
        'Cross-track learning: what finance built that lending can use for ALCO reporting',
      ],
      activityVariations:
        'Lending capstone presentations should connect automation to pipeline velocity and loan committee preparation time. The metric that resonates with lending leadership: how many more files can a loan officer handle per week with AI-assisted document review?',
      skillExamples: [
        'Lending capstone story: "The pipeline status automation reduced loan committee prep from [X hours] to [Y hours]. That time went back into [member relationships / new application review]."',
        'Cross-track question to ask: Ask the compliance learner how they classify document analysis workflows — lending has the same Tier 3 data problem with loan files.',
      ],
    },
    compliance: {
      platformFocus: 'All W1–W5 platforms consolidated',
      deepDiveTopics: [
        'Compliance capstone framing: examination readiness and regulatory agility',
        'Connecting compliance automation to SR 11-7 requirements for AI governance',
        'Cross-track learning: what operations and finance built that compliance can validate',
      ],
      activityVariations:
        'Compliance capstone presentations should address the governance infrastructure built, not just the automations. Compliance learners are uniquely positioned to show how AI governance frameworks are built — their capstone demonstrates the institutional governance model that other departments need to adopt.',
      skillExamples: [
        'Compliance capstone story: "I built the institution\'s first departmental AI governance framework. The skill library structure I created is now the model for two other departments."',
        'Cross-track question to ask: Ask the operations learner about their change management process for automation updates — compliance change management has the same documentation requirement.',
      ],
    },
    finance: {
      platformFocus: 'All W1–W5 platforms consolidated',
      deepDiveTopics: [
        'Finance capstone framing: board and ALCO package quality and time savings',
        'Connecting finance automation to the institution\'s efficiency ratio',
        'Cross-track learning: what compliance built that finance can use for regulatory reporting',
      ],
      activityVariations:
        'Finance capstone presentations should include the efficiency ratio connection. Every hour saved in board package preparation is directly relevant to the institution\'s operating efficiency. Finance learners can quantify this connection more directly than any other role track.',
      skillExamples: [
        'Finance capstone story: "The variance commentary automation reduced board package preparation by [X hours/month]. Annualized, that is [X hours] of finance team time redirected to analysis rather than writing."',
        'Cross-track question to ask: Ask the compliance learner how they handle regulatory citation verification — finance has the same data accuracy requirement for board and regulatory filings.',
      ],
    },
    retail: {
      platformFocus: 'All W1–W5 platforms consolidated',
      deepDiveTopics: [
        'Retail capstone framing: member experience and branch efficiency',
        'Connecting retail automation to member satisfaction and service consistency',
        'Cross-track learning: what operations built that retail branches can use for daily reporting',
      ],
      activityVariations:
        'Retail capstone presentations should address both the efficiency story (branch reporting time) and the quality story (member communication consistency). Retail has the unique dual metric: staff time saved and member experience improved. Lead with both.',
      skillExamples: [
        'Retail capstone story: "The FAQ automation reduced repeat service inquiry handling time by [X%]. Branch staff now spend [Y fewer hours/week] on routine questions. The consistency of responses has also improved — members get the same answer regardless of which branch they call."',
        'Cross-track question to ask: Ask the operations learner about their exception routing automation — retail has the same escalation routing problem for service complaints.',
      ],
    },
  },
};
