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

  it('surfaces a server PII block as a safety warning, never as "demo busy" sample output', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        error: 'This message appears to contain a Social Security number. Use the sample data provided instead.',
        kind: 'pii_blocked',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<PracticeSandboxPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /Run Scenario/i })[0]);

    const warning = await screen.findByTestId('practice-safety-block');
    expect(warning.textContent).toMatch(/Social Security number/i);
    expect(warning.textContent).toMatch(/not sent to the AI model/i);
    expect(screen.queryByTestId('practice-demo-fallback')).toBeNull();
    expect(screen.queryByText(/sample of the output/i)).toBeNull();
  });

  it('blocks obvious PII client-side before any request is sent', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<PracticeSandboxPage />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Summarize the account for SSN 123-45-6789 please.' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: /Run Scenario/i })[0]);

    const warning = await screen.findByTestId('practice-safety-block');
    expect(warning.textContent).toMatch(/not sent to the AI model/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('labels an outage honestly as unavailable sample output, not "busy"', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'The public demo model is temporarily unavailable. Try again shortly.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<PracticeSandboxPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /Run Scenario/i })[0]);

    const notice = await screen.findByTestId('practice-demo-fallback');
    expect(notice.textContent).toMatch(/temporarily unavailable/i);
    expect(notice.textContent).toMatch(/not a\s+live run/i);
    expect(notice.textContent).not.toMatch(/busy/i);
  });
});
