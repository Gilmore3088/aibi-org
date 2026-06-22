import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import {
  cleanupSeededUser,
  getFoundationEnrollment,
  getCourseE2ESchemaStatus,
  grantFoundationEnrollment,
  grantTrustedDevice,
  seedConfirmedUser,
  setFoundationProgress,
  setOnboardingAnswers,
  type SeededUser,
} from './helpers/seed';
import { loginViaUI } from './helpers/auth';
import type { OnboardingAnswers } from '@/types/course';

const ONBOARDING: OnboardingAnswers = {
  uses_m365: 'yes',
  personal_ai_subscriptions: ['ChatGPT'],
  primary_role: 'operations',
};

async function seedEnrolledLearnerAtModule(
  moduleNumber: number,
): Promise<SeededUser> {
  const user = await seedConfirmedUser();
  await grantFoundationEnrollment(user.id, user.email);
  await setOnboardingAnswers(user.id, ONBOARDING);
  await setFoundationProgress({
    userId: user.id,
    currentModule: moduleNumber,
    completedModules: Array.from({ length: moduleNumber - 1 }, (_, index) => index + 1),
  });
  return user;
}

async function trustAndLogin({
  page,
  context,
  baseURL,
  user,
}: {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly baseURL: string | undefined;
  readonly user: SeededUser;
}): Promise<void> {
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

async function completeCurrentModuleInBrowser(
  page: Page,
  enrollmentId: string,
  moduleNumber: number,
): Promise<{ status: number; body: unknown }> {
  return page.evaluate(
    async ({ id, module }) => {
      const res = await fetch('/api/courses/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId: id, moduleNumber: module }),
      });
      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      return { status: res.status, body };
    },
    { id: enrollmentId, module: moduleNumber },
  );
}

