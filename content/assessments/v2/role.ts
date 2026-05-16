// Role taxonomy for In-Depth Briefing personalization (#97).
//
// Captured once at the start of the In-Depth assessment (or pre-filled from
// the user_profiles row if the buyer has set it before). Drives role-aware
// framing of the diagnosis + the Foundation module recommendation.
//
// Eight roles cover the survey buyers we expect from community banks and
// credit unions. 'other' is the catch-all for board members, vendor reps,
// and anyone whose role doesn't fit cleanly — never blocks the assessment.

export const ROLES = [
  'operator',
  'compliance-risk',
  'training-hr',
  'executive',
  'lending',
  'marketing',
  'it',
  'other',
] as const;

export type Role = (typeof ROLES)[number];

export interface RoleMeta {
  readonly id: Role;
  readonly label: string;
  readonly description: string;
}

export const ROLE_META: Record<Role, RoleMeta> = {
  operator: {
    id: 'operator',
    label: 'Operations / processes',
    description: 'You own how the work gets done day to day.',
  },
  'compliance-risk': {
    id: 'compliance-risk',
    label: 'Compliance / risk',
    description: 'You answer to examiners and protect the institution.',
  },
  'training-hr': {
    id: 'training-hr',
    label: 'Training / HR',
    description: 'You build the staff capability that adoption depends on.',
  },
  executive: {
    id: 'executive',
    label: 'C-suite / executive',
    description: "You set the institution's direction and own the outcome.",
  },
  lending: {
    id: 'lending',
    label: 'Lending / credit',
    description: 'You move loans from application to closing.',
  },
  marketing: {
    id: 'marketing',
    label: 'Marketing / member service',
    description: 'You own the member-facing voice and growth.',
  },
  it: {
    id: 'it',
    label: 'IT / technology',
    description: 'You vet the tools and keep the data safe.',
  },
  other: {
    id: 'other',
    label: 'Other / board / advisor',
    description: 'Anything else — board, vendor, consultant, observer.',
  },
};

// Lenient parser so /api/* and DB reads tolerate slight string variants.
export function parseRole(input: unknown): Role | null {
  if (typeof input !== 'string') return null;
  const lowered = input.trim().toLowerCase();
  if ((ROLES as readonly string[]).includes(lowered)) return lowered as Role;
  return null;
}
