// ToolboxDrawer — state-matrix smoke test. Proves the drawer renders the
// expected variant for each (items.length, quota) combination per PRD §3.6.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { ToolboxDrawer } from './ToolboxDrawer';

interface Quota {
  count: number;
  cap: number;
  isPaid: boolean;
  hasIdentity: boolean;
}

function mockFetch(items: Array<{ id: string; type: string; title: string }>, quota: Quota) {
  global.fetch = vi.fn((url: string) => {
    if (url.includes('/state')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(quota) } as Response);
    }
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          items: items.map((i) => ({
            ...i,
            lesson_id: null,
            track: null,
            created_at: '2026-05-23T00:00:00Z',
            updated_at: '2026-05-23T00:00:00Z',
          })),
        }),
    } as Response);
  }) as typeof fetch;
}

async function findVariant(): Promise<string> {
  const el = await waitFor(() => {
    const node = screen.getByTestId('toolbox-variant');
    if (node.getAttribute('data-variant') === 'loading') throw new Error('still loading');
    return node;
  });
  return el.getAttribute('data-variant') ?? '';
}

beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(() => {
  cleanup();
});

describe('ToolboxDrawer state matrix', () => {
  it('empty: signed in, zero saves', async () => {
    mockFetch([], { count: 0, cap: 4, isPaid: false, hasIdentity: true });
    render(<ToolboxDrawer open onClose={() => {}} />);
    expect(await findVariant()).toBe('empty');
    expect(screen.getByText(/Nothing saved yet/i)).toBeTruthy();
  });

  it('with-items: 2 of 4 used', async () => {
    mockFetch(
      [
        { id: 'a', type: 'skill', title: 'One' },
        { id: 'b', type: 'skill', title: 'Two' },
      ],
      { count: 2, cap: 4, isPaid: false, hasIdentity: true },
    );
    render(<ToolboxDrawer open onClose={() => {}} />);
    expect(await findVariant()).toBe('with-items');
    expect(screen.queryByTestId('toolbox-banner')).toBeNull();
  });

  it('approaching-cap: 3 of 4 used surfaces a warning banner', async () => {
    mockFetch(
      [
        { id: 'a', type: 'skill', title: 'One' },
        { id: 'b', type: 'skill', title: 'Two' },
        { id: 'c', type: 'skill', title: 'Three' },
      ],
      { count: 3, cap: 4, isPaid: false, hasIdentity: true },
    );
    render(<ToolboxDrawer open onClose={() => {}} />);
    expect(await findVariant()).toBe('approaching-cap');
    const banner = screen.getByTestId('toolbox-banner');
    expect(banner.getAttribute('data-tone')).toBe('warning');
    expect(screen.getByText(/3 of 4 free saves used/i)).toBeTruthy();
  });

  it('cap-reached: 4 of 4 surfaces gate-fork upsell with three doors', async () => {
    mockFetch(
      Array.from({ length: 4 }, (_, i) => ({ id: `id${i}`, type: 'skill', title: `T${i}` })),
      { count: 4, cap: 4, isPaid: false, hasIdentity: true },
    );
    render(<ToolboxDrawer open onClose={() => {}} />);
    expect(await findVariant()).toBe('cap-reached');
    const banner = screen.getByTestId('toolbox-banner');
    expect(banner.getAttribute('data-tone')).toBe('cap');
    expect(screen.getByText(/Pay \$295/i)).toBeTruthy();
    expect(screen.getByText(/Email to keep more/i)).toBeTruthy();
    expect(screen.getByText(/Take the \$99 assessment/i)).toBeTruthy();
  });

  it('paid-unlimited: shows unlimited badge and no upsell', async () => {
    mockFetch(
      [{ id: 'a', type: 'skill', title: 'One' }],
      { count: 0, cap: 4, isPaid: true, hasIdentity: true },
    );
    render(<ToolboxDrawer open onClose={() => {}} />);
    expect(await findVariant()).toBe('paid-unlimited');
    expect(screen.getByTestId('toolbox-quota').textContent).toContain('unlimited');
    expect(screen.queryByTestId('toolbox-banner')).toBeNull();
  });
});
