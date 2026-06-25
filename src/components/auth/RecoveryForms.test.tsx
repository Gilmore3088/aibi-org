import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailLinkForm, PurchaseRecoveryForm } from './RecoveryForms';

// Mirrors src/app/auth/login/page.test.tsx — proves the extracted recovery
// forms POST the correct sessionless endpoints with the correct bodies.
// These forms back both /auth/login and the device-trust holding page
// /auth/confirm-device-pending.

describe('RecoveryForms', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ ok: true, message: 'Sent.' }), { status: 200 }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('EmailLinkForm POSTs /api/auth/send-sign-in-link with the prefilled email and forwarded next', async () => {
    render(
      <EmailLinkForm redirectTo="/assessment/in-depth/take" prefillEmail="buyer@example.com" />,
    );

    const button = screen.getByRole('button', { name: /email me a sign-in link/i });
    const form = button.closest('form');
    if (!form) throw new Error('email-link form not found');

    expect((within(form).getByLabelText('Email') as HTMLInputElement).value).toBe(
      'buyer@example.com',
    );

    fireEvent.click(button);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/auth/send-sign-in-link',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'buyer@example.com',
            next: '/assessment/in-depth/take',
          }),
        }),
      ),
    );
  });

  it('PurchaseRecoveryForm POSTs /api/auth/resend-purchase-link with the prefilled email', async () => {
    render(<PurchaseRecoveryForm prefillEmail="buyer@example.com" />);

    const button = screen.getByRole('button', { name: /resend purchase link/i });
    const form = button.closest('form');
    if (!form) throw new Error('purchase-recovery form not found');

    expect((within(form).getByLabelText('Purchase email') as HTMLInputElement).value).toBe(
      'buyer@example.com',
    );

    fireEvent.click(button);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/auth/resend-purchase-link',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'buyer@example.com' }),
        }),
      ),
    );
  });
});
