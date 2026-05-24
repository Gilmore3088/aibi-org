/**
 * Funnel walkthrough — every gate, every form, every prompt.
 *
 * Not a CI assertion suite. This is a documentation-driven walkthrough
 * that runs the funnel end-to-end and writes findings to the test
 * output. Each `test.step` is a real user action; failures and surprises
 * are explicitly logged so the test passes even when the funnel is
 * imperfect — the deliverable is the list of UX gaps, not a pass/fail.
 */

import { test, expect, type Page } from '@playwright/test';

const findings: string[] = [];

function record(severity: 'BUG' | 'FRICTION' | 'OK' | 'INFO', area: string, note: string): void {
  const line = `[${severity}] ${area} — ${note}`;
  findings.push(line);
  console.log(line);
}

async function readLocalStorage(page: Page, key: string): Promise<unknown> {
  return page.evaluate((k) => {
    const raw = window.localStorage.getItem(k);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }, key);
}

async function readSessionStorage(page: Page, key: string): Promise<unknown> {
  return page.evaluate((k) => {
    const raw = window.sessionStorage.getItem(k);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }, key);
}

async function clearAllStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

test.afterAll(() => {
  console.log('\n========== FUNNEL WALKTHROUGH SUMMARY ==========');
  findings.forEach((f) => console.log(f));
  console.log('================================================\n');
});

