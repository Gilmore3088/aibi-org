import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CompletionCTA } from './CompletionCTA';

describe('CompletionCTA', () => {
  afterEach(() => {
    window.localStorage.clear();
    document.cookie
      .split(';')
      .forEach((cookie) => {
        const name = cookie.split('=')[0]?.trim();
        if (name) document.cookie = `${name}=; max-age=0; path=/`;
      });
  });

  it('renders a retrieval and transfer debrief for a standard module', () => {
    render(<CompletionCTA moduleNumber={1} isLastModule={false} />);

    expect(screen.getByText('Module debrief')).toBeTruthy();
    expect(screen.getByText('Save the learning before you leave.')).toBeTruthy();
    expect(screen.getByText('Packet item: AI Limits Card')).toBeTruthy();
    expect(screen.getByText('Use this card before opening an AI tool for unfamiliar work.')).toBeTruthy();
    expect(screen.getByText(/reopen this artifact and restate the rule from memory/i)).toBeTruthy();

    const nextModuleLink = screen.getByRole('link', { name: /Module 02/i });
    expect(nextModuleLink.getAttribute('href')).toBe('/courses/foundation/program/2');
  });

  it('surfaces saved target, review, and transfer evidence in the debrief', () => {
    window.localStorage.setItem(
      'foundation-module-start-target-1',
      'Rewrite the branch lobby update.',
    );
    window.localStorage.setItem(
      'foundation-module-handoff-1',
      'Manager review confirmed the owner and deadline are clear.',
    );
    window.localStorage.setItem(
      'foundation-transfer-plan-1',
      'Use this for the next staff bulletin before Friday.',
    );

    render(<CompletionCTA moduleNumber={1} isLastModule={false} />);

    const evidence = screen.getByTestId('foundation-completion-evidence');
    expect(evidence.textContent).toContain('Target');
    expect(evidence.textContent).toContain('Rewrite the branch lobby update.');
    expect(evidence.textContent).toContain('Review note');
    expect(evidence.textContent).toContain('Manager review confirmed the owner and deadline are clear.');
    expect(evidence.textContent).toContain('Next use');
    expect(evidence.textContent).toContain('Use this for the next staff bulletin before Friday.');
    expect(screen.getByRole('button', { name: /Check/i }).textContent).toContain(
      'Manager review confirmed the owner and deadline are clear.',
    );
    expect(screen.getByRole('button', { name: /Reuse/i }).textContent).toContain(
      'Use this for the next staff bulletin before Friday.',
    );
  });

  it('keeps the executive briefing CTA after the module debrief', () => {
    render(<CompletionCTA moduleNumber={9} isLastModule={false} />);

    expect(screen.getByText('Module debrief')).toBeTruthy();
    expect(screen.getByText('Understanding pillar complete')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Book an Executive Briefing/i })).toBeTruthy();
  });

  it('persists replay checks as learners mark retrieval prompts complete', () => {
    const { unmount } = render(<CompletionCTA moduleNumber={1} isLastModule={false} />);

    expect(screen.getByText('Replay checks: 0/4')).toBeTruthy();
    expect(screen.getByTestId('foundation-completion-replay').textContent).toContain('4 replay cues left.');

    const retrieveCheck = screen.getByRole('button', { name: /Remember/i });
    fireEvent.click(retrieveCheck);

    expect(screen.getByText('Replay checks: 1/4')).toBeTruthy();
    expect(retrieveCheck.getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.getItem('foundation-completion-debrief-1')).toBe('["retrieve"]');

    unmount();
    render(<CompletionCTA moduleNumber={1} isLastModule={false} />);

    expect(screen.getByText('Replay checks: 1/4')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Remember/i }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(screen.getByTestId('foundation-completion-replay').textContent).toContain('3 replay cues left.');

    fireEvent.click(screen.getByRole('button', { name: /Remember/i }));

    expect(screen.getByText('Replay checks: 0/4')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Remember/i }).getAttribute('aria-pressed')).toBe(
      'false',
    );
    expect(window.localStorage.getItem('foundation-completion-debrief-1')).toBe('[]');
  });

  it('restores replay checks from the cookie fallback', () => {
    document.cookie = `foundation-completion-debrief-1=${encodeURIComponent('["check"]')}; path=/`;

    render(<CompletionCTA moduleNumber={1} isLastModule={false} />);

    expect(screen.getByText('Replay checks: 1/4')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Check/i }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(screen.getByTestId('foundation-completion-replay').textContent).toContain('3 replay cues left.');
  });

  it('does not treat module 9 as the final module', () => {
    render(<CompletionCTA moduleNumber={9} isLastModule={false} />);

    expect(screen.queryByText('All modules complete')).toBeNull();
    const nextModuleLink = screen.getByRole('link', { name: /Module 10/i });
    expect(nextModuleLink.getAttribute('href')).toBe('/courses/foundation/program/10');
  });
});
