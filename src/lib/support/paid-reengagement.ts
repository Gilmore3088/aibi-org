import { FOUNDATION_FINAL_MODULE_NUMBER } from '@content/courses/foundation-program';
import { emailVariants } from '@/lib/email/canonicalize';
import { normalizeProduct } from '@/lib/products/normalize';
import {
  sendFoundationNotStartedReminder,
  sendFoundationStalledReminder,
  sendInDepthWaitingReminder,
  type ResendResult,
} from '@/lib/resend';
import { generateMagicLink, getCanonicalSiteUrl } from '@/lib/supabase/auth-admin';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

export type PaidReengagementCampaign =
  | 'foundation_not_started'
  | 'foundation_stalled'
  | 'in_depth_waiting';

export const DEFAULT_FOUNDATION_NOT_STARTED_AFTER_DAYS = 3;
export const DEFAULT_FOUNDATION_STALLED_AFTER_DAYS = 7;
export const DEFAULT_IN_DEPTH_WAITING_AFTER_DAYS = 3;
export const DEFAULT_PAID_REENGAGEMENT_LOOKBACK_DAYS = 60;
export const DEFAULT_PAID_REENGAGEMENT_MAX_CHECKS = 100;

const ENROLLMENT_SELECT = [
  'id',
  'email',
  'product',
  'stripe_session_id',
  'user_id',
  'current_module',
  'completed_modules',
  'enrolled_at',
  'created_at',
  'updated_at',
].join(', ');

