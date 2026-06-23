import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import {
  TRUSTED_DEVICE_COOKIE,
  TRUSTED_DEVICE_TTL_DAYS,
  generateOpaqueToken,
  hashToken,
} from '../../src/lib/auth/trusted-device';
import {
  FOUNDATION_FINAL_MODULE_NUMBER,
  FOUNDATION_MODULE_COUNT,
} from '../../content/courses/foundation-program/course-config';
import type { OnboardingAnswers } from '../../src/types/course';

// There is no staging Supabase project. By design — for a pre-launch
// site with no real traffic, a parallel project adds operational cost
// (migrations, env vars, key rotation) for very little isolation gain.
// Instead, we run e2e against production Supabase using the `.test` TLD
// (RFC 6761, guaranteed never to reach a real inbox) and clean up after.
//
// The guard below blocks accidental runs that didn't opt in to this
// pattern — set E2E_ALLOW_PRODUCTION_SUPABASE=true to acknowledge.

function getServiceRoleClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      'E2E seed helpers require SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. ' +
        'Set them in .env.local or CI secrets before running auth tests.',
    );
  }
  if (process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true') {
    throw new Error(
      'E2E seeding requires E2E_ALLOW_PRODUCTION_SUPABASE=true. This is a ' +
        'safety acknowledgment that test users (e2e+*@aibankinginstitute.test) ' +
        'will be created in the real Supabase project. Set the flag and rerun.',
    );
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface SeededUser {
  id: string;
  email: string;
  password: string;
}

export interface CourseE2ESchemaStatus {
  readonly available: boolean;
  readonly missingTables: readonly string[];
  readonly errors: readonly string[];
}

/**
 * Lightweight preflight for auth-gated course tests. This avoids creating a
 * seeded auth user when the configured Supabase project is missing the public
 * course tables needed to enroll, submit work, and save Toolbox artifacts.
 */
export async function getCourseE2ESchemaStatus(): Promise<CourseE2ESchemaStatus> {
  const supabase = getServiceRoleClient();
  const requiredTables = [
    'course_enrollments',
    'entitlements',
    'activity_responses',
    'toolbox_skills',
    'user_artifacts',
  ] as const;
  const missingTables: string[] = [];
  const errors: string[] = [];

  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (!error) continue;
    missingTables.push(table);
    errors.push(`${table}: ${error.message}`);
  }

  return {
    available: missingTables.length === 0,
    missingTables,
    errors,
  };
}

/**
 * Create a confirmed auth user via the admin API. Emails follow the
 * `e2e+<short>@aibankinginstitute.test` pattern so they're trivially
 * cleanable by `LIKE 'e2e+%@aibankinginstitute.test'`. The `.test` TLD
 * (RFC 6761) guarantees no real inbox is touched.
 */
export async function seedConfirmedUser(): Promise<SeededUser> {
  const supabase = getServiceRoleClient();
  const short = randomBytes(4).toString('hex');
  const email = `e2e+${short}@aibankinginstitute.test`;
  const password = `e2e-${short}-${randomBytes(6).toString('hex')}`;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { seeded_by: 'e2e' },
  });
  if (error || !data.user) {
    throw new Error(`seedConfirmedUser failed: ${error?.message ?? 'no user returned'}`);
  }
  return { id: data.user.id, email, password };
}

/**
 * Create a user but leave email unconfirmed — useful for testing the
 * "please confirm your email" path.
 */
export async function seedUnconfirmedUser(): Promise<SeededUser> {
  const supabase = getServiceRoleClient();
  const short = randomBytes(4).toString('hex');
  const email = `e2e+${short}@aibankinginstitute.test`;
  const password = `e2e-${short}-${randomBytes(6).toString('hex')}`;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { seeded_by: 'e2e' },
  });
  if (error || !data.user) {
    throw new Error(`seedUnconfirmedUser failed: ${error?.message ?? 'no user returned'}`);
  }
  return { id: data.user.id, email, password };
}

