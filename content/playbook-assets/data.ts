// Playbook asset registry — the per-role "Toolbox Assets" surfaced on
// every /playbooks/<role> page. Issue #327 (part B): the previous data
// shape listed asset names with no destination; this registry gives each
// "Ready" asset a real URL, real metadata, and a structured stub body
// that matches the PDF playbook look-and-feel.
//
// "Draft" assets are intentionally NOT included here — they render on the
// playbook page as visibly unclickable cards with a "Coming soon" badge.
//
// Content discipline (CLAUDE.md §15):
//   - No unsourced statistics. If a section references a regulation,
//     cite it: SR 11-7, AIEOG AI Lexicon (Feb 2026), Interagency TPRM
//     Guidance, ECOA/Reg B, FinCEN typology vocabulary.
//   - The asset body fields below are intentionally lean — the
//     structural PR ships the routes and styling; SMEs flesh out the
//     working copy in a follow-up.

export type PlaybookSlug =
  | 'bsa-aml'
  | 'compliance'
  | 'infosec'
  | 'lending'
  | 'marketing'
  | 'retail'
  | 'executive'
  | 'operations'
  | 'training-hr';

export type AssetKind =
  | 'Template'
  | 'Worksheet'
  | 'Checklist'
  | 'Reference'
  | 'Prompt'
  | 'Tool';

export interface AssetSection {
  readonly heading: string;
  readonly intro?: string;
  readonly items?: readonly string[];
  /** Numbered list — use for step-by-step procedures. */
  readonly steps?: readonly string[];
  /** Optional monospace prompt block, rendered with PDF-style dark surface. */
  readonly prompt?: string;
  /** Optional "principle" callout, cream surface with gold left rule. */
  readonly principle?: string;
}

export interface PlaybookAsset {
  readonly slug: string;
  readonly playbook: PlaybookSlug;
  readonly title: string;
  readonly kind: AssetKind;
  readonly dek: string;
  /** Who this artifact is written for — banker role / department. */
  readonly audience: string;
  /** Approximate read or fill time in minutes. */
  readonly readMinutes: number;
  /** Named sources the artifact relies on. CLAUDE.md §15. */
  readonly sourcedFrom: readonly string[];
  readonly sections: readonly AssetSection[];
}

// ---------------------------------------------------------------------------
// Asset content
//
// Structural stubs — sections are real, working copy is being finalized.
// The body of each asset is intentionally lean so the page renders cleanly
// and the structure is reviewable, but the working text is owned by SMEs.
// ---------------------------------------------------------------------------

const STUB_NOTICE =
  'This template is structured. The working copy is being finalized by our subject-matter editors — directionally accurate today, refined shortly.';

const PRINCIPLE_REVIEW =
  'Every AI-assisted artifact in this playbook is human-reviewed before it leaves your institution. The template enforces structure; the reviewer signs.';

