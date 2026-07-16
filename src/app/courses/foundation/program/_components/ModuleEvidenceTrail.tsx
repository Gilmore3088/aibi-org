'use client';

import { useEffect, useMemo, useState } from 'react';
import { INTER_STACK as FONT_STACK } from '@/lib/ui/fonts';

interface ModuleEvidenceTrailProps {
  readonly moduleNumber: number;
  readonly moduleId: string;
  readonly artifactLabel: string;
  readonly hasLab: boolean;
  readonly isAlreadyCompleted: boolean;
  readonly recallCue?: string;
  readonly reviewCue?: string;
  readonly transferCue?: string;
}

interface TrailState {
  readonly target: string;
  readonly recalled: boolean;
  readonly prediction: string;
  readonly hasLabDraft: boolean;
  readonly handoffNote: string;
  readonly transferPlan: string;
}

const EMPTY_TRAIL_STATE: TrailState = {
  target: '',
  recalled: false,
  prediction: '',
  hasLabDraft: false,
  handoffNote: '',
  transferPlan: '',
};


function readLocalStorage(key: string) {
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function readPrediction(moduleId: string) {
  const raw = readLocalStorage(`foundation-lab-prediction-${moduleId}`);
  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw) as { value?: unknown };
    return typeof parsed.value === 'string' ? parsed.value : raw;
  } catch {
    return raw;
  }
}

function readTrailState(moduleNumber: number, moduleId: string): TrailState {
  const memoryCard = readLocalStorage(`foundation-memory-card-${moduleNumber}`) === 'remembered';
  const spacedReview = readLocalStorage(`foundation-spaced-review-${moduleNumber}`) === 'retrieved';

  return {
    target: readLocalStorage(`foundation-module-start-target-${moduleNumber}`),
    recalled: memoryCard || spacedReview,
    prediction: readPrediction(moduleId),
    hasLabDraft: Boolean(readLocalStorage(`foundation-lab-draft-${moduleId}`)),
    handoffNote: readLocalStorage(`foundation-module-handoff-${moduleNumber}`),
    transferPlan: readLocalStorage(`foundation-transfer-plan-${moduleNumber}`),
  };
}

