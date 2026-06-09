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
//
// NOTE (2026-06): new free captures now persist the un-collapsed free role
// directly (the user_profiles.role CHECK was widened in migration 00040 to
// accept the full union). This map is retained only to normalize LEGACY rows
// that were written collapsed — see normalizeStoredRoleToFreeRole below.
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

// Reverse bridge for reading legacy rows. Older free captures stored a
// collapsed v2 Role ('operator', 'it') instead of the free id. Map those
// back to a free role so the results view can resolve a playbook. The
// operator collapse is lossy (operations vs retail-branch) — we default it
// to 'operations', the truest reading of the v2 'operator' label.
const LEGACY_V2_TO_FREE_ROLE: Record<string, FreeRole> = {
  operator: 'operations',
  it: 'it-infosec',
  executive: 'executive',
  'compliance-risk': 'compliance-risk',
  lending: 'lending',
  marketing: 'marketing',
  'training-hr': 'training-hr',
  other: 'other',
};

// Normalize whatever is stored in user_profiles.role into a FreeRole.
// Handles both new rows (already a free id) and legacy collapsed rows.
export function normalizeStoredRoleToFreeRole(input: unknown): FreeRole | null {
  const direct = parseFreeRole(input);
  if (direct) return direct;
  if (typeof input === 'string') {
    return LEGACY_V2_TO_FREE_ROLE[input.trim().toLowerCase()] ?? null;
  }
  return null;
}