async function ensureEnrollmentEntitlement({
  supabase,
  userId,
  product,
  enrollmentId,
  tier,
}: {
  readonly supabase: SupabaseClient;
  readonly userId: string;
  readonly product: string;
  readonly enrollmentId: string;
  readonly tier: 'starter' | 'full';
}): Promise<void> {
  const { data: existing, error: existingError } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('product', product)
    .eq('source', 'course_enrollment')
    .eq('source_ref', enrollmentId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`ensureEnrollmentEntitlement lookup failed: ${existingError.message}`);
  }

  if (existing) return;

  const { error } = await supabase.from('entitlements').insert({
    user_id: userId,
    product,
    source: 'course_enrollment',
    source_ref: enrollmentId,
    tier,
    active: true,
    granted_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`ensureEnrollmentEntitlement insert failed: ${error.message}`);
  }
}

/**
 * Insert a foundation course enrollment for a seeded user. Use this
 * after seedConfirmedUser when a test needs an enrolled learner.
 */
export async function grantFoundationEnrollment(userId: string, email: string): Promise<void> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({
      email,
      product: 'foundation',
      user_id: userId,
      stripe_session_id: `e2e_seed_${randomBytes(6).toString('hex')}`,
    })
    .select('id')
    .single();
  if (error || !data) {
    throw new Error(`grantFoundationEnrollment failed: ${error?.message ?? 'no enrollment returned'}`);
  }

  await ensureEnrollmentEntitlement({
    supabase,
    userId,
    product: 'foundation',
    enrollmentId: (data as { id: string }).id,
    tier: 'full',
  });
}

/**
 * Set onboarding answers on a seeded enrollment. The layout's ONBD-02 gate
 * redirects to /onboarding when onboarding_answers IS NULL, so call this
 * after grantFoundationEnrollment for any test that needs to land inside
 * the course shell without an onboarding detour.
 */
export async function setOnboardingAnswers(
  userId: string,
  answers: OnboardingAnswers,
): Promise<void> {
  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from('course_enrollments')
    .update({ onboarding_answers: answers })
    .eq('user_id', userId);
  if (error) {
    throw new Error(`setOnboardingAnswers failed: ${error.message}`);
  }
}

export interface FoundationEnrollmentState {
  readonly id: string;
  readonly current_module: number;
  readonly completed_modules: readonly number[];
}

export type SeedReadinessKind = 'free' | 'in-depth';

export interface SeedArtifactState {
  readonly artifactId: string;
  readonly status: 'available' | 'in-progress' | 'completed' | 'locked';
  readonly sourceActivityId?: string | null;
}

export async function getFoundationEnrollment(
  userId: string,
): Promise<FoundationEnrollmentState> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('id, current_module, completed_modules')
    .eq('user_id', userId)
    .eq('product', 'foundation')
    .single();
  if (error || !data) {
    throw new Error(`getFoundationEnrollment failed: ${error?.message ?? 'no enrollment found'}`);
  }
  return data as FoundationEnrollmentState;
}

export async function setFoundationProgress({
  userId,
  currentModule,
  completedModules,
}: {
  readonly userId: string;
  readonly currentModule: number;
  readonly completedModules: readonly number[];
}): Promise<void> {
  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from('course_enrollments')
    .update({
      current_module: currentModule,
      completed_modules: [...completedModules],
    })
    .eq('user_id', userId)
    .eq('product', 'foundation');
  if (error) {
    throw new Error(`setFoundationProgress failed: ${error.message}`);
  }
}

/**
 * Seed a user_profiles readiness row for dashboard persona tests. The
 * dashboard detects In-Depth completion by 48 answers or maxScore=192, so this
 * helper intentionally uses those persisted facts rather than any test-only
 * flags.
 */
