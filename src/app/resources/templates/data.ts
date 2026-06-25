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
      'GLBA Safeguards Rule — 16 CFR Part 314 (FTC); parallel Interagency Guidelines Establishing Information Security Standards for depository institutions',
      'SR 11-7 — Supervisory Guidance on Model Risk Management (Federal Reserve / OCC Bulletin 2011-12)',
      'Interagency Guidance on Third-Party Relationships: Risk Management (FRB / FDIC / OCC, June 6, 2023; 88 FR 37920)',
      'ECOA / Regulation B (12 CFR 1002) and CFPB Circular 2023-03 on adverse-action notices using AI/complex models',
      'NIST AI Risk Management Framework (AI RMF 1.0, NIST AI 100-1, Jan 2023): Govern, Map, Measure, Manage',
      'AIEOG AI Lexicon — US Treasury / FBIIC / FSSCC (Feb 19, 2026)',
    ],
    sections: [
      {
        heading: 'Purpose & scope',
        intro:
          'This section states why the policy exists and exactly what it covers, so staff and examiners can tell in one read whether a given activity is in bounds. The right default is broad scope (any generative tool, any channel) with risk-tiered controls layered on top — not a narrow tool-by-tool list that goes stale.',
        items: [
          'Recommended: define "Generative AI" by behavior, not brand. Adopt verbatim: "This policy applies to any system that accepts natural-language or data input and produces generated text, images, audio, video, or code, whether accessed as a standalone service, embedded in a vendor product, built into [Institution]\'s core or ancillary systems, or self-hosted."',
          'Why: a brand list (ChatGPT, Claude, Gemini, Copilot) is obsolete the day a vendor ships an AI feature inside software you already use; behavior-based scope captures embedded AI automatically.',
          'Recommended: state the standards this policy implements so examiners see the through-line. Adopt verbatim: "This policy operationalizes [Institution]\'s obligations under the GLBA information-security program, applies model-risk principles consistent with SR 11-7 where AI informs decisions, and aligns governance to the NIST AI Risk Management Framework functions of Govern, Map, Measure, and Manage."',
          'Why: GLBA\'s Safeguards Rule (16 CFR 314.4) requires a written program with administrative, technical, and physical safeguards scaled to your size and the sensitivity of customer information — AI use is squarely within that program, not separate from it.',
          'Recommended: scope to everyone, not just employees. Adopt verbatim: "This policy binds all employees, officers, directors, temporary staff, interns, and contractors who use AI in connection with [Institution] business or who handle [Institution] data with AI tools."',
          'What good looks like: a one-paragraph scope a teller and an examiner read the same way. Common mistake examiners flag: a policy that only governs a single named chatbot while AI quietly enters through a core/loan-origination/marketing vendor with no oversight.',
        ],
      },
      {
        heading: 'Governance & accountability',
        intro:
          'A policy with no named owner is a finding waiting to happen. The NIST AI RMF puts Govern first for a reason, and the GLBA Safeguards Rule expressly requires you to designate a qualified individual to oversee the information-security program. Assign one accountable owner, define an approval gate, and report to the board.',
        items: [
          'Recommended: name a single accountable owner. Adopt verbatim: "The [Chief Risk Officer / Information Security Officer] is the AI Program Owner, accountable to the Board (or a designated committee) for this policy, the inventory of AI use cases, and exceptions."',
          'Why: 16 CFR 314.4(a) requires designating a "Qualified Individual" responsible for the information-security program; naming an AI Program Owner who maps to that role avoids a gap between your security program and your AI activity.',
          'Recommended: route approvals through one cross-functional gate. Adopt verbatim: "No new AI use case involving [Institution] data or affecting customers may go live without written approval from the AI Program Owner, with sign-off from Compliance and Information Security; high-risk use cases (see Risk tiering) also require [Committee] approval."',
          'Recommended: report up at least annually. Adopt verbatim: "The AI Program Owner reports to the Board or its designated committee at least annually on the AI use-case inventory, material incidents, exceptions granted, and the results of the policy review."',
          'Why: the 2023 Interagency Third-Party guidance and GLBA both treat board-level oversight of risk as expected; AI does not get a carve-out from the governance you already run.',
          'What good looks like: an org chart line from teller to AI Program Owner to board. Common mistake examiners flag: "shadow AI" — staff using consumer tools with no inventory, no owner, and no record the board knows it is happening.',
        ],
      },
      {
        heading: 'Approved tools & third-party oversight',
        intro:
          'Treat every AI tool as a third-party relationship and run it through the lifecycle the 2023 Interagency Guidance describes: planning, due diligence, contracting, ongoing monitoring, and termination. The default posture is allow-list, not block-list — only vetted tools, accessed through institution-controlled accounts.',
        items: [
          'Recommended: allow-list only. Adopt verbatim: "Only AI tools on the Approved AI Tools List may be used for [Institution] business. The list is maintained by the AI Program Owner and reviewed at least quarterly. Use of any non-listed AI tool for institution work or data is prohibited."',
          'Recommended: ban personal accounts for institution data. Adopt verbatim: "Staff may not enter [Institution] or customer information into AI tools through personal accounts, free consumer tiers, or browser extensions; only institution-provisioned accounts on approved tools may be used."',
          'Why: free consumer tiers frequently reserve the right to train on submitted content; the 2023 Interagency Guidance and GLBA both require that contracts with service providers address confidentiality and data use for nonpublic information.',
          'Recommended: gate listing on real due diligence. Adopt verbatim: "Before a tool is listed, Information Security and Compliance confirm a written agreement that addresses data ownership, prohibition on training the vendor\'s base model on [Institution] data without consent, retention and deletion, subcontractor (fourth-party) use, breach notification, and audit/SOC 2 rights."',
          'Why: the Interagency Guidance specifically calls out assessing subcontractors and the vendor\'s own information-security and incident-response capabilities — "fourth-party" risk is in scope, not optional.',
          'Worked example (Approved AI Tools List row): Tool = [Vendor] Enterprise; Access = SSO, institution-provisioned only; Permitted data classes = Public, Internal; Prohibited = Confidential, NPI/Regulated; Training opt-out = Confirmed in writing [date]; Retention = zero-retention tier enabled; Owner = [name]; Next review = [date].',
          'What good looks like: every listed tool maps to a signed agreement and a monitoring date. Common mistake examiners flag: an "approved" tool with no contract review, no training opt-out confirmation, and no record of who owns ongoing monitoring.',
        ],
      },
      {
        heading: 'Data classification & permitted inputs',
        intro:
          'This is the section that prevents the headline incident. Tie AI inputs to your existing GLBA-driven data classification scheme and state, per class, where data may and may not go. The safe default: nonpublic personal information (NPI) and regulated data never enter a public or shared-tenant AI tool.',
        items: [
          'Recommended: anchor on classes you already use. Adopt verbatim: "Inputs to AI tools follow [Institution]\'s data classification standard. Each class has a defined permitted destination; when in doubt, treat data as the higher-sensitivity class and ask the AI Program Owner."',
          'Worked example — filled data-classification matrix (adapt to your standard):',
          'Public (rate sheets, published marketing copy, public website FAQs, press releases): Allowed in any approved tool.',
          'Internal (draft procedures, internal memos, non-customer training material, de-identified examples): Allowed in approved tools only; not in personal/consumer accounts.',
          'Confidential — NPI (customer names with account or balance data, SSN/TIN, card/account numbers, application data, loan files, transaction history): Prohibited in any public or shared-tenant AI tool; permitted only in an approved private/zero-retention deployment with a contract that covers NPI, and only for an approved use case.',
          'Regulated / examination-sensitive (SAR/CTR content and SAR existence, BSA/AML investigation detail, fair-lending analysis, model validation work, examination correspondence and work product, attorney-client privileged material): Prohibited in all AI tools by default; any exception requires written AI Program Owner and Compliance approval and a private deployment.',
          'Why: GLBA\'s Safeguards Rule requires protecting the security and confidentiality of customer information; SAR confidentiality is independently mandated (31 U.S.C. 5318(g) / 12 CFR Part 21 et al.), so SAR detail must never enter a general-purpose tool.',
          'Recommended: require de-identification before prompting. Adopt verbatim: "Where AI assistance is useful but the source contains NPI, staff must remove or tokenize all customer identifiers before prompting; reattaching identifiers happens only outside the AI tool."',
          'What good looks like: a one-page matrix posted where staff prompt. Common mistake examiners flag: a policy that says "don\'t share confidential data" without defining the classes — staff cannot follow a rule they cannot apply to the document in front of them.',
        ],
      },
      {
        heading: 'Permitted & prohibited uses',
        intro:
          'Name the green-light uses so staff feel safe being productive, and name the bright-line prohibitions so no one has to guess. The default: AI may draft and summarize, but it may not make or rubber-stamp a decision that affects a customer\'s money, credit, or legal standing.',
        items: [
          'Recommended (permitted, illustrative): drafting internal documents and non-customer communications, summarizing internal material, brainstorming, reformatting, generating code in approved environments, and first-draft training content — all subject to human review.',
          'Recommended (prohibited bright lines). Adopt verbatim: "AI tools may not be used to make a final credit, account-closure, fraud-disposition, BSA/AML, HR, or other adverse decision affecting a customer or employee; AI may inform a recommendation only where a qualified person makes and can independently justify the decision."',
          'Why: under ECOA and Regulation B, a creditor must give specific, accurate principal reasons for adverse action, and CFPB Circular 2023-03 makes clear a creditor "cannot justify noncompliance based on the mere fact" that its model is "too complicated, opaque, or novel" — a black-box AdverseAction is not defensible.',
          'Recommended: prohibit creating false or misleading content. Adopt verbatim: "AI may not be used to generate content that misrepresents [Institution] products or terms, fabricate compliance documentation, or produce material that would mislead a customer (UDAAP), an auditor, or an examiner."',
          'Recommended: require disclosure where a customer would reasonably expect a human. Adopt verbatim: "Customer-facing AI interactions (e.g., chat) must not impersonate a human and must offer a path to a person."',
          'What good looks like: a short green/red list staff can recite. Common mistake examiners flag: using AI in underwriting or BSA/AML decisioning without being able to produce specific, accurate reasons — a direct Reg B / fair-lending exposure.',
        ],
      },
      {
        heading: 'Human review & model risk (SR 11-7)',
        intro:
          'AI output is draft work product until a qualified human stands behind it. Where AI informs decisions, apply model-risk discipline proportionate to the stakes: SR 11-7\'s core ideas — effective challenge, validation, and ongoing monitoring — scale down to a community institution.',
        steps: [
          'Classify the use case by impact: low (internal drafting), medium (customer-facing content), high (informs a decision about credit, accounts, fraud, or BSA/AML). Controls scale with the tier.',
          'Require named human review before reliance. Adopt verbatim: "Every AI output used in customer-facing, regulated, or decision-supporting work is reviewed by a qualified person who is identified by name and role and who verifies factual accuracy, calculations, regulatory references, and data handling before the output is used, sent, filed, or relied upon."',
          'For high-tier (decisioning) uses, apply effective challenge: document the tool\'s purpose, inputs, known limitations, and how a reviewer can override it — consistent with SR 11-7\'s expectation that models be validated and independently challenged.',
          'Test for the failure modes that matter for generative AI: fabrication ("hallucination"), bias/disparate impact in any customer-affecting use, and prompt-injection or data-leakage risk; record the test and who performed it.',
          'Monitor on a cadence: re-review high-tier uses at least annually and on any material tool/model change, vendor update, regulatory change, or incident.',
        ],
        items: [
          'Why: SR 11-7 treats a "model" as any quantitative method that produces output used in decision-making; when AI informs a customer decision, model-risk expectations (validation, monitoring, documentation, effective challenge) apply at a scale proportionate to your institution.',
          'Note: model-risk guidance continues to evolve and agencies have signaled further AI-specific guidance is coming — apply SR 11-7 principles proportionately and revisit this section when new guidance is issued, rather than assuming AI is out of scope.',
          'What good looks like: a one-page validation memo for each decisioning use case. Common mistake examiners flag: "the AI checked it" offered as the control, with no human attestation and no record of testing for accuracy or bias.',
        ],
      },
      {
        heading: 'Documentation & recordkeeping',
        intro:
          'If it is not documented, an examiner will treat it as if it did not happen. Keep a lightweight but consistent record for any AI-assisted work that reaches a customer, a regulated process, or a decision — enough to reconstruct what happened and who is accountable.',
        items: [
          'Recommended minimum record. Adopt verbatim: "For AI-assisted work producing a customer-facing or examiner-relevant artifact, [Institution] retains: the approved tool and version used, the prompt or instruction, the data class of the input, the output relied upon, and the human reviewer and date of review."',
          'Recommended: keep the AI use-case inventory current. Adopt verbatim: "The AI Program Owner maintains a written inventory of all AI use cases, including purpose, owner, data classes, risk tier, approval date, and next review date," consistent with NIST AI RMF Map/Govern practices.',
          'Recommended: align retention to your existing schedule. Adopt verbatim: "AI-related records are retained per [Institution]\'s records-retention schedule and the retention applicable to the underlying business record (e.g., loan-file retention applies to AI-assisted loan documentation)."',
          'Why: GLBA\'s Safeguards Rule expects periodic written risk assessment and documentation of safeguards; a maintained inventory plus per-artifact records is how you evidence that AI sits inside that program.',
          'What good looks like: an examiner can pull any AI-assisted loan or marketing piece and see tool, prompt, data class, and reviewer. Common mistake examiners flag: an inventory built once for the exam and never updated, or no inventory at all.',
        ],
      },
      {
        heading: 'Incident response & exceptions',
        intro:
          'AI incidents — inadvertent NPI disclosure, prompt injection, a fabricated output that reached a customer, or unapproved tool use — ride on your existing incident-response plan, with AI-specific triggers added. Exceptions are allowed but must be deliberate, time-bound, and logged.',
        items: [
          'Recommended: fold AI into the existing plan, do not build a parallel one. Adopt verbatim: "Suspected AI policy violations, prompt-injection attempts, model misuse, or disclosure of confidential or regulated data into an AI tool are handled under [Institution]\'s incident-response plan, with notice to the AI Program Owner, Compliance, and Information Security."',
          'Recommended: set a fast internal notification clock and preserve evidence. Adopt verbatim: "Discovery is reported within [24 hours]; the prompt, output, account, and any downstream artifacts are preserved, and tool/chat history is not deleted while the incident is open."',
          'Why: GLBA\'s Safeguards Rule requires a written incident-response plan, and the FTC notification obligation (and parallel banking breach-notification expectations) can be triggered by unauthorized exposure of customer information — AI is just one more channel that exposure can flow through.',
          'Recommended: govern exceptions explicitly. Adopt verbatim: "Any exception to this policy requires written AI Program Owner approval, a stated business justification, compensating controls, an expiration date not to exceed [12 months], and entry in the exceptions log reported to the Board committee."',
          'What good looks like: an exceptions log with expiration dates and compensating controls. Common mistake examiners flag: informal, undocumented exceptions ("we let the loan team use it") with no owner, no end date, and no compensating control.',
        ],
      },
      {
        heading: 'Training & policy review cycle',
        intro:
          'A policy no one is trained on is unenforceable, and a policy that never changes goes stale in a field moving this fast. Train on adoption and annually, and review the policy on a fixed cadence plus event triggers.',
        items: [
          'Recommended: mandatory, role-aware training. Adopt verbatim: "All staff complete AI-use training before being granted access to approved AI tools and at least annually thereafter; staff in lending, BSA/AML, and other regulated functions receive role-specific training on permitted uses and prohibitions."',
          'Why: GLBA\'s Safeguards Rule expressly requires security-awareness training and qualified personnel; AI-specific training is the natural extension and is a low-cost item examiners notice when it is missing.',
          'Recommended: fixed review cadence plus triggers. Adopt verbatim: "This policy is reviewed and re-approved at least annually and additionally upon: a new tool listing, new or amended regulatory guidance on AI, a material incident, or a significant change in [Institution]\'s AI usage."',
          'Recommended: version and approve. Adopt verbatim: "Each version records its effective date, approver, and a summary of changes; the current version is published where staff access AI tools."',
          'What good looks like: a dated, board-approved policy with a training completion record and a change log. Common mistake examiners flag: an undated policy, no evidence of training completion, and a review date that has already lapsed.',
        ],
      },
    ],
  },
  {
    ...templateBase('ai-workflow-sop'),
    sourcedFrom: [
      'SR 11-7 — Supervisory Guidance on Model Risk Management (Federal Reserve / OCC); note the 2026 SR 26-2 risk-based modernization the institution may be transitioning to',
      'NIST AI Risk Management Framework (AI RMF 1.0): Govern, Map, Measure, Manage',
      'Interagency Guidance on Third-Party Relationships: Risk Management (FRB / FDIC / OCC, June 2023)',
      'AIEOG AI Lexicon — AI use case inventory, human-in-the-loop (US Treasury / FBIIC / FSSCC, Feb 2026)',
    ],
    sections: [
      {
        heading: 'Workflow identity & inventory entry',
        intro:
          'Before describing how the AI works, pin down what this workflow is and register it. The AIEOG Lexicon defines an AI use-case inventory as a maintained record of where and how AI is used and the outputs it produces; this SOP is one row in that inventory. An examiner’s first question is "show me your inventory."',
        items: [
          'Workflow name & ID — Recommended: give every AI workflow a stable ID and a plain-English name a director understands. Example: "AI-LEND-001 — AI-assisted commercial loan-memo drafting."',
          'Business purpose & output — Recommended: one sentence on the job plus the concrete artifact. Example: "Generate a first-draft credit memo (narrative sections only) from approved underwriting inputs; output is a Word draft an analyst edits and a credit officer approves."',
          'Owner & accountable executive — Recommended: name one accountable owner (a person, not a committee) and the senior executive who owns the risk. Example: "Owner: VP Commercial Credit; accountable executive: Chief Credit Officer."',
          'AI/model type — Recommended: state plainly whether this is generative AI, a vendor feature, or an internal model; this drives which controls apply. Example: "Third-party generative AI accessed via the LOS vendor’s add-on; vendor-hosted."',
          'Inventory status & tier — Recommended: record date added and risk tier. Example: "Added 2026-03-01; Tier: Moderate — assists a credit decision but produces no automated decision or score."',
        ],
      },
      {
        heading: 'Scope, boundaries & prohibited uses',
        intro:
          'The single most useful thing this SOP does is draw a hard line around what the AI may and may not do — that line prevents scope creep and is what an examiner tests.',
        items: [
          'In scope — Recommended: list the specific tasks, narrowly. Example: "Drafting the narrative/qualitative sections of the memo from analyst-supplied facts and approved templates."',
          'Out of scope / prohibited — Adopt verbatim: "This tool does not make or recommend credit decisions, does not assign or influence risk ratings, does not calculate ratios or covenants, does not communicate with the borrower, and is not a system of record. Numbers, ratings, and conclusions are produced by staff, not the AI."',
          'Population & volume — Recommended: state who/what flows through and rough volume. Example: "All C&I and CRE requests over $250k; ~30 memos/month."',
          'Fair-lending boundary — Recommended: state explicitly whether it touches protected-class-sensitive decisions, even if the answer is no. Example: "Commercial credit only; no consumer/ECOA-covered lending; no protected-class or proxy variables provided; adverse-action language drafted by staff, not the AI."',
        ],
      },
      {
        heading: 'Inputs, data sources & data handling',
        intro:
          'SR 11-7 treats data quality as part of model soundness. Name every source, classify the data, and state what may leave the building.',
        items: [
          'Data sources — Recommended: name each system and the exact data, not categories. Example: "Borrower financials/tax returns (analyst-uploaded), spreading output from [core], prior memos from [LOS], analyst-selected public industry data."',
          'Data classification & NPI handling — Adopt verbatim: "Inputs include Confidential and Nonpublic Personal Information. No customer NPI is used to train, fine-tune, or improve any vendor or public model; inputs and outputs are not retained outside the bank’s contracted, access-controlled environment."',
          'Prohibited inputs — Recommended: name what must never be entered. Example: "Do not paste full SSNs, account numbers, or consumer credit-report data; redact before upload."',
          'Input validation — Recommended: require a human to confirm inputs are complete and from approved sources before running. Example: "Analyst confirms the spreading is final and statements are the signed versions before generating."',
        ],
      },
      {
        heading: 'Process steps & human-in-the-loop control',
        intro:
          'This is the heart of the SOP. The AIEOG Lexicon defines human-in-the-loop as a human integrated into the system’s decision-making; SR 11-7 stresses models inform but do not replace informed human judgment. Write the steps so the human checkpoint is a required, evidenced action.',
        steps: [
          'Prepare & validate inputs — the analyst assembles approved inputs and confirms completeness.',
          'Generate draft — run the AI using the approved prompt/template only; ad-hoc prompting outside the template is out of scope.',
          'Human review & correction (the HITL control) — Adopt verbatim: "A qualified analyst reviews every AI-generated section line by line for factual accuracy, hallucinated figures or citations, completeness, and tone before it is used; the analyst is responsible for the content as if they had written it."',
          'Independent approval — a second, more senior role signs off before the memo advances (the "effective challenge" SR 11-7 expects); approval is logged.',
          'Record & retain — retain the final human-approved artifact (and, where feasible, the AI draft) per the retention schedule.',
        ],
        items: [
          'Authority to override — Recommended: state staff may discard the AI draft and write manually at any time, no justification required.',
        ],
      },
      {
        heading: 'Vendor / third-party management (if applicable)',
        intro:
          'If the AI is bought, not built, the 2023 Interagency TPRM guidance governs it across the life cycle — planning, due diligence/selection, contract, ongoing monitoring, termination — scaled to risk and criticality. Skip only if fully internal.',
        items: [
          'Vendor & criticality — Recommended: name the vendor, hosting model, and whether the relationship is "critical." Example: "LOS provider AI add-on; SaaS; not critical — workflow can run manually if unavailable."',
          'Due-diligence evidence on file — Recommended: list the artifacts you actually hold (SOC 2, model/data-use documentation, security review, financial condition).',
          'Key contract terms — Adopt verbatim: "The contract prohibits use of bank or customer data to train or improve the vendor’s models, grants the bank and its regulators audit and examination access, and defines data return/deletion at termination."',
          'Ongoing monitoring & continuity — Recommended: state cadence, re-review triggers, and the fallback if the vendor fails. Example: "Annual review; re-review on any model-version change; fallback = manual drafting."',
        ],
      },
      {
        heading: 'Validation, monitoring & performance metrics',
        intro:
          'SR 11-7 validation rests on conceptual soundness, ongoing monitoring, and outcomes analysis; NIST’s Measure function is how you know controls work and catch drift. For a moderate-tier HITL workflow, validation can be proportionate — but it must exist and be evidenced.',
        items: [
          'Pre-deployment check — Recommended: document the initial test that established fitness. Example: "Before go-live, 20 historical deals were drafted with the tool and compared to the original memos; coverage and accuracy signed off by the CCO."',
          'Ongoing metrics — Recommended: pick 2-4 metrics with owners and frequency. Example: "Monthly: hallucination/error rate found in review; % of drafts needing material rework; any factual error that reached committee (target zero)."',
          'Threshold & escalation — Adopt verbatim: "If the material-error rate exceeds the established threshold for two consecutive months, the workflow owner escalates to the accountable executive and use of the tool is paused pending review."',
          'Independent review & cadence — Recommended: name who reviews independently of the owner and how often; full SOP review annually plus event triggers (vendor version change, material error, scope change).',
        ],
      },
      {
        heading: 'Risk tiering & governance approval',
        intro:
          'NIST’s Govern function is the cross-cutting layer — who approves the use case and how oversight is resourced. Tiering sets how much control intensity the workflow earns; proportionality is the point of the risk-based approach.',
        items: [
          'Risk tier & rationale — Recommended: a simple Low/Moderate/High keyed to decision impact and autonomy. Example: "Moderate — influences a memo that feeds a human decision; no automated decision, score, or customer-facing output. (High if it scored or auto-decisioned credit.)"',
          'Control intensity by tier — Recommended: state what each tier requires so the rating has teeth (e.g., Moderate = named owner, HITL on every output, annual independent review, monitoring; High adds formal independent validation pre-deployment and board reporting).',
          'Approvals on record & policy linkage — Recommended: list approvals/dates and cite the governing internal policies (AI Use Policy, Model Risk Policy, Third-Party Risk Policy).',
          'Change management — Adopt verbatim: "Material changes to inputs, scope, the underlying model/version, or the vendor require re-approval through this governance process before continued use; changes are version-logged on this SOP."',
        ],
      },
      {
        heading: 'Incident response, recovery & retirement',
        intro:
          'NIST’s Manage function covers response, incident handling, and recovery. Decide in advance what happens when the AI gets it wrong and how the workflow is wound down.',
        items: [
          'Failure modes — Recommended: name the realistic ways it goes wrong (hallucinated figures, fabricated citations, outdated data, outage, data exposure).',
          'Incident response — Recommended: define who to notify and the immediate containment. Example: "On a material error reaching committee or any data-exposure event, the owner notifies the accountable executive and the CISO/incident function the same business day; tool use paused if exposure is suspected."',
          'Recovery / fallback — Recommended: confirm the manual path keeps the business running; reprocess affected items through full human review.',
          'Retirement — Recommended: state how it is decommissioned — disable vendor access, confirm data deletion/return per contract, archive the SOP, mark the use case "Retired" with date and reason.',
        ],
      },
      {
        heading: 'What good looks like / common mistakes',
        intro:
          'A quick self-check before handing this to an examiner. The difference between a credible SOP and a checkbox is whether the controls are actually happening and evidenced.',
        items: [
          'What good looks like — a reader who has never seen the tool can state in a minute what it does, what it’s forbidden to do, who checks every output, and what shuts it off; every control claim is backed by a producible record.',
          'Common mistake — listing capabilities but not prohibitions; the out-of-scope language is what limits risk, so write it first.',
          'Common mistake — "we monitor performance" with no threshold or owner; set a number that triggers a pause and name who watches it.',
          'Common mistake — vague data handling that leaves open whether NPI trains a public model; state the no-training and retention rules and tie them to the contract.',
          'Common mistake — letting the SOP go stale; an un-updated SOP after a vendor model upgrade is itself a finding. Date it, version it, re-review on the triggers above.',
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
    ...templateBase('cdfi-grant-ai-evidence-checklist'),
    sourcedFrom: [
      'CDFI Fund (US Treasury) — CDFI Certification reporting: Annual Certification and Data Collection Report (ACR) and Transaction Level Report (TLR)',
      'CDFI Fund — award compliance and reporting obligations (Assistance/Allocation Agreement, Performance Progress Report, Material Events; CCME Help Desk)',
      'CFPB guidance on adverse-action notices when using AI/complex credit models (ECOA / Regulation B; Circular 2022-03)',
      '12 CFR Part 1805 — Community Development Financial Institutions Program',
      'AIEOG AI Lexicon — AI governance, AI use case inventory (US Treasury / FBIIC / FSSCC, Feb 2026)',
      'Your grant agreement, award conditions, and reporting instructions; institution records-retention policy',
    ],
    sections: [
      {
        heading: 'Why an AI evidence file matters for mission lenders',
        intro:
          'Your CDFI certification, awards, and impact reporting rest on a chain of attestations to the CDFI Fund and, ultimately, to the communities you serve. When AI assists the drafting or analysis behind those attestations, an evidence file proves a human owned the judgment — protecting both your certification and your mission credibility. This is a mission-integrity control, not a tech disclosure: the question a reviewer or examiner asks is "who decided, and on what basis?"',
        items: [
          'Scope it to documents that feed obligations: the ACR, the TLR, Performance Progress Reports for applicable awards, impact narratives, and community-development outreach summaries.',
          'Recommended: keep one lightweight evidence row per AI-assisted deliverable — enough to reconstruct what AI touched and who verified it — rather than logging every keystroke.',
          'Adopt-verbatim file-purpose statement: "This evidence file records where AI tools assisted in preparing materials submitted to or relied upon for the CDFI Fund and for community-impact reporting. AI assistance does not replace the certifying official’s independent review; all figures, claims, and certifications reflect human verification."',
          'Not legal advice — confirm specifics against your Award/Assistance/Allocation Agreement and your award reporting instructions.',
        ],
      },
      {
        heading: 'Build (and reuse) an AI use-case inventory',
        intro:
          'Before logging individual documents, list the AI uses you actually permit in mission work. A short inventory turns ad hoc tool use into governed, repeatable practice and gives you a stable vocabulary for every downstream evidence row. The AIEOG Lexicon frames AI governance as the policies, roles, and oversight that direct how AI is adopted and monitored.',
        steps: [
          'List each approved AI use case in plain language (e.g., "draft impact-narrative first version," "summarize small-business outreach notes," "check ACR narrative for internal consistency").',
          'For each, record the tool/model, the data category it may touch, and the explicit prohibition line (e.g., "no borrower PII," "no protected-class inferences," "no auto-generated certification language submitted without review").',
          'Assign a human owner accountable for each use case and the verification step required before the output is used.',
          'Note where outputs land (ACR narrative, PPR, impact report, outreach summary) so the inventory cross-references your evidence rows.',
          'Review the inventory at least annually — align the cycle with your CDFI Fund reporting calendar so it is current when attestations are due.',
        ],
        items: [
          'Recommended default prohibitions for mission lenders: no AI-generated eligibility or adverse-action reasoning, no synthetic statistics in impact claims, and no AI text inserted into a certification without a named reviewer’s sign-off.',
        ],
      },
      {
        heading: 'Separate AI assistance from human judgment in the record',
        intro:
          'The single most valuable thing your file does is draw a clean line between what AI produced and what a person decided — the same principle CFPB enforces in lending (an institution cannot hide behind a model), applied to documentation.',
        items: [
          'Default rule: every AI-assisted deliverable carries a one-line attribution note naming the AI role, the human reviewer, and the verification performed.',
          'Adopt-verbatim reporting note (working files or cover memo): "Portions of this document were drafted with AI assistance. All data, eligibility determinations, impact claims, and certifications were independently reviewed and verified by [name/title] on [date]. The institution takes full responsibility for the accuracy of the final content."',
          'Distinguish three AI roles so reviewers know the stakes: drafting (low — language only), summarizing (medium — verify against sources), and analysis/recommendation (high — requires documented human re-derivation).',
          'Never let AI generate the certification or attestation language itself; the certifying official’s words and accountability must be human-authored.',
        ],
      },
      {
        heading: 'Fair-lending and access guardrails (ECOA / Regulation B)',
        intro:
          'Mission lending lives or dies on equitable access, and AI introduces concrete fair-lending exposure. Per CFPB guidance, ECOA and Regulation B do not permit creditors to use technology so complex they cannot provide specific and accurate reasons for an adverse action — complexity is not an excuse. Your file should show AI never became a black box between an applicant and a specific, accurate reason.',
        items: [
          'Recommended: AI is permitted for drafting and summarizing, but credit decisions, eligibility calls, and adverse-action reasons must be human-determined and independently documented.',
          'Do not rely on generic checkbox reasons when AI or complex models are involved; reasons must accurately describe the factors actually considered.',
          'Log a fair-lending check on any AI-assisted analytical output: confirm no protected-class proxy entered the inputs and that conclusions are reproducible by a human without the tool.',
          'Adopt-verbatim guardrail note: "No AI output was used to determine applicant eligibility, pricing, or adverse-action reasons. AI assistance was limited to language drafting and summarization of human-verified content; all decisioning rationale is human-authored and specific to the individual circumstances."',
        ],
      },
      {
        heading: 'Map AI evidence to CDFI Fund reporting instruments',
        intro:
          'Your obligations flow through named instruments and your individual agreement; AI-assisted preparation of any of them belongs in the evidence file. The point is traceability from the submitted attestation back to the human who verified it.',
        items: [
          'ACR (Annual Certification and Data Collection Report): if AI helped draft narrative responses, log the row and confirm the certifying official reviewed every certification statement.',
          'TLR (Transaction Level Report): AI must not generate or alter transaction-level data — if used at all (e.g., formatting QA), record it explicitly and verify against source systems.',
          'Performance Progress Report and other award reports: for active recipients, log AI assistance on aggregate performance narratives and reconcile figures to systems of record.',
          'Material Events: where AI assisted in drafting a notification, ensure timeliness (commonly within 30 days, or as your agreement specifies) and human verification of the underlying facts.',
          'Recommended: for anything submitted to the CDFI Fund, the evidence row must name a human certifier; when an instrument or deadline is uncertain, defer to your grant agreement and reporting instructions and the CCME Help Desk rather than assuming.',
        ],
      },
      {
        heading: 'Worked example — AI-assisted annual impact narrative',
        intro: 'Here is the practice in miniature. Use this filled row as your template.',
        items: [
          'Scenario: the Director of Impact uses an approved AI tool to turn de-identified, aggregate small-business lending data and field notes into a first-draft impact narrative for the certified Investment Area, plus a one-paragraph outreach summary from staff notes.',
          'Verification performed: the Director reconciled every figure to the loan-origination system, removed two AI phrasings that overstated job-creation outcomes, confirmed no borrower-level or protected-class data was used, and the certifying official independently approved the final narrative.',
          'Sample filled evidence row — Document: FY2025 Annual Impact Narrative (supports ACR) | AI role: first-draft drafting + summarization | Tool: [approved internal AI assistant] | Data: de-identified aggregate program data; staff field notes | AI prohibited from: borrower PII, certification language, impact statistics | Reviewer: Director of Impact | Verification: figure-to-source reconciliation; overstatement removed; fair-lending data check passed | Certifying sign-off: CEO, 2026-03-04 | Retention: 5 years from submission (per agreement).',
        ],
      },
      {
        heading: 'Retention, access, and audit-readiness',
        intro:
          'Evidence is only useful if it survives staff turnover and can be produced on request. Tie retention to your reporting cycle and keep the file simple enough that anyone can reconstruct what happened.',
        items: [
          'Recommended retention: keep AI evidence rows and supporting drafts for the longer of (a) the period required by your Award/Assistance/Allocation Agreement or (b) your standard records-retention schedule — commonly several years past the related submission; confirm the exact term in your agreement.',
          'Store evidence rows alongside the submitted instrument (ACR/TLR/PPR/impact report) so a reviewer can move from attestation to verification in one step.',
          'Control access: restrict the file to staff with a need to know, and never store borrower PII or protected-class data in it.',
          'Adopt-verbatim retention note: "AI evidence records for this reporting period are retained for [X] years consistent with our records-retention policy and our agreement with the CDFI Fund, and are available to authorized reviewers and examiners upon request."',
        ],
      },
      {
        heading: 'What good looks like / common mistakes',
        intro:
          'A strong AI evidence file reads like a mission-integrity ledger: clear human ownership, clean separation of AI from judgment, and no fair-lending or access blind spots. Most failures come from over- or under-documenting in the wrong places.',
        items: [
          'What good looks like: every AI-assisted submission has a named human certifier, AI’s role is described in one honest line, figures are reconciled to source, and fair-lending/access checks are recorded.',
          'Common mistake (transparency): omitting AI involvement entirely, or burying it so a reviewer cannot tell what AI touched.',
          'Common mistake (fair lending): letting AI generate or influence eligibility or adverse-action reasoning, then being unable to give a specific, accurate, human-verifiable reason.',
          'Common mistake (access/accuracy): letting AI inflate impact or reach figures without reconciling to source data.',
          'Common mistake (over-documentation): storing borrower PII or protected-class data in the evidence file itself — keep the ledger about the process, not the people.',
        ],
      },
    ],
  },
  {
    ...templateBase('gtm-plan'),
    sourcedFrom: [
      'Jack Henry Strategy Benchmark (AI named a top planned technology investment among community banks and credit unions)',
      'Cornerstone Advisors, "What’s Going On in Banking" (AI adoption; no AI strategy without a credible data strategy)',
      'Apiture / Harris Poll consumer banking studies (personalized, responsive service as a switching driver to community institutions)',
      'CFPB Issue Spotlight, "Chatbots in Consumer Finance"',
      'CFPB Circulars 2022-03 / 2023-03 — adverse-action notices for AI/complex credit models (ECOA / Regulation B)',
      'UDAAP examination guidance (CFPB / NCUA / FDIC / OCC)',
    ],
    sections: [
      {
        heading: 'Define the launch and the audience',
        intro:
          'A GTM plan fails when "AI" is the product instead of the outcome. Name one concrete capability, the job it does, and exactly who you’re rolling it out to internally and announcing to externally — narrow scope is what makes a launch compliant, measurable, and finishable.',
        items: [
          'Recommended default: pick an internal-efficiency or human-in-the-loop use case first, not a member-facing autonomous one — the 2026 differentiator is who operationalizes AI with discipline, not who ships the flashiest feature.',
          'Split the audience into two tracks: the internal audience who must adopt it (for the worked example, ~25 contact-center agents, 3 team leads, 1 compliance reviewer) and the external audience who will hear about it (members who contact support).',
          'Decision rule: announce to members only when the AI materially changes their experience or when silence would be misleading; a back-office drafting aid a human approves usually needs internal change management, not a press release.',
          'Adopt-verbatim internal framing line: "This tool drafts; you decide. Nothing reaches a member until a person on our team reads it and approves it."',
        ],
      },
      {
        heading: 'The promise (positioning & value proposition)',
        intro:
          'Your promise is the one sentence that justifies the launch to the people who must adopt it and the members who experience it. It should describe a member or staff outcome, never the technology, and it must be something you can actually deliver and substantiate.',
        items: [
          'Write it as "[audience] gets [outcome] because [what we changed]" — outcome first, mechanism second; the word "AI" is optional and often better left out of member-facing copy.',
          'Internal promise for the worked example: "Agents resolve member questions faster and with more consistent, on-brand answers, because AI drafts a first reply they can edit in seconds instead of writing from scratch."',
          'Member-facing angle (when warranted): lead with responsiveness and personal service — the attributes research identifies as why consumers switch to community institutions — anchored to your existing trust advantage, not novelty.',
          'Hard constraint: every adjective must be provable. "Faster" needs a baseline and a measured delta; "more accurate" needs QA data. If you can’t measure it, don’t claim it.',
          'Adopt-verbatim member-facing line (use only if you announce): "We’ve added new tools that help our team answer your questions more quickly — and a real person on our team still reviews every response before you get it."',
        ],
      },
      {
        heading: 'The proof (evidence, pilot & substantiation)',
        intro:
          'Proof is both a marketing asset and a compliance shield. Under UDAAP, any performance claim must be substantiated before you make it — so the pilot that proves the value is the same data that protects the claim. No claim ships ahead of its evidence.',
        steps: [
          'Run a time-boxed pilot (2-4 weeks) with a subset of the internal audience — for the worked example, 5 agents using AI-drafted replies while the rest serve as a control group.',
          'Capture a clean before/after baseline on the metrics you intend to claim: handle time, first-contact resolution, QA accuracy/error rate, and satisfaction.',
          'Have compliance/QA review a sample of AI-drafted-then-approved replies for accuracy, tone, and prohibited claims (e.g., "instant approval," "no fees," "best rate") — the failure mode the CFPB chatbot spotlight flagged.',
          'Lock the substantiation file: the specific numbers, date range, sample size, and who approved them — this authorizes any external claim and is what you produce if examined.',
        ],
        items: [
          'Recommended default: do not publish a numeric claim ("answers 30% faster") unless the pilot produced that exact number under documented conditions; if directional, make the qualitative point with no figure.',
          'Adopt-verbatim internal talking point: "Before we tell a single member anything, we have to show the numbers behind it. The pilot is how we earn the right to make the claim."',
        ],
      },
      {
        heading: 'Channels & messaging (internal + external)',
        intro:
          'Channels split by audience: internal channels drive adoption and confidence; external channels set member expectations. Match the message to the channel and never let an external claim outrun your substantiation file.',
        items: [
          'Internal channels for the worked example: a hands-on training session, a one-page "draft, edit, approve" quick reference, a pinned chat message, and a standing huddle item for the first month.',
          'External channels (only if announcing): in-app/online-banking message, a short FAQ or help-center article, branch talking points, and a plain-language explanation for any member who asks.',
          'Recommended disclosure default: be transparent and plain — consumer comfort with AI rises when a specific benefit is explained and a human-oversight role is named; vague "AI-powered" labeling erodes the trust community institutions depend on.',
          'Adopt-verbatim branch/phone talking point: "Yes — our team uses tools that help us draft answers faster, but a person here always reviews and approves what you receive. Your information stays protected and you can always reach a real person."',
          'Hard rule: do not imply members are talking to a human when they’re talking to a bot, and do not imply a bot can do something it can’t — both are direct UDAAP risks.',
        ],
      },
      {
        heading: 'Compliance review & guardrails',
        intro:
          'Compliance is a gate in the plan, not a sign-off at the end. Build the review into the timeline so compliance shapes claims and disclosures before launch, with extra scrutiny on anything touching credit. (Operational guidance, not legal advice — route final decisions through your compliance counsel.)',
        items: [
          'Map the use case to its risk tier: back-office drafting with human approval (lower risk) vs. anything that influences a credit decision, eligibility, pricing, or adverse action (high risk, additional rules apply).',
          'Scope guardrail for the worked example: AI-drafted replies must not state credit decisions, approval odds, rates, or eligibility — lending questions route to the proper process rather than letting a drafted reply make a representation.',
          'Reg B / ECOA guardrail: CFPB Circulars 2022-03 / 2023-03 require specific, accurate reasons for adverse action regardless of technology; a creditor may not hide behind black-box AI. Keep AI out of adverse-action messaging unless you can meet this.',
          'Adopt-verbatim agent escalation rule: "If a drafted reply mentions a rate, an approval, eligibility, or a denial, do not send it — escalate it. AI never delivers a credit decision."',
          'Recommended: require compliance sign-off on three artifacts before launch — the member-facing announcement copy, the FAQ/disclosure language, and the substantiation file behind any claim.',
        ],
      },
      {
        heading: 'Timeline & rollout sequence',
        intro:
          'A realistic first launch runs roughly 6-10 weeks. Sequence it so compliance and substantiation precede any external word, and so internal adoption is solid before members are involved.',
        steps: [
          'Weeks 1-2 — Define & align: lock scope, audiences, the promise, success metrics, and the prohibited-claims list; open the compliance workstream.',
          'Weeks 3-4 — Pilot: run it, capture baseline vs. results, assemble the substantiation file.',
          'Week 5 — Compliance review & decision: review pilot output and draft copy; decide whether a member announcement is warranted; sign off on the three artifacts.',
          'Weeks 6-7 — Internal rollout: train the full internal audience, publish the quick reference, require the draft/edit/approve workflow.',
          'Week 8 — External announcement (if warranted): publish in-app message and FAQ, brief branch staff, turn on monitoring.',
          'Weeks 9-10 — Monitor & adjust: track metrics and complaints weekly; fix or pull anything that misses the bar before scaling.',
        ],
        items: [
          'Gate rule: no external announcement ships until the substantiation file is signed and internal adoption is confirmed — an unevenly adopted tool plus a public promise invites complaints.',
        ],
      },
      {
        heading: 'Metrics & success criteria',
        intro:
          'Define success before launch or you’ll declare victory by anecdote. Pick a small set of metrics tied to the promise, set baselines, and name the threshold that would make you pause, fix, or roll back.',
        items: [
          'For the worked example, track four: average handle time, first-contact resolution, QA accuracy/error rate on sent replies, and member CSAT — plus a guardrail metric: AI-related complaints or escalations.',
          'Set the success threshold in advance: e.g., "handle time down with no drop in QA accuracy and no rise in complaints"; a speed gain that increases errors is a failure, not a win.',
          'Define a kill/rollback trigger: e.g., QA error rate rises above the pre-launch baseline, or member complaints referencing inaccurate/"robotic" responses exceed a set count in a week — pull or pause and remediate.',
          'Adopt-verbatim leadership update line: "We measured it before we scaled it: [metric] moved from [baseline] to [result] with no increase in errors or complaints — here’s the data."',
        ],
      },
      {
        heading: 'What good looks like / common mistakes',
        intro:
          'The difference between a launch that compounds and one that creates risk is discipline: scoped capability, substantiated claims, human oversight, transparent disclosure, and a metric that can fail.',
        items: [
          'What good looks like: one narrow capability with a human in the loop; a promise stated as an outcome; every claim backed by a dated substantiation file; plain-language disclosure naming the benefit and the human-review role; compliance signed off before any external word; a defined success threshold with a rollback trigger.',
          'Common mistake (overpromising): claiming "instant," "guaranteed," "best rate," or a percentage you didn’t measure — the CFPB chatbot spotlight flags AI generating unsubstantiated specifics, which map straight to deceptive-acts claims.',
          'Common mistake (UDAAP): marketing that doesn’t match the fine print, implying a member is talking to a human when it’s a bot, or omitting AI’s role where a member would have needed to know it.',
          'Common mistake (Reg B/ECOA): letting AI touch credit messaging or adverse-action reasons without being able to give specific, accurate reasons; "the model decided" is not a permissible reason.',
          'Common mistake (no metric): launching without a baseline, threshold, or kill switch, so you can’t tell whether it worked or defend the claim later.',
          'Common mistake (leading with the tech): marketing "AI" instead of the outcome, trading away the trust advantage that is exactly why members choose community institutions.',
        ],
      },
    ],
  },
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