// BSA / AML — 4 Ready
const BSA_AML: readonly PlaybookAsset[] = [
  {
    slug: 'sar-narrative-template',
    playbook: 'bsa-aml',
    title: 'SAR Narrative Template',
    kind: 'Template',
    dek: 'A starter narrative shell that enforces the FinCEN five-element structure (who, what, where, when, why) and prompts the reviewer signature line.',
    audience: 'BSA / AML analysts and officers',
    readMinutes: 6,
    sourcedFrom: [
      'FinCEN SAR narrative typology vocabulary',
      'BSA / AML Examination Manual (FFIEC)',
    ],
    sections: [
      {
        heading: 'What this template helps you do',
        intro: STUB_NOTICE,
        items: [
          'Open the narrative with a one-line summary of the activity (the "what").',
          'Walk through the five elements in the order FinCEN expects: who, what, where, when, why.',
          'Keep customer PII out of the AI prompt; the template prompts you to use customer reference codes only.',
          'Capture the reviewer signature line and filing-deadline tracker separately so the narrative itself stays self-contained.',
        ],
      },
      {
        heading: 'When to use it',
        items: [
          'Drafting a SAR narrative on a structuring pattern, third-party transfer ring, or layered cash deposit case.',
          'Recovering a narrative your reviewer kicked back for missing one of the five elements.',
        ],
      },
      {
        heading: 'Reviewer principle',
        principle: PRINCIPLE_REVIEW,
      },
    ],
  },
  {
    slug: 'alert-triage-worksheet',
    playbook: 'bsa-aml',
    title: 'Alert Triage Worksheet',
    kind: 'Worksheet',
    dek: 'A fill-in-the-blank triage sheet for AML alerts — capture the typology hypothesis, supporting evidence, and disposition reasoning before you commit a verdict.',
    audience: 'BSA / AML analysts',
    readMinutes: 5,
    sourcedFrom: ['FFIEC BSA / AML Examination Manual'],
    sections: [
      {
        heading: 'What this worksheet helps you do',
        intro: STUB_NOTICE,
        items: [
          'Force a typology hypothesis before evidence-gathering, so the analyst is testing a claim instead of pattern-matching.',
          'Separate "what I observed" from "what I concluded" — the worksheet has distinct fields for each.',
          'Document disposition reasoning so a future reviewer can follow the same path without you in the room.',
        ],
      },
      {
        heading: 'When to use it',
        items: [
          'Triaging any alert that escalates above auto-disposition thresholds.',
          'Re-opening a closed alert when new transaction activity surfaces on the same customer.',
        ],
      },
    ],
  },
  {
    slug: 'cdd-drift-comparison-template',
    playbook: 'bsa-aml',
    title: 'CDD Drift Comparison Template',
    kind: 'Template',
    dek: 'A side-by-side comparison framework for spotting CDD profile drift — expected behavior at onboarding vs. actual transaction patterns at review.',
    audience: 'BSA / AML analysts during CDD refresh cycles',
    readMinutes: 7,
    sourcedFrom: ['FinCEN Customer Due Diligence Rule (CDD Rule)'],
    sections: [
      {
        heading: 'What this template helps you do',
        intro: STUB_NOTICE,
        items: [
          'Capture the expected-behavior baseline established at onboarding in structured fields, not narrative.',
          'Surface the actual-behavior pattern from the review period in the same field shape, side-by-side.',
          'Make the drift visible — the template highlights field-level deltas so the reviewer can confirm whether escalation is warranted.',
        ],
      },
      {
        heading: 'When to use it',
        items: [
          'CDD refresh cycles for high-risk customers.',
          'Investigating an alert where the customer profile may have shifted since onboarding.',
        ],
      },
    ],
  },
  {
    slug: 'structuring-pattern-reference',
    playbook: 'bsa-aml',
    title: 'Structuring Pattern Reference',
    kind: 'Reference',
    dek: 'A reference card of common structuring patterns with the FinCEN typology vocabulary, calibrated to the kinds of transactions community banks actually see.',
    audience: 'BSA / AML analysts and front-line tellers',
    readMinutes: 4,
    sourcedFrom: ['FinCEN SAR narrative typology vocabulary'],
    sections: [
      {
        heading: 'What this reference covers',
        intro: STUB_NOTICE,
        items: [
          'The most common structuring patterns by transaction shape (cash deposits, wire layering, third-party transfers).',
          'The FinCEN typology vocabulary you should use in narratives so examiners recognize the pattern.',
          'A short list of red-flag combinations that warrant escalation even when no single transaction crosses a threshold.',
        ],
      },
    ],
  },
];

