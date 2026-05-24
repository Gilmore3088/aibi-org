// PRDBuilder widget tests.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PRDBuilder } from './PRDBuilder';

function buildDescriptor() {
  return {
    id: 'm5-3-prd-builder',
    preset_context_blocks: [
      {
        id: 'prd_schema',
        label: 'PRD section schema',
        body: JSON.stringify({
          sections: [
            { key: 'goal', label: 'Goal' },
            { key: 'non_goals', label: 'Non-goals' },
            { key: 'users', label: 'Users' },
            { key: 'constraints', label: 'Constraints' },
            { key: 'success_criteria', label: 'Success criteria' },
            { key: 'scope_in', label: 'Scope (in)' },
            { key: 'scope_out', label: 'Scope (out)' },
            { key: 'dependencies', label: 'Dependencies' },
            { key: 'risks', label: 'Risks' },
          ],
        }),
      },
    ],
  };
}

describe('PRDBuilder', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders empty state when no schema is seeded', () => {
    render(<PRDBuilder exerciseDescriptor={{ id: 'x', preset_context_blocks: [] }} />);
    expect(screen.getByText(/No PRD schema seeded/i)).toBeTruthy();
  });

  it('renders one textarea per section', () => {
    render(<PRDBuilder exerciseDescriptor={buildDescriptor()} />);
    expect(screen.getByLabelText(/^Goal$/i)).toBeTruthy();
    expect(screen.getByLabelText(/^Risks$/i)).toBeTruthy();
    expect(screen.getByText('0/9')).toBeTruthy();
  });

  it('enables save once a working majority of sections are filled (>=6 of 9)', () => {
    render(<PRDBuilder exerciseDescriptor={buildDescriptor()} />);
    const save = screen.getByRole('button', { name: /Save to Toolbox/i });
    expect((save as HTMLButtonElement).disabled).toBe(true);

    const keys = ['Goal', 'Non-goals', 'Users', 'Constraints', 'Success criteria'];
    for (const k of keys) {
      fireEvent.change(screen.getByLabelText(new RegExp(`^${k}$`, 'i')), {
        target: { value: 'something' },
      });
    }
    // 5/9 — still disabled
    expect((save as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Scope \(in\)/i), {
      target: { value: 'first scope item' },
    });
    // 6/9 — enabled
    expect((save as HTMLButtonElement).disabled).toBe(false);
  });

  it('blocks save when a section contains an SSN-shaped value', () => {
    render(<PRDBuilder exerciseDescriptor={buildDescriptor()} />);
    const sections = ['Goal', 'Non-goals', 'Users', 'Constraints', 'Success criteria', 'Scope (in)'];
    for (const s of sections) {
      fireEvent.change(screen.getByLabelText(new RegExp(`^${s.replace(/[()]/g, '\\$&')}$`, 'i')), {
        target: { value: 'placeholder' },
      });
    }
    const save = screen.getByRole('button', { name: /Save to Toolbox/i });
    expect((save as HTMLButtonElement).disabled).toBe(false);

    fireEvent.change(screen.getByLabelText(/^Goal$/i), {
      target: { value: 'ssn 123-45-6789' },
    });
    expect(screen.getByText(/anonymize first/i)).toBeTruthy();
    expect((save as HTMLButtonElement).disabled).toBe(true);
  });
});
