import { test, expect } from '@playwright/test';

// API auth + rate-limit gate tests — covers §16.441-444 of the launch
// checklist. Each call is unauthenticated; we verify the route either
// rejects (401/403) or enforces input validation (400) without exposing
// internal errors (500). Rate-limit kicks (429) are not asserted because
// they depend on cumulative call history.

const PROTECTED_GET: ReadonlyArray<{ path: string; expectedStatus: number[] }> = [
  { path: '/api/dashboard/learner', expectedStatus: [401, 403, 404] },
  { path: '/api/assessment/pdf/download', expectedStatus: [400, 401, 403] },
];

const PROTECTED_POST: ReadonlyArray<{ path: string; body: unknown; expectedStatus: number[] }> = [
  { path: '/api/courses/save-progress', body: { enrollmentId: 'fake', moduleNumber: 1 }, expectedStatus: [401, 403] },
  { path: '/api/courses/submit-activity', body: { enrollmentId: 'fake', activityId: 'x', responses: {} }, expectedStatus: [401, 403, 400] },
  { path: '/api/courses/generate-certificate', body: { enrollmentId: 'fake' }, expectedStatus: [401, 403, 400] },
  { path: '/api/sandbox/chat', body: { messages: [{ role: 'user', content: 'hi' }], moduleId: 'm1', product: 'foundation', provider: 'claude', systemPrompt: 'be safe' }, expectedStatus: [401] },
  { path: '/api/toolbox/run', body: {}, expectedStatus: [400, 403] },
  { path: '/api/save-proficiency', body: { email: 'a@b.co', pctCorrect: 50, levelId: 'x', levelLabel: 'y', topicScores: [], completedAt: new Date().toISOString() }, expectedStatus: [401] },
];

const PUBLIC_BUT_VALIDATED: ReadonlyArray<{ path: string; body: unknown; expectedStatus: number[] }> = [
  { path: '/api/capture-email', body: { email: 'not-an-email' }, expectedStatus: [400] },
  { path: '/api/subscribe-newsletter', body: { email: 'not-an-email' }, expectedStatus: [400] },
  { path: '/api/inquiry', body: {}, expectedStatus: [400] },
  { path: '/api/waitlist', body: { email: 'not-an-email' }, expectedStatus: [400] },
  { path: '/api/checkout/in-depth', body: { mode: 'invalid' }, expectedStatus: [400] },
  { path: '/api/create-checkout', body: { mode: 'invalid' }, expectedStatus: [400] },
];

test.describe('API gates — authentication required', () => {
  for (const { path, expectedStatus } of PROTECTED_GET) {
    test(`GET ${path} rejects unauthenticated`, async ({ request }) => {
      const res = await request.get(path);
      expect(expectedStatus, `${path} returned ${res.status()}`).toContain(res.status());
    });
  }
  for (const { path, body, expectedStatus } of PROTECTED_POST) {
    test(`POST ${path} rejects unauthenticated`, async ({ request }) => {
      const res = await request.post(path, {
        data: body,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(expectedStatus, `${path} returned ${res.status()}`).toContain(res.status());
    });
  }
});

test.describe('API gates — public input validation', () => {
  for (const { path, body, expectedStatus } of PUBLIC_BUT_VALIDATED) {
    test(`POST ${path} validates input`, async ({ request }) => {
      const res = await request.post(path, {
        data: body,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(expectedStatus, `${path} returned ${res.status()}`).toContain(res.status());
    });
  }
});

test.describe('API gates — webhook signature', () => {
  test('§16.443 /api/webhooks/stripe rejects unsigned POST', async ({ request }) => {
    // No Stripe-Signature header → constructEvent throws → route should
    // return 400 (NOT 200, NOT 500 with stack trace).
    const res = await request.post('/api/webhooks/stripe', {
      data: { id: 'evt_fake', type: 'checkout.session.completed' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test('§16.443 /api/webhooks/stripe rejects POST with invalid signature', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: { id: 'evt_fake', type: 'checkout.session.completed' },
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 't=0,v1=deadbeef',
      },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('API gates — cron auth', () => {
  test('cron endpoints require CRON_SECRET bearer', async ({ request }) => {
    const paths = [
      '/api/assessment/pdf/cron-cleanup',
      '/api/cron/cleanup-rate-limits',
    ];
    for (const p of paths) {
      const res = await request.get(p);
      expect([401, 403], `${p} returned ${res.status()}`).toContain(res.status());
    }
  });
});
