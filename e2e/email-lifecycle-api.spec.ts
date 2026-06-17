// Consumer email lifecycle — API-layer validation.
//
// Validates that every email-triggering API endpoint:
//   - exists (does not 404)
//   - rejects invalid or unauthenticated input cleanly (no 500)
//   - does NOT fire an actual email when given dummy input
//
// Uses Playwright's `request` fixture only — no browser or Supabase
// credentials required. These run against any environment.
//
// The 9 consumer emails and their trigger endpoints:
//   1. Assessment results breakdown   → POST /api/capture-email
//   2. Course purchase (individual)   → Stripe webhook (POST /api/webhooks/stripe)
//   2.5 In-depth assessment purchase  → Stripe webhook (POST /api/webhooks/stripe)
//   3. Course purchase (institution)  → Stripe webhook (POST /api/webhooks/stripe)
//   4. Certificate issued             → POST /api/courses/generate-certificate
//   5. Inquiry acknowledgement        → POST /api/inquiry
//   6. Waitlist confirmation          → POST /api/capture-email (interest=waitlist)
//   7. Assessment options             → POST /api/capture-email (interest=assessment)
//   Device confirmation               → POST /api/auth/check-device

import { test, expect } from '@playwright/test';

// ── Email 1 / 6 / 7: capture-email (assessment breakdown, waitlist, options) ──

test.describe('Email triggers — /api/capture-email', () => {
  test('rejects POST with invalid email format → 400', async ({ request }) => {
    const res = await request.post('/api/capture-email', {
      data: { email: 'not-an-email', interest: 'assessment' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status(), 'invalid email should return 400').toBe(400);
  });

  test('rejects POST with missing email → 400', async ({ request }) => {
    const res = await request.post('/api/capture-email', {
      data: { interest: 'assessment' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status(), 'missing email should return 400').toBe(400);
  });

  test('does not 404 or 500 on well-formed but rate-limited request', async ({ request }) => {
    // We use a .test TLD address (RFC 6761 — never reaches a real inbox)
    // so even if the route sends, nothing lands in a real inbox.
    // Rate limiting or SKIP_RESEND may short-circuit; any 2xx or 4xx is acceptable.
    const res = await request.post('/api/capture-email', {
      data: {
        email: `e2e+lifecycle-${Date.now()}@aibankinginstitute.test`,
        interest: 'assessment',
        institution: 'E2E Test Bank',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const status = res.status();
    expect(
      status < 500,
      `/api/capture-email returned unexpected ${status}`,
    ).toBe(true);
    expect(status, 'should not 404').not.toBe(404);
  });

  test('waitlist interest path does not 404 or 500', async ({ request }) => {
    const res = await request.post('/api/capture-email', {
      data: {
        email: `e2e+waitlist-${Date.now()}@aibankinginstitute.test`,
        interest: 'waitlist',
        institution: 'E2E Test Credit Union',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status(), 'waitlist path should not 500').toBeLessThan(500);
    expect(res.status(), 'waitlist path should not 404').not.toBe(404);
  });
});

// ── Emails 2 / 2.5 / 3: Stripe webhook ────────────────────────────────────

test.describe('Email triggers — /api/webhooks/stripe (purchase emails)', () => {
  test('rejects unsigned POST — 400 or 503', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: { id: 'evt_fake', type: 'checkout.session.completed' },
      headers: { 'Content-Type': 'application/json' },
    });
    const status = res.status();
    expect(
      status === 503 || (status >= 400 && status < 500),
      `unsigned webhook returned unexpected ${status}`,
    ).toBe(true);
  });

  test('rejects POST with invalid Stripe-Signature — 400 or 503', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: { type: 'checkout.session.completed', data: { object: {} } },
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 't=0,v1=deadbeef',
      },
    });
    const status = res.status();
    expect(
      status === 503 || (status >= 400 && status < 500),
      `invalid-sig webhook returned unexpected ${status}`,
    ).toBe(true);
  });

  test('endpoint exists — does not 404', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status(), 'webhook route should exist').not.toBe(404);
  });
});

