import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('links evaluators to the public AI practice sandbox', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('link', { name: /AI practice sandbox/i }).getAttribute('href')).toBe(
      '/practice',
    );
  });

  it('links to the centralized sources & references page', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('link', { name: /Sources & references/i }).getAttribute('href')).toBe(
      '/references',
    );
  });

  it('links buyers to the consolidated pricing map', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('link', { name: /^Pricing$/i }).getAttribute('href')).toBe('/pricing');
  });

  it('links credential evaluators to certification details and verification lookup', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('link', { name: /Certifications/i }).getAttribute('href')).toBe(
      '/certifications',
    );
    expect(screen.getByRole('link', { name: /Verify certificate/i }).getAttribute('href')).toBe(
      '/verify',
    );
  });

  it('links journalists to press and media inquiries', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('link', { name: /Press \/ media inquiries/i }).getAttribute('href')).toContain(
      'mailto:hello@aibankinginstitute.com?subject=Press%20%2F%20media%20inquiry',
    );
  });
});
