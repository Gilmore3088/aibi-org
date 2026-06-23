import { test, expect, type BrowserContext, type Page, type APIRequestContext } from '@playwright/test';
import { loginViaUI } from './helpers/auth';
import {
  cleanupSeededUser,
  grantFoundationEnrollment,
  grantInDepthAccess,
  grantTrustedDevice,
  seedConfirmedUser,
  seedPracticeCompletions,
  seedReadinessProfile,
  seedSavedPrompts,
  seedUserArtifacts,
  setFoundationProgress,
  setOnboardingAnswers,
  type SeededUser,
} from './helpers/seed';
import type { OnboardingAnswers } from '@/types/course';

const ONBOARDING_BY_ROLE: Record<string, OnboardingAnswers> = {
  account: {
    uses_m365: 'not_sure',
    personal_ai_subscriptions: [],
    primary_role: 'operations',
  },
  free: {
    uses_m365: 'yes',
    personal_ai_subscriptions: ['ChatGPT'],
    primary_role: 'compliance',
  },
  indepth: {
    uses_m365: 'yes',
    personal_ai_subscriptions: ['Claude'],
    primary_role: 'executive',
  },
  completed: {
    uses_m365: 'yes',
    personal_ai_subscriptions: ['ChatGPT', 'Claude'],
    primary_role: 'marketing',
  },
  foundation: {
    uses_m365: 'yes',
    personal_ai_subscriptions: ['ChatGPT'],
    primary_role: 'lending',
  },
};

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
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/);
}

async function expectDashboardChrome(page: Page): Promise<void> {
  await expect(page.getByRole('navigation', { name: 'My account' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Your work/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Free resources/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /All resources/i })).toHaveAttribute('href', '/resources');
}

async function expectDashboardResourceLinksHealthy(
  page: Page,
  request: APIRequestContext,
): Promise<void> {
  const hrefs = await page
    .locator('a[href^="/resources"], a[href^="/api/resources"], a[href^="/playbooks"]')
    .evaluateAll((links) =>
      Array.from(new Set(links.map((link) => link.getAttribute('href')).filter(Boolean))),
    );

  expect(hrefs.length).toBeGreaterThan(0);

  for (const href of hrefs) {
    const res = await request.get(href!);
    const status = res.status();
    expect(
      status < 500 || status === 503,
      `${href} returned ${status}; dashboard resource links must not crash`,
    ).toBe(true);
    if (!href!.startsWith('/api/')) {
      expect(status, `${href} should not be a missing page route`).not.toBe(404);
    }
  }
}