test.describe('Free 12-question assessment', () => {
  test('anonymous user — full flow with identity capture', async ({ page }) => {
    await page.goto('/assessment');

    await test.step('Initial render', async () => {
      // Question card visible
      const heading = page.locator('h2').first();
      const headingText = await heading.textContent();
      if (!headingText || headingText.length < 10) {
        record('BUG', 'assessment-q1', 'First question heading missing or empty');
      } else {
        record('OK', 'assessment-q1', `First question rendered: "${headingText.slice(0, 60)}..."`);
      }

      // Skip-link / progress bar
      const progress = page.getByRole('progressbar');
      const progressCount = await progress.count();
      if (progressCount === 0) {
        record('BUG', 'assessment-progress', 'No progressbar role found');
      }
    });

    await test.step('Answer all 12 questions', async () => {
      for (let i = 1; i <= 12; i++) {
        // Click the first answer option
        const options = page.locator('button[role="radio"]');
        const count = await options.count();
        if (count !== 4) {
          record('BUG', `assessment-q${i}`, `Expected 4 options, found ${count}`);
          break;
        }
        // Click a varying answer so the dimension breakdown isn't uniform.
        const idx = i % 4;
        await options.nth(idx).click();
        // Wait for next question or score phase.
        await page.waitForTimeout(300);
      }
      record('INFO', 'assessment-flow', 'Answered 12 questions');
    });

    await test.step('EmailGate appears with prefill check', async () => {
      // The gate header should mention "Your readiness report is ready"
      const reportHeading = page.getByRole('heading', { name: /readiness report is/i });
      const visible = await reportHeading.isVisible().catch(() => false);
      if (!visible) {
        record('BUG', 'email-gate', '"Your readiness report is ready" heading missing after Q12');
        return;
      }
      record('OK', 'email-gate', 'Reveal heading visible after Q12');

      // Check field labels
      const emailLabel = await page.locator('label', { hasText: /^Work email/i }).count();
      const fullNameLabel = await page.locator('label', { hasText: /^Full name/i }).count();
      const institutionLabel = await page.locator('label', { hasText: /^Institution/i }).count();

      if (emailLabel === 0) record('BUG', 'email-gate', 'No "Work email" label found');
      if (fullNameLabel === 0) record('BUG', 'email-gate', 'No "Full name" label found (should be renamed from First name)');
      if (institutionLabel === 0) record('BUG', 'email-gate', 'No "Institution name" label found');

      if (emailLabel && fullNameLabel && institutionLabel) {
        record('OK', 'email-gate', 'All three labels present: Work email, Full name, Institution name');
      }
    });

    await test.step('Free-mail soft gate — gmail without institution', async () => {
      const emailInput = page.locator('input#gate-email');
      await emailInput.fill('walkthrough-test@gmail.com');
      const submit = page.getByRole('button', { name: /show my full results/i });
      await submit.click();
      // Should error and focus on institution field (per audit M2 fix)
      const errorMsg = await page.getByRole('alert').textContent().catch(() => null);
      if (!errorMsg || !/institution/i.test(errorMsg)) {
        record('BUG', 'email-gate-free-mail', 'Expected institution-focused error for gmail without institution, got: ' + (errorMsg ?? 'none'));
      } else {
        record('OK', 'email-gate-free-mail', 'Free-mail without institution shows institution error');
      }
      // Where is the error placed? Verify it's near the institution field, not the email field.
      const institutionField = page.locator('input#gate-institution');
      const focused = await institutionField.evaluate((el) => el === document.activeElement).catch(() => false);
      if (!focused) {
        record('FRICTION', 'email-gate-free-mail', 'Institution field not focused after free-mail error (audit M2 expected focus shift)');
      } else {
        record('OK', 'email-gate-free-mail', 'Focus moved to institution field on free-mail error');
      }
    });

    await test.step('Submit with full identity', async () => {
      await page.locator('input#gate-fullname').fill('Sarah Reynolds');
      await page.locator('input#gate-institution').fill('First Federal Test Credit Union');
      const submit = page.getByRole('button', { name: /show my full results/i });
      await submit.click();
      // Wait for results to render
      await page.waitForURL(/\/(assessment|results)/, { timeout: 15_000 });
      const briefingHeading = page.getByText(/AI Readiness Briefing/i);
      const briefingVisible = await briefingHeading.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!briefingVisible) {
        record('BUG', 'results', 'AI Readiness Briefing heading not visible after submit');
      } else {
        record('OK', 'results', 'Results page rendered after capture');
      }
    });

    await test.step('localStorage written with correct schema', async () => {
      const stored = (await readLocalStorage(page, 'aibi-user')) as Record<string, unknown> | null;
      if (!stored) {
        record('BUG', 'localStorage', 'aibi-user not written after EmailGate submit');
        return;
      }
      const keys = Object.keys(stored).sort().join(', ');
      record('INFO', 'localStorage', `aibi-user keys: ${keys}`);
      if (!stored.email) record('BUG', 'localStorage', 'email missing from aibi-user');
      if (!stored.fullName && !stored.firstName) {
        record('BUG', 'localStorage', 'neither fullName nor firstName key present');
      } else if (stored.firstName && !stored.fullName) {
        record('FRICTION', 'localStorage', 'still writing legacy firstName key — should be fullName');
      } else if (stored.fullName) {
        record('OK', 'localStorage', `fullName written: "${stored.fullName}"`);
      }
      if (!stored.institutionName) record('BUG', 'localStorage', 'institutionName missing');
      if (!stored.readiness) record('BUG', 'localStorage', 'readiness missing');
    });

    await test.step('URL bar — should NOT contain PII', async () => {
      const url = page.url();
      if (url.includes('@')) {
        record('BUG', 'url-pii', `URL contains @ (likely email leak): ${url}`);
      } else if (/firstName=|fullName=|institutionName=|email=/.test(url)) {
        record('BUG', 'url-pii', `URL contains identity param: ${url}`);
      } else {
        record('OK', 'url-pii', `Post-results URL is clean: ${url}`);
      }
    });
  });

  test('returning user — localStorage prefills', async ({ page }) => {
    await page.goto('/assessment');
    await clearAllStorage(page);
    // Seed prior identity
    await page.evaluate(() => {
      window.localStorage.setItem(
        'aibi-user',
        JSON.stringify({
          email: 'returning@bank.com',
          fullName: 'Marcus Chen',
          institutionName: 'Hometown Bank',
        }),
      );
    });
    await page.reload();

    await test.step('Walkthrough Q1 → Q12 again', async () => {
      for (let i = 1; i <= 12; i++) {
        const options = page.locator('button[role="radio"]');
        await options.nth(0).click();
        await page.waitForTimeout(200);
      }
    });

    await test.step('EmailGate does NOT prefill from localStorage', async () => {
      // The gate currently does NOT prefill from localStorage even though
      // the data is right there. Buyer has to retype.
      const emailValue = await page.locator('input#gate-email').inputValue();
      const fullNameValue = await page.locator('input#gate-fullname').inputValue();
      const institutionValue = await page.locator('input#gate-institution').inputValue();

      if (emailValue === '' && fullNameValue === '' && institutionValue === '') {
        record('FRICTION', 'email-gate-returning', 'EmailGate does NOT prefill from localStorage even though identity is available — returning user types everything again');
      } else {
        record('OK', 'email-gate-returning', `EmailGate prefilled — email: ${emailValue}, name: ${fullNameValue}, institution: ${institutionValue}`);
      }
    });
  });
});

