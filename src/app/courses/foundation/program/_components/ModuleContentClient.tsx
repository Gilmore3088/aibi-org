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
import { KnowledgeCheck } from './KnowledgeCheck';
import { ModulePractice } from './ModulePractice';
import { ActivityCritique } from './ActivityCritique';
import {
  getKnowledgeCheck,
  getModulePracticeConfig,
  moduleHasCritique,
} from '@content/courses/foundation-program/interactive';

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
  const knowledgeCheck = getKnowledgeCheck(moduleNumber);
  const practiceConfig = getModulePracticeConfig(moduleNumber);
  // Critique panel is gated by the learner's textarea content. We let the
  // learner copy their submission into the critique area themselves so the
  // ActivitySection stays self-contained.
  const [critiqueDraft, setCritiqueDraft] = useState('');

  return (
    <>
      {knowledgeCheck && (
        <KnowledgeCheck prompt={knowledgeCheck.prompt} options={knowledgeCheck.options} />
      )}

      {practiceConfig && (
        <ModulePractice
          moduleNumber={moduleNumber}
          moduleTitle={`Module ${moduleNumber} practice`}
          systemPrompt={practiceConfig.systemPrompt}
          scenarios={practiceConfig.scenarios}
        />
      )}

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

      {activities.length > 0 && moduleHasCritique(moduleNumber) && (
        <div style={{ marginTop: 24 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 700,
              color: '#9A7A2F',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: 8,
            }}
          >
            Paste your response below to get AI critique
          </label>
          <textarea
            value={critiqueDraft}
            onChange={(e) => setCritiqueDraft(e.target.value)}
            placeholder="Paste your activity response here for a structured AI critique. The Apply submit above saves your work; this is optional feedback that doesn't affect completion."
            rows={4}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 16,
              fontFamily: 'inherit',
              border: '1px solid rgba(7,26,47,.12)',
              borderRadius: 12,
              resize: 'vertical',
              lineHeight: 1.6,
            }}
          />
          <ActivityCritique moduleNumber={moduleNumber} responseValue={critiqueDraft} />
        </div>
      )}

      {/* Activity-less module completion (e.g. M9) */}
      {hasNoActivities && !moduleComplete && (
        <div className="mt-8 pt-6 border-t border-[color:var(--ink-a10)]">
          <p className="text-base text-[color:var(--slate-600)] mb-4 leading-relaxed">
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
