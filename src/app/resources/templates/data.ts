// Templates registry for /resources/templates/[slug].
//
// Each template is a structured, usable document a banker can read and
// copy. Content is intentionally short and concrete — these are starters,
// not exhaustive policies. Banks adapt before adopting.
//
// Source discipline (per CLAUDE.md):
//   - AIEOG AI Lexicon and FS AI RMF (US Treasury / FBIIC / FSSCC · Feb 2026)
//   - SR 26-2 revised model risk management guidance
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
  readonly tables?: readonly TemplateTable[];
}

export interface TemplateTable {
  readonly caption?: string;
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
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
      'AIEOG AI Lexicon - US Treasury / FBIIC / FSSCC (February 2026): defines AI use-case inventory as a maintained repository/listing; optional shared vocabulary, not a supervisory mandate.',
      'Financial Services AI Risk Management Framework - financial-sector AI lifecycle risk management.',
      'SR 26-2 Revised Guidance on Model Risk Management - where applicable to model-risk use cases.',
      'OCC Bulletin 2026-13 - generative and agentic AI scope nuance.',
      'Interagency Guidance on Third-Party Relationships: Risk Management - vendor and third-party AI features.',
    ],
    sections: [
      {
        heading: 'Maintain it for the right conversations',
        intro:
          'Maintain the inventory for your AI committee, risk review, vendor oversight, audit prep, and examiner conversations. Do not treat this card as exam readiness by itself; it is the starting record that makes oversight possible.',
        items: [
          'The AIEOG AI Lexicon defines an AI use-case inventory as a maintained record supporting governance, transparency, and risk management.',
          'The Lexicon is an optional shared-vocabulary tool, not a supervisory mandate.',
          'Use one row per AI-touched workflow. A use case is the task, not only the tool name.',
        ],
      },
      {
        heading: 'Start with the 30-minute AI Inventory Sprint',
        intro:
          'Use this quick sprint to get the first usable register started before expanding into department-by-department review.',
        steps: [
          'Ask every department where AI, GenAI, embedded AI, or vendor AI features touch work today.',
          'Separate the workflow from the system name.',
          'Classify data class and risk tier separately.',
          'Assign one accountable owner.',
          'Record human review, evidence retained, last review date, and next review date.',
        ],
      },
      {
        heading: 'Core register columns',
        intro:
          'Create one row per AI-touched workflow. Keep data class and risk tier separate so sensitive data does not automatically become a risk rating, and lower-data workflows are still reviewed when they can affect customers or regulated work.',
        tables: [
          {
            caption: 'Core register fields',
            headers: ['Column', 'What to record'],
            rows: [
              ['Workflow', 'The actual task, not the system name.'],
              ['Tool / vendor', 'Product, vendor, embedded feature, internal model, or public tool.'],
              ['Use-case status', 'Proposed, sandbox, approved, restricted, retired, or blocked.'],
              ['Data Class', 'Public, Internal, Confidential, NPI, or Regulated / exam-sensitive.'],
              ['Risk Tier', 'Low, Medium, High, or Blocked. Keep this separate from data class.'],
              ['Customer impact?', 'Yes / no. Include whether output may affect service, eligibility, pricing, fraud, collections, or communications.'],
              ['Regulated workflow?', 'Lending, BSA/AML, fraud, complaints, marketing, HR, regulatory reporting, or none.'],
              ['Owner', 'A person, not a committee or generic department.'],
              ['Human review', 'None, sampled, mandatory, second-line, or committee approval.'],
              ['Evidence retained', 'Prompt, output, ticket, reviewer note, approval, vendor review, or location.'],
              ['Last reviewed', 'Date the row was last confirmed.'],
              ['Next review', 'Date or cadence for the next review.'],
            ],
          },
        ],
      },
      {
        heading: 'Vendor-control add-on',
        intro:
          'For vendor or embedded AI features, add fields for the third-party control evidence reviewers will ask to see.',
        tables: [
          {
            caption: 'Third-party AI control fields',
            headers: ['Field', 'What to record'],
            rows: [
              ['Due diligence status', 'Has InfoSec, Compliance, Risk, and the business owner reviewed the tool for this use?'],
              ['Contract review', 'Does the agreement address confidentiality, audit, regulatory access, breach notice, and use limits?'],
              ['Data-use terms', 'May the vendor use prompts, outputs, or bank data for model training or product improvement?'],
              ['Model-training terms', 'Is training on bank/customer data prohibited or opt-out confirmed in writing?'],
              ['Retention/deletion', 'How long are prompts and outputs retained, and how are they deleted?'],
              ['Subcontractors', 'What subprocessors, hosted models, or infrastructure providers are involved?'],
              ['Ongoing monitoring owner', 'Who reviews performance, incidents, complaints, and vendor changes?'],
              ['Termination / data-return plan', 'How will access be revoked and bank data returned or deleted?'],
            ],
          },
        ],
      },
      {
        heading: 'Risk-tier guide',
        intro:
          'Tier on the highest factor that applies. The goal is consistency across departments, not false precision.',
        tables: [
          {
            caption: 'Simple tier definitions',
            headers: ['Tier', 'Definition'],
            rows: [
              ['Low', 'Internal drafting, public or approved internal data, no customer impact, no regulated decision, approved tool, and human review before use.'],
              ['Medium', 'Internal process support, customer-facing draft content, confidential internal data, or operational workflow support where human review is required.'],
              ['High', 'Decision support for credit, fraud, BSA/AML, sanctions, complaints, regulatory reporting, customer-impacting workflows, or NPI used only in an approved private environment.'],
              ['Blocked', 'Public AI tool with NPI, SAR/AML detail, examination-sensitive information, privileged material, security controls, or final regulated decisions.'],
            ],
          },
        ],
        items: [
          'Model-risk note: Where an AI use case informs quantitative, customer-impacting, or regulated decisions, evaluate whether model-risk controls apply under current guidance, including SR 26-2 where applicable. For generative AI workflows, maintain inventory, ownership, data controls, vendor oversight, human review, and review cadence even when the workflow is not treated as a formal model.',
        ],
      },
      {
        heading: 'Sample rows',
        intro:
          'Use these examples to calibrate the first pass. They are deliberately simple so reviewers can see why the tier changes.',
        tables: [
          {
            caption: 'Starter examples',
            headers: ['Example', 'Use case', 'Data class', 'Risk tier', 'Required control'],
            rows: [
              ['Low', 'Summarize public regulator press releases for internal training.', 'Public', 'Low', 'Human editor confirms accuracy before training use.'],
              ['Medium', 'Draft customer email language using approved templates and no customer data.', 'Internal', 'Medium', 'Marketing and Compliance review before sending.'],
              ['High', 'Analyze fraud patterns in an approved enterprise environment.', 'NPI / regulated', 'High', 'Mandatory review, vendor controls, evidence retention, quarterly review.'],
              ['Blocked', 'Enter loan-file details or SAR investigation notes into a public AI tool.', 'NPI / SAR-sensitive', 'Blocked', 'Do not use. Escalate to AI Program Owner and Compliance.'],
            ],
          },
        ],
      },
      {
        heading: 'Next step: Download the editable AI Use-Case Inventory Spreadsheet',
        intro:
          'Use the spreadsheet companion at /downloads/artifact-ai-use-case-inventory-spreadsheet.xlsx to track owner, data class, risk tier, vendor status, human review, evidence retained, last review, and next review date.',
        items: [
          'Adapt tier definitions, approval roles, cadence, data classes, and vendor-control fields before adoption.',
          'Keep enough history to show when use started, changed, stopped, or moved into a different control path.',
        ],
      },
    ],
  },
  {
    ...templateBase('ai-use-policy-starter'),
    sourcedFrom: [
      'GLBA Safeguards Rule - 16 CFR Part 314 (FTC jurisdiction); parallel interagency information-security standards for depository institutions',
      'SR 26-2 - Revised Guidance on Model Risk Management (FRB / FDIC / OCC, Apr 17, 2026; supersedes SR 11-7 and SR 21-8 where applicable)',
      'Interagency Guidance on Third-Party Relationships: Risk Management (FRB / FDIC / OCC, June 6, 2023; 88 FR 37920)',
      'ECOA / Regulation B (12 CFR 1002) and CFPB Circular 2023-03 on adverse-action notices using AI/complex models',
      'NIST AI Risk Management Framework (AI RMF 1.0, NIST AI 100-1, Jan 2023): Govern, Map, Measure, Manage',
      'AIEOG AI Lexicon and Financial Services AI Risk Management Framework - US Treasury / FBIIC / FSSCC (Feb 19, 2026)',
    ],
    sections: [
      {
        heading: 'Purpose & scope',
        intro:
          'This section states why the policy exists and exactly what it covers, so staff and reviewers can tell in one read whether a given activity is in bounds. The right default is broad scope (any generative tool, any channel) with risk-tiered controls layered on top - not a narrow tool-by-tool list that goes stale.',
        items: [
          'Recommended: define "Generative AI" by behavior, not brand. Starter clause language to adapt: "This policy applies to any system that accepts natural-language or data input and produces generated text, images, audio, video, or code, whether accessed as a standalone service, embedded in a vendor product, built into [Institution]\'s core or ancillary systems, or self-hosted."',
          'Why: a brand list (ChatGPT, Claude, Gemini, Copilot) is obsolete the day a vendor ships an AI feature inside software you already use; behavior-based scope captures embedded AI automatically.',
          'Recommended: state the standards this policy implements so risk, compliance, and exam teams can see the through-line. Starter clause language to adapt: "This policy operationalizes [Institution]\'s GLBA information-security program, applies model-risk principles consistent with current revised model risk management guidance, including SR 26-2 where applicable (SR 26-2 supersedes SR 11-7 and SR 21-8), and uses the NIST AI Risk Management Framework functions of Govern, Map, Measure, and Manage as a governance structure."',
          'Why: for institutions subject to the FTC Safeguards Rule, map ownership to the Qualified Individual requirement. Depository institutions should map this policy to their GLBA information-security program and applicable interagency information-security standards.',
          'Recommended: scope to everyone, not just employees. Starter clause language to adapt: "This policy binds all employees, officers, directors, temporary staff, interns, and contractors who use AI in connection with [Institution] business or who handle [Institution] data with AI tools."',
          'What good looks like: a one-paragraph scope a teller and an examiner read the same way. Common mistake examiners flag: a policy that only governs a single named chatbot while AI quietly enters through a core/loan-origination/marketing vendor with no oversight.',
        ],
      },
      {
        heading: 'Governance & accountability',
        intro:
          'A policy with no named owner is a finding waiting to happen. The NIST AI RMF puts Govern first for a reason, and AI oversight should connect to the institution\'s existing information-security, model-risk, compliance, and board-reporting structure. Assign one accountable owner, define an approval gate, and report to the board.',
        items: [
          'Recommended: name a single accountable owner. Adaptable clause: "The [Chief Risk Officer / Information Security Officer] is the AI Program Owner, accountable to the Board (or a designated committee) for this policy, the inventory of AI use cases, and exceptions."',
          'Why: for institutions subject to the FTC Safeguards Rule, map the AI Program Owner to the Qualified Individual responsible for the information-security program. Depository institutions should map that role to their GLBA information-security program owner and applicable interagency information-security standards.',
          'Recommended: route approvals through one cross-functional gate. Adaptable clause: "No new AI use case involving [Institution] data or affecting customers may go live without written approval from the AI Program Owner, with sign-off from Compliance and Information Security; high-risk use cases (see Risk tiering) also require [Committee] approval."',
          'Recommended: report up at least annually. Adaptable clause: "The AI Program Owner reports to the Board or its designated committee at least annually on the AI use-case inventory, material incidents, exceptions granted, and the results of the policy review."',
          'Why: the 2023 Interagency Third-Party guidance and GLBA both treat board-level oversight of risk as expected; AI does not get a carve-out from the governance you already run.',
          'What good looks like: an org chart line from teller to AI Program Owner to board. Common mistake examiners flag: "shadow AI" — staff using consumer tools with no inventory, no owner, and no record the board knows it is happening.',
        ],
      },
      {
        heading: 'Approved tools & third-party oversight',
        intro:
          'Treat every AI tool as a third-party relationship and run it through the lifecycle the 2023 Interagency Guidance describes: planning, due diligence, contracting, ongoing monitoring, and termination. The default posture is allow-list, not block-list - only vetted tools, accessed through institution-controlled accounts.',
        items: [
          'Recommended: allow-list only. Adaptable clause: "Only AI tools on the Approved AI Tools List may be used for [Institution] business. The list is maintained by the AI Program Owner and reviewed at least quarterly. Use of any non-listed AI tool for institution work or data is prohibited."',
          'Recommended: ban personal accounts for institution data. Adaptable clause: "Staff may not enter [Institution] or customer information into AI tools through personal accounts, free consumer tiers, or browser extensions; only institution-provisioned accounts on approved tools may be used."',
          'Why: free consumer tiers frequently reserve the right to train on submitted content; the 2023 Interagency Guidance and GLBA both require that contracts with service providers address confidentiality and data use for nonpublic information.',
          'Recommended: gate listing on real due diligence. Adaptable clause: "Before a tool is listed, Information Security and Compliance confirm a written agreement that addresses data ownership, prohibition on training the vendor\'s base model on [Institution] data without consent, retention and deletion, subcontractor (fourth-party) use, breach notification, and audit/SOC 2 rights."',
          'Why: the Interagency Guidance specifically calls out assessing subcontractors and the vendor\'s own information-security and incident-response capabilities — "fourth-party" risk is in scope, not optional.',
          'Lifecycle questions to document: Planning - what business problem does the AI tool solve? Due diligence - does the vendor train on bank data? Contracting - what do terms say about data use, deletion, breach notice, subcontractors, and audit rights? Monitoring - who reviews performance and incidents? Termination - how is bank data deleted or returned?',
          'Worked example (Approved AI Tools List row): Tool = [Vendor] Enterprise; Access = SSO, institution-provisioned only; Permitted data classes = Public, Internal; Prohibited = Confidential, NPI/Regulated; Training opt-out = Confirmed in writing [date]; Retention = zero-retention tier enabled; Owner = [name]; Next review = [date].',
          'What good looks like: every listed tool maps to a signed agreement and a monitoring date. Common mistake examiners flag: an "approved" tool with no contract review, no training opt-out confirmation, and no record of who owns ongoing monitoring.',
        ],
      },
      {
        heading: 'Data classification & permitted inputs',
        intro:
          'This is the section that prevents the headline incident. Tie AI inputs to your existing GLBA-driven data classification scheme and state, per class, where data may and may not go. The safe default: nonpublic personal information (NPI) and regulated data never enter a public or shared-tenant AI tool.',
        items: [
          'Recommended: anchor on classes you already use. Adaptable clause: "Inputs to AI tools follow [Institution]\'s data classification standard. Each class has a defined permitted destination; when in doubt, treat data as the higher-sensitivity class and ask the AI Program Owner."',
          'Worked example — filled data-classification matrix (adapt to your standard):',
          'Public (rate sheets, published marketing copy, public website FAQs, press releases): Allowed in any approved tool.',
          'Internal (draft procedures, internal memos, non-customer training material, de-identified examples): Allowed in approved tools only; not in personal/consumer accounts.',
          'Confidential — NPI (customer names with account or balance data, SSN/TIN, card/account numbers, application data, loan files, transaction history): Prohibited in any public or shared-tenant AI tool; permitted only in an approved private/zero-retention deployment with a contract that covers NPI, and only for an approved use case.',
          'Regulated / examination-sensitive (SAR/CTR content and SAR existence, BSA/AML investigation detail, fair-lending analysis, model validation work, examination correspondence and work product, attorney-client privileged material): Prohibited in all AI tools by default; any exception requires written AI Program Owner and Compliance approval and a private deployment.',
          'Why: GLBA\'s Safeguards Rule requires protecting the security and confidentiality of customer information; SAR confidentiality is independently mandated (31 U.S.C. 5318(g) / 12 CFR Part 21 et al.), so SAR detail must never enter a general-purpose tool.',
          'Recommended: require de-identification before prompting. Adaptable clause: "Where AI assistance is useful but the source contains NPI, staff must remove or tokenize all customer identifiers before prompting; reattaching identifiers happens only outside the AI tool."',
          'What good looks like: a one-page matrix posted where staff prompt. Common mistake examiners flag: a policy that says "don\'t share confidential data" without defining the classes — staff cannot follow a rule they cannot apply to the document in front of them.',
        ],
      },
      {
        heading: 'Permitted & prohibited uses',
        intro:
          'Name the green-light uses so staff feel safe being productive, and name the bright-line prohibitions so no one has to guess. The default: AI may draft and summarize, but it may not make or rubber-stamp a decision that affects a customer\'s money, credit, or legal standing.',
        items: [
          'Recommended (permitted, illustrative): drafting internal documents and non-customer communications, summarizing internal material, brainstorming, reformatting, generating code in approved environments, and first-draft training content — all subject to human review.',
          'Recommended (prohibited bright lines). Adaptable clause: "AI tools may not be used to make a final credit, account-closure, fraud-disposition, BSA/AML, HR, or other adverse decision affecting a customer or employee; AI may inform a recommendation only where a qualified person makes and can independently justify the decision."',
          'Why: under ECOA and Regulation B, a creditor must give specific, accurate principal reasons for adverse action, and CFPB Circular 2023-03 makes clear a creditor "cannot justify noncompliance based on the mere fact" that its model is "too complicated, opaque, or novel" - a black-box adverse action is not defensible.',
          'Recommended: control AI-generated adverse-action language. Adaptable clause: "AI-generated adverse-action language may not be used unless Compliance confirms that the stated reasons are specific, accurate, and traceable to factors actually considered."',
          'Recommended: prohibit creating false or misleading content. Adaptable clause: "AI may not be used to generate content that misrepresents [Institution] products or terms, fabricate compliance documentation, or produce material that would mislead a customer (UDAAP), an auditor, or an examiner."',
          'Recommended: require disclosure where a customer would reasonably expect a human. Adaptable clause: "Customer-facing AI interactions (e.g., chat) must not impersonate a human and must offer a path to a person."',
          'What good looks like: a short green/red list staff can recite. Common mistake examiners flag: using AI in underwriting or BSA/AML decisioning without being able to produce specific, accurate reasons — a direct Reg B / fair-lending exposure.',
        ],
      },
      {
        heading: 'Human review & model-risk discipline',
        intro:
          'AI output is draft work product until a qualified human stands behind it. Where AI informs decisions, apply model-risk discipline proportionate to the stakes and consistent with current revised model risk management guidance, including SR 26-2 where applicable. SR 26-2 supersedes SR 11-7 and SR 21-8.',
        steps: [
          'Classify the use case by impact: low (internal drafting), medium (customer-facing content), high (informs a decision about credit, accounts, fraud, or BSA/AML). Controls scale with the tier.',
          'Require named human review before reliance. Adaptable clause: "Every AI output used in customer-facing, regulated, or decision-supporting work is reviewed by a qualified person who is identified by name and role and who verifies factual accuracy, calculations, regulatory references, and data handling before the output is used, sent, filed, or relied upon."',
          'For high-tier (decisioning) uses, apply effective challenge: document the tool\'s purpose, inputs, known limitations, and how a reviewer can override it - consistent with current revised model risk management guidance and proportionate to the institution\'s model-risk profile.',
          'Test for the failure modes that matter for generative AI: fabrication ("hallucination"), bias/disparate impact in any customer-affecting use, and prompt-injection or data-leakage risk; record the test and who performed it.',
          'Monitor on a cadence: re-review high-tier uses at least annually and on any material tool/model change, vendor update, regulatory change, or incident.',
        ],
        items: [
          'Why: when AI informs a customer decision, model-risk expectations such as validation, monitoring, documentation, and effective challenge apply at a scale proportionate to your institution and the use case.',
          'Note: model-risk guidance continues to evolve. Apply current revised model-risk principles proportionately and revisit this section when new guidance is issued, rather than assuming AI is out of scope.',
          'What good looks like: a one-page validation memo for each decisioning use case. Common mistake examiners flag: "the AI checked it" offered as the control, with no human attestation and no record of testing for accuracy or bias.',
        ],
      },
      {
        heading: 'Documentation & recordkeeping',
        intro:
          'If it is not documented, an examiner will treat it as if it did not happen. Keep a lightweight but consistent record for any AI-assisted work that reaches a customer, a regulated process, or a decision — enough to reconstruct what happened and who is accountable.',
        items: [
          'Recommended minimum record. Adaptable clause: "For AI-assisted work producing a customer-facing or examiner-relevant artifact, [Institution] retains: the approved tool and version used, the prompt or instruction, the data class of the input, the output relied upon, and the human reviewer and date of review."',
          'Recommended: keep the AI use-case inventory current. Adaptable clause: "The AI Program Owner maintains a written inventory of all AI use cases, including purpose, owner, data classes, risk tier, approval date, and next review date," consistent with NIST AI RMF Map/Govern practices.',
          'Recommended: align retention to your existing schedule. Adaptable clause: "AI-related records are retained per [Institution]\'s records-retention schedule and the retention applicable to the underlying business record (e.g., loan-file retention applies to AI-assisted loan documentation)."',
          'Why: GLBA information-security programs and applicable safeguards expectations rely on documented risk assessment, controls, and review; a maintained inventory plus per-artifact records is how you evidence that AI sits inside that program.',
          'What good looks like: an examiner can pull any AI-assisted loan or marketing piece and see tool, prompt, data class, and reviewer. Common mistake examiners flag: an inventory built once for the exam and never updated, or no inventory at all.',
        ],
      },
      {
        heading: 'Incident response & exceptions',
        intro:
          'AI incidents — inadvertent NPI disclosure, prompt injection, a fabricated output that reached a customer, or unapproved tool use — ride on your existing incident-response plan, with AI-specific triggers added. Exceptions are allowed but must be deliberate, time-bound, and logged.',
        items: [
          'Recommended: fold AI into the existing plan, do not build a parallel one. Adaptable clause: "Suspected AI policy violations, prompt-injection attempts, model misuse, or disclosure of confidential or regulated data into an AI tool are handled under [Institution]\'s incident-response plan, with notice to the AI Program Owner, Compliance, and Information Security."',
          'Recommended: set a fast internal notification clock and preserve evidence. Adaptable clause: "Discovery is reported within [24 hours]; the prompt, output, account, and any downstream artifacts are preserved, and tool/chat history is not deleted while the incident is open."',
          'Why: FTC Safeguards Rule incident-response and notification obligations, plus parallel bank breach-notification and incident-response expectations, can be triggered by unauthorized exposure of customer information - AI is just one more channel that exposure can flow through.',
          'Recommended: govern exceptions explicitly. Adaptable clause: "Any exception to this policy requires written AI Program Owner approval, a stated business justification, compensating controls, an expiration date not to exceed [12 months], and entry in the exceptions log reported to the Board committee."',
          'What good looks like: an exceptions log with expiration dates and compensating controls. Common mistake examiners flag: informal, undocumented exceptions ("we let the loan team use it") with no owner, no end date, and no compensating control.',
        ],
      },
      {
        heading: 'Training & policy review cycle',
        intro:
          'A policy no one is trained on is unenforceable, and a policy that never changes goes stale in a field moving this fast. Train on adoption and annually, and review the policy on a fixed cadence plus event triggers.',
        items: [
          'Recommended: mandatory, role-aware training. Adaptable clause: "All staff complete AI-use training before being granted access to approved AI tools and at least annually thereafter; staff in lending, BSA/AML, and other regulated functions receive role-specific training on permitted uses and prohibitions."',
          'Why: GLBA information-security programs and applicable safeguards expectations rely on trained personnel; AI-specific training is the natural extension and is a low-cost item examiners notice when it is missing.',
          'Recommended: fixed review cadence plus triggers. Adaptable clause: "This policy is reviewed and re-approved at least annually and additionally upon: a new tool listing, new or amended regulatory guidance on AI, a material incident, or a significant change in [Institution]\'s AI usage."',
          'Recommended: version and approve. Adaptable clause: "Each version records its effective date, approver, and a summary of changes; the current version is published where staff access AI tools."',
          'What good looks like: a dated, board-approved policy with a training completion record and a change log. Common mistake examiners flag: an undated policy, no evidence of training completion, and a review date that has already lapsed.',
        ],
      },
      {
        heading: 'Next step: AI Policy Gap Review',
        intro:
          'Use this starter to compare current AI use against seven control areas: approved tools, data classification, third-party terms, human review, decisioning limits, recordkeeping, and training.',
        items: [
          'Run a 30-minute review with Compliance, Risk, Information Security, and the AI Program Owner.',
          'Mark each control area green, yellow, or red, then assign one owner and one due date for every yellow or red gap.',
          'The AI Banking Institute can help your team turn this starter into a bank-ready internal policy aligned to your tools, vendors, data classes, and approval process.',
        ],
      },
    ],
  },
  {
    ...templateBase('ai-workflow-sop'),
    sourcedFrom: [
      'SR 26-2 and OCC Bulletin 2026-13 - revised model-risk guidance, scope limitations for generative and agentic AI, and risk-based principles where applicable',
      'NIST AI Risk Management Framework (AI RMF 1.0): Govern, Map, Measure, Manage',
      'Interagency Guidance on Third-Party Relationships: Risk Management (FRB / FDIC / OCC, June 2023)',
      'ECOA / Regulation B and CFPB Circular 2023-03 for credit and adverse-action controls',
      'AIEOG AI Lexicon and Financial Services AI Risk Management Framework - US Treasury / FBIIC / FSSCC (Feb 2026)',
    ],
    sections: [
      {
        heading: 'Part 1: blank AI workflow SOP template',
        intro:
          'Complete this page first. It turns the SOP from guidance into a working control record that risk, compliance, audit, and exam teams can inspect.',
        tables: [
          {
            caption: 'Fillable front page',
            headers: ['Field', 'Response'],
            rows: [
              ['Workflow ID', '[AI-___-___]'],
              ['Workflow Name', '[Plain-English workflow name]'],
              ['Department', '[Business line or function]'],
              ['Named Owner', '[Person accountable for operation]'],
              ['Accountable Executive', '[Senior executive accountable for risk]'],
              ['Tool/Vendor', '[Approved tool, vendor, version if known]'],
              ['Deployment Type', '[Public AI / enterprise account / vendor feature / private deployment / internal model]'],
              ['Data Class', '[Public / internal / confidential-NPI / regulated / exam-sensitive / privileged]'],
              ['Customer Data Involved', '[No / yes / de-identified / approved private environment only]'],
              ['Regulated Process Involved', '[Credit / BSA-AML / fraud / complaints / regulatory reporting / none]'],
              ['Risk Tier', '[Low / moderate / high / blocked]'],
              ['Approval Date', '[YYYY-MM-DD]'],
              ['Next Review Date', '[YYYY-MM-DD]'],
              ['Material Error Threshold', '[X% or other defined limit]'],
              ['Customer-Impacting Error Threshold', '[Any occurrence / X occurrences]'],
              ['Shutoff Threshold', '[Severe event / vendor model change / two consecutive months over threshold]'],
              ['Fallback Process', '[Manual process or alternate approved workflow]'],
              ['Records Retained', '[Prompt, output, review note, approval, ticket, vendor evidence, or final artifact]'],
              ['Last Version Reviewed', '[Version/date/reviewer]'],
            ],
          },
        ],
      },
      {
        heading: 'Workflow identity, scope, and prohibited uses',
        intro:
          'Register one workflow, not a whole tool. The SOP should let a reader state what the workflow does, what it cannot do, who reviews it, what evidence is retained, and when use is paused.',
        items: [
          'Business purpose and output - name the job and the artifact. Example: "Generate a first-draft procedure summary for human review; output is a draft staff memo, not an official record until approved."',
          'In scope - list the exact tasks the AI may perform, such as drafting, summarizing, comparing, extracting, or formatting approved source material.',
          'Out of scope / prohibited - adaptable clause language: "This workflow does not make or recommend credit decisions, assign risk ratings, determine customer eligibility, calculate official figures, communicate directly with customers, or serve as a system of record unless separately approved."',
          'Data boundary - list allowed inputs and prohibited inputs. Customer NPI, account data, exam-sensitive material, SAR/AML information, privileged material, security-control data, credentials, and full identifiers require explicit approval and an approved environment.',
          'Evidence retained - identify the retained record before go-live: final approved output, reviewer note, approval ticket, exception log entry, vendor review, monitoring report, or other evidence.',
        ],
      },
      {
        heading: 'Human review, decision controls, and model-risk considerations',
        intro:
          'Where an AI-assisted workflow supports quantitative, customer-impacting, or regulated decision processes, the institution applies model-risk, compliance, validation, monitoring, and effective-challenge controls appropriate to the use case. Generative AI workflows used for drafting, summarization, or workflow support should be governed through approved-tool controls, data restrictions, human review, documentation, vendor oversight, monitoring, and incident-response procedures.',
        items: [
          'Human-in-the-loop control - adaptable clause language: "A qualified reviewer checks every AI output for factual accuracy, missing context, unsupported statements, stale information, data leakage, and tone before the output is used or retained."',
          'Decision-control boundary - state whether the output can affect credit availability, pricing, fraud handling, BSA/AML work, complaints, regulatory reporting, or any other regulated process. If yes, require Compliance, Risk, and business-owner review before production use.',
          'Effective challenge - name the reviewer who can reject the output, override it, require manual work, or pause the workflow without business-line retaliation.',
          'Credit/adverse-action control - AI-generated adverse-action language may not be used unless Compliance confirms that the stated reasons are specific, accurate, and traceable to factors actually considered.',
          'OCC scope note - do not treat every generative AI drafting workflow as a formal model-validation event. Apply current model-risk principles where the workflow informs quantitative, customer-impacting, or regulated decisions, and apply documented governance controls for drafting and workflow-support use cases.',
        ],
      },
      {
        heading: 'Vendor and third-party lifecycle',
        intro:
          'If the workflow uses a vendor, embedded AI feature, hosted model, or enterprise AI platform, document the third-party lifecycle. Third-party use does not move responsibility away from the bank.',
        tables: [
          {
            caption: 'AI vendor lifecycle controls',
            headers: ['Lifecycle stage', 'AI-specific question', 'Evidence retained'],
            rows: [
              ['Planning', 'Why is AI needed for this workflow, and what manual process remains available?', 'Business case, risk tier, fallback process'],
              ['Due diligence', 'Does the vendor train on bank or customer data, and what security, model, and data-use evidence was reviewed?', 'SOC report, security review, AI/data-use documentation, financial review'],
              ['Contracting', 'Are data use, deletion, breach notice, subcontractors, audit rights, regulator access, and retention addressed?', 'Contract terms, DPA, legal/compliance approval'],
              ['Monitoring', 'Who reviews tool changes, model/version updates, errors, incidents, and performance?', 'Monitoring report, change log, incident log, vendor review'],
              ['Termination', 'How is access disabled and bank/customer data returned or deleted?', 'Termination checklist, access removal, deletion/return confirmation'],
            ],
          },
        ],
      },
      {
        heading: 'Monitoring thresholds and shutoff triggers',
        intro:
          'Do not write "monitor as needed." Put the actual pause thresholds in the SOP so the owner knows when use must stop and who can restart it.',
        tables: [
          {
            caption: 'Required monitoring fields',
            headers: ['Control field', 'Required entry'],
            rows: [
              ['Material error threshold', '[X%] of reviewed outputs or [X] material errors per month'],
              ['Customer-impacting error threshold', '[Any occurrence] or [X occurrences]'],
              ['Data-handling exception threshold', '[Any restricted data entered into an unapproved tool]'],
              ['Pause trigger', '[Two consecutive months over threshold / any severe event / vendor model change / data exposure]'],
              ['Restart approval', '[Owner + Compliance + Risk / committee / accountable executive]'],
              ['Monitoring cadence', '[Monthly / quarterly / event-triggered]'],
            ],
          },
        ],
        items: [
          'Pre-deployment check - document the initial test that established fitness for the approved scope. For higher-risk workflows, require independent validation or model-risk review before production use.',
          'Ongoing metrics - choose 2-4 measures such as factual-error rate, material rework rate, data-handling exceptions, customer-impacting errors, incident count, and vendor change events.',
          'Escalation - adaptable clause language: "If a pause trigger occurs, the workflow owner stops use, notifies the accountable executive and control partners, preserves evidence, and documents the restart decision before use resumes."',
        ],
      },
      {
        heading: 'Governance, incidents, recovery, and retirement',
        intro:
          'Tie the SOP to existing policies and decide in advance what happens when the AI gets it wrong, changes materially, or no longer belongs in production.',
        items: [
          'Approvals on record - list approval date, approver, policy linkage, risk acceptance, and any conditions before production use.',
          'Change management - adaptable clause language: "Material changes to inputs, scope, output, model/version, vendor, data class, or regulated-process impact require re-review before continued use."',
          'Incident response - define same-business-day notification for material errors, customer-impacting outputs, data exposure, prohibited inputs, suspicious activity concerns, or examiner-facing errors.',
          'Recovery / fallback - confirm the manual path, reprocess affected items through human review, and preserve evidence of correction.',
          'Retirement - disable access, confirm data return/deletion where applicable, archive the SOP, mark the use case retired, and record the reason and date.',
        ],
      },
      {
        heading: 'Part 2: completed example - commercial loan memo drafting',
        intro:
          'Use this as an example only. It separates the lending scenario from the blank template and corrects the credit-control language that belongs in any lending workflow.',
        items: [
          'Workflow ID/name - AI-LEND-001: AI-assisted commercial loan memo drafting.',
          'Purpose/output - generate first-draft narrative sections of a commercial credit memo from approved underwriting inputs; the output is a draft for analyst editing and credit officer approval.',
          'Credit boundary - commercial credit workflow; ECOA / Regulation B and fair-lending considerations still apply. The AI does not recommend approval or denial, assign risk ratings, draft adverse-action reasons, or determine credit terms. Any use that could affect credit availability, terms, or reasons for action requires Compliance review.',
          'Data boundary - borrower financials, spreading output, prior approved memos, and analyst-selected public industry data may be used only inside the approved vendor environment. Full SSNs, account numbers, consumer credit-report data, SAR/AML information, and unapproved customer NPI are prohibited inputs.',
          'Human review - analyst reviews every generated section line by line; credit officer signs off before the memo advances; Compliance reviews any change that could affect adverse-action, fair-lending, or customer-facing explanations.',
          'Thresholds - material error threshold [X%]; customer-impacting error threshold [any occurrence]; pause trigger [vendor model change, data exposure, or two consecutive months above threshold]; restart approval [owner + Compliance + Risk].',
        ],
      },
      {
        heading: 'What good looks like and next step',
        intro:
          'A credible SOP is not a policy essay. It is a control record that shows the workflow is bounded, reviewed, monitored, and shut off when needed.',
        items: [
          'What good looks like - a reader can tell what the AI does, what it cannot do, who reviews every output, which data is allowed, which evidence is retained, and what shuts it off.',
          'Common mistake - using "approved for AI" language without a specific workflow, owner, data class, or pause threshold.',
          'Common mistake - copying clause language without tailoring it to the bank\'s tool stack, retention schedule, approval workflow, and risk appetite.',
          'Next step: run a 45-minute AI Workflow SOP Build Session for one live workflow. Leave with the filled front page, data boundary, reviewer standard, vendor evidence list, monitoring thresholds, and first inventory row.',
        ],
      },
    ],
  },
  {
    ...templateBase('board-briefing-checklist'),
    sourcedFrom: [
      'GAO 25-107197 - federal financial regulators primarily oversee AI through existing laws, guidance, and risk-based examinations',
      'SR 26-2 and OCC Bulletin 2026-13 - revised model-risk guidance, scope limitations, and risk-based principles where applicable',
      'Interagency Guidance on Third-Party Relationships: Risk Management (FRB / FDIC / OCC, June 2023)',
      'ECOA / Regulation B and CFPB adverse-action guidance for AI or complex credit models',
      'AIEOG AI Lexicon and Financial Services AI Risk Management Framework - US Treasury / FBIIC / FSSCC (Feb 2026)',
    ],
    sections: [
      {
        heading: 'The board’s job, in one sentence',
        intro:
          'The board does not need an AI tutorial. It needs to approve or endorse the risk envelope, confirm the data line, assign accountable oversight, authorize management to run one controlled pilot where appropriate, and receive evidence next quarter. Run the briefing as four decisions, not a status update.',
      },
      {
        heading: 'Before the briefing: four facts',
        intro:
          'Ground the room before asking for decisions. Put these four facts on one slide or in the first paragraph of the memo.',
        items: [
          '[ ] Readiness baseline - "Our AI readiness score is [X/48]; the biggest gap is [governance / data handling / vendor oversight]." If no score exists, take the 10-minute AI Readiness Scorecard before the meeting and use it as the baseline.',
          '[ ] Peer context - "Industry surveys suggest many organizations are still formalizing AI governance; this briefing moves us from informal exploration to documented oversight." Use only size-segmented statistics if you can cite the exact source in the board packet.',
          '[ ] Regulatory and control lenses - current model-risk guidance where AI informs quantitative or customer-impacting decisions; Interagency Third-Party Risk Management for AI vendors; GLBA/customer-information safeguards for data handling; ECOA / Regulation B for credit and adverse-action use cases; BSA/AML and SAR confidentiality for financial-crime workflows; Treasury/FSSCC AI terminology and risk-management resources.',
          '[ ] Already approved - what the board has already signed that touches AI: tech budget, vendor list, risk-appetite statement, information-security program, model-risk framework, or digital strategy. Build on the record; do not reopen it.',
        ],
      },
      {
        heading: 'During the briefing: four motions',
        intro:
          'Bring motions with a recommended position, not open questions. The defaults below establish a conservative starting envelope; adapt them to the institution’s charter, authority matrix, risk appetite, and vendor stack.',
        items: [
          '[ ] Scope motion - approve AI for internal drafting, research, summarization, and workflow support inside approved tools; keep customer-facing, credit, fraud, BSA/AML, sanctions, regulatory reporting, and adverse-action use cases out of scope pending dedicated review.',
          '[ ] Data-line motion - "No customer NPI, account data, examination-sensitive information, SAR/AML information, privileged material, or security-control data may be entered into public AI tools. Confidential institution data may be used only in approved enterprise AI tools, for approved use cases, under contract terms covering data use, model training, retention/deletion, access controls, logging, subcontractors, breach notice, audit rights, and ongoing monitoring."',
          '[ ] Ownership motion - designate one accountable executive to own the AI use-case inventory, exceptions log, policy review cycle, and board reporting cadence. A committee can govern, but a named person owns the record.',
          '[ ] Controlled-pilot motion - authorize management to run one controlled pilot within delegated authority, or approve funding/authorization where board approval is required. One department, one use case, one success metric, named reviewer, and next-quarter evidence.',
        ],
      },
      {
        heading: 'Copy-paste: the one-page board memo',
        intro:
          'Drop this into your board packet and fill the brackets. Six lines is enough for most community-institution boards.',
        steps: [
          'Position: "[Institution] is adopting AI deliberately. Today we use it for [internal drafting / research]; we do not use it for [credit decisions / customer messaging]."',
          'Decision requested: approve or endorse the four motions above - scope, data line, ownership, and controlled pilot.',
          'Risk posture: “All AI output is draft work; a named human reviews anything that reaches a customer, examiner, or regulated process (human-in-the-loop).”',
          'Credit control: "AI will not be used to make, explain, or rubber-stamp credit or adverse-action decisions unless Compliance confirms the reasons are specific, accurate, and traceable to factors actually considered."',
          'Oversight: "[Owner] maintains the AI use-case inventory and reports quarterly - tools in use, incidents, training completion, vendor status, and progress against our readiness baseline."',
          'The ask: a motion to adopt or update the AI Use Policy, approve the data line, and authorize the controlled pilot within the approved risk envelope.',
        ],
      },
      {
        heading: 'After the briefing: four evidence items',
        intro: 'Tell the board now what you will show them next time, so oversight is a habit, not a fire drill.',
        items: [
          '[ ] AI use-case inventory - what we run, who owns each use case, its risk tier, tool/vendor, data class, reviewer, approval date, and next review date.',
          '[ ] Incident and exception log - anything flagged since the last briefing, including attempted public-tool use with restricted data; "none" is still an evidence point if the monitoring process exists.',
          '[ ] Exam-readiness packet - current AI policy, inventory, data-line guidance, vendor reviews, training records, model-risk or human-review evidence where applicable, and board reporting trail.',
          '[ ] Scorecard progress - readiness baseline, what moved, what did not, overdue actions, and the next quarter’s control priorities.',
        ],
      },
      {
        heading: 'What good looks like — and the three mistakes to avoid',
        intro: 'A strong AI board decision is specific. Watch for these failure patterns:',
        items: [
          'Don’t approve “explore AI” with no scope — that is the decision examiners read as “no governance.”',
          'Don’t leave the owner as a committee — name a person, with quarterly reporting.',
          'Don’t skip the data line — staff pasting customer data into public tools is the highest-risk gap; the board should prohibit it in writing.',
          'Don’t present model-risk guidance as a blanket answer for generative AI. Map generative AI governance to data controls, third-party oversight, human review, risk appetite, and use-case-specific model-risk principles where applicable.',
        ],
      },
      {
        heading: 'Next step: AI Board Briefing Prep Session',
        intro:
          'Use this checklist to prepare a 30-minute board-ready AI rollout memo, define the AI data line, choose one controlled pilot, and set the evidence package for next quarter.',
        items: [
          'Before the session: complete the AI Readiness Scorecard or bring the current readiness baseline.',
          'During the session: draft the board memo, select the pilot, and confirm the owner, reviewer, data boundary, and reporting cadence.',
          'After the session: package the board memo, four motions, pilot charter, AI use-case inventory row, and next-quarter evidence list.',
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
