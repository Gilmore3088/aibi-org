import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubTaskProgressStrip, type SubTaskItem } from './SubTaskProgressStrip';

const ITEMS: readonly SubTaskItem[] = [
  {
    id: 'st-takeaway',
    label: 'Understand',
    minutes: 6,
    status: 'current',
  },
  {
    id: 'st-sandbox',
    label: 'Try',
    minutes: 8,
    status: 'pending',
  },
  {
    id: 'st-submit',
    label: 'Build',
    minutes: 11,
    status: 'pending',
  },
  {
    id: 'st-packet',
    label: 'Save',
    minutes: null,
    status: 'pending',
  },
] as const;

describe('SubTaskProgressStrip', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
      })),
    );
  });

  it('frames module sections as a learning loop instead of generic tabs', () => {
    render(<SubTaskProgressStrip items={ITEMS} />);

    const strip = screen.getByTestId('foundation-subtask-strip');
    expect(strip.textContent).toContain('Learning loop');
    expect(strip.textContent).toContain('Understand: Preview the artifact and model.');
    expect(strip.textContent).toContain('Try');
    expect(strip.textContent).toContain('Build');
    expect(strip.textContent).toContain('Save');
  });

  it('marks the current learning step and keeps accessible labels for anchors', () => {
    render(<SubTaskProgressStrip items={ITEMS} />);

    const outcome = screen.getByRole('link', { name: 'Understand, 6 minutes' });
    expect(outcome.getAttribute('href')).toBe('#st-takeaway');
    expect(outcome.getAttribute('aria-current')).toBe('step');

    expect(screen.getByRole('link', { name: 'Try, 8 minutes' }).getAttribute('href')).toBe(
      '#st-sandbox',
    );
    expect(screen.getByRole('link', { name: 'Save' }).getAttribute('href')).toBe('#st-packet');
  });
});