export function ModuleEvidenceTrail({
  moduleNumber,
  moduleId,
  artifactLabel,
  hasLab,
  isAlreadyCompleted,
  recallCue,
  reviewCue,
  transferCue,
}: ModuleEvidenceTrailProps) {
  const [trailState, setTrailState] = useState<TrailState>(EMPTY_TRAIL_STATE);

  useEffect(() => {
    function syncState() {
      setTrailState(readTrailState(moduleNumber, moduleId));
    }

    function syncForModule(event: Event) {
      const detail = (event as CustomEvent<unknown>).detail as
        | { moduleNumber?: unknown; moduleId?: unknown; signal?: unknown; value?: unknown }
        | undefined;
      if (!detail || detail.moduleNumber === moduleNumber || detail.moduleId === moduleId) {
        if (detail?.signal === 'transfer-plan' && typeof detail.value === 'string') {
          setTrailState({
            ...readTrailState(moduleNumber, moduleId),
            transferPlan: detail.value,
          });
          return;
        }
        syncState();
      }
    }

    syncState();
    window.addEventListener('storage', syncState);
    window.addEventListener('foundation-module-start-target-updated', syncForModule);
    window.addEventListener('foundation-learning-signal-updated', syncForModule);
    window.addEventListener('foundation-lab-prediction-updated', syncForModule);
    window.addEventListener('foundation-lab-draft-updated', syncForModule);
    window.addEventListener('foundation-module-handoff-updated', syncForModule);
    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener('foundation-module-start-target-updated', syncForModule);
      window.removeEventListener('foundation-learning-signal-updated', syncForModule);
      window.removeEventListener('foundation-lab-prediction-updated', syncForModule);
      window.removeEventListener('foundation-lab-draft-updated', syncForModule);
      window.removeEventListener('foundation-module-handoff-updated', syncForModule);
    };
  }, [moduleId, moduleNumber]);

  const steps = useMemo(() => {
    const target = trailState.target ?? '';
    const prediction = trailState.prediction ?? '';
    const handoffNote = trailState.handoffNote ?? '';
    const transferPlan = trailState.transferPlan ?? '';
    const items = [
      {
        id: 'target',
        label: 'Target',
        done: target.trim().length > 0,
        title: target.trim() || 'Choose the job this module should help.',
      },
      {
        id: 'recall',
        label: 'Remember',
        done: trailState.recalled,
        title: trailState.recalled
          ? 'Rule remembered.'
          : recallCue ?? 'Answer before rereading.',
      },
      hasLab
        ? {
            id: 'predict',
            label: 'Predict',
            done: prediction.trim().length > 0,
            title: prediction.trim() || 'Name the first risk before running AI.',
          }
        : undefined,
      hasLab
        ? {
            id: 'lab',
            label: 'Lab',
            done: trailState.hasLabDraft,
            title: trailState.hasLabDraft ? 'Lab output saved.' : 'Run sample data after prediction.',
          }
        : undefined,
      {
        id: 'review',
        label: 'Review',
        done: handoffNote.trim().length >= 12,
        title: handoffNote.trim() || reviewCue || 'Add the human judgment note.',
      },
      {
        id: 'transfer',
        label: 'Next use',
        done: transferPlan.trim().length >= 12,
        title: transferPlan.trim() || transferCue || 'Name the next real use.',
      },
      {
        id: 'packet',
        label: 'Packet',
        done: isAlreadyCompleted,
        title: isAlreadyCompleted
          ? artifactLabel
          : transferCue ?? 'Save the artifact and carry it forward.',
      },
    ].filter((item): item is { id: string; label: string; done: boolean; title: string } => Boolean(item));

    return items;
  }, [artifactLabel, hasLab, isAlreadyCompleted, recallCue, reviewCue, trailState, transferCue]);

  const completedCount = steps.filter((step) => step.done).length;

  return (
    <aside
      className="foundation-evidence-trail"
      data-testid="foundation-module-evidence-trail"
      aria-label="Module evidence trail"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(190px, 0.2fr) minmax(0, 1fr)',
        gap: 0,
        margin: '12px 0 0',
        border: '1px solid var(--ink-a10)',
        borderRadius: 16,
        background: '#fff',
        overflow: 'hidden',
        fontFamily: FONT_STACK,
      }}
    >
      <div
        className="foundation-evidence-trail__intro"
        style={{
          display: 'grid',
          gap: 5,
          alignContent: 'center',
          padding: '13px 15px',
          background: 'var(--ink)',
          color: '#fff',
        }}
      >
        <p
          style={{
            margin: 0,
            color: 'var(--gold-soft)',
            fontSize: '0.625rem',
            fontWeight: 900,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Evidence trail
        </p>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.78)', fontSize: '0.8125rem', lineHeight: 1.3, fontWeight: 750 }}>
          {completedCount}/{steps.length} proof points
        </p>
      </div>

      <ol
        className="foundation-evidence-trail__steps"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="foundation-evidence-trail__step"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gap: 10,
              alignItems: 'start',
              padding: '13px 14px',
              borderLeft: index === 0 ? 'none' : '1px solid var(--ink-a10)',
              background: step.done ? 'var(--cream-2)' : '#fff',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'grid',
                width: 24,
                height: 24,
                placeItems: 'center',
                borderRadius: 999,
                background: step.done ? 'var(--gold)' : 'var(--cream)',
                color: step.done ? 'var(--ink)' : 'var(--slate-500)',
                fontSize: '0.625rem',
                fontWeight: 900,
              }}
            >
              {index + 1}
            </span>
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  color: step.done ? 'var(--gold-deep)' : 'var(--slate-500)',
                  fontSize: '0.625rem',
                  fontWeight: 900,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                }}
              >
                {step.done ? 'Done' : 'Next'} · {step.label}
              </span>
              <span
                style={{
                  display: '-webkit-box',
                  marginTop: 4,
                  color: 'var(--ink)',
                  fontSize: '0.7813rem',
                  lineHeight: 1.28,
                  fontWeight: 760,
                  overflow: 'hidden',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {step.title}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 1080px) {
              .foundation-evidence-trail {
                grid-template-columns: 1fr !important;
              }
              .foundation-evidence-trail__intro {
                display: flex !important;
                justify-content: space-between !important;
                align-items: baseline !important;
              }
            }
            @media (max-width: 760px) {
              .foundation-evidence-trail {
                border-radius: 14px !important;
                margin-top: 8px !important;
              }
              .foundation-evidence-trail__steps {
                grid-template-columns: 1fr !important;
              }
              .foundation-evidence-trail__step {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10) !important;
                padding: 12px 13px !important;
              }
            }
            @media (max-width: 520px) {
              .foundation-evidence-trail__intro {
                padding: 12px 13px !important;
              }
              .foundation-evidence-trail__step span:last-child span:last-child {
                -webkit-line-clamp: 1 !important;
              }
            }
          `,
        }}
      />
    </aside>
  );
}
