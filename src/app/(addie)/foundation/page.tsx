// /foundation — course home. Modern course aesthetic per DECISIONS
// 2026-05-23: Stripe Press / Maven energy — oversized display type,
// dimensional illustrated module cards, generous whitespace.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { ModuleCard } from '@/components/addie/shell/ModuleCard';
import { ModuleIllustration } from '@/components/addie/illustrations/ModuleIllustration';
import type { ModuleRow } from '@/components/addie/lesson/types';

export const dynamic = 'force-dynamic';

interface ModuleWithLessonCount extends ModuleRow {
  readonly lesson_count: number;
  readonly completed: number;
}

async function getSignedInUserId(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const store = await cookies();
    const supa = createServerClient(url, key, {
      cookies: { getAll: () => store.getAll(), setAll: () => {} },
    });
    const { data } = await supa.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function loadModules(userId: string | null): Promise<ModuleWithLessonCount[]> {
  try {
    const svc = getAddieServiceClient();
    // Try with hero_image_* columns (migration 00058). If the migration has
    // not been applied yet, Postgres returns 42703 (undefined column); fall
    // back to the original SELECT so the page still renders the SVG path.
    let { data, error } = await svc
      .from('modules')
      .select('id, ordinal, title, tier, summary, published, hero_image_url, hero_image_alt, hero_image_credit')
      .eq('published', true)
      .order('ordinal', { ascending: true });
    if (error) {
      const fallback = await svc
        .from('modules')
        .select('id, ordinal, title, tier, summary, published')
        .eq('published', true)
        .order('ordinal', { ascending: true });
      // Cast: fallback rows omit the hero_image_* columns; downstream code
      // already coalesces them to null via the ((m as {...}).x) ?? null path.
      data = fallback.data as typeof data;
      error = fallback.error;
    }
    if (error || !data) return [];

    const counts: Record<string, number> = {};
    const completed: Record<string, number> = {};
    for (const m of data) {
      const moduleId = m.id as string;
      const { count } = await svc
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('module_id', moduleId)
        .eq('published', true);
      counts[moduleId] = count ?? 0;
      completed[moduleId] = 0;
    }
    if (userId) {
      try {
        const { data: doneRows } = await svc
          .from('events')
          .select('event_data')
          .eq('user_id', userId)
          .eq('event_type', 'lesson_complete');
        for (const r of doneRows ?? []) {
          const lid = (r.event_data as { lesson_id?: string } | null)?.lesson_id;
          if (!lid) continue;
          const moduleId = lid.split('.')[0];
          if (moduleId in completed) completed[moduleId] += 1;
        }
      } catch {
        /* ignore */
      }
    }
    return data.map((m) => ({
      id: m.id as string,
      ordinal: m.ordinal as number,
      title: m.title as string,
      tier: m.tier as 'free' | 'paid',
      summary: (m.summary as string | null) ?? null,
      hero_image_url: ((m as { hero_image_url?: string | null }).hero_image_url) ?? null,
      hero_image_alt: ((m as { hero_image_alt?: string | null }).hero_image_alt) ?? null,
      hero_image_credit: ((m as { hero_image_credit?: string | null }).hero_image_credit) ?? null,
      lesson_count: counts[m.id as string] ?? 0,
      completed: completed[m.id as string] ?? 0,
    }));
  } catch (err) {
    console.warn('[foundation/page] modules load failed:', err);
    return [];
  }
}

export default async function FoundationHomePage() {
  const userId = await getSignedInUserId();
  const modules = await loadModules(userId);

  const totalLessons = modules.reduce((n, m) => n + m.lesson_count, 0);
  const totalDone = modules.reduce((n, m) => n + m.completed, 0);
  const overallPct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;
  const firstHref = modules[0] ? `/foundation/${modules[0].id}/m0.1` : '#';
  const featuredModule =
    modules.find((m) => m.completed > 0 && m.completed < m.lesson_count) ?? modules[0];

  return (
    <main>
      {/* Hero — Stripe Press / Maven scale */}
      <section className="addie-hero-parch">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[5fr_4fr] items-center">
            <div className="relative z-10">
              <span className="addie-chip" data-tone="accent">
                Foundation Course · {modules.length} modules · {totalLessons} lessons
              </span>
              <h1 className="mt-5 font-serif text-[2.75rem] sm:text-[3.5rem] lg:text-[4.25rem] leading-[0.98] tracking-[-0.02em] text-[var(--ledger-ink)]">
                Generative AI,
                <br />
                <span className="text-[var(--ledger-accent)]">on the job.</span>
                <br />
                <span className="text-[var(--ledger-ink-2)] opacity-80">By Monday.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg sm:text-xl leading-[1.55] text-[var(--ledger-ink-2)]">
                A short course for community bankers and credit-union staff.
                Built around the role you actually have. Every lesson under
                fifteen minutes; every module produces something you can
                use the next morning.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={firstHref}
                  className="group inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-4 rounded-[4px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms]"
                >
                  Start Module 0
                  <span className="transition-transform duration-[200ms] group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="#path"
                  className="font-mono font-semibold uppercase tracking-[0.14em] text-xs px-5 py-4 rounded-[4px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] transition-colors duration-[160ms]"
                >
                  See the path
                </Link>
                {userId ? (
                  <span className="addie-chip" data-tone="ink">
                    {overallPct}% complete · {totalDone}/{totalLessons}
                  </span>
                ) : null}
              </div>

              {/* Three at-a-glance metrics */}
              <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { v: '6', label: 'modules' },
                  { v: '24', label: 'lessons' },
                  { v: '<15m', label: 'each' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-serif text-[2.25rem] leading-none text-[var(--ledger-ink)] tabular-nums">
                      {s.v}
                    </div>
                    <div className="mt-1 font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured module illustration card — dimensional, big */}
            {featuredModule ? (
              <Link
                href={`/foundation/${featuredModule.id}`}
                className="relative block group"
                aria-label={`Continue with ${featuredModule.title}`}
              >
                <article className="relative rounded-[4px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-6 shadow-[var(--ledger-shadow)] transition-colors duration-[120ms] group-hover:border-[var(--ledger-ink)]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="addie-chip" data-tone="accent">
                      {featuredModule.completed > 0 ? 'Continue where you left' : 'Start here'}
                    </span>
                    <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
                      Module {featuredModule.ordinal}
                    </span>
                  </div>
                  <ModuleIllustration
                    module={featuredModule.id as 'm0'}
                    variant="hero"
                    photoUrl={featuredModule.hero_image_url}
                    photoAlt={featuredModule.hero_image_alt}
                    photoCredit={featuredModule.hero_image_credit}
                  />
                  <h2 className="mt-5 font-serif text-2xl text-[var(--ledger-ink)] leading-tight">
                    {featuredModule.title}
                  </h2>
                  {featuredModule.summary ? (
                    <p className="mt-2 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
                      {featuredModule.summary}
                    </p>
                  ) : null}
                  <div className="mt-5 pt-4 border-t border-[var(--ledger-rule)] flex items-center justify-between gap-3">
                    <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
                      {featuredModule.lesson_count} lessons
                    </span>
                    <span className="font-mono uppercase tracking-[0.16em] text-[0.75rem] text-[var(--ledger-ink)] inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-[160ms]">
                      {featuredModule.completed > 0 ? 'Continue' : 'Begin'} →
                    </span>
                  </div>
                </article>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Module grid */}
      <section id="path" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid gap-4 sm:flex sm:items-end sm:justify-between mb-10">
          <div>
            <span className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
              The path
            </span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[var(--ledger-ink)] leading-tight">
              From your first prompt to your first prototype.
            </h2>
          </div>
          <p className="text-sm text-[var(--ledger-muted)] max-w-sm">
            Six modules. The first four are free; the last two open the
            skills + build work and your unlimited Toolbox.
          </p>
        </div>

        {modules.length === 0 ? (
          <p className="text-[var(--ledger-muted)]">No published modules yet.</p>
        ) : (
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, idx) => {
              const inProgress = m.completed > 0 && m.completed < m.lesson_count;
              return (
                <li key={m.id}>
                  <ModuleCard
                    id={m.id}
                    ordinal={m.ordinal}
                    title={m.title}
                    tier={m.tier}
                    summary={m.summary}
                    lessonCount={m.lesson_count}
                    completed={m.completed}
                    current={inProgress}
                    delay={(idx % 5) + 1}
                    heroImageUrl={m.hero_image_url}
                    heroImageAlt={m.hero_image_alt}
                    heroImageCredit={m.hero_image_credit}
                  />
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Pillars */}
      <section className="border-t border-[var(--ledger-rule)] bg-[var(--ledger-paper)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-3">
            {[
              {
                num: '01',
                k: 'Built for the role you have',
                v: 'Every applied lesson branches into Risk & Compliance, Customer-Facing, Back-Office, Technical, or Leadership. You see the example for your seat — not a generic one.',
              },
              {
                num: '02',
                k: 'You leave with artifacts',
                v: 'A Data Discipline Card, an AI Toolkit Map, a First Conversation transcript, a Starter Prompt Pack — saved to your Toolbox and exportable as Markdown.',
              },
              {
                num: '03',
                k: 'Safe to practice',
                v: 'The sandbox is bounded by design: no PII, no member data, no internal docs. A controlled environment so you build confidence before you build at work.',
              },
            ].map((c) => (
              <div key={c.num}>
                <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] tabular-nums">
                  {c.num}
                </div>
                <h3 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)] leading-tight">{c.k}</h3>
                <p className="mt-3 text-[var(--ledger-ink-2)] leading-relaxed">{c.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="addie-hero-ink">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 lg:py-20 text-center relative">
          <span className="addie-chip" data-tone="done">Ten minutes</span>
          <h2 className="mt-5 font-serif text-3xl sm:text-5xl leading-[1.05]">
            One lesson is enough
            <br />
            to feel the difference.
          </h2>
          <p className="mt-5 text-[var(--ledger-paper)] opacity-80 max-w-2xl mx-auto text-lg">
            Module 0 is two short lessons: how this course works, and the
            one rule that matters before any AI tool appears.
          </p>
          <div className="mt-8">
            <Link
              href={firstHref}
              className="group inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-sm px-7 py-4 rounded-[4px] bg-[var(--ledger-accent)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] transition-colors duration-[160ms]"
            >
              Start Module 0
              <span className="transition-transform duration-[200ms] group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
