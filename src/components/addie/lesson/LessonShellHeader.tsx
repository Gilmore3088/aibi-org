// LessonShellHeader — breadcrumb · module/lesson title · duration/tier badges.

import Link from 'next/link';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
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

export function LessonShellHeader({ lesson, module, activeTrack }: LessonShellHeaderProps) {
  return (
    <header className="border-b border-[var(--ledger-rule)] pb-5 mb-6">
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex items-center gap-2 font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
          <li><Link href="/foundation" className="hover:text-[var(--ledger-ink)]">Foundation</Link></li>
          <li aria-hidden="true">›</li>
          <li><Link href={`/foundation/${module.id}`} className="hover:text-[var(--ledger-ink)]">{module.title}</Link></li>
          <li aria-hidden="true">›</li>
          <li className="text-[var(--ledger-ink)]" aria-current="page">{lesson.title}</li>
        </ol>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl text-[var(--ledger-ink)] leading-tight">{lesson.title}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <KickerLabel tone="muted">{lesson.duration_min} min</KickerLabel>
          <KickerLabel tone={module.tier === 'paid' ? 'accent' : 'muted'}>
            {module.tier === 'paid' ? 'Paid' : 'Free'}
          </KickerLabel>
          {lesson.is_branched && activeTrack ? (
            <span className="inline-flex items-center gap-2 border border-[var(--ledger-rule)] rounded-[2px] px-2 py-1">
              <KickerLabel tone="muted">Track</KickerLabel>
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
    </header>
  );
}
