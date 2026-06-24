import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(
    'next=/courses/foundation/program/certificate&email=buyer@example.com',
  ),
}));

vi.mock('@/lib/supabase/auth', () => ({
  sanitizeNext: (value: string | null) => value ?? '/dashboard',
  signIn: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({
        ok: true,
        message: 'Check your inbox for a one-time sign-in link.',
      }), { status: 200 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('leads returning certificate buyers with passwordless and purchase recovery paths', async () => {
    render(<LoginPage />);

    const signInButton = screen.getByRole('button', { name: /email me a sign-in link/i });
    const signInForm = signInButton.closest('form');
    if (!signInForm) throw new Error('sign-in form not found');

    expect((within(signInForm).getByLabelText('Email') as HTMLInputElement).value).toBe(
      'buyer@example.com',
    );
    fireEvent.click(signInButton);

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/auth/send-sign-in-link', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'buyer@example.com',
        next: '/courses/foundation/program/certificate',
      }),
    })));

    expect(screen.getByText(/bought something but cannot get in/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /resend purchase link/i })).toBeTruthy();
  });
});
