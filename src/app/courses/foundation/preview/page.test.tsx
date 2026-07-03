import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FoundationPreviewPage from './page';

describe('FoundationPreviewPage', () => {
  it('renders real Module 1 Understand content with an honest preview boundary', () => {
    render(<FoundationPreviewPage />);

    expect(
      screen.getByText(/free preview · module 1 of 18 — understand section/i),
    ).toBeTruthy();
    // Real course content renders through LearnSection, not marketing copy.
    expect(screen.getByTestId('foundation-guided-understand')).toBeTruthy();
    expect(screen.getByTestId('foundation-reference-drawer')).toBeTruthy();
    // Paid surfaces are named as paid, and their in-course anchors are absent.
    expect(screen.getByText(/part of the paid course/i)).toBeTruthy();
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
