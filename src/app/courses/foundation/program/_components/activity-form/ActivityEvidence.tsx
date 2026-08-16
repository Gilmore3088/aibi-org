'use client';

import React, { useCallback, useRef } from 'react';
import { getArtifactFirst } from '@content/courses/foundation-program';
import { getFoundationLabBrief } from '@content/courses/foundation-program/lab-first';

export type ToolboxSaveStatus = 'idle' | 'saving' | 'saved' | 'unavailable' | 'error';

export const readinessOptions = [
  {
    id: 'revise',
    label: 'Revise',
    body: 'Something still needs source, edit, or review work.',
  },
  {
    id: 'ready',
    label: 'Ready',
    body: 'The artifact is clear enough to save.',
  },
  {
    id: 'reuse',
    label: 'Reusable',
    body: 'Another person could inspect and adapt it.',
  },
] as const;

const readinessIds = readinessOptions.map((option) => option.id);

export function getInitialReadiness(existingResponse?: Record<string, string> | null): (typeof readinessOptions)[number]['id'] {
  const value = existingResponse?.__artifact_readiness;
  return value && readinessIds.includes(value as (typeof readinessOptions)[number]['id'])
    ? (value as (typeof readinessOptions)[number]['id'])
    : 'ready';
}

export function ArtifactReadinessCheck({
  value,
  onChange,
}: {
  readonly value: (typeof readinessOptions)[number]['id'];
  readonly onChange: (value: (typeof readinessOptions)[number]['id']) => void;
}) {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = readinessOptions.find((option) => option.id === value) ?? readinessOptions[1];
  const selectedIndex = readinessOptions.findIndex((option) => option.id === selected.id);

  const moveSelection = useCallback((nextIndex: number) => {
    const normalizedIndex =
      (nextIndex + readinessOptions.length) % readinessOptions.length;
    const nextOption = readinessOptions[normalizedIndex];
    onChange(nextOption.id);
    optionRefs.current[normalizedIndex]?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      moveSelection(index + 1);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveSelection(index - 1);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      moveSelection(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      moveSelection(readinessOptions.length - 1);
    }
  }, [moveSelection]);

  return (
    <section
      aria-label="Artifact readiness self-check"
      className="foundation-artifact-readiness"
      style={{
        display: 'grid',
        gap: 12,
        paddingTop: 16,
        borderTop: '1px solid var(--ink-a10)',
      }}
    >
      <div
        className="foundation-artifact-readiness__header"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 12,
          alignItems: 'center',
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
            Before save
          </p>
          <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.34, fontWeight: 820 }}>
            Readiness
          </p>
        </div>
        <p
          aria-live="polite"
          style={{
            margin: 0,
            color: 'var(--slate-500)',
            fontSize: '0.75rem',
            lineHeight: 1.3,
            fontWeight: 750,
            textAlign: 'right',
            maxWidth: 260,
          }}
        >
          {selected.body}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Choose artifact readiness"
        className="foundation-artifact-readiness__options"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${readinessOptions.length}, minmax(0, 1fr))`,
          gap: 8,
        }}
      >
        {readinessOptions.map((option, index) => {
          const isSelected = option.id === value;
          return (
            <button
              key={option.id}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={index === selectedIndex ? 0 : -1}
              onClick={() => onChange(option.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              style={{
                minHeight: 44,
                border: '1px solid',
                borderColor: isSelected ? 'var(--ink)' : 'var(--ink-a10)',
                borderRadius: 12,
                background: isSelected ? 'var(--ink)' : '#fff',
                color: isSelected ? '#fff' : 'var(--ink)',
                padding: '0 12px',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 850,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 700px) {
              .foundation-artifact-readiness {
                gap: 8px !important;
                padding-top: 10px !important;
              }
              .foundation-artifact-readiness__header {
                grid-template-columns: 1fr !important;
              }
              .foundation-artifact-readiness__header p:last-child {
                display: none !important;
              }
              .foundation-artifact-readiness__options {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                gap: 6px !important;
              }
              .foundation-artifact-readiness__options button {
                min-height: 38px !important;
                padding: 0 8px !important;
                font-size: 10px !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}

export function ArtifactEvidenceRubric({
  moduleNumber,
  answeredCount,
  requiredCount,
  submitted,
}: {
  readonly moduleNumber: number;
  readonly answeredCount: number;
  readonly requiredCount: number;
  readonly submitted: boolean;
}) {
  const artifactMeta = getArtifactFirst(moduleNumber);
  const labBrief = getFoundationLabBrief(moduleNumber);
  const progressValue =
    requiredCount > 0 ? Math.min(100, Math.round((answeredCount / requiredCount) * 100)) : 100;
  const progressLabel = submitted
    ? 'Artifact saved'
    : `${answeredCount}/${requiredCount} required fields started`;
  const savedAsset = artifactMeta?.saved ?? 'module artifact';
  const proofCue = labBrief?.qualitySignals[0] ?? artifactMeta?.mustProve ?? 'Manager can verify the judgment';

  return (
    <section
      aria-label="Artifact evidence target"
      className="foundation-artifact-evidence"
      style={{
        display: 'grid',
        gap: 8,
        marginBottom: 14,
        padding: '0 0 12px',
        borderBottom: '1px solid var(--ink-a10)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 12,
          alignItems: 'center',
        }}
        className="foundation-artifact-evidence__header"
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
            Evidence target
          </p>
          <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.32, fontWeight: 800 }}>
            Save {savedAsset} with a review note and first-use plan.
          </p>
        </div>
        <div
          aria-label={progressLabel}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressValue}
          style={{
            minWidth: 150,
            display: 'grid',
            gap: 6,
          }}
        >
          <span
            style={{
              color: submitted ? 'var(--ink)' : 'var(--slate-500)',
              fontSize: '0.6875rem',
              fontWeight: 850,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textAlign: 'right',
            }}
          >
            {progressLabel}
          </span>
          <span
            aria-hidden="true"
            style={{
              display: 'block',
              height: 6,
              borderRadius: 999,
              background: 'var(--ink-a10)',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                display: 'block',
                width: `${progressValue}%`,
                height: '100%',
                borderRadius: 999,
                background: submitted ? 'var(--gold)' : 'var(--ink)',
              }}
            />
          </span>
        </div>
      </div>

      <p
        className="foundation-artifact-evidence__proof"
        style={{
          margin: 0,
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 7,
          minHeight: 28,
          padding: '5px 10px',
          borderRadius: 10,
          background: 'var(--cream)',
          color: 'var(--ink)',
          fontSize: '0.8125rem',
          lineHeight: 1.3,
          fontWeight: 750,
        }}
      >
        <span
          style={{
            flex: '0 0 auto',
            color: 'var(--slate-500)',
            fontSize: '0.625rem',
            fontWeight: 850,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Prove
        </span>
        <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{proofCue}</span>
      </p>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 700px) {
              .foundation-artifact-evidence__header {
                grid-template-columns: 1fr !important;
              }
              .foundation-artifact-evidence__header [role="progressbar"] {
                min-width: 0 !important;
              }
              .foundation-artifact-evidence__header [role="progressbar"] > span:first-child {
                text-align: left !important;
              }
              .foundation-artifact-evidence__proof {
                width: 100% !important;
                align-items: flex-start !important;
                border-radius: 10px !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}

export function TransferNoteCard({
  activityId,
  note,
  statusLabel,
  onChange,
}: {
  readonly activityId: string;
  readonly note: string;
  readonly statusLabel?: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <section
      aria-labelledby={`transfer-note-${activityId}`}
      className="foundation-transfer-note"
      style={{
        marginTop: 4,
        padding: 14,
        border: '1px solid var(--ink-a10)',
        borderRadius: 16,
        background: 'var(--cream)',
      }}
    >
      <div className="foundation-transfer-note__header">
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
            Next-use note
          </p>
          <h3
            id={`transfer-note-${activityId}`}
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontSize: '1.125rem',
              lineHeight: 1.22,
              fontWeight: 850,
            }}
          >
            Name the first real task where this belongs.
          </h3>
        </div>
        <span
          style={{
            color: note.trim() ? 'var(--ink)' : 'var(--slate-500)',
            fontSize: '0.625rem',
            fontWeight: 850,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {note.trim() ? (statusLabel ?? 'Saved locally') : 'Private note'}
        </span>
      </div>

      <label
        style={{
          display: 'block',
          marginTop: 12,
        }}
      >
        <span
          style={{
            display: 'block',
            marginBottom: 6,
            color: 'var(--slate-500)',
            fontSize: '0.625rem',
            fontWeight: 850,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          My next use
        </span>
        <textarea
          value={note}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          placeholder="Example: I will use this on the branch rollout email before sending it to my manager."
          style={{
            width: '100%',
            resize: 'vertical',
            border: '1px solid var(--ink-a10)',
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .foundation-transfer-note__header {
              display: grid;
              grid-template-columns: minmax(0, 1fr) auto;
              gap: 12px;
              align-items: start;
            }
            @media (max-width: 700px) {
              .foundation-transfer-note {
                padding: 14px !important;
              }
              .foundation-transfer-note__header {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}

export function ToolboxSaveStatusCard({ status }: { readonly status: ToolboxSaveStatus }) {
  if (status === 'idle') return null;

  const copy: Record<Exclude<ToolboxSaveStatus, 'idle'>, { readonly label: string; readonly body: string }> = {
    saving: {
      label: 'Saving to Toolbox',
      body: 'Your reusable version is being added to My Toolbox.',
    },
    saved: {
      label: 'Saved to Toolbox',
      body: 'This artifact is now available as a reusable course workflow in My Toolbox.',
    },
    unavailable: {
      label: 'Packet saved',
      body: 'The course artifact is saved. Toolbox storage is not available for this session.',
    },
    error: {
      label: 'Packet saved',
      body: 'The course artifact is saved. The Toolbox copy can be retried later from the packet.',
    },
  };
  const current = copy[status];

  return (
    <section
      aria-live="polite"
      aria-label={current.label}
      style={{
        display: 'grid',
        gap: 4,
        padding: '12px 14px',
        border: '1px solid var(--ink-a10)',
        borderRadius: 14,
        background: status === 'saved' ? 'var(--cream-2)' : 'var(--cream)',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <p
        style={{
          margin: 0,
          color: status === 'saved' ? 'var(--gold-deep)' : 'var(--slate-500)',
          fontSize: '0.625rem',
          fontWeight: 850,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        {current.label}
      </p>
      <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.8125rem', lineHeight: 1.4, fontWeight: 720 }}>
        {current.body}
      </p>
    </section>
  );
}

export function PacketSaveStatusCard() {
  return (
    <section
      aria-live="polite"
      aria-label="Packet saved"
      style={{
        display: 'grid',
        gap: 4,
        padding: '12px 14px',
        border: '1px solid var(--ink-a10)',
        borderRadius: 14,
        background: 'var(--cream)',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
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
        Packet saved
      </p>
      <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.8125rem', lineHeight: 1.4, fontWeight: 720 }}>
        This artifact is part of your Foundation packet and can be reused from the course record.
      </p>
    </section>
  );
}


