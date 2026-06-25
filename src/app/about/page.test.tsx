import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutPage from './page';

describe('AboutPage', () => {
  it('surfaces the practical About story, source boundaries, and press path', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: /Practical AI training for banks/i })).toBeTruthy();
    expect(screen.getByText(/banking conference where AI was everywhere/i)).toBeTruthy();
    expect(screen.getByText(/turn bankers into builders, safely/i)).toBeTruthy();
    expect(screen.getByText(/Sources are named\. Endorsement is not implied/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /See every source we cite/i }).getAttribute('href')).toBe(
      '/references',
    );
    expect(screen.getByRole('heading', { name: /Need a source, quote, or background/i })).toBeTruthy();
    expect(screen.getByText(/Journalists, analysts, podcasters, and researchers/i)).toBeTruthy();
    expect(screen.getByText(/deadline, outlet, topic/i)).toBeTruthy();
    expect(screen.getByText(/will not imply regulator, customer, advisor/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Email press inquiry/i }).getAttribute('href')).toContain(
      'mailto:hello@aibankinginstitute.com?subject=Press%20%2F%20media%20inquiry',
    );
  });
});
