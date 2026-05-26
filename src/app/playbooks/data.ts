/* Role-playbook content for /playbooks/[role].
 *
 * Each role shares the same structural shape; the per-role narrative
 * lives here so the page template stays a single file. Source of truth:
 * public/sketches/playbook-{compliance,retail,marketing,lending,bsa-aml,infosec}.html.
 *
 * The deeper per-role differences in the original sketches (scenario
 * variations, training-path nuances, evidence sets) can be expanded in
 * follow-up commits — this first pass captures the playbook IA and
 * top-level role-specific framing.
 */

export type RoleSlug =
  | 'compliance'
  | 'retail'
  | 'marketing'
  | 'lending'
  | 'bsa-aml'
  | 'infosec';

export interface PlaybookData {
  slug: RoleSlug;
  /** Eyebrow chip text and chip icon name. */
  eyebrow: string;
  /** Main h1. */
  title: string;
  /** Subheading lede paragraph. */
  lede: string;
  /** Hero snapshot card title under the kicker. */
  snapTitle: string;
  /** Three quick-stat tiles on the snapshot card. */
  snapQuick: { label: string; value: string }[];
  /** 4 dimension scores rendered as bars on the snapshot card. */
  snapMaturity: { name: string; pct: number }[];
  /** Recommended path string under the snapshot. */
  snapPath: string;
  /** Section 2 heading (Use Cases). */
  usesHeading: string;
  /** Per-row use case data. */
  uses: { title: string; desc: string; artifact: string; risk: 'high' | 'med' | 'low' }[];
  /** Operating model section heading. */
  opHeading: string;
  /** 4-step operating model. */
  ops: { step: string; title: string; desc: string; artifact: string }[];
  /** Six items for the review checklist. */
  checklist: string[];
  /** Toolbox asset list. */
  assets: { name: string; type: string; status: 'Ready' | 'Draft' }[];
  /** CTA band text. */
  cta: { heading: string; body: string };
}

export const PLAYBOOK_INDEX: { slug: RoleSlug; title: string; desc: string }[] = [
  { slug: 'compliance', title: 'Compliance', desc: 'Procedure cleanup, audit prep, exam-ready summaries.' },
  { slug: 'retail', title: 'Branch / Retail', desc: 'Coaching scripts, service recovery, frontline reference cards.' },
  { slug: 'marketing', title: 'Marketing', desc: 'Campaign drafts, disclosure flags, brand-safe variations.' },
  { slug: 'lending', title: 'Lending', desc: 'Adverse-action tuner, denial summaries, fair-lending checks.' },
  { slug: 'bsa-aml', title: 'BSA / AML', desc: 'SAR decision tree, structuring patterns, CDD baseline drift.' },
  { slug: 'infosec', title: 'IT / InfoSec', desc: 'Data classification matrix, allowed-tools verdicts, NPI rules.' },
];

