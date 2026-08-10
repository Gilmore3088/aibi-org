// Maps a requested free-resource slug to the MailerLite `resource_category`
// field that drives the five resource nurture segments (Resource · Governance
// / Compliance / Role / InfoSec / Lending). A subscriber whose field is set
// joins the matching segment, which triggers that resource automation.
//
// The mapping is intentionally conservative: resources outside the five
// nurture tracks return null and set no field — those leads stay on the
// generic resource-library path rather than being force-fitted into a
// sequence written for a different reader.

import { getFreeResource } from '@/lib/resources/freeResources';

export type ResourceNurtureCategory =
  | 'governance'
  | 'compliance'
  | 'role'
  | 'infosec'
  | 'lending';

// Slug-level overrides win over funnelSegment defaults: the compliance and
// BSA/AML playbooks are funnelSegment 'role-playbook' in the manifest, but
// their nurture homes are the Compliance / Lending sequences (the emails
// literally open "Your Compliance AI Playbook…" / "…where the file has to
// hold up").
const SLUG_OVERRIDES: Record<string, ResourceNurtureCategory> = {
  'compliance-playbook': 'compliance',
  'bsa-aml-playbook': 'lending',
  'lending-playbook': 'lending',
  'infosec-playbook': 'infosec',
};

const FUNNEL_SEGMENT_DEFAULTS: Record<string, ResourceNurtureCategory> = {
  governance: 'governance',
  'data-handling': 'infosec',
  'lending-review': 'lending',
  'role-playbook': 'role',
};

export function resourceCategoryForSlug(
  slug: string | null | undefined,
): ResourceNurtureCategory | null {
  if (!slug) return null;
  const override = SLUG_OVERRIDES[slug];
  if (override) return override;
  const resource = getFreeResource(slug);
  if (!resource) return null;
  return FUNNEL_SEGMENT_DEFAULTS[resource.funnelSegment ?? ''] ?? null;
}