export async function seedReadinessProfile({
  userId,
  email,
  kind,
  role = 'other',
}: {
  readonly userId: string;
  readonly email: string;
  readonly kind: SeedReadinessKind;
  readonly role?: string;
}): Promise<string> {
  const supabase = getServiceRoleClient();
  const isInDepth = kind === 'in-depth';
  const answers = Array.from({ length: isInDepth ? 48 : 12 }, (_, index) =>
    isInDepth ? ((index % 4) + 1) : ((index % 4) + 1),
  );
  const score = isInDepth ? 144 : 34;
  const maxScore = isInDepth ? 192 : 48;
  const tierId = isInDepth ? 'building-momentum' : 'ready-to-scale';
  const tierLabel = isInDepth ? 'Building Momentum' : 'Ready to Scale';

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        email,
        user_id: userId,
        readiness_score: score,
        readiness_max_score: maxScore,
        readiness_tier_id: tierId,
        readiness_tier_label: tierLabel,
        readiness_answers: answers,
        readiness_at: new Date().toISOString(),
        readiness_dimension_breakdown: {
          governance: { score: Math.round(score * 0.22), maxScore: Math.round(maxScore * 0.25), label: 'Governance' },
          data: { score: Math.round(score * 0.2), maxScore: Math.round(maxScore * 0.25), label: 'Data handling' },
          review: { score: Math.round(score * 0.25), maxScore: Math.round(maxScore * 0.25), label: 'Human review' },
          workflow: { score: Math.round(score * 0.23), maxScore: Math.round(maxScore * 0.25), label: 'Workflow discipline' },
        },
        role,
      },
      { onConflict: 'email' },
    )
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`seedReadinessProfile failed: ${error?.message ?? 'no profile returned'}`);
  }
  return (data as { id: string }).id;
}

/**
 * Grant paid In-Depth access. We insert the enrollment row and then ensure the
 * entitlement exists directly, so tests do not depend on the database trigger
 * being present in every configured environment.
 */
export async function grantInDepthAccess(userId: string, email: string): Promise<string> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({
      email,
      product: 'in-depth-assessment',
      user_id: userId,
      stripe_session_id: `e2e_indepth_${randomBytes(6).toString('hex')}`,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`grantInDepthAccess failed: ${error?.message ?? 'no enrollment returned'}`);
  }

  const enrollmentId = (data as { id: string }).id;
  await ensureEnrollmentEntitlement({
    supabase,
    userId,
    product: 'in-depth-assessment',
    enrollmentId,
    tier: 'starter',
  });

  return enrollmentId;
}

export async function seedPracticeCompletions(
  userId: string,
  repIds: readonly string[],
): Promise<void> {
  if (repIds.length === 0) return;
  const supabase = getServiceRoleClient();
  const { error } = await supabase.from('practice_rep_completions').upsert(
    repIds.map((repId) => ({
      user_id: userId,
      course_id: 'foundation',
      rep_id: repId,
      response: { seeded_by: 'e2e' },
    })),
    { onConflict: 'user_id,course_id,rep_id' },
  );
  if (error) {
    throw new Error(`seedPracticeCompletions failed: ${error.message}`);
  }
}

export async function seedSavedPrompts(
  userId: string,
  promptIds: readonly string[],
): Promise<void> {
  if (promptIds.length === 0) return;
  const supabase = getServiceRoleClient();
  const { error } = await supabase.from('saved_prompts').upsert(
    promptIds.map((promptId) => ({
      user_id: userId,
      course_id: 'foundation',
      prompt_id: promptId,
    })),
    { onConflict: 'user_id,course_id,prompt_id' },
  );
  if (error) {
    throw new Error(`seedSavedPrompts failed: ${error.message}`);
  }
}

export async function seedUserArtifacts(
  userId: string,
  artifacts: readonly SeedArtifactState[],
): Promise<void> {
  if (artifacts.length === 0) return;
  const supabase = getServiceRoleClient();
  const { error } = await supabase.from('user_artifacts').upsert(
    artifacts.map((artifact) => ({
      user_id: userId,
      course_id: 'foundation',
      artifact_id: artifact.artifactId,
      status: artifact.status,
      source_activity_id: artifact.sourceActivityId ?? null,
      metadata: { seeded_by: 'e2e' },
    })),
    { onConflict: 'user_id,course_id,artifact_id' },
  );
  if (error) {
    throw new Error(`seedUserArtifacts failed: ${error.message}`);
  }
}

