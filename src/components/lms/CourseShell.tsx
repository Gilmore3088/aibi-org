import type { ReactNode } from 'react';
import { LMSSidebar } from './LMSSidebar';
import type { LMSModule } from './types';

interface Props {
  readonly modules: readonly LMSModule[];
  readonly completed: readonly number[];
  readonly current: number;
  readonly learner?: {
    readonly name: string;
    readonly role: string;
  };
  readonly children: ReactNode;
}

/**
 * Layout wrapper for the Ledger-style LMS surfaces.
 *
 * Grid: 280px sidebar + flexible main column. Sidebar collapses on mobile
 * (`hidden md:flex` inside <LMSSidebar/>).
 *
 * The shell does NOT render the TopBar — each screen renders its own
 * <LMSTopBar/> with breadcrumbs specific to that route.
 */
export function CourseShell({ modules, completed, current, learner, children }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 280px) minmax(0, 1fr)',
        minHeight: '100vh',
        background: 'var(--ledger-bg)',
        color: 'var(--ledger-ink)',
        fontFamily: 'var(--ledger-sans)',
      }}
    >
      <LMSSidebar
        modules={modules}
        completed={completed}
        current={current}
        learner={learner}
      />
      <main style={{ minWidth: 0 }}>{children}</main>
    </div>
  );
}
