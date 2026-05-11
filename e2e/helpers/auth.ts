import type { Page } from '@playwright/test';
import type { SeededUser } from './seed';

/**
 * Log in via the UI. Uses the credentials returned by seedConfirmedUser.
 * Waits for the post-login redirect to settle before returning.
 */
export async function loginViaUI(page: Page, user: SeededUser): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  // Wait for either /dashboard or a passed-through next= destination.
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/'), { timeout: 10_000 });
}
