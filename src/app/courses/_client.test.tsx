import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CoursesIndexPage from './_client';

vi.mock('./_components/CoursePreviewDemos', () => ({
  CoursePreviewDemos: () => <div data-testid="course-preview-demos" />,
}));

describe('CoursesIndexPage', () => {
  it('explains what the AiBI-Foundation certificate proves and does not prove', () => {
    render(<CoursesIndexPage />);

    expect(screen.getByRole('heading', { name: /what the certificate proves/i })).toBeTruthy();
    expect(screen.getByText(/earned after the packet is complete/i)).toBeTruthy();
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

  it('cross-links course evaluators to the In-Depth report', () => {
    render(<CoursesIndexPage />);

    const links = screen.getAllByRole('link', { name: /Get In-Depth report/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.getAttribute('href') === '/assessment/in-depth')).toBe(true);
  });
});
