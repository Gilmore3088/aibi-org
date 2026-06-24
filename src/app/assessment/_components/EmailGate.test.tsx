import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailGate } from './EmailGate';

vi.mock('@/lib/user-data', () => ({
  saveReadinessResult: vi.fn(),
}));

vi.mock('@/lib/analytics/events', () => ({
  trackEmailCaptured: vi.fn(),
}));

const baseProps = {
  score: 30,
  tierId: 'building-momentum',
  tierLabel: 'Building Momentum',
  answers: [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2],
  version: 'v3' as const,
  maxScore: 48,
  dimensionBreakdown: {
    'strategic-value': { score: 2, maxScore: 4, label: 'Strategic Value' },
  },
};

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: { 'content-type': 'application/json' },
  });
}

function captureEmailRequestBody(): Record<string, unknown> {
  const call = vi.mocked(fetch).mock.calls.find(([input]) => input === '/api/capture-email');
  if (!call) throw new Error('capture-email request not found');
  const init = call[1] as RequestInit | undefined;
  return JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
}

describe('EmailGate', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        if (input === '/api/auth/me') {
          return jsonResponse({ user: null }, { status: 401 });
        }
        if (input === '/api/capture-email') {
          return jsonResponse({ ok: true, profileId: null, magicLinkUrl: null });
        }
        return jsonResponse({}, { status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not force marketing follow-up when sending the report', async () => {
    const user = userEvent.setup();
    const onCaptured = vi.fn();

    render(<EmailGate {...baseProps} onCaptured={onCaptured} onSkip={vi.fn()} />);

    await user.type(screen.getByLabelText('Email'), 'banker@example.com');
    await user.click(screen.getByRole('button', { name: /send my report/i }));

    await waitFor(() => expect(onCaptured).toHaveBeenCalled());
    expect(captureEmailRequestBody()).toMatchObject({
      email: 'banker@example.com',
      marketingOptIn: false,
    });
  });

  it('sends marketing opt-in only when the user checks the follow-up box', async () => {
    const user = userEvent.setup();
    const onCaptured = vi.fn();

    render(<EmailGate {...baseProps} onCaptured={onCaptured} onSkip={vi.fn()} />);

    await user.type(screen.getByLabelText('Email'), 'banker@example.com');
    await user.click(screen.getByLabelText(/send a few follow-up ideas/i));
    await user.click(screen.getByRole('button', { name: /send my report/i }));

    await waitFor(() => expect(onCaptured).toHaveBeenCalled());
    expect(captureEmailRequestBody()).toMatchObject({
      email: 'banker@example.com',
      marketingOptIn: true,
    });
  });

  it('lets users view the summary without posting an email capture', async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();

    render(<EmailGate {...baseProps} onCaptured={vi.fn()} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: /view summary without email/i }));

    expect(onSkip).toHaveBeenCalledWith({});
    expect(vi.mocked(fetch).mock.calls.some(([input]) => input === '/api/capture-email')).toBe(false);
  });
});
