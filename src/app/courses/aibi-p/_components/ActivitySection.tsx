'use client';

// ActivitySection — client wrapper that manages activity submission state and gates
// the "Next Module" / "Complete Module" action behind all activity completions.
// Rendered inside the server ModulePage component.

import { useState, useCallback } from 'react';
import type { Activity } from '@content/courses/aibi-p';
import { ActivityForm } from './ActivityForm';
import { ActivityFormShell } from './ActivityFormShell';

export interface ActivitySectionProps {
  readonly activities: readonly Activity[];
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponses: Record<string, Record<string, string>>;
  readonly isLastModule: boolean;
  readonly onAllActivitiesComplete: () => void;
}

// Activities of these types are handled by specialized components (Plans 02-03).
// Render as shells until those plans are executed.
const SHELL_ONLY_TYPES = new Set(['drill', 'builder']);

export function ActivitySection({
  activities,
  enrollmentId,
  moduleNumber,
  existingResponses,
  isLastModule,
  onAllActivitiesComplete,
}: ActivitySectionProps) {
  // Track which activities have been submitted this session
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const activity of activities) {
      if (existingResponses[activity.id] != null) {
        initial.add(activity.id);
      }
    }
    return initial;
  });

  const [progressSaved, setProgressSaved] = useState(false);

  // Count submittable activities (shells are never submitted via this form)
  const submittableActivities = activities.filter((a) => !SHELL_ONLY_TYPES.has(a.type));
  const allSubmitted =
    submittableActivities.length > 0 &&
    submittableActivities.every((a) => submittedIds.has(a.id));

  const handleActivitySubmitted = useCallback(
    (activityId: string) => {
      setSubmittedIds((prev) => {
        const next = new Set(prev);
        next.add(activityId);
        return next;
      });
    },
    [],
  );

  const handleSaveProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/courses/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, moduleNumber }),
      });

      if (res.ok) {
        setProgressSaved(true);
        onAllActivitiesComplete();
      }
    } catch {
      // Silently fail — user can retry by clicking the button again
    }
  }, [enrollmentId, moduleNumber, onAllActivitiesComplete]);

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6">
        Activities
      </h2>

      {activities.map((activity) => {
        if (SHELL_ONLY_TYPES.has(activity.type)) {
          return <ActivityFormShell key={activity.id} activity={activity} />;
        }

        return (
          <ActivityForm
            key={activity.id}
            activity={activity}
            enrollmentId={enrollmentId}
            moduleNumber={moduleNumber}
            existingResponse={existingResponses[activity.id] ?? null}
            onSubmitSuccess={handleActivitySubmitted}
          />
        );
      })}

      {/* Progress save — only show when all submittable activities are done */}
      {allSubmitted && !progressSaved && (
        <div className="mt-6 pt-6 border-t border-[color:var(--color-parch-dark)]">
          <p className="text-sm font-sans text-[color:var(--color-dust)] mb-4">
            All activities complete. Mark this module as done to continue.
          </p>
          <button
            type="button"
            onClick={handleSaveProgress}
            className="px-6 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
          >
            {isLastModule ? 'Complete Course' : 'Complete Module'}
          </button>
        </div>
      )}
    </div>
  );
}
