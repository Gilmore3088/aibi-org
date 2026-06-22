// AiBI In-Depth Diagnostic — v4 Action Packet content
//
// Per-role rich content for the post-email "Action Packet" report
// (replaces the old 14-section diagnostic narrative). Each role gets:
//
//   - thesis       : one brutal-and-useful sentence + paragraph
//   - actionStrip  : 5 named first-moves
//   - artifact     : the headline work product, including sample table rows
//   - timeline     : 30 / 60 / 90 phases with check items
//   - reviewerPacket: 5 documents the user should be able to send a reviewer
//   - playbookPath : best-match + 2 supporting + template recommendation
//
// Lending / Credit is authored fully (used as the design exemplar).
// Every other role falls back to derived defaults that combine the
// role's existing single-string `artifact` + `samplePrompt` + `thirtyDayWin`
// with shared shell copy. As each role gets full content authored, its
// entry here is added and the fallback is bypassed.

import type { Dimension } from './types';
import type { RoleV4 } from './roles';
import { ROLE_V4_META } from './roles';
import { getRoleOutput } from './role-output';

// ── Schema ──────────────────────────────────────────────────────────────────

export interface ActionStripStep {
  readonly title: string;
  readonly desc: string;
}

export interface ArtifactTable {
  readonly columns: readonly string[];
  readonly rows: ReadonlyArray<ReadonlyArray<string>>;
}

export interface PrimaryArtifact {
  readonly name: string;
  readonly intent: string; // one-sentence purpose / boundary
  readonly useBefore: string; // "saving, sharing, or reviewing AI-assisted X"
  readonly table?: ArtifactTable; // optional rendered example
  readonly copyRule: string; // copy-ready boundary sentence
  readonly copyPrompt: string; // the actual prompt the user copies
}

export interface TimelinePhase {
  readonly phase: string; // "Days 1–30"
  readonly heading: string; // "Fix approved access"
  readonly checks: readonly string[];
}

export interface ReviewerPacketItem {
  readonly name: string;
  readonly desc: string;
}

export interface PlaybookCard {
  readonly slug: string; // /playbooks/<slug>
  readonly label: string;
  readonly use: string;
}

export interface PlaybookPath {
  readonly best: PlaybookCard;
  readonly supporting: readonly PlaybookCard[];
  readonly template: { readonly label: string; readonly use: string };
}

export interface ActionPacket {
  readonly thesisHeadline: string;
  readonly thesisBody: string;
  readonly actionStrip: readonly ActionStripStep[];
  readonly primaryArtifact: PrimaryArtifact;
  readonly timeline: readonly TimelinePhase[];
  readonly reviewerPacket: readonly ReviewerPacketItem[];
  readonly playbookPath: PlaybookPath;
}

// ── Best-match playbook per role ────────────────────────────────────────────
// Defined BEFORE packet literals so they can reference it at module-init time.
//
// Valid playbook slugs in /playbooks/data.ts:
//   compliance · retail · marketing · lending · bsa-aml · infosec
//
// Roles without a 1:1 playbook (executive, operations, training-hr, other)
// route to compliance as the safest cross-cutting starting point.
const BEST_PLAYBOOK: Record<RoleV4, PlaybookCard> = {
  executive: {
    slug: 'compliance',
    label: 'Compliance',
    use: 'Review standards and the institutional control framework.',
  },
  'compliance-risk': {
    slug: 'compliance',
    label: 'Compliance',
    use: 'Use-case review, evidence packets, and review checklists.',
  },
  'it-infosec': {
    slug: 'infosec',
    label: 'InfoSec',
    use: 'Approved tool paths, data classes, vendor controls.',
  },
  'retail-branch': {
    slug: 'retail',
    label: 'Retail / Branch',
    use: 'First-draft replies, job aids, and coaching scenarios.',
  },
  'lending-credit': {
    slug: 'lending',
    label: 'Lending / Credit',
    use: 'Adverse-action wording, redacted loan summaries, decision support.',
  },
  'bsa-aml': {
    slug: 'bsa-aml',
    label: 'BSA / AML',
    use: 'Narrative drafting from facts only, with named verification steps.',
  },
  'marketing-product': {
    slug: 'marketing',
    label: 'Marketing',
    use: 'Message variants with compliance-claim flags before publish.',
  },
  operations: {
    slug: 'compliance',
    label: 'Compliance',
    use: 'Document workflows so colleagues can run them without you.',
  },
  'training-hr': {
    slug: 'compliance',
    label: 'Compliance',
    use: 'Role-based rollout plans with named sources and time budgets.',
  },
  other: {
    slug: 'compliance',
    label: 'Compliance',
    use: 'Cross-cutting review checklists and evidence framing.',
  },
};

// ── Lending / Credit — fully authored exemplar ─────────────────────────────

