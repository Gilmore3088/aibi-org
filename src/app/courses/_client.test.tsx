import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CoursesIndexPage from './_client';

describe('CoursesIndexPage', () => {
  it('centers the saved packet instead of overselling the certificate', () => {
    render(<CoursesIndexPage />);

    expect(screen.getByRole('heading', { name: /the packet is the useful part/i })).toBeTruthy();
    expect(screen.getAllByText(/reusable prompt card/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/review note/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/packet artifact/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/not a license, regulator approval/i)).toBeTruthy();
  });

  it('leads with Foundation outcomes and keeps the enrollment CTA focused', () => {
    render(<CoursesIndexPage />);

    expect(
      screen.getByRole('heading', { name: /build reusable ai work products for banking/i }),
    ).toBeTruthy();
    expect(
      screen.getByText(/18 modules · self-paced · 18-piece Foundation Packet · reviewed work products/i),
    ).toBeTruthy();
    expect(screen.queryByText(/182 minutes/i)).toBeNull();
    expect(screen.getByRole('heading', { name: /one lesson\. one saved artifact/i })).toBeTruthy();
    expect(screen.getByText(/turn a loose request into a reusable prompt card/i)).toBeTruthy();
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
