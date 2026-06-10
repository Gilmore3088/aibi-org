'use client';

// ActivitySection — client wrapper that manages activity submission state and gates
// the "Next Module" / "Complete Module" action behind all activity completions.
// Routes each activity to its correct specialized component:
//   - Module 2, activity '2.1'  → ClaimReviewLab (spot the AI hallucination)
//   - Module 6, activity '6.1'  → SkillDiagnosis
//   - Module 7, activity '7.1'  → SkillBuilder (with learnerRole prop)
//   - type === 'iteration'       → IterationTracker (M8 Activity 8.1)
//   - type === 'drill'           → ClassificationDrill (extracts scenarios from m5-drill-scenarios table)
//   - type === 'builder' && moduleNumber === 5 → AcceptableUseCardForm
//   - everything else            → ActivityForm (free-text and generic form types)
// Rendered inside the server ModulePage component via ModuleContentClient.

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Activity, ContentTable } from '@content/courses/foundation-program';
import type { LearnerRole } from '@/types/course';
import { ActivityForm } from './ActivityForm';
import { CompletionCTA } from './CompletionCTA';

// Specialized activity widgets — each module renders at most one. Statically
// importing all six made the [module] route's First Load JS pay for all of
// them on every module page. next/dynamic splits each into its own chunk;
// SSR stays on so initial paint still includes the active widget.
const ClaimReviewLab = dynamic(
  () => import('./ClaimReviewLab').then((m) => ({ default: m.ClaimReviewLab })),
);
const ClassificationDrill = dynamic(
  () => import('./ClassificationDrill').then((m) => ({ default: m.ClassificationDrill })),
);
const AcceptableUseCardForm = dynamic(
  () => import('./AcceptableUseCardForm').then((m) => ({ default: m.AcceptableUseCardForm })),
);
const SkillDiagnosis = dynamic(
  () => import('./SkillDiagnosis').then((m) => ({ default: m.SkillDiagnosis })),
);
const SkillBuilder = dynamic(
  () => import('./SkillBuilder').then((m) => ({ default: m.SkillBuilder })),
);
const IterationTracker = dynamic(
  () => import('./IterationTracker').then((m) => ({ default: m.IterationTracker })),
);
const PromptWizard = dynamic(
  () => import('./PromptWizard').then((m) => ({ default: m.PromptWizard })),
);

export interface ActivitySectionProps {
  readonly activities: readonly Activity[];
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponses: Record<string, Record<string, string>>;
  readonly isLastModule: boolean;
  readonly onAllActivitiesComplete: () => void;
  readonly tables?: readonly ContentTable[];
  readonly learnerRole?: LearnerRole;
}

interface DrillScenario {
  readonly scenario: string;
  readonly tier: string;
  readonly reasoning: string;
}

function extractDrillScenarios(tables: readonly ContentTable[] | undefined): DrillScenario[] {
  const drillTable = tables?.find((t) => t.id === 'm5-drill-scenarios');
  if (!drillTable) return [];
  return drillTable.rows.map((row) => ({
    scenario: row['scenario'] ?? '',
    tier: row['tier'] ?? '',
    reasoning: row['reasoning'] ?? '',
  }));
}

