import { ROLE_V4_META, ROLES_V4, type RoleV4 } from '@content/assessments/v4/roles';

export const TEAM_ASSESSMENT_MIN_SEATS = 10;
export const TEAM_ASSESSMENT_UNLOCK_COMPLETIONS = 10;
export const TEAM_ASSESSMENT_SLICE_MIN = 5;

export const TEAM_DEPARTMENTS = [
  'executive',
  'compliance-risk',
  'it-infosec',
  'operations',
  'retail-branch',
  'lending-credit',
  'bsa-aml',
  'marketing-product',
  'training-hr',
  'finance-accounting',
  'other',
] as const;

export type TeamDepartment = (typeof TEAM_DEPARTMENTS)[number];

export const TEAM_DEPARTMENT_LABELS: Record<TeamDepartment, string> = {
  executive: 'Executive / Leadership',
  'compliance-risk': 'Compliance / Risk',
  'it-infosec': 'IT / InfoSec',
  operations: 'Operations',
  'retail-branch': 'Retail / Branch',
  'lending-credit': 'Lending / Credit',
  'bsa-aml': 'BSA / AML',
  'marketing-product': 'Marketing / Product',
  'training-hr': 'Training / HR',
  'finance-accounting': 'Finance / Accounting',
  other: 'Other',
};

export function parseTeamDepartment(value: unknown): TeamDepartment | null {
  if (typeof value !== 'string') return null;
  return (TEAM_DEPARTMENTS as readonly string[]).includes(value)
    ? (value as TeamDepartment)
    : null;
}

export function labelForDepartment(department: string, other?: string | null): string {
  const parsed = parseTeamDepartment(department);
  if (parsed === 'other' && other) return other;
  return parsed ? TEAM_DEPARTMENT_LABELS[parsed] : department;
}

export function labelForRole(role: string): string {
  return (ROLES_V4 as readonly string[]).includes(role)
    ? ROLE_V4_META[role as RoleV4].label
    : role;
}
