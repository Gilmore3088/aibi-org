import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CaseActions } from './CaseActions';

describe('CaseActions', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('records refund approval and denial as support timeline events', async () => {
    render(<CaseActions caseId="case-123" initialStatus="open" initialPriority="high" />);

    fireEvent.click(screen.getByRole('button', { name: /record refund approved/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/admin/support/cases/case-123/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          eventType: 'refund_approved',
          message: 'Refund approved for manual processing in Stripe.',
        }),
      }),
    );

    fetchMock.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /record refund denied/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/admin/support/cases/case-123/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          eventType: 'refund_denied',
          message: 'Refund denied after eligibility review.',
        }),
      }),
    );
  });

  it('records manual refund completion without calling Stripe APIs', async () => {
    render(<CaseActions caseId="case-123" initialStatus="open" initialPriority="high" />);

    fireEvent.click(screen.getByRole('button', { name: /record manual refund/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/admin/support/cases/case-123/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          eventType: 'refund_manually_issued',
          message: 'Refund was issued manually in Stripe.',
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/admin/support/cases/case-123',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          status: 'refunded',
          message: 'Manual refund recorded after Stripe processing.',
        }),
      }),
    );
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      '/api/admin/support/cases/case-123/events',
      '/api/admin/support/cases/case-123',
    ]);
  });
});
