import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(() => false),
  certSingle: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
  createServiceRoleClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ single: mocks.certSingle }),
      }),
    }),
  }),
}));

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-real-ip': '203.0.113.9' }),
}));

vi.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
}));

describe('CertificateVerificationPage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(false);
    mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 29, resetAt: new Date(0) });
  });

  it('keeps unknown certificate IDs in the lookup flow', async () => {
    const Page = (await import('./page')).default;

    render(await Page({ params: Promise.resolve({ certificateId: 'AIBIP-2026-MISSING' }) }));

    expect(screen.getByRole('heading', { name: /certificate not found/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /try another certificate id/i }).getAttribute('href')).toBe(
      '/verify',
    );
  });

  it('shows documented seat time and topics on a verified certificate', async () => {
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.certSingle.mockResolvedValue({
      data: {
        holder_name: 'Alex Founder',
        designation: 'AiBI-Foundation',
        issued_at: '2026-06-23T12:30:00.000Z',
      },
      error: null,
    });
    const Page = (await import('./page')).default;

    render(await Page({ params: Promise.resolve({ certificateId: 'AIBIP-2026-ABC234' }) }));

    expect(screen.getByRole('heading', { name: /this credential is authentic/i })).toBeTruthy();
    expect(screen.getByText(/documented seat time/i)).toBeTruthy();
    expect(screen.getByText(/~\d+(\.\d+)? hours · \d+ self-paced modules/i)).toBeTruthy();
    expect(screen.getByText(/topics covered/i)).toBeTruthy();
    expect(screen.getByText(/Awareness, Understanding, Creation, Application/)).toBeTruthy();
    // The verification boundary sentence must survive the addition.
    expect(screen.getByText(/not regulator or\s+third-party endorsement/i)).toBeTruthy();
  });

  it('throttles scripted lookups per IP without breaking the not-found flow copy', async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date(0) });
    const Page = (await import('./page')).default;

    render(await Page({ params: Promise.resolve({ certificateId: 'AIBIP-2026-ABC234' }) }));

    expect(screen.getByRole('heading', { name: /too many lookups/i })).toBeTruthy();
    expect(screen.getByText(/verifying certificates in bulk/i)).toBeTruthy();
    // Over-limit must not leak whether the certificate exists.
    expect(screen.queryByText(/this credential is authentic/i)).toBeNull();
    expect(screen.queryByText(/certificate not found/i)).toBeNull();
  });

  it('fails open when the rate-limit store is unavailable', async () => {
    mocks.checkRateLimit.mockRejectedValue(new Error('store down'));
    const Page = (await import('./page')).default;

    render(await Page({ params: Promise.resolve({ certificateId: 'AIBIP-2026-MISSING' }) }));

    expect(screen.getByRole('heading', { name: /certificate not found/i })).toBeTruthy();
  });
});
