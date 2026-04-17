// /courses/aibi-l layout — Simple wrapper (no sidebar)
// AiBI-L is a 1-day workshop, not a multi-week course
// No enrollment gating — this is a marketing/info page with a request form

import type { ReactNode } from 'react';

interface WorkshopLayoutProps {
  readonly children: ReactNode;
}

export default function AiBILLayout({ children }: WorkshopLayoutProps) {
  return (
    <div className="min-h-screen bg-[color:var(--color-linen)]">
      <main>{children}</main>
    </div>
  );
}
