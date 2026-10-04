import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SkillAccess } from '@/lib/skills/access';

let access: SkillAccess = { paid: false, roles: [] };

vi.mock('@/lib/skills/access', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/skills/access')>();
  return { ...actual, getSkillAccess: async () => access };
});

const { default: PlaybookPage } = await import('./page');

describe('/playbooks/[role]', () => {
  beforeEach(() => {
    access = { paid: false, roles: [] };
  });

  it('teaches, tests, and offers the skill bundle', async () => {
    render(await PlaybookPage({ params: Promise.resolve({ role: 'retail' }) }));

    expect(screen.getByTestId('data-light-test')).toBeTruthy();
    expect(screen.getByTestId('skill-library')).toBeTruthy();
    expect(screen.getByText(/Check a prompt for/i)).toBeTruthy();
  });

  it('opens one sample skill and locks the rest for anonymous visitors', async () => {
    render(await PlaybookPage({ params: Promise.resolve({ role: 'retail' }) }));
    const library = screen.getByTestId('skill-library');

    expect(within(library).getByRole('button', { name: /Copy the filled-in prompt/i })).toBeTruthy();
    expect(within(library).getAllByText('Locked').length).toBeGreaterThan(10);
    expect(screen.getAllByRole('link', { name: /free assessment/i }).length).toBeGreaterThan(0);
  });

  it('unlocks the whole playbook for its role and offers the bundle', async () => {
    access = { paid: false, roles: ['retail'] };
    render(await PlaybookPage({ params: Promise.resolve({ role: 'retail' }) }));

    expect(screen.queryAllByText('Locked')).toHaveLength(0);
    expect(screen.getByRole('link', { name: /Download all \d+ for Claude/i }).getAttribute('href')).toBe('/api/skills/bundle/retail');
  });

  it('keeps the role PDF behind the resource download gate', async () => {
    render(await PlaybookPage({ params: Promise.resolve({ role: 'compliance' }) }));

    expect(screen.getByRole('button', { name: /Get PDF for Compliance Officer Playbook/i })).toBeTruthy();
  });

  it('lists the SAR narrative scaffold skill on the BSA/AML playbook', async () => {
    access = { paid: true, roles: [] };
    render(await PlaybookPage({ params: Promise.resolve({ role: 'bsa-aml' }) }));

    expect(screen.getAllByText('Scaffold a SAR narrative').length).toBeGreaterThan(0);
  });
});
