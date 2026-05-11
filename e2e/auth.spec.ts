import { test, expect } from '@playwright/test';
import {
  seedConfirmedUser,
  cleanupSeededUser,
  type SeededUser,
} from './helpers/seed';
import { loginViaUI } from './helpers/auth';

// Auth flow tests — covers §3.42-87 of the launch checklist.
//
// These tests require:
//   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (for seeding)
// and assume the deployment under PLAYWRIGHT_BASE_URL has a working
// auth path. Tests that need email round-trips (magic link, password
// reset, signup confirm) are NOT covered here — they need Resend
// webhook integration or a mailpit container; see e2e/README.md.

test.describe('auth — public pages (logged out)', () => {
  test('§3.42 visit /auth/login — form renders', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('§3.44 visit /auth/signup — form renders', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('§3.47 signup with invalid email format surfaces error', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByLabel(/email/i).fill('not-an-email');
    await page.getByLabel(/password/i).fill('valid-password-123');
    await page.getByRole('button', { name: /sign up|create/i }).click();
    // Native validation OR server validation — accept either.
    const emailField = page.getByLabel(/email/i);
    const validity = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid);
    if (!validity) {
      // Browser blocked submission via HTML5 validation.
      expect(validity).toBe(false);
    } else {
      // Submission proceeded — server should have returned an error.
      await expect(page.getByText(/invalid|valid email/i)).toBeVisible({ timeout: 5_000 });
    }
  });

  test('§3.52 login with wrong password shows generic error', async ({ page }) => {
    // Use a clearly non-existent account; server should not leak that the
    // email is unknown (vs known-but-wrong-password).
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill('does-not-exist@aibankinginstitute.test');
    await page.getByLabel(/password/i).fill('definitely-wrong-password');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByText(/invalid|incorrect|could not/i)).toBeVisible({ timeout: 5_000 });
  });

  test('§3.68 /auth/callback without token returns a graceful error', async ({ page }) => {
    const res = await page.goto('/auth/callback');
    // Should not 500; should redirect to login or show an error UI.
    expect(res?.status()).toBeLessThan(500);
  });
});

test.describe('auth — protected routes (logged out)', () => {
  test('§3.62 /dashboard redirects logged-out users to /auth/login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('§3.85 deep-link to /courses/foundation/program/3 preserves next= after login', async ({
    page,
  }) => {
    await page.goto('/courses/foundation/program/3');
    // Should redirect to login with the original path captured.
    await expect(page).toHaveURL(/\/auth\/login.*next=.*foundation/);
  });
});

test.describe('auth — logged-in flows', () => {
  let user: SeededUser | null = null;

  test.beforeEach(async () => {
    user = await seedConfirmedUser();
  });

  test.afterEach(async () => {
    if (user) {
      await cleanupSeededUser(user.id);
      user = null;
    }
  });

  test('§3.51 login with correct credentials lands at /dashboard', async ({ page }) => {
    if (!user) throw new Error('user not seeded');
    await loginViaUI(page, user);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('§3.43 /auth/login while logged in redirects to /dashboard', async ({ page }) => {
    if (!user) throw new Error('user not seeded');
    await loginViaUI(page, user);
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('§3.61 logout clears session and redirects to /', async ({ page }) => {
    if (!user) throw new Error('user not seeded');
    await loginViaUI(page, user);
    // Logout via the UI control. If the selector changes, update here.
    const logout = page.getByRole('button', { name: /sign out|log out/i }).first();
    await logout.click();
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/?$/);
    // Visiting /dashboard should bounce back to login.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('§3.64 session persists across page reload', async ({ page }) => {
    if (!user) throw new Error('user not seeded');
    await loginViaUI(page, user);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('§3.54 login respects ?next= redirect', async ({ page }) => {
    if (!user) throw new Error('user not seeded');
    await page.goto('/auth/login?next=/dashboard/toolbox');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/toolbox/);
  });
});
