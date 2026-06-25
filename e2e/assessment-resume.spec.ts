// Cross-device free-assessment resume — the REAL server round-trip.
//
// e2e/assessment-flow.spec.ts deliberately excludes resume as "needs DB query
// helpers / flaky in CI", so the draft write -> token -> GET
// /api/assessment/drafts/[token] -> restoreDraft chain has no end-to-end proof.
// This spec closes that gap against a running app and a REAL Supabase: it seeds
// an assessment_drafts row via the service role (capturing the plaintext token,
// which the table only stores hashed), then reopens it in a FRESH browser
// context (empty sessionStorage == a different device) and asserts the saved
// position is restored and the resume token is stripped from the URL.
//
// Requires a real Supabase project the test runner can write to AND read back:
// when NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are unset the whole
// describe block is skipped with a clear message rather than passing vacuously.
// Set SKIP_RESEND=true so the POST flow never sends a live email; this spec only
// uses the service-role seed, so no email is sent regardless.

import { test, expect } from '@playwright/test';
import {
  isSupabaseConfiguredForE2E,
  seedAssessmentDraft,
  cleanupAssessmentDraft,
  type SeededAssessmentDraft,
} from './helpers/assessment';

const supabaseReady = isSupabaseConfiguredForE2E();

test.describe('free assessment — cross-device resume round-trip', () => {
  test.skip(
    !supabaseReady,
    'Resume round-trip needs a real Supabase (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY). Set them in .env.local and rerun.',
  );

  const seeded: SeededAssessmentDraft[] = [];

  test.afterAll(async () => {
    for (const draft of seeded) {
      await cleanupAssessmentDraft(draft.id);
    }
  });

  test('a saved draft restores on a second device via the emailed resume token', async ({
    browser,
  }) => {
    // 5 answers, currently on question 6 (0-based currentQuestion = 5).
    const draft = await seedAssessmentDraft({
      answers: [2, 3, 1, 4, 2],
      currentQuestion: 5,
    });
    seeded.push(draft);

    // Fresh context = a different device: no sessionStorage, no cookies.
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(`/assessment/take?resume=${encodeURIComponent(draft.token)}`);
      // The restore handler reports success inline once the GET round-trip and
      // restoreDraft() complete.
      await expect(page.getByText('Your saved assessment is restored.')).toBeVisible({
        timeout: 15_000,
      });

      // The saved position drives the in-flow header: question 6 of 12, with
      // 5 of 12 answered.
      await expect(page.locator('body')).toContainText(/question\s+6\s+of\s+12/i);
      await expect(page.locator('body')).toContainText(/5\s+of\s+12\s+answered/i);

      // The token is scrubbed from the URL after a successful restore so a
      // reload / shared link doesn't re-trigger the one-shot resume.
      expect(page.url()).not.toContain('resume=');
      expect(page.url()).toMatch(/\/assessment\/take$/);
    } finally {
      await context.close();
    }
  });

  test('an unknown resume token surfaces a clear error and still renders a usable assessment', async ({
    browser,
  }) => {
    // A syntactically valid token (matches TOKEN_RE 32-128 url-safe chars) that
    // was never issued -> GET returns 404 -> the page shows the failure copy
    // but never crashes.
    const bogusToken = 'A'.repeat(43);

    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(`/assessment/take?resume=${bogusToken}`);
      await expect(
        page.getByText(/Resume link not found\.|could not be opened/i),
      ).toBeVisible({ timeout: 15_000 });

      // The assessment is still answerable — the first question's options
      // render despite the failed restore.
      await expect(page.getByRole('button').first()).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('a malformed token does not crash the page', async ({ browser }) => {
    // Too short to satisfy TOKEN_RE -> the GET route 404s on validation before
    // any DB lookup; the client renders a fresh assessment.
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto('/assessment/take?resume=short');
      await expect(page.getByRole('button').first()).toBeVisible({ timeout: 15_000 });
      // No saved-assessment success banner for a token that was never valid.
      await expect(page.getByText('Your saved assessment is restored.')).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
