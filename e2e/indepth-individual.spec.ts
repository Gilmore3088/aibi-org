// Individual buyer path: seed a completed taker row, exercise the
// authorization boundary on /results/in-depth/[id]. The Stripe step
// is bypassed (we insert the row directly with a fake stripe_session_id);
// the magic-link is read from the seeded invite_token, not from email.
//
// Auth gate on /assessment/in-depth/take is not exercised here because
// it requires a real Supabase Auth session for individual buyers; the
// security regression we care about is the results page.

import { expect, test } from '@playwright/test';
import {
  cleanupTaker,
  seedIndividualTaker,
  type SeededIndividual,
} from './_helpers/seed';
import { createClient } from '@supabase/supabase-js';

let seeded: SeededIndividual;

test.beforeAll(async () => {
  seeded = await seedIndividualTaker();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const answers: Record<string, number> = {};
  const perDim: Record<string, number> = {};
  const dims = [
    'current-ai-usage',
    'experimentation-culture',
    'ai-literacy-level',
    'quick-win-potential',
    'leadership-buy-in',
    'security-posture',
    'training-infrastructure',
    'builder-potential',
  ];
  for (const dim of dims) perDim[dim] = 18;
  for (let i = 0; i < 48; i++) answers[`q${i}`] = 3;

  await supabase
    .from('indepth_assessment_takers')
    .update({
      completed_at: new Date().toISOString(),
      score_total: 144,
      score_per_dimension: perDim,
      answers,
    })
    .eq('id', seeded.takerId);
});

test.afterAll(async () => {
  if (seeded) await cleanupTaker(seeded.takerId);
});

test('results page denies access without token', async ({ page }) => {
  const res = await page.goto(`/results/in-depth/${seeded.takerId}`);
  expect(res?.status()).toBe(404);
});

test('results page denies access with wrong token', async ({ page }) => {
  const res = await page.goto(
    `/results/in-depth/${seeded.takerId}?t=${'A'.repeat(43)}`,
  );
  expect(res?.status()).toBe(404);
});

test('results page renders with valid token', async ({ page }) => {
  const res = await page.goto(
    `/results/in-depth/${seeded.takerId}?t=${encodeURIComponent(seeded.inviteToken)}`,
  );
  expect(res?.status()).toBe(200);
  await expect(page.getByText(/In-Depth AI Readiness Briefing/i)).toBeVisible();
});

test('take page redirects completed taker to results with token', async ({ page }) => {
  const res = await page.goto(
    `/assessment/in-depth/take?token=${encodeURIComponent(seeded.inviteToken)}`,
  );
  // The take-page flow for a completed taker redirects to /results/in-depth/[id]?t=…
  // For an individual buyer who isn't authed, the auth gate triggers FIRST
  // (institution_id is null → /auth/login). That's expected.
  // Either landing point is fine; what we verify is no 5xx.
  expect(res?.status()).toBeLessThan(500);
});
