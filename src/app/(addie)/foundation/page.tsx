// /foundation — course home. Lists modules from addie.modules and links
// into the lesson player. Anonymous viewers see "start free"; signed-in
// learners see their progress and a continue CTA.

import Link from 'next/link';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import type { ModuleRow } from '@/components/addie/lesson/types';

export const dynamic = 'force-dynamic';

interface ModuleWithLessonCount extends ModuleRow {
  readonly lesson_count: number;
}

async function loadModules(): Promise<ModuleWithLessonCount[]> {
  try {
    const svc = getAddieServiceClient();
    const { data, error } = await svc
      .from('modules')
      .select('id, ordinal, title, tier, summary, published')
      .eq('published', true)
      .order('ordinal', { ascending: true });
    if (error || !data) return [];
    // Bulk-count lessons per module.
    const counts: Record<string, number> = {};
    for (const m of data) {
      const { count } = await svc
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('module_id', m.id)
        .eq('published', true);
      counts[m.id as string] = count ?? 0;
    }
    return data.map((m) => ({
      id: m.id as string,
      ordinal: m.ordinal as number,
      title: m.title as string,
      tier: m.tier as 'free' | 'paid',
      summary: (m.summary as string | null) ?? null,
      lesson_count: counts[m.id as string] ?? 0,
    }));
  } catch (err) {
    console.warn('[foundation/page] modules load failed:', err);
    return [];
  }
}

export default async function FoundationHomePage() {
  const modules = await loadModules();

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <header className="border-b border-[var(--ledger-rule)] pb-6 mb-8">
        <KickerLabel tone="muted">Foundation Course</KickerLabel>
        <h1 className="mt-2 font-serif text-4xl text-[var(--ledger-ink)]">
          From &ldquo;I&apos;ve heard of generative AI&rdquo; to &ldquo;I built something useful this week.&rdquo;
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--ledger-ink-2)]">
          Six modules. ~22 lessons. Every lesson under 15 minutes. The first four modules are free;
          M4 and M5 are paid. You can start anonymously.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={modules[0] ? `/foundation/${modules[0].id}` : '#'}>
            <LedgerButton variant="primary">Start Module 0</LedgerButton>
          </Link>
          <Link href="/foundation/dashboard">
            <LedgerButton variant="secondary">Go to dashboard</LedgerButton>
          </Link>
        </div>
      </header>

      {modules.length === 0 ? (
        <p className="text-[var(--ledger-muted)]">
          No published modules yet. Wave 2b will seed M0–M3 against the addie.modules /
          addie.lessons tables.
        </p>
      ) : (
        <ol className="grid gap-4 md:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id}>
              <Link href={`/foundation/${m.id}`} className="block h-full">
                <LedgerCard className="p-5 h-full">
                  <div className="flex items-baseline justify-between gap-3">
                    <KickerLabel tone="muted">Module {m.ordinal}</KickerLabel>
                    <KickerLabel tone={m.tier === 'paid' ? 'accent' : 'muted'}>
                      {m.tier === 'paid' ? 'Paid' : 'Free'}
                    </KickerLabel>
                  </div>
                  <h2 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)]">{m.title}</h2>
                  {m.summary ? (
                    <p className="mt-2 text-sm text-[var(--ledger-ink-2)]">{m.summary}</p>
                  ) : null}
                  <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
                    {m.lesson_count} lessons
                  </p>
                </LedgerCard>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
