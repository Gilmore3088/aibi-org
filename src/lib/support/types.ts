import { EMAIL_RE } from '@/lib/email/validate';

export const SUPPORT_CASE_CATEGORIES = [
  'access',
  'missing_email',
  'refund_request',
  'failed_payment',
  'provisioning_failure',
  'email_failure',
  'webhook_error',
  'team_seats',
  'ops_alert',
  'other',
] as const;

export const SUPPORT_CASE_STATUSES = [
  'new',
  'open',
  'waiting_customer',
  'waiting_internal',
  'resolved',
  'refunded',
  'closed_no_action',
] as const;

export const SUPPORT_CASE_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

export const SUPPORT_CASE_SOURCES = [
  'buyer_form',
  'ops_alert',
  'admin',
  'webhook',
  'reconciliation',
] as const;

export type SupportCaseCategory = (typeof SUPPORT_CASE_CATEGORIES)[number];
export type SupportCaseStatus = (typeof SUPPORT_CASE_STATUSES)[number];
export type SupportCasePriority = (typeof SUPPORT_CASE_PRIORITIES)[number];
export type SupportCaseSource = (typeof SUPPORT_CASE_SOURCES)[number];
export type SupportActorType = 'system' | 'admin' | 'customer';

export interface SupportCase {
  readonly id: string;
  readonly buyerEmail: string;
  readonly subject: string;
  readonly summary: string;
  readonly category: SupportCaseCategory;
  readonly status: SupportCaseStatus;
  readonly priority: SupportCasePriority;
  readonly source: SupportCaseSource;
  readonly product: string | null;
  readonly stripeSessionId: string | null;
  readonly enrollmentId: string | null;
  readonly userId: string | null;
  readonly teamCohortId: string | null;
  readonly assignedToEmail: string;
  readonly dedupeKey: string | null;
  readonly firstResponseAt: string | null;
  readonly resolvedAt: string | null;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SupportCaseEvent {
  readonly id: string;
  readonly caseId: string;
  readonly eventType: string;
  readonly actorType: SupportActorType;
  readonly actorEmail: string | null;
  readonly message: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
}

export interface SupportCaseWithEvents {
  readonly case: SupportCase;
  readonly events: readonly SupportCaseEvent[];
}

export function isSupportCaseCategory(value: unknown): value is SupportCaseCategory {
  return typeof value === 'string' && SUPPORT_CASE_CATEGORIES.includes(value as SupportCaseCategory);
}

export function isSupportCaseStatus(value: unknown): value is SupportCaseStatus {
  return typeof value === 'string' && SUPPORT_CASE_STATUSES.includes(value as SupportCaseStatus);
}

export function isSupportCasePriority(value: unknown): value is SupportCasePriority {
  return typeof value === 'string' && SUPPORT_CASE_PRIORITIES.includes(value as SupportCasePriority);
}

export function isSupportCaseSource(value: unknown): value is SupportCaseSource {
  return typeof value === 'string' && SUPPORT_CASE_SOURCES.includes(value as SupportCaseSource);
}

export function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function normalizeBuyerEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const SUPPORT_EMAIL_RE = EMAIL_RE;

export function isValidSupportEmail(email: string): boolean {
  return SUPPORT_EMAIL_RE.test(email.trim());
}