// Compliance — 4 Ready
const COMPLIANCE: readonly PlaybookAsset[] = [
  {
    slug: 'ai-use-case-intake-form',
    playbook: 'compliance',
    title: 'AI Use-Case Intake Form',
    kind: 'Template',
    dek: 'A structured intake form for any AI use case proposed by a business team — owner, data classification, decisioning impact, and the human review point.',
    audience: 'Compliance officers and AI governance leads',
    readMinutes: 8,
    sourcedFrom: [
      'AIEOG AI Lexicon (US Treasury / FBIIC / FSSCC, Feb 2026)',
      'SR 11-7 (Model Risk Management)',
    ],
    sections: [
      {
        heading: 'What this form captures',
        intro: STUB_NOTICE,
        items: [
          'Use-case name, business owner, and the specific decision or output the AI produces.',
          'Data classification of the inputs — public, internal, confidential, NPI / regulated.',
          'Whether the output drives a customer-facing decision (ECOA / Reg B implications).',
          'The human review point — who signs, on what cadence.',
        ],
      },
      {
        heading: 'When to use it',
        items: [
          'Before any AI tool is approved for a business workflow.',
          'On an annual review cycle for previously approved use cases.',
        ],
      },
      {
        heading: 'Why structured intake matters',
        principle:
          'A defensible AI inventory starts with a consistent intake form. Free-form requests produce free-form risk.',
      },
    ],
  },
  {
    slug: 'workflow-sop-template',
    playbook: 'compliance',
    title: 'Workflow SOP Template',
    kind: 'Template',
    dek: 'A standard operating procedure shell for AI-assisted workflows — the fields examiners actually look at: inputs, prompt boundary, review step, escalation path.',
    audience: 'Compliance officers and process owners',
    readMinutes: 6,
    sourcedFrom: ['SR 11-7', 'AIEOG AI Lexicon (Feb 2026)'],
    sections: [
      {
        heading: 'What this SOP enforces',
        intro: STUB_NOTICE,
        items: [
          'Inputs the AI tool is allowed to see — and the inputs that must be excluded.',
          'The prompt boundary: what the staff member is allowed to ask the tool to do.',
          'The human review step that gates any externally visible action.',
          'The escalation path when the AI output is uncertain or out of scope.',
        ],
      },
    ],
  },
  {
    slug: 'human-review-checklist',
    playbook: 'compliance',
    title: 'Human Review Checklist',
    kind: 'Checklist',
    dek: 'The pre-flight checklist a human reviewer runs before AI output is used externally — accuracy, bias, sourcing, disclosure.',
    audience: 'Human reviewers in any AI-assisted workflow',
    readMinutes: 4,
    sourcedFrom: ['SR 11-7', 'ECOA / Reg B'],
    sections: [
      {
        heading: 'Before this output leaves your institution',
        intro: STUB_NOTICE,
        items: [
          'I read the output end to end and can defend every claim in it.',
          'I checked for biased phrasing, especially around protected classes (ECOA / Reg B).',
          'I traced every cited fact to a source I can show an examiner.',
          'I confirmed no NPI / regulated data is exposed in the output.',
          'I recorded my review in the audit log with my name and timestamp.',
        ],
      },
    ],
  },
  {
    slug: 'data-handling-reference-card',
    playbook: 'compliance',
    title: 'Data Handling Reference Card',
    kind: 'Reference',
    dek: 'A one-page reference for what data is allowed in which AI tools, calibrated to your institution’s data classification policy.',
    audience: 'All staff using AI tools',
    readMinutes: 3,
    sourcedFrom: ['AIEOG AI Lexicon (Feb 2026)', 'Interagency TPRM Guidance'],
    sections: [
      {
        heading: 'What this card answers',
        intro: STUB_NOTICE,
        items: [
          'Which data classes are allowed in each approved AI tool.',
          'Which data classes are never allowed in any general-purpose AI tool, regardless of approval.',
          'The escalation path when you are uncertain about a specific input.',
        ],
      },
    ],
  },
];

// IT / InfoSec — 4 Ready
const INFOSEC: readonly PlaybookAsset[] = [
  {
    slug: 'tool-verdict-template',
    playbook: 'infosec',
    title: 'Tool Verdict Template',
    kind: 'Template',
    dek: 'A defensible verdict format for AI tool approval decisions — capability, data boundary, identity model, residual risk, and the verdict line itself.',
    audience: 'IT / InfoSec teams running AI tool reviews',
    readMinutes: 8,
    sourcedFrom: ['Interagency TPRM Guidance', 'AIEOG AI Lexicon (Feb 2026)'],
    sections: [
      {
        heading: 'What this verdict captures',
        intro: STUB_NOTICE,
        items: [
          'Capability statement — what the tool actually does, in one paragraph a non-technical reader understands.',
          'Data boundary — what classes of data the tool is permitted to see, and how that boundary is enforced.',
          'Identity model — how authenticated users are scoped (SSO? per-user keys? shared service account?).',
          'Residual risk — what could still go wrong after controls, and what compensates.',
          'Verdict — Approved / Approved with conditions / Not approved, with the conditions named.',
        ],
      },
    ],
  },
  {
    slug: 'data-classification-matrix',
    playbook: 'infosec',
    title: 'Data Classification Matrix',
    kind: 'Reference',
    dek: 'A two-axis matrix mapping data class against tool class — what is allowed where, what requires escalation, what is never permitted.',
    audience: 'IT / InfoSec and any staff handling AI tool inputs',
    readMinutes: 4,
    sourcedFrom: ['Interagency TPRM Guidance'],
    sections: [
      {
        heading: 'What this matrix shows',
        intro: STUB_NOTICE,
        items: [
          'Rows: data classes (Public, Internal, Confidential, NPI / Regulated).',
          'Columns: tool classes (General-purpose AI, Approved-private AI, On-premise AI).',
          'Cells: Allowed, Allowed with controls, Escalate, Never.',
        ],
      },
    ],
  },
  {
    slug: 'allowed-tools-catalog-template',
    playbook: 'infosec',
    title: 'Allowed-Tools Catalog Template',
    kind: 'Template',
    dek: 'A living catalog of approved AI tools with the data classes each is approved for, the identity model, and the review-cycle date.',
    audience: 'IT / InfoSec teams maintaining the AI tool inventory',
    readMinutes: 5,
    sourcedFrom: ['Interagency TPRM Guidance'],
    sections: [
      {
        heading: 'What this catalog tracks',
        intro: STUB_NOTICE,
        items: [
          'Tool name, vendor, and the business owner inside the institution.',
          'Data classes the tool is approved for (from the Data Classification Matrix).',
          'Identity model and access scope.',
          'Last review date and next review-cycle date.',
        ],
      },
    ],
  },
  {
    slug: 'shadow-ai-advisory-template',
    playbook: 'infosec',
    title: 'Shadow-AI Advisory Template',
    kind: 'Template',
    dek: 'A one-page advisory the IT / InfoSec team can issue when an unapproved AI tool surfaces in staff usage — what to stop, what to keep, what to escalate.',
    audience: 'IT / InfoSec teams responding to shadow-AI discovery',
    readMinutes: 5,
    sourcedFrom: ['Interagency TPRM Guidance'],
    sections: [
      {
        heading: 'What this advisory addresses',
        intro: STUB_NOTICE,
        items: [
          'What was discovered — tool name, where it surfaced, what data may have been exposed.',
          'Stop-the-bleeding actions — what staff should immediately stop doing while review is in progress.',
          'Keep-doing actions — what equivalent approved workflow exists today.',
          'Escalation path — who in IT and Compliance needs to be looped in, and on what timeline.',
        ],
      },
    ],
  },
];