export function ActivitySection({
  activities,
  enrollmentId,
  moduleNumber,
  existingResponses,
  isLastModule,
  onAllActivitiesComplete,
  tables,
  learnerRole = 'other',
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

  // All activities are now routable — no more shell-only types
  const allSubmitted =
    activities.length > 0 && activities.every((a) => submittedIds.has(a.id));

  const handleActivitySubmitted = useCallback((activityId: string) => {
    setSubmittedIds((prev) => {
      const next = new Set(prev);
      next.add(activityId);
      return next;
    });
  }, []);

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
        void import('@/lib/analytics/events').then((mod) =>
          mod.trackModuleCompleted({ moduleNumber }),
        );
      }
    } catch {
      // Silently fail — user can retry by clicking the button again
    }
  }, [enrollmentId, moduleNumber, onAllActivitiesComplete]);

  if (activities.length === 0) {
    return null;
  }

  const drillScenarios = extractDrillScenarios(tables);

  return (
    <div className="mt-8">
      <h2 className="font-sans text-2xl font-bold tracking-tight text-[color:var(--ink)] mb-6">
        Activities
      </h2>

      {activities.map((activity) => {
        const existing = existingResponses[activity.id] ?? null;

        // M6 Activity 6.1 — Skill Diagnosis
        if (moduleNumber === 6 && activity.id === '6.1') {
          return (
            <SkillDiagnosis
              key={activity.id}
              activity={activity}
              enrollmentId={enrollmentId}
              moduleNumber={moduleNumber}
              existingResponse={existing}
              onSubmitSuccess={handleActivitySubmitted}
            />
          );
        }

        // M7 Activity 7.1 — Skill Builder
        if (moduleNumber === 7 && activity.id === '7.1') {
          return (
            <SkillBuilder
              key={activity.id}
              activity={activity}
              enrollmentId={enrollmentId}
              moduleNumber={moduleNumber}
              existingResponse={existing}
              onSubmitSuccess={handleActivitySubmitted}
              learnerRole={learnerRole}
            />
          );
        }

        // M2 Activity 2.1 — Claim Review Lab (spot the AI hallucination)
        if (moduleNumber === 2 && activity.id === '2.1') {
          return (
            <ClaimReviewLab
              key={activity.id}
              activity={activity}
              enrollmentId={enrollmentId}
              moduleNumber={moduleNumber}
              existingResponse={existing}
              onSubmitSuccess={handleActivitySubmitted}
            />
          );
        }

        // M3 Activity 3.1 — Prompt Wizard (build a prompt that gets to the CORE)
        if (moduleNumber === 3 && activity.id === '3.1') {
          return (
            <PromptWizard
              key={activity.id}
              activity={activity}
              enrollmentId={enrollmentId}
              moduleNumber={moduleNumber}
              existingResponse={existing}
              onSubmitSuccess={handleActivitySubmitted}
            />
          );
        }

        // M8 Activity 8.1 — Iteration Tracker
        if (activity.type === 'iteration') {
          return (
            <IterationTracker
              key={activity.id}
              activity={activity}
              enrollmentId={enrollmentId}
              moduleNumber={moduleNumber}
              existingResponse={existing}
              onSubmitSuccess={handleActivitySubmitted}
            />
          );
        }

        // M5 Activity 5.1 — Classification Drill
        if (activity.type === 'drill') {
          // Drill scenarios must be present
          if (drillScenarios.length === 0) {
            return (
              <p key={activity.id} className="text-sm text-[color:var(--slate-500)]">
                Classification drill scenarios not available.
              </p>
            );
          }
          return (
            <ClassificationDrill
              key={activity.id}
              activity={activity}
              enrollmentId={enrollmentId}
              moduleNumber={moduleNumber}
              scenarios={drillScenarios}
              existingResponse={
                existing ? (existing as unknown as Record<string, unknown>) : null
              }
              onSubmitSuccess={handleActivitySubmitted}
            />
          );
        }

        // M5 Activity 5.2 — Acceptable Use Card Builder
        if (activity.type === 'builder' && moduleNumber === 5) {
          return (
            <AcceptableUseCardForm
              key={activity.id}
              activity={activity}
              enrollmentId={enrollmentId}
              moduleNumber={moduleNumber}
              existingResponse={existing}
              onSubmitSuccess={handleActivitySubmitted}
            />
          );
        }

        // All other activities (free-text, form, iteration) — generic ActivityForm
        return (
          <ActivityForm
            key={activity.id}
            activity={activity}
            enrollmentId={enrollmentId}
            moduleNumber={moduleNumber}
            existingResponse={existing}
            onSubmitSuccess={handleActivitySubmitted}
          />
        );
      })}

      {/* Progress save — only show when all activities are done */}
      {allSubmitted && !progressSaved && (
        <div className="mt-6 pt-6 border-t border-[color:var(--ink-a10)]">
          <p className="text-sm font-sans text-[color:var(--slate-600)] mb-4">
            All activities complete. Mark this module as done to continue.
          </p>
          <button
            type="button"
            onClick={handleSaveProgress}
            className="px-6 py-2.5 bg-[color:var(--ink)] hover:bg-[color:var(--ink-2)] text-[color:var(--cream)] text-[11px] font-sans font-bold uppercase tracking-widest rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2"
          >
            {isLastModule ? 'COMPLETE COURSE' : 'COMPLETE MODULE'}
          </button>
        </div>
      )}

      {/* CompletionCTA — shown after progress saved, contextual by module number */}
      {progressSaved && (
        <CompletionCTA moduleNumber={moduleNumber} isLastModule={isLastModule} />
      )}
    </div>
  );
}
