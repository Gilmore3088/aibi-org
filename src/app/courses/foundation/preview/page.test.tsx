import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FoundationPreviewPage from './page';

describe('FoundationPreviewPage', () => {
  it('gives visitors the real Module 1 build, free', () => {
    render(<FoundationPreviewPage />);

    expect(screen.getByRole('heading', { level: 1, name: /set your ai house rules/i })).toBeTruthy();
    expect(screen.getByTestId('preview-build')).toBeTruthy();
    expect(screen.getByTestId('build-guide')).toBeTruthy();
    // Three short steps; the full rules sit behind "Read the full text".
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['1Copy', '2Save', '3Test']);
    expect(screen.getByText(/flags customer data/i)).toBeTruthy();
    expect(screen.getByText(/follow these rules in every conversation with me/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: /save/i }));
    expect(screen.getByText(/custom instructions/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: /test/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Customer data' }));
    expect(screen.getByText(/replace them with \[customer\] and \[account\]/i)).toBeTruthy();
    expect(screen.getByText(/you just built your ai house rules/i)).toBeTruthy();
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
