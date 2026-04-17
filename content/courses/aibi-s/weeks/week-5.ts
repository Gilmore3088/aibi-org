// AiBI-S Week 5: Build Your Departmental Skill Library
// Phase: Scale and Orchestrate | Estimated: 90 min live + 120-180 min assignment
// Key Output: 3-skill library with documentation, naming conventions, ownership assignments, training materials

import type { CohortWeek } from '../types';

export const week5: CohortWeek = {
  number: 5,
  phase: 'scale-and-orchestrate',
  title: 'Build Your Departmental Skill Library',
  estimatedLiveMinutes: 90,
  estimatedAssignmentMinutes: 150,
  keyOutput:
    '3-skill departmental library with library index, ownership matrix, review schedule, and one-page training guide per skill',
  whyThisWeekExists: `A single automation is a proof of concept. A skill library is infrastructure. Week 5 is where the learner transitions from "I built something that works" to "I built something my department can maintain without me." This is the week that creates the institutional capability that outlasts any individual.

The 5-stage organizational skill process from the AIDB pedagogy provides the framework. The learner has already completed stages 1 through 3 without naming them: Discovery happened in Week 1 (work audit), Curation happened in Weeks 1-3 (workflow selection and build), and Validation happened in Weeks 3-4 (deployment and measurement). Week 5 focuses on stages 4 and 5: Bundling and Ownership. These two stages are what transform a collection of experiments into a departmental asset.`,

  learningGoals: [
    'Apply the 5-stage organizational skill process to systematize the work done in Weeks 1-4',
    'Build a 3-skill departmental library using consistent naming conventions, categories, and structure',
    'Create an ownership matrix with quarterly review schedule and maintenance protocol',
    'Produce one-page training materials for each skill that enable handoff to team members who did not build them',
    'Apply change management principles to overcome the barriers that prevent colleagues from adopting new skills',
  ],

  sections: [
    {
      id: 'w5-five-stage-process',
      title: 'The 5-Stage Organizational Skill Process',
      content: `The five stages of building an organizational skill library are sequential. Skipping a stage produces a library that looks complete but does not function as infrastructure. Most institutional AI initiatives fail at stage 4 or 5 — they build skills but never bundle and own them, so the skills scatter and degrade.

**Stage 1 — Discovery:** Run work audits. Map the shadow skill landscape — identify what people are already doing with AI informally, without institutional knowledge. The goal is a prioritized inventory of automation candidates. You completed this in Week 1 (Activity 1.1).

**Stage 2 — Curation:** Prioritize by the frequency × time × standardization value matrix. Subject matter experts own skills, not engineers or IT. A skill built by the person who does the workflow is more accurate and more trusted than a skill built by someone who interviewed them about it. You completed this in Weeks 1-3 (workflow selection and build).

**Stage 3 — Validation:** Test against real scenarios. Compare output to the manual process baseline. Test with multiple users. Run the Litmus Test. Collect the measured time savings data. You completed this in Weeks 3-4 (deployment and measurement).

**Stage 4 — Bundling:** Package validated skills into the library. Define naming conventions, categories, and access. Version-control everything. This is Week 5, first half.

**Stage 5 — Ownership and Maintenance:** Assign a champion per skill. Establish a quarterly review schedule. Define a usage tracking approach. Create a deprecation process for when skills become obsolete. This is Week 5, second half.

Without stages 4 and 5, skills exist but the library does not. A skill that lives in your personal Claude Project, has no documentation that another person could follow, and has no named owner other than you is not in the library — it is a personal tool that happens to be useful. The library requires bundling and ownership.`,
    },
    {
      id: 'w5-naming-conventions',
      title: 'Skill Library Design: Naming Conventions and Categories',
      content: `**Naming convention:**

\`\`\`
[department]-[function]-v[n].md
\`\`\`

Examples:
- \`ops-exception-triage-v1.md\`
- \`lending-file-completeness-v2.md\`
- \`compliance-reg-change-monitor-v1.md\`
- \`finance-variance-narrative-v1.md\`
- \`retail-member-response-v1.md\`

Rules:
- Lowercase only. Hyphens only. No spaces. No camelCase.
- Department prefix matches the AiBI-S role track code: ops, lending, compliance, finance, retail.
- Function describes what the skill does using a verb-noun pattern, not what it is. "exception-triage" not "exceptions." "variance-narrative" not "variance-analysis-tool."
- Version number increments on every substantive change to instructions, output format, or constraints. Formatting-only changes do not increment.
- When a skill reaches v3, review whether it should be deprecated and rebuilt from scratch rather than patched again. A v3 skill is often carrying accumulated complexity from successive fixes.

**Category structure:**

Five categories cover the range of banking department workflows. Every skill in the library falls into exactly one category. The category is documented in the library index.

- **Analysis** — Skills that process data and produce insights. Variance analysis, exception triage, pipeline summary, efficiency ratio trend.
- **Communication** — Skills that draft messages, memos, or reports. Board memos, member responses, staff announcements, service recovery communications.
- **Research** — Skills that gather and synthesize information. Regulatory research, market analysis, competitor review, FDIC peer data analysis.
- **Quality Check** — Skills that verify completeness or compliance. Loan file completeness, policy gap analysis, data validation, checklist verification.
- **Reporting** — Skills that produce structured periodic outputs. Scorecards, ALCO narratives, dashboard commentary, trend narratives.`,
    },
    {
      id: 'w5-ownership-matrix',
      title: 'Ownership and Maintenance',
      content: `Every skill in the library has exactly one owner. The owner is accountable for:

- Reviewing the skill quarterly — or immediately when triggered by a model update, platform change, workflow change, or results degradation
- Incorporating feedback from users into the gotcha section and instructions
- Updating the version number and changelog when changes are made
- Training new team members on how to use the skill
- Deciding when to deprecate the skill and communicating that decision to the team

**The backup owner** is the person who takes over if the primary owner is unavailable. Every skill must have a backup owner before it enters the library. A skill with no backup owner is a single point of failure — the same institutional risk the library was designed to eliminate.

**Review triggers:** Quarterly reviews are the default. But four events should trigger an immediate review regardless of schedule: (1) a model update from the AI platform provider, (2) a change to the underlying workflow the skill automates, (3) a change to the relevant regulatory framework, (4) three consecutive runs producing "heavy editing" or worse output.

**Deprecation process:** A skill is deprecated when it no longer produces acceptable output and cannot be fixed with reasonable effort, or when the underlying workflow it supports has been replaced. Deprecated skills are not deleted — they are moved to an archive folder with a deprecation note explaining why and what replaced them. Archive records matter because examiners may ask about AI tools that were used in the past.`,
    },
    {
      id: 'w5-change-management',
      title: 'Change Management: Getting Your Team to Actually Use What You Built',
      content: `Building a skill library is engineering. Getting colleagues to use it is change management. These are different disciplines. Many AiBI-S learners build excellent skills that their teams rarely use because the adoption work was not done.

Five barriers appear repeatedly in community banking AI deployments, each with a tested countermeasure:

**Skepticism — "I can do it faster manually."** The countermeasure is the time savings data from Week 4. Real numbers from the learner's own department defeat theoretical objections. "I know it seems faster manually. Before we deployed this, I timed it. The manual process averaged 42 minutes. With the automation, it averages 8 minutes. I have 3 weeks of data."

**Fear — "What if I break something?"** The countermeasure is the gotcha section and constraints. Walk the colleague through the gotcha section before their first use. Show them that the failure modes have been documented and the constraints prevent the most likely mistakes. "The skill is designed to tell you if something looks wrong. It cannot submit anything — it only drafts."

**Inertia — "I'll try it later."** The countermeasure is making the first use effortless. Do not email the skill file and expect adoption. Set up the workspace on the colleague's machine during a 10-minute session. Run the skill with them once, on a real task. Once they have used it successfully once, the barrier drops significantly.

**Not-invented-here — "I have my own way of doing this."** The countermeasure is ownership. Invite the colleague to contribute their approach to the skill. A skill owner who contributed to the design is more likely to use and advocate for it. "I want to add your approach to the instructions. Can we sit down and I'll incorporate what you do differently?"

**Lack of trust — "How do I know the output is accurate?"** The countermeasure is the validation data from Weeks 3-4. Show the test run documentation. Show the before/after quality comparison. "Here are 15 runs. In 13 of them, the output was used directly. In 2 of them, one number needed correction. Here is what to check every time."`,
    },
    {
      id: 'w5-training-materials',
      title: 'Training Materials: What Makes a Skill Teachable',
      content: `A skill that cannot be taught to someone who did not build it is a personal tool, not an institutional asset. Training materials are the bridge between the skill as the builder understands it and the skill as a new user needs to understand it.

Five components are required for every skill in the library:

**1 — One-page quick start guide:** What the skill does (one sentence). When to use it (the trigger — what event or situation should cause a team member to reach for this skill). How to activate it (step-by-step, with screenshots if the platform requires navigation). What to expect as output (what the sections mean, what requires human review before acting).

**2 — Input specification:** Exactly what data or content to provide. What format (paste from Excel, copy from email, type manually). Examples of good inputs and bad inputs — the bad input examples are as important as the good ones because they show where the gotcha section matters.

**3 — Output interpretation guide:** How to read the output. What each section means. Which parts are reliable enough to use directly and which parts require verification. What the [HUMAN REVIEW REQUIRED] flags mean and what to do when they appear.

**4 — Common issues and fixes:** A plain-language version of the gotcha section, written for someone who has never seen the skill internals. Not "the model hallucinated due to insufficient context" but "if the output section labeled 'Exceptions' is blank when you know there are exceptions, check that you pasted the full report data, not just the summary tab."

**5 — Who to contact:** The skill owner's name and how to reach them. For questions during use. For when something goes wrong. For when the output seems off but the user is not sure why. The contact information transforms the training guide from a document into a support resource.`,
    },
  ],

  tables: [
    {
      id: 'w5-five-stages',
      caption: 'The 5-Stage Organizational Skill Process in AiBI-S',
      columns: [
        { header: 'Stage', key: 'stage' },
        { header: 'Activity', key: 'activity' },
        { header: 'When in AiBI-S', key: 'when' },
        { header: 'Key Output', key: 'output' },
      ],
      rows: [
        {
          stage: '1. Discovery',
          activity: 'Run work audits. Map shadow AI use. Identify automation candidates.',
          when: 'Week 1 (Activity 1.1)',
          output: 'Work audit with 10+ workflows scored and prioritized',
        },
        {
          stage: '2. Curation',
          activity: 'Prioritize by frequency × time × standardization. Subject matter experts own skills.',
          when: 'Weeks 1-3 (workflow selection and build)',
          output: 'Top automation candidates identified and selected',
        },
        {
          stage: '3. Validation',
          activity: 'Test against real scenarios. Compare to manual process. Test with multiple users.',
          when: 'Weeks 3-4 (deployment and measurement)',
          output: 'Measured time savings, quality comparison, Litmus Test results',
        },
        {
          stage: '4. Bundling',
          activity: 'Package into skill library. Define naming conventions, categories, access. Version-control.',
          when: 'Week 5 (this week)',
          output: '3-skill library with consistent structure and naming',
        },
        {
          stage: '5. Ownership and Maintenance',
          activity: 'Assign a champion per skill. Quarterly review schedule. Usage tracking. Deprecation process.',
          when: 'Week 5 (this week)',
          output: 'Ownership matrix, review schedule, maintenance protocol',
        },
      ],
    },
    {
      id: 'w5-change-management-table',
      caption: 'Change Management: Five Adoption Barriers and Countermeasures',
      columns: [
        { header: 'Barrier', key: 'barrier' },
        { header: 'What It Looks Like', key: 'looks_like' },
        { header: 'Countermeasure', key: 'countermeasure' },
      ],
      rows: [
        {
          barrier: 'Skepticism',
          looks_like: '"I can do it faster manually"',
          countermeasure: 'Show the Week 4 time savings data. Real numbers from their own department defeat theoretical objections.',
        },
        {
          barrier: 'Fear',
          looks_like: '"What if I break something?"',
          countermeasure: 'Walk through the gotcha section together. Show them the constraints prevent the most likely mistakes.',
        },
        {
          barrier: 'Inertia',
          looks_like: '"I\'ll try it later"',
          countermeasure: 'Make the first use effortless. Set up the workspace on their machine. Run it with them once on a real task.',
        },
        {
          barrier: 'Not-invented-here',
          looks_like: '"I have my own way of doing this"',
          countermeasure: 'Invite them to contribute their approach. Ownership creates buy-in.',
        },
        {
          barrier: 'Lack of trust',
          looks_like: '"How do I know the output is accurate?"',
          countermeasure: 'Show the test run documentation and quality comparison from Weeks 3-4. Evidence defeats doubt.',
        },
      ],
    },
    {
      id: 'w5-library-categories',
      caption: 'Skill Library Category Structure',
      columns: [
        { header: 'Category', key: 'category' },
        { header: 'Description', key: 'description' },
        { header: 'Examples', key: 'examples' },
      ],
      rows: [
        {
          category: 'Analysis',
          description: 'Skills that process data and produce insights',
          examples: 'Variance analysis, exception triage, pipeline summary, efficiency ratio trend',
        },
        {
          category: 'Communication',
          description: 'Skills that draft messages, memos, or reports',
          examples: 'Board memos, member responses, staff announcements, service recovery communications',
        },
        {
          category: 'Research',
          description: 'Skills that gather and synthesize information',
          examples: 'Regulatory research, market analysis, competitor review, FDIC peer data synthesis',
        },
        {
          category: 'Quality Check',
          description: 'Skills that verify completeness or compliance',
          examples: 'Loan file completeness, policy gap analysis, data validation, checklist verification',
        },
        {
          category: 'Reporting',
          description: 'Skills that produce structured periodic outputs',
          examples: 'Scorecards, ALCO narratives, dashboard commentary, trend narratives',
        },
      ],
    },
  ],

  activities: [
    {
      id: '5.1',
      title: 'Create a 3-Skill Departmental Library',
      description: `Build a departmental skill library containing a minimum of 3 skills. One of these is the automation from Week 3 — already deployed and measured. The other two are new builds from your work audit's top remaining candidates.

**Requirements:**

1. **3 skill files** — Each following the naming convention (\`[dept]-[function]-v[n].md\`) and the extended skill anatomy (name, description, instructions, output format, gotcha section, constraints, data classification). Each file under 500 lines. References in separate files if needed.

2. **Library index** — A single document listing all 3 skills with: name, category, one-sentence description, owner, backup owner, date created, current version, data tier handled, and status (Active / Under Review / Deprecated).

3. **Ownership matrix** — Completed ownership matrix for all 3 skills with: primary owner, backup owner, date of last review, date of next scheduled review, and review trigger conditions.

4. **Training materials** — One-page quick start guide for each of the 3 skills (5 components: what it does, how to activate it, input specification, output interpretation, common issues and fixes, who to contact).

5. **Deployment evidence** — Evidence that at least the Week 3 skill is in active use by someone other than the builder. Screenshot, colleague confirmation, or usage log showing the skill has been used independently.

**Peer review:** Each learner's library index and one quick start guide are reviewed by a peer from a different role track. The peer reviewer answers: "Based on this documentation alone — without seeing the skill file — could I understand what this skill does, when to use it, and how to use it?" This cross-track perspective tests whether the documentation is truly self-sufficient or still relies on the builder's knowledge.`,
      type: 'builder',
      estimatedMinutes: 150,
      submissionFormat:
        '3 skill files (.md), library index document (.md or Word), ownership matrix (.md or spreadsheet), 3 quick start guides (one per skill, one page each), deployment evidence for the Week 3 skill.',
      dueBy: 'Before the W6 live session',
      peerReview: true,
      peerReviewPrompt:
        "Read the library index and one quick start guide (your choice) from your assigned peer (from a different role track). Answer: Based on this documentation alone — without seeing the skill file itself — could you understand what this skill does, when to use it, how to activate it, and what to do if something goes wrong? Note one thing that was clear and one thing that would leave you uncertain.",
      fields: [
        {
          id: 'skill-1-name',
          label: 'Skill 1 Name (follow naming convention)',
          type: 'text',
          placeholder: 'e.g. ops-exception-triage-v1.md',
          required: true,
        },
        {
          id: 'skill-1-category',
          label: 'Skill 1 Category',
          type: 'select',
          required: true,
          options: [
            { value: 'analysis', label: 'Analysis' },
            { value: 'communication', label: 'Communication' },
            { value: 'research', label: 'Research' },
            { value: 'quality-check', label: 'Quality Check' },
            { value: 'reporting', label: 'Reporting' },
          ],
        },
        {
          id: 'skill-2-name',
          label: 'Skill 2 Name',
          type: 'text',
          placeholder: 'e.g. ops-meeting-actions-v1.md',
          required: true,
        },
        {
          id: 'skill-2-category',
          label: 'Skill 2 Category',
          type: 'select',
          required: true,
          options: [
            { value: 'analysis', label: 'Analysis' },
            { value: 'communication', label: 'Communication' },
            { value: 'research', label: 'Research' },
            { value: 'quality-check', label: 'Quality Check' },
            { value: 'reporting', label: 'Reporting' },
          ],
        },
        {
          id: 'skill-3-name',
          label: 'Skill 3 Name',
          type: 'text',
          placeholder: 'e.g. ops-scorecard-narrative-v1.md',
          required: true,
        },
        {
          id: 'skill-3-category',
          label: 'Skill 3 Category',
          type: 'select',
          required: true,
          options: [
            { value: 'analysis', label: 'Analysis' },
            { value: 'communication', label: 'Communication' },
            { value: 'research', label: 'Research' },
            { value: 'quality-check', label: 'Quality Check' },
            { value: 'reporting', label: 'Reporting' },
          ],
        },
        {
          id: 'ownership-matrix-summary',
          label: 'Ownership Matrix Summary (owner, backup owner, next review date for each skill)',
          type: 'textarea',
          required: true,
          minLength: 100,
        },
        {
          id: 'adoption-evidence',
          label: 'Adoption Evidence: What change management steps did you take, and what was the result?',
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
      platformFocus: 'Copilot in Microsoft 365 and Power Automate for library hosting and skill access',
      deepDiveTopics: [
        'Bundling operations skills: exception triage (Analysis), meeting action tracker (Communication), and operational scorecard narrative (Reporting) are the natural three-skill library for most operations teams.',
        'Library hosting for operations: skills can be stored in a SharePoint document library with a Teams channel for notifications. Power Automate can notify the team when a skill is updated or a review is due.',
        'Operations ownership matrix: the operations manager is typically the primary owner for all three skills initially. Backup owners should be the most AI-capable team leads. Review cadence should align with model update cycles from Microsoft (typically quarterly for Copilot features).',
        'Change management for operations teams: operations staff are often the most metric-driven in the institution. The time savings data from Week 4 is the most effective adoption tool. Present the data at the next team meeting, not in an email.',
      ],
      activityVariations:
        'Operations skill library should include at least one skill in each of the highest-frequency categories: one Analysis skill (exception triage or scorecard narrative), one Communication skill (meeting action tracker or follow-up draft), and one that fits the team\'s third most frequent automation candidate from the work audit. All three should be deployed in a shared location — SharePoint folder, shared Teams channel, or shared Claude Project — before the Week 5 submission.',
      skillExamples: [
        'ops-exception-triage-v1.md — Analysis — classifies exceptions by type and priority, produces summary with owner assignments',
        'ops-meeting-actions-v1.md — Communication — processes Teams transcript into action items with owners and deadlines',
        'ops-scorecard-narrative-v1.md — Reporting — converts monthly metrics table into narrative commentary for board reporting',
      ],
    },
    lending: {
      platformFocus: 'Claude Projects for library hosting, shared project folders for skill file storage',
      deepDiveTopics: [
        'Bundling lending skills: loan file completeness (Quality Check), pipeline status report (Reporting), and either credit policy check (Quality Check) or market research synthesis (Research) are the natural three-skill library for most lending teams.',
        'Library hosting for lending: a shared Claude Project with skill files uploaded as project knowledge is the most natural hosting approach. Loan officers access the project, and the skill files are visible in the project knowledge base.',
        'Lending ownership matrix: the lending manager or senior credit analyst is typically the primary owner. Backup owners should be officers who actively use the skills. Review triggers for lending skills include credit policy changes, product matrix updates, and new regulatory guidance from the CFPB or banking regulators.',
        'Change management for lending teams: loan officers are typically skeptical of AI for anything touching credit judgment. Frame the skill library explicitly around the non-judgment workflows — completeness checks, pipeline tracking, market research. Avoid positioning AI as a credit decision tool.',
      ],
      activityVariations:
        'Lending skill library should include at least one Quality Check skill (completeness check or credit policy check), one Reporting skill (pipeline status), and one Research skill (market conditions or regulatory research). All three must have explicit data handling documentation — lending workflows operate near Tier 3 data and the documentation must be clear about what never enters the AI platform.',
      skillExamples: [
        'lending-file-completeness-v1.md — Quality Check — compares document list against institution checklist, produces gap list and condition letter draft',
        'lending-pipeline-report-v1.md — Reporting — converts CRM export into stage-by-stage pipeline summary with conversion analysis',
        'lending-cre-research-v1.md — Research — synthesizes market conditions for a specified property type and submarket from public data sources',
      ],
    },
    compliance: {
      platformFocus: 'NotebookLM for policy library hosting, Claude Projects for analysis skill access',
      deepDiveTopics: [
        'Bundling compliance skills: regulatory change monitor (Research), policy gap analysis (Quality Check), and staff compliance communication (Communication) are the natural three-skill library for most compliance teams.',
        'Library hosting for compliance: the NotebookLM notebook from Week 2 becomes the policy library home. Compliance analysis skills live in a Claude Project. The library index document bridges the two platforms with clear instructions on which tool to use for which task.',
        'Compliance ownership matrix: the compliance officer is typically the primary owner. The BSA officer is a natural backup owner for BSA/AML-related skills. Review triggers for compliance skills are especially important — regulatory changes happen frequently and a skill based on outdated guidance creates examination risk.',
        'Change management for compliance teams: compliance staff are often the most cautious about AI adoption due to regulatory risk awareness. This is a feature, not a problem. Frame the skill library as a governance tool — documented, owned, reviewed, version-controlled. That framing is familiar and reassuring to compliance professionals.',
      ],
      activityVariations:
        'Compliance skill library requires the strictest documentation discipline of all five tracks. Every skill must have an explicit human review requirement documented in the training materials — not just the gotcha section of the skill file. The ownership matrix review schedule should be quarterly at minimum, with an immediate review trigger for any new regulatory guidance from the primary regulators.',
      skillExamples: [
        'compliance-reg-change-monitor-v1.md — Research — assesses regulatory developments for institutional policy impact, drafts staff communication',
        'compliance-policy-gap-v1.md — Quality Check — compares new guidance against current policies, identifies gaps and remediation steps',
        'compliance-staff-communication-v1.md — Communication — drafts plain-language compliance communications from regulatory change summaries',
      ],
    },
    finance: {
      platformFocus: 'Claude Projects for narrative skills, Copilot in Excel for analysis skills',
      deepDiveTopics: [
        'Bundling finance skills: variance analysis narrative (Reporting), ALCO scenario narrative (Analysis), and board memo drafting (Communication) are the natural three-skill library for most finance teams.',
        'Library hosting for finance: a Claude Project with the chart of accounts and reporting templates uploaded is the natural home for narrative skills. A SharePoint folder with annotated Excel templates covers the Copilot in Excel skills. The library index cross-references both locations.',
        'Finance ownership matrix: the CFO or controller is typically the primary owner. The financial analyst is a natural backup owner. Review triggers include chart of accounts changes, reporting template updates, regulatory changes to financial reporting standards, and any quarter where the AI-generated narrative required more than light editing.',
        'Change management for finance teams: finance staff are number-driven. The most effective adoption tool is showing the quality comparison from Week 4 alongside the time savings data. "The output is as accurate as what I produced manually, and it took 8 minutes instead of 45" is more persuasive to a CFO than any theoretical argument.',
      ],
      activityVariations:
        'Finance skill library should include at least one Reporting skill (variance narrative or board summary), one Analysis skill (ALCO scenario or efficiency ratio), and one Communication skill (board memo or management memo). The training materials must include a "numbers verification checklist" for each skill — finance output requires verification of every number before distribution, and the training guide must tell team members exactly which numbers to verify and how.',
      skillExamples: [
        'finance-variance-narrative-v1.md — Reporting — converts budget-vs-actual table into structured narrative with material variance explanations',
        'finance-alco-scenario-v1.md — Analysis — processes rate scenario data into balance sheet impact analysis with projection narrative',
        'finance-board-summary-v1.md — Communication — assembles departmental metrics into executive summary for board materials',
      ],
    },
    retail: {
      platformFocus: 'ChatGPT Custom GPTs and Copilot in Outlook for skill hosting and access',
      deepDiveTopics: [
        'Bundling retail skills: member inquiry response (Communication), branch daily briefing (Reporting), and service recovery communication (Communication) are the natural three-skill library for most retail teams.',
        'Library hosting for retail: the ChatGPT Custom GPT from Week 2 hosts the product knowledge FAQ. Copilot Custom Instructions hosts the communication templates. A shared Teams folder or SharePoint page indexes both with links and quick start guides.',
        'Retail ownership matrix: the branch manager or retail operations manager is typically the primary owner. A senior member services representative is a natural backup owner. Review triggers for retail skills include product rate changes, new product launches, policy changes that affect member communications, and any complaint that reveals a gap in the service recovery skill.',
        'Change management for retail teams: retail staff are the most people-oriented of all five tracks. Peer adoption is the most powerful change management tool. Once one branch champion uses the skill successfully and tells colleagues, adoption accelerates. Identify and cultivate the natural early adopter in the team.',
      ],
      activityVariations:
        'Retail skill library requires especially careful attention to the institution voice in training materials. The training materials should include 2-3 example outputs showing the skill in practice — branded to the institution voice so that a new team member immediately understands the tone standard. All training materials must remind users that member-identifying information is never entered into the skill and that all placeholders must be filled in before a communication is sent.',
      skillExamples: [
        'retail-member-response-v1.md — Communication — classifies inquiry type and produces draft response in institution voice with PII placeholders',
        'retail-branch-briefing-v1.md — Reporting — assembles daily inputs into structured morning brief for branch managers',
        'retail-service-recovery-v1.md — Communication — processes complaint details into empathy-resolution-next-steps draft in institution voice',
      ],
    },
  },
};