// Lending — 4 Ready
const LENDING: readonly PlaybookAsset[] = [
  {
    slug: 'adverse-action-letter-tuner',
    playbook: 'lending',
    title: 'Adverse-Action Letter Tuner',
    kind: 'Tool',
    dek: 'A structured prompt that helps loan officers draft adverse-action letters that satisfy ECOA / Reg B specificity requirements — and flags fair-lending phrasing concerns before they ship.',
    audience: 'Loan officers and credit analysts drafting adverse-action notices',
    readMinutes: 7,
    sourcedFrom: ['ECOA / Reg B', 'Interagency Fair Lending Examination Procedures'],
    sections: [
      {
        heading: 'What this tuner enforces',
        intro: STUB_NOTICE,
        items: [
          'Specific principal reason(s) for the adverse action — not a generic category.',
          'Plain-language explanation a non-expert applicant can act on.',
          'ECOA / Reg B notice elements: credit decision, applicant rights, agency contact.',
          'Fair-lending phrasing review — flags language patterns associated with bias.',
        ],
      },
    ],
  },
  {
    slug: 'fair-lending-pre-check-checklist',
    playbook: 'lending',
    title: 'Fair-Lending Pre-Check Checklist',
    kind: 'Checklist',
    dek: 'A pre-decision checklist a loan reviewer runs before a denial or counter-offer is communicated — surfaces fair-lending concerns while they can still be addressed.',
    audience: 'Loan reviewers and credit officers',
    readMinutes: 4,
    sourcedFrom: ['ECOA / Reg B', 'Interagency Fair Lending Examination Procedures'],
    sections: [
      {
        heading: 'Before this decision is communicated',
        intro: STUB_NOTICE,
        items: [
          'Decision criteria applied to this applicant match the documented credit policy.',
          'Any exception to credit policy is documented with reviewer sign-off.',
          'Decision rationale references applicant-specific facts, not protected-class proxies.',
          'Adverse-action language has been pre-checked for bias-associated phrasing.',
          'Decision is consistent with how similarly situated applicants have been treated.',
        ],
      },
    ],
  },
  {
    slug: 'decision-summary-template',
    playbook: 'lending',
    title: 'Decision Summary Template',
    kind: 'Template',
    dek: 'A consistent decision-memo shell for loan approvals, denials, and counter-offers — the documentation an examiner expects to see and a successor reviewer can read cold.',
    audience: 'Loan reviewers and credit officers',
    readMinutes: 6,
    sourcedFrom: ['SR 11-7', 'Interagency Fair Lending Examination Procedures'],
    sections: [
      {
        heading: 'What this memo captures',
        intro: STUB_NOTICE,
        items: [
          'Applicant facts the decision relied on, with sources.',
          'Credit policy provisions the decision applied.',
          'Reviewer reasoning — the bridge from facts to verdict.',
          'Any exception flagged, with the override sign-off.',
        ],
      },
    ],
  },
  {
    slug: 'exception-memo-template',
    playbook: 'lending',
    title: 'Exception Memo Template',
    kind: 'Template',
    dek: 'A short, repeatable format for credit-policy exceptions — what the standard is, why this case warrants deviation, who authorized the override.',
    audience: 'Loan reviewers and credit committee members',
    readMinutes: 4,
    sourcedFrom: ['SR 11-7'],
    sections: [
      {
        heading: 'What this memo captures',
        intro: STUB_NOTICE,
        items: [
          'The credit-policy standard at issue.',
          'The applicant-specific facts that justify deviation.',
          'The compensating factors that reduce residual risk.',
          'The authority level required for this override, and who signed.',
        ],
      },
    ],
  },
];

