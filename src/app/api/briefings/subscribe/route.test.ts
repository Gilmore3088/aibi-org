import { describe, it, expect, vi, beforeEach } from 'vitest';

const subscribeToGroup = vi.fn();
vi.mock('@/lib/mailerlite', () => ({ subscribeToGroup: (...a: unknown[]) => subscribeToGroup(...a) }));
vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: vi.fn().mockResolvedValue(null),
  getRequestIp: () => '127.0.0.1',
}));

import { POST } from './route';

function req(body: unknown): Request {
  return new Request('http://localhost/api/briefings/subscribe', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/briefings/subscribe', () => {
  beforeEach(() => {
    subscribeToGroup.mockReset();
    process.env.MAILERLITE_GROUP_ID_BRIEFINGS = 'grp-1';
  });

  it('rejects an invalid email', async () => {
    const res = await POST(req({ email: 'nope' }));
    expect(res.status).toBe(400);
    expect(subscribeToGroup).not.toHaveBeenCalled();
  });

  it('subscribes a valid email to the briefings group', async () => {
    subscribeToGroup.mockResolvedValue({ status: 'subscribed' });
    const res = await POST(req({ email: ' Reader@Bank.com ' }));
    expect(res.status).toBe(200);
    expect(subscribeToGroup).toHaveBeenCalledWith(
      { email: 'reader@bank.com', fields: { lead_source: 'briefings-digest' } },
      'grp-1',
    );
  });

  it('returns 502 when MailerLite fails', async () => {
    subscribeToGroup.mockResolvedValue({ status: 'failed', reason: 'boom' });
    const res = await POST(req({ email: 'a@b.com' }));
    expect(res.status).toBe(502);
  });
});
