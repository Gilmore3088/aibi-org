import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PracticeSandboxPage from './_client';

describe('PracticeSandboxPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('labels practice as a public demo and points saved work to real paid Toolbox access', () => {
    render(<PracticeSandboxPage />);

    expect(screen.getByText(/Public demo sandbox/i)).toBeTruthy();
    expect(screen.queryByText(/Enrolled-only/i)).toBeNull();
    expect(screen.queryByText(/Signed-in sandbox/i)).toBeNull();
    expect(screen.queryByText(/\.md/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /download|export/i })).toBeNull();
    expect(screen.getByRole('link', { name: /Open Toolbox/i }).getAttribute('href')).toBe(
      '/auth/login?next=/dashboard/toolbox',
    );
    expect(screen.getByRole('link', { name: /Convert to Skill/i }).getAttribute('href')).toBe(
      '/auth/login?next=/dashboard/toolbox',
    );
  });

  it('runs the governed public model endpoint and renders returned text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        text: 'Draft job aid from the public model. Review before use.',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<PracticeSandboxPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /Run Scenario/i })[0]);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith('/api/playground/run', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
    const request = fetchMock.mock.calls[0]?.[1] as { body: string };
    expect(JSON.parse(request.body)).toEqual(expect.objectContaining({
      scenarioTitle: 'Operations · Procedure Cleanup',
      sampleData: expect.stringContaining('fictional'),
      prompt: expect.stringContaining('frontline job aid'),
    }));
    expect(await screen.findByText(/Draft job aid from the public model/i)).toBeTruthy();
  });
});
