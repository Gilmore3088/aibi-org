// LessonShellHeader — breadcrumb · module/lesson title · meta row +
// lesson-progress dots so learners see where they are inside the module.

import Link from 'next/link';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import type { LessonRow, ModuleRow, Track } from './types';

const TRACK_LABELS: Record<Track, string> = {
  risk_compliance: 'Risk & Compliance',
  customer_facing: 'Customer-Facing',
  back_office: 'Back-Office',
  technical: 'Technical',
  leadership: 'Leadership',
};

interface LessonShellHeaderProps {
  readonly lesson: LessonRow;
  readonly module: ModuleRow;
  readonly activeTrack?: Track | null;
}

async function loadSiblingOrdinals(
  moduleId: string,
): Promise<Array<{ id: string; ordinal: number; title: string }>> {
  try {
    const svc = getAddieServiceClient();
    const { data } = await svc
      .from('lessons')
      .select('id, ordinal, title')
      .eq('module_id', moduleId)
      .eq('published', true)
      .order('ordinal', { ascending: true });
    return ((data as Array<{ id: string; ordinal: number; title: string }> | null) ?? []);
  } catch {
    return [];
  }
}

export async function LessonShellHeader({
  lesson,
  module,
  activeTrack,
}: LessonShellHeaderProps) {
  const siblings = await loadSiblingOrdinals(module.id);
  const currentIdx = siblings.findIndex((s) => s.id === lesson.id);

  return (
    <header className="mb-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
          <li><Link href="/foundation" className="hover:text-[var(--ledger-ink)]">Foundation</Link></li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href={`/foundation/${module.id}`} className="hover:text-[var(--ledger-ink)]">
              Module {module.ordinal} · {module.title}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li className="text-[var(--ledger-ink)]" aria-current="page">{lesson.title}</li>
        </ol>
      </nav>

      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="addie-chip" data-tone={module.tier === 'paid' ? 'accent' : undefined}>
            {module.tier === 'paid' ? 'Paid · ' : 'Free · '} Lesson {lesson.ordinal} of {siblings.length || '?'}
          </span>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-[var(--ledger-ink)] leading-[1.1] tracking-tight">
            {lesson.title}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
            {lesson.duration_min} min · {lesson.modality}
          </span>
          {lesson.is_branched && activeTrack ? (
            <span className="inline-flex items-center gap-2 border border-[var(--ledger-rule)] rounded-[2px] px-2 py-1">
              <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
                Track
              </span>
              <span className="text-sm text-[var(--ledger-ink)]">{TRACK_LABELS[activeTrack]}</span>
              <Link
                href="/account"
                className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ledger-accent)] hover:underline"
              >
                Change
              </Link>
            </span>
          ) : null}
        </div>
      </div>

      {/* Lesson-progress dot strip */}
      {siblings.length > 1 ? (
        <div className="mt-5 pt-4 border-t border-[var(--ledger-rule)] flex items-center justify-between gap-3">
          <div className="addie-progress-dots" aria-label={`Lesson ${currentIdx + 1} of ${siblings.length}`}>
            {siblings.map((s, i) => (
              <span
                key={s.id}
                className="dot"
                data-state={i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'todo'}
                title={s.title}
              />
            ))}
          </div>
          <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
            {currentIdx + 1} / {siblings.length}
          </span>
        </div>
      ) : null}
    </header>
  );
}
