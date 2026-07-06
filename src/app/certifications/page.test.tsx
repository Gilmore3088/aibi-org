import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CertificationsPage from './page';

describe('CertificationsPage', () => {
  it('explains the AiBI-Foundation credential and verification boundary', () => {
    render(<CertificationsPage />);

    expect(screen.getByRole('heading', { name: /the aibi-foundation credential/i })).toBeTruthy();
    expect(screen.getByText(/public URL that confirms authenticity/i)).toBeTruthy();
    expect(screen.getByText(/certificate issues with a verification link/i)).toBeTruthy();
    expect(screen.getByText(/No federal or state regulator issues/i)).toBeTruthy();
    expect(
      screen
        .getAllByRole('link', { name: /Enroll in Foundation/i })
        .every((link) => link.getAttribute('href') === '/courses/foundation'),
    ).toBe(true);
    expect(screen.getByRole('link', { name: /See the curriculum/i }).getAttribute('href')).toBe('/courses');
  });

  it('states documented seat time for institutional training logs without CPE claims', () => {
    render(<CertificationsPage />);

    expect(
      screen.getByRole('heading', { name: /documented seat time for your training log/i }),
    ).toBeTruthy();
    expect(screen.getByText(/~\d+(\.\d+)? hours of seat time/i)).toBeTruthy();
    expect(
      screen.getByText(/not CPE credit, accreditation, or\s+regulator-endorsed training/i),
    ).toBeTruthy();
  });
});