export interface PaidReengagementEnrollmentRow {
  readonly id: string;
  readonly email: string | null;
  readonly product: string | null;
  readonly stripe_session_id: string | null;
  readonly user_id: string | null;
  readonly current_module: number | null;
  readonly completed_modules: number[] | null;
  readonly enrolled_at: string | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface InDepthProfileRow {
  readonly id?: string | null;
  readonly readiness_version?: string | null;
  readonly readiness_answers?: unknown;
  readonly readiness_max_score?: number | null;
  readonly readiness_at?: string | null;
}

export interface PaidReengagementCandidate {
  readonly campaign: PaidReengagementCampaign;
  readonly enrollment: PaidReengagementEnrollmentRow;
  readonly ageDays: number;
  readonly moduleNumber: number | null;
  readonly lastActivityAt: string;
}

export interface PaidReengagementOptions {
  readonly now?: Date;
  readonly foundationNotStartedAfterDays?: number;
  readonly foundationStalledAfterDays?: number;
  readonly inDepthWaitingAfterDays?: number;
  readonly lookbackDays?: number;
  readonly maxChecks?: number;
}

export interface PaidReengagementSentReminder {
  readonly enrollmentId: string;
  readonly email: string;
  readonly campaign: PaidReengagementCampaign;
  readonly moduleNumber: number | null;
}

export interface PaidReengagementFailedReminder extends PaidReengagementSentReminder {
  readonly reason: string;
}

export interface PaidReengagementResult {
  readonly status: 'ok' | 'skipped';
  readonly skipped?: string;
  readonly checkedEnrollments: number;
  readonly eligibleCandidates: number;
  readonly sentReminders: readonly PaidReengagementSentReminder[];
  readonly failedReminders: readonly PaidReengagementFailedReminder[];
  readonly existingReminders: number;
  readonly skippedCandidates: number;
  readonly options: {
    readonly foundationNotStartedAfterDays: number;
    readonly foundationStalledAfterDays: number;
    readonly inDepthWaitingAfterDays: number;
    readonly lookbackDays: number;
    readonly maxChecks: number;
  };
}

function parsePositiveInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function resolvePaidReengagementOptions(
  input: PaidReengagementOptions = {},
): Required<Omit<PaidReengagementOptions, 'now'>> {
  return {
    foundationNotStartedAfterDays:
      input.foundationNotStartedAfterDays ??
      parsePositiveInteger(
        process.env.PAID_REENGAGEMENT_FOUNDATION_NOT_STARTED_AFTER_DAYS,
        DEFAULT_FOUNDATION_NOT_STARTED_AFTER_DAYS,
        1,
        30,
      ),
    foundationStalledAfterDays:
      input.foundationStalledAfterDays ??
      parsePositiveInteger(
        process.env.PAID_REENGAGEMENT_FOUNDATION_STALLED_AFTER_DAYS,
        DEFAULT_FOUNDATION_STALLED_AFTER_DAYS,
        1,
        60,
      ),
    inDepthWaitingAfterDays:
      input.inDepthWaitingAfterDays ??
      parsePositiveInteger(
        process.env.PAID_REENGAGEMENT_IN_DEPTH_WAITING_AFTER_DAYS,
        DEFAULT_IN_DEPTH_WAITING_AFTER_DAYS,
        1,
        30,
      ),
    lookbackDays:
      input.lookbackDays ??
      parsePositiveInteger(
        process.env.PAID_REENGAGEMENT_LOOKBACK_DAYS,
        DEFAULT_PAID_REENGAGEMENT_LOOKBACK_DAYS,
        1,
        180,
      ),
    maxChecks:
      input.maxChecks ??
      parsePositiveInteger(
        process.env.PAID_REENGAGEMENT_MAX_CHECKS,
        DEFAULT_PAID_REENGAGEMENT_MAX_CHECKS,
        1,
        500,
      ),
  };
}

function timestampMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function daysBetween(startIso: string, now: Date): number {
  const start = timestampMs(startIso);
  if (start === null) return 0;
  return Math.max(0, (now.getTime() - start) / 86_400_000);
}

function completedModules(row: PaidReengagementEnrollmentRow): number[] {
  return Array.isArray(row.completed_modules)
    ? row.completed_modules.filter((entry): entry is number => Number.isInteger(entry))
    : [];
}

function clampModuleNumber(value: number | null | undefined): number {
  if (!Number.isInteger(value)) return 1;
  return Math.min(FOUNDATION_FINAL_MODULE_NUMBER, Math.max(1, value as number));
}

export function evaluatePaidReengagementCandidate(
  enrollment: PaidReengagementEnrollmentRow,
  now: Date,
  options: ReturnType<typeof resolvePaidReengagementOptions>,
): PaidReengagementCandidate | null {
  if (!enrollment.email) return null;
  const product = normalizeProduct(enrollment.product);
  const enrolledAt = enrollment.enrolled_at ?? enrollment.created_at;
  if (!enrolledAt || timestampMs(enrolledAt) === null) return null;

  if (product === 'foundation') {
    const completed = completedModules(enrollment);
    const currentModule = clampModuleNumber(enrollment.current_module);
    const hasStarted = completed.length > 0 || currentModule > 1;
    const completedAllModules = completed.length >= FOUNDATION_FINAL_MODULE_NUMBER;

    if (!hasStarted) {
      const ageDays = daysBetween(enrolledAt, now);
      if (ageDays >= options.foundationNotStartedAfterDays) {
        return {
          campaign: 'foundation_not_started',
          enrollment,
          ageDays,
          moduleNumber: 1,
          lastActivityAt: enrolledAt,
        };
      }
      return null;
    }

    if (completedAllModules) return null;

    const lastActivityAt = enrollment.updated_at ?? enrolledAt;
    if (timestampMs(lastActivityAt) === null) return null;
    const ageDays = daysBetween(lastActivityAt, now);
    if (ageDays >= options.foundationStalledAfterDays) {
      return {
        campaign: 'foundation_stalled',
        enrollment,
        ageDays,
        moduleNumber: currentModule,
        lastActivityAt,
      };
    }
    return null;
  }

  if (enrollment.product === 'in-depth-assessment') {
    const ageDays = daysBetween(enrolledAt, now);
    if (ageDays >= options.inDepthWaitingAfterDays) {
      return {
        campaign: 'in_depth_waiting',
        enrollment,
        ageDays,
        moduleNumber: null,
        lastActivityAt: enrolledAt,
      };
    }
  }

  return null;
}

export function isCompletedInDepthProfile(row: InDepthProfileRow): boolean {
  if (row.readiness_version === 'v4') return true;
  if (Array.isArray(row.readiness_answers) && row.readiness_answers.length === 48) return true;
  return row.readiness_max_score === 100 || row.readiness_max_score === 192;
}

export function paidReengagementDedupeKey(candidate: PaidReengagementCandidate): string {
  if (candidate.campaign === 'foundation_stalled') {
    return `paid-reengagement:${candidate.campaign}:${candidate.enrollment.id}:m${candidate.moduleNumber ?? 1}`;
  }
  return `paid-reengagement:${candidate.campaign}:${candidate.enrollment.id}`;
}

async function fetchCandidateEnrollments(
  client: ServiceClient,
  now: Date,
  options: ReturnType<typeof resolvePaidReengagementOptions>,
): Promise<PaidReengagementEnrollmentRow[]> {
  const earliestIso = new Date(now.getTime() - options.lookbackDays * 86_400_000).toISOString();
  const minAgeDays = Math.min(
    options.foundationNotStartedAfterDays,
    options.foundationStalledAfterDays,
    options.inDepthWaitingAfterDays,
  );
  const latestIso = new Date(now.getTime() - minAgeDays * 86_400_000).toISOString();
  const { data, error } = await client
    .from('course_enrollments')
    .select(ENROLLMENT_SELECT)
    .in('product', ['foundation', 'aibi-p', 'in-depth-assessment'])
    .gte('enrolled_at', earliestIso)
    .lte('enrolled_at', latestIso)
    .order('enrolled_at', { ascending: false })
    .limit(options.maxChecks);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as PaidReengagementEnrollmentRow[];
}

async function fetchExistingSentDedupeKeys(
  client: ServiceClient,
  dedupeKeys: readonly string[],
): Promise<Set<string>> {
  if (dedupeKeys.length === 0) return new Set();
  const { data, error } = await client
    .from('paid_reengagement_events')
    .select('dedupe_key')
    .eq('status', 'sent')
    .in('dedupe_key', dedupeKeys);

  if (error) {
    throw new Error(error.message);
  }

  return new Set(
    ((data ?? []) as Array<{ dedupe_key: string | null }>)
      .map((row) => row.dedupe_key)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  );
}

async function hasCompletedInDepth(
  client: ServiceClient,
  enrollment: PaidReengagementEnrollmentRow,
): Promise<boolean> {
  const clauses: string[] = [];
  if (enrollment.user_id) clauses.push(`user_id.eq.${enrollment.user_id}`);
  if (enrollment.email) {
    clauses.push(...emailVariants(enrollment.email).map((email) => `email.ilike.${email}`));
  }
  if (clauses.length === 0) return false;

  const { data, error } = await client
    .from('user_profiles')
    .select('id, readiness_version, readiness_answers, readiness_max_score, readiness_at')
    .or(clauses.join(','))
    .order('readiness_at', { ascending: false, nullsFirst: false })
    .limit(10);

  if (error) {
    console.warn('[paid-reengagement] in-depth completion lookup failed:', error.message);
    return false;
  }

  return ((data ?? []) as InDepthProfileRow[]).some(isCompletedInDepthProfile);
}

function resendFailureReason(result: ResendResult): string | null {
  if ('ok' in result) return result.ok ? null : result.error;
  return result.reason;
}

function reminderPath(candidate: PaidReengagementCandidate): string {
  if (candidate.campaign === 'in_depth_waiting') return '/assessment/in-depth/take';
  if (candidate.campaign === 'foundation_stalled') {
    return `/courses/foundation/program/${candidate.moduleNumber ?? 1}`;
  }
  return '/courses/foundation/program';
}

async function buildActionUrl(email: string, path: string): Promise<string> {
  const fallback = new URL(path, getCanonicalSiteUrl()).toString();
  try {
    return (await generateMagicLink(email, path)) ?? fallback;
  } catch (err) {
    console.warn('[paid-reengagement] magic link skipped:', err);
    return fallback;
  }
}

async function sendReminder(candidate: PaidReengagementCandidate): Promise<ResendResult> {
  const email = candidate.enrollment.email?.trim();
  if (!email) return { ok: false, error: 'missing-email' };
  const actionUrl = await buildActionUrl(email, reminderPath(candidate));

  if (candidate.campaign === 'foundation_not_started') {
    return sendFoundationNotStartedReminder({ email, actionUrl });
  }
  if (candidate.campaign === 'foundation_stalled') {
    return sendFoundationStalledReminder({
      email,
      actionUrl,
      moduleNumber: candidate.moduleNumber ?? 1,
    });
  }
  return sendInDepthWaitingReminder({ email, actionUrl });
}

async function insertReminderEvent(
  client: ServiceClient,
  candidate: PaidReengagementCandidate,
  status: 'sent' | 'failed',
  dedupeKey: string,
  now: Date,
  failureReason?: string,
): Promise<void> {
  const enrollment = candidate.enrollment;
  const { error } = await client.from('paid_reengagement_events').insert({
    campaign: candidate.campaign,
    enrollment_id: enrollment.id,
    user_id: enrollment.user_id,
    email: enrollment.email ?? '',
    product: enrollment.product ?? 'unknown',
    status,
    dedupe_key: dedupeKey,
    failure_reason: failureReason ?? null,
    sent_at: status === 'sent' ? now.toISOString() : null,
    metadata: {
      stripeSessionId: enrollment.stripe_session_id,
      currentModule: enrollment.current_module,
      completedModules: completedModules(enrollment),
      moduleNumber: candidate.moduleNumber,
      ageDays: Number(candidate.ageDays.toFixed(2)),
      lastActivityAt: candidate.lastActivityAt,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function runPaidReengagementMonitor(
  input: PaidReengagementOptions = {},
  providedClient?: ServiceClient,
): Promise<PaidReengagementResult> {
  const options = resolvePaidReengagementOptions(input);
  if (!isSupabaseConfigured()) {
    return {
      status: 'skipped',
      skipped: 'supabase-not-configured',
      checkedEnrollments: 0,
      eligibleCandidates: 0,
      sentReminders: [],
      failedReminders: [],
      existingReminders: 0,
      skippedCandidates: 0,
      options,
    };
  }

  const client = providedClient ?? createServiceRoleClient();
  const now = input.now ?? new Date();
  const enrollments = await fetchCandidateEnrollments(client, now, options);
  const evaluated = enrollments
    .map((enrollment) => evaluatePaidReengagementCandidate(enrollment, now, options))
    .filter((candidate): candidate is PaidReengagementCandidate => candidate !== null);

  const candidates: PaidReengagementCandidate[] = [];
  for (const candidate of evaluated) {
    if (candidate.campaign === 'in_depth_waiting' && await hasCompletedInDepth(client, candidate.enrollment)) {
      continue;
    }
    candidates.push(candidate);
  }

  const dedupeKeys = candidates.map(paidReengagementDedupeKey);
  const existingKeys = await fetchExistingSentDedupeKeys(client, dedupeKeys);
  const sentReminders: PaidReengagementSentReminder[] = [];
  const failedReminders: PaidReengagementFailedReminder[] = [];
  let skippedCandidates = 0;

  for (const candidate of candidates) {
    const dedupeKey = paidReengagementDedupeKey(candidate);
    if (existingKeys.has(dedupeKey)) {
      skippedCandidates += 1;
      continue;
    }

    const email = candidate.enrollment.email?.trim() ?? '';
    const base = {
      enrollmentId: candidate.enrollment.id,
      email,
      campaign: candidate.campaign,
      moduleNumber: candidate.moduleNumber,
    };

    const result = await sendReminder(candidate);
    const failure = resendFailureReason(result);
    if (failure) {
      failedReminders.push({ ...base, reason: failure });
      await insertReminderEvent(client, candidate, 'failed', dedupeKey, now, failure);
      continue;
    }

    await insertReminderEvent(client, candidate, 'sent', dedupeKey, now);
    sentReminders.push(base);
  }

  return {
    status: 'ok',
    checkedEnrollments: enrollments.length,
    eligibleCandidates: candidates.length,
    sentReminders,
    failedReminders,
    existingReminders: existingKeys.size,
    skippedCandidates,
    options,
  };
}
