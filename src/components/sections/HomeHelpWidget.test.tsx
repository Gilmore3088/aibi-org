import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeHelpWidget } from './HomeHelpWidget';

describe('HomeHelpWidget', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fill(role: string, need: string, email: string) {
    fireEvent.change(screen.getByLabelText(/your role/i), { target: { value: role } });
    fireEvent.change(screen.getByLabelText(/what you need help with/i), { target: { value: need } });
    fireEvent.change(screen.getByLabelText(/your work email/i), { target: { value: email } });
  }

  it('keeps the submit disabled until role, need, and a valid email are present', () => {
    render(<HomeHelpWidget />);
    const submit = screen.getByRole('button', { name: /send it to me/i });
    expect((submit as HTMLButtonElement).disabled).toBe(true);

    fill('lending', 'prompting', 'not-an-email');
    expect((submit as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/your work email/i), { target: { value: 'jo@bank.com' } });
    expect((submit as HTMLButtonElement).disabled).toBe(false);
  });

  it('sends the need-mapped artifact + role/need lead_source, then confirms inline', async () => {
    render(<HomeHelpWidget />);
    fill('compliance-risk', 'safe-use', 'jo@bank.com');
    fireEvent.click(screen.getByRole('button', { name: /send it to me/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/capture-email');
    const body = JSON.parse((init as RequestInit).body as string);
    // "Safe use" maps to the safe-ai-use checklist; role+need ride in lead_source.
    expect(body.requested_artifact).toBe('safe-ai-use-checklist');
    expect(body.lead_source).toBe('home-help/compliance-risk/safe-use');
    expect(body.email).toBe('jo@bank.com');

    // Stays on the page — inline confirmation, no navigation.
    expect(await screen.findByText(/heading to your inbox/i)).toBeTruthy();
    expect(screen.getByText(/Safe AI Use Checklist/i)).toBeTruthy();
  });

  it('routes the "my role\'s playbook" need to the role-specific playbook', async () => {
    render(<HomeHelpWidget />);
    fill('lending', 'role-playbook', 'jo@bank.com');
    fireEvent.click(screen.getByRole('button', { name: /send it to me/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.requested_artifact).toBe('lending-playbook');
  });

  it('surfaces an error without losing the form when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
    render(<HomeHelpWidget />);
    fill('marketing', 'governance', 'jo@bank.com');
    fireEvent.click(screen.getByRole('button', { name: /send it to me/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeTruthy();
    // Form still present so the visitor can retry.
    expect(screen.getByRole('button', { name: /send it to me/i })).toBeTruthy();
  });
});
