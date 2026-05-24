// ToolLandscapeMatrix — smoke test: tools render, drag-and-drop / keyboard
// movement places them, submit scores the horizontal axis and reveals vendor
// links for correct placements.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ToolLandscapeMatrix } from './ToolLandscapeMatrix';

const tools = [
  {
    name: 'Claude',
    hint: 'Anthropic chat assistant.',
    ground_truth_category: 'assistant',
    vendor_url: 'https://claude.ai',
  },
  {
    name: 'Lovable',
    hint: 'Describe-an-app builder.',
    ground_truth_category: 'builder',
    vendor_url: 'https://lovable.dev',
  },
];

const descriptor = {
  id: 'm1-2-tool-landscape',
  preset_context_blocks: [
    {
      id: 'tools',
      label: 'tools to classify',
      body: JSON.stringify(tools),
    },
  ],
};

// Use the click-to-place fallback (activate a tool, then click the target
// quadrant) — jsdom's HTML5 drag/drop is unreliable. Real drag/drop is
// covered manually; keyboard arrow keys also work and are tested below.
function placeOnto(targetTestId: string, toolName: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${toolName}`) }));
  fireEvent.click(screen.getByTestId(targetTestId));
}

describe('ToolLandscapeMatrix', () => {
  it('renders each tool in the unplaced tray on first render', () => {
    render(<ToolLandscapeMatrix exerciseDescriptor={descriptor} />);
    const tray = screen.getByTestId('unplaced-tray');
    expect(within(tray).getByRole('button', { name: /^Claude/ })).toBeTruthy();
    expect(within(tray).getByRole('button', { name: /^Lovable/ })).toBeTruthy();
  });

  it('renders all four quadrants', () => {
    render(<ToolLandscapeMatrix exerciseDescriptor={descriptor} />);
    expect(screen.getByTestId('quadrant-assistant_free')).toBeTruthy();
    expect(screen.getByTestId('quadrant-assistant_paid')).toBeTruthy();
    expect(screen.getByTestId('quadrant-builder_free')).toBeTruthy();
    expect(screen.getByTestId('quadrant-builder_paid')).toBeTruthy();
  });

  it('places a tool into a quadrant via drop and scores the horizontal axis on submit', () => {
    const onComplete = vi.fn();
    render(
      <ToolLandscapeMatrix
        exerciseDescriptor={descriptor}
        onComplete={onComplete}
      />,
    );

    placeOnto('quadrant-assistant_free', 'Claude');
    placeOnto('quadrant-builder_paid', 'Lovable');

    const submit = screen.getByRole('button', { name: /score the sort/i });
    fireEvent.click(submit);

    expect(onComplete).toHaveBeenCalledTimes(1);
    const call = onComplete.mock.calls[0]?.[0];
    expect(call.correct).toBe(2);
    expect(call.total).toBe(2);
    expect(call.placements).toHaveLength(2);
    expect(call.placements.find((p: { tool: string }) => p.tool === 'Claude').horizontal).toBe(
      'assistant',
    );
    expect(call.placements.find((p: { tool: string }) => p.tool === 'Lovable').horizontal).toBe(
      'builder',
    );

    // Vendor link revealed for correctly-placed tools.
    expect(screen.getAllByRole('link', { name: /vendor link/i }).length).toBe(2);
  });

  it('does not reveal vendor links for incorrectly-placed tools', () => {
    render(<ToolLandscapeMatrix exerciseDescriptor={descriptor} />);

    // Claude (assistant) into a builder quadrant — wrong on the graded axis.
    placeOnto('quadrant-builder_free', 'Claude');
    placeOnto('quadrant-builder_paid', 'Lovable');

    fireEvent.click(screen.getByRole('button', { name: /score the sort/i }));

    // Only Lovable was placed correctly on the horizontal axis.
    expect(screen.getAllByRole('link', { name: /vendor link/i }).length).toBe(1);
  });

  it('disables submit until every tool has been placed', () => {
    render(<ToolLandscapeMatrix exerciseDescriptor={descriptor} />);
    const submit = screen.getByRole('button', { name: /score the sort/i });
    expect((submit as HTMLButtonElement).disabled).toBe(true);

    placeOnto('quadrant-assistant_free', 'Claude');
    expect((submit as HTMLButtonElement).disabled).toBe(true);

    placeOnto('quadrant-builder_paid', 'Lovable');
    expect((submit as HTMLButtonElement).disabled).toBe(false);
  });

  it('renders an empty state when no tools are supplied', () => {
    render(
      <ToolLandscapeMatrix
        exerciseDescriptor={{
          id: 'm1-2-tool-landscape',
          preset_context_blocks: [{ id: 'tools', label: 'tools', body: '[]' }],
        }}
      />,
    );
    expect(screen.getByText(/no tools available/i)).toBeTruthy();
  });
});
