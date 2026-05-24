// ProblemFrame widget tests.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProblemFrame } from './ProblemFrame';

function buildDescriptor() {
  return {
    id: 'm5-2-problem-frame',
    preset_context_blocks: [
      {
        id: 'frame_schema',
        label: 'five-question problem frame schema',
        body: JSON.stringify({
          fields: [
            { key: 'who', label: 'Who has this problem?', placeholder: 'Tellers.' },
            { key: 'what_breaks', label: 'What breaks?' },
            { key: 'current_workaround', label: 'Current workaround' },
            { key: 'what_good_looks_like', label: 'What good looks like' },
            { key: 'why_now', label: 'Why now' },
          ],
        }),
      },
    ],
  };
}

describe('ProblemFrame', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders empty state when no schema is seeded', () => {
    render(<ProblemFrame exerciseDescriptor={{ id: 'x', preset_context_blocks: [] }} />);
    expect(screen.getByText(/No problem-frame schema seeded/i)).toBeTruthy();
  });

  it('renders one textarea per field and tracks fill count', () => {
    render(<ProblemFrame exerciseDescriptor={buildDescriptor()} />);
    expect(screen.getByLabelText(/Who has this problem\?/i)).toBeTruthy();
    expect(screen.getByLabelText(/What breaks\?/i)).toBeTruthy();
    expect(screen.getByText('0/5')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Who has this problem\?/i), {
      target: { value: 'Branch tellers on Tuesdays.' },
    });
    expect(screen.getByText('1/5')).toBeTruthy();
  });

  it('disables save until all five fields are filled', () => {
    render(<ProblemFrame exerciseDescriptor={buildDescriptor()} />);
    const save = screen.getByRole('button', { name: /Save to Toolbox/i });
    expect((save as HTMLButtonElement).disabled).toBe(true);

    const labels = [
      /Who has this problem\?/i,
      /What breaks\?/i,
      /Current workaround/i,
      /What good looks like/i,
      /Why now/i,
    ];
    for (const label of labels) {
      fireEvent.change(screen.getByLabelText(label), {
        target: { value: 'a non-trivial answer' },
      });
    }
    expect((save as HTMLButtonElement).disabled).toBe(false);
  });

  it('surfaces a PII warning and blocks save when a textarea contains an SSN-shaped value', () => {
    render(<ProblemFrame exerciseDescriptor={buildDescriptor()} />);
    fireEvent.change(screen.getByLabelText(/Who has this problem\?/i), {
      target: { value: '123-45-6789' },
    });
    expect(screen.getByText(/anonymize first/i)).toBeTruthy();
    const save = screen.getByRole('button', { name: /Save to Toolbox/i });
    expect((save as HTMLButtonElement).disabled).toBe(true);
  });
});
