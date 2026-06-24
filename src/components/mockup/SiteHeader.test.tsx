import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  it('promotes Resources into the mobile primary navigation', () => {
    render(<SiteHeader activePath="/resources" />);

    const mobileNav = screen.getByRole('navigation', { name: /primary \(mobile\)/i });
    const resourcesLink = within(mobileNav).getByRole('link', { name: 'Resources' });
    expect(resourcesLink.getAttribute('href')).toBe('/resources');
    expect(resourcesLink.getAttribute('aria-current')).toBe('page');

    fireEvent.click(within(mobileNav).getByRole('button', { name: 'More' }));

    const morePanel = screen.getByRole('region', { name: /more navigation/i });
    expect(within(morePanel).queryByRole('link', { name: /Resources/i })).toBeNull();
    expect(within(morePanel).getByRole('link', { name: /Pricing/i }).getAttribute('href')).toBe('/pricing');
    expect(within(morePanel).getByRole('link', { name: /Institutions/i }).getAttribute('href')).toBe(
      '/for-institutions',
    );
  });
});
