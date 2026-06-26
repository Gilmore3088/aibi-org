import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

import { POST } from './route';

const SECRET = `whsec_${Buffer.from('unit-test-secret').toString('base64')}`;

function signed(body: string, secret = SECRET) {
  const id = 'msg_123';
  const ts = '1700000000';
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const sig = createHmac('sha256', secretBytes).update(`${id}.${ts}.${body}`).digest('base64');
  return new Request('https://www.aibankinginstitute.com/api/webhooks/resend', {
    method: 'POST',
    headers: { 'svix-id': id, 'svix-timestamp': ts, 'svix-signature': `v1,${sig}` },
    body,
  });
}

describe('POST /api/webhooks/resend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.eq.mockResolvedValue({ error: null });
    mocks.update.mockReturnValue({ eq: mocks.eq });
    mocks.createServiceRoleClient.mockReturnValue({ from: () => ({ update: mocks.update }) });
    vi.stubEnv('RESEND_WEBHOOK_SECRET', SECRET);
  });
  afterEach(() => vi.unstubAllEnvs());

  it('marks the lead bounced on a verified email.bounced event', async () => {
    const body = JSON.stringify({ type: 'email.bounced', data: { to: ['WKeels@SafeFed.org'] } });
    const res = await POST(signed(body));
    expect(res.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ delivery_status: 'bounced' }),
    );
    expect(mocks.eq).toHaveBeenCalledWith('email', 'wkeels@safefed.org');
  });

  it('maps delivered/complained events', async () => {
    await POST(signed(JSON.stringify({ type: 'email.delivered', data: { to: ['a@b.com'] } })));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ delivery_status: 'delivered' }));
  });

  it('rejects an invalid signature with 401 and no DB write', async () => {
    const body = JSON.stringify({ type: 'email.bounced', data: { to: ['a@b.com'] } });
    const req = signed(body, `whsec_${Buffer.from('wrong-secret').toString('base64')}`);
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('returns 503 when the webhook secret is not configured', async () => {
    vi.stubEnv('RESEND_WEBHOOK_SECRET', '');
    const res = await POST(signed(JSON.stringify({ type: 'email.bounced', data: { to: ['a@b.com'] } })));
    expect(res.status).toBe(503);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('ignores event types it does not track (still 200, no write)', async () => {
    const res = await POST(signed(JSON.stringify({ type: 'email.opened', data: { to: ['a@b.com'] } })));
    expect(res.status).toBe(200);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
