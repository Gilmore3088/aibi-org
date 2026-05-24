// /admin/leads — paginated lead table. Email + fi_name + gate decision
// + opt-in + last activity + created_at. CSV download in the header.
// Privacy: shows lead identifiers, never artifact bodies or transcripts.

import Link from 'next/link';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { loadLeadsPage } from '@/lib/addie/analytics/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATE_FMT = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const FORK_LABEL: Record<string, string> = {
  paid: 'Paid',
  email: 'Email',
  decline: 'Declined',
};

interface PageProps {
  readonly searchParams?: Promise<{ page?: string }>;
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const data = await loadLeadsPage(page, 25);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end gap-4 justify-between">
        <div>
          <KickerLabel>Leads</KickerLabel>
          <h1 className="font-serif text-4xl mt-1 leading-tight">Recent captures</h1>
          <p className="text-sm text-[var(--ledger-muted)] mt-2 max-w-2xl">
            Email-captured visitors and their most recent gate decision. Use the
            CSV export for outreach. Pagination is 25 per page.
          </p>
        </div>
        <Link
          href={`/admin/leads/export.csv?page=${page}`}
          prefetch={false}
          className="font-mono text-[0.7rem] uppercase tracking-[0.18em] border border-[var(--ledger-ink)] px-4 py-2 hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-bg)]"
        >
          Download CSV
        </Link>
      </header>

      {data.error ? (
        <LedgerCard variant="tape" className="p-5">
          <KickerLabel tone="accent">Table error</KickerLabel>
          <p className="text-sm text-[var(--ledger-ink-2)] mt-2">
            Could not load leads. {data.error}
          </p>
        </LedgerCard>
      ) : data.rows.length === 0 ? (
        <LedgerCard variant="standard" className="p-6">
          <p className="text-sm text-[var(--ledger-muted)] py-6 text-center">
            No leads captured yet.
          </p>
        </LedgerCard>
      ) : (
        <>
          <LedgerCard variant="standard" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Recent leads</caption>
                <thead className="border-b border-[var(--ledger-rule-strong)] bg-[var(--ledger-parch)]">
                  <tr>
                    <Th>Email</Th>
                    <Th>Institution</Th>
                    <Th>Gate</Th>
                    <Th>Opt-in</Th>
                    <Th>Last activity</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--ledger-rule)] hover:bg-[var(--ledger-parch)]"
                    >
                      <Td className="font-mono text-[0.8rem]">{row.email}</Td>
                      <Td>{row.fi_name ?? <span className="text-[var(--ledger-muted)]">—</span>}</Td>
                      <Td>
                        {row.gate_decision ? (
                          <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em]">
                            {FORK_LABEL[row.gate_decision]}
                          </span>
                        ) : (
                          <span className="text-[var(--ledger-muted)]">—</span>
                        )}
                      </Td>
                      <Td>
                        <span
                          className={
                            row.marketing_opt_in
                              ? 'text-[var(--ledger-ink)]'
                              : 'text-[var(--ledger-muted)]'
                          }
                        >
                          {row.marketing_opt_in ? 'Yes' : 'No'}
                        </span>
                      </Td>
                      <Td className="font-mono text-[0.75rem] tabular-nums text-[var(--ledger-ink-2)]">
                        {DATE_FMT(row.last_activity_at)}
                      </Td>
                      <Td className="font-mono text-[0.75rem] tabular-nums text-[var(--ledger-ink-2)]">
                        {DATE_FMT(row.created_at)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LedgerCard>

          <nav
            className="flex items-center justify-between text-sm"
            aria-label="Lead table pagination"
          >
            <span className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums">
              Page {data.page} of {totalPages} · {data.total.toLocaleString()} leads
            </span>
            <div className="flex gap-3">
              {page > 1 ? (
                <Link
                  href={`/admin/leads?page=${page - 1}`}
                  className="border border-[var(--ledger-rule-strong)] px-3 py-1 hover:border-[var(--ledger-ink)]"
                >
                  Previous
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link
                  href={`/admin/leads?page=${page + 1}`}
                  className="border border-[var(--ledger-rule-strong)] px-3 py-1 hover:border-[var(--ledger-ink)]"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="text-left font-mono font-semibold text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)] px-4 py-3"
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-baseline ${className}`}>{children}</td>;
}