test.describe('enrolled Foundation course flow', () => {
  test.skip(
    process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true',
    'Requires explicit Supabase seed opt-in: E2E_ALLOW_PRODUCTION_SUPABASE=true',
  );

  test('logged-out module routes stay gated when preview bypass is not active', async ({ page }) => {
    await page.goto('/courses/foundation/program/15');
    await expect(page).toHaveURL(/\/auth\/login|\/courses\/foundation\/program\/purchase/);
    await expect(page.getByRole('heading', { name: /Human Review Gate Card/i })).toHaveCount(0);
  });

  test('enrolled learner submits a practical module artifact, saves it to Toolbox, and advances', async ({
    page,
    context,
    baseURL,
  }) => {
    const schemaStatus = await getCourseE2ESchemaStatus();
    test.skip(
      !schemaStatus.available,
      `Configured Supabase is missing course E2E tables: ${schemaStatus.missingTables.join(', ')}`,
    );

    const user = await seedEnrolledLearnerAtModule(15);
    try {
      await trustAndLogin({ page, context, baseURL, user });
      const enrollment = await getFoundationEnrollment(user.id);

      await page.goto('/courses/foundation/program/15#st-submit');
      await expect(page).toHaveURL(/\/courses\/foundation\/program\/15/);
      await expect(page.getByRole('heading', { level: 1, name: 'Human Review Gate Card' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Build' })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('heading', { name: 'Build: Human Review Gate Card' })).toBeVisible();

      const skipAttempt = await completeCurrentModuleInBrowser(page, enrollment.id, 16);
      expect(skipAttempt.status).toBe(400);

      await page.getByRole('button', { name: 'Save artifact step' }).click();
      await expect(page.getByText('What work pauses at the gate? is required.')).toBeVisible();

      await page.getByLabel('What work pauses at the gate?').fill(
        'AI drafts the first internal procedure update, but the workflow pauses before any staff-facing distribution.',
      );
      await page.getByLabel('Who can approve, edit, block, or escalate?').fill(
        'The branch operations manager can edit, block, approve, or escalate the draft before staff receive it.',
      );
      await page.getByLabel('What forces escalation?').fill(
        'Stop if the draft includes unsupported policy claims, customer-specific facts, or missing source material.',
      );
      await page.getByLabel('What must be true before work resumes?').fill(
        'The manager approves the corrected draft, source gaps are resolved, and blocked details are removed.',
      );
      await page.getByRole('textbox', { name: 'Review note' }).fill(
        'I verified the gate happens before impact, named the reviewer authority, and defined the resume condition.',
      );
      await page.getByRole('textbox', { name: 'First real use' }).fill(
        'I will use this review gate on the next AI-assisted branch procedure update before manager review.',
      );
      await page.getByRole('radio', { name: 'Reusable' }).click();
      await page.getByRole('button', { name: 'Save artifact step' }).click();

      const success = page.getByLabel('Activity submitted successfully');
      await expect(success).toBeVisible();
      await expect(success.getByText('Judgment saved')).toBeVisible();
      await expect(success.getByText('Saved to Toolbox')).toBeVisible({ timeout: 15_000 });
      await expect(success.getByText('Saved with artifact')).toBeVisible();

      const completion = await completeCurrentModuleInBrowser(page, enrollment.id, 15);
      expect(completion.status).toBe(200);

      const updatedEnrollment = await getFoundationEnrollment(user.id);
      expect(updatedEnrollment.current_module).toBe(16);
      expect(updatedEnrollment.completed_modules).toContain(15);

      await page.goto('/courses/foundation/program/16');
      await expect(page.getByRole('heading', { name: 'AI Evidence Note', exact: true })).toBeVisible();
      await expect(page.getByRole('tablist', { name: 'Module sections' }).getByRole('tab', { name: 'Understand' })).toBeVisible();
    } finally {
      await cleanupSeededUser(user.id);
    }
  });

  test('enrolled learner can save the final packet summary to Toolbox', async ({
    page,
    context,
    baseURL,
  }) => {
    const schemaStatus = await getCourseE2ESchemaStatus();
    test.skip(
      !schemaStatus.available,
      `Configured Supabase is missing course E2E tables: ${schemaStatus.missingTables.join(', ')}`,
    );

    const user = await seedEnrolledLearnerAtModule(18);
    try {
      await trustAndLogin({ page, context, baseURL, user });

      await page.goto('/courses/foundation/program/18#st-submit');
      await expect(page).toHaveURL(/\/courses\/foundation\/program\/18/);
      await expect(page.getByRole('tab', { name: 'Build' })).toHaveAttribute('aria-selected', 'true');
      const buildPanel = page.getByRole('tabpanel', { name: 'Build' });
      await expect(buildPanel.getByRole('heading', { name: 'Build Foundation Packet Summary', exact: true })).toBeVisible();
      await expect(buildPanel.getByRole('heading', { name: 'Build: Foundation Packet Summary' })).toBeVisible();

      await page.getByLabel('What did you build?').fill(
        'A manager-ready Foundation packet summary that points to my reusable prompt, workflow kit, review evidence, and safe-use boundary.',
      );
      await page.getByLabel('What did you check before saving it?').fill(
        'I removed sensitive details, confirmed each artifact has a human review note, and named where the work can and cannot be reused.',
      );
      await page.getByLabel('Where will you reuse this at work?').fill(
        'I will use this packet summary in my next manager conversation about safe AI use in my daily banking role.',
      );
      await page.getByRole('textbox', { name: 'Review note' }).fill(
        'The final packet shows safe prompting, verification, human review, and evidence without relying on confidential data.',
      );
      await page.getByRole('textbox', { name: 'First real use' }).fill(
        'I will bring the packet summary to a manager conversation before reusing the workflow with my team.',
      );
      await page.getByRole('radio', { name: 'Reusable' }).click();
      await page.getByRole('button', { name: 'Save artifact step' }).click();

      const success = page.getByLabel('Activity submitted successfully');
      await expect(success).toBeVisible();
      await expect(success.getByText('Judgment saved')).toBeVisible();
      await expect(success.getByText('Saved to Toolbox')).toBeVisible({ timeout: 15_000 });
      await expect(success.getByText('Saved with artifact')).toBeVisible();

      const enrollment = await getFoundationEnrollment(user.id);
      const completion = await completeCurrentModuleInBrowser(page, enrollment.id, 18);
      expect(completion.status).toBe(200);

      const updatedEnrollment = await getFoundationEnrollment(user.id);
      expect(updatedEnrollment.current_module).toBe(18);
      expect(updatedEnrollment.completed_modules).toContain(18);
    } finally {
      await cleanupSeededUser(user.id);
    }
  });
});
