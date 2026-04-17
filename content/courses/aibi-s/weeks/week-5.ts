// AiBI-S Week 5 — Build Your Departmental Skill Library
// Phase: Scale and Orchestrate | Week 5 of 6

import type { CohortWeek } from '../types';

export const week5: CohortWeek = {
  number: 5,
  phase: 'scale-and-orchestrate',
  title: 'Build Your Departmental Skill Library',
  estimatedLiveMinutes: 90,
  estimatedAssignmentMinutes: 150,
  whyThisWeekExists:
    'One automation is a personal achievement. A library of governed, documented, owned automations is an institutional capability. W5 moves from one deployment to three, establishes the ownership and maintenance infrastructure, and creates the training materials that let other team members run the automations without the builder present.',
  learningGoals: [
    'Build two additional automations beyond the W3 deployment, bringing the library to three total',
    'Assign named owners and maintenance schedules to all three automations',
    'Create training materials sufficient for a new team member to operate all three automations',
    'Document the library in a shared location accessible to all department staff',
  ],
  keyOutput: 'Three-skill library with documentation, ownership matrix, and staff training materials',
  sections: [
    {
      id: 'w5-s1',
      title: 'What a Skill Library Is — and What It Requires',
      content: `A departmental skill library is not a folder of prompts. It is a governed asset registry — a documented collection of AI-assisted workflows with named owners, maintenance schedules, and usage documentation.

The distinction matters because prompts decay. A prompt that works in April may produce different results in September because the underlying model has been updated, the regulatory context has changed, or the institutional data it depends on has shifted. Without a library structure, you have no mechanism to detect or respond to this decay.

A complete skill library entry has five components:

**1. Name and version.** Using the naming convention you established in W2.

**2. Purpose statement.** One sentence: "This automation [does X] for [Y workflow] so that [Z outcome]."

**3. Owner and backup.** The primary owner is accountable for accuracy and maintenance. The backup owner can operate and maintain the automation if the primary owner is unavailable.

**4. Data classification.** Which tier of data does this automation handle? What platform is it authorized to use? When was this classification last reviewed?

**5. Maintenance schedule.** When will the owner next review this automation for accuracy? What would trigger an unscheduled review? (Regulatory change, system migration, team structure change.)

This is the minimum viable governance structure for a community bank AI skill library. AiBI-L will extend it to the institutional level.`,
    },
    {
      id: 'w5-s2',
      title: 'Selecting Your Two Additional Automations',
      content: `Your W3 automation addressed the top candidate from your W1 work audit. For W5, select your second and third candidates. The criteria for selection are different now — you are building a portfolio, not a single tool.

**Principle 1: Cover different risk profiles.** If your W3 automation is in the middle of the risk spectrum (team-facing, Tier 2 data), consider one lower-risk automation (internal, Tier 1 data) and one higher-complexity automation that you will need careful governance for.

**Principle 2: Cover different roles on your team.** A skill library that only serves the manager is not a departmental asset — it is a personal productivity enhancement with extra documentation. At least one of your W5 automations should primarily serve a team member other than yourself.

**Principle 3: Build on what you learned in W3–W4.** The enhancement you identified in your W4 time savings report is a candidate for one of your W5 builds. Fix the gap you found.

**On scope:** It is better to build two well-documented, properly governed automations than three hastily assembled ones. The W5 assignment has a higher time estimate than W3 because documentation and training materials take time. Plan accordingly.`,
    },
    {
      id: 'w5-s3',
      title: 'Training Materials That Actually Work',
      content: `Training materials for AI automations fail for the same reasons that all training materials fail: they assume too much prior knowledge, they are too long to read before using the tool, and they are not updated when the automation changes.

The AiBI-S standard for training materials is a one-page job aid per automation:

**Section 1: When to use this automation (2–3 sentences).** What trigger should prompt a team member to reach for this tool? What does it replace?

**Section 2: What you need before you start (bullet list).** The data or documents the automation requires as input. Where to find them.

**Section 3: Step-by-step instructions (numbered list, maximum 8 steps).** Exactly what to do, in order, including where to paste the input and how to extract the output.

**Section 4: How to verify the output (2–3 specific checks).** Not "review for accuracy" — specific things to check. "Verify that all loan numbers in the output match the source pipeline report."

**Section 5: Who to contact if something seems wrong (name + contact method).** The named owner.

One page. Clear enough for someone who has never used AI before. Printed and posted in the workspace, or saved in the shared folder as a PDF.

This is the document that turns a personal automation into an institutional capability.`,
    },
  ],
  activities: [
    {
      id: '5.1',
      title: 'Departmental Skill Library — Three Automations',
      description:
        'Submit your three-automation skill library: the W3 automation with any enhancements from your W4 evaluation, plus two new automations. For each automation, provide a library entry (name, purpose, owner, data classification, maintenance schedule) and a one-page job aid following the W5 training materials format.',
      type: 'builder',
      estimatedMinutes: 150,
      submissionFormat: 'Structured form with document uploads',
      dueBy: 'Before the W6 live session',
      peerReview: true,
      peerReviewPrompt:
        'Review one of your peer\'s job aids (they will specify which one). Test the automation using the job aid instructions as your only guide — do not ask for clarification. Write 3–5 sentences: (1) were you able to complete the automation following the job aid alone, (2) was the verification step specific enough to catch an error, (3) one specific revision that would make the job aid clearer.',
      fields: [
        {
          id: 'library_entry_1',
          label: 'Automation 1 library entry (name/version, purpose, owner + backup, data tier, maintenance schedule)',
          type: 'textarea',
          placeholder: 'Name: [DEPT-FUNCTION-v1]\nPurpose: This automation [does X] for [workflow] so that [outcome]\nOwner: [role title]\nBackup: [role title]\nData tier: [1/2/3] | Platform: [name]\nNext maintenance review: [date]',
          minLength: 100,
          required: true,
        },
        {
          id: 'library_entry_2',
          label: 'Automation 2 library entry',
          type: 'textarea',
          placeholder: 'Name: [DEPT-FUNCTION-v1]\nPurpose: ...',
          minLength: 100,
          required: true,
        },
        {
          id: 'library_entry_3',
          label: 'Automation 3 library entry',
          type: 'textarea',
          placeholder: 'Name: [DEPT-FUNCTION-v1]\nPurpose: ...',
          minLength: 100,
          required: true,
        },
        {
          id: 'job_aid_description',
          label: 'Describe the one-page job aid for each automation (or upload files)',
          type: 'textarea',
          placeholder: 'Automation 1 job aid: [describe or paste the one-page format]\nAutomation 2 job aid: ...\nAutomation 3 job aid: ...',
          minLength: 150,
          required: true,
        },
        {
          id: 'w4_enhancement',
          label: 'What enhancement from your W4 evaluation did you implement in Automation 1, and what effect did it have?',
          type: 'textarea',
          placeholder: 'The enhancement I implemented was [specific change]. Before the enhancement, the [quality dimension] score was [X]. After: ...',
          minLength: 75,
          required: true,
        },
      ],
    },
  ],
  roleTrackContent: {
    operations: {
      platformFocus: 'Power Automate, Copilot in Excel, Copilot in Teams',
      deepDiveTopics: [
        'Building a reusable operational metrics narrative template',
        'Power Automate multi-step flow with approval stages',
        'Operations skill library structure and shared folder setup',
      ],
      activityVariations:
        'Operations skill libraries often have clear natural groupings: reporting automations, routing automations, and summary automations. Consider organizing your library by type rather than by specific workflow — it makes it easier to add to the library as the department grows.',
      skillExamples: [
        'Automation 2: Weekly operational metrics narrative for senior leadership (builds on W3 exception report)',
        'Automation 3: Team notification summary — key decisions and action items from operations meetings',
        'Job aid example: Exception report job aid with step-by-step instructions for operations coordinator',
      ],
    },
    lending: {
      platformFocus: 'Claude Projects, ChatGPT Custom GPTs',
      deepDiveTopics: [
        'Claude Project for loan committee package preparation',
        'Building a credit analysis context file library',
        'Pipeline reporting automation with multiple template variants',
      ],
      activityVariations:
        'Lending skill libraries often need multiple variants of similar automations — pipeline reports for different audiences (loan committee vs. ALCO vs. board) are the same underlying data formatted differently. Consider whether your three automations should cover one workflow at multiple levels of detail.',
      skillExamples: [
        'Automation 2: Loan committee package narrative — executive summary from credit memo',
        'Automation 3: Covenant monitoring exception summary for quarterly portfolio review',
        'Job aid example: Pipeline report job aid specifying exactly which data fields to include in the prompt',
      ],
    },
    compliance: {
      platformFocus: 'NotebookLM, Perplexity, Claude Projects',
      deepDiveTopics: [
        'Building a regulatory library in NotebookLM with version control',
        'Multi-source regulatory research workflow with citation verification',
        'Policy review automation: comparing new regulation to current policy',
      ],
      activityVariations:
        'Compliance skill libraries require the most rigorous maintenance schedules because regulatory requirements change. Your three automations should each have a specific regulatory trigger condition noted: "This automation must be reviewed immediately if [specific regulatory change] occurs." This is not optional for compliance workflows.',
      skillExamples: [
        'Automation 2: Regulatory impact analysis — new guidance enters, outputs a gap summary against current policy',
        'Automation 3: Examination information request (EIR) response template — structure and format, not content generation',
        'Job aid example: Regulatory digest job aid with verification step requiring manual citation check for every cited rule',
      ],
    },
    finance: {
      platformFocus: 'Claude Projects, Copilot in Excel',
      deepDiveTopics: [
        'Building a board package narrative system: multiple sections, consistent voice',
        'ALCO automation suite: rate risk + liquidity + concentration',
        'Context file versioning for financial commentary',
      ],
      activityVariations:
        'Finance skill libraries naturally align with reporting cycles: monthly, quarterly, annual. Consider structuring your three automations to cover a monthly cycle (variance commentary), a quarterly cycle (ALCO narrative), and an annual cycle (budget narrative or strategic review). This gives the library a clear scheduling structure.',
      skillExamples: [
        'Automation 2: ALCO packet narrative — rate sensitivity section from rate risk model output',
        'Automation 3: Budget variance executive summary — annual budget review section for board packet',
        'Job aid example: Variance commentary job aid specifying the exact data table format to paste into the prompt',
      ],
    },
    retail: {
      platformFocus: 'Copilot in Outlook, Copilot in Teams, ChatGPT Custom GPTs',
      deepDiveTopics: [
        'Building a member communication system with approval workflow',
        'Branch performance reporting suite: daily, weekly, monthly',
        'FAQ library maintenance: keeping the Custom GPT current',
      ],
      activityVariations:
        'Retail skill libraries should include an explicit approval workflow for any member-facing automation. Your three automations might include one for internal communications, one for team reporting, and one for member communication drafts — with the member-facing automation having the most detailed verification and approval steps in its job aid.',
      skillExamples: [
        'Automation 2: Weekly branch performance narrative for regional operations review',
        'Automation 3: Product cross-sell message draft — internal template for branch staff to personalize',
        'Job aid example: Member communication draft job aid with explicit step: "Do not send without manager review and edit"',
      ],
    },
  },
};
