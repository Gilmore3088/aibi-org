// CourseShell — top-level layout wrapper for any harness-driven course
// Server Component: purely presentational — no enrollment gates, no redirects

import type { ReactNode } from 'react';
import { CourseSidebar } from './CourseSidebar';
import { CourseMobileDrawer } from './CourseMobileDrawer';
import type { ResolvedCourseView } from './types';

interface CourseShellProps {
  readonly view: ResolvedCourseView;
  readonly children: ReactNode;
}

export function CourseShell({ view, children }: CourseShellProps) {
  const accent = view.config.brand.accentColorVar;

  return (
    <div className="min-h-screen bg-[color:var(--color-linen)]">
      {/* Desktop persistent sidebar — hidden below lg */}
      <CourseSidebar view={view} />

      {/* Mobile header bar with hamburger — visible below lg */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[color:var(--color-linen)]/95 border-b flex items-center px-4 gap-3"
        style={{ borderColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}
      >
        <CourseMobileDrawer view={view} />
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold"
            style={{ border: `1.5px solid ${accent}`, color: accent }}
          >
            Ai
          </div>
          <span className="font-serif italic text-sm font-bold text-[color:var(--color-ink)]">
            {view.config.brand.wordmark}
          </span>
        </div>
      </header>

      {/* Main content area — offset for sidebar on desktop, header on mobile */}
      <main className="lg:ml-72 pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
