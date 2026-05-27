// Templates registry for /research/templates/[slug].
//
// Each template is a structured, usable document a banker can read and
// copy. Content is intentionally short and concrete — these are starters,
// not exhaustive policies. Banks adapt before adopting.
//
// Source discipline (per CLAUDE.md):
//   - AIEOG AI Lexicon (US Treasury / FBIIC / FSSCC · Feb 2026)
//   - SR 11-7 (Model risk management)
//   - Interagency TPRM Guidance
//   - ECOA / Reg B
//   - GAO 25-107197 (May 2025)

export type TemplateSlug =
  | 'ai-use-policy-starter'
  | 'ai-workflow-sop'
  | 'board-briefing-checklist'
  | 'gtm-plan';

export interface TemplateSection {
  readonly heading: string;
  readonly intro?: string;
  readonly items?: readonly string[];
  /** Numbered (ordered) list — used for step-by-step sections. */
  readonly steps?: readonly string[];
}

export interface Template {
  readonly slug: TemplateSlug;
  readonly title: string;
  readonly dek: string;
  /** "Compliance teams" / "Operations leads" — who this is for. */
  readonly audience: string;
  /** Rough read/fill time in minutes. */
  readonly readMinutes: number;
  /** What grounds the template — cite named docs. */
  readonly sourcedFrom: readonly string[];
  readonly sections: readonly TemplateSection[];
}

