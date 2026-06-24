import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('links evaluators to the public AI demo sandbox', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('link', { name: /AI demo sandbox/i }).getAttribute('href')).toBe(
      '/playground',
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
