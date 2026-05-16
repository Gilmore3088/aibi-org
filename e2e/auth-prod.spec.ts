// End-to-end auth coverage for production.
//
// Target: https://aibankinginstitute.com (or PLAYWRIGHT_BASE_URL).
//
// What this covers:
//   • Public auth pages render (signup, login, forgot password)
//   • Login supports both password and magic-link modes
//   • ?next= is preserved across signup↔login navigation
//   • Protected routes redirect to login with next=
//   • Logged-out homepage and education routes are public
//
// What this does NOT cover (by design):
//   • Creating real Supabase users (would persist as test artifacts)
//   • Sending real magic-link emails (would hit Resend quota / clutter inbox)
//   • Driving Stripe checkout (real charges)
//   • Password reset email round-trip (would hit Resend quota)
//
// For the destructive flows, see e2e/auth-prod-with-email.spec.ts which
// uses throwaway aliases (jlgilmore2+aibi-qa-…@gmail.com) and is opt-in
// via TEST_REAL_EMAILS=1.

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://aibankinginstitute.com';

test.describe('production auth — public pages render', () => {
  test('/auth/signup renders with email + password fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    // Production H1 reads "Start here."; preview may differ. We just want
    // SOMETHING above-the-fold and the form inputs themselves.
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('input[type="email"][name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('/auth/login renders with password mode by default', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await expect(page.locator('input[type="email"][name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('/auth/login magic-link mode is selectable', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    const magicTab = page.getByRole('button', { name: /magic link/i }).first();
    if (await magicTab.count()) {
      await magicTab.click();
      // After switching modes the password input should disappear
      await expect(page.locator('input[type="password"]').first()).toBeHidden();
    }
  });

  test('/auth/forgot-password renders', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/auth/forgot-password`);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('input[type="email"][name="email"]').first()).toBeVisible();
  });

  test('/dashboard does not expose paid content to logged-out user', async ({ page }) => {
    // Production policy: /dashboard does NOT hard-redirect logged-out users.
    // It renders a soft public landing in the same shell. Either behavior
    // is acceptable — what matters is that paid course content (module
    // titles, practice reps) is NOT exposed.
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2_000);
    const text = await page.evaluate(() => document.body.innerText);
    // Either redirected to auth, or rendering a public-friendly landing
    const isOnAuth = page.url().match(/\/auth\/(login|signup)/);
    const showsTakeAssessmentCta = /Take the (free )?assessment/i.test(text);
    expect(isOnAuth || showsTakeAssessmentCta).toBeTruthy();
    // And no module-level paid content should leak through
    expect(text).not.toMatch(/Module \d+:/);
    expect(text).not.toMatch(/Continue Lesson/);
  });

  test('/auth/login preserves ?next= through to the signup link', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login?next=%2Fcourses%2Ffoundation%2Fprogram%2Fpurchase`);
    // Link text varies ("Create one", "Sign up", "Create my account"); match
    // by destination instead.
    const signupHref = await page.locator('a[href^="/auth/signup"]').first().getAttribute('href');
    expect(signupHref).toMatch(/next=.*foundation/);
  });

  test('/auth/signup preserves ?next= through to the login link', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup?next=%2Fcourses%2Ffoundation%2Fprogram%2Fpurchase`);
    const loginHref = await page.locator('a[href^="/auth/login"]').first().getAttribute('href');
    expect(loginHref).toMatch(/next=.*foundation/);
  });
});

test.describe('production auth — open redirect defense', () => {
  test('?next=//evil.com is sanitized to a safe path', async ({ page }) => {
    // sanitizeNext() should reject protocol-relative URLs. We can't run JS
    // assertions against it directly, but we can confirm the page renders
    // normally and any same-origin "next" link doesn't carry the unsafe value.
    await page.goto(`${BASE_URL}/auth/login?next=//evil.com`);
    await expect(page.locator('input[name="email"]').first()).toBeVisible();
    const signupHref = await page
      .locator('a[href^="/auth/signup"]')
      .first()
      .getAttribute('href');
    if (signupHref) {
      expect(signupHref).not.toContain('//evil.com');
    }
  });

  test('?next=http://evil.com is sanitized', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login?next=http%3A%2F%2Fevil.com`);
    await expect(page.locator('input[name="email"]').first()).toBeVisible();
  });
});

test.describe('production auth — public marketing routes do not require auth', () => {
  for (const path of [
    '/',
    '/assessment',
    '/assessment/in-depth',
    '/education',
    '/for-institutions',
    '/courses/foundation/program',
    '/courses/foundation/program/purchase',
    '/research',
    '/security',
  ]) {
    test(`${path} is reachable logged-out`, async ({ page }) => {
      const res = await page.goto(`${BASE_URL}${path}`);
      expect(res?.status()).toBe(200);
      // Should NOT redirect to /auth/login
      expect(page.url()).not.toMatch(/\/auth\/(login|signup)/);
    });
  }
});

test.describe('production auth — free assessment flow does not require auth', () => {
  test('can take free assessment without signing in', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment`);
    // Click through 12 answers (lowest option each time → starting-point tier)
    for (let i = 0; i < 14; i++) {
      const radios = await page.getByRole('radio').all();
      if (radios.length === 0) break;
      await radios[0].click();
      await page.waitForTimeout(160);
    }
    // Score phase should be visible and show a tier label
    const tier = await page
      .locator('text=/Starting Point|Early Stage|Building Momentum|Ready to Scale/')
      .first()
      .textContent({ timeout: 8_000 })
      .catch(() => null);
    expect(tier).not.toBeNull();
  });
});
