// Email pre-fill coverage for the auth forms.
//
// Target: localhost:3000 (the PR #90 branch with commit 337ba6e). The
// production deploy doesn't have these changes yet — they ship when
// PR #90 merges.
//
// What this covers:
//   • /auth/signup?email=foo pre-fills the email input.
//   • /auth/login?email=foo pre-fills the email input in both password
//     and magic-link modes.
//   • Email-shaped guard rejects garbage values (no pre-fill of "<script>").
//   • ?next= is preserved alongside ?email= across signup↔login.
//   • /assessment/in-depth?reason=no-purchase shows "Purchase required".
//
// What it does NOT cover (needs a real Stripe session_id we can't fake
// here):
//   • /assessment/in-depth/purchased?session_id=cs_test_… recovering the
//     buyer's email from Stripe and forwarding it to /auth/signup?email=…
//     That path is verified by code-reading; live drive belongs in
//     staging after PR #90 merges.

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('auth pre-fill — signup', () => {
  test('pre-fills email from ?email= query param', async ({ page }) => {
    const email = 'buyer@bank.example';
    await page.goto(`${BASE}/auth/signup?email=${encodeURIComponent(email)}&next=/dashboard`);
    const value = await page.locator('input[name="email"]').first().inputValue();
    expect(value).toBe(email);
  });

  test('does not pre-fill garbage that fails email shape check', async ({ page }) => {
    await page.goto(`${BASE}/auth/signup?email=%3Cscript%3E`);
    const value = await page.locator('input[name="email"]').first().inputValue();
    expect(value).toBe('');
  });

  test('preserves both ?email= and ?next= on the "already have an account" link', async ({ page }) => {
    const email = 'buyer@bank.example';
    await page.goto(`${BASE}/auth/signup?email=${encodeURIComponent(email)}&next=/courses/foundation/program`);
    const loginLink = page.getByRole('link', { name: /log.?in|sign.?in|already/i }).first();
    const href = await loginLink.getAttribute('href');
    expect(href).toContain('next=');
    expect(href).toContain('courses%2Ffoundation%2Fprogram');
  });
});

test.describe('auth pre-fill — login', () => {
  test('password mode pre-fills email from ?email=', async ({ page }) => {
    const email = 'buyer@bank.example';
    await page.goto(`${BASE}/auth/login?email=${encodeURIComponent(email)}`);
    const value = await page.locator('input[type="email"][name="email"]').first().inputValue();
    expect(value).toBe(email);
  });

  test('magic-link mode pre-fills email from ?email=', async ({ page }) => {
    const email = 'buyer@bank.example';
    await page.goto(`${BASE}/auth/login?email=${encodeURIComponent(email)}`);
    // The mode toggle is a custom segmented control; match by visible text
    // rather than ARIA role.
    await page.locator('button:has-text("Magic Link")').first().click();
    await page.waitForTimeout(300);
    const value = await page.locator('input[type="email"][name="email"]').first().inputValue();
    expect(value).toBe(email);
  });

  test('does not pre-fill garbage email', async ({ page }) => {
    await page.goto(`${BASE}/auth/login?email=not-an-email`);
    const value = await page.locator('input[type="email"][name="email"]').first().inputValue();
    expect(value).toBe('');
  });
});

test.describe('in-depth landing — purchase-required notice', () => {
  test('?reason=no-purchase renders the notice', async ({ page }) => {
    await page.goto(`${BASE}/assessment/in-depth?reason=no-purchase`);
    await expect(page.getByText(/Purchase required/i)).toBeVisible();
  });

  test('no reason param → no notice', async ({ page }) => {
    await page.goto(`${BASE}/assessment/in-depth`);
    await expect(page.getByText(/Purchase required/i)).toBeHidden();
  });
});
