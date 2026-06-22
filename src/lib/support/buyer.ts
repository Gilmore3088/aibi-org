import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { evaluateRefundEligibility, type RefundEligibility } from './refunds';
import { normalizeBuyerEmail } from './types';
import { supportCaseStripeDashboardUrl } from './cases';

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

export interface BuyerEnrollment {
  readonly id: string;
  readonly email: string;
  readonly product: string;
  readonly stripeSessionId: string | null;
  readonly userId: string | null;
  readonly completedModules: readonly number[];
  readonly currentModule: number;
  readonly enrolledAt: string;
  readonly createdAt: string;
}

export interface BuyerEntitlement {
  readonly id: string;
  readonly userId: string;
  readonly product: string;
  readonly tier: string | null;
  readonly source: string;
  readonly sourceRef: string | null;
  readonly active: boolean;
  readonly grantedAt: string;
  readonly revokedAt: string | null;
  readonly expiresAt: string | null;
}

export interface BuyerProfile {
  readonly id: string;
  readonly email: string;
  readonly userId: string | null;
  readonly readinessVersion: string | null;
  readonly readinessScore: number | null;
  readonly readinessTierLabel: string | null;
  readonly readinessAt: string | null;
  readonly updatedAt: string | null;
}

export interface BuyerTeamCohort {
  readonly id: string;
  readonly institutionName: string;
  readonly buyerEmail: string;
  readonly buyerUserId: string | null;
  readonly seatsPurchased: number;
  readonly stripeSessionId: string | null;
  readonly status: string;
  readonly reportUnlockedAt: string | null;
  readonly createdAt: string;
  readonly completedResponses: number;
}

export interface BuyerPurchaseRecord {
  readonly kind: 'enrollment' | 'team_assessment';
  readonly id: string;
  readonly product: string;
  readonly purchasedAt: string;
  readonly stripeSessionId: string | null;
  readonly stripeDashboardUrl: string | null;
  readonly refundEligibility: RefundEligibility;
}

export interface BuyerSnapshot {
  readonly email: string;
  readonly userIds: readonly string[];
  readonly profiles: readonly BuyerProfile[];
  readonly enrollments: readonly BuyerEnrollment[];
  readonly entitlements: readonly BuyerEntitlement[];
  readonly certificates: readonly {
    readonly id: string;
    readonly enrollmentId: string;
    readonly certificateId: string;
    readonly issuedAt: string;
  }[];
  readonly activityResponseCount: number;
  readonly practiceRepCount: number;
  readonly savedPromptCount: number;
  readonly artifactCount: number;
  readonly teamCohorts: readonly BuyerTeamCohort[];
  readonly refundedSessionIds: readonly string[];
  readonly purchases: readonly BuyerPurchaseRecord[];
  readonly errors: readonly string[];
}

interface EnrollmentRow {
  id: string;
  email: string;
  product: string;
  stripe_session_id: string | null;
  user_id: string | null;
  completed_modules: number[] | null;
  current_module: number | null;
  enrolled_at: string | null;
  created_at: string;
}

interface EntitlementRow {
  id: string;
  user_id: string;
  product: string;
  tier: string | null;
  source: string;
  source_ref: string | null;
  active: boolean;
  granted_at: string;
  revoked_at: string | null;
  expires_at: string | null;
}

interface ProfileRow {
  id: string;
  email: string;
  user_id: string | null;
  readiness_version: string | null;
  readiness_score: number | null;
  readiness_tier_label: string | null;
  readiness_at: string | null;
  updated_at: string | null;
}

interface CertificateRow {
  id: string;
  enrollment_id: string;
  certificate_id: string;
  issued_at: string;
}

interface ActivityRow {
  id: string;
  enrollment_id: string;
  module_number: number | null;
}

interface TeamCohortRow {
  id: string;
  institution_name: string;
  buyer_email: string;
  buyer_user_id: string | null;
  seats_purchased: number;
  stripe_session_id: string | null;
  status: string;
  report_unlocked_at: string | null;
  created_at: string;
}

interface CountRow {
  id: string;
}

async function guarded<T>(
  label: string,
  fn: () => PromiseLike<{ data: T | null; error: { message: string } | null }>,
  errors: string[],
  fallback: T,
): Promise<T> {
  const result = await fn();
  if (result.error) {
    errors.push(`${label}: ${result.error.message}`);
    return fallback;
  }
  return result.data ?? fallback;
}

