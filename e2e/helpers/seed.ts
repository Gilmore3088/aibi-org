import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import {
  TRUSTED_DEVICE_COOKIE,
  TRUSTED_DEVICE_TTL_DAYS,
  generateOpaqueToken,
  hashToken,
} from '../../src/lib/auth/trusted-device';
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

/**
 * Insert a foundation course enrollment for a seeded user. Use this
 * after seedConfirmedUser when a test needs an enrolled learner.
 */
export async function grantFoundationEnrollment(userId: string, email: string): Promise<void> {
  const supabase = getServiceRoleClient();
  const { error } = await supabase.from('course_enrollments').insert({
    email,
    product: 'foundation',
    user_id: userId,
    stripe_session_id: `e2e_seed_${randomBytes(6).toString('hex')}`,
  });
  if (error) {
    throw new Error(`grantFoundationEnrollment failed: ${error.message}`);
  }
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
 * Mark a learner's foundation enrollment as fully complete (modules 1-12
 * in completed_modules). Used by the CX audit so the harness can visit
 * every module without being blocked by canAccessModule().
 */
export async function markAllModulesComplete(userId: string): Promise<void> {
  const supabase = getServiceRoleClient();
  const allModules = Array.from({ length: 12 }, (_, i) => i + 1);
  const { error } = await supabase
    .from('course_enrollments')
    .update({ completed_modules: allModules, current_module: 12 })
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
