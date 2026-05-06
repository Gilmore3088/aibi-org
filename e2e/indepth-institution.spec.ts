// Institution invitee path: seed an institution + one invitee row,
// exercise the magic-link take page (token-only, no auth) and the
// results-page authorization boundary.

import { expect, test } from '@playwright/test';
import {
  cleanupCohort,
  seedInstitutionInvitee,
  type SeededInvitee,
} from './_helpers/seed';
import { createClient } from '@supabase/supabase-js';

let seeded: SeededInvitee;

test.beforeAll(async () => {
  seeded = await seedInstitutionInvitee();
});

test.afterAll(async () => {
  if (seeded) await cleanupCohort(seeded.cohortId);
});

test('invitee can open take page with token (no auth)', async ({ page }) => {
  const res = await page.goto(
    `/assessment/in-depth/take?token=${encodeURIComponent(seeded.inviteToken)}`,
  );
  expect(res?.status()).toBe(200);
  // First question is visible
  await expect(page.getByText(/Question/i).first()).toBeVisible();
});

test('invalid token shows invalid-invite page', async ({ page }) => {
  const res = await page.goto(
    `/assessment/in-depth/take?token=${'X'.repeat(43)}`,
  );
  expect(res?.status()).toBe(200);
  await expect(page.getByText(/invite link is invalid/i)).toBeVisible();
});

test('completed invitee result requires token; valid token renders', async ({ page }) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const answers: Record<string, number> = {};
  for (let i = 0; i < 48; i++) answers[`q${i}`] = 3;
  const perDim = {
    'current-ai-usage': 18,
    'experimentation-culture': 18,
    'ai-literacy-level': 18,
    'quick-win-potential': 18,
    'leadership-buy-in': 18,
    'security-posture': 18,
    'training-infrastructure': 18,
    'builder-potential': 18,
  };
  await supabase
    .from('indepth_takes')
    .update({
      completed_at: new Date().toISOString(),
      score_total: 144,
      score_per_dimension: perDim,
      answers,
    })
    .eq('id', seeded.takerId);

  const noToken = await page.goto(`/results/in-depth/${seeded.takerId}`);
  expect(noToken?.status()).toBe(404);

  const withToken = await page.goto(
    `/results/in-depth/${seeded.takerId}?t=${encodeURIComponent(seeded.inviteToken)}`,
  );
  expect(withToken?.status()).toBe(200);
  await expect(page.getByText(/In-Depth AI Readiness Briefing/i)).toBeVisible();
});
