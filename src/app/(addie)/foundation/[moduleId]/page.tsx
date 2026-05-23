// /foundation/[moduleId] — module index. Lists lessons + tier badge.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export const dynamic = 'force-dynamic';

interface ModuleData {
  id: string;
  ordinal: number;
  title: string;
  summary: string | null;
  tier: 'free' | 'paid';
}

interface LessonData {
  id: string;
  ordinal: number;
  title: string;
  modality: string;
  duration_min: number;
}

async function loadModule(moduleId: string): Promise<{
  module: ModuleData;
  lessons: LessonData[];
} | null> {
  try {
    const svc = getAddieServiceClient();
    const { data: m, error } = await svc
      .from('modules')
      .select('id, ordinal, title, summary, tier, published')
      .eq('id', moduleId)
      .eq('published', true)
      .maybeSingle();
    if (error || !m) return null;
    const { data: ls } = await svc
      .from('lessons')
      .select('id, ordinal, title, modality, duration_min, published')
      .eq('module_id', moduleId)
      .eq('published', true)
      .order('ordinal', { ascending: true });
    return {
      module: {
        id: m.id as string,
        ordinal: m.ordinal as number,
        title: m.title as string,
        summary: (m.summary as string | null) ?? null,
        tier: m.tier as 'free' | 'paid',
      },
      lessons: (ls ?? []).map((l) => ({
        id: l.id as string,
        ordinal: l.ordinal as number,
        title: l.title as string,
        modality: l.modality as string,
        duration_min: l.duration_min as number,
      })),
    };
  } catch (err) {
    console.warn('[foundation/[moduleId]] load failed:', err);
    return null;
  }
}

export default async function ModuleIndexPage({
  params,
}: {
  params: { moduleId: string };
}) {
  const data = await loadModule(params.moduleId);
  if (!data) {
    notFound();
  }
  const { module: m, lessons } = data;

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <nav aria-label="Breadcrumb" className="mb-3">
        <Link
          href="/foundation"
          className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
        >
          ← Foundation
        </Link>
      </nav>
      <header className="border-b border-[var(--ledger-rule)] pb-5 mb-6">
        <KickerLabel tone="muted">Module {m.ordinal}</KickerLabel>
        <h1 className="mt-2 font-serif text-3xl text-[var(--ledger-ink)]">{m.title}</h1>
        {m.summary ? (
          <p className="mt-2 text-[var(--ledger-ink-2)]">{m.summary}</p>
        ) : null}
      </header>
      {lessons.length === 0 ? (
        <p className="text-[var(--ledger-muted)]">
          No lessons published in this module yet. Wave 2b seeds these.
        </p>
      ) : (
        <ol className="grid gap-3">
          {lessons.map((l) => (
            <li key={l.id}>
              <Link href={`/foundation/${m.id}/${l.id}`} className="block">
                <LedgerCard className="p-4 flex items-baseline justify-between gap-3">
                  <div>
                    <KickerLabel tone="muted">{l.modality}</KickerLabel>
                    <h2 className="mt-1 font-serif text-xl text-[var(--ledger-ink)]">
                      {l.title}
                    </h2>
                  </div>
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
                    {l.duration_min} min
                  </span>
                </LedgerCard>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
