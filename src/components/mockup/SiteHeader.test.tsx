import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  it('lists destination nouns without a redundant Home item (logo links home)', () => {
    render(<SiteHeader activePath="/pricing" />);

    const desktopNav = screen.getByRole('navigation', { name: /^Primary$/i });
    expect(within(desktopNav).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Assessment',
      'Training',
      'Resources',
      'For Institutions',
      'Pricing',
    ]);
  });

  it('opens an accessible mobile drawer and marks the current page', () => {
    render(<SiteHeader activePath="/resources" />);

    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(menuButton.getAttribute('aria-controls')).toBe('mk-mobile-drawer');
    expect(screen.queryByRole('dialog', { name: /menu/i })).toBeNull();

    fireEvent.click(menuButton);

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    const drawer = screen.getByRole('dialog', { name: /menu/i });
    const drawerNav = within(drawer).getByRole('navigation', { name: /site/i });
    expect(
      within(drawerNav)
        .getAllByRole('link')
        .map((link) => link.textContent?.replace('Current', '').trim()),
    ).toEqual(['Assessment', 'Training', 'Resources', 'For Institutions', 'Pricing']);

    // Current page: aria-current AND a visible, non-colour "Current" label.
    const resources = within(drawerNav).getByRole('link', { name: /Resources/i });
    expect(resources.getAttribute('aria-current')).toBe('page');
    expect(within(drawer).getByText(/^Current$/)).toBeTruthy();

    // The readiness CTA is the dominant action in the drawer.
    expect(within(drawer).getByRole('link', { name: /Get readiness score/i })).toBeTruthy();
  });

  it('closes the drawer on Escape and when a route is selected', () => {
    render(<SiteHeader activePath="/resources" />);
    const menuButton = screen.getByRole('button', { name: /open menu/i });

    fireEvent.click(menuButton);
    expect(screen.getByRole('dialog', { name: /menu/i })).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /menu/i })).toBeNull();

    fireEvent.click(menuButton);
    const drawer = screen.getByRole('dialog', { name: /menu/i });
    fireEvent.click(within(drawer).getByRole('link', { name: /Assessment/i }));
    expect(screen.queryByRole('dialog', { name: /menu/i })).toBeNull();
  });
});
