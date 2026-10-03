import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModuleHeaderCard } from './ModuleHeaderCard';

const baseProps = {
  moduleNumber: 3,
  titleMain: 'Build a Meeting Actions Assistant',
  titleTail: null,
  keyOutput: 'Meeting Actions Assistant',
  goalLine: 'Turn a vague request into a clear, reusable CORE prompt.',
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
        element.textContent === 'Module 03 · Build a Meeting Actions Assistant',
      ),
    ).toBeTruthy();
    expect(screen.getByText('In progress')).toBeTruthy();
    expect(screen.getByText('You will build')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Meeting Actions Assistant' })).toBeTruthy();
    expect(screen.getByText('Turn a vague request into a clear, reusable CORE prompt.')).toBeTruthy();

    const facts = screen.getByLabelText('Module facts');
    expect(facts.textContent).toContain('Time');
    expect(facts.textContent).toContain('10 min');
    expect(facts.textContent).toContain('Build');
    expect(facts.textContent).toContain('Meeting Actions Assistant');
    expect(facts.textContent).toContain('Save');
    expect(facts.textContent).toContain('meeting actions assistant');

    expect(screen.queryByRole('list', { name: 'Module path' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Start' }).getAttribute('href')).toBe('#st-takeaway');
  });

  it('does not render the retired long-form learning loop', () => {
    render(<ModuleHeaderCard {...baseProps} />);

    expect(screen.queryByTestId('foundation-module-learning-loop')).toBeNull();
    expect(screen.queryByText('How this works')).toBeNull();
  });
});
