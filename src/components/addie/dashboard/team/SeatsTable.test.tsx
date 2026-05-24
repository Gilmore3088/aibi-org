// SeatsTable — sort by status, pill rendering, action visibility per status.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SeatsTable } from './SeatsTable';
import type { SeatProgressRow } from '@/lib/addie/team/dashboard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

const fixture: SeatProgressRow[] = [
  {
    seat_id: 's-revoked',
    invited_email: 'revoked@bank.co',
    seat_status: 'revoked',
    user_id: null,
    track: null,
    lessons_completed: 0,
    sandbox_runs: 0,
    artifacts_saved: 0,
    artifacts_reused: 0,
    last_activity_at: null,
  },
  {
    seat_id: 's-invited',
    invited_email: 'invited@bank.co',
    seat_status: 'invited',
    user_id: null,
    track: null,
    lessons_completed: 0,
    sandbox_runs: 0,
    artifacts_saved: 0,
    artifacts_reused: 0,
    last_activity_at: null,
  },
  {
    seat_id: 's-assigned',
    invited_email: 'assigned@bank.co',
    seat_status: 'assigned',
    user_id: 'u-1',
    track: 'risk',
    lessons_completed: 3,
    sandbox_runs: 6,
    artifacts_saved: 2,
    artifacts_reused: 1,
    last_activity_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

describe('SeatsTable', () => {
  it('renders empty state when no seats', () => {
    render(<SeatsTable seats={[]} />);
    expect(screen.getByText(/no seats yet/i)).toBeTruthy();
  });

  it('sorts assigned → invited → revoked by default', () => {
    render(<SeatsTable seats={fixture} />);
    const rows = screen.getAllByRole('row').slice(1); // skip header row
    expect(rows[0].getAttribute('data-status')).toBe('assigned');
    expect(rows[1].getAttribute('data-status')).toBe('invited');
    expect(rows[2].getAttribute('data-status')).toBe('revoked');
  });

  it('renders RESEND action only for invited seats', () => {
    render(<SeatsTable seats={fixture} />);
    const invitedRow = document.querySelector(
      'tr[data-seat-id="s-invited"]',
    ) as HTMLElement;
    expect(within(invitedRow).getByRole('button', { name: /resend/i })).toBeTruthy();
  });

  it('renders REVOKE action only for assigned seats', () => {
    render(<SeatsTable seats={fixture} />);
    const assignedRow = document.querySelector(
      'tr[data-seat-id="s-assigned"]',
    ) as HTMLElement;
    expect(within(assignedRow).getByRole('button', { name: /revoke/i })).toBeTruthy();
  });

  it('hides action buttons for revoked seats', () => {
    render(<SeatsTable seats={fixture} />);
    const revokedRow = document.querySelector(
      'tr[data-seat-id="s-revoked"]',
    ) as HTMLElement;
    expect(within(revokedRow).queryByRole('button', { name: /resend/i })).toBeNull();
    expect(within(revokedRow).queryByRole('button', { name: /revoke/i })).toBeNull();
  });

  it('renders status pills with correct status data-attribute', () => {
    render(<SeatsTable seats={fixture} />);
    expect(document.querySelector('[data-status="invited"].inline-flex')).toBeTruthy();
    expect(document.querySelector('[data-status="assigned"].inline-flex')).toBeTruthy();
    expect(document.querySelector('[data-status="revoked"].inline-flex')).toBeTruthy();
  });
});
