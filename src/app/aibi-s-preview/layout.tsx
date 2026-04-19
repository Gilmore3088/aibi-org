// /aibi-s-preview layout — shared sidebar + main content area
// Server Component: static prototype, no enrollment fetch, no onboarding redirect

import type { ReactNode } from 'react';
import { CourseSidebar } from './_components/CourseSidebar';
import { MobileSidebarDrawer } from './_components/MobileSidebarDrawer';

interface CourseLayoutProps {
  readonly children: ReactNode;
}

export default async function CourseLayout({ children }: CourseLayoutProps) {
  const completedModules: readonly number[] = [];
  const currentModule: number = 1.1;

  return (
    <div className="min-h-screen bg-[color:var(--color-linen)]">
      {/* Desktop persistent sidebar — hidden below lg */}
      <CourseSidebar
        completedModules={completedModules}
        currentModule={currentModule}
      />

      {/* Mobile header bar with hamburger — visible below lg */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[color:var(--color-linen)]/95 border-b border-[color:var(--color-cobalt)]/10 flex items-center px-4 gap-3">
        <MobileSidebarDrawer
          completedModules={completedModules}
          currentModule={currentModule}
        />
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-[color:var(--color-cobalt)]"
            style={{ border: '1.5px solid var(--color-cobalt)' }}
          >
            Ai
          </div>
          <span className="font-serif italic text-sm font-bold text-[color:var(--color-ink)]">
            AiBI-S
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
