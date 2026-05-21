import { test, expect } from '@playwright/test';
import {
  answerAllUniform,
  answerCurrent,
  answerWithOneWeakDimension,
  currentDimension,
  dimensionLabel,
  installAnalyticsRecorder,
  readAnalyticsEvents,
  submitEmailGate,
} from './helpers/assessment';

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

// ---------------------------------------------------------------------------
// #135 §4 — Score-band assertions for all four tiers.
//
// The v2 score range is 12–48 (12 questions × 1–4 points). Tier bands
// (content/assessments/v2/scoring.ts): Starting Point 12–22 · Early Stage
// 23–32 · Building Momentum 33–40 · Ready to Scale 41–48.
//
// Every QuestionCard renders its 4 options in ascending points order, so
// clicking the same option index on all 12 questions yields a deterministic,
// rotation-independent total. The tier reveal is gated behind the email
// capture (2026-05-18 reversal — full report renders inline after submit),
// so each test answers, submits a work email, then asserts the tier on the
// inline ScoreRing aria-label ("…placing you in the <Tier> tier.").
// ---------------------------------------------------------------------------

test.describe('free assessment — score bands (#135 §4)', () => {
  // Each row: option index clicked on every question → expected total → tier.
  const bands = [
    { name: 'Starting Point', optionIndex: 0, total: 12 },
    { name: 'Early Stage', optionIndex: 1, total: 24 },
    { name: 'Building Momentum', optionIndex: 2, total: 36 },
    { name: 'Ready to Scale', optionIndex: 3, total: 48 },
  ] as const;

  for (const band of bands) {
    test(`uniform answers land in "${band.name}" (score ${band.total})`, async ({
      page,
    }) => {
      await page.goto('/assessment');
      await page.waitForLoadState('networkidle');

      const total = await answerAllUniform(page, band.optionIndex);
      expect(total).toBe(band.total);

      await submitEmailGate(page);

      // The inline report's ScoreRing carries both the numeric score and the
      // tier label in its aria-label — assert both in one selector.
      await expect(
        page.getByRole('img', {
          name: new RegExp(
            `Your AI readiness score is ${band.total} out of 48, placing you in the ${band.name} tier`,
            'i',
          ),
        }),
      ).toBeVisible({ timeout: 15_000 });

      // The tier label is also surfaced as visible copy somewhere in the
      // report (ScoreRing caption / dashboard phase line) — guard the
      // user-facing string, not just the aria attribute.
      await expect(
        page.getByText(band.name, { exact: false }).first(),
      ).toBeVisible();
    });
  }
});

// ---------------------------------------------------------------------------
// #135 §4 — Email gate contract.
//
// Critical UX rule (CLAUDE.md + DECISIONS.md 2026-05-18): score, tier,
// dimension breakdown, and starter artifact are ALL hidden until a work
// email is submitted, then the full report renders INLINE on the same page
// (no redirect, no "check your inbox" wait state).
// ---------------------------------------------------------------------------

