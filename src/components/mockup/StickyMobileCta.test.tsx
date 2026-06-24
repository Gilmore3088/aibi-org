import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StickyMobileCta } from './StickyMobileCta';

describe('StickyMobileCta', () => {
  it('is immediately reachable on mobile unless dismissed', async () => {
    render(<StickyMobileCta label="Get my AI readiness score" href="/assessment/take" />);

    const action = screen.getByRole('link', { name: /Get my AI readiness score/i });
    await waitFor(() => {
      expect(action.closest('.mk-sticky-mobile-cta')?.getAttribute('data-visible')).toBe('true');
    });
    expect(action.getAttribute('href')).toBe('/assessment/take');
    expect(action.getAttribute('tabindex')).toBe('0');
  });
});
