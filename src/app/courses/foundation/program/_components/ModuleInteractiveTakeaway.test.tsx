import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ModuleInteractiveTakeaway } from './ModuleInteractiveTakeaway';

describe('ModuleInteractiveTakeaway', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('renders the canonical micro takeaway for module 1', () => {
    render(
      <ModuleInteractiveTakeaway
        moduleNumber={1}
        moduleId="aibi-p-module-1"
        artifactLabel="AI Limits Card"
      />,
    );

    const builder = screen.getByTestId('foundation-micro-takeaway-builder');
    expect(builder.textContent).toContain('Micro takeaway');
    expect(builder.textContent).toContain('AI Limits Card');
    expect(builder.textContent).toContain('Try');
    expect(builder.textContent).toContain('Build');
    expect(builder.textContent).toContain('Review');
    expect(builder.textContent).toContain('Use at work');
  });

  it('saves a module-specific packet draft after all four moves are selected', () => {
    render(
      <ModuleInteractiveTakeaway
        moduleNumber={15}
        moduleId="aibi-p-module-15"
        artifactLabel="Human Review Gate Card"
      />,
    );

    const builder = screen.getByTestId('foundation-micro-takeaway-builder');
    expect(builder.textContent).toContain('Human Review Gate Card');
    expect(builder.textContent).toContain('Choose the best review gate');

    const moves = within(builder).getByLabelText('Takeaway moves');
    for (const button of within(moves).getAllByRole('button')) {
      fireEvent.click(button);
    }

    const save = within(builder).getByRole('button', { name: /Save to Human Review Gate Card/i });
    fireEvent.click(save);

    const payload = JSON.parse(
      window.localStorage.getItem('foundation-lab-draft-aibi-p-module-15') ?? '{}',
    );
    expect(payload.model).toBe('AiBI micro-module takeaway builder');
    expect(payload.moduleNumber).toBe(15);
    expect(payload.content).toContain('# Module 15 - Human Review Gate Card');
    expect(payload.content).toContain('SR 26-2 guardrail');
    expect(payload.reviewChecklist).toContain('Gate happens before impact');
  });

  it('covers the final module with the packet review artifact', () => {
    render(
      <ModuleInteractiveTakeaway
        moduleNumber={18}
        moduleId="aibi-p-module-18"
        artifactLabel="Foundation Packet Summary"
      />,
    );

    const builder = screen.getByTestId('foundation-micro-takeaway-builder');
    expect(builder.textContent).toContain('Foundation Packet Summary');
    expect(builder.textContent).toContain('manager-ready packet');
    expect(within(builder).getByRole('button', { name: /Select the four moves/i })).toHaveProperty('disabled', true);
  });
});
