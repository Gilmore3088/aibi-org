import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CoursesIndexPage from './_client';

describe('CoursesIndexPage', () => {
  it('keeps the page short and does not oversell the certificate', () => {
    render(<CoursesIndexPage />);

    expect(screen.getByText(/not a license, regulator approval/i)).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
  });

  it('leads with Foundation outcomes and keeps the enrollment CTA focused', () => {
    render(<CoursesIndexPage />);

    expect(
      screen.getByRole('heading', { name: /ai training for community bank staff/i }),
    ).toBeTruthy();
    expect(
      screen.getByText(/18 modules · self-paced · 18-piece Foundation Packet/i),
    ).toBeTruthy();
    expect(screen.queryByText(/182 minutes/i)).toBeNull();
    expect(screen.queryByText(/Branch operations reviewer/i)).toBeNull();
    expect(screen.getByRole('link', { name: /preview module 1 free/i }).getAttribute('href')).toBe(
      '/courses/foundation/preview',
    );
    expect(screen.getByRole('link', { name: /enroll in foundation/i }).getAttribute('href')).toBe(
      '/courses/foundation/program/purchase',
    );
    expect(screen.queryByRole('link', { name: /Get In-Depth report/i })).toBeNull();
  });

  it('surfaces total seat time in the hero proofline when facts provide it', () => {
    render(
      <CoursesIndexPage
        facts={{
          moduleCount: 18,
          artifactCount: 18,
          individualPriceLabel: '$295',
          durationLabel: '~3 hours self-paced',
          samplePacketSlots: [{ moduleNumber: 1, label: 'AI Limits Card' }],
        }}
      />,
    );

    expect(
      screen.getByText(/18 modules · ~3 hours self-paced · 18-piece Foundation Packet/i),
    ).toBeTruthy();
  });
});
