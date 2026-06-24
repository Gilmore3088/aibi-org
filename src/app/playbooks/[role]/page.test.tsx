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

  it('downloads the role PDF directly without an email gate', async () => {
    render(await PlaybookPage({ params: Promise.resolve({ role: 'compliance' }) }));

    const pdfLink = screen.getByRole('link', { name: /download compliance officer pdf/i });
    expect(pdfLink.getAttribute('href')).toBe('/api/resources/compliance-playbook/download');
    expect(screen.queryByText(/Where should we send your playbook/i)).toBeNull();
  });
});