// Marketing — 4 Ready
const MARKETING: readonly PlaybookAsset[] = [
  {
    slug: 'campaign-brief-template',
    playbook: 'marketing',
    title: 'Campaign Brief Template',
    kind: 'Template',
    dek: 'A one-page campaign brief shell that gives marketing, compliance, and product a shared starting point — audience, claim, disclosure posture, success measure.',
    audience: 'Marketing managers and product marketers',
    readMinutes: 5,
    sourcedFrom: ['UDAAP guidance', 'ECOA / Reg B'],
    sections: [
      {
        heading: 'What this brief locks down',
        intro: STUB_NOTICE,
        items: [
          'Audience — who is being reached, and who is intentionally excluded.',
          'Claim — what the campaign asserts about the product.',
          'Disclosure posture — what disclosures are required given the claim and audience.',
          'Success measure — the named, observable outcome that defines success.',
        ],
      },
    ],
  },
  {
    slug: 'disclosure-review-checklist',
    playbook: 'marketing',
    title: 'Disclosure Review Checklist',
    kind: 'Checklist',
    dek: 'A repeatable checklist for marketing-compliance review before a campaign ships — disclosure visibility, plain-language scoring, fair-lending phrasing review.',
    audience: 'Marketing and compliance reviewers',
    readMinutes: 4,
    sourcedFrom: ['UDAAP guidance', 'TILA / Reg Z (where applicable)'],
    sections: [
      {
        heading: 'Before this campaign ships',
        intro: STUB_NOTICE,
        items: [
          'All required disclosures are present and visible without scrolling past the offer.',
          'Plain-language scoring meets the institution’s readability standard.',
          'No language patterns associated with UDAAP risk (deceptive minimization, urgency without basis).',
          'Fair-lending phrasing reviewed for any audience-targeting language.',
        ],
      },
    ],
  },
  {
    slug: 'plain-language-translator-prompt',
    playbook: 'marketing',
    title: 'Plain-Language Translator Prompt',
    kind: 'Prompt',
    dek: 'A reusable AI prompt that translates regulatory and product-specification language into plain-language member-facing copy without losing accuracy.',
    audience: 'Marketing copywriters and compliance reviewers',
    readMinutes: 5,
    sourcedFrom: ['Plain Writing Act of 2010 principles', 'UDAAP guidance'],
    sections: [
      {
        heading: 'What this prompt enforces',
        intro: STUB_NOTICE,
        items: [
          'Reading-level target stated up front and applied throughout.',
          'Every claim in the source preserved — no quietly dropped qualifications.',
          'Required disclosures kept verbatim, not paraphrased.',
          'Reviewer is asked to verify, not to trust.',
        ],
      },
    ],
  },
  {
    slug: 'creative-brief-generator',
    playbook: 'marketing',
    title: 'Creative Brief Generator',
    kind: 'Tool',
    dek: 'A structured prompt that turns a one-paragraph campaign concept into a full creative brief — audience persona, key message, evidence, channel mix, success measure.',
    audience: 'Marketing managers scoping new campaigns',
    readMinutes: 6,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What this generator produces',
        intro: STUB_NOTICE,
        items: [
          'Audience persona grounded in your CRM segments, not invented archetypes.',
          'Key message phrased as a benefit statement, not a feature list.',
          'Supporting evidence — facts the campaign relies on, with internal sources.',
          'Channel mix recommendation calibrated to the audience.',
          'A named success measure tied to a CRM-observable event.',
        ],
      },
    ],
  },
];

