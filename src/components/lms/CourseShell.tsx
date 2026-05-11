import type { ReactNode } from 'react';
import { LMSSidebar } from './LMSSidebar';
import { LMSMobileNav } from './LMSMobileNav';
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
 * Desktop (≥768px): 280px sidebar + flexible main column. The sidebar is
 * sticky to the viewport top.
 *
 * Mobile (<768px): the sidebar is hidden and replaced by a hamburger
 * button (fixed top-left) that opens a slide-in drawer with the same
 * sidebar content. The main column expands to full width.
 *
 * The shell does NOT render the TopBar — each screen renders its own
 * <LMSTopBar/> with breadcrumbs specific to that route.
 */
export function CourseShell({ modules, completed, current, learner, children }: Props) {
  return (
    <div
      className="lms-shell"
      style={{
        display: 'grid',
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
      <LMSMobileNav
        modules={modules}
        completed={completed}
        current={current}
        learner={learner}
      />
      <main style={{ minWidth: 0 }}>{children}</main>
      <style>{`
        .lms-shell {
          grid-template-columns: minmax(0, 1fr);
        }
        @media (min-width: 768px) {
          .lms-shell {
            grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
