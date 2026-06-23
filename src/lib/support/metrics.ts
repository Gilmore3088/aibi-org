import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { filterMetricRowsByEmail, isExcludedMetricEmail } from '@/lib/admin/metric-exclusions';
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
    readonly paidEnrollmentsInRange: number;
    readonly activeEntitlements: number;
    readonly certificatesIssued: number;
    readonly teamCohortsCreated: number;
    readonly activeTeamCohorts: number;
    readonly supportCasesPer10PaidPurchases: number | null;
  };
  readonly dataQuality: {
    readonly excludedSupportCases: number;
    readonly excludedPaidEnrollments: number;
    readonly excludedTeamCohorts: number;
  };
}

interface CaseMetricRow {
  id: string;
  buyer_email: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
}

interface EventMetricRow {
  case_id: string;
  event_type: string;
  created_at: string;
}

interface EnrollmentMetricRow {
  id: string;
  email: string;
  user_id: string | null;
  enrolled_at: string | null;
  created_at: string;
}

interface EntitlementMetricRow {
  id: string;
  user_id: string;
  active: boolean;
}

interface CertificateMetricRow {
  id: string;
  enrollment_id: string;
  issued_at: string;
}

interface TeamCohortMetricRow {
  id: string;
  buyer_email: string;
  status: string;
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
  readonly cases?: readonly CaseMetricRow[];
  readonly allCases?: readonly CaseMetricRow[];
  readonly rangeCases?: readonly CaseMetricRow[];
  readonly events: readonly EventMetricRow[];
  readonly paidEnrollments: number;
  readonly paidEnrollmentsInRange?: number;
  readonly activeEntitlements: number;
  readonly certificatesIssued: number;
  readonly teamCohortsCreated: number;
  readonly activeTeamCohorts?: number;
  readonly excludedSupportCases?: number;
  readonly excludedPaidEnrollments?: number;
  readonly excludedTeamCohorts?: number;
}): SupportMetrics {
  const categories = zeroCategoryCounts();
  const priorities = zeroPriorityCounts();
  const nowTime = Date.parse(args.nowIso);
  const allCases = args.allCases ?? args.cases ?? [];
  const rangeCases = args.rangeCases ?? args.cases ?? [];
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

  for (const supportCase of rangeCases) {
    if (supportCase.category in categories) {
      categories[supportCase.category as SupportCaseCategory] += 1;
    }
    if (supportCase.priority in priorities) {
      priorities[supportCase.priority as SupportCasePriority] += 1;
    }
    if (supportCase.first_response_at) {
      firstResponseHours.push(hoursBetween(supportCase.created_at, supportCase.first_response_at));
    }
    if (supportCase.resolved_at) {
      resolutionHours.push(hoursBetween(supportCase.created_at, supportCase.resolved_at));
    }
    if (supportCase.category === 'refund_request') {
      refundRequestsTotal += 1;
    }
    if (supportCase.category === 'provisioning_failure') provisioningFailures += 1;
    if (supportCase.category === 'email_failure') emailFailures += 1;
    if (supportCase.category === 'webhook_error') webhookFailures += 1;
  }

  for (const supportCase of allCases) {
    if (supportCase.status === 'new') newCases += 1;
    if (isOpenStatus(supportCase.status)) {
      openCases += 1;
      const ageHours = Math.max(0, (nowTime - Date.parse(supportCase.created_at)) / (60 * 60 * 1000));
      if (ageHours > 24) slaBreaches += 1;
    }
    if (supportCase.category === 'refund_request' && isOpenStatus(supportCase.status)) {
      refundPending += 1;
    }
  }

  const refundApproved = args.events.filter((event) => event.event_type === 'refund_approved').length;
  const refundDenied = args.events.filter((event) => event.event_type === 'refund_denied').length;
  const refundIssued = args.events.filter(
    (event) => event.event_type === 'refund_manually_issued' || event.event_type === 'refund_issued_manual',
  ).length;
  const accessRescuesSent = args.events.filter((event) => event.event_type === 'access_rescue_sent').length;
  const rangePurchaseCount = (args.paidEnrollmentsInRange ?? args.paidEnrollments) + args.teamCohortsCreated;

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
      paidEnrollmentsInRange: args.paidEnrollmentsInRange ?? args.paidEnrollments,
      activeEntitlements: args.activeEntitlements,
      certificatesIssued: args.certificatesIssued,
      teamCohortsCreated: args.teamCohortsCreated,
      activeTeamCohorts: args.activeTeamCohorts ?? args.teamCohortsCreated,
      supportCasesPer10PaidPurchases:
        rangePurchaseCount > 0 ? Number(((rangeCases.length / rangePurchaseCount) * 10).toFixed(1)) : null,
    },
    dataQuality: {
      excludedSupportCases: args.excludedSupportCases ?? 0,
      excludedPaidEnrollments: args.excludedPaidEnrollments ?? 0,
      excludedTeamCohorts: args.excludedTeamCohorts ?? 0,
    },
  };
}

