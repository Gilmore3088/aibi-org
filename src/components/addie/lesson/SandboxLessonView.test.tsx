// SandboxLessonView — render smoke: levers, slots, presets, and the
// metadata strip on result. Stubs window.fetch.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SandboxLessonView } from './SandboxLessonView';
import type { LessonPayload } from './types';

const basePayload: LessonPayload = {
  lesson: {
    id: 'm2.3',
    module_id: 'm2',
    ordinal: 3,
    title: 'First conversation',
    modality: 'sandbox',
    duration_min: 10,
    is_branched: false,
    exercise_id: 'm2-3-first-conversation',
    takeaway_artifact_type: 'first_conversation',
    body_md: null,
    published: true,
  },
  module: {
    id: 'm2',
    ordinal: 2,
    title: 'Access & Workflow',
    tier: 'free',
    summary: null,
  },
  checks: [],
  interactiveExercise: {
    id: 'm2-3-first-conversation',
    exercise_id: 'm2-3-first-conversation',
    task_scaffold: 'Have a first conversation with a generative AI tool.',
    preset_context_blocks: [
      { id: 'public_reg_excerpt', label: 'A short public excerpt' },
    ],
    levers: [
      {
        key: 'starter_prompt',
        label: 'Pick a starter',
        type: 'select',
        options: [
          { id: 'summarize_policy', label: 'Summarize a policy' },
          { id: 'draft_member_email', label: 'Draft a member email' },
        ],
      },
    ],
    data_slots: [
      {
        key: 'context_text',
        label: 'Paste optional context',
        maxChars: 1500,
        required: false,
        piiCheck: true,
      },
    ],
    default_provider: 'anthropic',
    allow_provider_switch: true,
    mode: 'single',
  },
};

describe('SandboxLessonView', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders lever options, data-slot label, and preset', () => {
    render(<SandboxLessonView payload={basePayload} />);
    expect(screen.getByText('Pick a starter')).toBeTruthy();
    expect(
      screen.getByRole('radio', { name: /Summarize a policy/ }),
    ).toBeTruthy();
    expect(screen.getByLabelText(/Paste optional context/)).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /A short public excerpt/ }),
    ).toBeTruthy();
  });

  it('pre-selects the first lever option so Run is enabled', () => {
    render(<SandboxLessonView payload={basePayload} />);
    const first = screen.getByRole('radio', { name: /Summarize a policy/ });
    expect(first.getAttribute('aria-checked')).toBe('true');
  });

  it('shows the run button enabled when no required slots are unmet', () => {
    render(<SandboxLessonView payload={basePayload} />);
    const btn = screen.getByRole('button', {
      name: /Run sandbox/,
    }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('renders output panel with metadata when /api/sandbox/run returns', async () => {
    const mock = vi.mocked(fetch);
    mock.mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: 'sess-1',
          provider: 'anthropic',
          outputText: 'A concrete, friendly summary in plain English.',
          tokensUsed: 142,
          flagged: false,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    render(<SandboxLessonView payload={basePayload} />);
    fireEvent.click(screen.getByRole('button', { name: /Run sandbox/ }));
    await waitFor(() => screen.getByTestId('sandbox-output'));
    expect(
      screen.getByText(/A concrete, friendly summary in plain English\./),
    ).toBeTruthy();
    expect(screen.getByText(/ANTHROPIC/)).toBeTruthy();
    expect(screen.getByText(/142 tok/)).toBeTruthy();
  });

  it('shows a friendly rate-limit message on 429', async () => {
    const mock = vi.mocked(fetch);
    mock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'RATE_LIMITED', message: 'too many' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    render(<SandboxLessonView payload={basePayload} />);
    fireEvent.click(screen.getByRole('button', { name: /Run sandbox/ }));
    await waitFor(() => screen.getByTestId('sandbox-error'));
    expect(screen.getByText(/Take a breather/)).toBeTruthy();
  });
});
