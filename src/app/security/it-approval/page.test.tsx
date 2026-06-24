import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ITApprovalPage from './page';

describe('ITApprovalPage', () => {
  it('provides a forwardable vendor-management review packet and source links', () => {
    render(<ITApprovalPage />);

    expect(
      screen.getByRole('heading', { name: /forward this packet before an internal review/i }),
    ).toBeTruthy();
    expect(screen.getByText(/Built for IT, risk, compliance, procurement/i)).toBeTruthy();
    expect(screen.getAllByText(/Product scope/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Data posture/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Trust boundaries/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/does not claim SOC 2, ISO 27001, FedRAMP, GLBA/i)).toBeTruthy();
    expect(
      screen.getAllByRole('link', { name: /LLM data handling/i })
        .every((link) => link.getAttribute('href') === '/security/data-handling'),
    ).toBe(true);
    expect(screen.getByRole('link', { name: /Privacy/i }).getAttribute('href')).toBe('/privacy');
    expect(screen.getByRole('link', { name: /Terms/i }).getAttribute('href')).toBe('/terms');
  });
});
