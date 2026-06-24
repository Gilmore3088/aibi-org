import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PurchaseHelpPage from './page';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PurchaseHelpPage', () => {
  it('shows refund eligibility and response expectations before the support form', async () => {
    render(await PurchaseHelpPage({}));

    expect(screen.getByRole('heading', { name: /help with access/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /refund self-check/i })).toBeTruthy();
    expect(screen.getByText(/within 7 days of purchase/i)).toBeTruthy();
    expect(screen.getByText(/within 1 business day/i)).toBeTruthy();
    expect(screen.getByText(/fewer than two modules completed/i)).toBeTruthy();
    expect(screen.getByText(/approved refunds are issued manually in stripe/i)).toBeTruthy();
  });

  it('prefills purchase email for quick recovery and the support case form', async () => {
    render(await PurchaseHelpPage({
      searchParams: Promise.resolve({ email: 'branch.ops@communitybank.test' }),
    }));

    const emailFields = screen.getAllByLabelText(/purchase email/i);
    expect(emailFields).toHaveLength(2);
    for (const field of emailFields) {
      expect((field as HTMLInputElement).value).toBe('branch.ops@communitybank.test');
    }
  });

  it('lets stranded buyers request a fresh generic purchase access link', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        message: 'If that email has a purchase, a fresh access link is on its way.',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(await PurchaseHelpPage({
      searchParams: Promise.resolve({ email: 'cro@communitybank.test' }),
    }));

    fireEvent.click(screen.getByRole('button', { name: /resend purchase link/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/resend-purchase-link',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'cro@communitybank.test' }),
      }),
    ));
    expect(
      await screen.findByText(/If that email has a purchase, a fresh access link is on its way/i),
    ).toBeTruthy();
  });
});
