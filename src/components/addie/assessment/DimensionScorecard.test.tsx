// DimensionScorecard — renders all 8 dimensions, sorts high→low,
// and marks the lowest-scoring dimension(s) as "focus first".

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { DimensionScorecard } from './DimensionScorecard';
import { DIMENSION_KEYS, DIMENSION_LABELS } from '@/lib/addie/assessment/dimensions';

const HIGH_TO_LOW: Record<string, number> = {
  'current-ai-usage': 22,
  'experimentation-culture': 20,
  'ai-literacy-level': 18,
  'quick-win-potential': 16,
  'leadership-buy-in': 14,
  'security-posture': 12,
  'training-infrastructure': 10,
  'builder-potential': 6,
};

describe('DimensionScorecard', () => {
  it('renders all 8 readiness dimensions by label', () => {
    render(<DimensionScorecard dimension_scores={HIGH_TO_LOW} />);
    for (const key of DIMENSION_KEYS) {
      expect(screen.getByText(DIMENSION_LABELS[key])).toBeTruthy();
    }
  });

  it('sorts dimensions highest score to lowest', () => {
    render(<DimensionScorecard dimension_scores={HIGH_TO_LOW} />);
    const items = screen.getAllByRole('progressbar');
    expect(items).toHaveLength(8);
    const labels = items.map((el) => el.getAttribute('aria-label'));
    expect(labels[0]).toBe(DIMENSION_LABELS['current-ai-usage']);
    expect(labels[labels.length - 1]).toBe(DIMENSION_LABELS['builder-potential']);
  });

  it('marks the lowest-scoring dimension as "focus first"', () => {
    render(<DimensionScorecard dimension_scores={HIGH_TO_LOW} />);
    const focusNotes = screen.getAllByText(/focus first/i);
    // The kicker copy ("focus first") in the section description plus
    // exactly one footnote on the lowest dimension.
    const footnotes = focusNotes.filter((el) => el.tagName.toLowerCase() === 'div');
    expect(footnotes.length).toBe(1);
  });

  it('marks all tied lowest dimensions as focus', () => {
    const tied = { ...HIGH_TO_LOW, 'training-infrastructure': 6 };
    render(<DimensionScorecard dimension_scores={tied} />);
    const focusFootnotes = screen
      .getAllByText(/focus first/i)
      .filter((el) => el.tagName.toLowerCase() === 'div');
    expect(focusFootnotes.length).toBe(2);
  });

  it('does not mark anything as focus when every dimension is maxed', () => {
    const maxed = Object.fromEntries(DIMENSION_KEYS.map((k) => [k, 24]));
    render(<DimensionScorecard dimension_scores={maxed} />);
    const focusFootnotes = screen
      .queryAllByText(/focus first/i)
      .filter((el) => el.tagName.toLowerCase() === 'div');
    expect(focusFootnotes.length).toBe(0);
  });

  it('renders the score as label/max with tabular-nums styling', () => {
    render(<DimensionScorecard dimension_scores={HIGH_TO_LOW} />);
    const score = screen.getByLabelText('Score 22 of 24');
    expect(within(score.parentElement!).getByText(/22/)).toBeTruthy();
  });
});
