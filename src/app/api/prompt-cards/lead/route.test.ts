import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  recordLead: vi.fn(),
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  rateLimitOrFail: vi.fn(),
  getRequestIp: vi.fn(),
}));

vi.mock('@/lib/leads/recordLead', () => ({
  recordLead: mocks.recordLead,
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: mocks.rateLimitOrFail,
  getRequestIp: mocks.getRequestIp,
}));

import { POST } from './route';

function request(body: unknown): Request {
  return new Request('https://www.aibankinginstitute.com/api/prompt-cards/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.56' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/prompt-cards/lead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimitOrFail.mockResolvedValue(null);
    mocks.getRequestIp.mockReturnValue('203.0.113.56');
    mocks.isSupabaseConfigured.mockReturnValue(false);
    mocks.recordLead.mockResolvedValue({ persisted: true, mailerlite: 'subscribed' });
  });

  it.each([
    'practitioner',
    'compliance-risk',
    'executive',
    'training-buyer',
    'other',
  ])('accepts the client role value %s', async (role) => {
    const response = await POST(request({
      email: 'collector@communitybank.test',
      role,
      institutionType: 'Credit union',
      assetSize: '$500M-$1B',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.headers.get('set-cookie')).toContain(
      'aibi_free_resource_email=collector%40communitybank.test',
    );
    expect(mocks.recordLead).toHaveBeenCalledWith({
      email: 'collector@communitybank.test',
      source: 'prompt-cards',
      role,
      institution: 'Credit union',
      metadata: { assetSize: '$500M-$1B' },
    });
  });

  it('rejects unknown role values before lead capture', async () => {
    const response = await POST(request({
      email: 'collector@communitybank.test',
      role: 'marketing',
      institutionType: 'Credit union',
      assetSize: '$500M-$1B',
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Role is required.' });
    expect(mocks.recordLead).not.toHaveBeenCalled();
  });
});
