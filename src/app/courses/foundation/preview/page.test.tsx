import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FoundationPreviewPage from './page';

describe('FoundationPreviewPage', () => {
  it('shows Module 1 once: the idea, the drill, and what it saves', () => {
    render(<FoundationPreviewPage />);

    expect(screen.getByRole('heading', { level: 1, name: /what ai can and cannot do/i })).toBeTruthy();
    // Real course content, each piece shown once.
    expect(screen.getAllByText(/cannot know your bank policy/i)).toHaveLength(1);
    expect(screen.getByText(/try it now — same drill as the course/i)).toBeTruthy();
    expect(screen.getAllByText(/banker verifies the source and owns the action/i)).toHaveLength(1);
    expect(screen.getByTestId('preview-try')).toBeTruthy();
    expect(screen.getByTestId('preview-save')).toBeTruthy();
    expect(screen.getByText(/module 1 saves your ai limits card/i)).toBeTruthy();
    // No in-course anchors on the public preview.
    expect(document.querySelector('a[href="#st-sandbox"]')).toBeNull();
    expect(document.querySelector('a[href="#st-submit"]')).toBeNull();
  });

  it('keeps a persistent enroll path to the purchase page', () => {
    render(<FoundationPreviewPage />);

    const enrollLinks = screen
      .getAllByRole('link', { name: /enroll/i })
      .map((link) => link.getAttribute('href'));
    expect(enrollLinks.length).toBeGreaterThanOrEqual(2);
    expect(
      enrollLinks.every((href) => href === '/courses/foundation/program/purchase'),
    ).toBe(true);
    expect(screen.getByTestId('preview-sticky-enroll')).toBeTruthy();
  });
});