/**
 * Issue a trusted-device row directly and return the plaintext cookie token
 * the caller should set on the Playwright browser context. Mirrors
 * `src/lib/auth/trusted-device.ts#issueTrustedDevice` without going through
 * the email-confirmation round-trip.
 */
export async function grantTrustedDevice(
  userId: string,
): Promise<{ cookieName: string; cookieToken: string; expiresAtIso: string }> {
  const supabase = getServiceRoleClient();
  const token = generateOpaqueToken();
  const cookieTokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TRUSTED_DEVICE_TTL_DAYS * 24 * 60 * 60 * 1000);
  const { error } = await supabase.from('trusted_devices').insert({
    user_id: userId,
    cookie_token_hash: cookieTokenHash,
    expires_at: expiresAt.toISOString(),
    ip_hash_first: null,
    user_agent: 'playwright-cx-audit',
    label: 'e2e cx-audit',
  });
  if (error) {
    throw new Error(`grantTrustedDevice failed: ${error.message}`);
  }
  return {
    cookieName: TRUSTED_DEVICE_COOKIE,
    cookieToken: token,
    expiresAtIso: expiresAt.toISOString(),
  };
}

/**
 * Mark a learner's foundation enrollment as fully complete (all configured modules
 * in completed_modules). Used by the CX audit so the harness can visit
 * every module without being blocked by canAccessModule().
 */
export async function markAllModulesComplete(userId: string): Promise<void> {
  const supabase = getServiceRoleClient();
  const allModules = Array.from({ length: FOUNDATION_MODULE_COUNT }, (_, i) => i + 1);
  const { error } = await supabase
    .from('course_enrollments')
    .update({ completed_modules: allModules, current_module: FOUNDATION_FINAL_MODULE_NUMBER })
    .eq('user_id', userId);
  if (error) {
    throw new Error(`markAllModulesComplete failed: ${error.message}`);
  }
}

/**
 * One-shot: seed a confirmed user, enroll in foundation, set onboarding,
 * mark all modules complete (so every module is accessible for audit),
 * issue a trusted-device row, and return everything Playwright needs to
 * land inside the course shell on first navigation.
 */
export async function seedFoundationLearner(
  answers: OnboardingAnswers,
): Promise<SeededUser & { trustedDevice: { cookieName: string; cookieToken: string; expiresAtIso: string } }> {
  const user = await seedConfirmedUser();
  await grantFoundationEnrollment(user.id, user.email);
  await setOnboardingAnswers(user.id, answers);
  await markAllModulesComplete(user.id);
  const trustedDevice = await grantTrustedDevice(user.id);
  return { ...user, trustedDevice };
}

/**
 * Delete every user with the `e2e+...@aibankinginstitute.test` pattern.
 * Cascades to user_profiles, course_enrollments, entitlements via FK.
 * Call from an afterAll() hook or a periodic cleanup job.
 */
export async function cleanupAllSeededUsers(): Promise<{ deleted: number }> {
  const supabase = getServiceRoleClient();
  const { data: users, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) {
    throw new Error(`cleanupAllSeededUsers list failed: ${listError.message}`);
  }
  const seeded = users.users.filter(
    (u) => u.email?.startsWith('e2e+') && u.email.endsWith('@aibankinginstitute.test'),
  );
  for (const u of seeded) {
    await supabase.auth.admin.deleteUser(u.id);
  }
  return { deleted: seeded.length };
}

/**
 * Delete a single seeded user by id. Cheaper than listAll when a test
 * already has the id.
 */
export async function cleanupSeededUser(userId: string): Promise<void> {
  const supabase = getServiceRoleClient();
  await supabase.auth.admin.deleteUser(userId);
}
