import type { User } from '@supabase/supabase-js';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { createSupportCase } from '@/lib/support/cases';
import { normalizeBuyerEmail } from '@/lib/support/types';

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

export const DEFAULT_STRANDED_BUYER_ALERT_AFTER_HOURS = 4;
export const DEFAULT_STRANDED_BUYER_LOOKBACK_DAYS = 14;
export const DEFAULT_STRANDED_BUYER_MAX_CHECKS = 100;

const ENROLLMENT_SELECT = [
  'id',
  'email',
  'product',
  'stripe_session_id',
  'user_id',
  'enrolled_at',
  'created_at',
].join(', ');

export interface StrandedBuyerEnrollmentRow {
  readonly id: string;
  readonly email: string | null;
  readonly product: string | null;
  readonly stripe_session_id: string | null;
  readonly user_id: string | null;
  readonly enrolled_at: string | null;
  readonly created_at: string | null;
}

export interface StrandedBuyerCandidate {
  readonly enrollment: StrandedBuyerEnrollmentRow;
  readonly reason: 'never_signed_in' | 'auth_user_missing';
  readonly enrolledAt: string;
  readonly ageHours: number;
  readonly authCreatedAt: string | null;
}

export interface StrandedBuyerMonitorOptions {
  readonly now?: Date;
  readonly alertAfterHours?: number;
  readonly lookbackDays?: number;
  readonly maxChecks?: number;
}

export interface StrandedBuyerCreatedCase {
  readonly caseId: string;
  readonly enrollmentId: string;
  readonly buyerEmail: string;
  readonly product: string | null;
  readonly stripeSessionId: string | null;
}

export interface StrandedBuyerMonitorResult {
  readonly status: 'ok' | 'skipped';
  readonly skipped?: string;
  readonly checkedEnrollments: number;
  readonly strandedCandidates: number;
  readonly createdCases: readonly StrandedBuyerCreatedCase[];
  readonly existingCases: number;
  readonly skippedCandidates: number;
  readonly options: {
    readonly alertAfterHours: number;
    readonly lookbackDays: number;
    readonly maxChecks: number;
  };
}

function parsePositiveInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function resolveStrandedBuyerOptions(
  input: StrandedBuyerMonitorOptions = {},
): Required<Pick<StrandedBuyerMonitorOptions, 'alertAfterHours' | 'lookbackDays' | 'maxChecks'>> {
  return {
    alertAfterHours:
      input.alertAfterHours ??
      parsePositiveInteger(
        process.env.STRANDED_BUYER_ALERT_AFTER_HOURS,
        DEFAULT_STRANDED_BUYER_ALERT_AFTER_HOURS,
        1,
        168,
      ),
    lookbackDays:
      input.lookbackDays ??
      parsePositiveInteger(
        process.env.STRANDED_BUYER_LOOKBACK_DAYS,
        DEFAULT_STRANDED_BUYER_LOOKBACK_DAYS,
        1,
        90,
      ),
    maxChecks:
      input.maxChecks ??
      parsePositiveInteger(
        process.env.STRANDED_BUYER_MAX_CHECKS,
        DEFAULT_STRANDED_BUYER_MAX_CHECKS,
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

function hoursBetween(startIso: string, now: Date): number {
  const start = timestampMs(startIso);
  if (start === null) return 0;
  return Math.max(0, (now.getTime() - start) / 3_600_000);
}

export function strandedBuyerDedupeKey(enrollmentId: string): string {
  return `stranded-buyer:${enrollmentId}`;
}

export function evaluateStrandedBuyerCandidate(
  enrollment: StrandedBuyerEnrollmentRow,
  authUser: Pick<User, 'created_at' | 'last_sign_in_at'> | null,
  now: Date,
  alertAfterHours: number,
): StrandedBuyerCandidate | null {
  if (!enrollment.user_id || !enrollment.email) return null;
  const enrolledAt = enrollment.enrolled_at ?? enrollment.created_at;
  if (!enrolledAt || timestampMs(enrolledAt) === null) return null;

  const ageHours = hoursBetween(enrolledAt, now);
  if (ageHours < alertAfterHours) return null;

  if (!authUser) {
    return {
      enrollment,
      reason: 'auth_user_missing',
      enrolledAt,
      ageHours,
      authCreatedAt: null,
    };
  }

  if (authUser.last_sign_in_at) return null;

  return {
    enrollment,
    reason: 'never_signed_in',
    enrolledAt,
    ageHours,
    authCreatedAt: authUser.created_at ?? null,
  };
}

async function fetchCandidateEnrollments(
  client: ServiceClient,
  now: Date,
  options: ReturnType<typeof resolveStrandedBuyerOptions>,
): Promise<StrandedBuyerEnrollmentRow[]> {
  const latestIso = new Date(now.getTime() - options.alertAfterHours * 3_600_000).toISOString();
  const earliestIso = new Date(now.getTime() - options.lookbackDays * 86_400_000).toISOString();
  const { data, error } = await client
    .from('course_enrollments')
    .select(ENROLLMENT_SELECT)
    .not('user_id', 'is', null)
    .gte('enrolled_at', earliestIso)
    .lte('enrolled_at', latestIso)
    .order('enrolled_at', { ascending: false })
    .limit(options.maxChecks);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as StrandedBuyerEnrollmentRow[];
}

async function fetchExistingDedupeKeys(
  client: ServiceClient,
  dedupeKeys: readonly string[],
): Promise<Set<string>> {
  if (dedupeKeys.length === 0) return new Set();
  const { data, error } = await client
    .from('support_cases')
    .select('dedupe_key')
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

async function fetchAuthUser(client: ServiceClient, userId: string): Promise<User | null> {
  const { data, error } = await client.auth.admin.getUserById(userId);
  if (error) {
    console.warn('[support/stranded-buyers] auth user lookup failed', { userId, error: error.message });
    return null;
  }
  return data.user ?? null;
}

export async function runStrandedBuyerMonitor(
  input: StrandedBuyerMonitorOptions = {},
  providedClient?: ServiceClient,
): Promise<StrandedBuyerMonitorResult> {
  const options = resolveStrandedBuyerOptions(input);
  if (!isSupabaseConfigured()) {
    return {
      status: 'skipped',
      skipped: 'supabase-not-configured',
      checkedEnrollments: 0,
      strandedCandidates: 0,
      createdCases: [],
      existingCases: 0,
      skippedCandidates: 0,
      options,
    };
  }

  const client = providedClient ?? createServiceRoleClient();
  const now = input.now ?? new Date();
  const enrollments = await fetchCandidateEnrollments(client, now, options);
  const candidates: StrandedBuyerCandidate[] = [];

  for (const enrollment of enrollments) {
    if (!enrollment.user_id) continue;
    const authUser = await fetchAuthUser(client, enrollment.user_id);
    const candidate = evaluateStrandedBuyerCandidate(
      enrollment,
      authUser,
      now,
      options.alertAfterHours,
    );
    if (candidate) candidates.push(candidate);
  }

  const dedupeKeys = candidates.map((candidate) => strandedBuyerDedupeKey(candidate.enrollment.id));
  const existingDedupeKeys = await fetchExistingDedupeKeys(client, dedupeKeys);
  const createdCases: StrandedBuyerCreatedCase[] = [];
  let skippedCandidates = 0;

  for (const candidate of candidates) {
    const enrollment = candidate.enrollment;
    const dedupeKey = strandedBuyerDedupeKey(enrollment.id);
    if (existingDedupeKeys.has(dedupeKey)) {
      skippedCandidates += 1;
      continue;
    }

    const buyerEmail = normalizeBuyerEmail(enrollment.email ?? '');
    const supportCase = await createSupportCase(
      {
        buyerEmail,
        subject: 'Buyer has not signed in after purchase',
        summary:
          candidate.reason === 'auth_user_missing'
            ? 'A paid enrollment points at an auth user that could not be found. Confirm access and resend a sign-in link.'
            : 'A paid enrollment is older than the alert window and the buyer has never completed a sign-in. Confirm access and resend a sign-in link.',
        category: 'access',
        status: 'new',
        priority: 'high',
        source: 'reconciliation',
        product: enrollment.product,
        stripeSessionId: enrollment.stripe_session_id,
        enrollmentId: enrollment.id,
        userId: enrollment.user_id,
        dedupeKey,
        metadata: {
          monitor: 'stranded-buyers',
          reason: candidate.reason,
          ageHours: Number(candidate.ageHours.toFixed(2)),
          alertAfterHours: options.alertAfterHours,
          enrolledAt: candidate.enrolledAt,
          authCreatedAt: candidate.authCreatedAt,
        },
      },
      client,
    );

    createdCases.push({
      caseId: supportCase.id,
      enrollmentId: enrollment.id,
      buyerEmail,
      product: enrollment.product,
      stripeSessionId: enrollment.stripe_session_id,
    });
  }

  return {
    status: 'ok',
    checkedEnrollments: enrollments.length,
    strandedCandidates: candidates.length,
    createdCases,
    existingCases: existingDedupeKeys.size,
    skippedCandidates,
    options,
  };
}
