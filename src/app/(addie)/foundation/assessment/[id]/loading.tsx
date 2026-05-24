// Loading skeleton for the Readiness Briefing reader. No shimmer (design rule);
// just hairline rules and parchment placeholders.

import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-10">
      <header className="border-b border-[var(--ledger-rule)] pb-6">
        <KickerLabel tone="accent">In-Depth Readiness Assessment</KickerLabel>
        <div className="mt-2 h-9 w-2/3 rounded-[2px] bg-[var(--ledger-parch)]" />
        <div className="mt-3 h-3 w-40 rounded-[2px] bg-[var(--ledger-parch)]" />
      </header>
      <section className="space-y-5" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-40 rounded-[2px] bg-[var(--ledger-parch)]" />
              <div className="h-3 w-14 rounded-[2px] bg-[var(--ledger-parch)]" />
            </div>
            <div className="h-2 w-full rounded-[2px] bg-[var(--ledger-parch)]" />
          </div>
        ))}
      </section>
      <section className="space-y-3" aria-hidden="true">
        <div className="h-7 w-1/3 rounded-[2px] bg-[var(--ledger-parch)]" />
        <div className="h-3 w-full rounded-[2px] bg-[var(--ledger-parch)]" />
        <div className="h-3 w-5/6 rounded-[2px] bg-[var(--ledger-parch)]" />
        <div className="h-3 w-4/6 rounded-[2px] bg-[var(--ledger-parch)]" />
      </section>
    </main>
  );
}
