import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PlaybookPage from './page';

describe('/playbooks/[role]', () => {
  it('shows only live assets and removes coming-soon traps', async () => {
    render(await PlaybookPage({ params: Promise.resolve({ role: 'compliance' }) }));

    fireEvent.click(screen.getByRole('tab', { name: 'Assets' }));

    expect(screen.queryByText(/Coming soon/i)).toBeNull();
    expect(screen.queryByText(/Model Output Risk Labels/i)).toBeNull();
    expect(screen.getAllByText(/Open template/i).length).toBeGreaterThan(0);
  });

  it('exposes the role PDF through the resource download gate', async () => {
    render(await PlaybookPage({ params: Promise.resolve({ role: 'compliance' }) }));

    expect(
      screen.getByRole('button', { name: /Get PDF for Compliance Officer Playbook/i }),
    ).toBeTruthy();
  });

  it('links the BSA/AML SAR narrative scaffold from the assets tab', async () => {
    render(await PlaybookPage({ params: Promise.resolve({ role: 'bsa-aml' }) }));

    fireEvent.click(screen.getByRole('tab', { name: 'Assets' }));

    expect(
      screen
        .getByRole('link', { name: /The BSA\/AML SAR Narrative Scaffold/i })
        .getAttribute('href'),
    ).toBe('/playbooks/bsa-aml/sar-narrative-template');
  });
});
