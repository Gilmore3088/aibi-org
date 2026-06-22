import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LearnSection } from './LearnSection';

describe('LearnSection', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('opens with a compact guided concept instead of the legacy reading coach', () => {
    render(<LearnSection sections={[]} moduleNumber={1} />);

    const guided = screen.getByTestId('foundation-guided-understand');

    expect(within(guided).getByText('Start with this')).toBeTruthy();
    expect(within(guided).getByText('Try it').getAttribute('href')).toBe('#st-sandbox');
    expect(within(guided).getByText('Guardrail')).toBeTruthy();
    expect(within(guided).getByText('Model')).toBeTruthy();
    expect(screen.queryByTestId('foundation-practice-coach')).toBeNull();
    expect(screen.queryByTestId('foundation-retrieval-warmup')).toBeNull();
  });

  it('keeps depth in an optional reference drawer', () => {
    render(
      <LearnSection
        moduleNumber={4}
        keyTakeaways={['Name the role and task.', 'Add source and format boundaries.']}
        sections={[
          {
            id: 'section-1',
            title: 'Build the first prompt',
            content:
              'A useful banking prompt names the audience, task, source material, output shape, and human review owner before asking AI to draft anything.',
            tryThis:
              'Draft one prompt for a low-risk internal task, then mark the review owner before saving it.',
          },
        ]}
      />,
    );

    const drawer = screen.getByTestId('foundation-reference-drawer');
    const map = within(drawer).getByTestId('foundation-reference-map');

    expect(within(drawer).getByText('Reference')).toBeTruthy();
    expect(within(map).getByText('Name the role and task.')).toBeTruthy();
    expect(within(map).getByText('Build the first prompt')).toBeTruthy();
    expect(within(map).getByText(/Try: Draft one prompt/i)).toBeTruthy();
  });

  it('shows one worked example without making it the default reading surface', () => {
    render(<LearnSection sections={[]} moduleNumber={3} />);

    const example = screen.getByTestId('foundation-quick-example');

    expect(within(example).getByText('Example')).toBeTruthy();
    expect(within(example).getByText('Weak vs. better')).toBeTruthy();
    expect(example.textContent).toContain('Weak');
    expect(example.textContent).toContain('Better');
  });

  it('keeps the visible concept short while still surfacing the banking guardrail', () => {
    render(<LearnSection sections={[]} moduleNumber={13} />);

    const guided = screen.getByTestId('foundation-guided-understand');

    expect(guided.textContent).toContain('A skill is a reusable work pattern');
    expect(within(guided).getByText('Guardrail')).toBeTruthy();
    expect(within(guided).getByText('Model')).toBeTruthy();
    expect(guided.textContent).toContain('review');
  });

  it('falls back to simple drawers when a module has no micro-module brief', () => {
    render(
      <LearnSection
        moduleNumber={0}
        sections={[
          {
            id: 'legacy-section',
            title: 'Legacy reference',
            content: 'A concise fallback for non-course previews.',
          },
        ]}
      />,
    );

    expect(screen.queryByTestId('foundation-guided-understand')).toBeNull();
    expect(screen.getByText('Legacy reference')).toBeTruthy();
    expect(screen.getByText('A concise fallback for non-course previews.')).toBeTruthy();
  });
});
