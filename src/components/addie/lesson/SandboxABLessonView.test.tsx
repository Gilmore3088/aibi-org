// SandboxABLessonView — render smoke: two config cards, shared slot,
// two output panels with diff highlights when /api/sandbox/ab returns.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SandboxABLessonView } from './SandboxABLessonView';
import type { LessonPayload } from './types';

const payload: LessonPayload = {
  lesson: {
    id: 'm3.2',
    module_id: 'm3',
    ordinal: 2,
    title: 'A/B output',
    modality: 'sandbox',
    duration_min: 12,
    is_branched: false,
    exercise_id: 'm3-2-ab-output',
    takeaway_artifact_type: 'starter_prompt_pack',
    body_md: null,
    published: true,
  },
  module: {
    id: 'm3',
    ordinal: 3,
    title: 'Prompting',
    tier: 'free',
    summary: null,
  },
  checks: [],
  interactiveExercise: {
    id: 'm3-2-ab-output',
    exercise_id: 'm3-2-ab-output',
    task_scaffold: 'Summarize the regulation excerpt for the audience.',
    preset_context_blocks: [
      { id: 'reg_e_summary', label: 'Reg E error-resolution summary (public)' },
    ],
    levers: [
      {
        key: 'audience',
        label: 'Audience',
        type: 'select',
        options: [
          { id: 'tellers', label: 'Branch tellers' },
          { id: 'managers', label: 'Branch managers' },
          { id: 'execs', label: 'Bank executives' },
        ],
      },
      {
        key: 'length',
        label: 'Length',
        type: 'select',
        options: [
          { id: 'short', label: 'Under 100 words' },
          { id: 'medium', label: 'About 150 words' },
          { id: 'long', label: 'About 250 words' },
        ],
      },
    ],
    data_slots: [
      {
        key: 'reg_text',
        label: 'Paste a short public regulation excerpt',
        maxChars: 2000,
        required: false,
        piiCheck: true,
      },
    ],
    default_provider: 'anthropic',
    allow_provider_switch: true,
    mode: 'ab',
  },
};

describe('SandboxABLessonView', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders two config cards each with audience + length radios', () => {
    render(<SandboxABLessonView payload={payload} />);
    expect(screen.getByText('Version A')).toBeTruthy();
    expect(screen.getByText('Version B')).toBeTruthy();
    const audience = screen.getAllByText('Audience');
    expect(audience.length).toBe(2);
  });

  it('defaults A and B to distinct first/second lever options', () => {
    render(<SandboxABLessonView payload={payload} />);
    const tellers = screen.getAllByRole('radio', { name: /Branch tellers/ });
    const managers = screen.getAllByRole('radio', { name: /Branch managers/ });
    // First Branch tellers radio is in column A (active there).
    expect(tellers[0].getAttribute('aria-checked')).toBe('true');
    // Second Branch managers radio is in column B (active there).
    expect(managers[1].getAttribute('aria-checked')).toBe('true');
  });

  it('runs both configs and renders two output panels with diff', async () => {
    const mock = vi.mocked(fetch);
    mock.mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              config: {
                leverSelections: {},
                dataSlotValues: {},
                presetIds: [],
              },
              sessionId: 's1',
              outputText: 'Tellers should ask three short questions.',
              tokensUsed: 80,
              flagged: false,
              provider: 'anthropic',
            },
            {
              config: {
                leverSelections: {},
                dataSlotValues: {},
                presetIds: [],
              },
              sessionId: 's2',
              outputText: 'Managers should review the workflow weekly.',
              tokensUsed: 120,
              flagged: false,
              provider: 'anthropic',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    render(<SandboxABLessonView payload={payload} />);
    fireEvent.click(screen.getByRole('button', { name: /Run both/ }));
    const ab = await waitFor(() => screen.getByTestId('sandbox-ab-output'));
    // Diff renderer splits tokens into many spans/marks; assert by
    // textContent of the whole result region.
    expect(ab.textContent ?? '').toMatch(/Tellers should ask/);
    expect(ab.textContent ?? '').toMatch(/Managers should review/);
  });
});
