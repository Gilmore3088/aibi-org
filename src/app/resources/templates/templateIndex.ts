export type TemplateSlug =
  | 'ai-use-case-inventory'
  | 'ai-use-policy-starter'
  | 'ai-workflow-sop'
  | 'board-briefing-checklist'
  | 'cdfi-grant-ai-evidence-checklist'
  | 'gtm-plan';

export interface TemplateIndexEntry {
  readonly slug: TemplateSlug;
  readonly title: string;
  readonly dek: string;
  /** "Compliance teams" / "Operations leads" — who this is for. */
  readonly audience: string;
  /** Rough read/fill time in minutes. */
  readonly readMinutes: number;
  /** Compact card chips for the resource library. */
  readonly preview: readonly string[];
}

export const TEMPLATE_INDEX = [
  {
    slug: 'ai-use-case-inventory',
    title: 'The Bank AI Use-Case Inventory Card',
    dek: 'A one-page register and editable spreadsheet for tracking AI workflows, owners, data classes, risk tiers, human review, and review cadence.',
    audience: 'Compliance, risk, operations, and AI program owners',
    readMinutes: 12,
    preview: ['Register columns', 'Data class vs risk tier', 'Vendor controls', 'Spreadsheet companion'],
  },
  {
    slug: 'ai-use-policy-starter',
    title: "The Banker's AI Use Policy Starter",
    dek: 'Editable clause language, data-classification rules, and governance control areas for safe generative AI adoption.',
    audience: 'Compliance, risk, and senior management',
    readMinutes: 15,
    preview: ['Purpose & scope', 'Governance & accountability', 'Approved tools', 'Data classification'],
  },
  {
    slug: 'ai-workflow-sop',
    title: 'The Bank AI Workflow SOP Template',
    dek: 'A fillable operating procedure for documenting AI-assisted work, human review, data handling, vendor controls, monitoring, and shutoff triggers.',
    audience: 'Operations, compliance, lending, any team running AI-assisted work',
    readMinutes: 18,
    preview: ['Fillable front page', 'Human review', 'Vendor lifecycle', 'Shutoff triggers'],
  },
  {
    slug: 'board-briefing-checklist',
    title: 'The AI Board Briefing Checklist',
    dek: 'Four facts, four motions, and four evidence items for a controlled bank AI rollout.',
    audience: 'C-suite preparing AI briefings for board or executive committee',
    readMinutes: 7,
    preview: ['Four facts', 'Four motions', 'Board memo', 'Evidence items'],
  },
  {
    slug: 'cdfi-grant-ai-evidence-checklist',
    title: 'CDFI Grant AI Evidence Checklist',
    dek: 'A mission-first, audit-ready way to document where AI assisted your grant, certification, and impact files — so human judgment, fair-lending integrity, and community outcomes stay clearly attributable and defensible.',
    audience: 'CDFI, MDI, community development, grants, and impact teams',
    readMinutes: 12,
    preview: ['Why it matters', 'AI use-case inventory', 'Separate AI from judgment', 'Fair-lending guardrails'],
  },
  {
    slug: 'gtm-plan',
    title: 'Go-to-Market Plan for an AI Initiative',
    dek: 'A run-it-this-week go-to-market plan for launching an AI-enabled capability at a community bank or credit union — internal rollout plus a compliant member-facing announcement — with a worked example threaded through every section.',
    audience: 'Marketing, retail, and product leaders launching an AI capability internally or to members',
    readMinutes: 12,
    preview: ['Launch & audience', 'The promise', 'Proof & pilot', 'Compliance guardrails'],
  },
] as const satisfies readonly TemplateIndexEntry[];
