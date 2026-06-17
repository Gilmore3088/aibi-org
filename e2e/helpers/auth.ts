import type { Page } from '@playwright/test';
import type { SeededUser } from './seed';

/**
 * Log in via the UI. Uses the credentials returned by seedConfirmedUser.
 * Waits for the post-login redirect to settle before returning.
 *
 * After a successful password sign-in, the app calls /api/auth/check-device.
 * On a trusted device the browser is sent directly to the destination; on an
 * untrusted device (new browser / expired cookie) it is routed to
 * /auth/confirm-device-pending. Both are considered valid post-login states.
 */
export async function loginViaUI(page: Page, user: SeededUser): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  // Accept either a destination outside /auth/ (trusted device) or the
  // confirm-device-pending holding page (untrusted device, #425).
  await page.waitForURL(
    (url) =>
      !url.pathname.startsWith('/auth/') ||
      url.pathname.startsWith('/auth/confirm-device-pending'),
    { timeout: 10_000 },
  );
}

/**
 * Returns true if the current page is the device-confirmation pending screen.
 * Use this after loginViaUI() to branch test logic when the device is untrusted.
 */
export function isConfirmDevicePending(page: Page): boolean {
  return page.url().includes('/auth/confirm-device-pending');
}
