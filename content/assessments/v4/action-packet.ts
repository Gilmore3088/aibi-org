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

const ACTION_PACKETS: Partial<Record<RoleV4, ActionPacket>> = {
  'lending-credit': LENDING_CREDIT,
  // Other roles use deriveDefault() below. Add fully-authored packets
  // here as content is finalized for each role.
};

// ── Best-match playbook per role ────────────────────────────────────────────

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
