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
    title: 'The Bank AI Use-Case Inventory Template',
    dek: 'A fillable register for tracking AI tools, data, owners, human review, risk tier, vendor controls, and re-review cadence.',
    audience: 'Compliance, risk, operations, and AI program owners',
    readMinutes: 12,
    preview: ['Register columns', 'Risk tier guide', 'Approval workflow', 'Sample rows'],
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
    title: 'AI Workflow SOP Template',
    dek: 'A standard operating procedure that documents a single AI-assisted workflow with enough model-risk discipline that an examiner can read it and know exactly what the AI does, who checks it, and when it gets shut off.',
    audience: 'Operations, compliance, lending, any team running AI-assisted work',
    readMinutes: 14,
    preview: ['Workflow identity', 'Scope & prohibited uses', 'Human-in-the-loop', 'Validation & monitoring'],
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
