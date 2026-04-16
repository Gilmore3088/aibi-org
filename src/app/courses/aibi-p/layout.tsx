// /courses/aibi-p layout — shared sidebar + main content area
// Server Component: sidebar reads from hardcoded enrollment stub (wired in Plan 02-03)

import type { ReactNode } from 'react';
import { CourseSidebar } from './_components/CourseSidebar';
import { MobileSidebarDrawer } from './_components/MobileSidebarDrawer';

interface CourseLayoutProps {
  readonly children: ReactNode;
}

// TODO: Read from enrollment (Plan 02-03)
const STUB_COMPLETED_MODULES: readonly number[] = [];
const STUB_CURRENT_MODULE = 1;

export default function CourseLayout({ children }: CourseLayoutProps) {
  return (
    <div className="min-h-screen bg-[color:var(--color-linen)]">
      {/* Desktop persistent sidebar — hidden below lg */}
      <CourseSidebar
        completedModules={STUB_COMPLETED_MODULES}
        currentModule={STUB_CURRENT_MODULE}
      />

      {/* Mobile header bar with hamburger — visible below lg */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[color:var(--color-linen)]/95 border-b border-[color:var(--color-terra)]/10 flex items-center px-4 gap-3">
        <MobileSidebarDrawer
          completedModules={STUB_COMPLETED_MODULES}
          currentModule={STUB_CURRENT_MODULE}
        />
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-sm flex items-center justify-center text-[9px] font-mono font-bold text-[color:var(--color-terra)]"
            style={{ border: '1.5px solid var(--color-terra)' }}
          >
            Ai
          </div>
          <span className="font-serif italic text-sm font-bold text-[color:var(--color-ink)]">
            AiBI-P
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
