import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const ORIGINAL_ENV = process.env;

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.CRON_SECRET;
  delete process.env.OPS_ALERT_WEBHOOK_URL;
  delete process.env.OPS_ALERT_EMAIL;
  delete process.env.RESEND_API_KEY;
}

describe('POST /api/ops/alert-test', () => {
  beforeEach(() => {
    resetEnv();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    resetEnv();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fails closed when CRON_SECRET is not configured', async () => {
    const response = await POST(new Request('https://example.test/api/ops/alert-test', {
      method: 'POST',
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'CRON_SECRET is not configured.',
    });
  });

  it('requires the bearer token', async () => {
    process.env.CRON_SECRET = 'secret';

    const response = await POST(new Request('https://example.test/api/ops/alert-test', {
      method: 'POST',
    }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Unauthorized.',
    });
  });

  it('sends an authorized test alert', async () => {
    process.env.CRON_SECRET = 'secret';
    process.env.OPS_ALERT_WEBHOOK_URL = 'https://hooks.example.test/aibi';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 200 })));

    const response = await POST(new Request('https://example.test/api/ops/alert-test', {
      method: 'POST',
      headers: { authorization: 'Bearer secret' },
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      channel: 'webhook',
      configured: {
        webhook: true,
      },
    });
  });
});
