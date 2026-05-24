// /foundation/[moduleId] — module index. Rich landing page per module:
// hero illustration, what-you'll-learn outline, takeaway artifact
// preview, dimensional lesson cards with modality + duration + status,
// Begin Module CTA at top and bottom.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { ModuleIllustration } from '@/components/addie/illustrations/ModuleIllustration';

export const dynamic = 'force-dynamic';

type ModuleKey = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

interface ModuleData {
  id: ModuleKey;
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
  takeaway_artifact_type: string | null;
}

const MODALITY_LABEL: Record<string, string> = {
  video: 'Video',
  audio: 'Audio',
  reading: 'Read',
  interactive: 'Interactive',
  worksheet: 'Worksheet',
  sandbox: 'Sandbox',
};

const MODULE_PROMISE: Record<ModuleKey, { learn: ReadonlyArray<string>; build: string; bullet: string }> = {
  m0: {
    learn: [
      'How the course works (and how to think about your role)',
      'The one rule that matters before any AI tool appears',
      'Which role-track sets up every applied lesson downstream',
    ],
    build: 'Data Discipline Card — a printable one-pager of what you never paste',
    bullet: 'Ground rules before you touch a single tool.',
  },
  m1: {
    learn: [
      'What a generative model actually is (and what it isn\'t)',
      'The map of tools — assistants vs. builders, the only split that matters',
      'Why this matters in your specific role',
    ],
    build: 'AI Toolkit Map — which tool to reach for, per kind of task',
    bullet: 'A shared vocabulary and a working map of the tools.',
  },
  m2: {
    learn: [
      'How to actually get access without an IT ticket',
      'What each tool is best at — beyond the marketing',
      'Where in your week the right AI move belongs',
    ],
    build: 'First Conversation transcript + Where AI Fits in Your Week worksheet',
    bullet: 'First successful, safe contact with a model.',
  },
  m3: {
    learn: [
      'The anatomy of a prompt that consistently works',
      'How small changes to a prompt change everything (A/B sandbox)',
      'Banking-specific red lines + the patterns to use instead',
    ],
    build: 'Starter Prompt Pack — three role-fitted prompts you can use Monday',
    bullet: 'The conceptual heart of the free side — talking to the machine.',
  },
  m4: {
    learn: [
      'What a "skill" is — and why saving beats remembering',
      'How to build, fork, and lock the choices on a reusable skill',
      'How to test, refine, and guardrail-check a skill before you trust it',
    ],
    build: 'Your first three Skills — saved prompts ready to run on Monday\'s work',
    bullet: 'Turn one good prompt into a reusable personal library.',
  },
  m5: {
    learn: [
      'What an agent is — and where it actually fits',
      'Framing a problem worth solving, then writing the brief',
      'Shipping a working prototype with a no-code builder',
    ],
    build: 'A Problem Frame, a lightweight PRD, and a live Prototype link',
    bullet: 'From idea to working prototype, in one short module.',
  },
};

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
      .select('id, ordinal, title, modality, duration_min, takeaway_artifact_type, published')
      .eq('module_id', moduleId)
      .eq('published', true)
      .order('ordinal', { ascending: true });
    return {
      module: {
        id: m.id as ModuleKey,
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
        takeaway_artifact_type: (l.takeaway_artifact_type as string | null) ?? null,
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
  if (!data) notFound();
  const { module: m, lessons } = data;
  const totalMin = lessons.reduce((n, l) => n + l.duration_min, 0);
  const promise = MODULE_PROMISE[m.id] ?? {
    learn: [],
    build: '',
    bullet: m.summary ?? '',
  };
  const firstLesson = lessons[0];
  const beginHref = firstLesson ? `/foundation/${m.id}/${firstLesson.id}` : '#';

  return (
    <main>
      {/* Hero */}
      <section className="addie-hero-parch">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/foundation"
              className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
            >
              ← Foundation
            </Link>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[5fr_4fr] items-center">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="addie-chip" data-tone={m.tier === 'paid' ? 'accent' : undefined}>
                  Module {m.ordinal} · {m.tier === 'paid' ? 'Paid' : 'Free'}
                </span>
                <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] tabular-nums">
                  {lessons.length} lessons · {totalMin} min total
                </span>
              </div>
              <h1 className="font-serif text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] leading-[1] tracking-[-0.02em] text-[var(--ledger-ink)]">
                {m.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-[1.55] text-[var(--ledger-ink-2)]">
                {promise.bullet}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={beginHref}
                  className="group inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-4 rounded-[4px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms] shadow-[0_4px_20px_-6px_rgba(14,27,45,0.4)]"
                >
                  Begin Module {m.ordinal}
                  <span className="transition-transform duration-[200ms] group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="#lessons"
                  className="font-mono font-semibold uppercase tracking-[0.14em] text-xs px-5 py-4 rounded-[4px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] transition-colors duration-[160ms]"
                >
                  See the lessons
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 right-8 bottom-8 rounded-[12px] bg-[var(--ledger-tape)] -z-10" aria-hidden />
              <div className="absolute top-4 left-4 right-0 bottom-0 rounded-[12px] bg-[color-mix(in_srgb,var(--ledger-accent)_18%,var(--ledger-paper))] -z-10" aria-hidden />
              <div className="relative rounded-[12px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-5 shadow-[0_24px_60px_-20px_rgba(14,27,45,0.3),0_8px_18px_-8px_rgba(14,27,45,0.18)]">
                <ModuleIllustration module={m.id} variant="hero" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll learn + What you'll build */}
      <section className="border-t border-[var(--ledger-rule)] bg-[var(--ledger-bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            <span className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
              What you&apos;ll learn
            </span>
            <ol className="mt-4 space-y-4">
              {promise.learn.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="shrink-0 font-serif text-[1.5rem] leading-none text-[var(--ledger-accent)] tabular-nums w-8">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="font-serif text-lg leading-snug text-[var(--ledger-ink)] pt-0.5">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
              What you&apos;ll build
            </span>
            <div className="mt-4 rounded-[6px] bg-[var(--ledger-tape)] border border-[var(--ledger-rule)] p-5 sm:p-6">
              <div className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] mb-2">
                Takeaway
              </div>
              <p className="font-serif text-xl text-[var(--ledger-ink)] leading-snug">
                {promise.build}
              </p>
              <p className="mt-3 text-sm text-[var(--ledger-ink-2)]">
                Saves to your Toolbox. Exportable as Markdown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons */}
      <section id="lessons" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl text-[var(--ledger-ink)]">
            Lessons
          </h2>
          <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] tabular-nums">
            {lessons.length} lessons · {totalMin} min
          </span>
        </div>
        {lessons.length === 0 ? (
          <p className="text-[var(--ledger-muted)]">No lessons published in this module yet.</p>
        ) : (
          <ol className="grid gap-3">
            {lessons.map((l, i) => (
              <li key={l.id}>
                <Link
                  href={`/foundation/${m.id}/${l.id}`}
                  className="group block rounded-[6px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)] hover:shadow-[var(--ledger-shadow)] transition-all duration-[160ms] p-4 sm:p-5"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="shrink-0 font-serif text-[2rem] leading-none text-[var(--ledger-accent)] tabular-nums w-12 text-right">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)]">
                          {MODALITY_LABEL[l.modality] ?? l.modality}
                        </span>
                        {l.takeaway_artifact_type ? (
                          <>
                            <span className="text-[var(--ledger-rule)]">·</span>
                            <span className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-accent)]">
                              Saves a takeaway
                            </span>
                          </>
                        ) : null}
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl text-[var(--ledger-ink)] leading-tight">
                        {l.title}
                      </h3>
                    </div>
                    <span className="shrink-0 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)] tabular-nums">
                      {l.duration_min} min
                    </span>
                    <span aria-hidden className="shrink-0 text-[var(--ledger-muted)] group-hover:text-[var(--ledger-ink)] group-hover:translate-x-1 transition-all duration-[160ms]">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}

        {firstLesson ? (
          <div className="mt-10 flex justify-center">
            <Link
              href={beginHref}
              className="group inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-sm px-7 py-4 rounded-[4px] bg-[var(--ledger-accent)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] hover:border hover:border-[var(--ledger-ink)] transition-colors duration-[160ms]"
            >
              Begin lesson 1 · {firstLesson.title}
              <span className="transition-transform duration-[200ms] group-hover:translate-x-1">→</span>
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
