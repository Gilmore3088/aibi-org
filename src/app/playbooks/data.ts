/* Role-playbook content for /playbooks/[role].
 *
 * Each role shares the same structural shape; the per-role narrative
 * lives here so the page template stays a single file. Source of truth:
 * this module plus the shared /playbooks/[role] page template.
 *
 * The deeper per-role differences in the original sketches (scenario
 * variations, training-path nuances, evidence sets) can be expanded in
 * follow-up commits — this first pass captures the playbook IA and
 * top-level role-specific framing. The current role set covers all nine
 * free-assessment role paths.
 */

import type { FreeRole } from '@content/assessments/v3/roles';

export type RoleSlug =
  | 'compliance'
  | 'retail'
  | 'marketing'
  | 'lending'
  | 'bsa-aml'
  | 'infosec'
  | 'executive'
  | 'operations'
  | 'training-hr';

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

// Free-funnel role → best-match playbook. Every free role now resolves to a
// dedicated playbook (no more collapsing marketing/operations/etc. into
// retail). 'other' falls back to retail as the broadest frontline read.
// Used by the v3 results view to flag the "Best match" card.
export const FREE_ROLE_TO_PLAYBOOK: Record<FreeRole, RoleSlug> = {
  executive: 'executive',
  'compliance-risk': 'compliance',
  operations: 'operations',
  lending: 'lending',
  'retail-branch': 'retail',
  marketing: 'marketing',
  'it-infosec': 'infosec',
  'training-hr': 'training-hr',
  other: 'retail',
};

export const PLAYBOOK_INDEX: { slug: RoleSlug; title: string; desc: string }[] = [
  { slug: 'compliance', title: 'Compliance', desc: 'Procedure cleanup, audit prep, exam-ready summaries.' },
  { slug: 'retail', title: 'Branch / Retail', desc: 'Coaching scripts, service recovery, frontline reference cards.' },
  { slug: 'marketing', title: 'Marketing', desc: 'Campaign drafts, disclosure flags, brand-safe variations.' },
  { slug: 'lending', title: 'Lending', desc: 'Adverse-action tuner, denial summaries, fair-lending checks.' },
  { slug: 'bsa-aml', title: 'BSA / AML', desc: 'SAR scaffolds, alert patterns, CDD baselines, and evidence-ready oversight.' },
  { slug: 'infosec', title: 'IT / InfoSec', desc: 'Data classification matrix, allowed-tools verdicts, NPI rules.' },
  { slug: 'executive', title: 'Executive / Leadership', desc: 'Adoption thesis, governance guardrails, ROI you can report to the board.' },
  { slug: 'operations', title: 'Operations', desc: 'Turn ad hoc AI use into documented, repeatable workflows.' },
  { slug: 'training-hr', title: 'Training / HR', desc: 'Role-specific enablement, safe-use curriculum, capability tracking.' },
];