// Retail / Branch — 4 Ready
const RETAIL: readonly PlaybookAsset[] = [
  {
    slug: 'branch-coaching-kit-template',
    playbook: 'retail',
    title: 'Branch Coaching Kit Template',
    kind: 'Template',
    dek: 'A weekly coaching kit shell for branch managers — service-recovery review, tool-fluency check, one named coaching priority per team member.',
    audience: 'Branch managers and retail leadership',
    readMinutes: 6,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What this kit drives',
        intro: STUB_NOTICE,
        items: [
          'A weekly service-recovery review — what went wrong, what we did, what the member experienced.',
          'A tool-fluency check — what AI-assisted workflow is each team member confident in.',
          'One named coaching priority per team member, with a one-week horizon.',
        ],
      },
    ],
  },
  {
    slug: 'service-recovery-message-template',
    playbook: 'retail',
    title: 'Service Recovery Message Template',
    kind: 'Template',
    dek: 'A message-shell library for the four most common service-recovery scenarios — calibrated to your institution’s brand voice, ready to personalize.',
    audience: 'Branch staff and member-services teams',
    readMinutes: 4,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What this template covers',
        intro: STUB_NOTICE,
        items: [
          'Scenario shells for: hold delay, debit fraud false-positive, fee dispute, account-opening hiccup.',
          'A consistent message shape: acknowledge, action, accountability, next step.',
          'Personalization prompts so the message never reads like a form letter.',
        ],
      },
    ],
  },
  {
    slug: 'one-page-procedure-cleanup',
    playbook: 'retail',
    title: 'One-Page Procedure Cleanup',
    kind: 'Template',
    dek: 'A condensed-to-one-page format for branch procedures — the version your tellers actually keep at the window, derived from the full SOP without losing the controls.',
    audience: 'Branch operations leads and procedure owners',
    readMinutes: 5,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What this cleanup produces',
        intro: STUB_NOTICE,
        items: [
          'The decision a teller has to make at the window, named and bounded.',
          'The three or four inputs that drive that decision.',
          'The escalation triggers — when to stop and call.',
          'The audit-trail step required regardless of decision.',
        ],
      },
    ],
  },
  {
    slug: 'difficult-conversation-prep-sheet',
    playbook: 'retail',
    title: 'Difficult Conversation Prep Sheet',
    kind: 'Worksheet',
    dek: 'A fill-in prep sheet for branch managers preparing to deliver hard news — declined exception, fee adjustment denial, account-action escalation.',
    audience: 'Branch managers and senior member-services staff',
    readMinutes: 4,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What this prep sheet captures',
        intro: STUB_NOTICE,
        items: [
          'The decision being communicated, in one sentence.',
          'The two or three facts that drove the decision.',
          'The member-impact phrasing — how this lands for them, in their words.',
          'The next-step offer — what they can still do, even though this answer is no.',
        ],
      },
    ],
  },
];

// Executive / Leadership — 4 Ready
const EXECUTIVE: readonly PlaybookAsset[] = [
  {
    slug: 'ai-adoption-thesis-template',
    playbook: 'executive',
    title: 'AI Adoption Thesis Template',
    kind: 'Template',
    dek: 'A one-page thesis that states where AI earns its keep this year, who owns it, and what "good" looks like — the document every other AI decision hangs off.',
    audience: 'CEOs, COOs, and executive sponsors of AI adoption',
    readMinutes: 7,
    sourcedFrom: ['SR 11-7 (Model Risk Management)', 'AIEOG AI Lexicon (Feb 2026)'],
    sections: [
      {
        heading: 'What this thesis commits to',
        intro: STUB_NOTICE,
        items: [
          'The one or two outcomes AI should move this year, stated as measurable results — not "explore AI."',
          'The single accountable owner for adoption, named.',
          'The risk posture: what the institution will and will not let AI touch in year one.',
          'The definition of success the board will be shown against.',
        ],
      },
      {
        heading: 'When to use it',
        items: [
          'Before any AI budget is approved or any pilot is greenlit.',
          'At the start of each planning cycle, to re-baseline the thesis against results.',
        ],
      },
      {
        heading: 'Why a written thesis matters',
        principle:
          'Scattered pilots are a strategy by accident. A one-page thesis is a strategy on purpose — and the only thing that lets you say no to the pilots that do not serve it.',
      },
    ],
  },
  {
    slug: 'ai-use-guardrails-one-pager',
    playbook: 'executive',
    title: 'AI Use Guardrails One-Pager',
    kind: 'Template',
    dek: 'The institution-wide guardrails leadership approves as policy — data-safety tiers, the human-review rule, and the approved-tool boundary — on a single page every employee can read.',
    audience: 'Executives and AI governance committees',
    readMinutes: 5,
    sourcedFrom: ['Interagency TPRM Guidance', 'AIEOG AI Lexicon (Feb 2026)', 'ECOA / Reg B'],
    sections: [
      {
        heading: 'What this one-pager sets',
        intro: STUB_NOTICE,
        items: [
          'The green / yellow / red data classification rule — what may, may with care, and may never go into an AI tool.',
          'The human-review rule: which AI-assisted outputs require a named reviewer before use.',
          'The approved-tool boundary and how staff request an addition.',
          'The escalation path when a use case does not fit the guardrails.',
        ],
      },
      {
        heading: 'Why leadership signs it',
        principle:
          'If leadership does not set the guardrails, staff will improvise their own — inconsistently, and usually after the first incident. Approved guardrails turn judgment calls into policy.',
      },
    ],
  },
  {
    slug: 'board-ai-briefing-template',
    playbook: 'executive',
    title: 'Board AI Briefing Template',
    kind: 'Template',
    dek: 'A plain-English board update that turns pilot activity into the three things directors actually need: what we did, what it returned, and what risk now sits where.',
    audience: 'Executives reporting AI activity to the board or a board committee',
    readMinutes: 6,
    sourcedFrom: ['SR 11-7', 'Interagency TPRM Guidance'],
    sections: [
      {
        heading: 'What this briefing covers',
        intro: STUB_NOTICE,
        items: [
          'Where AI is in use today, by function, in one table.',
          'Measured results — time saved and quality / correction rate — not anecdotes.',
          'The current risk posture and the controls in place against it.',
          'The decisions in front of the board: scale, hold, or stop.',
        ],
      },
      {
        heading: 'When to use it',
        items: [
          'Ahead of each board or risk-committee meeting where AI is on the agenda.',
          'When requesting approval to scale an AI workflow beyond a pilot.',
        ],
      },
    ],
  },
  {
    slug: 'pilot-scorecard',
    playbook: 'executive',
    title: 'Pilot Scorecard',
    kind: 'Worksheet',
    dek: 'A two-metric scorecard every AI pilot reports against — time saved and correction rate — so the decision to scale or stop is made on evidence, not enthusiasm.',
    audience: 'Executive sponsors and pilot owners',
    readMinutes: 4,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What this scorecard tracks',
        intro: STUB_NOTICE,
        items: [
          'Baseline: how long the task took, and how often it needed rework, before AI.',
          'Time saved per run, measured against that baseline.',
          'Correction rate: how often the human reviewer had to materially change the AI output.',
          'A scale / hold / stop recommendation tied to those two numbers.',
        ],
      },
      {
        heading: 'Why two metrics, not ten',
        principle:
          'A pilot that cannot show time saved and a falling correction rate is not ready to scale. Everything else is a vanity metric.',
      },
    ],
  },
];

