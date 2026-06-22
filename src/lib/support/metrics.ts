import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  SUPPORT_CASE_CATEGORIES,
  type SupportCaseCategory,
  type SupportCasePriority,
  type SupportCaseStatus,
} from './types';

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

export type SupportMetricsRange = '7d' | '30d' | '90d';

export interface SupportMetrics {
  readonly range: SupportMetricsRange;
  readonly startIso: string;
  readonly generatedAt: string;
  readonly queue: {
    readonly openCases: number;
    readonly newCases: number;
    readonly slaBreaches: number;
    readonly medianFirstResponseHours: number | null;
    readonly medianResolutionHours: number | null;
  };
  readonly casesByCategory: Record<SupportCaseCategory, number>;
  readonly casesByPriority: Record<SupportCasePriority, number>;
  readonly refundRequests: {
    readonly total: number;
    readonly pending: number;
    readonly approved: number;
    readonly denied: number;
    readonly manuallyIssued: number;
  };
  readonly opsHealth: {
    readonly accessRescuesSent: number;
    readonly provisioningFailures: number;
    readonly emailFailures: number;
    readonly webhookFailures: number;
  };
  readonly launchHealth: {
    readonly paidEnrollments: number;
    readonly activeEntitlements: number;
    readonly certificatesIssued: number;
    readonly teamCohortsCreated: number;
    readonly supportCasesPer10PaidPurchases: number | null;
  };
}

interface CaseMetricRow {
  id: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
}

interface EventMetricRow {
  event_type: string;
  created_at: string;
}

const TERMINAL_STATUSES = new Set<SupportCaseStatus>([
  'resolved',
  'refunded',
  'closed_no_action',
]);

