import type { Unit } from '@/lib/aibi-s/types';
import { opsPeerDeptManagerPhase3 } from './persona-peer-dept-manager-phase-3';

export const opsUnit3_1: Unit = {
  id: '3.1',
  trackCode: 'ops',
  phase: 3,
  title: 'Build Your Departmental Skill Library',
  summary: "A skill library is not a folder of saved prompts. It's a managed asset registry with ownership, versioning, review cycles, and governance documentation — the difference between institutional capability and shadow AI that belongs to whoever built it.",
  beats: [
    {
      kind: 'learn',
      title: 'Skill library design: naming, ownership, versioning, review',
      body: `By Phase 3, you have at least one deployed skill. The question is no longer "can I build a skill?" — it's "can I manage a portfolio of them?"

**Library vs. personal workspace — the line that matters:**

A skill belongs in the departmental library when:
- It has been deployed to production (not still in draft)
- It has a named owner who is not solely the person who built it
- It has a data-tier declaration and a governance block
- It is being used by more than one person, OR it is intended for reuse if the original author leaves

A skill stays in personal workspace when:
- It's a draft or experiment
- It hasn't cleared the Compliance use-case inventory process
- It only runs with data that only one person handles

**Naming conventions — what works in practice:**

    [department]-[function]-[version]-[date]
    ops-exception-summary-v2-2026-03
    ops-alco-dataprep-v1-2025-11
    lending-cdd-checklist-v1-2026-01

The date is the last-reviewed date, not the creation date. A skill that hasn't been reviewed in 12 months gets a flag in the quarterly audit cycle.

**Ownership model:**

Every library entry requires two named roles:
- **Primary Owner** — accountable for the skill's accuracy, version currency, and documentation
- **Backup Owner** — can operate and update the skill if the primary is unavailable

Ownership gaps are the most common library failure. "Everyone uses it, no one owns it" is a shadow-AI situation regardless of whether the skill is formally in the library.

**Quarterly review cycle:**

Each quarter, the library owner reviews every entry against three questions:
1. Has the underlying data schema changed? (Core upgrades, field renames, export format changes)
2. Has the regulatory environment changed? (New examination guidance, updated framework interpretations)
3. Has the use case scope changed? (People using the skill for something it wasn't designed for)

A skill that fails any of these checks gets a version update or a retirement notice — not a patch and silence.

**What the library entry looks like:**

| Field | Required |
|---|---|
| Skill ID | Yes |
| Version | Yes |
| Primary Owner | Yes |
| Backup Owner | Yes |
| Data Tier | Yes |
| Regulatory Framework(s) | Yes |
| Known Failure Modes | Yes |
| Last Reviewed | Yes |
| Compliance Inventory Reference | Yes |
| Retire Trigger | Yes |

**Pillar A implication:** The skill library is the artifact that makes AI capability accessible across the department — not just for the person who built it. Without a library, your investment in skill-building leaves the institution every time someone changes roles.`,
      hooks: {
        pillar: 'A',
        frameworks: ['AIEOG'],
        dataTiers: [1, 2],
      },
    },

    {
      kind: 'practice',
      simKind: 'decision',
      scenario: `Your Compliance colleague, Marcus Patel, messages you. He's seen your exception-report summarization skill and wants to copy it for his own department's monthly SAR-narrative pre-screening workflow. He's asked for the skill file so he can adapt it himself.

Your skill is documented in the departmental library. Marcus's proposed use case would involve full SAR narratives — Tier 3 restricted data — rather than your redacted Tier 2 exception report.`,
      question: 'What do you do first?',
      options: [
        {
          id: 'opt-share-file',
          label: 'Share the skill file. Marcus is in Compliance — he can handle the data governance questions himself.',
          isCorrect: false,
          feedback: "Incorrect. Sharing the file creates a shadow copy of your skill operating outside the library governance structure. Marcus's adaptation would be a new use case with different data-tier requirements (Tier 3 vs. Tier 2), different regulatory framework applicability (BSA/AML SAR documentation standards), and potentially different HITL requirements. Sharing the file without any governance process creates exactly the \"copy, paste, and forget\" dynamic that causes shadow-AI incidents.",
          consequenceIfWrong: "Within 30 days, Marcus's team is running a modified version of your skill against Tier 3 SAR narrative data without a separate Compliance inventory entry. That's an exam finding — \"AI use case not in inventory\" — and it has your skill's DNA in it.",
        },
        {
          id: 'opt-library-fork',
          label: "Treat this as a library fork request: work with Marcus to create a new library entry for his use case, with a fresh RTFC+D+G authoring session that accounts for Tier 3 data and BSA/AML framework requirements.",
          isCorrect: true,
          feedback: "Correct. Your skill is a reference architecture, not a deployable template for a different data tier. Marcus's SAR-narrative use case requires a separate library entry because: (1) data tier changes from 2 to 3, triggering different TPRM documentation requirements, (2) BSA/AML framework applicability changes the HITL checkpoint design, and (3) ownership must be assigned to someone in Compliance, not Operations. A library fork creates a documented lineage — Marcus's skill traces back to yours — without inheriting your governance assumptions that don't apply to his use case.",
        },
        {
          id: 'opt-block',
          label: "Decline. Your skill was built for Operations and isn't appropriate for SAR workflows. Marcus should build his own from scratch.",
          isCorrect: false,
          feedback: "Partially correct in spirit — Marcus's workflow needs its own governance treatment — but \"build from scratch\" wastes the structural learning embedded in your RTFC+D+G documentation. The library is supposed to make institutional knowledge reusable. The right answer is a fork with appropriate modifications, not a full restart.",
        },
        {
          id: 'opt-ask-compliance',
          label: "Escalate to Compliance management before doing anything. This feels like a governance question above your level.",
          isCorrect: false,
          feedback: "Escalation isn't wrong, but it's not the first step. The library governance process you built is specifically designed to handle this kind of request — that's why you built it. Escalating immediately bypasses the process and suggests the library doesn't have enough structure to handle common extension requests. Use the process first; escalate if the process surfaces an unresolved gap.",
        },
      ],
      hooks: {
        pillar: 'A',
        frameworks: ['AIEOG', 'BSA/AML', 'Interagency TPRM'],
        dataTiers: [2, 3],
      },
    },

    {
      kind: 'apply',
      prompt: `Design the first three entries for your departmental skill library. Each entry must include:

- **Skill ID** (using the naming convention: [dept]-[function]-v[version]-[YYYY-MM])
- **One-sentence description** of what the skill does
- **Primary Owner** (role, not name) and **Backup Owner** (role, not name)
- **Data Tier** with rationale
- **Regulatory Framework(s)** that apply and why — be specific
- **Known Failure Modes** — at least two per entry
- **Retire Trigger** — what specific change would require this skill to be reviewed or retired?
- **Compliance Inventory Status** — whether this entry has cleared the use-case inventory process or is pending

After the three entries, write a 3-sentence governance statement: who owns the library as a whole, what the quarterly review process looks like, and what happens when the primary owner changes roles.`,
      guidance: `The most common gap in first-pass library designs is the ownership handoff scenario. "The next person will figure it out" is not a governance model. Your governance statement should describe specifically what the offboarding process looks like when a skill owner leaves or changes roles — and who ensures the backup owner has been trained before the handoff happens.`,
      minWords: 120,
    },

    {
      kind: 'defend',
      persona: opsPeerDeptManagerPhase3,
      hooks: {
        pillar: 'C',
        frameworks: ['AIEOG', 'ECOA/Reg B'],
        dataTiers: [2, 3],
      },
    },

    {
      kind: 'refine',
      guidance: `James pressed you on two things: (1) whether your library model handles ownership succession across department changes, and (2) whether the governance structure would work for Lending, which operates under ECOA/Reg B as a constant constraint. Revise your three library entries and governance statement to address both. You don't need to solve Lending's library for James — but you do need to show your model is extensible enough that another department could adapt it without rebuilding from scratch.`,
    },

    {
      kind: 'capture',
      artifactLabel: 'Unit 3.1 — /Ops — Departmental skill library: first three entries + governance statement',
    },
  ],
};
