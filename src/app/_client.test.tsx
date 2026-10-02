import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './_client';
import { getPracticeRepById } from '@content/practice-reps/foundation-program';
import { FOUNDATION_MICRO_MODULES } from '@content/courses/foundation-program';

// matchMedia reports reduced motion, so the hero AI session renders its
// finished exchange synchronously and the assertions are deterministic.
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

  it('leads with the safety question and exactly one hero CTA', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Is your team ready to use AI safely/i }),
    ).toBeTruthy();
    expect(screen.getByText(/Find out in three minutes/i)).toBeTruthy();
    expect(screen.getByText(/For community banks/i)).toBeTruthy();

    const hero = document.querySelector('.hm-hero-copy') as HTMLElement;
    expect(within(hero).getByText(/Free .* 12 questions .* Practical next step/i)).toBeTruthy();
    expect(within(hero).getAllByRole('link', { name: /Get my readiness score/i })).toHaveLength(1);
  });

  it('shows a real Foundation practice rep in the hero AI session', () => {
    const rep = getPracticeRepById('safe-prompt-conversion')!;
    render(<HomePage />);

    // The live layer — the session also holds an aria-hidden sizing copy.
    const session = document.querySelector('.hm-session-layer:not(.hm-session-ghost)') as HTMLElement;
    // The model answer is the course's own, verbatim.
    expect(session.textContent).toContain(rep.modelAnswer);
    // The prompt carries the synthetic risky text the rep asks to sanitize.
    expect(session.textContent).toContain('John Smith');
    expect(document.querySelector('.hm-session')!.textContent).toMatch(/Synthetic data/i);
    expect(within(session).getByText('Banker reviews before use')).toBeTruthy();
  });

  it('lays out Assess / Train / Build as real artifacts', () => {
    render(<HomePage />);
    const step = (id: string) => document.getElementById(`hm-step-${id}`)!.textContent;
    const m2 = FOUNDATION_MICRO_MODULES.find((m) => m.id === 'm2-low-risk-message-rewrite')!;

    expect(step('assess')).toContain('Do you know which AI tools you are allowed to use for work?');
    expect(step('train')).toContain(m2.weakExample);
    expect(step('train')).toContain(m2.strongExample);
    expect(step('build')).toContain('# Exception Report Skill - v1.0');
    expect(step('build')).toContain('[BSA REVIEW — DO NOT RESOLVE WITHOUT COMPLIANCE]');
  });

  it('shows the ROI calculator with a live currency result', () => {
    render(<HomePage />);
    const roi = document.getElementById('roi-calculator')!;
    expect(within(roi).getByLabelText('Full-time employees')).toBeTruthy();
    expect(roi.querySelector('.mk-roi-result-value')!.textContent).toMatch(/^\$[\d,]+$/);
    fireEvent.change(within(roi).getByLabelText('Full-time employees'), { target: { value: '100' } });
    expect(roi.textContent).toContain('$715,144');
  });

  it('checks a prompt in the browser and proposes a placeholder version', () => {
    render(<HomePage />);
    const input = screen.getByLabelText('Your prompt') as HTMLTextAreaElement;
    const before = document.querySelector('.hm-redline-before') as HTMLElement;
    const after = document.querySelector('.hm-redline-after') as HTMLElement;

    // Opens on the example: every identifier is flagged…
    const struck = Array.from(before.querySelectorAll('s')).map((s) => s.textContent);
    expect(struck).toEqual(expect.arrayContaining(['John Smith', '0042871', '04/12/1981', '(555) 123-4567']));
    // …and the safer version keeps slots, drops the rest.
    expect(after.textContent).toContain('[customer name]');
    expect(after.textContent).toContain('[account number]');
    expect(after.textContent).not.toContain('John Smith');
    expect(after.textContent).not.toContain('04/12/1981');

    // A clean prompt is acknowledged, not scolded.
    fireEvent.change(input, { target: { value: 'Draft a reply to [customer name] using our fee policy.' } });
    expect(screen.getByText(/No customer details found/i)).toBeTruthy();

    // Clearing empties both sides and disables copy.
    fireEvent.click(screen.getByRole('button', { name: 'clear' }));
    expect(input.value).toBe('');
    expect((screen.getByRole('button', { name: /Copy safer version/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('links each resource cover to a page that exists (no /resources/<slug> dead ends)', () => {
    render(<HomePage />);
    const covers = Array.from(document.querySelectorAll('.hm-kit-stack a')) as HTMLAnchorElement[];
    expect(covers).toHaveLength(4);
    for (const a of covers) {
      expect(a.getAttribute('href')).toMatch(/^\/(resources#starter-kits|playbooks\/[a-z-]+)$/);
      expect(a.querySelector('img')).toBeTruthy();
    }
  });
});
