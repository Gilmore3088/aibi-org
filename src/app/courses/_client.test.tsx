import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CoursesIndexPage from './_client';

describe('CoursesIndexPage', () => {
  it('explains what the AiBI-Foundation certificate proves and does not prove', () => {
    render(<CoursesIndexPage />);

    expect(screen.getByRole('heading', { name: /this is not a webinar certificate/i })).toBeTruthy();
    expect(screen.getByText(/earned after packet completion/i)).toBeTruthy();
    expect(screen.getByText(/public authenticity URL/i)).toBeTruthy();
    expect(screen.getByText(/evidence behind the badge/i)).toBeTruthy();
    expect(screen.getByText(/not a license, regulator approval/i)).toBeTruthy();

    expect(screen.getByRole('link', { name: /read credential details/i }).getAttribute('href')).toBe(
      '/certifications',
    );
    expect(screen.getByRole('link', { name: /open verification lookup/i }).getAttribute('href')).toBe(
      '/verify',
    );
  });

  it('leads with Foundation outcomes and keeps the enrollment CTA focused', () => {
    render(<CoursesIndexPage />);

    expect(
      screen.getByRole('heading', { name: /build reusable ai work products for banking/i }),
    ).toBeTruthy();
    expect(screen.getByText(/18 modules · 182 minutes · 18-piece Foundation Packet/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /preview a lesson/i }).getAttribute('href')).toBe(
      '#lesson-preview',
    );
    expect(screen.getByRole('link', { name: /enroll in foundation/i }).getAttribute('href')).toBe(
      '/courses/foundation/program/purchase',
    );
    expect(screen.queryByRole('link', { name: /Get In-Depth report/i })).toBeNull();
  });
});