export const PLAYBOOKS: Record<RoleSlug, PlaybookData> = {
  compliance: {
    slug: 'compliance',
    eyebrow: 'Compliance Officer Playbook',
    title: 'Use AI without creating invisible risk.',
    lede: 'A role-specific playbook for compliance teams to evaluate use cases, document workflows, review AI outputs, and help business teams adopt AI safely.',
    snapTitle: 'Compliance AI Enablement Map',
    snapQuick: [
      { label: 'Primary Goal', value: 'Safe adoption' },
      { label: 'Core Artifact', value: 'Workflow SOP' },
      { label: 'Risk Focus', value: 'Data + review' },
    ],
    snapMaturity: [
      { name: 'Governance clarity', pct: 72 },
      { name: 'Workflow documentation', pct: 46 },
      { name: 'Data handling judgment', pct: 58 },
      { name: 'Human review discipline', pct: 64 },
    ],
    snapPath: 'Maturity Assessment → Foundation Course → Workflow SOP → Sandbox Review',
    usesHeading: 'Where compliance can use AiBI immediately.',
    uses: [
      { title: 'Document an AI-assisted workflow', desc: 'Turns informal AI use into a reviewable operating procedure.', artifact: 'Examiner-ready workflow SOP', risk: 'med' },
      { title: 'Review a proposed AI use case', desc: 'Creates a consistent screen before teams adopt AI for real work.', artifact: 'AI use-case risk checklist', risk: 'high' },
      { title: 'Summarize regulatory guidance', desc: 'Helps staff understand guidance faster while preserving human review.', artifact: 'Plain-English guidance brief', risk: 'med' },
      { title: 'Create a human review checklist', desc: 'Makes accuracy, data handling, and approval expectations explicit.', artifact: 'Output review checklist', risk: 'low' },
    ],
    opHeading: 'Move from ad hoc AI use to governed adoption.',
    ops: [
      { step: '01', title: 'Intake', desc: 'Capture the business purpose, tool, user role, and data involved before anyone operationalizes the idea.', artifact: 'Use-case intake form' },
      { step: '02', title: 'Risk Triage', desc: 'Classify the use case by customer impact, data sensitivity, automation level, and review needs.', artifact: 'Risk tier + review path' },
      { step: '03', title: 'Controlled Practice', desc: 'Test the workflow in the sandbox using fictional or sanitized data before using it for real work.', artifact: 'Sandbox output + notes' },
      { step: '04', title: 'Approval & Evidence', desc: 'Document the final workflow, approval owner, retention rule, and human review expectations.', artifact: 'Approved workflow packet' },
    ],
    checklist: [
      'No customer data entered into public AI tools',
      'Output reviewed by accountable human owner',
      'Use case mapped to business purpose',
      'Retention rule defined before use',
      'Escalation path documented',
      'Final output labeled as reviewed or draft',
    ],
    assets: [
      { name: 'AI Use-Case Intake Form', type: 'Template', status: 'Ready' },
      { name: 'Workflow SOP Template', type: 'Template', status: 'Ready' },
      { name: 'Human Review Checklist', type: 'Checklist', status: 'Ready' },
      { name: 'Data Handling Reference Card', type: 'Reference', status: 'Ready' },
      { name: 'Model Output Risk Labels', type: 'Reference', status: 'Draft' },
    ],
    cta: {
      heading: 'Make compliance the partner that helps AI adoption happen.',
      body: 'Stop being the team that says "wait." Become the team that says "here is the workflow we already documented for that."',
    },
  },

  retail: {
    slug: 'retail',
    eyebrow: 'Branch / Retail Playbook',
    title: 'Coach your frontline. Recover from hiccups. Move members.',
    lede: 'Practical AI use for branch managers and frontline teams: coaching scripts, service recovery flows, and one-page references that actually get used.',
    snapTitle: 'Retail Enablement Map',
    snapQuick: [
      { label: 'Primary Goal', value: 'Faster enablement' },
      { label: 'Core Artifact', value: 'Coaching kit' },
      { label: 'Risk Focus', value: 'Tone + member impact' },
    ],
    snapMaturity: [
      { name: 'Tool fluency', pct: 60 },
      { name: 'Service recovery', pct: 52 },
      { name: 'Coaching discipline', pct: 68 },
      { name: 'Member-impact awareness', pct: 70 },
    ],
    snapPath: 'Free Assessment → Foundation Course → Branch Playbook → Sandbox Practice',
    usesHeading: 'Where retail teams can use AiBI immediately.',
    uses: [
      { title: 'Draft a coaching script', desc: 'Turn a scenario into a clear conversation guide with escalation triggers.', artifact: 'Branch coaching guide', risk: 'low' },
      { title: 'Recover a member service issue', desc: 'Generate a service recovery message that owns the issue and clarifies next steps.', artifact: 'Service recovery template', risk: 'med' },
      { title: 'Write a frontline reference card', desc: 'Condense a dense procedure into a one-page job aid.', artifact: 'Procedure cleanup card', risk: 'low' },
      { title: 'Prep for a difficult conversation', desc: 'Practice talking points before a member call without using customer specifics.', artifact: 'Conversation rehearsal notes', risk: 'med' },
    ],
    opHeading: 'A repeatable rhythm for branch managers.',
    ops: [
      { step: '01', title: 'Spot', desc: 'Identify a recurring scenario that takes too long, drifts off-script, or misses a recovery step.', artifact: 'Scenario log' },
      { step: '02', title: 'Sandbox', desc: 'Practice in the sandbox using fictional details — never a real member story.', artifact: 'Drafted coaching artifact' },
      { step: '03', title: 'Coach', desc: 'Run the artifact with one teller, refine it, then roll it out to the team.', artifact: 'Branch coaching session' },
      { step: '04', title: 'Capture', desc: 'Save the working version to the Toolbox so the next manager does not start from scratch.', artifact: 'Saved coaching prompt' },
    ],
    checklist: [
      'No member-specific data in any prompt',
      'Coaching language passes the "would I read this aloud?" test',
      'Escalation path is clear and named',
      'Reference card fits on a single sheet',
      'Tone matches the member experience standard',
      'Practiced once in the sandbox before live use',
    ],
    assets: [
      { name: 'Branch Coaching Kit Template', type: 'Template', status: 'Ready' },
      { name: 'Service Recovery Message Template', type: 'Template', status: 'Ready' },
      { name: 'One-Page Procedure Cleanup', type: 'Template', status: 'Ready' },
      { name: 'Difficult Conversation Prep Sheet', type: 'Worksheet', status: 'Ready' },
      { name: 'Member Tone Reference Card', type: 'Reference', status: 'Draft' },
    ],
    cta: {
      heading: 'Move members. Coach the team. Keep it human.',
      body: 'AI saves your frontline two hours a week, but only if the artifacts are practical and the tone is right. This playbook makes both happen.',
    },
  },

  marketing: {
    slug: 'marketing',
    eyebrow: 'Marketing Playbook',
    title: 'Ship faster without skipping disclosure or review.',
    lede: 'AI-assisted marketing for community banks and credit unions — campaign drafts with disclosure flags surfaced, brand variations, and a review path that actually closes.',
    snapTitle: 'Marketing Enablement Map',
    snapQuick: [
      { label: 'Primary Goal', value: 'Faster review' },
      { label: 'Core Artifact', value: 'Campaign workspace' },
      { label: 'Risk Focus', value: 'Disclosures + claims' },
    ],
    snapMaturity: [
      { name: 'Compliance review discipline', pct: 56 },
      { name: 'Brand tone consistency', pct: 70 },
      { name: 'Disclosure literacy', pct: 48 },
      { name: 'Workflow handoff', pct: 62 },
    ],
    snapPath: 'Maturity Assessment → Sandbox → Campaign Review Workflow → Toolbox',
    usesHeading: 'Where marketing teams can use AiBI immediately.',
    uses: [
      { title: 'Draft three campaign variations', desc: 'Get three on-brand variations with disclosure prompts flagged.', artifact: 'Campaign variation set', risk: 'med' },
      { title: 'Run a pre-review disclosure check', desc: 'Catch missing or weak disclosures before the compliance round.', artifact: 'Disclosure review checklist', risk: 'high' },
      { title: 'Translate product specs to member language', desc: 'Turn dense product specs into plain copy without losing precision.', artifact: 'Plain-language product brief', risk: 'low' },
      { title: 'Generate visual brief from copy', desc: 'Hand designers an aligned brief instead of a Slack thread.', artifact: 'Creative brief draft', risk: 'low' },
    ],
    opHeading: 'A review cycle that actually closes.',
    ops: [
      { step: '01', title: 'Frame', desc: 'Define audience, channel, offer, and required disclosures up-front before writing.', artifact: 'Campaign brief' },
      { step: '02', title: 'Draft', desc: 'Generate variations in the sandbox with disclosure flags surfaced inline.', artifact: 'Draft set with flags' },
      { step: '03', title: 'Review', desc: 'Send the flagged draft to compliance with the disclosure rationale attached.', artifact: 'Review packet' },
      { step: '04', title: 'Ship', desc: 'Approved copy moves to launch with the review log saved beside it.', artifact: 'Approved campaign + log' },
    ],
    checklist: [
      'Every claim has a verifiable source',
      'Disclosures match the offer type',
      'No urgency or scarcity language without compliance approval',
      'Brand voice consistent across variations',
      'Channel-specific tone applied (email vs branch vs social)',
      'Reviewer name + date logged on the approved version',
    ],
    assets: [
      { name: 'Campaign Brief Template', type: 'Template', status: 'Ready' },
      { name: 'Disclosure Review Checklist', type: 'Checklist', status: 'Ready' },
      { name: 'Plain-Language Translator Prompt', type: 'Prompt', status: 'Ready' },
      { name: 'Creative Brief Generator', type: 'Tool', status: 'Ready' },
      { name: 'Channel Tone Reference Card', type: 'Reference', status: 'Draft' },
    ],
    cta: {
      heading: 'Cleaner reviews. Faster cycles. No surprises in the audit.',
      body: 'AI does not write your marketing — it removes the rework that keeps your team in review purgatory.',
    },
  },

  lending: {
    slug: 'lending',
    eyebrow: 'Lending Playbook',
    title: 'Defensible decisions, faster.',
    lede: 'Use AI to write better adverse-action letters, run fair-lending pre-checks, and document decline rationales in a way that holds up to review.',
    snapTitle: 'Lending Enablement Map',
    snapQuick: [
      { label: 'Primary Goal', value: 'Defensible decisions' },
      { label: 'Core Artifact', value: 'Decision packet' },
      { label: 'Risk Focus', value: 'ECOA + bias' },
    ],
    snapMaturity: [
      { name: 'Decision documentation', pct: 64 },
      { name: 'Fair-lending awareness', pct: 70 },
      { name: 'Borrower communication', pct: 58 },
      { name: 'Reviewer alignment', pct: 60 },
    ],
    snapPath: 'Maturity Assessment → Foundation Course → Decision Documentation → Sandbox',
    usesHeading: 'Where lending can use AiBI immediately.',
    uses: [
      { title: 'Draft an adverse-action letter', desc: 'Generate an ECOA-aligned decline letter from a decision summary.', artifact: 'Adverse-action draft', risk: 'high' },
      { title: 'Run a fair-lending pre-check', desc: 'Test a decision rationale for protected-class signal language.', artifact: 'Fair-lending review notes', risk: 'high' },
      { title: 'Summarize a stipulation list', desc: 'Turn a long stip list into a clean borrower communication.', artifact: 'Stipulation summary', risk: 'med' },
      { title: 'Document a loan exception', desc: 'Write the exception rationale in the standard format reviewers expect.', artifact: 'Exception memo', risk: 'med' },
    ],
    opHeading: 'A decision rhythm reviewers can defend.',
    ops: [
      { step: '01', title: 'Compile', desc: 'Pull the decision facts: credit, capacity, collateral, conditions, character — and the applicable policy.', artifact: 'Decision summary' },
      { step: '02', title: 'Draft', desc: 'Generate the borrower letter and the file memo in the sandbox using synthetic loan numbers only.', artifact: 'Draft letter + memo' },
      { step: '03', title: 'Review', desc: 'Run the fair-lending pre-check; flag any language that signals protected-class consideration.', artifact: 'Review notes + flag log' },
      { step: '04', title: 'File', desc: 'Send reviewed letter to the borrower; file memo + review log to the loan file.', artifact: 'Loan file evidence pack' },
    ],
    checklist: [
      'No protected-class language in any draft',
      'Specific factual reason cited, not boilerplate',
      'ECOA Reg B template structure preserved',
      'Reviewer signature on the file memo',
      'Borrower-facing language reading-level checked',
      'All references to the borrower verified against the file',
    ],
    assets: [
      { name: 'Adverse-Action Letter Tuner', type: 'Tool', status: 'Ready' },
      { name: 'Fair-Lending Pre-Check Checklist', type: 'Checklist', status: 'Ready' },
      { name: 'Decision Summary Template', type: 'Template', status: 'Ready' },
      { name: 'Exception Memo Template', type: 'Template', status: 'Ready' },
      { name: 'ECOA Reference Card', type: 'Reference', status: 'Draft' },
    ],
    cta: {
      heading: 'Decisions you can defend. Letters borrowers can understand.',
      body: 'AI is most valuable in lending when it makes the file thicker, not thinner — every artifact ships with reviewer evidence baked in.',
    },
  },

  'bsa-aml': {
    slug: 'bsa-aml',
    eyebrow: 'BSA / AML Playbook',
    title: 'Sharpen the SAR. Tighten CDD. Lose the noise.',
    lede: 'Use AI to triage alerts, summarize SAR narratives, and document CDD baselines — without ever putting customer data into a model.',
    snapTitle: 'BSA / AML Enablement Map',
    snapQuick: [
      { label: 'Primary Goal', value: 'Sharper SAR' },
      { label: 'Core Artifact', value: 'SAR narrative' },
      { label: 'Risk Focus', value: 'Customer data' },
    ],
    snapMaturity: [
      { name: 'Narrative quality', pct: 50 },
      { name: 'Pattern recognition', pct: 68 },
      { name: 'Documentation discipline', pct: 60 },
      { name: 'Data boundary discipline', pct: 78 },
    ],
    snapPath: 'Maturity Assessment → Foundation Course → SAR Workflow → Sandbox',
    usesHeading: 'Where BSA / AML can use AiBI immediately.',
    uses: [
      { title: 'Draft a SAR narrative', desc: 'Convert a typology + timeline into the structured narrative the FinCEN reviewer expects.', artifact: 'SAR narrative draft', risk: 'high' },
      { title: 'Triage alerts', desc: 'Run the alert rationale through a structured pattern check to prioritize review.', artifact: 'Alert triage notes', risk: 'med' },
      { title: 'Document CDD baseline drift', desc: 'Compare current CDD against the baseline; flag changes that need an updated profile.', artifact: 'CDD drift report', risk: 'med' },
      { title: 'Summarize a structuring pattern', desc: 'Turn raw transaction notes into a clean pattern description for the case file.', artifact: 'Pattern summary', risk: 'high' },
    ],
    opHeading: 'A documented rhythm that reviewers can follow.',
    ops: [
      { step: '01', title: 'Pattern', desc: 'Identify the typology and the timeline window before any AI involvement.', artifact: 'Pattern brief' },
      { step: '02', title: 'Sanitize', desc: 'Strip identifiers, amounts, account numbers — only typology + dates + relative amounts go to the model.', artifact: 'Sanitized brief' },
      { step: '03', title: 'Draft', desc: 'Generate the narrative in the sandbox. Compare against your team\'s SAR template structure.', artifact: 'Draft narrative' },
      { step: '04', title: 'Review', desc: 'Re-attach customer data manually in the SAR system. Reviewer signs off.', artifact: 'Filed SAR with review log' },
    ],
    checklist: [
      'No real customer or transaction identifiers in any prompt',
      'Typology, dates, and pattern are factually grounded',
      'Narrative answers who, what, where, when, and why',
      'Pattern language matches FinCEN typology vocabulary',
      'Reviewer signature recorded',
      'Filing deadline tracked separately',
    ],
    assets: [
      { name: 'SAR Narrative Template', type: 'Template', status: 'Ready' },
      { name: 'Alert Triage Worksheet', type: 'Worksheet', status: 'Ready' },
      { name: 'CDD Drift Comparison Template', type: 'Template', status: 'Ready' },
      { name: 'Structuring Pattern Reference', type: 'Reference', status: 'Ready' },
      { name: 'Sanitization Pre-Check Card', type: 'Reference', status: 'Draft' },
    ],
    cta: {
      heading: 'Make the SAR sharper. Keep the customer data out of the model.',
      body: 'The fastest narratives are the ones you do not have to rewrite. This playbook is built around that.',
    },
  },

  infosec: {
    slug: 'infosec',
    eyebrow: 'IT / InfoSec Playbook',
    title: 'Decide which tools, which data, and which people — defensibly.',
    lede: 'A playbook for the people who own the tool stack and the NPI boundary. Classify data, vet tools, document the verdict, and help business teams adopt approved AI without bypassing you.',
    snapTitle: 'IT / InfoSec Enablement Map',
    snapQuick: [
      { label: 'Primary Goal', value: 'Defensible verdict' },
      { label: 'Core Artifact', value: 'Tool verdict log' },
      { label: 'Risk Focus', value: 'NPI + access' },
    ],
    snapMaturity: [
      { name: 'Data classification clarity', pct: 56 },
      { name: 'Allowed-tool catalog', pct: 62 },
      { name: 'Shadow-AI visibility', pct: 38 },
      { name: 'Identity + access governance', pct: 70 },
    ],
    snapPath: 'Maturity Assessment → Foundation Course → Data Classification → Sandbox',
    usesHeading: 'Where IT / InfoSec can use AiBI immediately.',
    uses: [
      { title: 'Render a tool verdict', desc: 'Document the data classes, controls, and approval status for a candidate AI tool.', artifact: 'Tool verdict packet', risk: 'high' },
      { title: 'Run a data-classification check', desc: 'Map a workflow to the data classes touched and surface NPI exposure points.', artifact: 'Data class map', risk: 'high' },
      { title: 'Draft a shadow-AI advisory', desc: 'Brief the business on which tools to stop using and what is approved instead.', artifact: 'Shadow-AI advisory', risk: 'med' },
      { title: 'Build an access-review checklist', desc: 'Document who can access an approved AI tool, with what data, under what review.', artifact: 'Access review checklist', risk: 'med' },
    ],
    opHeading: 'A verdict cycle the business will follow.',
    ops: [
      { step: '01', title: 'Intake', desc: 'Capture the request: tool, vendor, data classes, use case, requesting team.', artifact: 'Tool intake form' },
      { step: '02', title: 'Verdict', desc: 'Run the data-class + control + retention checks. Decide approved / restricted / blocked with reasons.', artifact: 'Tool verdict' },
      { step: '03', title: 'Publish', desc: 'Add to the allowed-tools catalog with conditions. Brief the business via the standard advisory format.', artifact: 'Catalog update + advisory' },
      { step: '04', title: 'Monitor', desc: 'Re-review on a cadence. Look for shadow-AI use and adjust the verdict if vendor security posture changes.', artifact: 'Periodic re-review log' },
    ],
    checklist: [
      'Data classes touched are documented',
      'Vendor security posture verified (SOC 2, pen test, breach history)',
      'NPI handling is explicit (no NPI / approved with controls / blocked)',
      'Retention policy in the verdict',
      'Access review cadence set',
      'Advisory drafted in plain language for non-IT readers',
    ],
    assets: [
      { name: 'Tool Verdict Template', type: 'Template', status: 'Ready' },
      { name: 'Data Classification Matrix', type: 'Reference', status: 'Ready' },
      { name: 'Allowed-Tools Catalog Template', type: 'Template', status: 'Ready' },
      { name: 'Shadow-AI Advisory Template', type: 'Template', status: 'Ready' },
      { name: 'NPI Boundary Reference Card', type: 'Reference', status: 'Draft' },
    ],
    cta: {
      heading: 'Be the team the business asks first — not the team they bypass.',
      body: 'Clear verdicts, publishable advisories, and a catalog that actually answers the question. That is the difference between InfoSec as gatekeeper and InfoSec as enabler.',
    },
  },
};
