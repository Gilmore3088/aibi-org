import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { notifyOpsAlert } from './alerts';

const ORIGINAL_ENV = process.env;

function resetAlertEnv() {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.OPS_ALERT_WEBHOOK_URL;
  delete process.env.OPS_ALERT_EMAIL;
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM;
  delete process.env.RESEND_FROM_NAME;
  delete process.env.SKIP_RESEND;
}

describe('notifyOpsAlert', () => {
  beforeEach(() => {
    resetAlertEnv();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    resetAlertEnv();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends through the configured webhook first', async () => {
    process.env.OPS_ALERT_WEBHOOK_URL = 'https://hooks.example.test/aibi';
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await notifyOpsAlert({
      title: 'Webhook check',
      message: 'Synthetic alert.',
    });

    expect(result).toMatchObject({ ok: true, channel: 'webhook', status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://hooks.example.test/aibi',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Webhook check'),
      }),
    );
  });

  it('falls back to Resend when the webhook fails', async () => {
    process.env.OPS_ALERT_WEBHOOK_URL = 'https://hooks.example.test/aibi';
    process.env.OPS_ALERT_EMAIL = 'ops@example.test';
    process.env.RESEND_API_KEY = 're_test';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(new Response('', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await notifyOpsAlert({
      severity: 'warning',
      title: 'Fallback check',
      message: 'Synthetic alert.',
    });

    expect(result).toMatchObject({ ok: true, channel: 'email', status: 202 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('ops@example.test'),
      }),
    );
  });

  it('returns a failed console result when no delivery transport is configured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await notifyOpsAlert({
      title: 'Missing transport check',
      message: 'Synthetic alert.',
    });

    expect(result.ok).toBe(false);
    expect(result.channel).toBe('console');
    expect(result.error).toContain('No OPS_ALERT_EMAIL configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
