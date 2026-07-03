import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(() => false),
  certSingle: vi.fn(),
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

describe('CertificateVerificationPage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(false);
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
});
