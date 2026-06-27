import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import {
  cleanupSeededUser,
  getCourseE2ESchemaStatus,
  grantFoundationEnrollment,
  grantTrustedDevice,
  markAllModulesComplete,
  seedConfirmedUser,
  setFoundationProgress,
  setOnboardingAnswers,
  type SeededUser,
} from './helpers/seed';
import { loginViaUI } from './helpers/auth';
import {
  FOUNDATION_FINAL_MODULE_NUMBER,
  FOUNDATION_MODULE_COUNT,
} from '@content/courses/foundation-program/course-config';
import type { OnboardingAnswers } from '@/types/course';

/**
 * Foundation course — completer UI review. course-certificate.spec.ts proves the
 * cert API chain (submit -> issue -> PDF -> verify). This spec reviews the
 * rendered POST-LOGIN learning experience a completer actually sees across the
 * completion surfaces — the navigation P0 ("certificate unreachable") that no
 * read-only sweep could exercise.
 *
 * Requires E2E_ALLOW_PRODUCTION_SUPABASE=true.
 */

const ONBOARDING: OnboardingAnswers = {
  uses_m365: 'yes',
  personal_ai_subscriptions: ['ChatGPT'],
  primary_role: 'lending',
};

async function trustAndLogin(
  page: Page,
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
  await loginViaUI(page, user);
}

test.describe('Foundation course — completer UI review', () => {
  test.skip(
    process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true',
    'Requires explicit Supabase seed opt-in: E2E_ALLOW_PRODUCTION_SUPABASE=true',
  );

  test('a completer reaches certificate, submit, and post-assessment without dead-ends', async ({
    page,
    context,
    baseURL,
  }) => {
    const schema = await getCourseE2ESchemaStatus();
    test.skip(!schema.available, `Missing course E2E tables: ${schema.missingTables.join(', ')}`);

    const user = await seedConfirmedUser();
    try {
      await grantFoundationEnrollment(user.id, user.email);
      await setOnboardingAnswers(user.id, ONBOARDING);
      await markAllModulesComplete(user.id);
      await trustAndLogin(page, context, baseURL, user);

      // Course home reflects all-complete progress.
      await page.goto('/courses/foundation/program');
      await expect(page).toHaveURL(/\/courses\/foundation\/program/);
      await expect(
        page.getByText(new RegExp(`${FOUNDATION_MODULE_COUNT}\\s*/\\s*${FOUNDATION_MODULE_COUNT}|${FOUNDATION_MODULE_COUNT} of ${FOUNDATION_MODULE_COUNT}`, 'i')).first(),
      ).toBeVisible();

      // Certificate surface is reachable (the prior P0) — not bounced to login/purchase.
      await page.goto('/courses/foundation/program/certificate');
      await expect(page).toHaveURL(/\/courses\/foundation\/program\/certificate/);
      await expect(
        page.getByText(/certificate|credential|final packet|congratulations|generating/i).first(),
      ).toBeVisible();

      // Final-packet submission surface renders.
      await page.goto('/courses/foundation/program/submit');
      await expect(page).toHaveURL(/\/courses\/foundation\/program\/submit/);
      await expect(page.getByText(/submit|packet|rubric|final/i).first()).toBeVisible();

      // Post-assessment gate (all modules complete) is satisfied.
      await page.goto('/courses/foundation/program/post-assessment');
      await expect(page).toHaveURL(/\/courses\/foundation\/program\/post-assessment/);
      await expect(page.getByText(/growth|measure|assessment|question/i).first()).toBeVisible();
    } finally {
      await cleanupSeededUser(user.id);
    }
  });

  test('the final module renders its tabbed Understand/Build workspace', async ({
    page,
    context,
    baseURL,
  }) => {
    const user = await seedConfirmedUser();
    try {
      await grantFoundationEnrollment(user.id, user.email);
      await setOnboardingAnswers(user.id, ONBOARDING);
      await setFoundationProgress({
        userId: user.id,
        currentModule: FOUNDATION_FINAL_MODULE_NUMBER,
        completedModules: Array.from({ length: FOUNDATION_FINAL_MODULE_NUMBER - 1 }, (_, i) => i + 1),
      });
      await trustAndLogin(page, context, baseURL, user);

      await page.goto(`/courses/foundation/program/${FOUNDATION_FINAL_MODULE_NUMBER}`);
      await expect(page).toHaveURL(new RegExp(`/courses/foundation/program/${FOUNDATION_FINAL_MODULE_NUMBER}`));
      await expect(page.getByRole('tab').first()).toBeVisible();
    } finally {
      await cleanupSeededUser(user.id);
    }
  });
});
