// Proves the fix for finding #2 in docs/auth-review-2026-06-06.html:
// /my-toolbox and /assessment/in-depth/access now enforce the
// trusted-device gate at the layout level (parity with /dashboard).
//
// Pre-fix: a logged-in user without the aibi-trusted-device cookie
// landed on these routes anyway, because the only gate was a session
// check. The login flow's fail-open on transient /api/auth/check-device
// errors could silently drop people into these surfaces with no trust.
//
// Test shape: seed a confirmed user, log in via UI (which sets the
// trusted-device cookie via /api/auth/check-device on this clean
// browser), DELETE that cookie to simulate the failed-trust state,
// then navigate. Both routes must redirect to /auth/confirm-device-pending.
//
// Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + a deployment
// under PLAYWRIGHT_BASE_URL with real Supabase (NOT preview bypass).

import { test, expect } from '@playwright/test';
import { seedConfirmedUser, cleanupSeededUser, type SeededUser } from './helpers/seed';
import { loginViaUI } from './helpers/auth';
import { TRUSTED_DEVICE_COOKIE } from '@/lib/auth/trusted-device';

const PROTECTED_ROUTES = ['/my-toolbox', '/assessment/in-depth/access'] as const;

test.describe('trusted-device gate at layout level (fix #2)', () => {
  let user: SeededUser;

  test.beforeAll(async () => {
    user = await seedConfirmedUser();
  });

  test.afterAll(async () => {
    if (user) await cleanupSeededUser(user.id);
  });

  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects to /auth/confirm-device-pending when trusted-device cookie is absent`, async ({
      page,
      context,
    }) => {
      // 1. Sign in to establish a valid Supabase session in this browser.
      await loginViaUI(page, user);

      // 2. Strip the trusted-device cookie. This is what would happen if
      //    /api/auth/check-device transiently 500'd at sign-in time and
      //    the login flow fell open (today's pre-fix behavior).
      const cookies = await context.cookies();
      const trustedCookie = cookies.find((c) => c.name === TRUSTED_DEVICE_COOKIE);
      expect(
        trustedCookie,
        'login should set a trusted-device cookie on this fresh browser',
      ).toBeDefined();
      await context.clearCookies({ name: TRUSTED_DEVICE_COOKIE });

      // 3. Navigate to the protected route. The fix means the layout
      //    now redirects to /auth/confirm-device-pending instead of
      //    rendering the protected surface.
      const response = await page.goto(route, { waitUntil: 'commit' });
      // Either the page navigates to /auth/confirm-device-pending, or
      // the response is a 30x redirect there. Both are acceptable.
      await page.waitForURL(/\/auth\/confirm-device-pending/, { timeout: 10_000 });
      expect(page.url()).toMatch(/\/auth\/confirm-device-pending/);
      // Email should be preserved in the redirect for the resend-email UI.
      expect(page.url()).toContain(`email=${encodeURIComponent(user.email)}`);

      // Sanity check on the response status when available.
      if (response && response.status() >= 400) {
        throw new Error(`Unexpected ${response.status()} on ${route}`);
      }
    });
  }
});
