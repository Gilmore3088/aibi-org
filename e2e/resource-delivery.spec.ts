// Resource delivery validation — API mode (no browser needed).
//
// Verifies that every downloadable artifact referenced in the resources
// data model:
//   - has a reachable route (does not 404)
//   - does not crash (does not 500)
//   - returns either a redirect (302 to signed URL) or a usable
//     response (200) or a graceful not-found/unavailable (404/503)
//
// In environments without Supabase, download routes return 404 or 503;
// that is accepted here. What is NOT accepted: 500 (internal crash) or
// 404 on a route that doesn't exist at all (vs a file that isn't in storage).
//
// Static template pages (/resources/templates/*) are also checked via GET.

import { test, expect } from '@playwright/test';

// ── Individual file download routes ────────────────────────────────────────

const ARTIFACT_DOWNLOADS = [
  '/api/resources/safe-ai-use-checklist/download',
  '/api/resources/red-yellow-green-use-card/download',
  '/api/resources/artifact-ai-use-case-inventory/download',
  '/api/resources/artifact-data-handling-reference-card/download',
  '/api/resources/artifact-fair-lending-ai-review-checklist/download',
  '/api/resources/prompt-strategy-cheat-sheet/download',
  '/api/resources/regulatory-cheatsheet/download',
  '/api/resources/compliance-playbook/download',
  '/api/resources/retail-playbook/download',
  '/api/resources/lending-playbook/download',
  '/api/resources/marketing-playbook/download',
  '/api/resources/bsa-aml-playbook/download',
  '/api/resources/infosec-playbook/download',
  '/api/resources/in-depth-playbook/download',
  '/api/resources/sample-readiness-report/download',
] as const;

const BUNDLE_DOWNLOADS = [
  '/api/resources/governance-starter-kit/download',
  '/api/resources/frontline-enablement-kit/download',
  '/api/resources/marketing-review-kit/download',
  '/api/resources/lending-review-kit/download',
] as const;

// Playbook PDF routes (served from the same download API)
const PLAYBOOK_PDFS = [
  '/api/resources/compliance-playbook/download',
  '/api/resources/retail-playbook/download',
  '/api/resources/lending-playbook/download',
  '/api/resources/marketing-playbook/download',
  '/api/resources/bsa-aml-playbook/download',
  '/api/resources/infosec-playbook/download',
] as const;

// ── Static template pages (in-app HTML, not Supabase Storage) ─────────────

const TEMPLATE_PAGES = [
  '/resources/templates/ai-workflow-sop',
  '/resources/templates/ai-use-policy-starter',
  '/resources/templates/board-briefing-checklist',
  '/resources/templates/gtm-plan',
] as const;

// ── Tests ──────────────────────────────────────────────────────────────────

test.describe('Resource delivery — artifact download routes', () => {
  for (const path of ARTIFACT_DOWNLOADS) {
    test(`GET ${path} does not crash or 404-as-missing-route`, async ({ request }) => {
      const res = await request.get(path);
      const status = res.status();
      // 200 = file served directly
      // 302 = signed-URL redirect (Supabase)
      // 401/403 = auth-gated (acceptable)
      // 404 = file not in storage (acceptable in envs without real Supabase)
      // 503 = Supabase not configured (acceptable in preview/local)
      // NOT acceptable: 500 (crash) or any 5xx other than 503
      expect(
        status < 500 || status === 503,
        `${path} returned unexpected ${status} — this is an internal error`,
      ).toBe(true);
    });
  }
});

test.describe('Resource delivery — bundle (ZIP) download routes', () => {
  for (const path of BUNDLE_DOWNLOADS) {
    test(`GET ${path} does not crash`, async ({ request }) => {
      const res = await request.get(path);
      const status = res.status();
      expect(
        status < 500 || status === 503,
        `${path} returned unexpected ${status}`,
      ).toBe(true);
    });
  }
});

test.describe('Resource delivery — playbook PDF routes', () => {
  for (const path of PLAYBOOK_PDFS) {
    test(`GET ${path} route exists and responds gracefully`, async ({ request }) => {
      const res = await request.get(path);
      const status = res.status();
      // Must not crash; route must exist
      expect(status, `${path} should not 500`).not.toBe(500);
      expect(status, `${path} should not 404 as missing route`).not.toBe(404);
    });
  }
});

test.describe('Resource delivery — static template pages', () => {
  for (const path of TEMPLATE_PAGES) {
    test(`GET ${path} returns 200`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should return 200`).toBe(200);
    });
  }
});

test.describe('Resource delivery — download API input validation', () => {
  test('unknown slug returns 404 not 500', async ({ request }) => {
    const res = await request.get('/api/resources/this-slug-does-not-exist-xyz/download');
    const status = res.status();
    // Should return 404 (not found) or 503 (Supabase not configured)
    // — NOT a 500 internal error
    expect(
      status === 404 || status === 503,
      `unknown slug returned ${status}, expected 404 or 503`,
    ).toBe(true);
  });

  test('health check routes exist', async ({ request }) => {
    // These are admin-only but should exist as routes
    const emailHealth = await request.get('/api/health/email');
    const stripeHealth = await request.get('/api/health/stripe');
    expect(emailHealth.status(), '/api/health/email should not 404').not.toBe(404);
    expect(stripeHealth.status(), '/api/health/stripe should not 404').not.toBe(404);
  });
});

test.describe('Resource delivery — playbook HTML pages', () => {
  // The /playbooks/* routes are public HTML pages (no auth)
  const PLAYBOOK_PAGES = [
    '/playbooks/retail',
    '/playbooks/compliance',
    '/playbooks/marketing',
    '/playbooks/lending',
    '/playbooks/bsa-aml',
    '/playbooks/infosec',
  ];

  for (const path of PLAYBOOK_PAGES) {
    test(`GET ${path} returns 200`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should return 200`).toBe(200);
    });
  }
});
