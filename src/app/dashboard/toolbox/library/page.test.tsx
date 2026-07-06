import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPaidToolboxAccess: vi.fn(),
  listLibrarySkills: vi.fn(),
}));

vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: mocks.getPaidToolboxAccess,
}));

vi.mock('@/lib/toolbox/library', () => ({
  listLibrarySkills: mocks.listLibrarySkills,
}));

vi.mock('../_components/Paywall', () => ({
  Paywall: () => <div data-testid="paywall" />,
}));

describe('Toolbox LibraryPage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.getPaidToolboxAccess.mockResolvedValue({ userId: 'user-1' });
  });

  it('falls back to the built-in prompt library when the database is unreachable', async () => {
    mocks.listLibrarySkills.mockRejectedValue(new Error('Supabase is not configured'));
    const LibraryPage = (await import('./page')).default;

    render(await LibraryPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByTestId('library-fallback-notice').textContent).toMatch(
      /built-in prompt library/i,
    );
    // Real curriculum prompts render, expandable to the full prompt text.
    expect(screen.getAllByText(/show prompt/i).length).toBeGreaterThanOrEqual(10);
    // No crash, no error-boundary copy.
    expect(screen.queryByText(/unexpected error/i)).toBeNull();
  });

  it('renders the synced library normally when the database responds', async () => {
    mocks.listLibrarySkills.mockResolvedValue([
      {
        id: 'skill-1',
        slug: 'loan-file-check',
        kind: 'workflow',
        title: 'Loan File Completeness Check',
        description: 'Check a loan file against the 22-item list.',
        pillar: 'application',
        category: 'Lending',
        complexity: 'intermediate',
        current_version: 1,
      },
    ]);
    const LibraryPage = (await import('./page')).default;

    render(await LibraryPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText('Loan File Completeness Check')).toBeTruthy();
    expect(screen.queryByTestId('library-fallback-notice')).toBeNull();
  });
});
