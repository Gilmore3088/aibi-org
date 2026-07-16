'use client';

import { useEffect, useState } from 'react';
import type { FoundationLabBrief } from '@content/courses/foundation-program/lab-first';
import { FONT_INTER, dispatchLearningSignal, eyebrowStyle } from './shared';

const confidenceStates = [
  {
    id: 'review',
    label: 'Need a model',
    guidance: 'Open the reference drawer first, then return to the lab prompt.',
    actionLabel: 'Open reference',
    actionKind: 'reference',
  },
  {
    id: 'practice',
    label: 'Ready to try',
    guidance: 'Use the guided lab start and compare the output against the quality checks.',
    actionLabel: 'Open AiBI Lab',
    actionKind: 'link',
    href: '#st-sandbox',
  },
  {
    id: 'transfer',
    label: 'Ready to transfer',
    guidance: 'Use the lab once, then adapt the artifact to a real task from your role.',
    actionLabel: 'Go to submit',
    actionKind: 'link',
    href: '#st-submit',
  },
] as const;

export function ReadinessCheckPanel({
  brief,
  moduleNumber,
}: {
  readonly brief: FoundationLabBrief;
  readonly moduleNumber: number;
}) {
  const transferPlanKey = `foundation-transfer-plan-${moduleNumber}`;
  const [selected, setSelected] = useState<(typeof confidenceStates)[number]['id']>('practice');
  const [transferPlan, setTransferPlan] = useState('');
  const selectedState = confidenceStates.find((state) => state.id === selected) ?? confidenceStates[1];
  const isReferenceAction = selectedState.actionKind === 'reference';
  const hasTransferPlan = transferPlan.trim().length >= 12;

  useEffect(() => {
    try {
      setTransferPlan(window.localStorage.getItem(transferPlanKey) ?? '');
    } catch {
      setTransferPlan('');
    }
  }, [transferPlanKey]);

  function openReferenceDrawer() {
    const drawer = document.getElementById(`m${moduleNumber}-reference-drawer`) as HTMLDetailsElement | null;
    drawer?.setAttribute('open', '');
    drawer?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  function updateTransferPlan(value: string) {
    setTransferPlan(value);
    const ready = value.trim().length >= 12;
    try {
      if (value.trim()) {
        window.localStorage.setItem(transferPlanKey, value);
      } else {
        window.localStorage.removeItem(transferPlanKey);
      }
    } catch {
      // Transfer planning is a local learning cue; the module should keep working without storage.
    }
    dispatchLearningSignal(moduleNumber, 'transfer-plan', ready, { value });
  }

  function applyTransferStarter(starter: string) {
    updateTransferPlan(starter);
    setSelected('transfer');
  }

  return (
    <section
      aria-labelledby={`m${moduleNumber}-readiness-heading`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 0.7fr) minmax(260px, 0.3fr)',
        gap: 0,
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: 'var(--shadow-soft)',
      }}
      className="foundation-readiness-check"
      data-testid="foundation-readiness-check"
    >
      <div style={{ padding: 'clamp(18px, 2.5vw, 24px)' }}>
        <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 10 }}>Readiness check</p>
        <h3
          id={`m${moduleNumber}-readiness-heading`}
          style={{
            margin: '0 0 12px',
            color: 'var(--ink)',
            fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          Can you produce the artifact without rereading?
        </h3>
        <div
          role="group"
          aria-label="Choose your readiness level"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 8,
            margin: '18px 0 14px',
          }}
          className="foundation-readiness-check__buttons"
        >
          {confidenceStates.map((state) => {
            const isSelected = selected === state.id;
            return (
              <button
                key={state.id}
                type="button"
                onClick={() => setSelected(state.id)}
                aria-pressed={isSelected}
                style={{
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--ink)' : 'var(--ink-a10)',
                  borderRadius: 12,
                  background: isSelected ? 'var(--ink)' : 'var(--cream)',
                  color: isSelected ? '#fff' : 'var(--ink)',
                  padding: '12px 10px',
                  fontFamily: FONT_INTER,
                  fontSize: '0.8125rem',
                  lineHeight: 1.15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {state.label}
              </button>
            );
          })}
        </div>
        <p
          aria-live="polite"
          style={{
            margin: 0,
            color: 'var(--slate-600)',
            fontSize: '0.9375rem',
            lineHeight: 1.55,
            fontWeight: 650,
          }}
        >
          {selectedState.guidance}
        </p>
        <div
          className="foundation-readiness-check__action"
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: 18,
          }}
        >
          {isReferenceAction ? (
            <button
              type="button"
              onClick={openReferenceDrawer}
              style={{
                display: 'inline-flex',
                minHeight: 42,
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--ink)',
                borderRadius: 999,
                background: 'var(--ink)',
                color: '#fff',
                padding: '10px 16px',
                fontFamily: FONT_INTER,
                fontSize: '0.8125rem',
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              {selectedState.actionLabel}
            </button>
          ) : (
            <a
              href={selectedState.href}
              style={{
                display: 'inline-flex',
                minHeight: 42,
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--ink)',
                borderRadius: 999,
                background: 'var(--ink)',
                color: '#fff',
                padding: '10px 16px',
                fontFamily: FONT_INTER,
                fontSize: '0.8125rem',
                fontWeight: 850,
                textDecoration: 'none',
              }}
            >
              {selectedState.actionLabel}
            </a>
          )}
          <span
            style={{
              color: 'var(--slate-500)',
              fontSize: '0.8125rem',
              lineHeight: 1.4,
              fontWeight: 650,
            }}
          >
            Pick the path that matches your confidence.
          </span>
        </div>

        {selected === 'transfer' ? (
          <div
            data-testid="foundation-transfer-plan"
            style={{
              marginTop: 18,
              border: '1px solid var(--ink-a10)',
              borderRadius: 14,
              background: 'var(--cream)',
              padding: '14px 16px',
              display: 'grid',
              gap: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <label
                htmlFor={`m${moduleNumber}-transfer-plan`}
                style={{
                  color: 'var(--ink)',
                  fontSize: '0.875rem',
                  fontWeight: 850,
                  letterSpacing: '-0.01em',
                }}
              >
                Next real use
              </label>
              <span
                aria-live="polite"
                style={{
                  color: hasTransferPlan ? 'var(--gold-deep)' : 'var(--slate-500)',
                  fontSize: '0.6875rem',
                  fontWeight: 850,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {hasTransferPlan ? 'Plan saved' : 'Make it specific'}
              </span>
            </div>
            <textarea
              id={`m${moduleNumber}-transfer-plan`}
              value={transferPlan}
              onChange={(event) => updateTransferPlan(event.target.value)}
              rows={2}
              placeholder="When I next handle this task, I will use the artifact and check the review rule before sharing."
              style={{
                width: '100%',
                resize: 'vertical',
                border: '1px solid var(--ink-a10)',
                borderRadius: 12,
                background: '#fff',
                color: 'var(--ink)',
                padding: '11px 12px',
                fontFamily: FONT_INTER,
                fontSize: '0.875rem',
                lineHeight: 1.45,
                outline: 'none',
              }}
            />
            <div
              role="group"
              aria-label="Next-use plan starters"
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              {[brief.learningLoop.transferPrompt, brief.qualitySignals[0]].filter(Boolean).map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => applyTransferStarter(starter)}
                  style={{
                    border: '1px solid var(--ink-a10)',
                    borderRadius: 999,
                    background: '#fff',
                    color: 'var(--ink)',
                    padding: '8px 10px',
                    fontFamily: FONT_INTER,
                    fontSize: '0.75rem',
                    lineHeight: 1.2,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          borderLeft: '1px solid var(--ink-a10)',
          background: 'var(--cream-2)',
          padding: 'clamp(18px, 2.5vw, 24px)',
        }}
      >
        <p style={{ ...eyebrowStyle, marginBottom: 12 }}>Move on when</p>
        <ul style={{ display: 'grid', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
          {[brief.qualitySignals[0], brief.reviewChecklist[0], brief.learningLoop.feedbackCue].map((item) => (
            <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: 'var(--gold)',
                  marginTop: 8,
                  flex: '0 0 auto',
                }}
              />
              <span style={{ color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 700 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