test.describe('In-Depth landing — identity freshness banner', () => {
  test('banner appears when localStorage has identity', async ({ page }) => {
    await page.goto('/assessment/in-depth');
    await clearAllStorage(page);
    await page.evaluate(() => {
      window.localStorage.setItem(
        'aibi-user',
        JSON.stringify({
          email: 'sarah@bank.com',
          fullName: 'Sarah Reynolds',
          institutionName: 'First Federal',
        }),
      );
    });
    await page.reload();

    const banner = page.getByRole('status').filter({ hasText: /Reading as|Not you/i });
    const visible = await banner.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!visible) {
      record('BUG', 'freshness-banner', 'IdentityFreshnessBanner not visible on /assessment/in-depth with identity in localStorage');
      return;
    }
    record('OK', 'freshness-banner', 'Banner visible');

    // Click "Not you?"
    const clearBtn = page.getByRole('button', { name: /not you/i });
    await clearBtn.click();
    const stored = await readLocalStorage(page, 'aibi-user');
    if (stored !== null) {
      record('BUG', 'freshness-banner', '"Not you?" did not clear localStorage');
    } else {
      record('OK', 'freshness-banner', '"Not you?" cleared localStorage');
    }
  });

  test('banner does NOT show when localStorage empty', async ({ page }) => {
    await page.goto('/assessment/in-depth');
    await clearAllStorage(page);
    await page.reload();
    const banner = page.locator('[role="status"]').filter({ hasText: /Reading as/i });
    const count = await banner.count();
    if (count > 0) {
      record('BUG', 'freshness-banner', 'Banner shown when localStorage was empty');
    } else {
      record('OK', 'freshness-banner', 'Banner correctly absent when localStorage empty');
    }
  });
});

test.describe('Auth — signup form prefill', () => {
  test('signup without sessionStorage stash shows empty form', async ({ page }) => {
    await page.goto('/auth/signup');
    await clearAllStorage(page);
    await page.reload();

    const fullName = await page.locator('input[name="fullName"]').inputValue();
    const email = await page.locator('input[name="email"]').inputValue();
    const institution = await page.locator('input[name="institutionName"]').inputValue();
    if (fullName === '' && email === '' && institution === '') {
      record('OK', 'signup-empty', 'Empty signup form with no stash');
    } else {
      record('FRICTION', 'signup-empty', `Signup form has leftover values: name=${fullName}, email=${email}, inst=${institution}`);
    }
  });

  test('signup WITH sessionStorage stash prefills + clears', async ({ page }) => {
    await page.goto('/auth/signup');
    await clearAllStorage(page);
    await page.evaluate(() => {
      window.sessionStorage.setItem(
        'aibi-signup-prefill',
        JSON.stringify({
          email: 'prefill@bank.com',
          fullName: 'Test Prefill',
          institutionName: 'Test Bank',
        }),
      );
    });
    await page.reload();

    // Wait for the useEffect that consumes the stash
    await page.waitForTimeout(500);

    const fullName = await page.locator('input[name="fullName"]').inputValue();
    const email = await page.locator('input[name="email"]').inputValue();
    const institution = await page.locator('input[name="institutionName"]').inputValue();
    if (fullName === 'Test Prefill' && email === 'prefill@bank.com' && institution === 'Test Bank') {
      record('OK', 'signup-prefill', 'sessionStorage prefill populated all three fields');
    } else {
      record('BUG', 'signup-prefill', `Prefill mismatch — name="${fullName}", email="${email}", inst="${institution}"`);
    }

    // sessionStorage should be consumed (cleared)
    const remaining = await readSessionStorage(page, 'aibi-signup-prefill');
    if (remaining !== null) {
      record('FRICTION', 'signup-prefill', 'sessionStorage NOT cleared after consume — would leak across visits');
    } else {
      record('OK', 'signup-prefill', 'sessionStorage cleared after consume');
    }

    // URL should be clean
    if (page.url().includes('@') || /firstName=|email=/.test(page.url())) {
      record('BUG', 'signup-url-pii', `Signup URL has PII params: ${page.url()}`);
    } else {
      record('OK', 'signup-url-pii', `Signup URL clean: ${page.url()}`);
    }
  });
});

