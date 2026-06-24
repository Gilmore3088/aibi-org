import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PlaygroundPage from './_client';

describe('PlaygroundPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('cross-links demo evaluators to the In-Depth report', () => {
    render(<PlaygroundPage />);

    expect(screen.getByRole('link', { name: /Get In-Depth report/i }).getAttribute('href')).toBe(
      '/assessment/in-depth',
    );
  });

  it('runs the public model endpoint and renders returned model text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        text: '**Draft job aid**\n\nReview before use. Keep the banker as final reviewer.',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<PlaygroundPage />);

    fireEvent.click(screen.getByRole('button', { name: /Run/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith('/api/playground/run', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
    const request = fetchMock.mock.calls[0]?.[1] as { body: string };
    expect(JSON.parse(request.body)).toEqual(expect.objectContaining({
      scenarioTitle: 'Procedure Cleanup · Compliance',
      sampleData: expect.stringContaining('KYC refresh requests'),
      prompt: expect.stringContaining('frontline job aid'),
    }));
    expect(await screen.findByText(/Draft job aid/i)).toBeTruthy();
    expect(screen.getByText(/Keep the banker as final reviewer/i)).toBeTruthy();
  });
});
