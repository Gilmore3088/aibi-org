import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  MODULE_COMPLETED_EVENT,
  SaveStepNavigation,
  moduleCompletedStorageKey,
} from './SaveStepNavigation';
import { MICRO_MODULES_BY_NUMBER } from '@content/courses/foundation-program/micro-modules';

const NEXT_LINK = `Continue to Module 02 · ${MICRO_MODULES_BY_NUMBER.get(2)?.title}`;

describe('SaveStepNavigation', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('gives a completed module a forward link out of the Save step', () => {
    render(<SaveStepNavigation moduleNumber={1} isLastModule={false} isAlreadyCompleted />);

    expect(screen.getByRole('link', { name: NEXT_LINK }).getAttribute('href')).toBe(
      '/courses/foundation/program/2',
    );
  });

  it('shows the locked step until the module is complete', () => {
    render(<SaveStepNavigation moduleNumber={1} isLastModule={false} isAlreadyCompleted={false} />);

    expect(screen.queryByRole('link', { name: NEXT_LINK })).toBeNull();
    expect(
      screen.getByRole('button', {
        name: 'Add the module review note and transfer plan to unlock the next module',
      }),
    ).toBeTruthy();
  });

  it('unlocks when Build completes the module during this visit', () => {
    render(<SaveStepNavigation moduleNumber={1} isLastModule={false} isAlreadyCompleted={false} />);

    act(() => {
      window.dispatchEvent(new CustomEvent(MODULE_COMPLETED_EVENT, { detail: { moduleNumber: 1 } }));
    });

    expect(screen.getByRole('link', { name: NEXT_LINK })).toBeTruthy();
  });

  it('ignores completion events for other modules', () => {
    render(<SaveStepNavigation moduleNumber={1} isLastModule={false} isAlreadyCompleted={false} />);

    act(() => {
      window.dispatchEvent(new CustomEvent(MODULE_COMPLETED_EVENT, { detail: { moduleNumber: 2 } }));
    });

    expect(screen.queryByRole('link', { name: NEXT_LINK })).toBeNull();
  });

  it('picks up completion recorded while the Save panel was unmounted', () => {
    window.sessionStorage.setItem(moduleCompletedStorageKey(1), '1');

    render(<SaveStepNavigation moduleNumber={1} isLastModule={false} isAlreadyCompleted={false} />);

    expect(screen.getByRole('link', { name: NEXT_LINK })).toBeTruthy();
  });
});
