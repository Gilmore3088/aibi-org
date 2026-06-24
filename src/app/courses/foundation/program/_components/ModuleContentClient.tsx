'use client';

// ModuleContentClient — top-level client wrapper for interactive module content.
// Owns moduleComplete state shared between ActivitySection (setter) and ModuleNavigation (reader).
// Rendered by the server ModulePage to bridge server-fetched data to client interactivity.
//
// Activity-less modules still need the same retrieval/transfer closeout as
// activity modules, so ModuleContentClient renders the shared handoff panel
// before calling save-progress.

import { useState, useCallback, useEffect } from 'react';
import type { Activity } from '@content/courses/foundation-program';
import {
  ActivitySection,
  ModuleHandoffCheck,
  readSaveProgressError,
} from './ActivitySection';
import { CompletionCTA } from './CompletionCTA';
import { ModuleNavigation } from './ModuleNavigation';

export interface ModuleContentClientProps {
  readonly activities: readonly Activity[];
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponses: Record<string, Record<string, string>>;
  readonly isLastModule: boolean;
  readonly isAlreadyCompleted: boolean;
}

export function ModuleContentClient({
  activities,
  enrollmentId,
  moduleNumber,
  existingResponses,
  isLastModule,
  isAlreadyCompleted,
}: ModuleContentClientProps) {
  const [moduleComplete, setModuleComplete] = useState(isAlreadyCompleted);
  const [saving, setSaving] = useState(false);
  const [handoffNote, setHandoffNote] = useState('');
  const [transferPlan, setTransferPlan] = useState('');
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [transferPlanError, setTransferPlanError] = useState<string | null>(null);
  const [saveProgressError, setSaveProgressError] = useState<string | null>(null);

  const handleAllActivitiesComplete = useCallback(() => {
    setModuleComplete(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setHandoffNote(window.localStorage.getItem(`foundation-module-handoff-${moduleNumber}`) ?? '');
    } catch {
      setHandoffNote('');
    }
  }, [moduleNumber]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setTransferPlan(window.localStorage.getItem(`foundation-transfer-plan-${moduleNumber}`) ?? '');
    } catch {
      setTransferPlan('');
    }
  }, [moduleNumber]);

  const handleHandoffNoteChange = useCallback((value: string) => {
    setHandoffNote(value);
    setHandoffError(null);
    setSaveProgressError(null);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`foundation-module-handoff-${moduleNumber}`, value);
    } catch {
      // Local persistence is helpful but not required to complete the module.
    }
    window.dispatchEvent(
      new CustomEvent('foundation-module-handoff-updated', {
        detail: { moduleNumber, value },
      }),
    );
  }, [moduleNumber]);

  const handleTransferPlanChange = useCallback((value: string) => {
    setTransferPlan(value);
    setTransferPlanError(null);
    setSaveProgressError(null);
    const ready = value.trim().length >= 12;
    if (typeof window === 'undefined') return;
    try {
      if (value.trim()) {
        window.localStorage.setItem(`foundation-transfer-plan-${moduleNumber}`, value);
      } else {
        window.localStorage.removeItem(`foundation-transfer-plan-${moduleNumber}`);
      }
    } catch {
      // Local persistence is helpful but not required to complete the module.
    }
    window.dispatchEvent(
      new CustomEvent('foundation-learning-signal-updated', {
        detail: { moduleNumber, signal: 'transfer-plan', active: ready, value },
      }),
    );
  }, [moduleNumber]);

  // For activity-less modules, still require a transfer/retrieval handoff.
  const handleMarkComplete = useCallback(async () => {
    const trimmedHandoffNote = handoffNote.trim();
    const trimmedTransferPlan = transferPlan.trim();
    if (trimmedHandoffNote.length < 12) {
      setHandoffError('Add one sentence about where this module will be used.');
      return;
    }
    if (trimmedTransferPlan.length < 12) {
      setTransferPlanError('Name the first realistic use before completing the module.');
      return;
    }

    setSaving(true);
    setSaveProgressError(null);
    try {
      const res = await fetch('/api/courses/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          moduleNumber,
          moduleHandoffNote: trimmedHandoffNote,
          moduleTransferPlan: trimmedTransferPlan,
        }),
      });
      if (!res.ok) {
        setSaveProgressError(await readSaveProgressError(res));
        return;
      }

      setModuleComplete(true);
      void import('@/lib/analytics/events').then((mod) =>
        mod.trackModuleCompleted({ moduleNumber }),
      );
    } catch {
      setSaveProgressError(
        'We could not save your module progress. Check your connection and try again.',
      );
    } finally {
      setSaving(false);
    }
  }, [enrollmentId, handoffNote, moduleNumber, transferPlan]);

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
          isAlreadyCompleted={isAlreadyCompleted}
          onAllActivitiesComplete={handleAllActivitiesComplete}
        />
      )}

      {hasNoActivities && !moduleComplete && (
        <ModuleHandoffCheck
          moduleNumber={moduleNumber}
          isLastModule={isLastModule}
          value={handoffNote}
          transferPlanValue={transferPlan}
          error={handoffError ?? undefined}
          transferPlanError={transferPlanError ?? undefined}
          saveError={saveProgressError ?? undefined}
          saving={saving}
          onChange={handleHandoffNoteChange}
          onTransferPlanChange={handleTransferPlanChange}
          onComplete={handleMarkComplete}
        />
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
