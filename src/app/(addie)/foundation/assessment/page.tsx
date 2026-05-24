// /foundation/assessment — list of the viewer's saved In-Depth Readiness
// Briefings. Empty state points at the runner on main (/assessment/in-depth).

import Link from 'next/link';
import { loadOwnAssessmentResults } from '@/lib/addie/assessment/loadForViewer';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { EmptyAssessmentState } from '@/components/addie/assessment/EmptyAssessmentState';

export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default async function FoundationAssessmentIndexPage() {
  const { results } = await loadOwnAssessmentResults();

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <header className="border-b border-[var(--ledger-rule)] pb-6 mb-8">
        <KickerLabel tone="muted">In-Depth Readiness Assessment</KickerLabel>
        <h1 className="mt-2 font-serif text-3xl text-[var(--ledger-ink)] sm:text-4xl">
          Your saved briefings
        </h1>
        <p className="mt-3 text-[var(--ledger-ink-2)]">
          Every In-Depth Readiness Briefing you have completed is listed
          here, newest first.
        </p>
      </header>

      {results.length === 0 ? (
        <EmptyAssessmentState />
      ) : (
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={`/foundation/assessment/${r.id}`}
                className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ledger-ink)]"
              >
                <LedgerCard variant="standard" className="p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="space-y-1">
                      <KickerLabel tone="accent">Readiness Briefing</KickerLabel>
                      <p className="font-serif text-lg text-[var(--ledger-ink)]">
                        Dated {formatDate(r.created_at)}
                      </p>
                    </div>
                    <span
                      className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums"
                      aria-label={`Total score ${r.total_score}`}
                    >
                      Total {r.total_score}
                    </span>
                  </div>
                </LedgerCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
