// Tests for POST /api/addie/contact-sales — validation, rate limiting,
// SKIP_* suppression, and the happy path.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const insertMock = vi.fn();
const mlMock = vi.fn();
const notifyMock = vi.fn();

vi.mock('@/lib/addie/leads/salesLead', async () => {
  const actual = await vi.importActual<typeof import('@/lib/addie/leads/salesLead')>(
    '@/lib/addie/leads/salesLead',
  );
  return {
    ...actual,
    insertSalesLead: (input: unknown) => insertMock(input),
    syncSalesLeadToMailerLite: (input: unknown) => mlMock(input),
    notifySalesLeadInternal: (input: unknown) => notifyMock(input),
  };
});

import { POST } from './route';
import { _resetEdgeRateLimitForTests } from '@/lib/addie/rateLimit/edge';

interface Body {
  [k: string]: unknown;
}

function makeReq(body: Body, ip = '10.0.0.1'): NextRequest {
  return new Request('http://localhost/api/addie/contact-sales', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const validBody: Body = {
  fi_name: 'First National Community Bank',
  fi_type: 'community_bank',
  asset_size: '500m_to_1b',
  seats: 25,
  timeline: 'this_quarter',
  contact_name: 'Jane Banker',
  email: 'jane@firstnationalcb.com',
  phone: '555-0100',
  notes: 'We want all branch managers through by Q3.',
};

beforeEach(() => {
  insertMock.mockReset();
  mlMock.mockReset();
  notifyMock.mockReset();
  _resetEdgeRateLimitForTests();
  delete process.env.SKIP_MAILERLITE;
  delete process.env.SKIP_RESEND;
});
afterEach(() => vi.clearAllMocks());

describe('POST /api/addie/contact-sales', () => {
  it('persists a valid submission and fires both side effects', async () => {
    insertMock.mockResolvedValueOnce({ id: 'lead-uuid-1', email: 'jane@firstnationalcb.com' });
    mlMock.mockResolvedValueOnce(undefined);
    notifyMock.mockResolvedValueOnce(undefined);

    const res = await POST(makeReq(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, lead_id: 'lead-uuid-1' });
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(mlMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledTimes(1);
  });

  it('returns 400 with field-level issues on missing required fields', async () => {
    const res = await POST(makeReq({ email: 'not-an-email' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('validation_failed');
    expect(Array.isArray(json.issues)).toBe(true);
    const fields = (json.issues as { field: string }[]).map((i) => i.field);
    expect(fields).toContain('fi_name');
    expect(fields).toContain('fi_type');
    expect(fields).toContain('email');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('returns 400 when seats is below 1', async () => {
    const res = await POST(makeReq({ ...validBody, seats: 0 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect((json.issues as { field: string }[]).some((i) => i.field === 'seats')).toBe(true);
  });

  it('rate-limits after five submissions per IP per hour', async () => {
    insertMock.mockResolvedValue({ id: 'lead', email: 'jane@firstnationalcb.com' });
    mlMock.mockResolvedValue(undefined);
    notifyMock.mockResolvedValue(undefined);

    for (let i = 0; i < 5; i++) {
      const res = await POST(makeReq(validBody, '10.0.0.99'));
      expect(res.status).toBe(200);
    }
    const blocked = await POST(makeReq(validBody, '10.0.0.99'));
    expect(blocked.status).toBe(429);
  });

  it('still persists when SKIP_MAILERLITE/SKIP_RESEND are set (side effects suppressed inside helpers)', async () => {
    process.env.SKIP_MAILERLITE = 'true';
    process.env.SKIP_RESEND = 'true';
    insertMock.mockResolvedValueOnce({ id: 'lead-uuid-2', email: 'jane@firstnationalcb.com' });
    mlMock.mockResolvedValueOnce(undefined);
    notifyMock.mockResolvedValueOnce(undefined);

    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
    // The route calls them; the SKIP_* gate lives inside the helper itself.
    expect(mlMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledTimes(1);
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost/api/addie/contact-sales', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.0.0.2' },
      body: 'not-json',
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid_json');
  });
});
