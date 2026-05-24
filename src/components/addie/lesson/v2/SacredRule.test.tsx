// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { SacredRule } from './SacredRule';

afterEach(cleanup);

const props = {
  kicker: 'BANK-SAFE AI BEGINS HERE',
  rule: 'Never paste customer information into a public AI tool.',
};

describe('A5 — SacredRule keyboard behavior (audit 2026-05-24)', () => {
  it('Enter advances the dialog', () => {
    const onContinue = vi.fn();
    render(<SacredRule {...props} onContinue={onContinue} />);
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('Space advances the dialog', () => {
    const onContinue = vi.fn();
    render(<SacredRule {...props} onContinue={onContinue} />);
    fireEvent.keyDown(window, { key: ' ' });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('Escape does NOT advance the dialog (WCAG 2.1.2 fix)', () => {
    const onContinue = vi.fn();
    render(<SacredRule {...props} onContinue={onContinue} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('Tab does not advance the dialog', () => {
    const onContinue = vi.fn();
    render(<SacredRule {...props} onContinue={onContinue} />);
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('clicking the button advances the dialog', () => {
    const onContinue = vi.fn();
    render(<SacredRule {...props} onContinue={onContinue} />);
    const button = screen.getByRole('button', { name: /acknowledge and continue/i });
    fireEvent.click(button);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('renders as a labeled, modal dialog', () => {
    const onContinue = vi.fn();
    render(<SacredRule {...props} onContinue={onContinue} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('sacred-rule-kicker');
    expect(dialog.getAttribute('aria-describedby')).toBe('sacred-rule-text');
  });
});
