import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './_client';

// matchMedia is stubbed to report reduced-motion, so switching to the safe tab
// resolves synchronously (no strike-sweep timers) — the template frame renders
// on the next tick and the DOM assertions below are deterministic.
describe('HomePage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  const goSafe = () =>
    fireEvent.click(screen.getByRole('tab', { name: /Safe reusable template/i }));

  it('leads with the safety question, one CTA, and the assessment demo', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: /Is your team ready to use AI safely/i }),
    ).toBeTruthy();
    expect(screen.getByText(/Find out in three minutes/i)).toBeTruthy();
    expect(screen.getByText(/Free .* 12 questions .* Practical next step/i)).toBeTruthy();
    expect(screen.getByText(/Built for community banks/i)).toBeTruthy();

    // Exactly one primary readiness CTA in the hero (the duplicate sticky CTA
    // and the second "Start learning" button were removed).
    const heroCtas = screen.getAllByRole('link', { name: /Get my readiness score/i });
    expect(heroCtas).toHaveLength(1);
  });

  it('opens on the unsafe paste — real customer data on show', () => {
    render(<HomePage />);

    // The demo hooks with the risk: the default tab is the unsafe paste, so the
    // real (fictional) customer data is visible until the visitor acts.
    const panel = document.getElementById('mk-demo-panel')!;
    expect(panel.textContent).toContain('John Smith');
    expect(panel.textContent).toContain('0042871');
    expect(panel.textContent).toContain('$83.17');
  });

  it('resolves into a reusable template when the safe tab is chosen', () => {
    render(<HomePage />);
    goSafe();

    const panel = document.getElementById('mk-demo-panel')!;
    // Needed values become bracketed template slots…
    expect(panel.textContent).toContain('[customer name]');
    expect(panel.textContent).toContain('[account number]');
    expect(panel.textContent).toContain('[amount]');
    // …the real customer data is gone from the DOM…
    expect(panel.textContent).not.toContain('John Smith');
    expect(panel.textContent).not.toContain('0042871');
    expect(panel.textContent).not.toContain('$83.17');
    // …the complaint context survives (that's what makes the template usable)…
    expect(panel.textContent).toContain('overdraft');

    // …and the three guardrails are shown, not just described.
    expect(screen.getByText(/Real data removed/i)).toBeTruthy();
    expect(screen.getByText(/Approved source required/i)).toBeTruthy();
    expect(screen.getByText(/Human review before use/i)).toBeTruthy();
  });

  it('drops PII the task never needed (DOB, SSN, phone) from the template', () => {
    render(<HomePage />);
    goSafe();

    // The lesson isn't "mask everything" — a fee-reversal reply never needs a
    // DOB, SSN, or phone number, so the template omits them entirely rather than
    // leaving placeholder slots for data nobody should collect for this task.
    const panel = document.getElementById('mk-demo-panel')!;
    expect(panel.textContent).not.toContain('04/12/1981');
    expect(panel.textContent).not.toContain('(555) 123-4567');
    expect(panel.textContent).not.toMatch(/ssn/i);
    expect(panel.textContent).not.toMatch(/\bdob\b/i);
  });
});
