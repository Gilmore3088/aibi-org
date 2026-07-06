import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Wordmark } from './Wordmark';

describe('Wordmark', () => {
  it('renders the full lockup as text — never a remote-font SVG that can clip', () => {
    const { container } = render(<Wordmark variant="full" tone="dark" size={24} />);

    const lockup = screen.getByRole('img', { name: '[Ai] Banking Institute' });
    // The full brand string is real text in the DOM (self-hosted fonts),
    // so blocked font networks can no longer clip it to "Banking Insti".
    expect(lockup.textContent?.replace(/\s+/g, ' ')).toContain('Banking Institute');
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders the compact [Ai]BI variant', () => {
    render(<Wordmark variant="compact" />);
    const lockup = screen.getByRole('img', { name: '[Ai]BI' });
    expect(lockup.textContent?.replace(/\s+/g, '')).toBe('[Ai]BI');
  });
});
