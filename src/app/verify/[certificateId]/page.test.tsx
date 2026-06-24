import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: () => false,
  createServiceRoleClient: vi.fn(),
}));

describe('CertificateVerificationPage', () => {
  it('keeps unknown certificate IDs in the lookup flow', async () => {
    const Page = (await import('./page')).default;

    render(await Page({ params: Promise.resolve({ certificateId: 'AIBIP-2026-MISSING' }) }));

    expect(screen.getByRole('heading', { name: /certificate not found/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /try another certificate id/i }).getAttribute('href')).toBe(
      '/verify',
    );
  });
});
