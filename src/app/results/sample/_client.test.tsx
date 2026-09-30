import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ResultsPage from './_client';

function submitEmail() {
  fireEvent.change(screen.getByPlaceholderText('you@institution.com'), {
    target: { value: 'banker@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Send PDF' }));
}

describe('sample results — send the full summary', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('captures the email and requests the sample report before confirming', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<ResultsPage />);

    submitEmail();

    await waitFor(() => expect(screen.getByRole('button', { name: '✓ Sent' })).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith('/api/capture-email', expect.objectContaining({ method: 'POST' }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({
      email: 'banker@example.test',
      lead_source: 'results-sample',
      requested_artifact: 'sample-readiness-report',
    });
  });

  it('offers a direct download instead of a false confirmation when sending fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
    render(<ResultsPage />);

    submitEmail();

    const link = await screen.findByRole('link', { name: 'Download the PDF directly' });
    expect(link.getAttribute('href')).toBe('/api/resources/sample-readiness-report/download');
    expect(screen.queryByRole('button', { name: '✓ Sent' })).toBeNull();
  });
});
