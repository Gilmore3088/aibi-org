// SpotTheViolation widget tests.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  SpotTheViolation,
  type SpotTheViolationDescriptor,
  type SpotTheViolationResult,
} from './SpotTheViolation';

function buildDescriptor(): SpotTheViolationDescriptor {
  // Two scenarios — minimal but follows the seed contract:
  // options[0] is the correct pick.
  return {
    preset_context_blocks: [
      {
        id: 'scenarios',
        label: 'compliance scenarios',
        body: JSON.stringify([
          {
            id: 's01',
            situation: 'Teller pastes an account number into ChatGPT.',
            options: [
              {
                id: 'v',
                label: 'Violation',
                is_violation: true,
                explanation: 'Account numbers are off-limits.',
              },
              {
                id: 'n',
                label: 'Not a violation',
                is_violation: false,
                explanation: 'This is a violation.',
              },
            ],
          },
          {
            id: 's02',
            situation: 'Analyst summarizes a public CFPB rule.',
            options: [
              {
                id: 'n',
                label: 'Not a violation',
                is_violation: false,
                explanation: 'Public material is fair game.',
              },
              {
                id: 'v',
                label: 'Violation',
                is_violation: true,
                explanation: 'Not a violation.',
              },
            ],
          },
        ]),
      },
    ],
  };
}

describe('SpotTheViolation', () => {
  it('renders an empty-state when no scenarios are seeded', () => {
    render(
      <SpotTheViolation
        exerciseDescriptor={{ preset_context_blocks: [] }}
      />
    );
    expect(
      screen.getByText(/No scenarios have been seeded/i)
    ).toBeTruthy();
  });

  it('walks scenarios, reveals explanations, tallies correctness, and fires onComplete', () => {
    const onComplete = vi.fn();
    render(
      <SpotTheViolation
        exerciseDescriptor={buildDescriptor()}
        onComplete={onComplete}
      />
    );

    // First scenario.
    expect(screen.getByText(/Teller pastes an account number/i)).toBeTruthy();
    expect(screen.getByText(/Scenario 1 of 2/i)).toBeTruthy();

    // Pick the correct option (id "v", labelled "Violation").
    fireEvent.click(screen.getByRole('radio', { name: /^Violation$/i }));
    expect(screen.getByText(/^Correct$/i)).toBeTruthy();
    expect(screen.getByText(/Account numbers are off-limits/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Next scenario/i }));

    // Second scenario.
    expect(screen.getByText(/Analyst summarizes a public CFPB rule/i)).toBeTruthy();

    // Pick the WRONG option (id "v", labelled "Violation") — the truth here
    // is "not a violation" because the source is public.
    fireEvent.click(screen.getByRole('radio', { name: /^Violation$/i }));
    expect(screen.getByText(/You missed a violation|Not quite/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /See result/i }));

    // Final tally.
    expect(screen.getByText(/1 of 2 correct/i)).toBeTruthy();
    expect(onComplete).toHaveBeenCalledTimes(1);
    const arg = onComplete.mock.calls[0]?.[0] as SpotTheViolationResult;
    expect(arg.total).toBe(2);
    expect(arg.correct).toBe(1);
    expect(arg.answers).toHaveLength(2);
  });

  it('locks the answer once selected and restart resets state', () => {
    render(<SpotTheViolation exerciseDescriptor={buildDescriptor()} />);

    fireEvent.click(screen.getByRole('radio', { name: /^Violation$/i }));
    // Both radios should now be disabled.
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => {
      expect((r as HTMLButtonElement).disabled).toBe(true);
    });

    // Walk to completion to expose the Restart button.
    fireEvent.click(screen.getByRole('button', { name: /Next scenario/i }));
    fireEvent.click(screen.getByRole('radio', { name: /^Not a violation$/i }));
    fireEvent.click(screen.getByRole('button', { name: /See result/i }));

    expect(screen.getByText(/2 of 2 correct/i)).toBeTruthy();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Restart drill/i }));
    });
    expect(screen.getByText(/Scenario 1 of 2/i)).toBeTruthy();
  });

  it('drops malformed scenarios', () => {
    render(
      <SpotTheViolation
        exerciseDescriptor={{
          preset_context_blocks: [
            {
              id: 'scenarios',
              label: 'compliance scenarios',
              body: JSON.stringify([
                { id: 'broken' }, // missing situation + options
                {
                  id: 's01',
                  situation: 'Valid one.',
                  options: [
                    {
                      id: 'v',
                      label: 'Violation',
                      is_violation: true,
                      explanation: 'ok',
                    },
                    {
                      id: 'n',
                      label: 'Not a violation',
                      is_violation: false,
                      explanation: 'no',
                    },
                  ],
                },
              ]),
            },
          ],
        }}
      />
    );
    expect(screen.getByText(/Scenario 1 of 1/i)).toBeTruthy();
    expect(screen.getByText(/Valid one\./i)).toBeTruthy();
  });
});
