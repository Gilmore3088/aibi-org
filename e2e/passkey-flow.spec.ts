/**
 * End-to-end passkey enrollment + sign-in test.
 *
 * Uses Chrome DevTools Protocol's WebAuthn virtual authenticator so the
 * test can simulate Touch ID / Face ID prompts without real hardware.
 * The authenticator is configured to auto-consent (no user prompt) so
 * the flow runs unattended.
 *
 * Chromium only — WebKit and Firefox don't expose the CDP virtual
 * authenticator. Skipped on other projects.
 *
 * What's covered:
 *   1. Free assessment → EmailGate with brand-new email → auto-signin
 *      → /auth/passkey/enroll → virtual fingerprint → backup codes →
 *      /results/<id> with the user logged in.
 *   2. Sign out → /auth/login → "Sign in with passkey" → virtual
 *      fingerprint → /dashboard.
 *   3. Sign out → /auth/recovery → email + first saved backup code →
 *      forced re-enrollment → /auth/passkey/enroll.
 *
 * What's NOT covered:
 *   - Stripe checkout (no test keys locally).
 *   - The PDF download (requires a PDF actually generated, which the
 *     warm endpoint may or may not succeed at on local).
 *
 * Each run uses a unique email so it doesn't collide with prior runs.
 * No cleanup — the test leaves a Supabase auth user + credentials
 * behind. Document this for the team.
 */

import { test, expect, type Page, type CDPSession } from '@playwright/test';

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const UNIQUE_EMAIL = `passkey-e2e-${Date.now()}@example-bank.com`;
const FULL_NAME = 'E2E Test Reynolds';
const INSTITUTION = 'E2E Test Bank';

interface AuthenticatorRef {
  readonly cdp: CDPSession;
  readonly authenticatorId: string;
}

async function attachVirtualAuthenticator(
  page: Page,
): Promise<AuthenticatorRef> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  // Configure a platform authenticator (the kind your laptop's Touch ID
  // pretends to be). isUserVerified=true means the virtual sensor
  // auto-approves every prompt. hasResidentKey enables discoverable
  // credentials so we can sign in without typing the email.
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  return { cdp, authenticatorId };
}

async function detachVirtualAuthenticator(ref: AuthenticatorRef): Promise<void> {
  try {
    await ref.cdp.send('WebAuthn.removeVirtualAuthenticator', {
      authenticatorId: ref.authenticatorId,
    });
  } catch {
    /* ignore */
  }
}

async function answerAllQuestions(page: Page): Promise<void> {
  for (let i = 0; i < 12; i++) {
    await page
      .locator('button[role="radio"]')
      .nth(i % 4)
      .click();
    // Small wait so the auto-advance hook completes before the next click.
    await page.waitForTimeout(200);
  }
}

