import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SecurityPage from './page';

describe('SecurityPage', () => {
  it('surfaces the Safe AI Use Guide and counsel review links', () => {
    render(<SecurityPage />);

    expect(screen.getByRole('heading', { name: /the Safe AI Use Guide/i })).toBeTruthy();
    expect(screen.getByText(/Preview the guide before you request it/i)).toBeTruthy();
    // The hero leads with the posture card; the guide form moved into §02.
    expect(screen.getByTestId('security-posture-card')).toBeTruthy();
    expect(screen.getByTestId('security-guide-form-section')).toBeTruthy();
    const dataHandlingLinks = screen.getAllByRole('link', { name: /LLM data-handling summary/i });
    expect(dataHandlingLinks.length).toBeGreaterThan(0);
    expect(
      dataHandlingLinks.every((link) => link.getAttribute('href') === '/security/data-handling'),
    ).toBe(true);
    const packetLinks = screen.getAllByRole('link', { name: /IT review packet/i });
    expect(packetLinks.length).toBeGreaterThan(0);
    expect(packetLinks.every((link) => link.getAttribute('href') === '/security/it-approval')).toBe(true);
  });

  it('cross-links security evaluators to the In-Depth report', () => {
    render(<SecurityPage />);

    const links = screen.getAllByRole('link', { name: /Get In-Depth report/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.getAttribute('href') === '/assessment/in-depth')).toBe(true);
  });
});
