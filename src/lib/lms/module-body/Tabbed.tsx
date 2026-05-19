'use client';

// Tabbed module body template — Foundation pattern.
//
// Wraps the existing <CourseTabs> primitive (Learn / Practice / Apply)
// with the harness contract. The page is responsible for the module
// header (title, breadcrumb, status); this component owns only the
// tabbed body region.

import type { ReactNode } from 'react';
import { CourseTabs } from '@/components/CourseTabs';

interface TabbedProps {
  /** Stable id segment used to namespace sessionStorage for tab persistence. */
  readonly storagePrefix: string;
  /** Optional legacy prefix; if set, value at the legacy key is migrated once. */
  readonly legacyStoragePrefix?: string;
  /** The current module's number — combined with storagePrefix to form the key. */
  readonly moduleNumber: number;
  readonly accentColor?: string;
  readonly learnContent: ReactNode;
  /** May be null when the module has no practice step (gallery, capstone). */
  readonly practiceContent: ReactNode | null;
  readonly applyContent: ReactNode;
}

export function Tabbed({
  storagePrefix,
  legacyStoragePrefix,
  moduleNumber,
  accentColor,
  learnContent,
  practiceContent,
  applyContent,
}: TabbedProps) {
  return (
    <CourseTabs
      storagePrefix={storagePrefix}
      legacyStoragePrefix={legacyStoragePrefix}
      segmentNumber={moduleNumber}
      accentColor={accentColor}
      learnContent={learnContent}
      practiceContent={practiceContent}
      applyContent={applyContent}
    />
  );
}
