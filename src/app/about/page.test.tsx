import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutPage from './page';

describe('AboutPage', () => {
  it('surfaces a press and research inquiry path with attribution boundaries', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: /Need a source, quote, or background/i })).toBeTruthy();
    expect(screen.getByText(/Journalists, analysts, podcasters, and researchers/i)).toBeTruthy();
    expect(screen.getByText(/deadline, outlet, topic/i)).toBeTruthy();
    expect(screen.getByText(/will not imply regulator, customer, advisor, or learner endorsement/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Email press inquiry/i }).getAttribute('href')).toContain(
      'mailto:hello@aibankinginstitute.com?subject=Press%20%2F%20media%20inquiry',
    );
  });
});