export const PLAYBOOKS: Record<RoleSlug, PlaybookData> = {
  compliance: {
    slug: 'compliance',
    eyebrow: 'Compliance Officer Playbook',
    title: 'Use AI without creating invisible risk.',
    lede: 'Evaluate use cases, document workflows, and review AI outputs before business teams scale them.',
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
      { title: 'Document an AI-assisted workflow', desc: 'Turns informal AI use into a reviewable operating procedure.', artifact: 'Review-ready workflow SOP', risk: 'med' },
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
    lede: 'Coaching scripts, service recovery flows, and one-page references your frontline can use.',
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
    lede: 'Draft campaigns faster with disclosure flags surfaced and a review path that closes.',
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
    lede: 'Write clearer letters, run fair-lending pre-checks, and document decisions for review.',
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
      { title: 'Document a loan exception', desc: 'Write the exception rationale in a standard format risk teams can inspect.', artifact: 'Exception memo', risk: 'med' },
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
    title: 'Run safer BSA/AML AI plays with evidence-ready review.',
    lede: 'Use controlled AI workflows for narrative scaffolds, alert-pattern summaries, CDD baselines, synthetic training, and procedure cleanup without exposing restricted data.',
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
      { title: 'Draft a SAR narrative scaffold', desc: 'Organize synthetic or approved redacted facts into a human-reviewed who, what, when, where, why, and how structure.', artifact: 'SAR narrative scaffold', risk: 'high' },
      { title: 'Triage alert patterns', desc: 'Summarize recurring alert rationales for reviewer analysis without changing scenarios, thresholds, suppressions, or dispositions.', artifact: 'Alert pattern notes', risk: 'med' },
      { title: 'Build CDD baseline libraries', desc: 'Document segment-level expectations for analyst consistency without setting or changing customer-specific risk ratings.', artifact: 'CDD baseline library', risk: 'med' },
      { title: 'Create synthetic analyst training', desc: 'Turn public typology patterns into fictional practice scenarios with answer keys and reviewer notes.', artifact: 'Synthetic training sheet', risk: 'low' },
    ],
    opHeading: 'A documented rhythm that reviewers can follow.',
    ops: [
      { step: '01', title: 'Boundary', desc: 'Confirm the tool is approved and classify whether the workflow touches public, internal, customer, or SAR-restricted information.', artifact: 'Data-boundary note' },
      { step: '02', title: 'Sanitize', desc: 'Use synthetic, public, aggregate, or approved redacted inputs unless BSA, Compliance, Legal, and InfoSec approve the enterprise AI environment and use case.', artifact: 'Approved input list' },
      { step: '03', title: 'Prepare', desc: 'Let AI draft summaries, scaffolds, checklists, training scenarios, or procedure language for human review.', artifact: 'Draft artifact' },
      { step: '04', title: 'Review', desc: 'The analyst or BSA officer verifies facts, makes decisions, records changes, and saves the evidence packet.', artifact: 'Reviewed output with evidence' },
    ],
    checklist: [
      'No SAR, SAR draft, SAR-supporting fact, investigation note, customer transaction detail, alert detail, or SAR-existence information in public AI tools',
      'Approved enterprise tool status confirmed before any restricted workflow',
      'Narrative scaffold answers who, what, when, where, why, and how',
      'CDD baseline content stays segment-level and does not change customer-specific risk ratings',
      'Alert tuning, threshold, suppression, and disposition changes stay in the approved BSA/AML system-change process',
      'Prompt, output, reviewer, final version, and retention location are saved',
    ],
    assets: [
      { name: 'The BSA/AML SAR Narrative Scaffold', type: 'Template', status: 'Ready' },
      { name: 'Alert Triage Worksheet', type: 'Worksheet', status: 'Ready' },
      { name: 'CDD Baseline Library Entry', type: 'Template', status: 'Ready' },
      { name: 'Synthetic Scenario Trainer Sheet', type: 'Worksheet', status: 'Ready' },
      { name: 'Approved Tool Checklist', type: 'Reference', status: 'Ready' },
    ],
    cta: {
      heading: 'AI prepares. Humans decide. Evidence proves.',
      body: 'Start with one approved play, one data boundary, one reviewer, and one saved evidence packet.',
    },
  },

  infosec: {
    slug: 'infosec',
    eyebrow: 'IT / InfoSec Playbook',
    title: 'Decide which tools, which data, and which people — defensibly.',
    lede: 'Classify data, vet tools, document the verdict, and keep the NPI boundary visible.',
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

  executive: {
    slug: 'executive',
    eyebrow: 'Executive / Leadership Playbook',
    title: 'Set the direction. Govern the adoption. Report the return.',
    lede: 'Set the AI direction, approve the guardrails, and report adoption with evidence.',
    snapTitle: 'Executive AI Direction Map',
    snapQuick: [
      { label: 'Primary Goal', value: 'Governed ROI' },
      { label: 'Core Artifact', value: 'Adoption thesis' },
      { label: 'Risk Focus', value: 'Strategy + oversight' },
    ],
    snapMaturity: [
      { name: 'Strategic clarity', pct: 66 },
      { name: 'Governance posture', pct: 54 },
      { name: 'Measurement discipline', pct: 44 },
      { name: 'Leadership visibility', pct: 72 },
    ],
    snapPath: 'Maturity Assessment → Adoption Thesis → Governance Guardrails → Quarterly Review',
    usesHeading: 'Where leadership can use AiBI immediately.',
    uses: [
      { title: 'Write a one-page adoption thesis', desc: 'State where AI earns its keep this year, who owns it, and what "good" looks like.', artifact: 'AI adoption thesis', risk: 'low' },
      { title: 'Set the guardrails', desc: 'Approve the data-safety, review, and approved-tool rules before staff improvise their own.', artifact: 'AI use guardrails', risk: 'high' },
      { title: 'Brief the board', desc: 'Turn pilot results into a plain-English board update with risk posture and next decisions.', artifact: 'Board AI briefing', risk: 'med' },
      { title: 'Pressure-test a vendor pitch', desc: 'Score an AI vendor claim against your data, controls, and exit risk before signing.', artifact: 'Vendor evaluation notes', risk: 'med' },
    ],
    opHeading: 'From scattered pilots to a governed program.',
    ops: [
      { step: '01', title: 'Frame', desc: 'Name the one or two outcomes AI should move this year and the single accountable owner.', artifact: 'Adoption thesis' },
      { step: '02', title: 'Guardrail', desc: 'Approve the data-safety tiers, the human-review rule, and the approved-tool list as policy.', artifact: 'Signed guardrails' },
      { step: '03', title: 'Measure', desc: 'Pick two metrics — time saved and correction rate — and require them on every pilot.', artifact: 'Pilot scorecard' },
      { step: '04', title: 'Review', desc: 'Run a quarterly review: what scaled, what stopped, where the risk now sits.', artifact: 'Quarterly AI review' },
    ],
    checklist: [
      'One accountable owner named for AI adoption',
      'Data-safety and human-review rules approved as policy',
      'Approved-tool list published to all staff',
      'Every pilot reports time saved and correction rate',
      'Board has seen the current risk posture',
      'A decision to scale or stop is made on evidence, not vibes',
    ],
    assets: [
      { name: 'AI Adoption Thesis Template', type: 'Template', status: 'Ready' },
      { name: 'AI Use Guardrails One-Pager', type: 'Template', status: 'Ready' },
      { name: 'Board AI Briefing Template', type: 'Template', status: 'Ready' },
      { name: 'Pilot Scorecard', type: 'Worksheet', status: 'Ready' },
      { name: 'Vendor Evaluation Reference Card', type: 'Reference', status: 'Draft' },
    ],
    cta: {
      heading: 'Lead the adoption instead of cleaning up after it.',
      body: 'The institutions that win with AI are not the ones that move fastest — they are the ones whose leadership set the direction and the guardrails before the staff did it for them.',
    },
  },

  operations: {
    slug: 'operations',
    eyebrow: 'Operations Playbook',
    title: 'Turn ad hoc AI use into workflows a colleague could run.',
    lede: 'Turn useful AI shortcuts into documented workflows a colleague can run.',
    snapTitle: 'Operations Enablement Map',
    snapQuick: [
      { label: 'Primary Goal', value: 'Repeatable workflows' },
      { label: 'Core Artifact', value: 'Workflow SOP' },
      { label: 'Risk Focus', value: 'Consistency + review' },
    ],
    snapMaturity: [
      { name: 'Workflow documentation', pct: 50 },
      { name: 'Handoff readiness', pct: 46 },
      { name: 'Review discipline', pct: 62 },
      { name: 'Measurement habit', pct: 48 },
    ],
    snapPath: 'Free Assessment → Foundation Course → Workflow SOP → Sandbox Practice',
    usesHeading: 'Where operations can use AiBI immediately.',
    uses: [
      { title: 'Document a recurring task', desc: 'Capture the input → AI draft → review → output steps for a task your team repeats weekly.', artifact: 'Workflow SOP', risk: 'med' },
      { title: 'Build a reusable working brief', desc: 'Turn a one-off prompt into a fill-in-the-blank template the whole team can run.', artifact: 'Reusable AI brief', risk: 'low' },
      { title: 'Define the review step', desc: 'Make explicit who checks the AI output, against what, before it is used.', artifact: 'Review checkpoint', risk: 'med' },
      { title: 'Measure the time saved', desc: 'Baseline the manual version, then track draft time and correction rate on the AI version.', artifact: 'Time-saved log', risk: 'low' },
    ],
    opHeading: 'A rhythm that survives turnover.',
    ops: [
      { step: '01', title: 'Map', desc: 'Pick one recurring, low-risk task and write down how it actually gets done today.', artifact: 'Current-state map' },
      { step: '02', title: 'Draft', desc: 'Build the AI step in the sandbox with a reusable brief and a named review checkpoint.', artifact: 'Workflow SOP draft' },
      { step: '03', title: 'Test', desc: 'Run it on real work for a week. Track draft time, correction rate, and where it breaks.', artifact: 'Test log' },
      { step: '04', title: 'Hand off', desc: 'Give the SOP to a colleague cold. If they can run it unaided, it is done. Save it to the Toolbox.', artifact: 'Handoff-ready SOP' },
    ],
    checklist: [
      'The task is internal and low-risk to start',
      'No real customer data in the AI step',
      'A named human review checkpoint exists',
      'The SOP names inputs, the AI step, the review, and the output',
      'A colleague could run it without you in the room',
      'Time saved and correction rate are tracked',
    ],
    assets: [
      { name: 'Workflow SOP Template', type: 'Template', status: 'Ready' },
      { name: 'Reusable AI Working Brief', type: 'Template', status: 'Ready' },
      { name: 'Review Checkpoint Worksheet', type: 'Worksheet', status: 'Ready' },
      { name: 'Time-Saved Tracking Sheet', type: 'Worksheet', status: 'Ready' },
      { name: 'Handoff Readiness Card', type: 'Reference', status: 'Draft' },
    ],
    cta: {
      heading: 'Make the shortcut a standard.',
      body: 'The AI tricks your best people use in their heads are worth nothing until they are written down. This playbook turns them into workflows the whole team can run.',
    },
  },

  'training-hr': {
    slug: 'training-hr',
    eyebrow: 'Training / HR Playbook',
    title: 'Build the capability adoption actually depends on.',
    lede: 'Replace generic AI awareness with role-specific practice and visible readiness tracking.',
    snapTitle: 'Training / HR Enablement Map',
    snapQuick: [
      { label: 'Primary Goal', value: 'Staff readiness' },
      { label: 'Core Artifact', value: 'Role training path' },
      { label: 'Risk Focus', value: 'Safe-use literacy' },
    ],
    snapMaturity: [
      { name: 'Role-specific guidance', pct: 44 },
      { name: 'Safe-use literacy', pct: 58 },
      { name: 'Practical examples', pct: 52 },
      { name: 'Capability tracking', pct: 40 },
    ],
    snapPath: 'Maturity Assessment → Foundation Course → Role Training Path → Capability Tracker',
    usesHeading: 'Where training and HR can use AiBI immediately.',
    uses: [
      { title: 'Build a role-specific training path', desc: 'Turn generic AI awareness into the three things a given role needs to do safely.', artifact: 'Role training path', risk: 'low' },
      { title: 'Write a safe-use one-pager', desc: 'Give every new hire the green/yellow/red data rules and the approved-tool list on one sheet.', artifact: 'Safe-use reference', risk: 'med' },
      { title: 'Create practice scenarios', desc: 'Draft realistic, fictional scenarios staff can rehearse in the sandbox — never real customer stories.', artifact: 'Scenario pack', risk: 'low' },
      { title: 'Track who is ready', desc: 'Define what "trained" means per role and record who has cleared the bar.', artifact: 'Capability tracker', risk: 'low' },
    ],
    opHeading: 'From one-time training to sustained capability.',
    ops: [
      { step: '01', title: 'Scope', desc: 'For one role, name the two or three AI tasks they should be able to do safely.', artifact: 'Role capability spec' },
      { step: '02', title: 'Build', desc: 'Assemble the path: the rules, the examples, and a sandbox exercise tied to real role work.', artifact: 'Role training path' },
      { step: '03', title: 'Run', desc: 'Deliver it to one cohort. Capture where people get stuck and what questions recur.', artifact: 'Cohort feedback log' },
      { step: '04', title: 'Track', desc: 'Record who has cleared the bar, refresh on a cadence, and feed gaps back into the path.', artifact: 'Capability tracker' },
    ],
    checklist: [
      'Training is tied to specific role tasks, not general awareness',
      'Green/yellow/red data rules are covered explicitly',
      'Approved-tool list is part of every path',
      'Practice uses fictional scenarios, never real customer data',
      '"Trained" is defined and measurable per role',
      'There is a named person to ask when staff get stuck',
    ],
    assets: [
      { name: 'Role Training Path Template', type: 'Template', status: 'Ready' },
      { name: 'Safe-Use One-Pager', type: 'Template', status: 'Ready' },
      { name: 'Practice Scenario Pack', type: 'Template', status: 'Ready' },
      { name: 'Capability Tracker', type: 'Worksheet', status: 'Ready' },
      { name: 'Data Rules Reference Card', type: 'Reference', status: 'Draft' },
    ],
    cta: {
      heading: 'Make readiness something you can see, not assume.',
      body: 'Adoption does not fail on tools — it fails on people who were never shown how to use them safely. This playbook turns AI training into role-specific capability you can actually track.',
    },
  },
};
