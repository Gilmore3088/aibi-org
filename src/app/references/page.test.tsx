import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { REGULATIONS } from '@content/regulations';
import { REFERENCE_SOURCES } from '@content/references';
import { CITATIONS } from '@content/citations';
import ReferencesPage from './page';

describe('ReferencesPage', () => {
  it('lists every regulatory framework with a working source link and anchor', () => {
    render(<ReferencesPage />);

    for (const reg of REGULATIONS) {
      const anchor = document.getElementById(reg.slug);
      expect(anchor, `missing anchor #${reg.slug}`).toBeTruthy();
      expect(anchor!.textContent).toContain(reg.short);
      // Curriculum-alignment frameworks must each link to their original source.
      const link = within(anchor as HTMLElement).getByRole('link', { name: /View source/i });
      expect(link.getAttribute('href')).toBe(reg.url);
    }
  });

  it('renders every additional standard/report source', () => {
    render(<ReferencesPage />);

    for (const src of REFERENCE_SOURCES) {
      const anchor = document.getElementById(src.slug);
      expect(anchor, `missing anchor #${src.slug}`).toBeTruthy();
      expect(anchor!.textContent).toContain(src.short);
    }
  });

  it('shows every cited statistic, with a source link where the publisher is public', () => {
    render(<ReferencesPage />);

    for (const c of CITATIONS) {
      const anchor = document.getElementById(`stat-${c.slug}`);
      expect(anchor, `missing anchor #stat-${c.slug}`).toBeTruthy();
      expect(anchor!.textContent).toContain(c.value);
      if (c.url) {
        const link = within(anchor as HTMLElement).getByRole('link', { name: /View source/i });
        expect(link.getAttribute('href')).toBe(c.url);
      }
    }
  });

  it('frames the page as public references, not a compliance opinion', () => {
    render(<ReferencesPage />);
    expect(
      screen.getByText(/does not provide legal, regulatory, or compliance/i),
    ).toBeTruthy();
  });
});
