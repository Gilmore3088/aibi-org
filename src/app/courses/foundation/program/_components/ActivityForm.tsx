'use client';

// ActivityForm — interactive activity form for enrolled learners.
// Submits free-text / form-type activities to /api/courses/submit-activity.
// Field renderers live in ActivityFields.tsx; download in ArtifactDownload.tsx.
//
// A11Y-01: focus managed to success region on submit.
// A11Y-02: text error messages with "Error:" prefix (not color-only).
// A11Y-05: artifact download uses a plain <a href download> anchor.

import React, { useState, useCallback, useRef, useEffect, type CSSProperties } from 'react';
import { getArtifactFirst, type Activity } from '@content/courses/foundation-program';
import { getFoundationLabBrief } from '@content/courses/foundation-program/lab-first';
import { ActivityWorkspace } from '@/components/lms';
import {
  getInitialActivityValues,
  validateActivityFields,
} from '../_lib/activityFormHelpers';
import { ActivityReadOnlyField, ActivityInteractiveField } from './ActivityFields';
import { ArtifactDownload } from './ArtifactDownload';
import { PromptWizard } from './PromptWizard';
import { StrategyDrill } from './StrategyDrill';
import {
  ArtifactEvidenceRubric,
  ArtifactReadinessCheck,
  PacketSaveStatusCard,
  readinessOptions,
  TransferNoteCard,
  ToolboxSaveStatusCard,
  getInitialReadiness,
  type ToolboxSaveStatus,
} from './activity-form/ActivityEvidence';

export interface ActivityFormProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  submitting: boolean;
  submitted: boolean;
  serverError: string | null;
}

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: '0.75rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 700,
  padding: '12px 20px',
  borderRadius: 12,
  cursor: 'pointer',
  border: 'none',
  background: 'var(--ink)',
  color: 'var(--cream)',
  transition: 'background var(--t-fast) var(--ease)',
};

const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: 'var(--slate-200)',
  color: 'var(--slate-500)',
  cursor: 'not-allowed',
};

function getInitialTransferPlan(existingResponse?: Record<string, string> | null): string {
  return existingResponse?.__learning_transfer_plan ?? '';
}

