import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResourcesExperience } from './ResourcesExperience';

describe('ResourcesExperience', () => {
  it('surfaces security and governance review paths from the resources hub', () => {
    render(<ResourcesExperience />);

    expect(screen.getByRole('heading', { name: /need the review path before you download/i })).toBeTruthy();
    expect(screen.getByText(/If IT, risk, or compliance needs the boundary first/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Open security page/i }).getAttribute('href')).toBe('/security');
    expect(screen.getByRole('link', { name: /Review data path/i }).getAttribute('href')).toBe(
      '/security/data-handling',
    );
    expect(screen.getByRole('link', { name: /Forward packet/i }).getAttribute('href')).toBe(
      '/security/it-approval',
    );
  });

  it('surfaces previously orphaned GTM and platform reference resources', () => {
    render(<ResourcesExperience />);

    expect(
      screen.getByRole('heading', { name: /Go-to-Market Plan for an AI Initiative/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Get Word for Go-to-Market Plan for an AI Initiative/i }),
    ).toBeTruthy();

    expect(
      screen.getByRole('button', { name: /Get PDF for Platform Feature Reference Card/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /Browse prompt cards/i }).getAttribute('href'),
    ).toBe('/prompt-cards');
  });

  it('surfaces the compliance policy template with a Word download', () => {
    render(<ResourcesExperience />);

    const policyHeading = screen.getByRole('heading', { name: "The Banker's AI Use Policy Starter" });
    const policyCard = policyHeading.closest('article');

    expect(policyCard).toBeTruthy();
    expect(
      within(policyCard as HTMLElement).getByText(/editable clause language/i),
    ).toBeTruthy();
    expect(within(policyCard as HTMLElement).getByRole('link', { name: 'Open' }).getAttribute('href')).toBe(
      '/resources/templates/ai-use-policy-starter',
    );
    expect(
      within(policyCard as HTMLElement)
        .getByRole('button', { name: /Get Word for The Banker's AI Use Policy Starter/i }),
    ).toBeTruthy();
  });

  it('surfaces a CDFI grant evidence template with a Word download', () => {
    render(<ResourcesExperience />);

    const cdfiHeading = screen.getByRole('heading', { name: 'The CDFI AI Evidence File Checklist' });
    const cdfiCard = cdfiHeading.closest('article');

    expect(cdfiCard).toBeTruthy();
    expect(
      within(cdfiCard as HTMLElement).getByText(
        /fillable ledger for documenting AI-assisted grant, certification, impact, and award-reporting materials/i,
      ),
    ).toBeTruthy();
    expect(within(cdfiCard as HTMLElement).getByRole('link', { name: 'Open' }).getAttribute('href')).toBe(
      '/resources/templates/cdfi-grant-ai-evidence-checklist',
    );
    expect(
      within(cdfiCard as HTMLElement)
        .getByRole('button', { name: /Get Word for The CDFI AI Evidence File Checklist/i }),
    ).toBeTruthy();
  });

  it('surfaces a BSA-specific template when the BSA/AML role filter is selected', () => {
    render(<ResourcesExperience />);

    fireEvent.click(screen.getAllByRole('button', { name: 'BSA/AML' })[0]);

    const sarHeading = screen.getByRole('heading', { name: 'The BSA/AML SAR Narrative Scaffold' });
    const sarCard = sarHeading.closest('article');

    expect(sarCard).toBeTruthy();
    expect(
      within(sarCard as HTMLElement).getByText(/who, what, when, where, why, how/i),
    ).toBeTruthy();
    expect(within(sarCard as HTMLElement).getByRole('link', { name: 'Open' }).getAttribute('href')).toBe(
      '/playbooks/bsa-aml/sar-narrative-template',
    );
    expect(
      within(sarCard as HTMLElement)
        .getByRole('button', { name: /Get Word for The BSA\/AML SAR Narrative Scaffold/i }),
    ).toBeTruthy();
  });
});
