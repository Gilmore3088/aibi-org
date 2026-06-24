// Proves the certificate approval -> issuance -> PDF chain end-to-end against a
// running app with a real Supabase. The unit tests only exercise mocked
// boundaries; this spec is the first coverage that the full chain actually
// wires together:
//
//   1. POST /api/courses/submit-work-product  (auto-approves + issues cert)
//   2. GET  /api/courses/generate-certificate (returns a real %PDF buffer)
//   3. idempotent re-POST returns the SAME certificateId
//   4. GET  /verify/<certificateId>           (public verification renders)
//
// A regression that breaks issuance or the Chromium PDF (a future
// @sparticuz/chromium bump dropping the tracing entry, or /verify/[id]/print
// 404ing) ships undetected without this.
//
// Requires real Supabase seed access: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// and E2E_ALLOW_PRODUCTION_SUPABASE=true (creates e2e+*@aibankinginstitute.test
// users on the real project, cleaned up after).

import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import {
  cleanupSeededUser,
  getCourseE2ESchemaStatus,
  getFoundationEnrollment,
  grantFoundationEnrollment,
  grantTrustedDevice,
  markAllModulesComplete,
  seedConfirmedUser,
  setOnboardingAnswers,
  type SeededUser,
} from './helpers/seed';
import { loginViaUI } from './helpers/auth';
import type { OnboardingAnswers } from '@/types/course';

const ONBOARDING: OnboardingAnswers = {
  uses_m365: 'yes',
  personal_ai_subscriptions: ['ChatGPT'],
  primary_role: 'operations',
};

interface SubmitResult {
  status: number;
  body: {
    message?: string;
    certificateId?: string;
    verifyUrl?: string;
    certificateUrl?: string;
  };
}

async function seedCompletedLearner(): Promise<SeededUser> {
  const user = await seedConfirmedUser();
  await grantFoundationEnrollment(user.id, user.email);
  await setOnboardingAnswers(user.id, ONBOARDING);
  await markAllModulesComplete(user.id);
  return user;
}

async function trustAndLogin({
  page,
  context,
  baseURL,
  user,
}: {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly baseURL: string | undefined;
  readonly user: SeededUser;
}): Promise<void> {
  const trust = await grantTrustedDevice(user.id);
  const url = new URL(baseURL ?? 'http://localhost:3000');
  await context.addCookies([
    {
      name: trust.cookieName,
      value: trust.cookieToken,
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      secure: url.protocol === 'https:',
      sameSite: 'Lax',
    },
  ]);
  await loginViaUI(page, user);
}

// Build the final-packet body the certificate page submits. Field minimums:
// inputText/rawOutputText/annotationText >= 50, editedOutputText >= 100.
function finalPacketBody(enrollmentId: string) {
  return {
    enrollmentId,
    skillFileUrl: `${enrollmentId}/final-packet.md`,
    inputText:
      'The source banking task and prompt context I used to draft the final Foundation packet artifact.',
    rawOutputText:
      'The raw model output captured before any human review, editing, or policy-safe correction happened.',
    editedOutputText:
      'The reviewed, corrected, and policy-safe final output after I completed human review, removed sensitive ' +
      'details, fixed unsupported claims, and confirmed every artifact carries a review note before saving.',
    annotationText:
      'The annotation explaining what changed, why it changed, and how the bank-safe review step was applied.',
  };
}

async function submitWorkProduct(page: Page, enrollmentId: string): Promise<SubmitResult> {
  return page.evaluate(async (body) => {
    const res = await fetch('/api/courses/submit-work-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let parsed: Record<string, unknown> = {};
    try {
      parsed = (await res.json()) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
    return { status: res.status, body: parsed };
  }, finalPacketBody(enrollmentId));
}

test.describe('Foundation certificate approval -> issuance -> PDF chain', () => {
  test.skip(
    process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true',
    'Requires explicit Supabase seed opt-in: E2E_ALLOW_PRODUCTION_SUPABASE=true',
  );

  test('seeds a completed learner, issues a certificate, and serves a real PDF', async ({
    page,
    context,
    baseURL,
  }) => {
    const schemaStatus = await getCourseE2ESchemaStatus();
    test.skip(
      !schemaStatus.available,
      `Configured Supabase is missing course E2E tables: ${schemaStatus.missingTables.join(', ')}`,
    );

    const user = await seedCompletedLearner();
    try {
      await trustAndLogin({ page, context, baseURL, user });
      const enrollment = await getFoundationEnrollment(user.id);

      // (a) Submit the final packet — auto-approves and issues the certificate.
      const first = await submitWorkProduct(page, enrollment.id);
      expect(first.status, JSON.stringify(first.body)).toBe(201);
      expect(first.body.message).toBe('Work product approved');
      expect(typeof first.body.certificateId).toBe('string');
      expect(first.body.certificateId!.length).toBeGreaterThan(0);
      const certificateId = first.body.certificateId!;
      expect(first.body.verifyUrl).toBe(`/verify/${certificateId}`);

      // (b) Download the certificate PDF. page.request shares the browser
      //     context's session cookies, so this is an authenticated call.
      const pdfRes = await page.request.get(
        `/api/courses/generate-certificate?enrollmentId=${encodeURIComponent(enrollment.id)}`,
      );
      expect(pdfRes.status()).toBe(200);
      expect(pdfRes.headers()['content-type'] ?? '').toContain('application/pdf');
      expect(pdfRes.headers()['x-certificate-id']).toBe(certificateId);
      const pdfBody = await pdfRes.body();
      expect(pdfBody.byteLength).toBeGreaterThan(1000);
      expect(pdfBody.subarray(0, 5).toString('utf8')).toBe('%PDF-');

      // (c) Idempotency — a second submit returns the SAME certificate, not a
      //     duplicate or a new id.
      const second = await submitWorkProduct(page, enrollment.id);
      expect(second.status).toBe(200);
      expect(second.body.message).toBe('Work product already approved');
      expect(second.body.certificateId).toBe(certificateId);

      // (d) Public verification surface renders the issued credential.
      await page.goto(`/verify/${certificateId}`);
      await expect(
        page.getByRole('heading', { name: /This credential is authentic/i }),
      ).toBeVisible();
      await expect(page.getByText(certificateId)).toBeVisible();
    } finally {
      await cleanupSeededUser(user.id);
    }
  });
});