function rangeStart(range: SupportMetricsRange, now = new Date()): Date {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export function parseSupportMetricsRange(value: string | null | undefined): SupportMetricsRange {
  if (value === '7d' || value === '30d' || value === '90d') return value;
  return '30d';
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid]!;
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function hoursBetween(startIso: string, endIso: string): number {
  return Math.max(0, (Date.parse(endIso) - Date.parse(startIso)) / (60 * 60 * 1000));
}

function isOpenStatus(status: string): boolean {
  return !TERMINAL_STATUSES.has(status as SupportCaseStatus);
}

function zeroCategoryCounts(): Record<SupportCaseCategory, number> {
  return Object.fromEntries(SUPPORT_CASE_CATEGORIES.map((category) => [category, 0])) as Record<
    SupportCaseCategory,
    number
  >;
}

function zeroPriorityCounts(): Record<SupportCasePriority, number> {
  return { low: 0, normal: 0, high: 0, urgent: 0 };
}

export function calculateSupportMetrics(args: {
  readonly range: SupportMetricsRange;
  readonly startIso: string;
  readonly nowIso: string;
  readonly cases: readonly CaseMetricRow[];
  readonly events: readonly EventMetricRow[];
  readonly paidEnrollments: number;
  readonly activeEntitlements: number;
  readonly certificatesIssued: number;
  readonly teamCohortsCreated: number;
}): SupportMetrics {
  const categories = zeroCategoryCounts();
  const priorities = zeroPriorityCounts();
  const nowTime = Date.parse(args.nowIso);
  let openCases = 0;
  let newCases = 0;
  let slaBreaches = 0;
  let refundRequestsTotal = 0;
  let refundPending = 0;
  let provisioningFailures = 0;
  let emailFailures = 0;
  let webhookFailures = 0;
  const firstResponseHours: number[] = [];
  const resolutionHours: number[] = [];

  for (const supportCase of args.cases) {
    if (supportCase.category in categories) {
      categories[supportCase.category as SupportCaseCategory] += 1;
    }
    if (supportCase.priority in priorities) {
      priorities[supportCase.priority as SupportCasePriority] += 1;
    }
    if (supportCase.status === 'new') newCases += 1;
    if (isOpenStatus(supportCase.status)) {
      openCases += 1;
      const ageHours = Math.max(0, (nowTime - Date.parse(supportCase.created_at)) / (60 * 60 * 1000));
      if (ageHours > 24) slaBreaches += 1;
    }
    if (supportCase.first_response_at) {
      firstResponseHours.push(hoursBetween(supportCase.created_at, supportCase.first_response_at));
    }
    if (supportCase.resolved_at) {
      resolutionHours.push(hoursBetween(supportCase.created_at, supportCase.resolved_at));
    }
    if (supportCase.category === 'refund_request') {
      refundRequestsTotal += 1;
      if (isOpenStatus(supportCase.status)) refundPending += 1;
    }
    if (supportCase.category === 'provisioning_failure') provisioningFailures += 1;
    if (supportCase.category === 'email_failure') emailFailures += 1;
    if (supportCase.category === 'webhook_error') webhookFailures += 1;
  }

  const refundApproved = args.events.filter((event) => event.event_type === 'refund_approved').length;
  const refundDenied = args.events.filter((event) => event.event_type === 'refund_denied').length;
  const refundIssued = args.events.filter(
    (event) => event.event_type === 'refund_manually_issued' || event.event_type === 'refund_issued_manual',
  ).length;
  const accessRescuesSent = args.events.filter((event) => event.event_type === 'access_rescue_sent').length;
  const purchaseCount = args.paidEnrollments + args.teamCohortsCreated;

  return {
    range: args.range,
    startIso: args.startIso,
    generatedAt: args.nowIso,
    queue: {
      openCases,
      newCases,
      slaBreaches,
      medianFirstResponseHours: median(firstResponseHours),
      medianResolutionHours: median(resolutionHours),
    },
    casesByCategory: categories,
    casesByPriority: priorities,
    refundRequests: {
      total: refundRequestsTotal,
      pending: refundPending,
      approved: refundApproved,
      denied: refundDenied,
      manuallyIssued: refundIssued,
    },
    opsHealth: {
      accessRescuesSent,
      provisioningFailures,
      emailFailures,
      webhookFailures,
    },
    launchHealth: {
      paidEnrollments: args.paidEnrollments,
      activeEntitlements: args.activeEntitlements,
      certificatesIssued: args.certificatesIssued,
      teamCohortsCreated: args.teamCohortsCreated,
      supportCasesPer10PaidPurchases:
        purchaseCount > 0 ? Number(((args.cases.length / purchaseCount) * 10).toFixed(1)) : null,
    },
  };
}

async function countRows(
  label: string,
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
): Promise<number> {
  const { count, error } = await query;
  if (error) {
    console.warn(`[support/metrics] ${label} count failed:`, error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getSupportMetrics(
  range: SupportMetricsRange,
  client: ServiceClient = createServiceRoleClient(),
): Promise<SupportMetrics> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const now = new Date();
  const startIso = rangeStart(range, now).toISOString();
  const nowIso = now.toISOString();

  const [caseResult, eventResult, paidEnrollments, activeEntitlements, certificatesIssued, teamCohortsCreated] =
    await Promise.all([
      client
        .from('support_cases')
        .select('id, category, status, priority, created_at, first_response_at, resolved_at')
        .gte('created_at', startIso),
      client.from('support_case_events').select('event_type, created_at').gte('created_at', startIso),
      countRows(
        'course_enrollments',
        client
          .from('course_enrollments')
          .select('id', { count: 'exact', head: true })
          .gte('enrolled_at', startIso),
      ),
      countRows(
        'entitlements',
        client
          .from('entitlements')
          .select('id', { count: 'exact', head: true })
          .eq('active', true),
      ),
      countRows(
        'certificates',
        client
          .from('certificates')
          .select('id', { count: 'exact', head: true })
          .gte('issued_at', startIso),
      ),
      countRows(
        'team_assessment_cohorts',
        client
          .from('team_assessment_cohorts')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startIso),
      ),
    ]);

  if (caseResult.error) throw new Error(caseResult.error.message);
  if (eventResult.error) throw new Error(eventResult.error.message);

  return calculateSupportMetrics({
    range,
    startIso,
    nowIso,
    cases: (caseResult.data ?? []) as CaseMetricRow[],
    events: (eventResult.data ?? []) as EventMetricRow[],
    paidEnrollments,
    activeEntitlements,
    certificatesIssued,
    teamCohortsCreated,
  });
}
