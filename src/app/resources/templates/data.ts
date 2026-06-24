// Templates registry for /resources/templates/[slug].
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

import { TEMPLATE_INDEX, type TemplateSlug, type TemplateIndexEntry } from './templateIndex';

export type { TemplateSlug } from './templateIndex';

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

type TemplateBase = Omit<TemplateIndexEntry, 'preview'>;

const TEMPLATE_BASE_BY_SLUG = Object.fromEntries(
  TEMPLATE_INDEX.map(({ preview: _preview, ...template }) => [template.slug, template]),
) as Record<TemplateSlug, TemplateBase>;

function templateBase(slug: TemplateSlug): TemplateBase {
  return TEMPLATE_BASE_BY_SLUG[slug];
}

export const TEMPLATES: readonly Template[] = [
  {
    ...templateBase('ai-use-case-inventory'),
    sourcedFrom: [
      'AIEOG AI Lexicon — AI governance, AI use case inventory',
      'SR 11-7 Model Risk Management Guidance',
      'Interagency TPRM Guidance',
    ],
    sections: [
      {
        heading: 'Use case',
        intro:
          'Name the AI-assisted work in plain language. The title should tell a reviewer what staff are trying to accomplish without needing a demo.',
        items: [
          'Business purpose: the operational, member, risk, or compliance reason this use case exists.',
          'Owning department and named owner.',
          'Current status: proposed, sandbox, approved, restricted, retired.',
        ],
      },
      {
        heading: 'Tool and vendor',
        intro:
          'Record the exact tool being used, including whether it is a public AI service, a vendor feature, or a private deployment.',
        items: [
          'Tool name, vendor, and version if known.',
          'Approved-list status and approval date.',
          'Vendor agreement, retention setting, and review owner.',
        ],
      },
      {
        heading: 'Data class',
        intro:
          'Document the highest-risk data that may enter the workflow. If the workflow can operate without confidential or regulated data, say so explicitly.',
        items: [
          'Public, internal, confidential, NPI, regulated, or examination-sensitive.',
          'Whether customer-identifying data is prohibited, restricted, or allowed only in an approved private tool.',
          'Sanitization rule before any prompt is used.',
        ],
      },
      {
        heading: 'Human review',
        intro:
          'Every reusable AI workflow needs a named review point before output is relied on, sent, filed, or shared.',
        items: [
          'Reviewer role and backup reviewer.',
          'Review criteria: accuracy, data handling, regulatory references, tone, and final-use approval.',
          'Evidence retained: prompt, output, reviewer notation, or ticket reference.',
        ],
      },
      {
        heading: 'Risk tier and cadence',
        intro:
          'Assign a risk tier and a review cadence so the inventory remains useful after the first approval conversation.',
        items: [
          'Low, medium, high, or blocked with reason.',
          'Re-review trigger: tool change, policy change, incident, vendor update, or annual cycle.',
          'Next review date and accountable owner.',
        ],
      },
    ],
  },
  {
    ...templateBase('ai-use-policy-starter'),
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
    ...templateBase('ai-workflow-sop'),
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
    ...templateBase('board-briefing-checklist'),
    sourcedFrom: [
      'GAO 25-107197 — no comprehensive AI-specific banking framework yet',
      'AIEOG AI Lexicon — AI governance, AI use case inventory',
      'Bank Director 2024 Technology Survey (via Jack Henry)',
    ],
    sections: [
      {
        heading: 'The board’s job, in one sentence',
        intro:
          'The board does not need an AI tutorial. It needs to approve four things — scope, the data line, an accountable owner, and one funded pilot — and then see evidence next quarter. Run the briefing as four decisions, not a status update.',
      },
      {
        heading: 'Open with where you stand (2 minutes)',
        intro: 'Ground the room before asking for decisions. Four facts, one sentence each:',
        items: [
          'Readiness — name a number: “Our AI readiness score is [X/48]; the biggest gap is [governance / data handling].” A named baseline makes next quarter’s progress measurable.',
          'Peers — one sourced comparison: “Most institutions our size still have no AI governance framework (Jack Henry / Gartner, 2025) — moving now is a lead, not a risk.”',
          'Regulators — name who applies: SR 11-7 (model risk), Interagency TPRM (vendors), ECOA / Reg B (lending), BSA/AML, and the AIEOG AI Lexicon vocabulary (Feb 2026).',
          'Already approved — what the board has signed that touches AI: tech budget, vendor list, risk-appetite statement. Build on the record; don’t reopen it.',
        ],
      },
      {
        heading: 'The four motions to approve (with recommended defaults)',
        intro:
          'Bring these as motions with a recommended position, not open questions. The defaults are the lowest-risk, examiner-defensible starting envelope — adjust to your institution.',
        items: [
          'Scope — Recommended: approve AI for internal drafting, research, and summarization bank-wide; keep customer-facing and credit-decision use cases explicitly out of scope pending dedicated review. Why: highest value, lowest regulatory exposure to start.',
          'Data line — Recommended motion (adopt verbatim): “No customer NPI, account, or examination data may be entered into any public AI tool. Confidential institution data is permitted only in [approved enterprise tool] under the signed data-processing agreement.”',
          'Owner — Recommended: designate one accountable executive (typically CISO or COO) to own the AI use-case inventory and report to the board quarterly. Why: a single named owner is the first thing examiners look for — “the committee” is not an owner.',
          'Investment — Recommended: fund one pilot — one department, one use case, one success metric — this cycle; defer broad rollout until the pilot clears human review. Why: structured pilots beat bank-wide licenses with no training.',
        ],
      },
      {
        heading: 'Copy-paste: the one-page board memo',
        intro:
          'Drop this into your board packet and fill the brackets. Five lines is enough for most community-institution boards.',
        steps: [
          'Position: “[Institution] is adopting AI deliberately. Today we use it for [internal drafting / research]; we do not use it for [credit decisions / customer messaging].”',
          'Decision requested: approve the four motions above — scope, data line, owner, investment.',
          'Risk posture: “All AI output is draft work; a named human reviews anything that reaches a customer, examiner, or regulated process (human-in-the-loop).”',
          'Oversight: “[Owner] maintains the AI use-case inventory and reports quarterly — tools in use, incidents, training completion, and progress against our readiness baseline.”',
          'The ask: a motion to adopt the AI Use Policy and authorize the funded pilot.',
        ],
      },
      {
        heading: 'What to bring back next quarter (evidence)',
        intro: 'Tell the board now what you will show them next time, so oversight is a habit, not a fire drill.',
        items: [
          'The AI use-case inventory — what we run, who owns each, its risk tier. Example row: “Loan-memo drafting · Owner: VP Lending · Tool: [enterprise] · Data: internal only · Tier: medium · HITL: yes.”',
          'Incident log — anything flagged since the last briefing (even “none” demonstrates you are watching).',
          'Exam readiness — what we could show an examiner today: policy, inventory, vendor reviews, training records.',
          'Scorecard vs. the readiness baseline — what moved, what didn’t, and why.',
        ],
      },
      {
        heading: 'What good looks like — and the three mistakes to avoid',
        intro: 'A strong AI board decision is specific. Watch for these failure patterns:',
        items: [
          'Don’t approve “explore AI” with no scope — that is the decision examiners read as “no governance.”',
          'Don’t leave the owner as a committee — name a person, with quarterly reporting.',
          'Don’t skip the data line — staff pasting customer data into public tools is the highest-risk gap; the board should prohibit it in writing.',
        ],
      },
    ],
  },
  {
    slug: 'cdfi-grant-ai-evidence-checklist',
    title: 'CDFI Grant AI Evidence Checklist',
    dek: 'A mission-first checklist for documenting AI-assisted work in grant, impact, and community-development evidence files.',
    audience: 'CDFI, MDI, community development, grants, and impact teams',
    readMinutes: 7,
    sourcedFrom: [
      'AIEOG AI Lexicon — AI governance, AI use case inventory',
      'Your grant agreement, award conditions, and reporting instructions',
      'Institution records retention policy',
    ],
    sections: [
      {
        heading: 'Grant or impact goal',
        intro:
          'Name the mission outcome the AI-assisted work supports. Keep the language tied to the grant, program, or community-development plan rather than the tool.',
        items: [
          'Program, grant, or internal initiative name.',
          'Target community, member, borrower, or small-business segment.',
          'Outcome being supported: access, speed, language clarity, documentation quality, or staff capacity.',
        ],
      },
      {
        heading: 'AI-assisted task',
        intro:
          'Describe the exact staff task where AI helps. The task should be internal and reviewable before any member, borrower, funder, or examiner sees the output.',
        items: [
          'Drafting narrative, summarizing outreach notes, organizing evidence, or improving plain-language explanations.',
          'Approved tool and owner.',
          'Human reviewer and backup reviewer.',
        ],
      },
      {
        heading: 'Data boundary',
        intro:
          'State what may and may not enter the AI tool. If real member, borrower, or applicant data is not allowed, write that plainly.',
        items: [
          'Allowed inputs: public program language, internal templates, de-identified summaries, or synthetic examples.',
          'Blocked inputs: NPI, account numbers, loan details, full applications, demographic data, or examination-sensitive material unless an approved private tool and agreement cover it.',
          'Sanitization step before prompting.',
        ],
      },
      {
        heading: 'Evidence retained',
        intro:
          'Keep enough evidence to show the work was controlled without turning the file into a tool log dump.',
        items: [
          'Prompt or working brief used.',
          'Source material referenced.',
          'AI draft or summary, if retained under policy.',
          'Reviewer note, correction, and final-use decision.',
          'Where the final artifact is stored.',
        ],
      },
      {
        heading: 'Fairness and mission check',
        intro:
          'Before using the output, ask whether the AI-assisted work could narrow access, confuse applicants, or hide a policy decision.',
        items: [
          'Does the output preserve the institution’s mission and plain-language standard?',
          'Could any member, borrower, or applicant group be disadvantaged by the wording or process?',
          'Did a human verify that the output matches approved program criteria?',
        ],
      },
      {
        heading: 'Reporting note',
        intro:
          'When the work supports a grant file or impact report, add a short note that separates AI assistance from the institution’s final judgment.',
        steps: [
          'Describe the human-owned decision or final artifact.',
          'Name the AI-assisted support task.',
          'Name the reviewer and date.',
          'Reference the retained evidence file.',
        ],
      },
    ],
  },
  {
    ...templateBase('gtm-plan'),
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