// Operations — 4 Ready
const OPERATIONS: readonly PlaybookAsset[] = [
  {
    slug: 'operations-workflow-sop',
    playbook: 'operations',
    title: 'Workflow SOP Template',
    kind: 'Template',
    dek: 'A standard operating procedure shell for an AI-assisted task — input, AI step, review checkpoint, output — written so a colleague could run it cold.',
    audience: 'Operations leads and process owners',
    readMinutes: 6,
    sourcedFrom: ['SR 11-7'],
    sections: [
      {
        heading: 'What this SOP names',
        intro: STUB_NOTICE,
        steps: [
          'The trigger and inputs — what starts the task and what the AI step is allowed to see.',
          'The AI step — the reusable brief the staff member runs, with its boundaries.',
          'The review checkpoint — who checks the output, against what, before it is used.',
          'The output and where it is filed, plus how the run is logged.',
        ],
      },
      {
        heading: 'The handoff test',
        principle:
          'An SOP is done when a colleague can run it without you in the room. If it still lives in someone’s head, it is a habit, not a workflow.',
      },
    ],
  },
  {
    slug: 'reusable-ai-working-brief',
    playbook: 'operations',
    title: 'Reusable AI Working Brief',
    kind: 'Template',
    dek: 'A fill-in-the-blank brief that turns a one-off prompt into a template the whole team can run the same way every time.',
    audience: 'Anyone standardizing an AI task for a team',
    readMinutes: 5,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What the brief fixes in place',
        intro: STUB_NOTICE,
        items: [
          'Role — what the AI is acting as (drafter, summarizer, reviewer).',
          'Format — the exact shape the answer must take.',
          'Source material — what gets pasted in, and what must never be.',
          'Self-check — what the AI is told to verify in its own output before returning it.',
          'Human edit — the judgment call the staff member always makes themselves.',
        ],
      },
    ],
  },
  {
    slug: 'review-checkpoint-worksheet',
    playbook: 'operations',
    title: 'Review Checkpoint Worksheet',
    kind: 'Worksheet',
    dek: 'A worksheet that makes the human review step explicit for any AI-assisted workflow — who reviews, against what criteria, and what they sign.',
    audience: 'Process owners defining a review step',
    readMinutes: 4,
    sourcedFrom: ['SR 11-7'],
    sections: [
      {
        heading: 'What this worksheet pins down',
        intro: STUB_NOTICE,
        items: [
          'The named reviewer role — a seat, not a person, so it survives turnover.',
          'The check criteria: accuracy, data exposure, tone, and policy fit.',
          'The threshold for a second reviewer on higher-stakes outputs.',
          'What gets recorded in the log, and where.',
        ],
      },
    ],
  },
  {
    slug: 'time-saved-tracking-sheet',
    playbook: 'operations',
    title: 'Time-Saved Tracking Sheet',
    kind: 'Worksheet',
    dek: 'A simple sheet to baseline the manual version of a task and track draft time and correction rate on the AI version — the evidence a workflow is worth keeping.',
    audience: 'Operations leads measuring an AI pilot',
    readMinutes: 4,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What this sheet captures',
        intro: STUB_NOTICE,
        items: [
          'Manual baseline: minutes per task and rework frequency before AI.',
          'AI draft time per run, logged over a representative week.',
          'Correction rate: how often the reviewer materially changed the output.',
          'A weekly net: hours saved, adjusted for review time.',
        ],
      },
    ],
  },
];

