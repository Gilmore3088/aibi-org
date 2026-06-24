import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GuideRequestForm } from './GuideRequestForm';

function fillForm() {
  fireEvent.change(screen.getByLabelText(/Your name/i), {
    target: { value: 'Jordan Lee' },
  });
  fireEvent.change(screen.getByLabelText(/Work email/i), {
    target: { value: 'jordan@bank.test' },
  });
  fireEvent.change(screen.getByLabelText(/Institution/i), {
    target: { value: 'Community Bank' },
  });
}

describe('GuideRequestForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('shows success only after lead capture and PDF fetch both succeed', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['%PDF-1.7'], { type: 'application/pdf' }),
    });
    const clickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:safe-ai-guide');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    vi.stubGlobal('fetch', fetchMock);

    render(<GuideRequestForm />);

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /email me the guide/i }));

    await waitFor(() => expect(screen.getByText(/Your guide is ready/i)).toBeTruthy());

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/inquiry', expect.objectContaining({
      method: 'POST',
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/guides/safe-ai-use?source_surface=security-safe-ai-guide',
    );
    expect(window.sessionStorage.getItem('aibi.freeResource.email')).toBe('jordan@bank.test');
    expect(createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });

  it('does not show success when the PDF endpoint fails after lead capture', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'PDF unavailable. Please try again.' }),
      });
    const clickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    vi.stubGlobal('fetch', fetchMock);

    render(<GuideRequestForm />);

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /email me the guide/i }));

    expect((await screen.findByRole('alert')).textContent).toBe('PDF unavailable. Please try again.');
    expect(screen.queryByText(/Your guide is ready/i)).toBeNull();
    expect(window.sessionStorage.getItem('aibi.freeResource.email')).toBeNull();
    expect(clickMock).not.toHaveBeenCalled();
  });
});
