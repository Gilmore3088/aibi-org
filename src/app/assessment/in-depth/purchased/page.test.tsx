import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import InDepthPurchasedPage from './page';

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
          user: { id: 'user_123', email: 'buyer@example.com' },
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

vi.mock('./_components/InstitutionContextForm', () => ({
  InstitutionContextForm: () => <div data-testid="institution-context-form" />,
}));

describe('/assessment/in-depth/purchased', () => {
  it('points signed-in buyers to the real paid Toolbox and keeps public resources secondary', async () => {
    render(await InDepthPurchasedPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole('heading', { name: /open your paid toolbox/i })).toBeTruthy();
    expect(screen.getByText(/Your In-Depth purchase includes paid Toolbox access/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /open the toolbox/i }).getAttribute('href')).toBe(
      '/dashboard/toolbox',
    );
    expect(screen.getByRole('link', { name: /browse public resources/i }).getAttribute('href')).toBe(
      '/resources',
    );
    expect(screen.queryByText(/Browse the library/i)).toBeNull();
  });
});
