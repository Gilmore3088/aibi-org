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
    title: 'AI Use-Case Inventory',
    dek: 'A register for documenting every approved, restricted, and proposed AI use case before it becomes normal work.',
    audience: 'Compliance, risk, operations, and AI program owners',
    readMinutes: 6,
    preview: ['Use case', 'Tool and vendor', 'Data class', 'Human review'],
  },
  {
    slug: 'ai-use-policy-starter',
    title: 'AI Use Policy Starter',
    dek: 'A starter policy your team can adapt in an afternoon. Defines allowed tools, allowed data, review requirements, and an incident path.',
    audience: 'Compliance, risk, and senior management',
    readMinutes: 8,
    preview: ['Purpose', 'Allowed tools', 'Allowed data', 'Human review'],
  },
  {
    slug: 'ai-workflow-sop',
    title: 'AI Workflow SOP Template',
    dek: 'A one-page workflow SOP for any AI-assisted task. Documents the unit examiners actually look at: input, output, retention, review.',
    audience: 'Operations, compliance, lending, any team running AI-assisted work',
    readMinutes: 6,
    preview: ['Workflow name', 'Owner', 'Purpose', 'Inputs'],
  },
  {
    slug: 'board-briefing-checklist',
    title: 'Board / Leadership Briefing Checklist',
    dek: 'What to put in front of your board before, during, and after AI rollout. Twelve items, three categories.',
    audience: 'C-suite preparing AI briefings for board or executive committee',
    readMinutes: 5,
    preview: ['Before the briefing', 'During the briefing', 'After the briefing'],
  },
  {
    slug: 'cdfi-grant-ai-evidence-checklist',
    title: 'CDFI Grant AI Evidence Checklist',
    dek: 'A mission-first checklist for documenting AI-assisted work in grant, impact, and community-development evidence files.',
    audience: 'CDFI, MDI, community development, grants, and impact teams',
    readMinutes: 7,
    preview: ['Grant goal', 'Data boundary', 'Evidence retained', 'Fairness check'],
  },
  {
    slug: 'gtm-plan',
    title: 'Go-to-Market Plan for an AI Initiative',
    dek: 'A go-to-market plan for launching an AI capability inside a community bank or credit union. Six sections, one page.',
    audience: 'Marketing, retail, and product leaders launching an AI capability internally or to members',
    readMinutes: 7,
    preview: ['Audience', 'Promise', 'Proof', 'Channels'],
  },
] as const satisfies readonly TemplateIndexEntry[];
