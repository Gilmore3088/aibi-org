import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PricingPage from './page';

describe('PricingPage', () => {
  it('renders the four buyer paths in one comparison surface', () => {
    render(<PricingPage />);

    expect(screen.getByRole('heading', { name: /four paths/i })).toBeTruthy();
    expect(screen.getAllByText('AI Readiness Snapshot').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In-Depth Assessment').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AiBI-Foundation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Institution Rollout').length).toBeGreaterThan(0);

    expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$99').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$295').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Custom').length).toBeGreaterThan(0);
    expect(screen.getByText(/partner\/association rollout by request/i)).toBeTruthy();
    expect(screen.getByText(/partner or association rollout requests use the same inquiry path/i)).toBeTruthy();
    expect(screen.getByText(/credential \/ proof/i)).toBeTruthy();
    expect(screen.getByText(/certificate with public authenticity URL/i)).toBeTruthy();
    expect(screen.getByText(/no hidden self-serve team checkout/i)).toBeTruthy();
  });

  it('links each option to the correct next step', () => {
    render(<PricingPage />);

    expect(screen.getAllByRole('link', { name: /take free assessment/i })[0]?.getAttribute('href')).toBe(
      '/assessment/take',
    );
    expect(screen.getByRole('link', { name: /get the full report/i }).getAttribute('href')).toBe(
      '/assessment/in-depth',
    );
    expect(screen.getByRole('link', { name: /explore course/i }).getAttribute('href')).toBe(
      '/courses/foundation/program/purchase',
    );
    expect(screen.getByRole('link', { name: /request institution or partner plan/i }).getAttribute('href')).toBe(
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
