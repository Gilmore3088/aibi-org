'use client';

// ResearchPageClient — thin client shell that wraps the /research page in
// GuidedFilterProvider and renders the GuidedFilter selector.
//
// The server component (page.tsx) renders this once at the top of the page
// tree, passing the full catalog as children. All FilteredSection /
// FilteredCard components inside are client islands that read the same
// context.

import type { ReactNode } from 'react';
import { GuidedFilterProvider } from './GuidedFilter';
import { GuidedFilter } from './GuidedFilter';

interface ResearchPageClientProps {
  children: ReactNode;
}

export function ResearchPageClient({ children }: ResearchPageClientProps) {
  return (
    <GuidedFilterProvider>
      <GuidedFilter />
      {children}
    </GuidedFilterProvider>
  );
}
