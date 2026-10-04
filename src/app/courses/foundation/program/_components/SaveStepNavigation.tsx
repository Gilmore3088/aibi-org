'use client';

// SaveStepNavigation — forward path at the end of the Save step.
//
// Save is the last of the four module steps, but the only "next module" CTA
// lived at the bottom of Build (inside ModuleContentClient). Learners who
// finished Save hit a dead end; on mobile the course sidebar is collapsed, so
// there was no visible way forward at all.
//
// ModuleTabs unmounts inactive panels, so completion that happens in Build
// during this visit is handed over via sessionStorage + an event from
// ModuleContentClient (see MODULE_COMPLETED_EVENT).

import { useEffect, useState } from 'react';
import { ModuleNavigation } from './ModuleNavigation';

export const MODULE_COMPLETED_EVENT = 'foundation-module-completed';

export function moduleCompletedStorageKey(moduleNumber: number): string {
  return `foundation-module-completed-${moduleNumber}`;
}

export interface SaveStepNavigationProps {
  readonly moduleNumber: number;
  readonly isLastModule: boolean;
  readonly isAlreadyCompleted: boolean;
}

export function SaveStepNavigation({
  moduleNumber,
  isLastModule,
  isAlreadyCompleted,
}: SaveStepNavigationProps) {
  const [complete, setComplete] = useState(isAlreadyCompleted);

  useEffect(() => {
    if (isAlreadyCompleted) return;
    try {
      if (window.sessionStorage.getItem(moduleCompletedStorageKey(moduleNumber)) === '1') {
        setComplete(true);
      }
    } catch {
      // Storage can be unavailable (private mode); the event below still works.
    }
    const onCompleted = (event: Event) => {
      const detail = (event as CustomEvent<{ moduleNumber?: number }>).detail;
      if (detail?.moduleNumber === moduleNumber) setComplete(true);
    };
    window.addEventListener(MODULE_COMPLETED_EVENT, onCompleted);
    return () => window.removeEventListener(MODULE_COMPLETED_EVENT, onCompleted);
  }, [isAlreadyCompleted, moduleNumber]);

  return (
    <ModuleNavigation
      moduleNumber={moduleNumber}
      isLastModule={isLastModule}
      moduleComplete={complete}
    />
  );
}
