// GateScreen — confirms the three doors render with the correct copy
// + endpoints wired (PRD §6.4).

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GateScreen } from './GateScreen';

vi.stubGlobal(
  'fetch',
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ url: '/x' }),
    } as unknown as Response),
  ),
);

describe('GateScreen', () => {
  it('renders three doors: pay, email-to-keep, decline', () => {
    render(<GateScreen />);
    // Pay individual
    expect(screen.getByRole('heading', { name: /foundation course/i })).toBeTruthy();
    expect(screen.getAllByText(/\$295/).length).toBeGreaterThan(0);
    // Email-to-keep
    expect(screen.getByRole('heading', { name: /keep what you built/i })).toBeTruthy();
    // Decline → $99 assessment
    expect(
      screen.getByRole('heading', { name: /find out where you stand/i }),
    ).toBeTruthy();
    expect(screen.getAllByText(/\$99/i).length).toBeGreaterThan(0);
  });

  it('does not use scarcity copy', () => {
    render(<GateScreen />);
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/limited offer/i);
    expect(text).not.toMatch(/only \d+ left/i);
    expect(text).not.toMatch(/last chance/i);
  });

  it('renders the team option', () => {
    render(<GateScreen />);
    expect(screen.getByRole('heading', { name: /foundation for your team/i })).toBeTruthy();
    expect(screen.getAllByText(/\$199 \/ seat/).length).toBeGreaterThan(0);
  });
});
