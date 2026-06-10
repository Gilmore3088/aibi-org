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
import {
  seedConfirmedUser,
  cleanupSeededUser,
  grantTrustedDevice,
  type SeededUser,
} from './helpers/seed';
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
      baseURL,
    }) => {
      // 1. Pre-grant a trusted_devices row and seed the cookie so the
      //    UI login flow can complete (otherwise it'd bounce to
      //    /auth/confirm-device-pending on first sign-in for a brand-new
      //    user with no trusted device — which is correct behavior, but
      //    blocks us from setting up the test state we want.
      const trust = await grantTrustedDevice(user.id);
      const url = new URL(baseURL ?? 'http://localhost:3010');
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

      // 2. Sign in via the UI. With the trust cookie in place, the
      //    post-login check-device returns trusted → lands on the
      //    requested destination (not /auth/confirm-device-pending).
      await loginViaUI(page, user);

      // 3. Strip the trusted-device cookie. This simulates the state
      //    that the layout-level gate is there to defend against —
      //    a valid Supabase session in a browser that no longer
      //    carries trust (cookie expired, cleared, never set because
      //    /api/auth/check-device fell open at sign-in time, etc.).
      await context.clearCookies({ name: TRUSTED_DEVICE_COOKIE });

      // 4. Navigate to the protected route. The fix means the layout
      //    now redirects to /auth/confirm-device-pending instead of
      //    rendering the protected surface.
      await page.goto(route, { waitUntil: 'commit' });
      await page.waitForURL(/\/auth\/confirm-device-pending/, { timeout: 10_000 });
      expect(page.url()).toMatch(/\/auth\/confirm-device-pending/);
      expect(page.url()).toContain(`email=${encodeURIComponent(user.email)}`);
    });
  }
});
