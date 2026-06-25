import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PricingPage from './page';

describe('PricingPage', () => {
  it('renders the four buyer paths as a simplified buyer guide', () => {
    render(<PricingPage />);

    expect(screen.getByRole('heading', { name: /choose your ai banking path/i })).toBeTruthy();
    expect(screen.getAllByText('AI Readiness Snapshot').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In-Depth Assessment').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AiBI Foundation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Institution Rollout').length).toBeGreaterThan(0);

    expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$99').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$295').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Custom').length).toBeGreaterThan(0);
    expect(screen.getByText(/best first paid step/i)).toBeTruthy();
    expect(screen.getByText(/best for individual capability/i)).toBeTruthy();
    expect(screen.getByText(/not sure what to choose/i)).toBeTruthy();
    expect(screen.getByText(/where should i start/i)).toBeTruthy();
    expect(screen.getByText(/certificate \+ authenticity URL/i)).toBeTruthy();
    expect(screen.getByText(/simple purchase rules/i)).toBeTruthy();
    expect(screen.getByText(/no subscription is required/i)).toBeTruthy();
  });

  it('links each option to the correct next step', () => {
    render(<PricingPage />);

    expect(screen.getAllByRole('link', { name: /start free/i })[0]?.getAttribute('href')).toBe(
      '/assessment/take',
    );
    expect(screen.getByRole('link', { name: /get the report/i }).getAttribute('href')).toBe(
      '/assessment/in-depth',
    );
    expect(screen.getByRole('link', { name: /enroll in foundation/i }).getAttribute('href')).toBe(
      '/courses/foundation/program/purchase',
    );
    expect(screen.getAllByRole('link', { name: /request a rollout plan/i })[0]?.getAttribute('href')).toBe(
      '/for-institutions',
    );
    expect(screen.getByRole('link', { name: /run roi calculator/i }).getAttribute('href')).toBe(
      '/#roi-calculator',
    );
    expect(screen.getByRole('link', { name: /institution \/ partner inquiry/i }).getAttribute('href')).toBe(
      '/for-institutions',
    );
  });
});
