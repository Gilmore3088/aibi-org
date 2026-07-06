import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PurchaseHero } from './PurchaseHero';

vi.mock('./SavedPromptCard', () => ({
  SavedPromptCard: () => <div data-testid="saved-prompt-card" />,
}));

describe('PurchaseHero', () => {
  it('states the derived total seat time before the buy decision', () => {
    render(<PurchaseHero enrollButton={<button type="button">Enroll</button>} />);

    expect(
      screen.getByText(/~\d+(\.\d+)? hours total · \d+–\d+ min per module · self-paced/),
    ).toBeTruthy();
  });
});