export const TEMPLATES: readonly Template[] = [
  {
    slug: 'ai-use-policy-starter',
    title: 'AI Use Policy Starter',
    dek: 'A starter policy your team can adapt in an afternoon. Defines allowed tools, allowed data, review requirements, and an incident path.',
    audience: 'Compliance, risk, and senior management',
    readMinutes: 8,
    sourcedFrom: [
      'AIEOG AI Lexicon — US Treasury / FBIIC / FSSCC, Feb 2026',
      'SR 11-7 Model Risk Management Guidance',
      'Interagency TPRM Guidance',
    ],
    sections: [
      {
        heading: 'Purpose',
        intro:
          'This policy governs how staff at [Institution] use generative AI tools in the course of work. It applies to any tool that takes free-text input and returns generated text, images, or code — whether vendor-hosted (e.g., Claude, ChatGPT, Gemini), embedded in a vendor product, or self-hosted.',
      },
      {
        heading: 'Allowed tools',
        intro:
          'Only AI tools on the approved list may be used for institution work. The approved list is maintained by [Owner role] and reviewed at minimum quarterly.',
        items: [
          'Tools on the approved list have a signed vendor agreement covering data handling.',
          'Personal accounts on consumer AI services are prohibited for any institution data.',
          'A tool moves to the approved list only after Compliance and InfoSec sign-off.',
        ],
      },
      {
        heading: 'Allowed data',
        intro:
          'Inputs to AI tools follow the institution’s data classification scheme. Use this as a starting matrix and adjust per your policies:',
        items: [
          'Public information: allowed without restriction.',
          'Internal information (procedures, drafts, summaries): allowed in approved tools only.',
          'Confidential (customer data, NPI, account details, transaction data): not permitted in any AI tool unless the vendor agreement explicitly covers it and the tool runs in an approved private deployment.',
          'Regulated data (BSA/AML detail, SARs, loan decisioning rationale, examination work product): not permitted.',
        ],
      },
      {
        heading: 'Human-in-the-loop requirement',
        intro:
          'AI outputs are draft work product. Every artifact that touches a customer, an examiner, or a regulated process requires documented human review before use.',
        items: [
          'The reviewer is identified by name and role on the artifact.',
          'The reviewer attests that they verified factual claims, calculations, and any regulatory references.',
          'Review evidence is retained for the period defined by [Institution]’s records retention schedule.',
        ],
      },
      {
        heading: 'Documentation',
        intro:
          'For AI-assisted work that produces a customer-facing or examiner-relevant artifact, staff document:',
        items: [
          'Which approved tool was used.',
          'The prompt or instruction provided.',
          'The data class of the input.',
          'The human reviewer and date of review.',
        ],
      },
      {
        heading: 'Incidents',
        intro:
          'Suspected policy violations, prompt injections, model misuse, or accidental disclosure of regulated data follow the institution’s existing incident response procedure with one addition:',
        items: [
          'Notify [Compliance owner] and [InfoSec owner] within 24 hours of discovery.',
          'Preserve the prompt, output, and any downstream artifacts for review.',
          'Do not delete tool history while the incident is open.',
        ],
      },
      {
        heading: 'Review cycle',
        intro: 'This policy is reviewed at minimum annually and on any of the following triggers:',
        items: [
          'A new tool is added to the approved list.',
          'A regulator issues new AI-specific guidance applicable to the institution.',
          'An incident review surfaces a policy gap.',
        ],
      },
    ],
  },
  {
    slug: 'ai-workflow-sop',
    title: 'AI Workflow SOP Template',
    dek: 'A one-page workflow SOP for any AI-assisted task. Documents the unit examiners actually look at: input, output, retention, review.',
    audience: 'Operations, compliance, lending, any team running AI-assisted work',
    readMinutes: 6,
    sourcedFrom: [
      'SR 11-7 Model Risk Management Guidance',
      'AIEOG AI Lexicon — AI use case inventory, HITL',
    ],
    sections: [
      {
        heading: 'Workflow name',
        intro:
          'Short, specific. "AI-assisted procedure cleanup for KYC refresh" — not "AI for compliance."',
      },
      {
        heading: 'Owner',
        intro: 'Named person and role. One owner per workflow.',
      },
      {
        heading: 'Purpose',
        intro:
          'One sentence on what this workflow produces and why it exists. The business outcome, not the tooling.',
      },
      {
        heading: 'Inputs',
        intro: 'Every input named, classified, and bounded:',
        items: [
          'Data sources (named systems, named files, or named buckets).',
          'Data class (public / internal / confidential / regulated).',
          'Volume — typical and maximum per run.',
          'Refresh cadence — when inputs are pulled fresh.',
        ],
      },
      {
        heading: 'AI tool',
        intro: 'The approved tool used in this workflow:',
        items: [
          'Tool name and version.',
          'Approved-list reference and approval date.',
          'Prompt template ID — the saved prompt this workflow runs.',
        ],
      },
      {
        heading: 'Output',
        intro: 'What the workflow produces:',
        items: [
          'Artifact type (document, summary, decision draft, etc.).',
          'Destination — where the output is stored.',
          'Intended consumer — who downstream uses it.',
        ],
      },
      {
        heading: 'Human review',
        intro: 'The HITL checkpoint:',
        items: [
          'Reviewer role.',
          'Review criteria — what the reviewer is checking for.',
          'Review evidence — how the reviewer’s attestation is captured (signature, ticket, notation on the artifact).',
        ],
      },
      {
        heading: 'Retention',
        intro: 'Per [Institution]’s records retention schedule:',
        items: [
          'Input retention period.',
          'Output retention period.',
          'Prompt / model interaction log retention period.',
          'Reviewer attestation retention period.',
        ],
      },
      {
        heading: 'Exceptions',
        intro:
          'What triggers an exception, who decides, and how the exception is documented. Default behavior on exception: stop the workflow and route to the owner.',
      },
      {
        heading: 'Review schedule',
        intro: 'When this SOP is re-reviewed:',
        items: [
          'Annually.',
          'On tool version change.',
          'On a regulatory change applicable to the workflow.',
          'On any incident involving this workflow.',
        ],
      },
    ],
  },
  {
    slug: 'board-briefing-checklist',
    title: 'Board / Leadership Briefing Checklist',
    dek: 'What to put in front of your board before, during, and after AI rollout. Twelve items, three categories.',
    audience: 'C-suite preparing AI briefings for board or executive committee',
    readMinutes: 5,
    sourcedFrom: [
      'GAO 25-107197 — no comprehensive AI-specific banking framework yet',
      'AIEOG AI Lexicon — AI governance, AI use case inventory',
      'Bank Director 2024 Technology Survey (via Jack Henry)',
    ],
    sections: [
      {
        heading: 'Before the briefing — context',
        intro: 'Four items the board needs to understand the room you’re in.',
        items: [
          'Where the institution stands on AI readiness today (named score or qualitative read).',
          'How peer institutions are positioned (sourced — FDIC bank-find, peer-cohort data).',
          'Which regulators apply (SR 11-7, ECOA / Reg B, Interagency TPRM, BSA/AML, applicable state guidance).',
          'What the board has already approved that may touch AI (tech budget, vendor list, risk appetite statement).',
        ],
      },
      {
        heading: 'During the briefing — the decisions',
        intro: 'Four items framed as decisions, not status updates.',
        items: [
          'Scope: what use cases are in (named) and what use cases are explicitly out.',
          'Risk tolerance: what classes of data are allowed through AI tools, signed off by the board.',
          'Governance: who owns the AI use case inventory, who chairs the AI review forum, what cadence.',
          'Investment: what is being funded this cycle, what is being deferred.',
        ],
      },
      {
        heading: 'After the briefing — evidence',
        intro: 'Four items the board should expect to see at the next briefing.',
        items: [
          'The AI use case inventory — what we are running, who owns each, what tier of risk.',
          'Incident log — anything flagged since the last briefing.',
          'Compliance review readiness — what we can show an examiner today.',
          'A scorecard against the AI readiness baseline — what moved, what didn’t.',
        ],
      },
    ],
  },
  {
    slug: 'gtm-plan',
    title: 'Go-to-Market Plan for an AI Initiative',
    dek: 'A go-to-market plan for launching an AI capability inside a community bank or credit union. Six sections, one page.',
    audience: 'Marketing, retail, and product leaders launching an AI capability internally or to members',
    readMinutes: 7,
    sourcedFrom: [
      'Apiture — Digital Loyalty Dividend (2025)',
      'Apiture — Digital Transformation for Community Banks (2025)',
    ],
    sections: [
      {
        heading: 'Audience',
        intro:
          'Who this is for, in concrete terms. Avoid "all customers" or "all employees." Name the segment, role, or branch tier.',
        items: [
          'Internal audience: which roles, which branches, which department.',
          'External audience: which member segment, which channel they engage through.',
          'Influencers: examiners, board members, partner credit unions.',
        ],
      },
      {
        heading: 'Promise',
        intro: 'One sentence the audience can repeat without your help.',
        items: [
          'What changes for them.',
          'When it changes.',
          'What is not changing (the reassurance side of the promise).',
        ],
      },
      {
        heading: 'Proof',
        intro: 'What evidence supports the promise, sourced.',
        items: [
          'Internal: pilot results, time savings, sample artifacts produced.',
          'External: named industry sources, peer evidence, sourced consumer expectations.',
          'Regulatory: the governance and review structure under the capability.',
        ],
      },
      {
        heading: 'Channels',
        intro: 'Where the message lands.',
        items: [
          'Internal: all-hands, team huddles, intranet, manager talking points.',
          'External (members): app, email, branch signage, statement inserts as appropriate.',
          'External (industry): peer associations, your regulator relationship, ecosystem partners.',
        ],
      },
      {
        heading: 'Launch timeline',
        intro: 'Concrete dates. Without dates, this is not a plan.',
        items: [
          'Internal soft launch (small named group).',
          'Internal full launch (institution-wide).',
          'External announcement window — and explicit pre-announce silence period.',
          'First metrics review date.',
        ],
      },
      {
        heading: 'Metrics',
        intro: 'Three to five measurable signals. Defined before launch, not after.',
        items: [
          'Adoption — who is using it, at what cadence.',
          'Quality — what proportion of outputs pass review on first pass.',
          'Risk — incidents per period, with severity.',
          'Outcome — the business metric the capability is meant to move.',
        ],
      },
    ],
  },
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