function uniqueStrings(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export async function getBuyerSnapshot(
  emailInput: string,
  stripeSessionId?: string | null,
  client: ServiceClient = createServiceRoleClient(),
): Promise<BuyerSnapshot> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const email = normalizeBuyerEmail(emailInput);
  const errors: string[] = [];
  const enrollmentQuery = client
    .from('course_enrollments')
    .select('id, email, product, stripe_session_id, user_id, completed_modules, current_module, enrolled_at, created_at')
    .or(
      [
        `email.eq.${email}`,
        stripeSessionId ? `stripe_session_id.eq.${stripeSessionId}` : '',
      ]
        .filter(Boolean)
        .join(','),
    );

  const cohortQuery = client
    .from('team_assessment_cohorts')
    .select('id, institution_name, buyer_email, buyer_user_id, seats_purchased, stripe_session_id, status, report_unlocked_at, created_at')
    .or(
      [
        `buyer_email.eq.${email}`,
        stripeSessionId ? `stripe_session_id.eq.${stripeSessionId}` : '',
      ]
        .filter(Boolean)
        .join(','),
    );

  const [enrollmentRows, profileRows, cohortRows] = await Promise.all([
    guarded('course_enrollments', () => enrollmentQuery, errors, [] as EnrollmentRow[]),
    guarded(
      'user_profiles',
      () =>
        client
          .from('user_profiles')
          .select('id, email, user_id, readiness_version, readiness_score, readiness_tier_label, readiness_at, updated_at')
          .eq('email', email),
      errors,
      [] as ProfileRow[],
    ),
    guarded('team_assessment_cohorts', () => cohortQuery, errors, [] as TeamCohortRow[]),
  ]);

  const enrollments = (enrollmentRows as EnrollmentRow[]).map((row) => ({
    id: row.id,
    email: row.email,
    product: row.product,
    stripeSessionId: row.stripe_session_id,
    userId: row.user_id,
    completedModules: row.completed_modules ?? [],
    currentModule: row.current_module ?? 1,
    enrolledAt: row.enrolled_at ?? row.created_at,
    createdAt: row.created_at,
  }));

  const profiles = (profileRows as ProfileRow[]).map((row) => ({
    id: row.id,
    email: row.email,
    userId: row.user_id,
    readinessVersion: row.readiness_version,
    readinessScore: row.readiness_score,
    readinessTierLabel: row.readiness_tier_label,
    readinessAt: row.readiness_at,
    updatedAt: row.updated_at,
  }));

  const baseCohorts = cohortRows as TeamCohortRow[];
  const userIds = uniqueStrings([
    ...enrollments.map((row) => row.userId),
    ...profiles.map((row) => row.userId),
    ...baseCohorts.map((row) => row.buyer_user_id),
  ]);
  const enrollmentIds = enrollments.map((row) => row.id);
  const cohortIds = baseCohorts.map((row) => row.id);
  const stripeSessionIds = uniqueStrings([
    ...enrollments.map((row) => row.stripeSessionId),
    ...baseCohorts.map((row) => row.stripe_session_id),
    stripeSessionId,
  ]);

  const [
    entitlementRows,
    certificateRows,
    activityRows,
    practiceRows,
    promptRows,
    artifactRows,
    teamResponseRows,
    refundedRows,
  ] = await Promise.all([
    userIds.length
      ? guarded(
          'entitlements',
          () =>
            client
              .from('entitlements')
              .select('id, user_id, product, tier, source, source_ref, active, granted_at, revoked_at, expires_at')
              .in('user_id', userIds),
          errors,
          [] as EntitlementRow[],
        )
      : Promise.resolve([] as EntitlementRow[]),
    enrollmentIds.length
      ? guarded(
          'certificates',
          () =>
            client
              .from('certificates')
              .select('id, enrollment_id, certificate_id, issued_at')
              .in('enrollment_id', enrollmentIds),
          errors,
          [] as CertificateRow[],
        )
      : Promise.resolve([] as CertificateRow[]),
    enrollmentIds.length
      ? guarded(
          'activity_responses',
          () =>
            client
              .from('activity_responses')
              .select('id, enrollment_id, module_number')
              .in('enrollment_id', enrollmentIds),
          errors,
          [] as ActivityRow[],
        )
      : Promise.resolve([] as ActivityRow[]),
    userIds.length
      ? guarded(
          'practice_rep_completions',
          () => client.from('practice_rep_completions').select('id').in('user_id', userIds),
          errors,
          [] as CountRow[],
        )
      : Promise.resolve([] as CountRow[]),
    userIds.length
      ? guarded(
          'saved_prompts',
          () => client.from('saved_prompts').select('id').in('user_id', userIds),
          errors,
          [] as CountRow[],
        )
      : Promise.resolve([] as CountRow[]),
    userIds.length
      ? guarded(
          'user_artifacts',
          () => client.from('user_artifacts').select('id').in('user_id', userIds),
          errors,
          [] as CountRow[],
        )
      : Promise.resolve([] as CountRow[]),
    cohortIds.length
      ? guarded(
          'team_assessment_responses',
          () => client.from('team_assessment_responses').select('id, cohort_id').in('cohort_id', cohortIds),
          errors,
          [] as Array<CountRow & { cohort_id: string }>,
        )
      : Promise.resolve([] as Array<CountRow & { cohort_id: string }>),
    stripeSessionIds.length
      ? guarded(
          'refunded_checkout_sessions',
          () =>
            client
              .from('refunded_checkout_sessions')
              .select('stripe_session_id')
              .in('stripe_session_id', stripeSessionIds),
          errors,
          [] as Array<{ stripe_session_id: string }>,
        )
      : Promise.resolve([] as Array<{ stripe_session_id: string }>),
  ]);

  const certificates = (certificateRows as CertificateRow[]).map((row) => ({
    id: row.id,
    enrollmentId: row.enrollment_id,
    certificateId: row.certificate_id,
    issuedAt: row.issued_at,
  }));
  const activityResponses = activityRows as ActivityRow[];
  const refundedSessionIds = (refundedRows as Array<{ stripe_session_id: string }>).map(
    (row) => row.stripe_session_id,
  );
  const teamResponses = teamResponseRows as Array<CountRow & { cohort_id: string }>;
  const teamCohorts = baseCohorts.map((row) => ({
    id: row.id,
    institutionName: row.institution_name,
    buyerEmail: row.buyer_email,
    buyerUserId: row.buyer_user_id,
    seatsPurchased: row.seats_purchased,
    stripeSessionId: row.stripe_session_id,
    status: row.status,
    reportUnlockedAt: row.report_unlocked_at,
    createdAt: row.created_at,
    completedResponses: teamResponses.filter((response) => response.cohort_id === row.id).length,
  }));
  const entitlements = (entitlementRows as EntitlementRow[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    product: row.product,
    tier: row.tier ?? null,
    source: row.source,
    sourceRef: row.source_ref,
    active: row.active,
    grantedAt: row.granted_at,
    revokedAt: row.revoked_at,
    expiresAt: row.expires_at,
  }));

  const purchases: BuyerPurchaseRecord[] = [
    ...enrollments.map((enrollment) => {
      const enrollmentCertificates = certificates.filter(
        (certificate) => certificate.enrollmentId === enrollment.id,
      );
      const assessmentSubmitted = profiles.some(
        (profile) =>
          profile.userId === enrollment.userId &&
          profile.readinessVersion === 'v4' &&
          Boolean(profile.readinessAt),
      );
      return {
        kind: 'enrollment' as const,
        id: enrollment.id,
        product: enrollment.product,
        purchasedAt: enrollment.enrolledAt,
        stripeSessionId: enrollment.stripeSessionId,
        stripeDashboardUrl: supportCaseStripeDashboardUrl(enrollment.stripeSessionId),
        refundEligibility: evaluateRefundEligibility({
          product: enrollment.product,
          purchasedAt: enrollment.enrolledAt,
          completedModules: enrollment.completedModules,
          certificateCount: enrollmentCertificates.length,
          assessmentSubmitted,
          alreadyRefunded: enrollment.stripeSessionId
            ? refundedSessionIds.includes(enrollment.stripeSessionId)
            : false,
        }),
      };
    }),
    ...teamCohorts.map((cohort) => ({
      kind: 'team_assessment' as const,
      id: cohort.id,
      product: 'team-assessment',
      purchasedAt: cohort.createdAt,
      stripeSessionId: cohort.stripeSessionId,
      stripeDashboardUrl: supportCaseStripeDashboardUrl(cohort.stripeSessionId),
      refundEligibility: evaluateRefundEligibility({
        product: 'team-assessment',
        purchasedAt: cohort.createdAt,
        alreadyRefunded:
          cohort.status === 'refunded' ||
          (cohort.stripeSessionId ? refundedSessionIds.includes(cohort.stripeSessionId) : false),
      }),
    })),
  ].sort((a, b) => Date.parse(b.purchasedAt) - Date.parse(a.purchasedAt));

  return {
    email,
    userIds,
    profiles,
    enrollments,
    entitlements,
    certificates,
    activityResponseCount: activityResponses.length,
    practiceRepCount: (practiceRows as CountRow[]).length,
    savedPromptCount: (promptRows as CountRow[]).length,
    artifactCount: (artifactRows as CountRow[]).length,
    teamCohorts,
    refundedSessionIds,
    purchases,
    errors,
  };
}

export async function findBuyerEmailByStripeSession(
  stripeSessionId: string,
  client: ServiceClient = createServiceRoleClient(),
): Promise<string | null> {
  if (!stripeSessionId.trim()) return null;

  const enrollment = await client
    .from('course_enrollments')
    .select('email')
    .eq('stripe_session_id', stripeSessionId)
    .maybeSingle();
  if (!enrollment.error) {
    const email = (enrollment.data as { email?: string } | null)?.email;
    if (email) return email;
  }

  const cohort = await client
    .from('team_assessment_cohorts')
    .select('buyer_email')
    .eq('stripe_session_id', stripeSessionId)
    .maybeSingle();
  if (!cohort.error) {
    const email = (cohort.data as { buyer_email?: string } | null)?.buyer_email;
    if (email) return email;
  }

  return null;
}
