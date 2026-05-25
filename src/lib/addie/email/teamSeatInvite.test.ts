// teamSeatInvite — the invite renderer + Resend HTTP send.
// Stubs global fetch to avoid hitting the real Resend API.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTeamSeatInvite } from './teamSeatInvite';

describe('sendTeamSeatInvite', () => {
  const params = {
    to: 'banker@example.com',
    inviterName: 'Jane Compliance',
    institutionName: 'Riverside Community Bank',
    inviteUrl: 'https://aibankinginstitute.com/invite?token=signed-token-abc',
    expiresAt: new Date('2026-06-30T12:00:00Z'),
  };

  let origFetch: typeof global.fetch;
  let origSkip: string | undefined;
  let origKey: string | undefined;

  beforeEach(() => {
    origFetch = global.fetch;
    origSkip = process.env.SKIP_RESEND;
    origKey = process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    global.fetch = origFetch;
    if (origSkip === undefined) delete process.env.SKIP_RESEND;
    else process.env.SKIP_RESEND = origSkip;
    if (origKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = origKey;
  });

  it('skips when SKIP_RESEND is set', async () => {
    process.env.SKIP_RESEND = 'true';
    process.env.RESEND_API_KEY = 'rs-test-key';
    const result = await sendTeamSeatInvite(params);
    expect(result).toEqual({ skipped: true, reason: 'SKIP_RESEND env flag' });
  });

  it('skips when RESEND_API_KEY is missing', async () => {
    delete process.env.SKIP_RESEND;
    delete process.env.RESEND_API_KEY;
    const result = await sendTeamSeatInvite(params);
    expect(result).toEqual({ skipped: true, reason: 'RESEND_API_KEY not configured' });
  });

  it('POSTs to Resend with HTML + text + authorization header when enabled', async () => {
    delete process.env.SKIP_RESEND;
    process.env.RESEND_API_KEY = 'rs-test-key';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_abc' }),
    });
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const result = await sendTeamSeatInvite(params);

    expect(result).toEqual({ ok: true, id: 'email_abc' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer rs-test-key');
    const body = JSON.parse(init.body as string);
    expect(body.to).toEqual(['banker@example.com']);
    expect(body.subject).toMatch(/Riverside Community Bank/);
    expect(body.html).toContain('Riverside Community Bank');
    expect(body.html).toContain('Jane Compliance');
    expect(body.html).toContain('signed-token-abc');
    expect(body.text).toContain('Jane Compliance');
    expect(body.text).toContain('aibankinginstitute.com');
  });

  it('returns ok:false on Resend HTTP error', async () => {
    delete process.env.SKIP_RESEND;
    process.env.RESEND_API_KEY = 'rs-test-key';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => '{"message":"invalid recipient"}',
    });
    global.fetch = fetchMock as unknown as typeof global.fetch;
    const result = await sendTeamSeatInvite(params);
    expect(result).toMatchObject({ ok: false });
    expect((result as { error: string }).error).toMatch(/Resend HTTP 422/);
  });

  it('html-escapes inviter and institution names', async () => {
    delete process.env.SKIP_RESEND;
    process.env.RESEND_API_KEY = 'rs-test-key';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'x' }),
    });
    global.fetch = fetchMock as unknown as typeof global.fetch;
    await sendTeamSeatInvite({
      ...params,
      inviterName: 'A <script>alert(1)</script>',
      institutionName: 'Bank & Trust',
    });
    const body = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body);
    expect(body.html).not.toContain('<script>');
    expect(body.html).toContain('&lt;script&gt;');
    expect(body.html).toContain('Bank &amp; Trust');
  });
});