const LENDING_CREDIT: ActionPacket = {
  thesisHeadline: 'Your issue is approved access, not motivation.',
  thesisBody:
    'You have useful AI potential, but Lending and Credit work needs a clearer tool path before AI touches credit-language support. Start by defining which tools are approved, what data is allowed, and how adverse-action language is reviewed.',
  actionStrip: [
    { title: 'Define tool path', desc: 'Name approved AI tools and data classes.' },
    { title: 'Pilot examples', desc: 'Use five redacted adverse-action samples.' },
    { title: 'Use traceability', desc: 'Check that AI adds no new reasons.' },
    { title: 'Save packet', desc: 'Retain reviewer evidence, not messy drafts.' },
    { title: 'Open playbook', desc: 'Follow the Lending / Credit path.' },
  ],
  primaryArtifact: {
    name: 'Principal Reason Traceability Table',
    intent:
      'AI may improve clarity, but it may not create, infer, or add principal reasons for a credit decision.',
    useBefore: 'saving, sharing, or reviewing AI-assisted credit wording',
    table: {
      columns: ['Human reason', 'AI draft', 'Added?', 'Review', 'Notes'],
      rows: [
        [
          'Insufficient income for amount requested',
          'Based on the income information reviewed, the requested loan amount could not be supported.',
          'No',
          'Edit',
          'Verify wording with compliance.',
        ],
        [
          'Delinquent past or present credit obligations',
          'The credit report showed delinquent obligations that affected the decision.',
          'No',
          'Approve',
          'Do not add extra detail.',
        ],
        [
          'Limited credit history',
          'The available credit history was not sufficient to support approval.',
          'No',
          'Edit',
          'Confirm source reason.',
        ],
      ],
    },
    copyRule:
      'AI may improve wording clarity. It may not create the reason, infer a reason, or make the credit decision.',
    copyPrompt: `Using only the human-provided principal reasons below, draft clearer adverse-action language in plain English.

Rules:
- Do not add, infer, or invent reasons.
- Do not make an approval, denial, pricing, or adverse-action decision.
- Preserve the original principal reasons.
- Flag unclear wording with [VERIFY].
- Label the output as draft support only.

Output:
original reason | revised wording | possible added reason | reviewer note`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Fix approved access',
      checks: [
        'Create the Approved AI Tools List for Lending.',
        'Pilot five redacted adverse-action examples.',
        'Use the Principal Reason Traceability Table on each.',
        'Capture reviewer sign-off on every pilot row.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Document one workflow',
      checks: [
        'Convert the pilot into a written Workflow SOP.',
        'Add the workflow to the AI Use-Case Inventory.',
        'Publish a Data Handling Card for Lending inputs.',
        'Have one colleague run the workflow without you.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Compound strongest practice',
      checks: [
        'Turn Vendor Control strength into an AI vendor review template.',
        'Apply it to the top three AI-enabled lending vendors.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Pick the next quarterly anchor (a second workflow or role).',
      ],
    },
  ],
  reviewerPacket: [
    {
      name: 'Approved Tools List',
      desc: 'Named tools, allowed data classes, blocked data, named reviewer.',
    },
    {
      name: 'Data Handling Card',
      desc: 'Redacted, fictional, internal, and prohibited inputs at a glance.',
    },
    {
      name: 'Redacted Samples',
      desc: 'Five examples used in the pilot — proof, not theory.',
    },
    {
      name: 'Principal Reason Traceability Table',
      desc: 'Human reason → AI wording → reviewer decision per row.',
    },
    {
      name: 'Retention Note',
      desc: 'What gets saved, where, and what not to retain.',
    },
  ],
  playbookPath: {
    best: {
      slug: 'lending',
      label: 'Lending / Credit',
      use: 'Adverse-action wording, redacted loan summaries, decision packet support.',
    },
    supporting: [
      {
        slug: 'compliance',
        label: 'Compliance',
        use: 'Review standards, evidence packets, approval checkpoints.',
      },
      {
        slug: 'infosec',
        label: 'InfoSec',
        use: 'Approved tool paths, data classes, blocked inputs.',
      },
    ],
    template: {
      label: 'Workflow SOP',
      use: 'Tool, input, output, reviewer, sign-off, retention.',
    },
  },
};

// ── Per-role overrides registry ─────────────────────────────────────────────

// ── Executive / Leadership ─────────────────────────────────────────────────

const EXECUTIVE: ActionPacket = {
  thesisHeadline: 'Your job is not to use AI. It is to make it safe to use.',
  thesisBody:
    'Your staff are already using AI — the only question is whether you have published the rules. Before you sponsor a single use case, write the one-page Acceptable Use Standard that names what is encouraged, what is off-limits, and who decides. That is leadership work no one else can do for you.',
  actionStrip: [
    { title: 'Publish the standard', desc: 'One page. What is in, what is out, who decides.' },
    { title: 'Name accountable owners', desc: 'AI Compliance, AI Security, AI Capability.' },
    { title: 'Set the review cadence', desc: 'Monthly use-case inventory, quarterly drift check.' },
    { title: 'Fund the artifacts', desc: 'Tools list, training plan, vendor template.' },
    { title: 'Open the playbook', desc: 'Lead the Compliance path with your team.' },
  ],
  primaryArtifact: {
    name: 'AI Acceptable Use Standard',
    intent:
      'The one-page document staff actually read. It names what AI use you encourage, what is off-limits, and who reviews the gray areas.',
    useBefore: 'sponsoring a single AI use case at your institution',
    table: {
      columns: ['Topic', 'Encouraged', 'Off-limits', 'Reviewer', 'Notes'],
      rows: [
        [
          'Public LLM use',
          'Drafting non-customer text from approved tools',
          'Pasting customer PII, account data, or NPI',
          'AI Security',
          'See Data Handling Card',
        ],
        [
          'Vendor AI features',
          'Use only after vendor review verdict',
          'Enabling without review verdict',
          'AI Compliance',
          'Approve · Gate · Decline',
        ],
        [
          'Adverse-action language',
          'AI may clarify human-provided reasons',
          'AI may not create or infer reasons',
          'Lending Manager',
          'Use traceability table',
        ],
      ],
    },
    copyRule:
      'AI assists drafting. Humans own decisions. Encouraged uses stay encouraged; gray areas come to the named reviewer.',
    copyPrompt: `Help me draft a one-page "AI use at our institution" standard for staff.

Cover:
- What we want more of (3 examples)
- What is off-limits (3 examples with the underlying risk)
- Who reviews gray areas (named role per topic)
- Where to ask before doing
- Where the inventory lives

Tone: clear, confident, conservative — the kind of document staff actually read.
Length: one page. No jargon. No "leveraging" anything.`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Publish the standard',
      checks: [
        'Draft the one-page AI Acceptable Use Standard.',
        'Name the three accountable owners (Compliance, Security, Capability).',
        'Inventory current AI use across the institution (informal counts welcome).',
        'Publish internally with a real signature, not a forward.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Build the operating cadence',
      checks: [
        'Schedule the monthly AI use-case inventory review.',
        'Set the quarterly drift check (what changed, what slipped).',
        'Fund the three foundational artifacts (Tools List, Training Plan, Vendor Template).',
        'Pick the first sponsored use case and name its reviewer.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Make AI capability a recurring agenda item',
      checks: [
        'Add AI capability as a standing board sub-report.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Promote one early-adopter staffer to AI Champion in their department.',
        'Pick the next quarterly anchor (workflow, role, or vendor sweep).',
      ],
    },
  ],
  reviewerPacket: [
    {
      name: 'Acceptable Use Standard',
      desc: 'One page. Encouraged, off-limits, accountable owners, where to ask.',
    },
    {
      name: 'AI Use-Case Inventory',
      desc: 'Risk-tiered list of where AI is actually in use today.',
    },
    {
      name: 'Vendor AI Verdict Memo template',
      desc: 'Approve / gate / decline for every new AI feature your vendors ship.',
    },
    {
      name: 'Department Readiness Map',
      desc: 'Where each team sits across the 8 dimensions, ready for manager review.',
    },
    {
      name: 'Quarterly Drift Note',
      desc: 'What moved, what slipped, what the next 90 days will fix.',
    },
  ],
  playbookPath: {
    best: BEST_PLAYBOOK_PLACEHOLDER('executive'),
    supporting: [],
    template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
  },
};

// ── Compliance / Risk ──────────────────────────────────────────────────────

const COMPLIANCE_RISK: ActionPacket = {
  thesisHeadline: 'You cannot govern what is not on the inventory.',
  thesisBody:
    'Your institution has AI in use — vendor features, staff experimentation, and informal pilots — that the compliance function has not catalogued. The first move is not to write a policy. It is to build the risk-tiered AI Use-Case Inventory so policy has something to govern.',
  actionStrip: [
    { title: 'Inventory the uses', desc: 'Catalogue every place AI touches work today.' },
    { title: 'Tier by risk', desc: 'Customer-facing · Internal · Experimental.' },
    { title: 'Map to controls', desc: 'SR 11-7, TPRM, ECOA where applicable.' },
    { title: 'Set review tiers', desc: 'Low / Medium / High — named reviewers for High.' },
    { title: 'Open the playbook', desc: 'Follow the Compliance path.' },
  ],
  primaryArtifact: {
    name: 'AI Use-Case Inventory',
    intent:
      'A living, risk-tiered list of every AI touchpoint at your institution — vendor-embedded, staff-piloted, or sanctioned.',
    useBefore: 'writing a single AI policy or vendor questionnaire',
    table: {
      columns: ['Use case', 'Owner', 'Risk tier', 'Review', 'Notes'],
      rows: [
        [
          'Branch staff drafting member replies in a public LLM',
          'Retail Manager',
          'High',
          'Edit',
          'Move to approved tool; add Data Handling Card.',
        ],
        [
          'Vendor loan-origination AI summary feature',
          'Lending Operations',
          'High',
          'Edit',
          'Trigger Vendor AI Verdict Memo before enabling.',
        ],
        [
          'Internal IT runbook summarization on internal docs',
          'IT Ops',
          'Low',
          'Approve',
          'Approved tool, no customer data, document workflow.',
        ],
      ],
    },
    copyRule:
      'Every AI use case has a tier, an owner, and a review cadence — or it does not exist at this institution.',
    copyPrompt: `Review this AI workflow description and identify data, compliance, customer-impact, and retention risks. For each risk, suggest one mitigation a community bank could implement this quarter.

Workflow:
[paste the workflow]

Output format:
- risk | severity (low/med/high) | underlying control reference | this-quarter mitigation`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Build the inventory',
      checks: [
        'Survey department heads — what AI tools are in use, formally or not.',
        'Catalogue vendor AI features (LOS, core, marketing, fraud, etc.).',
        'Tier every entry: Low (internal, non-PII), Medium, High (customer-facing or PII).',
        'Publish v1 with a named owner per use case.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Map controls and review tiers',
      checks: [
        'Map each High-tier use case to SR 11-7 / TPRM / ECOA where applicable.',
        'Define Low / Medium / High review tiers with named reviewers for High.',
        'Build the AI Output Review Checklist tied to your review tiers.',
        'Run one High-tier use case through the full review and document it.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Make governance routine',
      checks: [
        'Schedule the monthly inventory refresh + quarterly drift review.',
        'Add AI use-case status to the existing risk dashboard.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Pick the next anchor (vendor sweep, department deep-dive, or examiner-prep packet).',
      ],
    },
  ],
  reviewerPacket: [
    { name: 'AI Use-Case Inventory', desc: 'Risk-tiered, owned, reviewable per entry.' },
    { name: 'Compliance AI Playbook', desc: 'Standards, evidence patterns, approval checkpoints.' },
    {
      name: 'AI Output Review Checklist',
      desc: 'Low / Medium / High tiers with named High reviewers.',
    },
    {
      name: 'Control Mapping Sheet',
      desc: 'Use case → SR 11-7 / TPRM / ECOA / state-law citation.',
    },
    {
      name: 'Quarterly Drift Note',
      desc: 'New uses, retired uses, escalations, exam-readable narrative.',
    },
  ],
  playbookPath: {
    best: BEST_PLAYBOOK_PLACEHOLDER('compliance-risk'),
    supporting: [],
    template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
  },
};

// ── IT / InfoSec ───────────────────────────────────────────────────────────

const IT_INFOSEC: ActionPacket = {
  thesisHeadline: 'Until the tools list exists, you are governing fog.',
  thesisBody:
    'Staff have already chosen their AI tools — you just have not approved them. The first move is to publish the Approved AI Tools List with data-class rules, then walk the three tools currently in use against it. Architecture and gateway control come after the inventory, not before.',
  actionStrip: [
    { title: 'Publish the tools list', desc: 'Named tools, allowed data classes, blocked data.' },
    { title: 'Verdict three tools', desc: 'Review the three in use today.' },
    { title: 'Define data classes', desc: 'Public · Internal · Confidential · Prohibited.' },
    { title: 'Route through gateway', desc: 'One AI access path, logged and reviewable.' },
    { title: 'Open the playbook', desc: 'Follow the InfoSec path.' },
  ],
  primaryArtifact: {
    name: 'Approved AI Tools List',
    intent:
      'The one document that tells staff which AI tools they may use, what data they may put in, and who reviews the edge cases.',
    useBefore: 'staff onboarding or any new AI feature enablement',
    table: {
      columns: ['Tool', 'Verdict', 'Allowed data', 'Blocked', 'Reviewer'],
      rows: [
        [
          'Approved enterprise LLM (gateway)',
          'Approve',
          'Public, Internal',
          'Confidential, NPI',
          'AI Security',
        ],
        [
          'Vendor LOS AI summary feature',
          'Edit',
          'Internal (post-redaction)',
          'NPI without redaction',
          'AI Security + Lending',
        ],
        [
          'Public consumer LLM (browser tab)',
          'Edit',
          'Public only',
          'Anything else',
          'AI Security',
        ],
      ],
    },
    copyRule:
      'No AI tool sees data above its allowed class. Edge cases route to the named reviewer, not Slack.',
    copyPrompt: `Help me design a one-page review template for evaluating a new AI tool before live use.

Cover:
- Data classes the tool would touch (Public / Internal / Confidential / Prohibited)
- Vendor training-data policy (does the prompt train the model?)
- Output explainability (can a reviewer trace the why?)
- Integration risk (auth, scopes, logs)
- Recommended verdict (Approve / Gate / Decline)

Format: one page, single-column, fits a vendor packet.`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Publish the tools list',
      checks: [
        'Inventory the AI tools staff are actually using (formal and informal).',
        'Define the four data classes and which class each tool may touch.',
        'Publish the Approved AI Tools List v1 with named reviewers.',
        'Verdict three tools currently in use and document the reasoning.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Route AI through one gateway',
      checks: [
        'Stand up the approved enterprise LLM access path with auth + logging.',
        'Publish the Vendor AI Verdict Memo template.',
        'Run two new vendor AI features through the template.',
        'Decommission or restrict one shadow tool with a written reason.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Make the perimeter routine',
      checks: [
        'Schedule the monthly tools-list review with usage telemetry.',
        'Add AI tool gateway logs to the SIEM or monitoring stack.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Pick the next anchor (drift monitoring, prompt-injection testing, MCP review).',
      ],
    },
  ],
  reviewerPacket: [
    { name: 'Approved AI Tools List', desc: 'Tools, verdicts, data classes, named reviewers.' },
    {
      name: 'Vendor AI Verdict Memo template',
      desc: 'Approve / gate / decline for new vendor AI features.',
    },
    {
      name: 'Data Class Handling Card',
      desc: 'Public / Internal / Confidential / Prohibited with examples.',
    },
    { name: 'AI Gateway Access Log spec', desc: 'What gets captured, retained, reviewed, and why.' },
    { name: 'Quarterly Drift Note', desc: 'New tools, retired tools, escalations, exam-readable.' },
  ],
  playbookPath: {
    best: BEST_PLAYBOOK_PLACEHOLDER('it-infosec'),
    supporting: [],
    template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
  },
};

// ── Retail / Branch ────────────────────────────────────────────────────────

const RETAIL_BRANCH: ActionPacket = {
  thesisHeadline: 'Your staff need three approved phrases, not three webinars.',
  thesisBody:
    'Branch teams already get AI questions from customers and use AI to draft replies in their personal browsers. The fix is to publish three approved AI-assisted customer-response templates and a one-page Style Brief — not another training event.',
  actionStrip: [
    { title: 'Pick three scenarios', desc: 'The three most common member questions.' },
    { title: 'Draft the templates', desc: 'AI-assisted, plain English, brand-true.' },
    { title: 'Publish the Style Brief', desc: 'Tone, escalation, and what to never say.' },
    { title: 'Train one branch', desc: 'Pilot at one location for two weeks.' },
    { title: 'Open the playbook', desc: 'Follow the Retail / Branch path.' },
  ],
  primaryArtifact: {
    name: 'Branch Style Brief + Three Approved Templates',
    intent:
      'The one page that gives frontline staff the words to use, the tone to hold, and the escalations to trigger when AI is involved.',
    useBefore: 'a branch teammate uses AI to draft a customer-facing message',
    table: {
      columns: ['Scenario', 'AI-assisted reply', 'Tone', 'Escalate when', 'Notes'],
      rows: [
        [
          'Member asks about a denied loan',
          'Empathy + factual referral to Lending without explaining the denial',
          'Warm, specific',
          'Member asks "why" beyond what the letter says',
          'Hand off to Lending Manager',
        ],
        [
          'Member asks about online fraud',
          'Calm acknowledgement + fraud line + freeze options',
          'Calm, instructive',
          'Loss exceeds $500 or wire involved',
          'Fraud Ops + filing form',
        ],
        [
          'Member asks about AI / chatbot use',
          'Honest summary of how AI helps staff prepare drafts',
          'Direct, confident',
          'Member asks if AI made the decision',
          'Hand off to Compliance',
        ],
      ],
    },
    copyRule:
      'AI drafts the first version. The branch teammate owns the final words and the relationship.',
    copyPrompt: `Turn this approved procedure into a frontline job aid for branch staff.

Keep it under one page. Use plain language. Include three example phrases staff can use with members. Match this institution's tone: warm, specific, never condescending.

Procedure:
[paste procedure]

Output:
- one-line summary
- three approved phrases
- one escalation trigger
- one "do not say" example`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Publish the three templates',
      checks: [
        'Pick the three most common member scenarios in the last 90 days.',
        'Draft the AI-assisted reply for each with the Style Brief tone.',
        'Run each through Compliance for a quick sign-off.',
        'Publish to the branch staff knowledge base with permission to edit.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Pilot at one branch',
      checks: [
        'Pick one branch with an engaged manager.',
        'Train staff on the three templates and the Style Brief.',
        'Run for two weeks; collect "what felt off" notes daily.',
        'Refine the templates and the brief based on real use.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Roll out and add the fourth',
      checks: [
        'Roll refined templates to all branches.',
        'Add a fourth scenario based on what the pilot surfaced.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Pick the next anchor (a fifth scenario, or a new product launch script).',
      ],
    },
  ],
  reviewerPacket: [
    {
      name: 'Branch Style Brief',
      desc: 'One page: tone, escalation, never-say list, named reviewer.',
    },
    {
      name: 'Three Approved Templates',
      desc: 'Real scenarios, real phrases, Compliance-signed.',
    },
    {
      name: 'Frontline Job Aid',
      desc: 'The branch teammate version — pocket-sized and laminated.',
    },
    {
      name: 'Escalation Sheet',
      desc: 'When to stop drafting and hand off, with named handoff owners.',
    },
    {
      name: 'Pilot Retro Notes',
      desc: 'What worked, what got rewritten, what to add next.',
    },
  ],
  playbookPath: {
    best: BEST_PLAYBOOK_PLACEHOLDER('retail-branch'),
    supporting: [],
    template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
  },
};

// ── BSA / AML ──────────────────────────────────────────────────────────────

const BSA_AML: ActionPacket = {
  thesisHeadline: 'AI should never invent a fact in a SAR narrative.',
  thesisBody:
    'BSA narratives have the lowest tolerance for hallucination in the institution. The first move is to document one narrative workflow end-to-end so AI is structurally prevented from adding facts not in the source — and so a reviewer can prove that to an examiner.',
  actionStrip: [
    { title: 'Pick one narrative type', desc: 'Structuring, unusual cash, third-party — pick one.' },
    { title: 'Build the input packet', desc: 'Only the verified facts AI may see.' },
    { title: 'Draft the prompt', desc: 'AI may not invent. Period.' },
    { title: 'Document the review', desc: 'Verification checkpoints, named reviewer, retention.' },
    { title: 'Open the playbook', desc: 'Follow the Compliance path with BSA framing.' },
  ],
  primaryArtifact: {
    name: 'AI Workflow SOP — BSA Narrative Variant',
    intent:
      'A documented BSA narrative workflow where AI drafts only from human-verified facts, with explicit verification checkpoints before filing.',
    useBefore: 'AI touches a single BSA narrative or alert review note',
    table: {
      columns: ['Step', 'AI allowed?', 'Human verifies', 'Output', 'Retention'],
      rows: [
        [
          'Gather facts from the alert',
          'No',
          'BSA analyst pulls and labels facts',
          'Fact packet (who/what/when/where/why-unusual)',
          'Working folder',
        ],
        [
          'Draft narrative from fact packet',
          'Yes (no invention)',
          'BSA analyst reads against fact packet',
          'Draft narrative with [VERIFY] flags',
          'Working folder',
        ],
        [
          'Final review and filing',
          'No',
          'BSA Officer signs',
          'Final SAR + reviewer note',
          'BSA system of record',
        ],
      ],
    },
    copyRule:
      'AI drafts only from facts the analyst has verified. Every [VERIFY] flag is resolved before sign-off. AI never adds a fact.',
    copyPrompt: `Given the activity description below, draft a BSA narrative using only the facts provided.

Rules:
- Do not invent details.
- Do not infer intent unless explicitly stated.
- Cover: who, what, when, where, why this is unusual.
- Flag any place I should verify before signing with [VERIFY].
- Use neutral, factual language. No conclusions.

Facts (the only inputs you may use):
[paste fact packet]

Output: one BSA narrative draft, plain English, with [VERIFY] flags where needed.`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Document one narrative workflow',
      checks: [
        'Pick one narrative type (structuring, unusual cash, third-party, etc.).',
        'Define the fact packet format the analyst always produces first.',
        'Draft the role-tuned prompt with explicit no-invention rules.',
        'Pilot the workflow on five real (post-filing) narratives and compare.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Add verification + audit trail',
      checks: [
        'Document the verification checkpoints (analyst, BSA Officer, retention path).',
        'Build the reviewer note format that captures what AI added vs. did not.',
        'Add the workflow to the AI Use-Case Inventory as a High-tier entry.',
        'Run a colleague through the workflow without your help.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Extend to a second narrative type',
      checks: [
        'Apply the same workflow shape to a second narrative type.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Brief the BSA Officer on patterns observed across both types.',
        'Pick the next anchor (alert-review triage, EDD summaries, etc.).',
      ],
    },
  ],
  reviewerPacket: [
    { name: 'AI Workflow SOP (BSA variant)', desc: 'End-to-end workflow with named checkpoints.' },
    { name: 'Fact Packet Template', desc: 'The verified-facts-only input format.' },
    { name: 'Role-tuned Prompt', desc: 'No-invention rules, [VERIFY] flagging, neutral tone.' },
    {
      name: 'Reviewer Note Format',
      desc: 'What AI added, what was verified, what was rejected.',
    },
    {
      name: 'Retention Path',
      desc: 'Working folder vs. system of record, with named owner per stage.',
    },
  ],
  playbookPath: {
    best: BEST_PLAYBOOK_PLACEHOLDER('bsa-aml'),
    supporting: [],
    template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
  },
};

// ── Marketing / Product ────────────────────────────────────────────────────

const MARKETING_PRODUCT: ActionPacket = {
  thesisHeadline: 'Every AI-drafted message is a compliance claim until proven otherwise.',
  thesisBody:
    'AI will happily write that your savings rate is "the highest in the region" or that your card has "no foreign transaction fees" — neither of which is true today. The first move is to publish the AI Output Review Checklist (marketing variant) and run three campaigns through it before publish.',
  actionStrip: [
    { title: 'Publish the checklist', desc: 'Compliance-claim flags, source links, sign-off line.' },
    { title: 'Pilot three campaigns', desc: 'Three customer messages, real ones, this month.' },
    { title: 'Document the saves', desc: 'What got flagged and rewritten before publish.' },
    { title: 'Train the team', desc: 'One 30-minute walkthrough with two examples.' },
    { title: 'Open the playbook', desc: 'Follow the Marketing path.' },
  ],
  primaryArtifact: {
    name: 'AI Output Review Checklist (Marketing Variant)',
    intent:
      'A pre-publish gate that flags compliance claims — fees, rates, disclosures, comparisons — that an AI-drafted message must verify against source-of-truth.',
    useBefore: 'pressing publish on an AI-assisted customer message',
    table: {
      columns: ['Claim type', 'AI draft', 'Verified?', 'Source', 'Verdict'],
      rows: [
        [
          'Rate / APY',
          '"Earn up to 4.50% APY"',
          'Yes',
          'Rate sheet 2026-05',
          'Approve',
        ],
        [
          'Fee comparison',
          '"Lower fees than the big banks"',
          'No',
          'No verifiable source',
          'Edit — remove or qualify',
        ],
        [
          'Regulatory disclosure',
          '"FDIC-insured up to $500,000"',
          'Edit',
          'FDIC standard is $250,000 per depositor',
          'Edit — correct to standard',
        ],
      ],
    },
    copyRule:
      'Every rate, fee, comparison, and disclosure traces to a source-of-truth before publish. "Sounds right" is not a verification.',
    copyPrompt: `Take the campaign brief below and draft three customer-message variants.

For each variant, flag any compliance claim I would need to verify before publishing:
- fees
- rates / APY / APR
- regulatory disclosures (FDIC, NCUA, Reg E, etc.)
- comparisons to competitors
- guarantees or implied guarantees

Format: variant text · flagged claims with [VERIFY: source needed] · suggested verifications.

Brief:
[paste brief]`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Publish the checklist + pilot three',
      checks: [
        'Publish the AI Output Review Checklist (marketing variant).',
        'Pick three campaigns going out this month.',
        'Run each through the checklist with documented [VERIFY] resolutions.',
        'Save the before/after pairs as training examples.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Make it the publishing default',
      checks: [
        'Add the checklist to the campaign brief template.',
        'Train the marketing team in one 30-minute walkthrough.',
        'Document one campaign where the checklist caught a real issue.',
        'Send the catch to Compliance as proof the gate works.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Extend to product copy',
      checks: [
        'Apply the same checklist shape to product page copy.',
        'Apply it to disclosures and rate sheet text.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Pick the next anchor (sales-enablement scripts, partner comms, etc.).',
      ],
    },
  ],
  reviewerPacket: [
    {
      name: 'AI Output Review Checklist',
      desc: 'Pre-publish gate for fees, rates, disclosures, comparisons.',
    },
    {
      name: 'Source-of-Truth Index',
      desc: 'Where rates, fees, and disclosures actually live, with owners.',
    },
    {
      name: 'Pre/Post Examples',
      desc: 'Real campaigns the checklist caught — proof, not policy.',
    },
    {
      name: 'Campaign Brief Template',
      desc: 'Now includes the checklist as a default section.',
    },
    {
      name: 'Compliance Send-Note',
      desc: 'How catches are surfaced to Compliance with context.',
    },
  ],
  playbookPath: {
    best: BEST_PLAYBOOK_PLACEHOLDER('marketing-product'),
    supporting: [],
    template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
  },
};

// ── Operations ─────────────────────────────────────────────────────────────

const OPERATIONS: ActionPacket = {
  thesisHeadline: 'Document one workflow so a colleague can run it without you.',
  thesisBody:
    'You probably have three or four recurring operational tasks where AI already shortens your day — and which would entirely stop if you took a week off. The first move is to convert one of those into a documented Workflow SOP that a colleague could execute cold.',
  actionStrip: [
    { title: 'Pick one workflow', desc: 'The recurring task AI already helps with.' },
    { title: 'Name the four steps', desc: 'Input · prompt · review · save.' },
    { title: 'Define each step', desc: 'Under three sentences. No "etc."' },
    { title: 'Test with a colleague', desc: 'They run it once without you in the room.' },
    { title: 'Open the playbook', desc: 'Follow the Compliance path for review patterns.' },
  ],
  primaryArtifact: {
    name: 'AI Workflow SOP + Saved Skill Template',
    intent:
      'A documented four-step AI workflow (input · prompt · review · save) so a recurring task survives a vacation, a transfer, or a hire.',
    useBefore: 'AI becomes load-bearing for any recurring operational task',
    table: {
      columns: ['Step', 'What you do', 'Tool', 'Output', 'Save where'],
      rows: [
        [
          'Input',
          'Gather the source documents and label the request',
          'Approved enterprise LLM',
          'Labeled input packet',
          'Working folder',
        ],
        [
          'Prompt',
          'Paste the saved prompt + the input packet',
          'Approved enterprise LLM',
          'AI draft output',
          'Working folder',
        ],
        [
          'Review',
          'Read against source; resolve [VERIFY] flags',
          'Human eyes',
          'Final draft + reviewer note',
          'Working folder',
        ],
        [
          'Save',
          'File to system of record; archive working folder',
          'System of record',
          'Filed artifact',
          'System of record',
        ],
      ],
    },
    copyRule:
      'If a colleague cannot run this workflow cold using only the SOP, it is not documented yet.',
    copyPrompt: `Take this recurring operational task and draft a four-step AI workflow:

1. Input I would gather (sources, labels, formats)
2. Prompt I would use (with [VERIFY] flagging)
3. Review step I would run (what the human checks)
4. Final output I would save (and where)

Keep each step under three sentences. Use the imperative voice — a colleague should be able to follow it without me in the room.

Task:
[paste task description]`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Document one workflow',
      checks: [
        'Pick one recurring task AI already shortens for you.',
        'Draft the four-step SOP using the prompt above.',
        'Have a colleague run it once without you and note where they got stuck.',
        'Refine and publish the SOP with named owner and review cadence.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Build the saved-skill library',
      checks: [
        'Convert the prompt into a saved skill (or saved-prompt entry).',
        'Document a second workflow to the same SOP shape.',
        'Add both to the AI Use-Case Inventory.',
        'Build a one-page index of saved skills the team can reach.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Make documenting workflows the norm',
      checks: [
        'Add "Document the workflow" as a definition-of-done for AI-assisted tasks.',
        'Run one workflow with a brand-new hire as the test.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Pick the next anchor (a third workflow, or cross-team SOP).',
      ],
    },
  ],
  reviewerPacket: [
    { name: 'AI Workflow SOP', desc: 'Four steps. Input, prompt, review, save.' },
    { name: 'Saved Skill / Prompt entry', desc: 'The reusable prompt with named owner.' },
    {
      name: 'Reviewer Note Format',
      desc: 'What got flagged, what got resolved, what got saved.',
    },
    {
      name: 'Saved Skills Index',
      desc: 'One-page list of every documented workflow, with last-reviewed date.',
    },
    {
      name: 'Retention Path',
      desc: 'Working folder vs. system of record, with named owner per stage.',
    },
  ],
  playbookPath: {
    best: BEST_PLAYBOOK_PLACEHOLDER('operations'),
    supporting: [],
    template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
  },
};

// ── Training / HR ──────────────────────────────────────────────────────────

const TRAINING_HR: ActionPacket = {
  thesisHeadline: 'Generic AI training is a worse use of staff time than no training.',
  thesisBody:
    'A 90-minute "Intro to AI" webinar checks a box and changes no behavior. The first move is to publish a written six-week, role-specific AI learning plan for one department — with named sources, weekly time budgets, and a definition of "done" at week six.',
  actionStrip: [
    { title: 'Pick one department', desc: 'The one with active AI interest and a willing manager.' },
    { title: 'Pick three skills', desc: 'Tied to actual work products in that department.' },
    { title: 'Name the sources', desc: 'One per skill. Not "search YouTube."' },
    { title: 'Budget the weeks', desc: 'Weekly time, weekly check-in, weekly artifact.' },
    { title: 'Open the playbook', desc: 'Follow the Compliance path for the governance frame.' },
  ],
  primaryArtifact: {
    name: 'Training Rollout Plan',
    intent:
      'A six-week, role-specific AI learning plan for one department — sources named, time budgeted, week 6 success defined.',
    useBefore: 'scheduling any "AI training" event larger than one person',
    table: {
      columns: ['Week', 'Skill', 'Source', 'Time', 'Done looks like'],
      rows: [
        [
          'Weeks 1–2',
          'Safe prompting with the Approved Tools List',
          'Internal Approved Tools List + AiBI Foundations M3',
          '90 min / week',
          'Three saved prompts on real work tasks',
        ],
        [
          'Weeks 3–4',
          'AI-assisted draft review (Output Review Checklist)',
          'AiBI Foundations M7 + internal checklist',
          '90 min / week',
          'Three drafts run through the checklist',
        ],
        [
          'Weeks 5–6',
          'Document one workflow as an SOP',
          'AiBI Foundations M8 + internal SOP template',
          '60 min / week',
          'One published Workflow SOP a colleague can run',
        ],
      ],
    },
    copyRule:
      'Training without a sourced plan, a time budget, and a "done" definition is not training. It is attendance.',
    copyPrompt: `Help me draft a 90-day AI training plan for community bank staff in [DEPARTMENT].

Cover:
- three concrete skills tied to actual work products in that department
- one named source per skill (internal artifact, AiBI module, or specific external resource — no "search the web")
- a weekly time budget per skill
- what "done" looks like at week 12 (the artifact each learner can show)

Tone: practical, role-specific, no AI jargon. Format: 12-week table.

[paste department-specific context here]`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Publish the first plan',
      checks: [
        'Pick the pilot department and the willing manager.',
        'Draft the six-week plan with named sources and time budgets.',
        'Define what "done" looks like at week six per skill.',
        'Publish to the department with manager sign-off.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Run the pilot',
      checks: [
        'Weekly check-ins with the manager and learners.',
        'Capture every "this lesson did not land" note in real time.',
        'Refine the plan mid-flight; do not wait for the retro.',
        'Collect the artifacts each learner produces.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Extend and institutionalize',
      checks: [
        'Adapt the plan for a second department.',
        'Publish the Department Readiness Map showing where each team sits.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Pick the next anchor (new hire onboarding, role transitions, etc.).',
      ],
    },
  ],
  reviewerPacket: [
    { name: 'Training Rollout Plan', desc: 'Six weeks, named sources, weekly artifacts, done-state.' },
    {
      name: 'Department Readiness Map',
      desc: 'Where each team sits across the eight dimensions, ready for manager review.',
    },
    {
      name: 'Weekly Check-in Notes',
      desc: 'What landed, what did not, what got refined.',
    },
    {
      name: 'Learner Artifacts',
      desc: 'The saved prompts, reviewed drafts, and Workflow SOPs each learner produced.',
    },
    {
      name: 'Manager Retro',
      desc: 'What changed for the team over six weeks, in their words.',
    },
  ],
  playbookPath: {
    best: BEST_PLAYBOOK_PLACEHOLDER('training-hr'),
    supporting: [],
    template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
  },
};

// ── Other (generic fallback for unusual roles) ─────────────────────────────

const OTHER: ActionPacket = {
  thesisHeadline: 'Start with one workflow that you actually own.',
  thesisBody:
    'Your role does not fit the standard taxonomy, so the standard advice will not fit you either. The first move is to pick one recurring task you own end-to-end where AI could draft the first version, then document the workflow so it survives a vacation.',
  actionStrip: [
    { title: 'Pick one task', desc: 'A recurring task AI could draft the first version of.' },
    { title: 'Name the data', desc: 'What is allowed in, what is not.' },
    { title: 'Run the prompt', desc: 'Copy the prompt below and try it once.' },
    { title: 'Document the workflow', desc: 'Input · prompt · review · save.' },
    { title: 'Open the playbook', desc: 'Use Compliance as the cross-cutting frame.' },
  ],
  primaryArtifact: {
    name: 'AI Use-Case Inventory (personal start)',
    intent:
      'A personal-scale list of where AI already shortens your day — the seed of a real Workflow SOP for whoever inherits your tasks.',
    useBefore: 'AI becomes a habit you depend on without anyone else knowing',
    table: {
      columns: ['Task', 'AI shape', 'Allowed inputs', 'Reviewer', 'Notes'],
      rows: [
        [
          'Draft recurring weekly summary',
          'Draft / summarize',
          'Internal source docs, no PII',
          'Self + supervisor',
          'Document the prompt before reuse',
        ],
        [
          'Classify incoming requests',
          'Classify',
          'Subject lines and tags only',
          'Self',
          'Track classification accuracy weekly',
        ],
        [
          'Compare two policy drafts',
          'Compare',
          'Both drafts, no PII',
          'Self + policy owner',
          'Save the comparison output',
        ],
      ],
    },
    copyRule:
      'AI shortens drafting. You own decisions, classifications, and final wording. Every use lives somewhere a colleague could find it.',
    copyPrompt: `Help me list the five most common AI use cases I could realistically apply to my work this month.

For each:
- the task
- the AI shape (draft / summarize / classify / compare)
- what I would still review
- the win I would measure (time saved, errors caught, throughput)

Format: a five-row table I can copy into a working doc.

My role and weekly recurring tasks:
[paste tasks]`,
  },
  timeline: [
    {
      phase: 'Days 1–30',
      heading: 'Pick and pilot one task',
      checks: [
        'Pick the one recurring task to pilot.',
        'Run the role-tuned prompt above to inventory five candidates.',
        'Pilot one for a week with notes on what you rewrote.',
        'Capture the prompt as a saved skill with named purpose.',
      ],
    },
    {
      phase: 'Days 31–60',
      heading: 'Document the workflow',
      checks: [
        'Turn the pilot into a four-step Workflow SOP.',
        'Add it to your team or department use-case inventory.',
        'Have a colleague run it once without you in the room.',
        'Capture the friction; refine and republish.',
      ],
    },
    {
      phase: 'Days 61–90',
      heading: 'Extend to a second task',
      checks: [
        'Document a second workflow to the same SOP shape.',
        'Retake the diagnostic and confirm two dimensions moved.',
        'Pick the next anchor (a third workflow, or cross-team adoption).',
        'Share the saved skill with one colleague.',
      ],
    },
  ],
  reviewerPacket: [
    { name: 'AI Use-Case Inventory', desc: 'Your personal list of where AI shortens the day.' },
    { name: 'Saved Skill / Prompt', desc: 'The reusable prompt with named purpose and owner.' },
    { name: 'AI Workflow SOP', desc: 'Four steps. Input, prompt, review, save.' },
    {
      name: 'Reviewer Note Format',
      desc: 'What got flagged, resolved, saved — for whoever inherits this.',
    },
    {
      name: 'Retention Path',
      desc: 'Working folder vs. system of record, with named owner per stage.',
    },
  ],
  playbookPath: {
    best: BEST_PLAYBOOK_PLACEHOLDER('other'),
    supporting: [],
    template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
  },
};

// ── Helper: placeholder so module-init ordering works ──────────────────────
//
// BEST_PLAYBOOK is defined later in the file. The packets above reference it
// during module init via a placeholder function; this resolves at access time.
function BEST_PLAYBOOK_PLACEHOLDER(role: RoleV4): PlaybookCard {
  // Module-init order: by the time packet objects are built, BEST_PLAYBOOK
  // is already in TDZ-safe scope below. This wrapper exists only to keep
  // the call ergonomics readable in the literals above.
  return BEST_PLAYBOOK[role];
}

const ACTION_PACKETS: Partial<Record<RoleV4, ActionPacket>> = {
  executive: EXECUTIVE,
  'compliance-risk': COMPLIANCE_RISK,
  'it-infosec': IT_INFOSEC,
  'retail-branch': RETAIL_BRANCH,
  'lending-credit': LENDING_CREDIT,
  'bsa-aml': BSA_AML,
  'marketing-product': MARKETING_PRODUCT,
  operations: OPERATIONS,
  'training-hr': TRAINING_HR,
  other: OTHER,
};

// ── Fallback packet builder for roles without full authoring yet ───────────

function deriveDefault(role: RoleV4): ActionPacket {
  const meta = ROLE_V4_META[role];
  const out = getRoleOutput(role);
  const playbook = BEST_PLAYBOOK[role];
  return {
    thesisHeadline: 'Your AI work needs structure, not more enthusiasm.',
    thesisBody: `${meta.description} The next step in your role is to convert today's informal use into a documented, reviewable workflow — starting with the artifact below.`,
    actionStrip: [
      { title: 'Pick one workflow', desc: 'The single task AI will touch first.' },
      { title: 'Name the data', desc: 'What is allowed in, what is not.' },
      { title: 'Run the prompt', desc: 'Copy the role-tuned prompt and try it.' },
      { title: 'Review and retain', desc: 'Save reviewer evidence, not messy drafts.' },
      { title: 'Open the playbook', desc: `Follow the ${playbook.label} path.` },
    ],
    primaryArtifact: {
      name: out.artifact,
      intent: `Your role-specific starter artifact — built so a reviewer can read it without questions.`,
      useBefore: `running an AI-assisted task in your role`,
      copyRule:
        'AI assists with drafting and review. Decisions, classifications, and final wording stay with you.',
      copyPrompt: out.samplePrompt,
    },
    timeline: [
      {
        phase: 'Days 1–30',
        heading: out.thirtyDayWin,
        checks: [
          `Define which AI tools are approved for your role.`,
          `Run the role-tuned prompt above against one real-work example.`,
          `Capture reviewer sign-off on the output.`,
          `Save the artifact to a place a colleague could find it.`,
        ],
      },
      {
        phase: 'Days 31–60',
        heading: 'Document one workflow',
        checks: [
          'Turn the pilot into a written Workflow SOP.',
          'Add it to the AI Use-Case Inventory.',
          'Publish a Data Handling Card for the inputs.',
          'Have one colleague run it without you.',
        ],
      },
      {
        phase: 'Days 61–90',
        heading: 'Compound strongest practice',
        checks: [
          'Turn your strongest dimension into a reusable template.',
          'Apply it to two more workflows or vendors.',
          'Retake the diagnostic and confirm two dimensions moved.',
          'Pick the next quarterly anchor.',
        ],
      },
    ],
    reviewerPacket: [
      { name: 'Approved Tools List', desc: 'Tools, data classes, named reviewer.' },
      { name: 'Data Handling Card', desc: 'Allowed inputs and blocked inputs at a glance.' },
      { name: 'Role-tuned Prompt', desc: 'The reusable prompt for your work.' },
      { name: out.artifact, desc: 'The artifact you produce and review.' },
      { name: 'Retention Note', desc: 'What gets saved, where, and what does not.' },
    ],
    playbookPath: {
      best: playbook,
      supporting: [
        {
          slug: 'compliance',
          label: 'Compliance',
          use: 'Review standards and evidence packets.',
        },
        {
          slug: 'infosec',
          label: 'InfoSec',
          use: 'Approved tool paths and data classes.',
        },
      ].filter((p) => p.slug !== playbook.slug),
      template: { label: 'Workflow SOP', use: 'Tool, input, output, reviewer, retention.' },
    },
  };
}

export function getActionPacket(role: RoleV4 | null): ActionPacket {
  const r = role ?? 'other';
  return ACTION_PACKETS[r] ?? deriveDefault(r);
}

// ── Protect / Use / Build classification ────────────────────────────────────

// Used by the artifact-section sidebar widget. Splits the user's eight
// dimension scores into the three action buckets the report frames.
//
//   Protect first = the three lowest-scoring dimensions (most at-risk)
//   Use next      = the two highest-scoring dimensions (compound from strength)
//   Build next    = the three middle dimensions (build the routine here)
export function classifyDimensions(
  dimensionBreakdown: Record<Dimension, { score: number; label: string }>,
): {
  readonly protect: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  readonly use: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
  readonly build: ReadonlyArray<{ key: Dimension; score: number; label: string }>;
} {
  const all = (Object.entries(dimensionBreakdown) as [Dimension, { score: number; label: string }][])
    .map(([key, v]) => ({ key, score: v.score, label: v.label }))
    .sort((a, b) => a.score - b.score);
  return {
    protect: all.slice(0, 3),
    use: all.slice(-2).reverse(),
    build: all.slice(3, 6),
  };
}