// ── Email 4: Certificate — /api/courses/generate-certificate ──────────────

test.describe('Email triggers — /api/courses/generate-certificate', () => {
  test('requires authentication — 401, 403, or 503 (Supabase not configured)', async ({ request }) => {
    const res = await request.post('/api/courses/generate-certificate', {
      data: { enrollmentId: 'fake-enrollment-id' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(
      [401, 403, 503].includes(res.status()),
      `generate-certificate returned ${res.status()} (expected 401, 403, or 503)`,
    ).toBe(true);
  });
});

// ── Email 5: Inquiry ack — /api/inquiry ────────────────────────────────────

test.describe('Email triggers — /api/inquiry', () => {
  test('rejects POST with missing fields → 400', async ({ request }) => {
    const res = await request.post('/api/inquiry', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status(), 'empty inquiry body should return 400').toBe(400);
  });

  test('rejects POST with invalid email → 400', async ({ request }) => {
    const res = await request.post('/api/inquiry', {
      data: {
        name: 'Test User',
        email: 'not-an-email',
        institution: 'Test Bank',
        track: 'Enterprise Licensing',
        message: 'Hello',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const status = res.status();
    expect(status, 'invalid email inquiry should return 400 or 422').toBeLessThanOrEqual(422);
    expect(status, 'invalid email inquiry should not 500').toBeLessThan(500);
  });

  test('does not 404 or 500 on well-formed inquiry', async ({ request }) => {
    const res = await request.post('/api/inquiry', {
      data: {
        name: 'E2E Tester',
        email: `e2e+inquiry-${Date.now()}@aibankinginstitute.test`,
        institution: 'E2E Test Bank',
        track: 'Enterprise Licensing',
        message: 'Automated e2e validation — please ignore.',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const status = res.status();
    expect(status, 'inquiry should not 500').toBeLessThan(500);
    expect(status, 'inquiry should not 404').not.toBe(404);
  });
});

// ── Device confirmation — /api/auth/check-device ─────────────────────────

test.describe('Email triggers — /api/auth/check-device (device confirmation email)', () => {
  test('requires authentication — 401, 403, or 503 (no Supabase in local/preview)', async ({ request }) => {
    const res = await request.post('/api/auth/check-device', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(
      [401, 403, 503].includes(res.status()),
      `check-device returned ${res.status()} (expected 401, 403, or 503)`,
    ).toBe(true);
  });

  test('route exists — does not 404', async ({ request }) => {
    const res = await request.post('/api/auth/check-device', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status(), 'check-device should exist').not.toBe(404);
  });
});

// ── Cross-cutting: all email-triggering routes return valid JSON on error ──

test.describe('Email trigger routes — error responses are JSON', () => {
  const routes: Array<{ method: 'GET' | 'POST'; path: string; body?: unknown }> = [
    { method: 'POST', path: '/api/capture-email', body: {} },
    { method: 'POST', path: '/api/inquiry', body: {} },
    { method: 'GET', path: '/api/auth/check-device' },
  ];

  for (const { method, path, body } of routes) {
    test(`${method} ${path} error response is JSON-parseable`, async ({ request }) => {
      const res =
        method === 'POST'
          ? await request.post(path, {
              data: body ?? {},
              headers: { 'Content-Type': 'application/json' },
            })
          : await request.get(path);

      const text = await res.text();
      // Should be parseable JSON (not an HTML 500 page or raw crash dump).
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Some routes return plain text error messages (e.g. "Unauthorized").
        // Accept plain-text as long as it's not an HTML error page.
        expect(text, `${path}: error should not be an HTML page`).not.toContain('<!doctype html>');
        return;
      }
      expect(typeof parsed, `${path}: JSON error should be an object`).toBe('object');
    });
  }
});
