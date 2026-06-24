import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AiBIPurchasedPage from './page';

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
  })),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: { id: 'user_123', email: 'branch.ops@communitybank.test' },
        },
      })),
    },
  })),
}));

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/stripe/get-validated-paid-session', () => ({
  getValidatedPaidSession: vi.fn(async () => null),
}));

vi.mock('@/lib/supabase/auth-admin', () => ({
  ensureAuthUser: vi.fn(),
  generateMagicLink: vi.fn(),
}));

describe('/courses/foundation/program/purchased', () => {
  it('routes filtered purchase-email recovery to purchase help with the checkout email', async () => {
    render(await AiBIPurchasedPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByText(/a Stripe receipt and a welcome email are on their way/i),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /resend the purchase link or open support/i }).getAttribute('href'),
    ).toBe('/support/purchase-help?email=branch.ops%40communitybank.test');
  });
});
