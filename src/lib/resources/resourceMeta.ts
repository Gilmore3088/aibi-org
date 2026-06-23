// Maps a resource_downloads.resource_slug to a human label + category for the
// admin resource-KPI dashboard. The canonical resource names live in the
// resources catalog (src/app/resources/data.ts); this table mirrors them and
// adds the course / auto-generated slugs (starter-*, skill-template-*, card-*)
// that have no catalog row. Keep labels roughly in sync with the catalog.
//
// Mapping is resolved here (not in SQL) so it stays close to the catalog and so
// slug edge cases — e.g. `in-depth-playbook` is a Paid preview, not a Role
// playbook despite the `-playbook` suffix — are explicit and unit-tested.

export type ResourceCategory =
  | 'Role playbooks'
  | 'Starter kits'
  | 'Desk cards'
  | 'Artifacts'
  | 'Templates'
  | 'Paid previews'
  | 'Course artifacts'
  | 'Other';

export interface ResourceMeta {
  readonly label: string;
  readonly category: ResourceCategory;
}

// Display order (top to bottom) for category groupings on the dashboard.
export const RESOURCE_CATEGORY_ORDER: readonly ResourceCategory[] = [
  'Role playbooks',
  'Starter kits',
  'Desk cards',
  'Artifacts',
  'Templates',
  'Paid previews',
  'Course artifacts',
  'Other',
];

const EXPLICIT: Readonly<Record<string, ResourceMeta>> = {
  // Starter kits (ZIP bundles)
  'governance-starter-kit': { label: 'AI Governance Starter Kit', category: 'Starter kits' },
  'frontline-enablement-kit': { label: 'Frontline Enablement Kit', category: 'Starter kits' },
  'marketing-review-kit': { label: 'Marketing Review Kit', category: 'Starter kits' },
  'lending-review-kit': { label: 'Lending Review Kit', category: 'Starter kits' },
  // Role playbooks
  'compliance-playbook': { label: 'Compliance Playbook', category: 'Role playbooks' },
  'retail-playbook': { label: 'Branch / Retail Playbook', category: 'Role playbooks' },
  'marketing-playbook': { label: 'Marketing Playbook', category: 'Role playbooks' },
  'lending-playbook': { label: 'Lending Playbook', category: 'Role playbooks' },
  'bsa-aml-playbook': { label: 'BSA / AML Playbook', category: 'Role playbooks' },
  'infosec-playbook': { label: 'IT / InfoSec Playbook', category: 'Role playbooks' },
  // Desk cards (single-page reference PDFs)
  'safe-ai-use-checklist': { label: 'Safe AI Use Checklist', category: 'Desk cards' },
  'red-yellow-green-use-card': { label: 'Red / Yellow / Green Use Card', category: 'Desk cards' },
  'prompt-strategy-cheat-sheet': { label: 'Prompt Strategy Cheat Sheet', category: 'Desk cards' },
  'regulatory-cheatsheet': { label: 'Regulatory Cheat Sheet', category: 'Desk cards' },
  // Standalone artifacts (also bundled inside kits)
  'artifact-ai-use-case-inventory': { label: 'AI Use-Case Inventory', category: 'Artifacts' },
  'artifact-fair-lending-ai-review-checklist': {
    label: 'Fair-Lending AI Review Checklist',
    category: 'Artifacts',
  },
  'artifact-data-handling-reference-card': {
    label: 'Data Handling Reference Card',
    category: 'Artifacts',
  },
  // Paid previews — in-depth-playbook ends in "-playbook" but is a preview asset.
  'sample-readiness-report': { label: 'Sample Readiness Report', category: 'Paid previews' },
  'in-depth-playbook': { label: 'In-Depth Playbook (preview)', category: 'Paid previews' },
  // Templates (downloaded as .doc via /api/resources/templates/[slug]/word)
  'template-ai-use-policy-starter': { label: 'AI Use Policy Starter', category: 'Templates' },
  'template-ai-workflow-sop': { label: 'AI Workflow SOP', category: 'Templates' },
  'template-board-briefing-checklist': { label: 'Board Briefing Checklist', category: 'Templates' },
};

function humanize(slug: string): string {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Resolve a resource_slug to a display label + category. Explicit catalog slugs
 * win; otherwise fall back by prefix (course/auto slugs) then by suffix, then to
 * a humanized label in the Other bucket. Total function — never throws.
 */
export function resourceMeta(slug: string): ResourceMeta {
  const explicit = EXPLICIT[slug];
  if (explicit) return explicit;

  if (slug.startsWith('starter-')) {
    return { label: `Starter artifact — ${humanize(slug.slice(8))}`, category: 'Course artifacts' };
  }
  if (slug.startsWith('skill-template-')) {
    return { label: `Skill template — ${humanize(slug.slice(15))}`, category: 'Course artifacts' };
  }
  if (slug.startsWith('card-')) {
    return { label: `Banker card — ${humanize(slug.slice(5))}`, category: 'Course artifacts' };
  }
  if (slug.startsWith('template-')) {
    return { label: humanize(slug.slice(9)), category: 'Templates' };
  }
  if (slug.startsWith('artifact-')) {
    return { label: humanize(slug.slice(9)), category: 'Artifacts' };
  }
  if (slug.endsWith('-kit')) return { label: humanize(slug), category: 'Starter kits' };
  if (slug.endsWith('-playbook')) return { label: humanize(slug), category: 'Role playbooks' };
  return { label: humanize(slug), category: 'Other' };
}
