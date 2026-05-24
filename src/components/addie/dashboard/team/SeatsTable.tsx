'use client';

// SeatsTable — one row per seat with status, aggregate counts, last activity,
// and per-row actions. Counts only (FR-D4).

import { useMemo, useState } from 'react';
import type { SeatProgressRow, SeatStatus } from '@/lib/addie/team/dashboard';
import { SeatStatusPill } from './SeatStatusPill';
import { RevokeSeatButton } from './RevokeSeatButton';
import { ResendInviteButton } from './ResendInviteButton';

interface SeatsTableProps {
  readonly seats: ReadonlyArray<SeatProgressRow>;
}

type SortKey = 'email' | 'status' | 'lessons' | 'activity';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<SeatStatus, number> = {
  assigned: 0,
  invited: 1,
  revoked: 2,
};

function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '—';
  const diffMs = Date.now() - then;
  if (diffMs < 0) return 'just now';
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function SeatsTable({ seats }: SeatsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(() => {
    const dirMul = sortDir === 'asc' ? 1 : -1;
    const rows = [...seats];
    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'email':
          cmp = a.invited_email.localeCompare(b.invited_email);
          break;
        case 'status':
          cmp = STATUS_ORDER[a.seat_status] - STATUS_ORDER[b.seat_status];
          if (cmp === 0) cmp = a.invited_email.localeCompare(b.invited_email);
          break;
        case 'lessons':
          cmp = a.lessons_completed - b.lessons_completed;
          break;
        case 'activity': {
          const at = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
          const bt = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
          cmp = at - bt;
          break;
        }
      }
      return cmp * dirMul;
    });
    return rows;
  }, [seats, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  if (seats.length === 0) {
    return (
      <p className="text-sm text-[var(--ledger-muted)] py-8 text-center border border-dashed border-[var(--ledger-rule)] rounded-[3px]">
        No seats yet. Invite team members below to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--ledger-rule-strong)]">
            <Th onClick={() => toggleSort('email')} active={sortKey === 'email'} dir={sortDir}>
              INVITEE
            </Th>
            <Th onClick={() => toggleSort('status')} active={sortKey === 'status'} dir={sortDir}>
              STATUS
            </Th>
            <Th
              onClick={() => toggleSort('lessons')}
              active={sortKey === 'lessons'}
              dir={sortDir}
              align="right"
            >
              LESSONS
            </Th>
            <ThStatic align="right">SANDBOX</ThStatic>
            <ThStatic align="right">SAVED</ThStatic>
            <Th
              onClick={() => toggleSort('activity')}
              active={sortKey === 'activity'}
              dir={sortDir}
            >
              LAST ACTIVE
            </Th>
            <ThStatic align="right">ACTIONS</ThStatic>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const isRevoked = row.seat_status === 'revoked';
            return (
              <tr
                key={row.seat_id}
                data-seat-id={row.seat_id}
                data-status={row.seat_status}
                className="border-b border-[var(--ledger-rule)] last:border-b-0"
              >
                <td
                  className={
                    'py-3 pr-4 break-all ' +
                    (isRevoked ? 'text-[var(--ledger-muted)]' : 'text-[var(--ledger-ink)]')
                  }
                >
                  {row.invited_email}
                </td>
                <td className="py-3 pr-4">
                  <SeatStatusPill status={row.seat_status} />
                </td>
                <td className="py-3 pr-4 text-right font-mono tabular-nums text-[var(--ledger-ink-2)]">
                  {row.lessons_completed}
                </td>
                <td className="py-3 pr-4 text-right font-mono tabular-nums text-[var(--ledger-ink-2)]">
                  {row.sandbox_runs}
                </td>
                <td className="py-3 pr-4 text-right font-mono tabular-nums text-[var(--ledger-ink-2)]">
                  {row.artifacts_saved}
                </td>
                <td className="py-3 pr-4 text-[var(--ledger-muted)] font-mono text-xs">
                  {formatRelative(row.last_activity_at)}
                </td>
                <td className="py-3 text-right">
                  {row.seat_status === 'invited' ? (
                    <ResendInviteButton
                      seatId={row.seat_id}
                      inviteeEmail={row.invited_email}
                    />
                  ) : row.seat_status === 'assigned' ? (
                    <RevokeSeatButton
                      seatId={row.seat_id}
                      inviteeEmail={row.invited_email}
                    />
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface ThProps {
  readonly children: React.ReactNode;
  readonly onClick: () => void;
  readonly active: boolean;
  readonly dir: SortDir;
  readonly align?: 'left' | 'right';
}

function Th({ children, onClick, active, dir, align = 'left' }: ThProps) {
  return (
    <th
      scope="col"
      className={
        'py-2 pr-4 font-mono font-semibold text-[0.65rem] uppercase tracking-[0.18em] ' +
        'text-[var(--ledger-muted)] ' +
        (align === 'right' ? 'text-right' : 'text-left')
      }
    >
      <button
        type="button"
        onClick={onClick}
        aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={
          'inline-flex items-center gap-1 hover:text-[var(--ledger-ink)] ' +
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
          'focus-visible:outline-[var(--ledger-ink)] ' +
          (active ? 'text-[var(--ledger-ink)]' : '')
        }
      >
        {children}
        {active ? <span aria-hidden>{dir === 'asc' ? '↑' : '↓'}</span> : null}
      </button>
    </th>
  );
}

interface ThStaticProps {
  readonly children: React.ReactNode;
  readonly align?: 'left' | 'right';
}

function ThStatic({ children, align = 'left' }: ThStaticProps) {
  return (
    <th
      scope="col"
      className={
        'py-2 pr-4 font-mono font-semibold text-[0.65rem] uppercase tracking-[0.18em] ' +
        'text-[var(--ledger-muted)] ' +
        (align === 'right' ? 'text-right' : 'text-left')
      }
    >
      {children}
    </th>
  );
}