test.describe('dashboard lifecycle personas', () => {
  test('logged-out visitors are redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login.*next=.*dashboard/);
  });

  test.describe('seeded personas', () => {
    test.skip(
      process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true',
      'Requires explicit Supabase seed opt-in: E2E_ALLOW_PRODUCTION_SUPABASE=true',
    );

  test('persona 1: account-only user sees first-step dashboard', async ({
    page,
    context,
    baseURL,
    request,
  }) => {
    const user = await seedConfirmedUser();
    try {
      await trustAndLogin({ page, context, baseURL, user });
      await expectDashboardChrome(page);
      await expect(page.getByRole('heading', { name: /Welcome in/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Take the free assessment/i }).first()).toBeVisible();
      await expect(page.getByText(/Your path · 1 of 7 complete/i)).toBeVisible();
      await expect(page.getByText(/Not enrolled/i)).toBeVisible();
      await expect(page.getByText(/unlock with paid access/i)).toBeVisible();
      await expectDashboardResourceLinksHealthy(page, request);
    } finally {
      await cleanupSeededUser(user.id);
    }
  });

  test('persona 2: free assessment user sees remote readiness snapshot', async ({
    page,
    context,
    baseURL,
  }) => {
    const user = await seedConfirmedUser();
    try {
      await seedReadinessProfile({
        userId: user.id,
        email: user.email,
        kind: 'free',
        role: 'compliance-risk',
      });
      await trustAndLogin({ page, context, baseURL, user });
      await expectDashboardChrome(page);
      await expect(page.getByText('Ready to Scale').first()).toBeVisible();
      await expect(page.getByText('Free Readiness Scan')).toBeVisible();
      await expect(page.getByRole('link', { name: /Take In-Depth · \$99/i }).first()).toBeVisible();
      await expect(page.getByText(/Your path · 2 of 7 complete/i)).toBeVisible();
    } finally {
      await cleanupSeededUser(user.id);
    }
  });

  test('persona 3: paid In-Depth buyer sees starter Toolbox access and assessment CTA', async ({
    page,
    context,
    baseURL,
  }) => {
    const user = await seedConfirmedUser();
    try {
      await grantInDepthAccess(user.id, user.email);
      await trustAndLogin({ page, context, baseURL, user });
      await expectDashboardChrome(page);
      await expect(page.getByRole('link', { name: /Take your In-Depth assessment/i }).first()).toBeVisible();
      await expect(page.getByText(/Toolbox — In-Depth access/i)).toBeVisible();
      await expect(page.getByText(/In-Depth access/i).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /Take your purchased assessment/i })).toBeVisible();
    } finally {
      await cleanupSeededUser(user.id);
    }
  });

  test('persona 4: completed In-Depth user sees Briefing route', async ({
    page,
    context,
    baseURL,
  }) => {
    const user = await seedConfirmedUser();
    try {
      await grantInDepthAccess(user.id, user.email);
      const profileId = await seedReadinessProfile({
        userId: user.id,
        email: user.email,
        kind: 'in-depth',
        role: 'marketing',
      });
      await trustAndLogin({ page, context, baseURL, user });
      await expectDashboardChrome(page);
      await expect(page.getByText('In-Depth Briefing')).toBeVisible();
      await expect(page.getByRole('heading', { name: /Your Briefing is ready/i })).toBeVisible();
      await expect(page.locator(`a[href="/assessment/in-depth/results/${profileId}"]`).first()).toBeVisible();
      await expect(page.getByText(/Your path · 3 of 7 complete/i)).toBeVisible();
    } finally {
      await cleanupSeededUser(user.id);
    }
  });

  test('persona 5: Foundation learner sees course work, saved prompts, artifacts, and full Toolbox', async ({
    page,
    context,
    baseURL,
  }) => {
    const user = await seedConfirmedUser();
    try {
      await seedReadinessProfile({
        userId: user.id,
        email: user.email,
        kind: 'free',
        role: 'lending',
      });
      await grantFoundationEnrollment(user.id, user.email);
      await setOnboardingAnswers(user.id, ONBOARDING_BY_ROLE.foundation);
      await setFoundationProgress({
        userId: user.id,
        currentModule: 7,
        completedModules: [1, 2, 3, 4, 5, 6],
      });
      await seedPracticeCompletions(user.id, ['rep-001', 'rep-002']);
      await seedSavedPrompts(user.id, ['credit-memo-drafter', 'exam-prep']);
      await seedUserArtifacts(user.id, [
        { artifactId: 'first-prompt-template', status: 'completed', sourceActivityId: 'first-role-prompt' },
        { artifactId: 'prompt-strategy-cheat-sheet', status: 'completed', sourceActivityId: 'first-role-prompt' },
        { artifactId: 'safe-ai-use-checklist', status: 'in-progress', sourceActivityId: 'safe-prompt-conversion' },
      ]);

      await trustAndLogin({ page, context, baseURL, user });
      await expectDashboardChrome(page);
      await expect(page.getByRole('link', { name: /Continue Module 7/i }).first()).toBeVisible();
      await expect(page.getByText(/Module 7/i).first()).toBeVisible();
      await expect(page.getByText(/6 of 18 modules complete/i)).toBeVisible();
      await expect(page.getByText(/2 saved prompts/i)).toBeVisible();
      await expect(page.getByText(/Foundation access/i).first()).toBeVisible();
      await expect(page.getByText(/Next: Safe AI Use Checklist/i)).toBeVisible();
      await expect(page.getByText(/Your path · 5 of 7 complete/i)).toBeVisible();
    } finally {
      await cleanupSeededUser(user.id);
    }
  });
  });
});
