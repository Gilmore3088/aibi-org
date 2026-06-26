import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CoursesIndexPage from './_client';

describe('CoursesIndexPage', () => {
  it('centers the saved packet instead of overselling the certificate', () => {
    render(<CoursesIndexPage />);

    expect(screen.getByRole('heading', { name: /the packet is the useful part/i })).toBeTruthy();
    expect(screen.getAllByText(/saved work products/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/manager-readable evidence/i)).toBeTruthy();
    expect(screen.getAllByText(/simple completion record/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/the packet carries the substance/i)).toBeTruthy();
    expect(screen.getByText(/not a license, regulator approval/i)).toBeTruthy();
  });

  it('leads with Foundation outcomes and keeps the enrollment CTA focused', () => {
    render(<CoursesIndexPage />);

    expect(
      screen.getByRole('heading', { name: /build reusable ai work products for banking/i }),
    ).toBeTruthy();
    expect(
      screen.getByText(/18 modules · 18-piece Foundation Packet · reviewed work products/i),
    ).toBeTruthy();
    expect(screen.queryByText(/182 minutes/i)).toBeNull();
    expect(screen.getByRole('link', { name: /preview a lesson/i }).getAttribute('href')).toBe(
      '#lesson-preview',
    );
    expect(screen.getByRole('link', { name: /enroll in foundation/i }).getAttribute('href')).toBe(
      '/courses/foundation/program/purchase',
    );
    expect(screen.queryByRole('link', { name: /Get In-Depth report/i })).toBeNull();
  });
});