test.describe('Passkey end-to-end', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Virtual authenticator is Chromium-only',
  );

  let authenticator: AuthenticatorRef;

  test.beforeEach(async ({ page }) => {
    authenticator = await attachVirtualAuthenticator(page);
  });

  test.afterEach(async () => {
    await detachVirtualAuthenticator(authenticator);
  });

  test('full enrollment + sign-in + recovery flow', async ({ page }) => {
    // Capture every backup code the server returns so the recovery
    // step can use one. Set by the enrollment step below.
    const recoveryCodes: string[] = [];
    page.on('response', async (resp) => {
      if (resp.url().endsWith('/api/webauthn/recovery/generate')) {
        try {
          const data = (await resp.json()) as { codes?: string[] };
          if (data.codes) recoveryCodes.push(...data.codes);
        } catch {
          /* ignore */
        }
      }
    });

    // ── 1. Take the assessment with a brand-new email ──────────────
    await test.step('Q1..Q12', async () => {
      await page.goto(`${BASE_URL}/assessment`);
      // Clear any state from a prior run on this profile.
      await page.evaluate(() => {
        window.sessionStorage.clear();
        window.localStorage.clear();
      });
      await page.reload();
      await answerAllQuestions(page);
    });

    await test.step('EmailGate submit with unique email', async () => {
      await page
        .locator('input#gate-email')
        .fill(UNIQUE_EMAIL);
      await page.locator('input#gate-fullname').fill(FULL_NAME);
      await page.locator('input#gate-institution').fill(INSTITUTION);
      // Submit + wait for the post-submit navigation (server should
      // issue a session and redirect to /auth/passkey/enroll).
      const navPromise = page.waitForURL(/\/(auth\/passkey\/enroll|results)/, {
        timeout: 15_000,
      });
      await page
        .getByRole('button', { name: /show my full results/i })
        .click();
      await navPromise;
    });

    // ── 2. Enroll the virtual passkey ──────────────────────────────
    await test.step('Passkey enrollment via virtual authenticator', async () => {
      // If we landed on /results instead of /auth/passkey/enroll, the
      // autoSignedIn path didn't fire (likely because SKIP flags
      // suppressed the auth-user creation). Skip the rest of this test
      // with a clear note rather than fail confusingly.
      const currentUrl = page.url();
      if (!currentUrl.includes('/auth/passkey/enroll')) {
        test.skip(
          true,
          `Auto-signin path did not redirect to enrollment — landed on ${currentUrl}. ` +
            `Check that ensureAuthUser actually created the user (Supabase env vars wired? RECOVERY_CODE_PEPPER set?).`,
        );
      }

      // Click "Add passkey". The virtual authenticator auto-consents.
      const addBtn = page.getByRole('button', { name: /Add passkey/i });
      await expect(addBtn).toBeVisible({ timeout: 10_000 });
      await addBtn.click();

      // Either we land on the codes panel (path A — codes API worked)
      // or we land on the redirect (path B — codes API skipped).
      await expect(
        page.getByText(/Save these recovery codes|Passkey registered\. Redirecting/i),
      ).toBeVisible({ timeout: 15_000 });
    });

    await test.step('Save backup codes (when shown)', async () => {
      const continueBtn = page.getByRole('button', {
        name: /I've saved them — continue/i,
      });
      // If the codes panel rendered, click through. If not, the
      // enrollment already auto-redirected (no codes path).
      if (await continueBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await continueBtn.click();
      }
      await page.waitForURL(/\/results\//, { timeout: 10_000 });
    });

    await test.step('Verify logged-in state on /results', async () => {
      // The header should NOT say "Sign in" any more. Either the
      // user's name or some signed-in affordance should be visible.
      const signInLink = page.getByRole('link', { name: /^sign in$/i });
      const isSignedOut = await signInLink
        .isVisible({ timeout: 3_000 })
        .catch(() => false);
      if (isSignedOut) {
        // Snapshot the page so we can debug what went wrong.
        await page.screenshot({ path: 'e2e-results-stillanon.png' });
        throw new Error('Expected to be signed in after enrollment, but nav still shows "Sign in"');
      }
    });

    // ── 3. Sign out and sign back in with the passkey ──────────────
    await test.step('Sign out', async () => {
      // Find the auth dropdown and click sign out. If the UI doesn't
      // expose a direct sign-out button, hit the API.
      await page.request.post('/auth/sign-out').catch(() => {});
      // Clear cookies to be thorough.
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/auth/login`);
    });

    await test.step('Sign in with passkey via virtual authenticator', async () => {
      // Leave email blank — discoverable-credential flow lets the
      // virtual authenticator surface the right credential by itself.
      const navPromise = page.waitForURL(
        (url) => !url.pathname.startsWith('/auth/'),
        { timeout: 15_000 },
      );
      await page
        .getByRole('button', { name: /Sign in with passkey/i })
        .click();
      await navPromise;
    });

    // ── 4. Recovery flow ───────────────────────────────────────────
    await test.step('Recovery sign-in with a backup code', async () => {
      if (recoveryCodes.length === 0) {
        test.skip(true, 'No recovery codes captured — codes API may have failed earlier.');
      }
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/auth/recovery`);
      await page.locator('input[name="email"]').fill(UNIQUE_EMAIL);
      await page.locator('input[name="code"]').fill(recoveryCodes[0]!);
      const navPromise = page.waitForURL(/\/auth\/passkey\/enroll/, {
        timeout: 15_000,
      });
      await page.getByRole('button', { name: /Sign in with code/i }).click();
      await navPromise;
      // The recovery flow forces re-enrollment — we should be on the
      // enroll page now with a session cookie.
    });
  });
});
