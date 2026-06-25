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
