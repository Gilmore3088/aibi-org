// /courses/aibi-s layout — shared sidebar + main content area
// Server Component: reads live enrollment from Supabase on every request
// Enrollment gating: non-enrolled users redirected to /courses/aibi-s/purchase
// Cobalt accent color throughout (AiBI-S uses --color-cobalt, not terra)

import type { ReactNode } from 'react';
import { WeekSidebar } from './_components/WeekSidebar';
import { MobileWeekDrawer } from './_components/MobileWeekDrawer';
import { getEnrollment } from './_lib/getEnrollment';

interface CourseLayoutProps {
  readonly children: ReactNode;
}

export default async function AiBISLayout({ children }: CourseLayoutProps) {
  const enrollment = await getEnrollment();

  const completedWeeks: readonly number[] = enrollment?.completed_modules ?? [];
  const currentWeek: number = enrollment?.current_module ?? 1;

  return (
    <div className="min-h-screen bg-[color:var(--color-linen)]">
      {/* Desktop persistent sidebar — hidden below lg */}
      <WeekSidebar completedWeeks={completedWeeks} currentWeek={currentWeek} />

      {/* Mobile header bar — visible below lg */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[color:var(--color-linen)]/95 border-b border-[color:var(--color-cobalt)]/10 flex items-center px-4 gap-3">
        <MobileWeekDrawer completedWeeks={completedWeeks} currentWeek={currentWeek} />
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

      {/* Main content area */}
      <main className="lg:ml-72 pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
