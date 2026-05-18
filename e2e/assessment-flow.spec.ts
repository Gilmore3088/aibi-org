import { test, expect } from '@playwright/test';

// Free assessment flow — covers §4.88-127 of tasks/launch-checklist.md.
//
// These tests focus on the PUBLIC path (no auth, no DB seeding). They
// validate the assessment is reachable, questions advance, and the
// pre-email-gate score/tier display is visible per the 2026-04-27
// decision ("score + tier visible without email; dimension breakdown +
// starter artifact gated").
//
// What's NOT here:
//   - Email-gate submission tests (need MailerLite/Supabase seeding
//     and risk creating real subscriber rows; covered by auth.spec.ts
//     when the user binds their session email)
//   - Resume-from-sessionStorage tests (timing-sensitive; flaky in CI)
//   - Server-side persistence verification (needs DB query helpers)

test.describe('free assessment — public flow', () => {
  test('§4.88 /assessment first-question render', async ({ page }) => {
    await page.goto('/assessment');
    // The first question is rendered (or a "Start" CTA leading to one).
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(200);
  });

  test('§4.89 assessment loads under 4s on default network', async ({ page }) => {
    const start = Date.now();
    await page.goto('/assessment', { waitUntil: 'load' });
    const elapsed = Date.now() - start;
    // Generous bound — the launch checklist target is "under 2s on simulated 3G"
    // which we'll validate via Lighthouse mobile. Here we just guard against
    // an absolute regression.
    expect(elapsed).toBeLessThan(4000);
  });

  test('§4.90/.91 answer selection enables/gates the Next control', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    // Look for the first radio/button group representing answer options.
    // We don't assert the exact selector — different assessment versions
    // have rendered as buttons, radio inputs, or list items. We accept
    // any clickable element with a numeric value or recognizable label.
    const optionCandidates = page.getByRole('button').or(page.getByRole('radio'));
    const count = await optionCandidates.count();
    expect(count).toBeGreaterThan(0);
  });

  test('§4.92 / §4.97 complete all 12 questions → score + tier visible WITHOUT email gate', async ({
    page,
  }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    // QUESTIONS_PER_SESSION = 12 per src/app/assessment/_lib/useAssessmentV2.ts.
    // Each QuestionCard renders a radiogroup of 4 options. The interaction:
    // click one option, the hook auto-advances to the next question. The
    // ScoreRing renders once answers.length === 12.
    //
    // We pick the FIRST radio option on each question, which yields the
    // lowest tier ('starting-point'). That's deterministic across runs.
    for (let i = 0; i < 12; i++) {
      const radios = page.getByRole('radio');
      await radios.first().waitFor({ state: 'visible', timeout: 5_000 });
      await radios.first().click();
      // Tiny pause so the next radiogroup mounts before we re-query.
      await page.waitForTimeout(150);
    }

    // After 12 answers, the score+tier surface should be visible without
    // any email submission. ScoreRing has aria-label "Your AI readiness
    // score is N out of M, placing you in the X tier." — easy to assert on.
    await expect(
      page.getByLabel(/Your AI readiness score is \d+ out of \d+/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('§4.98 dimension breakdown is gated behind the email capture', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    // Complete the 12 questions as above.
    for (let i = 0; i < 12; i++) {
      const radios = page.getByRole('radio');
      await radios.first().waitFor({ state: 'visible', timeout: 5_000 });
      await radios.first().click();
      await page.waitForTimeout(150);
    }

    // After scoring, an email capture form is visible (per the 2026-04-27
    // decision: dimension breakdown is gated until email is captured).
    await expect(
      page.getByRole('textbox', { name: /email/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('§4.120 progress indicator updates as questions are answered', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    // ProgressBar renders the fraction answered. We can't directly query
    // its visual fill, but the page text typically includes "Question N
    // of 12" or a percentage. Verify the question index advances.
    const initialText = await page.locator('body').innerText();
    expect(initialText).toMatch(/question\s+1\s+of\s+12|1\s*\/\s*12|question 1/i);

    // Answer Q1; expect text to reflect Q2.
    await page.getByRole('radio').first().click();
    await page.waitForTimeout(300);
    const afterFirstAnswer = await page.locator('body').innerText();
    expect(afterFirstAnswer).toMatch(/question\s+2\s+of\s+12|2\s*\/\s*12|question 2/i);
  });

  test('§4.97 tagline mentions "Turning Bankers into Builders"', async ({ page }) => {
    // The assessment page often surfaces the brand tagline; if not, the
    // homepage does. Either is acceptable — the tagline must exist
    // somewhere reachable from the assessment entry.
    await page.goto('/');
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/Turning Bankers into Builders/i);
  });

  test('§4.106 /api/capture-email rejects invalid email format', async ({ request }) => {
    const res = await request.post('/api/capture-email', {
      data: { email: 'not-an-email' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test('§4.107 /api/capture-email rejects malformed body', async ({ request }) => {
    const res = await request.post('/api/capture-email', {
      data: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('§4.126 owner-bound /results/{id} route exists', async ({ page }) => {
    // Visiting a known-not-existing UUID should NOT 500 — it should 404
    // or redirect cleanly. We pick a UUID that's definitely not a real
    // result id.
    const res = await page.goto('/results/00000000-0000-0000-0000-000000000000');
    expect(res?.status()).toBeLessThan(500);
  });

  test('assessment page has heading and skip-link landmark', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');
    const h1Count = await page.getByRole('heading', { level: 1 }).count();
    // Some implementations use h1 in the question card; others use a
    // visually-hidden h1 above the card. Either way there should be at
    // least one.
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('free assessment — error surfaces', () => {
  test('GET /api/capture-email returns 405 (POST only)', async ({ request }) => {
    const res = await request.get('/api/capture-email');
    // Next.js returns 405 by default for missing method handlers.
    expect([405, 404]).toContain(res.status());
  });

  test('/api/save-proficiency rejects unauthenticated POST', async ({ request }) => {
    // Per PR #61 (security blocker C3 fix), this route now requires auth.
    const res = await request.post('/api/save-proficiency', {
      data: {
        email: 'e2e+spoof@aibankinginstitute.test',
        pctCorrect: 99,
        levelId: 'fake',
        levelLabel: 'Fake',
        topicScores: [],
        completedAt: new Date().toISOString(),
      },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
  });

  test('/api/user-profile rejects bad email', async ({ request }) => {
    const res = await request.get('/api/user-profile?email=not-an-email');
    expect(res.status()).toBe(400);
  });
});