test.describe('Auth — magic link presence (audit for 2FA migration)', () => {
  test('login page offers magic-link option (will need removal)', async ({ page }) => {
    await page.goto('/auth/login');
    const magicCount = await page
      .locator('button, a', { hasText: /magic link|email me a link|passwordless/i })
      .count();
    if (magicCount > 0) {
      record('INFO', 'auth-2fa-migration', `Login page has ${magicCount} magic-link control(s) — must remove for 2FA flow`);
    } else {
      record('INFO', 'auth-2fa-migration', 'No magic-link control on /auth/login — already password-only');
    }

    // Look for 2FA-related copy
    const twoFactorCount = await page
      .locator('text=/two.?factor|2FA|TOTP|authenticator/i')
      .count();
    if (twoFactorCount > 0) {
      record('OK', 'auth-2fa-migration', '2FA copy present on login');
    } else {
      record('INFO', 'auth-2fa-migration', 'No 2FA copy on login — need to add MFA challenge step');
    }
  });
});

test.describe('Take page — auth + enrollment gates', () => {
  test('unauthenticated visit redirects', async ({ page }) => {
    await page.goto('/assessment/in-depth/take', { waitUntil: 'networkidle' });
    const finalUrl = page.url();
    if (finalUrl.includes('/auth/login')) {
      record('OK', 'take-gate', 'Unauthenticated visit redirects to /auth/login');
    } else if (finalUrl.includes('/assessment/in-depth/take')) {
      record('FRICTION', 'take-gate', 'Take page renders without auth (preview bypass active?) — verify on production behavior');
    } else if (finalUrl.includes('/assessment/in-depth')) {
      record('OK', 'take-gate', `Redirected to /assessment/in-depth (no-purchase reason)`);
    } else {
      record('INFO', 'take-gate', `Unauthenticated visit landed at: ${finalUrl}`);
    }
  });
});

test.describe('Touch targets + a11y spot checks', () => {
  test('question card Back button has 44px target', async ({ page }) => {
    await page.goto('/assessment');
    // Answer Q1
    await page.locator('button[role="radio"]').nth(0).click();
    await page.waitForTimeout(200);
    // Now Back should be visible
    const back = page.getByRole('button', { name: /Back to question/i });
    const visible = await back.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) {
      record('BUG', 'a11y-touch-target', 'Back button not visible after Q1');
      return;
    }
    const box = await back.boundingBox();
    if (!box) {
      record('INFO', 'a11y-touch-target', 'Could not measure Back button');
      return;
    }
    if (box.height < 44) {
      record('BUG', 'a11y-touch-target', `Back button height ${box.height}px < 44px (WCAG 2.5.5)`);
    } else {
      record('OK', 'a11y-touch-target', `Back button height ${Math.round(box.height)}px ≥ 44px`);
    }
  });

  test('skeleton has SR-announceable status during hydration', async ({ page }) => {
    // Hard to test directly since hydration is fast. Just check the
    // skeleton render path produces a role="status" element somewhere.
    await page.goto('/assessment');
    const statusCount = await page.getByRole('status').count();
    record('INFO', 'a11y-skeleton', `Status role count on /assessment first paint: ${statusCount}`);
  });
});