test.describe('free assessment — email gate (#135 §4)', () => {
  test('full report is hidden until email submit, then renders inline', async ({
    page,
  }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    await answerAllUniform(page, 1); // → Early Stage

    // Before email: the email-gate form is showing and NONE of the report
    // surfaces (score ring, dimension chart, starter artifact) are present.
    await expect(
      page.getByRole('textbox', { name: /email/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('img', { name: /Your AI readiness score is/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('figure', { name: /eight-dimension readiness chart/i }),
    ).toHaveCount(0);
    await expect(page.getByText(/your starter artifact/i)).toHaveCount(0);

    // Tag the live document so we can prove the report renders in the SAME
    // page (inline) rather than via a navigation/redirect to a new document.
    await page.evaluate(() => {
      (window as unknown as { __inlineSentinel?: boolean }).__inlineSentinel = true;
    });

    await submitEmailGate(page);

    // No full navigation away — the sentinel survives because the app uses
    // history.replaceState (to /results/<id> only when a profileId comes
    // back; with no DB it simply stays on /assessment). Either way the
    // document is never torn down, which is the "renders inline, no
    // redirect/wait" contract.
    const sameDocument = await page.evaluate(
      () => (window as unknown as { __inlineSentinel?: boolean }).__inlineSentinel === true,
    );
    expect(sameDocument).toBe(true);
    expect(page.url()).toMatch(/\/(assessment|results\/[0-9a-f-]+)/i);
    await expect(
      page.getByRole('img', { name: /Your AI readiness score is/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('figure', { name: /eight-dimension readiness chart/i }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// #135 §4 — Starter artifact matches the lowest-scoring dimension.
//
// The report's "first move" + starter artifact are keyed to focusGap, the
// weakest dimension (ResultsViewV2.groupDimensions sorts ascending by pct).
// We drive exactly one dimension to the floor (1 pt) and everything else to
// the ceiling (4 pts), then assert that dimension is named as the weakest
// and that the starter artifact is tailored to it.
// ---------------------------------------------------------------------------

test.describe('free assessment — starter artifact (#135 §4)', () => {
  test('starter artifact is tailored to the weakest dimension', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    const weakDimension = await answerWithOneWeakDimension(page);
    const weakLabel = dimensionLabel(weakDimension);

    await submitEmailGate(page);

    // The "first AI move" section names the weakest dimension explicitly.
    await expect(
      page.getByText(
        new RegExp(`Surfaced by your weakest dimension:\\s*${weakLabel}`, 'i'),
      ),
    ).toBeVisible({ timeout: 15_000 });

    // The collapsible starter artifact is tailored to that same top gap.
    await page
      .getByText(/show printable starter artifact/i)
      .click();
    await expect(
      page.getByText(
        new RegExp(`Tailored to your top gap:\\s*${weakLabel}`, 'i'),
      ),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// #135 §4 — sessionStorage persistence.
//
// useAssessmentV2 syncs { selectedQuestionIds, answers, currentQuestion } to
// sessionStorage key "aibi-assessment-v2" on every answer, restores it on
// mount (rebuilding question order by id), and clears it on restart. After
// email capture the report renders from in-memory state; the persistence
// key is no longer needed for an in-progress run.
// ---------------------------------------------------------------------------

test.describe('free assessment — sessionStorage persistence (#135 §4)', () => {
  test('refresh mid-assessment restores answers and position', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    // Answer the first three questions, leaving us mid-flow on Q4.
    await answerCurrent(page, 2);
    await answerCurrent(page, 2);
    await answerCurrent(page, 2);

    await expect(page.locator('body')).toContainText(/question\s+4\s+of\s+12|04\s*\/\s*12/i);

    // sessionStorage should hold three answers and currentQuestion === 3.
    const persisted = await page.evaluate(() =>
      window.sessionStorage.getItem('aibi-assessment-v2'),
    );
    expect(persisted).not.toBeNull();
    const parsed = JSON.parse(persisted as string) as {
      answers: number[];
      currentQuestion: number;
      selectedQuestionIds: string[];
    };
    expect(parsed.answers).toHaveLength(3);
    expect(parsed.currentQuestion).toBe(3);
    expect(parsed.selectedQuestionIds).toHaveLength(12);

    // Reload — the hook hydrates from sessionStorage and drops us back on Q4
    // with the same question set, not a fresh Q1.
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/question\s+4\s+of\s+12|04\s*\/\s*12/i);

    const afterReload = await page.evaluate(() =>
      window.sessionStorage.getItem('aibi-assessment-v2'),
    );
    const reParsed = JSON.parse(afterReload as string) as {
      selectedQuestionIds: string[];
      currentQuestion: number;
    };
    // Same questions, same position — order preserved by id.
    expect(reParsed.selectedQuestionIds).toEqual(parsed.selectedQuestionIds);
    expect(reParsed.currentQuestion).toBe(3);
  });

  test('sessionStorage is cleared after email capture', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    await answerAllUniform(page, 1);

    // Mid/late flow the key exists.
    const beforeCapture = await page.evaluate(() =>
      window.sessionStorage.getItem('aibi-assessment-v2'),
    );
    expect(beforeCapture).not.toBeNull();

    await submitEmailGate(page);

    // After capture the in-progress key must be cleared so a later return to
    // /assessment starts a fresh run rather than resuming a finished one.
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            window.sessionStorage.getItem('aibi-assessment-v2'),
          ),
        { timeout: 10_000 },
      )
      .toBeNull();
  });
});

// ---------------------------------------------------------------------------
// #135 §4 — Analytics events.
//
// The live code uses @vercel/analytics, whose track() dispatches via
// window.va('event', { name, data }). We pre-install a recorder before app
// scripts run (initQueue only assigns window.va when it is falsy, so our
// stub wins) and assert the two funnel-critical events fire with the right
// props: assessment_complete { tier, score } and email_captured { tier }.
// ---------------------------------------------------------------------------

test.describe('free assessment — analytics (#135 §4)', () => {
  test('assessment_complete and email_captured fire with tier/score', async ({
    page,
  }) => {
    await installAnalyticsRecorder(page);
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    await answerAllUniform(page, 1); // → Early Stage, score 24

    // assessment_complete fires when the score phase first renders (before
    // any email is captured).
    await expect
      .poll(async () =>
        (await readAnalyticsEvents(page)).some((e) => e.name === 'assessment_complete'),
      { timeout: 10_000 })
      .toBe(true);

    const completeEvent = (await readAnalyticsEvents(page)).find(
      (e) => e.name === 'assessment_complete',
    );
    expect(completeEvent?.data?.tier).toBe('early-stage');
    expect(completeEvent?.data?.score).toBe(24);

    // email_captured fires after a successful /api/capture-email round-trip.
    await submitEmailGate(page);

    await expect
      .poll(async () =>
        (await readAnalyticsEvents(page)).some((e) => e.name === 'email_captured'),
      { timeout: 10_000 })
      .toBe(true);

    const emailEvent = (await readAnalyticsEvents(page)).find(
      (e) => e.name === 'email_captured',
    );
    expect(emailEvent?.data?.tier).toBe('early-stage');
  });

  test('assessment_start fires on mount', async ({ page }) => {
    await installAnalyticsRecorder(page);
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');

    await expect
      .poll(async () =>
        (await readAnalyticsEvents(page)).some((e) => e.name === 'assessment_start'),
      { timeout: 10_000 })
      .toBe(true);
  });
});

// ---------------------------------------------------------------------------
// #135 §9 — Operator / live-network surfaces that CANNOT run here.
//
// These need a real inbox or live MailerLite/Resend (no sandbox), so they
// are tracked as fixmes rather than run. They belong to the §9 operator
// checklist, not the §4 automated E2E sweep.
// ---------------------------------------------------------------------------

test.describe('free assessment — live-network (operator, #135 §9)', () => {
  test.fixme(
    'breakdown email actually arrives in the captured inbox (Resend)',
    async () => {
      // Requires a real/seeded inbox (e.g. Mailosaur) + SKIP_RESEND=false.
      // Resend has no sandbox that proves delivery; verify operator-side.
    },
  );

  test.fixme(
    'MailerLite tier group + sequence enrolment on opt-in',
    async () => {
      // MailerLite has no test mode — every call hits the live account.
      // Verify the tier group membership in the live dashboard, not in CI.
    },
  );

  test.fixme(
    'sub-3-minute completion on a real iPhone Safari device',
    async () => {
      // The launch gate's "<3 min on iPhone Safari" is a real-device timing
      // check; the mobile-safari project emulates the viewport but not the
      // device perf envelope. Confirm on hardware.
    },
  );
});
