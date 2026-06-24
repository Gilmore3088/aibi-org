import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForInstitutionsPage from './_client';

describe('ForInstitutionsPage', () => {
  it('routes team buying CTAs into the structured institution inquiry path', () => {
    render(<ForInstitutionsPage />);

    expect(
      screen.getByRole('heading', { name: /send the team request before checkout/i }),
    ).toBeTruthy();
    expect(screen.getByText(/an L&D cohort pilot/i)).toBeTruthy();
    expect(screen.getAllByText(/PMO project plan/i).length).toBeGreaterThan(1);
    expect(screen.getByText(/partner rollout across member or client institutions/i)).toBeTruthy();
    expect(screen.getByText(/reply target: within one business day/i)).toBeTruthy();
    expect(screen.getByText(/lead capture goes to the support\/admin queue/i)).toBeTruthy();
    expect(screen.getByRole('heading', { name: /PMO project plan/i })).toBeTruthy();
    expect(screen.getByText(/90-day workplan with milestones and dependencies/i)).toBeTruthy();
    expect(screen.getByText(/Named sponsor, rollout owner, support owner/i)).toBeTruthy();
    expect(screen.getByText(/One-business-day response SLA and first-call agenda/i)).toBeTruthy();
    expect(screen.getByRole('option', { name: /PMO project plan/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Cohort pilot \/ L&D rollout/i })).toBeTruthy();
    expect(screen.getByText(/cohort launch plan and owner handoff/i)).toBeTruthy();
    expect(screen.getByText(/manager kickoff email and participant invite copy/i)).toBeTruthy();
    expect(screen.getByText(/completion tracker and aggregate report handoff/i)).toBeTruthy();
    expect(screen.getByRole('option', { name: /Cohort pilot \/ L&D rollout/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Partner \/ association rollout/i })).toBeTruthy();
    expect(screen.getByText(/bankers' banks, banking associations, and service providers/i)).toBeTruthy();
    expect(screen.getByRole('option', { name: /Bankers' bank \/ association partner/i })).toBeTruthy();

    expect(
      screen.getByRole('link', { name: /request assisted rollout/i }).getAttribute('href'),
    ).toBe('#team-inquiry');
    expect(
      screen.getByRole('link', { name: /request course seats/i }).getAttribute('href'),
    ).toBe('#team-inquiry');
    expect(
      screen.getByRole('link', { name: /plan cohort pilot/i }).getAttribute('href'),
    ).toBe('#team-inquiry');
    expect(
      screen.getByRole('link', { name: /scope project plan/i }).getAttribute('href'),
    ).toBe('#team-inquiry');
    expect(
      screen.getAllByRole('link', { name: /book executive briefing/i })[0]?.getAttribute('href'),
    ).toBe('#team-inquiry');
    expect(
      screen.getByRole('link', { name: /scope partner rollout/i }).getAttribute('href'),
    ).toBe('#team-inquiry');

    const mailtoLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('mailto:'));
    expect(mailtoLinks).toHaveLength(0);
    expect(screen.queryByText(/gated for QA|production-like cohorts|pass end-to-end QA/i)).toBeNull();
  });
});
