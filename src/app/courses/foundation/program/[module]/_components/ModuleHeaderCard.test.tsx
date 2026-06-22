import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModuleHeaderCard } from './ModuleHeaderCard';

const baseProps = {
  moduleNumber: 3,
  titleMain: 'Spot weak AI output',
  titleTail: null,
  keyOutput: 'Claim Review Markup',
  goalLine: 'Catch unsupported claims before they become work product.',
  estimatedMinutes: 10,
  pillarId: 'understanding' as const,
  status: 'current' as const,
  statusLabel: 'In progress',
  hasLab: true,
};

describe('ModuleHeaderCard', () => {
  it('orients learners around one outcome and a compact module path', () => {
    render(
      <ModuleHeaderCard
        {...baseProps}
        learningPlan={{
          artifact: 'Prompt Strategy Cheat Sheet',
          recall: 'Without looking, name the four parts of CORE.',
          practice: 'Use the lab to improve a weak prompt.',
          feedback: 'Ready when someone else can run it.',
          transfer: 'Turn one recurring task into a reusable prompt.',
        }}
      />,
    );

    expect(
      screen.getByText((_, element) =>
        element?.classList.contains('foundation-module-hero__module-label') === true &&
        element.textContent === 'Module 03 · Spot weak AI output',
      ),
    ).toBeTruthy();
    expect(screen.getByText('In progress')).toBeTruthy();
    expect(screen.getByText('You will build')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Claim Review Markup' })).toBeTruthy();
    expect(screen.getByText('Catch unsupported claims before they become work product.')).toBeTruthy();

    const facts = screen.getByLabelText('Module facts');
    expect(facts.textContent).toContain('Time');
    expect(facts.textContent).toContain('10 min');
    expect(facts.textContent).toContain('Build');
    expect(facts.textContent).toContain('Claim Review Builder');
    expect(facts.textContent).toContain('Save');
    expect(facts.textContent).toContain('claim review markup');

    expect(screen.queryByRole('list', { name: 'Module path' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Start' }).getAttribute('href')).toBe('#st-takeaway');
  });

  it('does not render the retired long-form learning loop', () => {
    render(<ModuleHeaderCard {...baseProps} />);

    expect(screen.queryByTestId('foundation-module-learning-loop')).toBeNull();
    expect(screen.queryByText('How this works')).toBeNull();
  });
});
