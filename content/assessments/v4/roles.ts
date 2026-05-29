// AiBI In-Depth Diagnostic — v4 Role Taxonomy
//
// Captured at the start of the In-Depth assessment to drive role-specific
// artifact, prompt, and 30-day-win recommendations in the report.
//
// Nine roles from the spec (Section 8) plus 'other' as the catch-all.
// We expand the v2 list — splitting IT into IT/InfoSec, adding BSA/AML,
// and giving Retail/Branch and Lending/Credit their own clearer labels.

export const ROLES_V4 = [
  'executive',
  'compliance-risk',
  'it-infosec',
  'retail-branch',
  'lending-credit',
  'bsa-aml',
  'marketing-product',
  'operations',
  'training-hr',
  'other',
] as const;

export type RoleV4 = (typeof ROLES_V4)[number];

export interface RoleV4Meta {
  readonly id: RoleV4;
  readonly label: string;
  readonly description: string;
}

export const ROLE_V4_META: Record<RoleV4, RoleV4Meta> = {
  executive: {
    id: 'executive',
    label: 'Executive / Leadership',
    description: 'You set direction, allocate attention, and own the institutional outcome.',
  },
  'compliance-risk': {
    id: 'compliance-risk',
    label: 'Compliance / Risk',
    description: 'You answer to examiners and protect the institution.',
  },
  'it-infosec': {
    id: 'it-infosec',
    label: 'IT / InfoSec',
    description: 'You own the systems AI runs on and the controls that keep them safe.',
  },
  'retail-branch': {
    id: 'retail-branch',
    label: 'Retail / Branch',
    description: 'You work face-to-face with members and customers in branch operations.',
  },
  'lending-credit': {
    id: 'lending-credit',
    label: 'Lending / Credit',
    description: 'You make or support credit decisions that affect customers and the institution.',
  },
  'bsa-aml': {
    id: 'bsa-aml',
    label: 'BSA / AML',
    description: 'You handle the high-sensitivity surveillance and reporting work.',
  },
  'marketing-product': {
    id: 'marketing-product',
    label: 'Marketing / Product',
    description: 'You shape the messages and product experiences that reach customers.',
  },
  operations: {
    id: 'operations',
    label: 'Operations',
    description: 'You run the workflows that turn policies into day-to-day execution.',
  },
  'training-hr': {
    id: 'training-hr',
    label: 'Training / HR',
    description: 'You build the staff capability that AI adoption depends on.',
  },
  other: {
    id: 'other',
    label: 'Other',
    description: 'Your role does not fit cleanly above — board, vendor, advisor, or hybrid.',
  },
};

export function parseRoleV4(value: unknown): RoleV4 | null {
  if (typeof value !== 'string' || value === '') return null;
  return (ROLES_V4 as readonly string[]).includes(value) ? (value as RoleV4) : null;
}
