import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';

const updateEq = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn((..._args: unknown[]) => ({ eq: updateEq }));
const from = vi.fn(() => ({ update }));

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: () => true,
  createServiceRoleClient: () => ({ from }),
}));

import { POST } from './route';

const SECRET = 'test-webhook-secret';

function makeRequest(body: unknown, signature?: string): Request {
  const raw = JSON.stringify(body);
  const sig = signature ?? createHmac('sha256', SECRET).update(raw).digest('hex');
  return new Request('https://example.com/api/webhooks/mailerlite', {
    method: 'POST',
    headers: { signature: sig, 'content-type': 'application/json' },
    body: raw,
  });
}

describe('POST /api/webhooks/mailerlite', () => {
  beforeEach(() => {
    process.env.MAILERLITE_WEBHOOK_SECRET = SECRET;
    vi.clearAllMocks();
  });
  afterEach(() => {
    delete process.env.MAILERLITE_WEBHOOK_SECRET;
  });

  it('503s when the secret is not configured', async () => {
    delete process.env.MAILERLITE_WEBHOOK_SECRET;
    const res = await POST(makeRequest({ type: 'subscriber.bounced' }));
    expect(res.status).toBe(503);
  });

  it('401s on a bad signature', async () => {
    const res = await POST(makeRequest({ type: 'subscriber.bounced' }, 'nope'));
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it('accepts a base64-encoded signature', async () => {
    const body = { type: 'subscriber.bounced', data: { subscriber: { email: 'a@b.com' } } };
    const raw = JSON.stringify(body);
    const sig = createHmac('sha256', SECRET).update(raw).digest('base64');
    const res = await POST(makeRequest(body, sig));
    expect(res.status).toBe(200);
  });

  it('marks a bounce on the lead row', async () => {
    const res = await POST(
      makeRequest({ type: 'subscriber.bounced', data: { subscriber: { email: 'Bounce@Bank.com' } } }),
    );
    expect(res.status).toBe(200);
    expect(from).toHaveBeenCalledWith('leads');
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ delivery_status: 'bounced' }));
    expect(updateEq).toHaveBeenCalledWith('email', 'bounce@bank.com');
  });

  it('revokes opt-in on unsubscribe without touching delivery status', async () => {
    await POST(makeRequest({ type: 'subscriber.unsubscribed', subscriber: { email: 'x@y.com' } }));
    const arg = update.mock.calls[0]?.[0] as unknown as Record<string, unknown>;
    expect(arg.marketing_opt_in).toBe(false);
    expect(arg.delivery_status).toBeUndefined();
  });

  it('marks complained and revokes opt-in on spam report', async () => {
    await POST(makeRequest({ type: 'subscriber.spam_reported', data: { email: 'z@w.com' } }));
    const arg = update.mock.calls[0]?.[0] as unknown as Record<string, unknown>;
    expect(arg.delivery_status).toBe('complained');
    expect(arg.marketing_opt_in).toBe(false);
  });

  it('200s and skips the database on unhandled event types', async () => {
    const res = await POST(
      makeRequest({ type: 'subscriber.created', data: { subscriber: { email: 'n@m.com' } } }),
    );
    expect(res.status).toBe(200);
    expect(from).not.toHaveBeenCalled();
  });
});
