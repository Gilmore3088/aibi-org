'use client';

// ActivitySection — client wrapper that manages activity submission state and gates
// the "Next Module" / "Complete Module" action behind all activity completions.
// The 18-module course uses one consistent Build step: each activity renders
// through ActivityForm so every module ends in a compact packet/toolbox asset.
// Rendered inside the server ModulePage component via ModuleContentClient.

import { useState, useCallback, useEffect } from 'react';
import { getArtifactFirst, type Activity } from '@content/courses/foundation-program';
import { getFoundationLabBrief } from '@content/courses/foundation-program/lab-first';
import { ActivityForm } from './ActivityForm';
import { CompletionCTA } from './CompletionCTA';

export interface ActivitySectionProps {
  readonly activities: readonly Activity[];
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponses: Record<string, Record<string, string>>;
  readonly isLastModule: boolean;
  readonly isAlreadyCompleted: boolean;
  readonly onAllActivitiesComplete: () => void;
}

function getSavedTransferPlanFromResponses(
  responses: Record<string, Record<string, string>>,
): string {
  for (const response of Object.values(responses)) {
    const value = response.__learning_transfer_plan;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return '';
}

interface ModuleHandoffCheckProps {
  readonly moduleNumber: number;
  readonly isLastModule: boolean;
  readonly value: string;
  readonly transferPlanValue: string;
  readonly error?: string;
  readonly transferPlanError?: string;
  readonly saveError?: string;
  readonly saving?: boolean;
  readonly onChange: (value: string) => void;
  readonly onTransferPlanChange: (value: string) => void;
  readonly onComplete: () => void;
}

export function ModuleHandoffCheck({
  moduleNumber,
  isLastModule,
  value,
  transferPlanValue,
  error,
  transferPlanError,
  saveError,
  saving = false,
  onChange,
  onTransferPlanChange,
  onComplete,
}: ModuleHandoffCheckProps) {
  const handoffReady = value.trim().length >= 12;
  const transferReady = transferPlanValue.trim().length >= 12;
  const ready = handoffReady && transferReady && !saving;

  return (
    <section
      aria-labelledby={`module-${moduleNumber}-handoff-heading`}
      data-testid="foundation-module-handoff"
      className="foundation-module-handoff"
      style={{
        display: 'grid',
        gap: 14,
        marginTop: 24,
        paddingTop: 24,
        borderTop: '1px solid var(--ink-a10)',
      }}
    >
      <div
        className="foundation-module-handoff__panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.36fr) minmax(300px, 0.64fr)',
          gap: 0,
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 'clamp(18px, 2.4vw, 24px)',
            background: 'var(--cream)',
          }}
        >
          <p
            style={{
              margin: '0 0 8px',
              color: 'var(--gold-deep)',
              fontSize: 11,
              fontWeight: 850,
              letterSpacing: '0.17em',
              textTransform: 'uppercase',
            }}
          >
            Module handoff
          </p>
          <h3
            id={`module-${moduleNumber}-handoff-heading`}
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontSize: 'clamp(20px, 1.8vw, 25px)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Ready to advance?
          </h3>
          <p
            style={{
              margin: '10px 0 0',
              color: 'var(--slate-600)',
              fontSize: 14,
              lineHeight: 1.5,
              fontWeight: 650,
            }}
          >
            Confirm the saved note and first real use, then move to the next small win.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 12,
            padding: 'clamp(18px, 2.4vw, 24px)',
            borderLeft: '1px solid var(--ink-a10)',
          }}
        >
          <label style={{ display: 'block' }}>
            <span
              style={{
                display: 'block',
                marginBottom: 6,
                color: error ? 'var(--ink)' : 'var(--slate-500)',
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              My handoff note
            </span>
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              rows={2}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `module-${moduleNumber}-handoff-error` : undefined}
              placeholder="Example: I will reuse this artifact on the next branch update and keep the review note with the packet."
              style={{
                width: '100%',
                resize: 'vertical',
                border: `1px solid ${error ? 'var(--ink)' : 'var(--ink-a10)'}`,
                borderRadius: 12,
                background: '#fff',
                padding: '11px 12px',
                color: 'var(--ink)',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 14,
                lineHeight: 1.45,
                outlineColor: 'var(--gold-deep)',
              }}
            />
          </label>
          {error && (
            <p
              id={`module-${moduleNumber}-handoff-error`}
              role="alert"
              style={{
                margin: '-4px 0 0',
                color: 'var(--ink)',
                fontSize: 12,
                lineHeight: 1.35,
                fontWeight: 760,
              }}
            >
              {error}
            </p>
          )}

          <label style={{ display: 'block' }}>
            <span
              style={{
                display: 'block',
                marginBottom: 6,
                color: transferPlanError ? 'var(--ink)' : 'var(--slate-500)',
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Next real use
            </span>
            <textarea
              value={transferPlanValue}
              onChange={(event) => onTransferPlanChange(event.target.value)}
              rows={2}
              aria-invalid={Boolean(transferPlanError)}
              aria-describedby={transferPlanError ? `module-${moduleNumber}-transfer-error` : undefined}
              placeholder="Example: I will use this on the next branch rollout email before manager review."
              style={{
                width: '100%',
                resize: 'vertical',
                border: `1px solid ${transferPlanError ? 'var(--ink)' : 'var(--ink-a10)'}`,
                borderRadius: 12,
                background: '#fff',
                padding: '11px 12px',
                color: 'var(--ink)',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 14,
                lineHeight: 1.45,
                outlineColor: 'var(--gold-deep)',
              }}
            />
          </label>
          {transferPlanError && (
            <p
              id={`module-${moduleNumber}-transfer-error`}
              role="alert"
              style={{
                margin: '-4px 0 0',
                color: 'var(--ink)',
                fontSize: 12,
                lineHeight: 1.35,
                fontWeight: 760,
              }}
            >
              {transferPlanError}
            </p>
          )}

          <button
            type="button"
            onClick={onComplete}
            disabled={!ready}
            style={{
              minHeight: 44,
              justifySelf: 'start',
              border: '1px solid',
              borderColor: ready ? 'var(--ink)' : 'var(--ink-a10)',
              borderRadius: 12,
              background: ready ? 'var(--ink)' : 'var(--slate-100)',
              color: ready ? 'var(--cream)' : 'var(--slate-500)',
              padding: '0 18px',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 850,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: ready ? 'pointer' : 'not-allowed',
            }}
          >
            {saving
              ? 'Saving...'
              : ready
                ? isLastModule ? 'Complete course' : 'Complete module'
                : 'Add review + transfer'}
          </button>
          {saveError && (
            <p
              role="alert"
              style={{
                margin: 0,
                maxWidth: 540,
                color: 'var(--ink)',
                fontSize: 13,
                lineHeight: 1.45,
                fontWeight: 760,
              }}
            >
              {saveError}
            </p>
          )}
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 780px) {
              .foundation-module-handoff__panel,
              .foundation-module-handoff__checks {
                grid-template-columns: 1fr !important;
              }
              .foundation-module-handoff__panel > div:last-child {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10) !important;
              }
              .foundation-module-handoff button {
                width: 100% !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}

export async function readSaveProgressError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === 'string' && body.error.trim().length > 0) {
      return body.error;
    }
  } catch {
    // The status code is enough to show the learner a retryable save failure.
  }
  return 'We could not save your module progress. Please try again.';
}

