import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getPracticeRepById } from '@content/practice-reps/foundation-program';
import { PracticeRepClient } from './PracticeRepClient';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

describe('PracticeRepClient submit', () => {
  it('explains why Submit is disabled until there is enough to review', () => {
    const rep = getPracticeRepById('safe-prompt-conversion')!;
    render(<PracticeRepClient rep={rep} />);
    const submit = screen.getByRole('button', { name: /submit practice rep/i });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/at least a sentence \(20 characters\)/i)).toBeTruthy();
    expect(submit.getAttribute('aria-describedby')).toBe('rep-submit-hint');

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Rewrite this so it asks for reusable guidance with no customer details.' },
    });
    expect((submit as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByText(/at least a sentence/i)).toBeNull();
  });
});
