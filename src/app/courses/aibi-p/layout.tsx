// /courses/aibi-p layout — shared sidebar + main content area
// Server Component: reads live enrollment from Supabase on every request (Plan 02-03)
// ONBD-02: Redirects enrolled users with null onboarding_answers to /onboarding survey.

import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { CourseSidebar } from './_components/CourseSidebar';
import { MobileSidebarDrawer } from './_components/MobileSidebarDrawer';
import { getEnrollment } from './_lib/getEnrollment';

interface CourseLayoutProps {
  readonly children: ReactNode;
}

// Paths that must never trigger the onboarding redirect (avoids infinite loop).
const ONBOARDING_EXEMPT_SUFFIXES = ['/onboarding', '/settings', '/purchase'];

export default async function CourseLayout({ children }: CourseLayoutProps) {
  // Fetch enrollment server-side. Returns null when Supabase is unconfigured or user
  // is unauthenticated — overview page remains accessible; module pages redirect.
  const enrollment = await getEnrollment();

  // --- Onboarding gate (ONBD-02) ---
  // Enrolled users who have not yet completed the onboarding survey are sent to
  // /onboarding before they can reach any module or overview content.
  // Exempt paths: /onboarding itself and /settings (allow editing answers).
  if (enrollment !== null && enrollment.onboarding_answers === null) {
    const headersList = headers();
    const pathname = headersList.get('x-pathname') ?? '';

    const isExempt = ONBOARDING_EXEMPT_SUFFIXES.some((suffix) =>
      pathname.endsWith(suffix)
    );

    if (!isExempt) {
      redirect('/courses/aibi-p/onboarding');
    }
  }

  const completedModules: readonly number[] = enrollment?.completed_modules ?? [];
  const currentModule: number = enrollment?.current_module ?? 1;

  return (
    <div className="min-h-screen bg-[color:var(--color-linen)]">
      {/* Desktop persistent sidebar — hidden below lg */}
      <CourseSidebar
        completedModules={completedModules}
        currentModule={currentModule}
      />

      {/* Mobile header bar with hamburger — visible below lg */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[color:var(--color-linen)]/95 border-b border-[color:var(--color-terra)]/10 flex items-center px-4 gap-3">
        <MobileSidebarDrawer
          completedModules={completedModules}
          currentModule={currentModule}
        />
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-[color:var(--color-terra)]"
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
