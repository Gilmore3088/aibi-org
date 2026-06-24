import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AssessmentLandingPage from './_client';

describe('AssessmentLandingPage', () => {
  it('sets frontline and branch relevance before the free assessment CTA', () => {
    render(<AssessmentLandingPage />);

    expect(screen.getByRole('heading', { name: /find your ai starting point/i })).toBeTruthy();
    expect(screen.getByText(/frontline tellers, branch teams, lending/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /start free assessment/i }).getAttribute('href')).toBe(
      '/assessment/take',
    );
  });
});
