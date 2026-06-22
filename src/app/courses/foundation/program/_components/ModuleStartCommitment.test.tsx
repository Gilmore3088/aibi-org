import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModuleStartCommitment } from './ModuleStartCommitment';

describe('ModuleStartCommitment', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('saves and restores a concrete work target for the module', () => {
    const { unmount } = render(
      <ModuleStartCommitment
        moduleNumber={1}
        artifactLabel="Rewritten Email + a reusable rewrite prompt"
        useCaseLabel="Turning messy internal notes into five-minute review tasks"
        qualityBar="No names, account numbers, or unreviewed AI draft gets sent"
        transferCue="Pick one real message you owe this week."
      />,
    );

    expect(screen.getByTestId('foundation-start-commitment').textContent).toContain(
      'Choose the work this module will improve.',
    );
    expect(screen.getByText('Choose before lab')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save target' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(screen.getByTestId('foundation-start-target-summary').textContent).toContain(
      'Choose one work target before the lab.',
    );
    const contract = screen.getByTestId('foundation-start-contract');
    expect(contract.textContent).toContain('Use for');
    expect(contract.textContent).toContain(
      'Turning messy internal notes into five-minute review tasks',
    );
    expect(contract.textContent).toContain('Save');
    expect(contract.textContent).toContain(
      'Rewritten Email + a reusable rewrite prompt',
    );
    expect(contract.textContent).toContain('Prove');
    expect(contract.textContent).toContain(
      'No names, account numbers, or unreviewed AI draft gets sent',
    );
    fireEvent.change(screen.getByLabelText('My target use'), {
      target: { value: 'Use this on the next branch operations update.' },
    });
    expect(screen.getByRole('button', { name: 'Save target' })).toHaveProperty(
      'disabled',
      false,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save target' }));

    expect(window.localStorage.getItem('foundation-module-start-target-1')).toBe(
      'Use this on the next branch operations update.',
    );
    expect(screen.getByText('Target saved for lab')).toBeTruthy();
    expect(screen.getByTestId('foundation-start-target-summary').textContent).toContain(
      'Use this on the next branch operations update.',
    );

    unmount();
    render(
      <ModuleStartCommitment
        moduleNumber={1}
        artifactLabel="Rewritten Email + a reusable rewrite prompt"
        useCaseLabel="Turning messy internal notes into five-minute review tasks"
        qualityBar="No names, account numbers, or unreviewed AI draft gets sent"
        transferCue="Pick one real message you owe this week."
      />,
    );

    expect(screen.getByLabelText('My target use')).toHaveProperty(
      'value',
      'Use this on the next branch operations update.',
    );
    expect(screen.getByText('Target saved for lab')).toBeTruthy();
  });

  it('lets learners pick a quick target without typing', () => {
    render(
      <ModuleStartCommitment
        moduleNumber={8}
        artifactLabel="Workflow Map"
        useCaseLabel="Decomposing one recurring workflow into AI-supported steps"
        qualityBar="Blocked decisions stay behind approved controls"
        transferCue="Choose one recurring workflow and map the handoffs."
      />,
    );

    const quickTarget = screen.getByRole('button', { name: 'A workflow handoff' });
    fireEvent.click(quickTarget);

    expect(window.localStorage.getItem('foundation-module-start-target-8')).toBe(
      'A workflow handoff',
    );
    expect(screen.getByLabelText('My target use')).toHaveProperty('value', 'A workflow handoff');
    expect(quickTarget.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Target saved for lab')).toBeTruthy();
    expect(screen.getByTestId('foundation-start-target-summary').textContent).toContain(
      'A workflow handoff',
    );
  });

  it('announces target changes for the module evidence trail', () => {
    const listener = vi.fn();
    window.addEventListener('foundation-module-start-target-updated', listener);

    render(
      <ModuleStartCommitment
        moduleNumber={1}
        artifactLabel="Rewritten Email + a reusable rewrite prompt"
        useCaseLabel="Turning messy internal notes into five-minute review tasks"
        qualityBar="No names, account numbers, or unreviewed AI draft gets sent"
        transferCue="Pick one real message you owe this week."
      />,
    );

    fireEvent.change(screen.getByLabelText('My target use'), {
      target: { value: 'Use this on a weekly branch note.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save target' }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
      moduleNumber: 1,
      value: 'Use this on a weekly branch note.',
    });

    window.removeEventListener('foundation-module-start-target-updated', listener);
  });
});