export function ActivitySection({
  activities,
  enrollmentId,
  moduleNumber,
  existingResponses,
  isLastModule,
  isAlreadyCompleted,
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

  const [progressSaved, setProgressSaved] = useState(isAlreadyCompleted);
  const [savingProgress, setSavingProgress] = useState(false);
  const [saveProgressError, setSaveProgressError] = useState<string | null>(null);
  const [hasLabDraft, setHasLabDraft] = useState(false);
  const [handoffNote, setHandoffNote] = useState('');
  const [transferPlan, setTransferPlan] = useState('');
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [transferPlanError, setTransferPlanError] = useState<string | null>(null);

  useEffect(() => {
    const moduleId = `aibi-p-module-${moduleNumber}`;
    const storageKey = `foundation-lab-draft-${moduleId}`;

    function readDraft() {
      try {
        setHasLabDraft(Boolean(localStorage.getItem(storageKey)));
      } catch {
        setHasLabDraft(false);
      }
    }

    function handleDraftUpdate(event: Event) {
      const custom = event as CustomEvent<unknown>;
      const detail = custom.detail as { moduleId?: unknown } | undefined;
      if (!detail || detail.moduleId === moduleId) {
        readDraft();
      }
    }

    readDraft();
    window.addEventListener('foundation-lab-draft-updated', handleDraftUpdate);
    window.addEventListener('storage', readDraft);
    return () => {
      window.removeEventListener('foundation-lab-draft-updated', handleDraftUpdate);
      window.removeEventListener('storage', readDraft);
    };
  }, [moduleNumber]);

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
    const savedResponsePlan = getSavedTransferPlanFromResponses(existingResponses);
    try {
      const stored = window.localStorage.getItem(`foundation-transfer-plan-${moduleNumber}`);
      const nextValue = stored ?? savedResponsePlan;
      setTransferPlan(nextValue);
      if (!stored && savedResponsePlan) {
        window.localStorage.setItem(`foundation-transfer-plan-${moduleNumber}`, savedResponsePlan);
        window.dispatchEvent(
          new CustomEvent('foundation-learning-signal-updated', {
            detail: {
              moduleNumber,
              signal: 'transfer-plan',
              active: savedResponsePlan.trim().length >= 12,
              value: savedResponsePlan,
            },
          }),
        );
      }
    } catch {
      setTransferPlan(savedResponsePlan);
    }
  }, [existingResponses, moduleNumber]);

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

  const handleSaveProgress = useCallback(async () => {
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

    setSavingProgress(true);
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

      setProgressSaved(true);
      onAllActivitiesComplete();
      void import('@/lib/analytics/events').then((mod) =>
        mod.trackModuleCompleted({ moduleNumber }),
      );
    } catch {
      setSaveProgressError(
        'We could not save your module progress. Check your connection and try again.',
      );
    } finally {
      setSavingProgress(false);
    }
  }, [enrollmentId, handoffNote, moduleNumber, onAllActivitiesComplete, transferPlan]);

  if (activities.length === 0) {
    return null;
  }

  const artifactMeta = getArtifactFirst(moduleNumber);
  const labBrief = getFoundationLabBrief(moduleNumber);
  const activityCountLabel = `${activities.length} ${activities.length === 1 ? 'artifact step' : 'artifact steps'}`;
  const artifactTarget = artifactMeta?.saved ?? 'Module artifact';
  const proofTarget = labBrief?.qualitySignals[0] ?? artifactMeta?.mustProve ?? 'Evidence of human review';

  return (
    <section className="mt-8" aria-labelledby={`module-${moduleNumber}-submit-heading`}>
      <div
        className="foundation-submit-brief"
        style={{
          border: '1px solid var(--ink-a10)',
          borderRadius: 14,
          background: '#fff',
          marginBottom: 12,
          padding: '12px 14px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 12,
            alignItems: 'center',
          }}
          className="foundation-submit-brief__grid"
        >
          <div style={{ minWidth: 0 }}>
            <h2
              id={`module-${moduleNumber}-submit-heading`}
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontSize: 'clamp(16px, 1.5vw, 19px)',
                lineHeight: 1.2,
                letterSpacing: '-0.015em',
                fontWeight: 850,
              }}
            >
              Build {artifactTarget}
            </h2>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
            className="foundation-submit-brief__side"
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 30,
                borderRadius: 999,
                background: hasLabDraft ? 'var(--ink)' : 'var(--cream)',
                color: hasLabDraft ? '#fff' : 'var(--ink)',
                padding: '0 10px',
                fontSize: 11,
                fontWeight: 850,
              }}
            >
              Lab: {hasLabDraft ? 'ready' : 'use sample data'}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 30,
                borderRadius: 999,
                background: 'var(--cream)',
                color: 'var(--ink)',
                padding: '0 10px',
                fontSize: 11,
                fontWeight: 850,
              }}
            >
              {activityCountLabel}
            </span>
            {!hasLabDraft && (
              <a
                href="#st-sandbox"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 30,
                  color: 'var(--ink)',
                  fontSize: 11,
                  fontWeight: 850,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Open lab
              </a>
            )}
            <span
              style={{
                maxWidth: 260,
                color: 'var(--slate-600)',
                fontSize: 12,
                lineHeight: 1.3,
                fontWeight: 760,
              }}
            >
              Proof: {proofTarget}
            </span>
          </div>
        </div>
      </div>

      {activities.map((activity) => {
        const existing = existingResponses[activity.id] ?? null;

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
        <ModuleHandoffCheck
          moduleNumber={moduleNumber}
          isLastModule={isLastModule}
          value={handoffNote}
          transferPlanValue={transferPlan}
          error={handoffError ?? undefined}
          transferPlanError={transferPlanError ?? undefined}
          saveError={saveProgressError ?? undefined}
          saving={savingProgress}
          onChange={handleHandoffNoteChange}
          onTransferPlanChange={handleTransferPlanChange}
          onComplete={handleSaveProgress}
        />
      )}

      {/* CompletionCTA — shown after progress saved, contextual by module number */}
      {progressSaved && (
        <CompletionCTA moduleNumber={moduleNumber} isLastModule={isLastModule} />
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 780px) {
              .foundation-submit-brief {
                border-radius: 16px !important;
              }
              .foundation-submit-brief__grid {
                grid-template-columns: 1fr !important;
              }
              .foundation-submit-brief__side {
                justify-items: start !important;
                align-content: start !important;
                border-left: none !important;
                border-top: 1px solid var(--ink-a10) !important;
                padding-left: 0 !important;
                padding-top: 12px !important;
              }
              .foundation-submit-brief__side p {
                text-align: left !important;
                max-width: none !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}
