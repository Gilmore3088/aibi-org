// OffLimitsSorter — smoke test: items render, correctness tally works,
// onComplete fires after the last item.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OffLimitsSorter } from './OffLimitsSorter';

const descriptor = {
  id: 'm0-2-off-limits-sorter',
  preset_context_blocks: [
    {
      id: 'items',
      label: 'sortable items',
      body: JSON.stringify([
        { id: 'a', label: 'A public CFPB rule summary', category: 'allowed', track: 'all' },
        { id: 'b', label: 'An internal exam finding', category: 'off_limits', track: 'risk_compliance' },
        { id: 'c', label: 'A friendly fee explanation', category: 'allowed', track: 'customer_facing' },
      ]),
    },
  ],
};

describe('OffLimitsSorter', () => {
  it('renders the first item for the selected track', () => {
    render(
      <OffLimitsSorter
        exerciseDescriptor={descriptor}
        track="risk_compliance"
        onComplete={() => undefined}
      />,
    );
    expect(screen.getByText(/CFPB rule summary|exam finding/)).toBeTruthy();
    expect(screen.getByText('Off-limits')).toBeTruthy();
    expect(screen.getByText('Allowed')).toBeTruthy();
    expect(screen.getByText('Needs review')).toBeTruthy();
  });

  it('filters out items from other tracks', () => {
    render(
      <OffLimitsSorter
        exerciseDescriptor={descriptor}
        track="risk_compliance"
        onComplete={() => undefined}
      />,
    );
    // "customer_facing" item should not appear.
    expect(screen.queryByText('A friendly fee explanation')).toBeNull();
  });

  it('tallies correctness and calls onComplete after the last item', () => {
    const onComplete = vi.fn();
    render(
      <OffLimitsSorter
        exerciseDescriptor={descriptor}
        track="risk_compliance"
        onComplete={onComplete}
      />,
    );

    // 2 items for risk_compliance: 'all' + 'risk_compliance'.
    // Pick correct for both, advance through.
    // Order is filter-preserved: [a (allowed), b (off_limits)].
    fireEvent.click(screen.getByRole('radio', { name: 'Allowed' }));
    fireEvent.click(screen.getByRole('button', { name: /next item/i }));

    fireEvent.click(screen.getByRole('radio', { name: 'Off-limits' }));
    fireEvent.click(screen.getByRole('button', { name: /finish/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({ correct: 2, total: 2 });
  });

  it('renders an empty state when no items match the track', () => {
    render(
      <OffLimitsSorter
        exerciseDescriptor={{
          id: 'x',
          preset_context_blocks: [{ id: 'items', label: 'x', body: '[]' }],
        }}
        track="leadership"
        onComplete={() => undefined}
      />,
    );
    expect(screen.getByText(/no items available/i)).toBeTruthy();
  });
});