function JudgmentCheckpoint({
  moduleNumber,
  activityId,
  value,
  error,
  onChange,
}: {
  readonly moduleNumber: number;
  readonly activityId: string;
  readonly value: string;
  readonly error?: string;
  readonly onChange: (value: string) => void;
}) {
  const artifactMeta = getArtifactFirst(moduleNumber);
  const labBrief = getFoundationLabBrief(moduleNumber);
  const reviewHint =
    labBrief?.learningLoop.feedbackCue ??
    labBrief?.reviewChecklist[0] ??
    artifactMeta?.mustProve ??
    'Name the edit or judgment you made.';

  return (
    <section
      className="foundation-judgment-checkpoint"
      style={{
        display: 'grid',
        gap: 9,
        paddingTop: 16,
        borderTop: '1px solid var(--ink-a10)',
      }}
    >
      <div className="foundation-judgment-checkpoint__header">
        <div>
          <p
            style={{
              margin: 0,
              color: 'var(--gold-deep)',
              fontSize: '0.625rem',
              fontWeight: 850,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Review note
          </p>
        </div>
        <p
          style={{
            margin: 0,
            color: 'var(--slate-500)',
            fontSize: '0.75rem',
            lineHeight: 1.3,
            fontWeight: 750,
            textAlign: 'right',
            maxWidth: 320,
          }}
        >
          {reviewHint}
        </p>
      </div>

      <label style={{ display: 'block' }}>
        <span
          style={{
            display: 'block',
            marginBottom: 6,
            color: error ? 'var(--ink)' : 'var(--slate-500)',
            fontSize: '0.625rem',
            fontWeight: 850,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Review note
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `judgment-checkpoint-${activityId}-error` : undefined}
          placeholder="Example: I removed customer details, kept the action and deadline, and verified the draft is only for internal manager review."
          style={{
            width: '100%',
            resize: 'vertical',
            border: `1px solid ${error ? 'var(--ink)' : 'var(--ink-a10)'}`,
            borderRadius: 12,
            background: '#fff',
            padding: '11px 12px',
            color: 'var(--ink)',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '0.875rem',
            lineHeight: 1.45,
            outlineColor: 'var(--gold-deep)',
          }}
        />
      </label>
      {error && (
        <p
          id={`judgment-checkpoint-${activityId}-error`}
          role="alert"
          style={{
            margin: '-2px 0 0',
            color: 'var(--ink)',
            fontSize: '0.75rem',
            lineHeight: 1.35,
            fontWeight: 760,
          }}
        >
          {error}
        </p>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .foundation-judgment-checkpoint__header {
              display: grid;
              grid-template-columns: minmax(0, 1fr) auto;
              gap: 12px;
              align-items: start;
            }
            @media (max-width: 700px) {
              .foundation-judgment-checkpoint {
                padding-top: 14px !important;
              }
              .foundation-judgment-checkpoint__header {
                grid-template-columns: 1fr !important;
              }
              .foundation-judgment-checkpoint__header p:last-child {
                max-width: none !important;
                text-align: left !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}
function SavedJudgmentNote({
  note,
  readiness,
}: {
  readonly note: string;
  readonly readiness: (typeof readinessOptions)[number]['id'];
}) {
  const option = readinessOptions.find((item) => item.id === readiness) ?? readinessOptions[1];

  return (
    <section
      aria-label="Saved judgment note"
      style={{
        display: 'grid',
        gap: 8,
        padding: 14,
        border: '1px solid var(--ink-a10)',
        borderRadius: 14,
        background: 'var(--cream)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <p
          style={{
            margin: 0,
            color: 'var(--gold-deep)',
            fontSize: '0.625rem',
            fontWeight: 850,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Judgment saved
        </p>
        <span
          style={{
            border: '1px solid var(--ink-a10)',
            borderRadius: 999,
            background: '#fff',
            padding: '5px 10px',
            color: 'var(--ink)',
            fontSize: '0.625rem',
            fontWeight: 850,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {option.label}
        </span>
      </div>
      <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 700 }}>
        {note}
      </p>
    </section>
  );
}

function TransferPlanCheckpoint({
  moduleNumber,
  activityId,
  value,
  error,
  onChange,
}: {
  readonly moduleNumber: number;
  readonly activityId: string;
  readonly value: string;
  readonly error?: string;
  readonly onChange: (value: string) => void;
}) {
  const artifactMeta = getArtifactFirst(moduleNumber);
  const labBrief = getFoundationLabBrief(moduleNumber);
  const transferHint =
    labBrief?.learningLoop.transferPrompt ??
    artifactMeta?.mustProve ??
    'Name one real work item where this artifact belongs.';

  return (
    <section
      className="foundation-transfer-plan"
      style={{
        display: 'grid',
        gap: 9,
        paddingTop: 16,
        borderTop: '1px solid var(--ink-a10)',
      }}
    >
      <div className="foundation-transfer-plan__header">
        <div>
          <p
            style={{
              margin: 0,
              color: 'var(--gold-deep)',
              fontSize: '0.625rem',
              fontWeight: 850,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            First real use
          </p>
        </div>
        <p
          style={{
            margin: 0,
            color: 'var(--slate-500)',
            fontSize: '0.75rem',
            lineHeight: 1.3,
            fontWeight: 750,
            textAlign: 'right',
            maxWidth: 320,
          }}
        >
          {transferHint}
        </p>
      </div>

      <label style={{ display: 'block' }}>
        <span
          style={{
            display: 'block',
            marginBottom: 6,
            color: error ? 'var(--ink)' : 'var(--slate-500)',
            fontSize: '0.625rem',
            fontWeight: 850,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          First real use
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `transfer-plan-${activityId}-error` : undefined}
          placeholder="Example: I will use this on the branch rollout email before sending it to my manager."
          style={{
            width: '100%',
            resize: 'vertical',
            border: `1px solid ${error ? 'var(--ink)' : 'var(--ink-a10)'}`,
            borderRadius: 12,
            background: '#fff',
            padding: '11px 12px',
            color: 'var(--ink)',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '0.875rem',
            lineHeight: 1.45,
            outlineColor: 'var(--gold-deep)',
          }}
        />
      </label>
      {error && (
        <p
          id={`transfer-plan-${activityId}-error`}
          role="alert"
          style={{
            margin: '-2px 0 0',
            color: 'var(--ink)',
            fontSize: '0.75rem',
            lineHeight: 1.35,
            fontWeight: 760,
          }}
        >
          {error}
        </p>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .foundation-transfer-plan__header {
              display: grid;
              grid-template-columns: minmax(0, 1fr) auto;
              gap: 12px;
              align-items: start;
            }
            @media (max-width: 700px) {
              .foundation-transfer-plan {
                padding-top: 14px !important;
              }
              .foundation-transfer-plan__header {
                grid-template-columns: 1fr !important;
              }
              .foundation-transfer-plan__header p:last-child {
                max-width: none !important;
                text-align: left !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}

export function ActivityForm(props: ActivityFormProps) {
  if (props.moduleNumber === 3 && props.activity.type === 'drill') {
    return (
      <StrategyDrill
        activity={props.activity}
        enrollmentId={props.enrollmentId}
        moduleNumber={props.moduleNumber}
        existingResponse={props.existingResponse}
        onSubmitSuccess={props.onSubmitSuccess}
      />
    );
  }

  if (props.moduleNumber === 3 && props.activity.type === 'builder') {
    return (
      <PromptWizard
        activity={props.activity}
        enrollmentId={props.enrollmentId}
        moduleNumber={props.moduleNumber}
        existingResponse={props.existingResponse}
        onSubmitSuccess={props.onSubmitSuccess}
      />
    );
  }

  return <StandardActivityForm {...props} />;
}

function StandardActivityForm({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: ActivityFormProps) {
  const isReadOnly = existingResponse != null;

  const [state, setState] = useState<FormState>({
    values: getInitialActivityValues(activity.fields, existingResponse),
    errors: {},
    submitting: false,
    submitted: isReadOnly,
    serverError: null,
  });
  const transferStorageKey = `foundation-transfer-note-${moduleNumber}-${activity.id}`;
  const [transferNote, setTransferNote] = useState('');
  const [judgmentNote, setJudgmentNote] = useState(existingResponse?.__learning_judgment_note ?? '');
  const [judgmentError, setJudgmentError] = useState<string | null>(null);
  const [transferPlan, setTransferPlan] = useState(() => getInitialTransferPlan(existingResponse));
  const [transferPlanError, setTransferPlanError] = useState<string | null>(null);
  const [toolboxSaveStatus, setToolboxSaveStatus] = useState<ToolboxSaveStatus>('idle');
  const [readiness, setReadiness] = useState<(typeof readinessOptions)[number]['id']>(() =>
    getInitialReadiness(existingResponse),
  );

  // A11Y-01: Move focus to success region after submission so keyboard/SR users know outcome
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.submitted && !isReadOnly && successRef.current) {
      successRef.current.focus();
    }
  }, [state.submitted, isReadOnly]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existingJudgmentNote = existingResponse?.__learning_judgment_note;
    const existingTransferPlan = existingResponse?.__learning_transfer_plan;
    try {
      if (existingJudgmentNote?.trim()) {
        window.localStorage.setItem(`foundation-module-handoff-${moduleNumber}`, existingJudgmentNote);
        window.dispatchEvent(
          new CustomEvent('foundation-module-handoff-updated', {
            detail: { moduleNumber, value: existingJudgmentNote },
          }),
        );
      }
      if (existingTransferPlan?.trim()) {
        window.localStorage.setItem(`foundation-transfer-plan-${moduleNumber}`, existingTransferPlan);
        window.dispatchEvent(
          new CustomEvent('foundation-learning-signal-updated', {
            detail: {
              moduleNumber,
              signal: 'transfer-plan',
              active: existingTransferPlan.trim().length >= 12,
              value: existingTransferPlan,
            },
          }),
        );
      }
    } catch {
      // Existing response hydration is only a local evidence cue.
    }
  }, [existingResponse, moduleNumber]);

  useEffect(() => {
    if (!state.submitted || typeof window === 'undefined') return;
    try {
      setTransferNote(window.localStorage.getItem(transferStorageKey) ?? transferPlan);
    } catch {
      setTransferNote(transferPlan);
    }
  }, [state.submitted, transferPlan, transferStorageKey]);

  const handleChange = useCallback((fieldId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [fieldId]: value },
      errors: { ...prev.errors, [fieldId]: '' },
      serverError: null,
    }));
  }, []);

  const handleJudgmentNoteChange = useCallback((value: string) => {
    setJudgmentNote(value);
    setJudgmentError(null);
    if (typeof window === 'undefined') return;
    try {
      if (value.trim()) {
        window.localStorage.setItem(`foundation-module-handoff-${moduleNumber}`, value);
      } else {
        window.localStorage.removeItem(`foundation-module-handoff-${moduleNumber}`);
      }
    } catch {
      // Local persistence is helpful but not required to save the artifact.
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
    const ready = value.trim().length >= 12;
    if (typeof window === 'undefined') return;
    try {
      if (value.trim()) {
        window.localStorage.setItem(`foundation-transfer-plan-${moduleNumber}`, value);
      } else {
        window.localStorage.removeItem(`foundation-transfer-plan-${moduleNumber}`);
      }
    } catch {
      // Local persistence is helpful but not required to save the artifact.
    }
    window.dispatchEvent(
      new CustomEvent('foundation-learning-signal-updated', {
        detail: { moduleNumber, signal: 'transfer-plan', active: ready, value },
      }),
    );
  }, [moduleNumber]);

  const handleTransferNoteChange = useCallback((value: string) => {
    setTransferNote(value);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(transferStorageKey, value);
    } catch {
      // Local persistence is helpful but not required to complete the activity.
    }
  }, [transferStorageKey]);

  const saveCourseArtifactToToolbox = useCallback(
    async ({
      values,
      reviewNote,
      nextUse,
    }: {
      readonly values: Record<string, string>;
      readonly reviewNote: string;
      readonly nextUse: string;
    }) => {
      setToolboxSaveStatus('saving');
      try {
        const artifactName = activity.title.replace(/^(Build|Save):\s*/i, '').trim() || activity.title;
        const fields = activity.fields.map((field) => ({
          id: field.id,
          label: field.label.replace(/\*$/, '').trim(),
          value: values[field.id] ?? '',
        }));
        const res = await fetch('/api/toolbox/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: 'course',
            payload: {
              kind: 'module-artifact',
              courseSlug: 'aibi-p',
              moduleNumber,
              activityId: activity.id,
              artifactName,
              fields,
              reviewNote,
              transferPlan: nextUse,
              readiness,
            },
          }),
        });

        if (res.ok) {
          setToolboxSaveStatus('saved');
          return;
        }

        if (res.status === 403 || res.status === 503) {
          setToolboxSaveStatus('unavailable');
          return;
        }

        setToolboxSaveStatus('error');
      } catch {
        setToolboxSaveStatus('error');
      }
    },
    [activity.fields, activity.id, activity.title, moduleNumber, readiness],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateActivityFields(activity.fields, state.values);
      const trimmedJudgmentNote = judgmentNote.trim();
      const trimmedTransferPlan = transferPlan.trim();
      if (Object.keys(errors).length > 0) {
        setState((prev) => ({ ...prev, errors }));
        return;
      }
      if (trimmedJudgmentNote.length < 20) {
        setJudgmentError('Add a short review note before saving the artifact.');
        return;
      }
      if (trimmedTransferPlan.length < 12) {
        setTransferPlanError('Name the first realistic use before saving the artifact.');
        return;
      }

      setState((prev) => ({ ...prev, submitting: true, serverError: null }));

      try {
        const response = {
          ...state.values,
          __artifact_readiness: readiness,
          __learning_judgment_note: trimmedJudgmentNote,
          __learning_transfer_plan: trimmedTransferPlan,
        };
        const res = await fetch('/api/courses/submit-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId,
            moduleNumber,
            activityId: activity.id,
            response,
          }),
        });

        if (res.ok) {
          setTransferNote(trimmedTransferPlan);
          setState((prev) => ({ ...prev, submitting: false, submitted: true, errors: {} }));
          onSubmitSuccess?.(activity.id);
          void saveCourseArtifactToToolbox({
            values: state.values,
            reviewNote: trimmedJudgmentNote,
            nextUse: trimmedTransferPlan,
          });
          return;
        }

        const data = (await res.json()) as { error?: string; fieldErrors?: Record<string, string> };

        if (res.status === 409) {
          setState((prev) => ({ ...prev, submitting: false, submitted: true }));
          onSubmitSuccess?.(activity.id);
          return;
        }

        if (res.status === 400 && data.fieldErrors) {
          setState((prev) => ({
            ...prev,
            submitting: false,
            errors: data.fieldErrors ?? {},
          }));
          return;
        }

        if (res.status === 401 || res.status === 403) {
          setState((prev) => ({
            ...prev,
            submitting: false,
            serverError: 'Your session has expired. Please refresh the page and try again.',
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          submitting: false,
          serverError: data.error ?? 'Submission failed. Please try again.',
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          submitting: false,
          serverError: 'Network error. Please check your connection and try again.',
        }));
      }
    },
    [
      activity.fields,
      activity.id,
      enrollmentId,
      judgmentNote,
      moduleNumber,
      onSubmitSuccess,
      readiness,
      saveCourseArtifactToToolbox,
      state.values,
      transferPlan,
    ],
  );

  const showArtifactDownload =
    state.submitted &&
    activity.completionTrigger === 'artifact-download' &&
    activity.artifactId;
  const requiredFields = activity.fields.filter((field) => field.required);
  const requiredCount = requiredFields.length;
  const answeredCount = requiredFields.filter((field) => (state.values[field.id] ?? '').trim().length > 0).length;

  return (
    <ActivityWorkspace
      activityId={activity.id}
      title={activity.title}
      lead={activity.description}
      submitted={state.submitted}
      hideModelPicker
    >
      <ArtifactEvidenceRubric
        moduleNumber={moduleNumber}
        answeredCount={answeredCount}
        requiredCount={requiredCount}
        submitted={state.submitted}
      />

      {state.submitted ? (
        <div
          ref={successRef}
          tabIndex={-1}
          aria-live="polite"
          aria-label="Activity submitted successfully"
          style={{ display: 'grid', gap: 14 }}
        >
          {activity.fields.map((field) => (
            <ActivityReadOnlyField key={field.id} field={field} value={state.values[field.id] ?? ''} />
          ))}
          {judgmentNote.trim() && (
            <SavedJudgmentNote note={judgmentNote.trim()} readiness={readiness} />
          )}
          <PacketSaveStatusCard />
          <ToolboxSaveStatusCard status={toolboxSaveStatus} />
          <TransferNoteCard
            activityId={activity.id}
            note={transferNote}
            statusLabel="Saved with artifact"
            onChange={handleTransferNoteChange}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gap: 14 }}>
            {activity.fields.map((field) => (
              <ActivityInteractiveField
                key={field.id}
                field={field}
                value={state.values[field.id] ?? ''}
                error={state.errors[field.id]}
                onChange={handleChange}
              />
            ))}
          </div>

          <section
            aria-label="Save evidence for this artifact"
            className="foundation-save-evidence-panel"
            style={{
              display: 'grid',
              gap: 16,
              marginTop: 18,
              padding: 16,
              border: '1px solid var(--ink-a10)',
              borderRadius: 16,
              background: 'var(--cream-2)',
            }}
          >
            <div
              className="foundation-save-evidence-panel__header"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: 12,
                alignItems: 'start',
              }}
            >
              <div>
                <p
                  style={{
                    margin: '0 0 5px',
                    color: 'var(--gold-deep)',
                    fontSize: '0.625rem',
                    fontWeight: 850,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  Save evidence
                </p>
                <h3
                  style={{
                    margin: 0,
                    color: 'var(--ink)',
                    fontSize: '1.125rem',
                    lineHeight: 1.22,
                    fontWeight: 850,
                  }}
                >
                  One review note. One first use. One readiness call.
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  color: 'var(--slate-500)',
                  fontSize: '0.75rem',
                  lineHeight: 1.35,
                  fontWeight: 750,
                  textAlign: 'right',
                  maxWidth: 260,
                }}
              >
                This is what turns the artifact into a usable Toolbox asset.
              </p>
            </div>

            <div
              className="foundation-save-evidence-panel__inputs"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 14,
              }}
            >
              <JudgmentCheckpoint
                moduleNumber={moduleNumber}
                activityId={activity.id}
                value={judgmentNote}
                error={judgmentError ?? undefined}
                onChange={handleJudgmentNoteChange}
              />

              <TransferPlanCheckpoint
                moduleNumber={moduleNumber}
                activityId={activity.id}
                value={transferPlan}
                error={transferPlanError ?? undefined}
                onChange={handleTransferPlanChange}
              />
            </div>

            <ArtifactReadinessCheck value={readiness} onChange={setReadiness} />
          </section>

          {state.serverError && (
            <p
              style={{
                marginTop: 14,
                padding: '10px 12px',
                borderLeft: '2px solid var(--gold-deep)',
                background: 'var(--cream-2)',
                color: 'var(--ink)',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: '0.8125rem',
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              }}
              role="alert"
            >
              {state.serverError}
            </p>
          )}

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid var(--ink-a10)',
            }}
          >
            <button
              type="submit"
              disabled={state.submitting}
              style={state.submitting ? disabledButtonStyle : buttonStyle}
              aria-label={state.submitting ? 'Saving artifact step…' : 'Save artifact step'}
            >
              {state.submitting ? 'Saving…' : 'Save artifact step'}
            </button>
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @media (max-width: 700px) {
                  .foundation-save-evidence-panel {
                    gap: 10px !important;
                    padding: 12px !important;
                  }
                  .foundation-save-evidence-panel__header {
                    grid-template-columns: 1fr !important;
                  }
                  .foundation-save-evidence-panel__inputs {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    gap: 10px !important;
                  }
                  .foundation-save-evidence-panel__header p:last-child {
                    display: none !important;
                  }
                  .foundation-save-evidence-panel .foundation-judgment-checkpoint,
                  .foundation-save-evidence-panel .foundation-transfer-plan {
                    gap: 7px !important;
                    padding-top: 10px !important;
                  }
                  .foundation-save-evidence-panel .foundation-judgment-checkpoint__header p:last-child,
                  .foundation-save-evidence-panel .foundation-transfer-plan__header p:last-child {
                    display: none !important;
                  }
                  .foundation-save-evidence-panel textarea {
                    min-height: 82px !important;
                    padding: 9px 10px !important;
                    font-size: 13px !important;
                  }
                }
              `,
            }}
          />
        </form>
      )}

      {showArtifactDownload && activity.artifactId && (
        <ArtifactDownload artifactId={activity.artifactId} moduleNumber={moduleNumber} />
      )}
    </ActivityWorkspace>
  );
}
