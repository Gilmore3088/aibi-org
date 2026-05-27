'use client';

// ModuleContentClient — top-level client wrapper for interactive module content.
// Owns moduleComplete state shared between ActivitySection (setter) and ModuleNavigation (reader).
// Rendered by the server ModulePage to bridge server-fetched data to client interactivity.
//
// Activity-less modules (e.g. M9): ActivitySection returns null for empty activity arrays,
// so a "Mark Module Complete" button is rendered here directly, calling save-progress.
// This prevents learners from being stuck on modules with no activities.

import { useState, useCallback } from 'react';
import type { Activity, ContentTable } from '@content/courses/foundation-program';
import type { LearnerRole } from '@/types/course';
import { ActivitySection } from './ActivitySection';
import { CompletionCTA } from './CompletionCTA';
import { ModuleNavigation } from './ModuleNavigation';

export interface ModuleContentClientProps {
  readonly activities: readonly Activity[];
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponses: Record<string, Record<string, string>>;
  readonly isLastModule: boolean;
  readonly isAlreadyCompleted: boolean;
  readonly tables?: readonly ContentTable[];
  readonly learnerRole?: LearnerRole;
}

export function ModuleContentClient({
  activities,
  enrollmentId,
  moduleNumber,
  existingResponses,
  isLastModule,
  isAlreadyCompleted,
  tables,
  learnerRole,
}: ModuleContentClientProps) {
  const [moduleComplete, setModuleComplete] = useState(isAlreadyCompleted);
  const [saving, setSaving] = useState(false);

  const handleAllActivitiesComplete = useCallback(() => {
    setModuleComplete(true);
  }, []);

  // For activity-less modules, provide a direct "Mark Complete" button
  const handleMarkComplete = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/courses/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, moduleNumber }),
      });
      if (res.ok) {
        setModuleComplete(true);
        void import('@/lib/analytics/events').then((mod) =>
          mod.trackModuleCompleted({ moduleNumber }),
        );
      }
    } catch {
      // Silently fail — user can retry by clicking the button again
    } finally {
      setSaving(false);
    }
  }, [enrollmentId, moduleNumber]);

  const hasNoActivities = activities.length === 0;

  return (
    <>
      {activities.length > 0 && (
        <ActivitySection
          activities={activities}
          enrollmentId={enrollmentId}
          moduleNumber={moduleNumber}
          existingResponses={existingResponses}
          isLastModule={isLastModule}
          onAllActivitiesComplete={handleAllActivitiesComplete}
          tables={tables}
          learnerRole={learnerRole}
        />
      )}

      {/* Activity-less module completion (e.g. M9) */}
      {hasNoActivities && !moduleComplete && (
        <div className="mt-8 pt-6 border-t border-[color:var(--ink-a10)]">
          <p className="text-sm text-[color:var(--slate-600)] mb-4 leading-relaxed">
            You have reviewed all content in this module. Mark it complete to continue.
          </p>
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={saving}
            className="px-6 py-2.5 bg-[color:var(--ink)] hover:bg-[color:var(--ink-2)] disabled:bg-[color:var(--slate-200)] disabled:text-[color:var(--slate-500)] text-[color:var(--cream)] text-[11px] font-semibold uppercase tracking-[0.16em] rounded-xl transition-colors disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--cream)]"
          >
            {saving ? 'SAVING…' : isLastModule ? 'COMPLETE COURSE' : 'MARK MODULE COMPLETE'}
          </button>
        </div>
      )}

      {/* CompletionCTA for activity-less modules after marking complete */}
      {hasNoActivities && moduleComplete && (
        <CompletionCTA moduleNumber={moduleNumber} isLastModule={isLastModule} />
      )}

      <ModuleNavigation
        moduleNumber={moduleNumber}
        isLastModule={isLastModule}
        moduleComplete={moduleComplete}
      />
    </>
  );
}
