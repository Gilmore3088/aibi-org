// Custom module body template — escape hatch.
//
// For modules that don't fit Tabbed or Linear (capstones, gallery
// pages, one-off layouts). The harness provides nothing structural
// — the page is responsible for the body's layout. This component
// is intentionally trivial: it exists so course pages can select
// 'custom' as their bodyTemplate and remain consistent in how they
// declare intent, even when the implementation diverges.

import type { ReactNode } from 'react';

interface CustomProps {
  readonly children: ReactNode;
}

export function Custom({ children }: CustomProps) {
  return <>{children}</>;
}
