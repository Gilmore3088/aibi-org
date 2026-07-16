'use client';

import { useEffect, useId, useState } from 'react';
import { INTER_STACK as FONT_STACK } from '@/lib/ui/fonts';


const TARGET_OPTIONS = [
  'A message or memo',
  'A recurring review',
  'A workflow handoff',
] as const;

interface ModuleStartCommitmentProps {
  readonly moduleNumber: number;
  readonly artifactLabel: string;
  readonly useCaseLabel?: string;
  readonly qualityBar?: string;
  readonly transferCue: string;
}

function storageKey(moduleNumber: number) {
  return `foundation-module-start-target-${moduleNumber}`;
}

export function ModuleStartCommitment({
  moduleNumber,
  artifactLabel,
  useCaseLabel,
  qualityBar,
  transferCue,
}: ModuleStartCommitmentProps) {
  const textareaId = useId();
  const [target, setTarget] = useState('');
  const [savedTarget, setSavedTarget] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(moduleNumber)) ?? '';
      setTarget(saved);
      setSavedTarget(saved);
    } catch {
      setTarget('');
      setSavedTarget('');
    }
  }, [moduleNumber]);

  function updateTarget(value: string) {
    setTarget(value);
  }

  function saveTarget(value = target) {
    const trimmed = value.trim().slice(0, 180);
    setTarget(trimmed);
    setSavedTarget(trimmed);
    try {
      if (trimmed) {
        window.localStorage.setItem(storageKey(moduleNumber), trimmed);
      } else {
        window.localStorage.removeItem(storageKey(moduleNumber));
      }
    } catch {
      // Local persistence is a learning aid. The module still works without it.
    }
    window.dispatchEvent(
      new CustomEvent('foundation-module-start-target-updated', {
        detail: { moduleNumber, value: trimmed },
      }),
    );
  }

  function chooseOption(option: string) {
    saveTarget(option);
  }

  const hasSavedTarget = savedTarget.trim().length > 0;
  const canSaveTarget = target.trim().length >= 6;
  const contractItems = [
    {
      label: 'Use for',
      body: useCaseLabel ?? transferCue,
    },
    {
      label: 'Save',
      body: artifactLabel,
    },
    {
      label: 'Prove',
      body: qualityBar ?? 'A manager can see the human review decision.',
    },
  ] as const;

  return (
    <section
      className="foundation-start-target"
      data-testid="foundation-start-commitment"
      aria-labelledby={`module-${moduleNumber}-start-target-heading`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 0,
        margin: '0 0 20px',
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        background: '#fff',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-soft)',
        fontFamily: FONT_STACK,
      }}
    >
      <div
        className="foundation-start-target__lead"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 0.28fr) minmax(0, 1fr)',
          alignItems: 'center',
          gap: 14,
          padding: '14px clamp(16px, 2.4vw, 22px)',
          background: 'var(--ink)',
          color: '#fff',
        }}
      >
        <p
          style={{
            margin: 0,
            color: 'var(--gold-soft)',
            fontSize: '0.6875rem',
            fontWeight: 850,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
          >
          Start here
        </p>
        <h3
          id={`module-${moduleNumber}-start-target-heading`}
          style={{
            margin: 0,
            color: '#fff',
            fontSize: 'clamp(1.3125rem, 2vw, 1.75rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          Choose the work this module will improve.
        </h3>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', fontSize: '0.8438rem', lineHeight: 1.42, fontWeight: 650 }}>
          Pick a safe, non-sensitive target. The lab, review note, and packet item will point back here.
        </p>
      </div>

      <div
        className="foundation-start-target__body"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.58fr) minmax(260px, 0.42fr)',
          gap: 14,
          alignItems: 'stretch',
          padding: 'clamp(16px, 2.4vw, 22px)',
        }}
      >
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <label htmlFor={textareaId} style={{ display: 'grid', gap: 7 }}>
            <span
              style={{
                color: 'var(--slate-500)',
                fontSize: '0.625rem',
                fontWeight: 850,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              My target use
            </span>
            <textarea
              id={textareaId}
              value={target}
              onChange={(event) => updateTarget(event.target.value)}
              rows={3}
              maxLength={180}
              placeholder="Example: rewrite the next branch update without customer or account data."
              style={{
                width: '100%',
                minHeight: 92,
                resize: 'vertical',
                border: '1px solid var(--ink-a10)',
                borderRadius: 14,
                background: 'var(--cream)',
                color: 'var(--ink)',
                padding: '12px 13px',
                fontFamily: FONT_STACK,
                fontSize: '0.875rem',
                lineHeight: 1.45,
                fontWeight: 650,
                outlineColor: 'var(--gold-deep)',
              }}
            />
          </label>
          <div className="foundation-start-target__quick-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {TARGET_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={savedTarget === option}
                onClick={() => chooseOption(option)}
                style={{
                  minHeight: 32,
                  border: '1px solid',
                  borderColor: savedTarget === option ? 'var(--ink)' : 'var(--ink-a10)',
                  borderRadius: 999,
                  background: savedTarget === option ? '#fff' : 'var(--cream-2)',
                  color: 'var(--ink)',
                  padding: '0 11px',
                  textAlign: 'left',
                  fontFamily: FONT_STACK,
                  fontSize: '0.7188rem',
                  lineHeight: 1.1,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <div
            className="foundation-start-target__actions"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => saveTarget()}
              disabled={!canSaveTarget}
              style={{
                minHeight: 40,
                border: '1px solid var(--ink)',
                borderRadius: 12,
                background: canSaveTarget ? 'var(--ink)' : 'var(--cream-2)',
                color: canSaveTarget ? '#fff' : 'var(--slate-500)',
                padding: '0 15px',
                fontFamily: FONT_STACK,
                fontSize: '0.6875rem',
                fontWeight: 850,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: canSaveTarget ? 'pointer' : 'not-allowed',
              }}
            >
              Save target
            </button>
            <span
              aria-live="polite"
              data-testid="foundation-start-status"
              style={{
                color: hasSavedTarget ? 'var(--emerald-700)' : 'var(--slate-500)',
                fontSize: '0.6875rem',
                fontWeight: 850,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {hasSavedTarget ? 'Target saved for lab' : 'Choose before lab'}
            </span>
          </div>
        </div>

        <aside
          className="foundation-start-target__side"
          data-testid="foundation-start-contract"
          aria-label="Module work contract"
          style={{
            display: 'grid',
            gap: 9,
            alignContent: 'start',
            border: '1px solid var(--ink-a10)',
            borderRadius: 14,
            background: 'var(--cream-2)',
            padding: '12px 13px',
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
            Work contract
          </p>
          <div
            data-testid="foundation-start-target-summary"
            style={{
              border: '1px solid var(--ink-a10)',
              borderRadius: 12,
              background: hasSavedTarget ? '#fff' : 'var(--cream)',
              padding: '10px 11px',
            }}
          >
            <p
              style={{
                margin: '0 0 4px',
                color: 'var(--slate-500)',
                fontSize: '0.5938rem',
                fontWeight: 900,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Target
            </p>
            <p
              style={{
                margin: 0,
                color: hasSavedTarget ? 'var(--ink)' : 'var(--slate-500)',
                fontSize: '0.7813rem',
                lineHeight: 1.35,
                fontWeight: 760,
              }}
            >
              {hasSavedTarget ? savedTarget : 'Choose one work target before the lab.'}
            </p>
          </div>
          <dl style={{ display: 'grid', gap: 8, margin: 0 }}>
            {contractItems.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'grid',
                  gap: 3,
                  padding: '0 0 8px',
                  borderBottom: '1px solid var(--ink-a10)',
                }}
              >
                <dt
                  style={{
                    margin: 0,
                    color: 'var(--gold-deep)',
                    fontSize: '0.5938rem',
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </dt>
                <dd
                  className="foundation-start-target__contract-body"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    margin: 0,
                    color: 'var(--ink)',
                    fontSize: '0.7813rem',
                    lineHeight: 1.28,
                    fontWeight: 760,
                  }}
                >
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 820px) {
              .foundation-start-target {
                grid-template-columns: 1fr !important;
              }
              .foundation-start-target__lead {
                grid-template-columns: 1fr !important;
              }
              .foundation-start-target__body {
                grid-template-columns: 1fr !important;
              }
            }
            @media (max-width: 520px) {
              .foundation-start-target {
                border-radius: 16px !important;
                box-shadow: none !important;
              }
              .foundation-start-target__lead {
                padding: 16px !important;
              }
              .foundation-start-target__lead h3 {
                font-size: 22px !important;
              }
              .foundation-start-target__body {
                padding: 14px !important;
              }
              .foundation-start-target__actions button {
                width: 100% !important;
              }
              .foundation-start-target__quick-row button {
                flex: 1 1 calc(50% - 8px) !important;
                justify-content: center !important;
                text-align: center !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}
