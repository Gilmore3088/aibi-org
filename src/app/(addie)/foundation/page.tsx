// /foundation — course home. Server component that loads modules from
// addie.modules and the learner's progress if signed in. Renders the
// CoursePathHero (animated arc through the 6 modules) plus a grid of
// ModuleCards with progress arcs.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { CoursePathHero } from '@/components/addie/shell/CoursePathHero';
import { ModuleCard } from '@/components/addie/shell/ModuleCard';
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
      cookies: {
        getAll: () => store.getAll(),
        setAll: () => {
          /* read-only */
        },
      },
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
    const { data, error } = await svc
      .from('modules')
      .select('id, ordinal, title, tier, summary, published')
      .eq('published', true)
      .order('ordinal', { ascending: true });
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
      // Optional: completed-lesson count via events table. Soft-fail if the
      // event shape isn't what we expect — the page still renders.
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
  const currentOrdinal =
    modules.find((m) => m.completed < m.lesson_count)?.ordinal ?? modules.length;
  const firstHref = modules[0] ? `/foundation/${modules[0].id}/m0.1` : '#';

  return (
    <main className="addie-course-surface__page">
      {/* Hero */}
      <section className="addie-hero-parch">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[3fr_2fr] items-center">
            <div data-reveal>
              <span className="addie-chip" data-tone="accent">
                Foundation · 6 modules · {totalLessons} lessons
              </span>
              <h1 className="mt-4 font-serif text-4xl sm:text-5xl text-[var(--ledger-ink)] leading-[1.05] tracking-tight">
                From &ldquo;I&apos;ve heard of generative AI&rdquo; to
                <br />
                <span className="text-[var(--ledger-accent)]">&ldquo;I built something useful this week.&rdquo;</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-[var(--ledger-ink-2)] leading-relaxed">
                Six modules. Every lesson under fifteen minutes. The first four
                are free; the last two unlock the skills + build work. You can
                start anonymously and bring your own role into every example.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={firstHref}
                  className="inline-flex items-center gap-2 font-mono font-semibold uppercase tracking-[0.16em] text-xs px-5 py-3 rounded-[3px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[120ms]"
                >
                  Start Module 0 →
                </Link>
                <Link
                  href="/foundation/dashboard"
                  className="inline-flex items-center gap-2 font-mono font-semibold uppercase tracking-[0.16em] text-xs px-5 py-3 rounded-[3px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] transition-colors duration-[120ms]"
                >
                  Open dashboard
                </Link>
                {userId ? (
                  <span className="addie-chip" data-tone="ink">
                    {overallPct}% complete · {totalDone}/{totalLessons}
                  </span>
                ) : null}
              </div>
            </div>
            <aside data-reveal data-reveal-delay="2" className="lg:pl-6">
              <CoursePathHero currentOrdinal={currentOrdinal} />
            </aside>
          </div>
        </div>
      </section>

      {/* Module grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <h2 className="font-serif text-2xl text-[var(--ledger-ink)]">The path</h2>
          <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
            Designed for community banks &amp; credit unions
          </span>
        </div>

        {modules.length === 0 ? (
          <p className="text-[var(--ledger-muted)]">
            No published modules yet.
          </p>
        ) : (
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, idx) => {
              const inProgress =
                m.completed > 0 && m.completed < m.lesson_count;
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
                  />
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Why this course */}
      <section className="bg-[var(--ledger-paper)] border-y border-[var(--ledger-rule)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-3">
          {[
            {
              k: 'Built for the role you actually have',
              v: 'Every applied lesson branches into Risk &amp; Compliance, Customer-Facing, Back-Office, Technical, or Leadership. You see the example for your seat.',
            },
            {
              k: 'You leave with artifacts, not just notes',
              v: 'A Data Discipline Card, an AI Toolkit Map, a First Conversation transcript, a Starter Prompt Pack — saved to your Toolbox and exportable as .md.',
            },
            {
              k: 'Safe to practice, hard to misuse',
              v: 'The sandbox is bounded by design: no PII, no member data, no internal docs — a controlled environment so you can build confidence before you build at work.',
            },
          ].map((c, i) => (
            <div key={c.k} data-reveal data-reveal-delay={(i + 1) as number}>
              <span className="addie-chip">Why it works</span>
              <h3 className="mt-3 font-serif text-xl text-[var(--ledger-ink)]">{c.k}</h3>
              <p
                className="mt-2 text-[var(--ledger-ink-2)] leading-relaxed"
                // dangerouslySetInnerHTML used here only for the literal &amp; entity in copy
                dangerouslySetInnerHTML={{ __html: c.v }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="addie-hero-ink">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 text-center">
          <span className="addie-chip" data-tone="done">Ready</span>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl">
            One lesson is enough to feel the difference.
          </h2>
          <p className="mt-3 text-[var(--ledger-paper)] opacity-80 max-w-2xl mx-auto">
            Module 0 is two short lessons: how the course works, and the one
            rule that matters before any tool appears. Ten minutes.
          </p>
          <div className="mt-7">
            <Link
              href={firstHref}
              className="inline-flex items-center gap-2 font-mono font-semibold uppercase tracking-[0.16em] text-xs px-6 py-3 rounded-[3px] bg-[var(--ledger-accent)] text-[var(--ledger-ink)] hover:opacity-95 transition-opacity duration-[120ms]"
            >
              Start Module 0 →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
