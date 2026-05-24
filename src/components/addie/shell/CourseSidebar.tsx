// CourseSidebar — module/lesson tree shown on every lesson route.
// Per Screen Inventory §3.4: SiteNav · breadcrumb · sidebar (module/
// lesson tree) · main content · Toolbox drawer toggle.
// Collapsible on mobile via the <details> element so it stays SSR-only
// (no client JS needed for the toggle).

import Link from 'next/link';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';

interface CourseSidebarProps {
  readonly activeModuleId: string;
  readonly activeLessonId: string;
}

interface ModuleNode {
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly tier: 'free' | 'paid';
  readonly lessons: ReadonlyArray<{
    readonly id: string;
    readonly ordinal: number;
    readonly title: string;
    readonly duration_min: number;
    readonly modality: string;
  }>;
}

async function loadTree(): Promise<ModuleNode[]> {
  try {
    const svc = getAddieServiceClient();
    const { data: mods } = await svc
      .from('modules')
      .select('id, ordinal, title, tier')
      .eq('published', true)
      .order('ordinal', { ascending: true });
    if (!mods) return [];
    const ids = mods.map((m) => m.id as string);
    const { data: lessons } = await svc
      .from('lessons')
      .select('id, module_id, ordinal, title, duration_min, modality')
      .in('module_id', ids)
      .eq('published', true)
      .order('module_id', { ascending: true })
      .order('ordinal', { ascending: true });
    return mods.map((m) => ({
      id: m.id as string,
      ordinal: m.ordinal as number,
      title: m.title as string,
      tier: (m.tier as 'free' | 'paid'),
      lessons: ((lessons ?? []) as Array<{
        id: string;
        module_id: string;
        ordinal: number;
        title: string;
        duration_min: number;
        modality: string;
      }>)
        .filter((l) => l.module_id === m.id)
        .map((l) => ({
          id: l.id,
          ordinal: l.ordinal,
          title: l.title,
          duration_min: l.duration_min,
          modality: l.modality,
        })),
    }));
  } catch {
    return [];
  }
}

export async function CourseSidebar({ activeModuleId, activeLessonId }: CourseSidebarProps) {
  const tree = await loadTree();
  if (tree.length === 0) return null;

  return (
    <nav
      aria-label="Course outline"
      className="addie-course-sidebar w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-[64px] lg:self-start"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-muted)]">
          Course outline
        </span>
        <Link
          href="/foundation"
          className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
        >
          Home
        </Link>
      </div>
      <ol className="space-y-3">
        {tree.map((m) => {
          const isActive = m.id === activeModuleId;
          return (
            <li key={m.id}>
              <details open={isActive} className="group">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-3 py-2 rounded-[3px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)] transition-colors duration-[120ms]">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] shrink-0">
                      M{m.ordinal}
                    </span>
                    <span className={`font-serif text-sm leading-tight truncate ${isActive ? 'text-[var(--ledger-ink)]' : 'text-[var(--ledger-ink-2)]'}`}>
                      {m.title}
                    </span>
                  </div>
                  <span className="font-mono uppercase tracking-[0.16em] text-[0.6rem] shrink-0" data-tone={m.tier}>
                    {m.tier === 'paid' ? (
                      <span className="text-[var(--ledger-accent)]">Paid</span>
                    ) : (
                      <span className="text-[var(--ledger-muted)]">Free</span>
                    )}
                  </span>
                </summary>
                <ol className="mt-2 ml-2 pl-3 border-l border-[var(--ledger-rule)] space-y-1">
                  {m.lessons.map((l) => {
                    const isActiveLesson = l.id === activeLessonId;
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/foundation/${m.id}/${l.id}`}
                          aria-current={isActiveLesson ? 'page' : undefined}
                          className={`block px-2 py-1.5 rounded-[2px] transition-colors duration-[120ms] ${
                            isActiveLesson
                              ? 'bg-[var(--ledger-tape)] text-[var(--ledger-ink)]'
                              : 'text-[var(--ledger-ink-2)] hover:bg-[var(--ledger-paper)] hover:text-[var(--ledger-ink)]'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-sm truncate">
                              <span className="font-mono text-[0.7rem] text-[var(--ledger-muted)] mr-1.5">
                                {l.ordinal}.
                              </span>
                              {l.title}
                            </span>
                            <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--ledger-muted)] shrink-0 tabular-nums">
                              {l.duration_min}m
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </details>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