async function selectRows<T>(
  label: string,
  query: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const { data, error } = await query;
  if (error) {
    console.warn(`[support/metrics] ${label} read failed:`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

function inRange(iso: string | null | undefined, startIso: string): boolean {
  return !!iso && Date.parse(iso) >= Date.parse(startIso);
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

  const [caseResult, eventRows, enrollmentRows, entitlementRows, certificateRows, teamCohortRows] = await Promise.all([
    client
      .from('support_cases')
      .select('id, buyer_email, category, status, priority, created_at, first_response_at, resolved_at'),
    selectRows<EventMetricRow>(
      'support_case_events',
      client.from('support_case_events').select('case_id, event_type, created_at').gte('created_at', startIso),
    ),
    selectRows<EnrollmentMetricRow>(
      'course_enrollments',
      client.from('course_enrollments').select('id, email, user_id, enrolled_at, created_at'),
    ),
    selectRows<EntitlementMetricRow>(
      'entitlements',
      client.from('entitlements').select('id, user_id, active').eq('active', true),
    ),
    selectRows<CertificateMetricRow>(
      'certificates',
      client.from('certificates').select('id, enrollment_id, issued_at').gte('issued_at', startIso),
    ),
    selectRows<TeamCohortMetricRow>(
      'team_assessment_cohorts',
      client.from('team_assessment_cohorts').select('id, buyer_email, status, created_at'),
    ),
  ]);

  if (caseResult.error) throw new Error(caseResult.error.message);

  const rawCases = (caseResult.data ?? []) as CaseMetricRow[];
  const cases = filterMetricRowsByEmail(rawCases, (row) => row.buyer_email);
  const caseIds = new Set(cases.map((row) => row.id));
  const allCases = cases;
  const rangeCases = cases.filter((row) => inRange(row.created_at, startIso));
  const events = eventRows.filter((row) => caseIds.has(row.case_id));

  const enrollments = filterMetricRowsByEmail(enrollmentRows, (row) => row.email);
  const includedEnrollmentIds = new Set(enrollments.map((row) => row.id));
  const excludedUserIds = new Set(
    enrollmentRows.filter((row) => isExcludedMetricEmail(row.email) && row.user_id).map((row) => row.user_id!),
  );
  const activeEntitlements = entitlementRows.filter((row) => !excludedUserIds.has(row.user_id)).length;

  const teamCohorts = filterMetricRowsByEmail(teamCohortRows, (row) => row.buyer_email);
  const paidEnrollmentsInRange = enrollments.filter((row) => inRange(row.enrolled_at ?? row.created_at, startIso)).length;
  const certificatesIssued = certificateRows.filter((row) => includedEnrollmentIds.has(row.enrollment_id)).length;
  const teamCohortsCreated = teamCohorts.filter((row) => inRange(row.created_at, startIso)).length;
  const activeTeamCohorts = teamCohorts.filter((row) => row.status !== 'refunded').length;

  return calculateSupportMetrics({
    range,
    startIso,
    nowIso,
    allCases,
    rangeCases,
    events,
    paidEnrollments: enrollments.length,
    paidEnrollmentsInRange,
    activeEntitlements,
    certificatesIssued,
    teamCohortsCreated,
    activeTeamCohorts,
    excludedSupportCases: rawCases.length - cases.length,
    excludedPaidEnrollments: enrollmentRows.length - enrollments.length,
    excludedTeamCohorts: teamCohortRows.length - teamCohorts.length,
  });
}
