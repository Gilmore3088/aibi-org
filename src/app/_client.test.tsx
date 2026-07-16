import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './_client';

// matchMedia is stubbed to report reduced-motion, so revealing the comparison
// and switching to the safer tab resolve synchronously (no strike-sweep
// timers) — the DOM assertions below are deterministic.
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

  const panel = () => document.getElementById('mk-demo-panel')!;
  const click = (name: RegExp) => fireEvent.click(screen.getByRole('button', { name }));
  const reveal = () => fireEvent.click(screen.getByRole('button', { name: /Skip to comparison/i }));
  const openSafer = () => fireEvent.click(screen.getByRole('tab', { name: /Safer template/i }));

  it('leads with the safety question, one CTA, and the assessment demo', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: /Is your team ready to use AI safely/i }),
    ).toBeTruthy();
    expect(screen.getByText(/Find out in three minutes/i)).toBeTruthy();
    expect(screen.getByText(/Built for community banks/i)).toBeTruthy();

    // The proof line + exactly one CTA live in the hero copy column. Scoped to
    // the hero because the post-hero result preview reuses the same proof line
    // and CTA label lower on the page.
    const heroCopy = document.querySelector('.mk-hero-copy') as HTMLElement;
    expect(within(heroCopy).getByText(/Free .* 12 questions .* Practical next step/i)).toBeTruthy();
    expect(within(heroCopy).getAllByRole('link', { name: /Get my readiness score/i })).toHaveLength(1);
    expect(within(heroCopy).queryByRole('link', { name: /Start learning/i })).toBeNull();
  });

  it('opens on the optional decision check with the synthetic prompt', () => {
    render(<HomePage />);

    expect(screen.getByText(/Would you allow this prompt in a public AI tool/i)).toBeTruthy();
    expect(screen.getByText(/Synthetic customer data/i)).toBeTruthy();
    // The (fictional) prompt is shown so the visitor can form a judgement.
    expect(screen.getByText(/John Smith/)).toBeTruthy();
    // Three choices plus an optional skip; the comparison is not revealed yet.
    expect(screen.getByRole('button', { name: /^Allow$/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Review first/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Block$/i })).toBeTruthy();
    expect(document.getElementById('mk-demo-panel')).toBeNull();
  });

  it('recommends Block and affirms a correct answer, with risk annotations', () => {
    render(<HomePage />);
    click(/^Block$/i);

    // Calm, specific feedback — not a game-show verdict.
    expect(screen.getByText(/^Correct\./i)).toBeTruthy();
    expect(screen.queryByText(/wrong/i)).toBeNull();
    // The exposed data is annotated on the revealed unsafe prompt.
    expect(screen.getByText(/Customer identity exposed/i)).toBeTruthy();
    expect(screen.getByText(/Public tool boundary crossed/i)).toBeTruthy();
  });

  it('acknowledges an unsafe answer without scolding', () => {
    render(<HomePage />);
    click(/^Allow$/i);

    expect(
      screen.getByText(/Review after pasting does not remove the exposure/i),
    ).toBeTruthy();
    expect(screen.queryByText(/wrong/i)).toBeNull();
  });

  it('reveals real data on the unsafe tab and a reusable template on the safer tab', () => {
    render(<HomePage />);
    reveal();

    // Unsafe tab is the default after reveal — real (fictional) data on show.
    expect(panel().textContent).toContain('John Smith');
    expect(panel().textContent).toContain('$83.17');

    openSafer();
    // Needed values become bracketed template slots…
    expect(panel().textContent).toContain('[customer name]');
    expect(panel().textContent).toContain('[account number]');
    expect(panel().textContent).toContain('[amount]');
    // …the real customer data is gone…
    expect(panel().textContent).not.toContain('John Smith');
    expect(panel().textContent).not.toContain('$83.17');
    // …the complaint context survives…
    expect(panel().textContent).toContain('overdraft');
    // …and the three guardrails are shown, not just described.
    expect(screen.getByText(/Sensitive details removed/i)).toBeTruthy();
    expect(screen.getByText(/Approved source required/i)).toBeTruthy();
    expect(screen.getByText(/Human review retained/i)).toBeTruthy();
  });

  it('drops PII the task never needed (DOB, SSN, phone) from the template', () => {
    render(<HomePage />);
    reveal();
    openSafer();

    const p = panel();
    expect(p.textContent).not.toContain('04/12/1981');
    expect(p.textContent).not.toContain('(555) 123-4567');
    expect(p.textContent).not.toMatch(/ssn/i);
    expect(p.textContent).not.toMatch(/\bdob\b/i);
  });
});
