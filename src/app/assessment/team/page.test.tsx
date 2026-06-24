import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TeamAssessmentPage from './page';

vi.mock('@/lib/team-assessment/self-serve', () => ({
  isTeamAssessmentSelfServeEnabled: () => false,
}));

vi.mock('./_components/TeamCheckoutForm', () => ({
  TeamCheckoutForm: () => <div data-testid="team-checkout-form" />,
}));

describe('TeamAssessmentPage', () => {
  it('surfaces the L&D cohort packet and assisted inquiry path', () => {
    render(<TeamAssessmentPage />);

    expect(
      screen.getByRole('heading', { name: /cohort launch packet before seats go live/i }),
    ).toBeTruthy();
    expect(screen.getByText(/for HR and L&D/i)).toBeTruthy();
    expect(screen.getByText(/cohort roster template with departments/i)).toBeTruthy();
    expect(screen.getByText(/manager kickoff email and participant invite copy/i)).toBeTruthy();
    expect(screen.getByText(/completion tracker plus aggregate report handoff/i)).toBeTruthy();
    expect(screen.getByText(/reply target: within one business day/i)).toBeTruthy();
    expect(screen.getByText(/checkout stays assisted until cohort setup is confirmed/i)).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /plan an L&D cohort pilot/i }).getAttribute('href'),
    ).toBe('#team-assessment-inquiry');
    expect(screen.getByRole('option', { name: /cohort pilot \/ L&D rollout/i })).toBeTruthy();
    expect(screen.queryByText(/gated for QA|production-like cohorts|pass end-to-end QA/i)).toBeNull();
  });
});
