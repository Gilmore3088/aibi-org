// Maps a resource_downloads.resource_slug to a human label + category for the
// admin resource-KPI dashboard. The canonical public resource names live in the
// free resource manifest; this file adds fallback handling for course /
// auto-generated slugs (starter-*, skill-template-*, card-*) that have no
// public-library row.
//
import { freeResources, type FreeResourceCategory } from './freeResources';

// Mapping is resolved here (not in SQL) so it stays close to the manifest and
// so slug edge cases — e.g. `in-depth-playbook` is a Paid preview, not a Role
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

const CATEGORY_LABELS: Record<FreeResourceCategory, ResourceCategory> = {
  playbook: 'Role playbooks',
  'starter-kit': 'Starter kits',
  'desk-card': 'Desk cards',
  artifact: 'Artifacts',
  template: 'Templates',
  'paid-preview': 'Paid previews',
  'course-artifact': 'Course artifacts',
  other: 'Other',
};

const EXPLICIT: Readonly<Record<string, ResourceMeta>> = Object.fromEntries(
  freeResources
    .filter((resource) => resource.status !== 'archived')
    .map((resource) => [
      resource.slug,
      {
        label: resource.title,
        category: CATEGORY_LABELS[resource.category],
      },
    ]),
);

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
