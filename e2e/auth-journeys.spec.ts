import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import {
  cleanupSeededUser,
  grantFoundationEnrollment,
  grantTrustedDevice,
  seedConfirmedUser,
  setFoundationProgress,
  setOnboardingAnswers,
  type SeededUser,
} from './helpers/seed';
import { isConfirmDevicePending, loginViaUI } from './helpers/auth';
import type { OnboardingAnswers } from '@/types/course';

/**
 * Post-login auth JOURNEYS with seeded accounts — the gap the logged-out
 * auth specs (auth.spec.ts, auth-prod.spec.ts, trusted-device-gate.spec.ts)
 * cannot reach. These complement, not duplicate, those:
 *   - trusted-device login lands inside a gated deep-link (?next=)
 *   - enrolled-but-not-onboarded is bounced to /onboarding (ONBD-02 gate)
 *   - untrusted-device login is held at confirm-device-pending and gated APIs
 *     reject with untrusted_device
 *   - password-reset request path is wired (email-token leg stays opt-in)
 *
 * Requires E2E_ALLOW_PRODUCTION_SUPABASE=true (seeds .test users, cleaned up).
 */

const ONBOARDING: OnboardingAnswers = {
  uses_m365: 'yes',
  personal_ai_subscriptions: ['ChatGPT'],
  primary_role: 'operations',
};

async function addTrustedCookie(
  context: BrowserContext,
  baseURL: string | undefined,
  user: SeededUser,
): Promise<void> {
  const trust = await grantTrustedDevice(user.id);
  const url = new URL(baseURL ?? 'http://localhost:3000');
  await context.addCookies([
    {
      name: trust.cookieName,
      value: trust.cookieToken,
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      secure: url.protocol === 'https:',
      sameSite: 'Lax',
    },
  ]);
}

test.describe('post-login auth journeys (seeded)', () => {
  test.skip(
    process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true',
    'Requires explicit Supabase seed opt-in: E2E_ALLOW_PRODUCTION_SUPABASE=true',
  );

  test('trusted-device login follows ?next= into a gated course module', async ({
    page,
    context,
    baseURL,
  }) => {
    const user = await seedConfirmedUser();
    try {
      await grantFoundationEnrollment(user.id, user.email);
      await setOnboardingAnswers(user.id, ONBOARDING);
      await setFoundationProgress({ userId: user.id, currentModule: 4, completedModules: [1, 2, 3] });
      await addTrustedCookie(context, baseURL, user);

      // Deep-link to a gated module; login should honor next= and land there.
      await page.goto('/auth/login?next=%2Fcourses%2Ffoundation%2Fprogram%2F3');
      const form = page.locator('form').filter({ has: page.locator('input[type="password"]') });
      await form.locator('input[name="email"]').fill(user.email);
      await form.locator('input[name="password"]').fill(user.password);
      await form.getByRole('button', { name: /sign in|log in/i }).click();

      await page.waitForURL(/\/courses\/foundation\/program\/3/, { timeout: 15_000 });
      await expect(page).toHaveURL(/\/courses\/foundation\/program\/3/);
    } finally {
      await cleanupSeededUser(user.id);
    }
  });

  test('enrolled-but-not-onboarded learner is routed to /onboarding (ONBD-02)', async ({
    page,
    context,
    baseURL,
  }) => {
    const user = await seedConfirmedUser();
    try {
      // Enroll WITHOUT onboarding answers — the course layout must bounce to /onboarding.
      await grantFoundationEnrollment(user.id, user.email);
      await addTrustedCookie(context, baseURL, user);
      await loginViaUI(page, user);

      await page.goto('/courses/foundation/program');
      await expect(page).toHaveURL(/\/onboarding/);
    } finally {
      await cleanupSeededUser(user.id);
    }
  });

  test('untrusted-device login is held at confirm-device-pending and gated APIs reject', async ({
    page,
  }) => {
    const user = await seedConfirmedUser();
    try {
      // No trusted-device cookie injected -> the device is unknown.
      await loginViaUI(page, user);
      expect(isConfirmDevicePending(page)).toBe(true);

      const res = await page.request.get('/api/dashboard/learner');
      expect(res.status()).toBe(401);
      expect(await res.json()).toMatchObject({ reason: 'untrusted_device' });
    } finally {
      await cleanupSeededUser(user.id);
    }
  });

  test('password-reset request is accepted and reset-password screen renders', async ({ page }) => {
    const user = await seedConfirmedUser();
    try {
      // Drive the real forgot-password form. The .test inbox is never read
      // (RFC 6761) so the email send is inert; we assert the request is
      // acknowledged rather than erroring.
      await page.goto('/auth/forgot-password');
      await page.getByLabel(/email/i).first().fill(user.email);
      await page.getByRole('button', { name: /reset|send|continue|email/i }).first().click();
      await expect(
        page.getByText(/check your (inbox|email)|if an account|sent|on its way/i).first(),
      ).toBeVisible({ timeout: 10_000 });

      // The token-consuming leg needs a real inbox (opt-in). We assert the
      // set-password destination renders its form so the recovery landing is wired.
      await page.goto('/auth/reset-password');
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
    } finally {
      await cleanupSeededUser(user.id);
    }
  });
});