// Training / HR — 4 Ready
const TRAINING_HR: readonly PlaybookAsset[] = [
  {
    slug: 'role-training-path-template',
    playbook: 'training-hr',
    title: 'Role Training Path Template',
    kind: 'Template',
    dek: 'A template that turns generic AI awareness into the two or three things a specific role must be able to do safely — the rules, the examples, and the practice.',
    audience: 'Training leads and HR business partners',
    readMinutes: 6,
    sourcedFrom: ['AIEOG AI Lexicon (Feb 2026)'],
    sections: [
      {
        heading: 'What this path defines',
        intro: STUB_NOTICE,
        items: [
          'The two or three AI tasks this role should be able to do safely.',
          'The data rules and approved-tool list specific to the role.',
          'A worked example for each task, drawn from real role work.',
          'A sandbox exercise that proves the person can do it, not just describe it.',
        ],
      },
      {
        heading: 'Why role-specific beats general',
        principle:
          'Generic AI training teaches awareness; role-specific training builds capability. Adoption depends on the second one.',
      },
    ],
  },
  {
    slug: 'safe-use-one-pager',
    playbook: 'training-hr',
    title: 'Safe-Use One-Pager',
    kind: 'Template',
    dek: 'The single sheet every new hire gets — the green / yellow / red data rules, the approved-tool list, and who to ask when in doubt.',
    audience: 'All staff; owned by Training / HR',
    readMinutes: 3,
    sourcedFrom: ['AIEOG AI Lexicon (Feb 2026)', 'Interagency TPRM Guidance'],
    sections: [
      {
        heading: 'What the one-pager states',
        intro: STUB_NOTICE,
        items: [
          'Green / yellow / red: what data may, may with care, and may never enter an AI tool.',
          'The approved-tool list and how to request an addition.',
          'The one rule that overrides all others: never paste customer or regulated data into a general-purpose tool.',
          'The named person or channel to ask when uncertain.',
        ],
      },
    ],
  },
  {
    slug: 'practice-scenario-pack',
    playbook: 'training-hr',
    title: 'Practice Scenario Pack',
    kind: 'Template',
    dek: 'A set of realistic, fictional scenarios staff can rehearse in the sandbox — so the first time they use AI on a hard case is not on a real member.',
    audience: 'Training leads building hands-on enablement',
    readMinutes: 5,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What the pack provides',
        intro: STUB_NOTICE,
        items: [
          'Scenarios written with fictional names, amounts, and details — never a real member story.',
          'A range of difficulty, including the judgment calls AI gets wrong.',
          'The "right answer" notes a facilitator can coach against.',
          'A reminder, on every scenario, that real customer data never enters the exercise.',
        ],
      },
      {
        heading: 'The data discipline',
        principle:
          'Practice scenarios are fictional by design. The moment a real customer detail enters a training prompt, the training has taught the wrong lesson.',
      },
    ],
  },
  {
    slug: 'capability-tracker',
    playbook: 'training-hr',
    title: 'Capability Tracker',
    kind: 'Worksheet',
    dek: 'A tracker that defines what "trained" means per role and records who has cleared the bar — so readiness is something you can see, not assume.',
    audience: 'Training / HR leads and people managers',
    readMinutes: 4,
    sourcedFrom: [],
    sections: [
      {
        heading: 'What this tracker records',
        intro: STUB_NOTICE,
        items: [
          'The bar: what a person must demonstrate, per role, to count as trained.',
          'Who has cleared it, and when.',
          'The refresh cadence and when each person is next due.',
          'Recurring gaps — questions that keep coming up — fed back into the training path.',
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Public registry
// ---------------------------------------------------------------------------

export const PLAYBOOK_ASSETS: readonly PlaybookAsset[] = [
  ...BSA_AML,
  ...COMPLIANCE,
  ...INFOSEC,
  ...LENDING,
  ...MARKETING,
  ...RETAIL,
  ...EXECUTIVE,
  ...OPERATIONS,
  ...TRAINING_HR,
];

export function getPlaybookAsset(slug: string): PlaybookAsset | undefined {
  return PLAYBOOK_ASSETS.find((a) => a.slug === slug);
}

export function getAssetsForPlaybook(
  playbook: PlaybookSlug,
): readonly PlaybookAsset[] {
  return PLAYBOOK_ASSETS.filter((a) => a.playbook === playbook);
}
