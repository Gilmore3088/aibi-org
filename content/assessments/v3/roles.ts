// Free-funnel role taxonomy — shared by EmailGate (the capture form), the
// /api/capture-email route (user_profiles write + MailerLite segmentation),
// and the v3 results view (role-aware "Best match" playbook).
//
// Intentionally a short superset of the v2 Role union to keep the free form
// light. Mapped down to a v2 Role before the user_profiles write so the DB
// schema stays stable; the raw free-id is forwarded to MailerLite.

import type { Role } from '@content/assessments/v2/role';

export const FREE_ROLES = [
  'executive',
  'compliance-risk',
  'operations',
  'lending',
  'retail-branch',
  'marketing',
  'it-infosec',
  'training-hr',
  'other',
] as const;

export type FreeRole = (typeof FREE_ROLES)[number];

export const FREE_ROLE_LABEL: Record<FreeRole, string> = {
  executive: 'Executive / Leadership',
  'compliance-risk': 'Compliance / Risk',
  operations: 'Operations',
  lending: 'Lending / Credit',
  'retail-branch': 'Retail / Branch',
  marketing: 'Marketing / Product',
  'it-infosec': 'IT / InfoSec',
  'training-hr': 'Training / HR',
  other: 'Other',
};

// Lenient parser so the API route and DB reads tolerate slight string variants.
export function parseFreeRole(input: unknown): FreeRole | null {
  if (typeof input !== 'string') return null;
  const lowered = input.trim().toLowerCase();
  return (FREE_ROLES as readonly string[]).includes(lowered)
    ? (lowered as FreeRole)
    : null;
}

// Free-funnel id → v2 Role id. retail-branch and operations both collapse
// to "operator" (frontline ops). it-infosec → it. The rest map 1:1.
export const FREE_ROLE_TO_V2: Record<FreeRole, Role> = {
  executive: 'executive',
  'compliance-risk': 'compliance-risk',
  operations: 'operator',
  lending: 'lending',
  'retail-branch': 'operator',
  marketing: 'marketing',
  'it-infosec': 'it',
  'training-hr': 'training-hr',
  other: 'other',
};
