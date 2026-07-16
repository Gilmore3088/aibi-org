import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeResultPreview } from './HomeResultPreview';

describe('HomeResultPreview', () => {
  it('shows the compact result summary with band, gap, and starter artifact', () => {
    render(<HomeResultPreview />);

    expect(screen.getByText(/What you get in three minutes/i)).toBeTruthy();
    expect(
      screen.getByText(/A score, your biggest gap, and one action you can use this week/i),
    ).toBeTruthy();
    // Score ring reads 36 / 48; band, top gap, and the unified "starter artifact".
    expect(screen.getByRole('img', { name: /Readiness score 36 out of 48/i })).toBeTruthy();
    expect(screen.getAllByText(/Building Momentum/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Documentation')).toBeTruthy();
    expect(screen.getByText(/Your starter artifact/i)).toBeTruthy();
    expect(screen.getByText('AI Recordkeeping Template')).toBeTruthy();

    // Signals are collapsed until requested.
    expect(screen.queryByRole('list', { name: /Readiness signals/i })).toBeNull();
  });

  it('expands to five signals, then all twelve, flagging the top gap', () => {
    render(<HomeResultPreview />);

    fireEvent.click(screen.getByRole('button', { name: /View the 12 signals/i }));
    const list = () => screen.getByRole('list', { name: /Readiness signals/i });
    expect(list().querySelectorAll('li')).toHaveLength(5);

    fireEvent.click(screen.getByRole('button', { name: /View all 12/i }));
    expect(list().querySelectorAll('li')).toHaveLength(12);

    // The Documentation row is flagged as the top gap (icon + label + tag,
    // never colour alone).
    const gapRow = list().querySelector('.mk-signal.is-gap');
    expect(gapRow).toBeTruthy();
    expect(gapRow?.textContent).toContain('Documentation');
    expect(gapRow?.textContent).toContain('Top gap');
  });
});
