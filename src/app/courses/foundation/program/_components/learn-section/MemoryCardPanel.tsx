'use client';

import { useEffect, useState } from 'react';
import type { ArtifactFirstMeta } from '@content/courses/foundation-program';
import type { FoundationLabBrief } from '@content/courses/foundation-program/lab-first';
import { FONT_INTER, dispatchLearningSignal, eyebrowStyle } from './shared';

export function MemoryCardPanel({
  brief,
  current,
  moduleNumber,
}: {
  readonly brief: FoundationLabBrief;
  readonly current: ArtifactFirstMeta | undefined;
  readonly moduleNumber: number;
}) {
  const storageKey = `foundation-memory-card-${moduleNumber}`;
  const [remembered, setRemembered] = useState(false);

  useEffect(() => {
    try {
      setRemembered(window.localStorage.getItem(storageKey) === 'remembered');
    } catch {
      setRemembered(false);
    }
  }, [storageKey]);

  function toggleRemembered() {
    setRemembered((currentValue) => {
      const nextValue = !currentValue;
      try {
        if (nextValue) {
          window.localStorage.setItem(storageKey, 'remembered');
        } else {
          window.localStorage.removeItem(storageKey);
        }
      } catch {
        // Remembered state is a local learning cue; the module can continue without storage.
      }
      dispatchLearningSignal(moduleNumber, 'memory-card', nextValue);
      return nextValue;
    });
  }

  const sequence = brief.visualModel.join(' -> ');
  const proof = current?.mustProve ?? brief.qualitySignals[0];
  const memoryItems = [
    {
      label: 'Rule',
      body: `Use the ${brief.visualModel.length}-step sequence: ${sequence}.`,
    },
    {
      label: 'Cue',
      body: brief.reviewChecklist[0],
    },
    {
      label: 'First use',
      body: brief.learningLoop.transferPrompt,
    },
  ] as const;

  return (
    <section
      aria-labelledby={`m${moduleNumber}-memory-card-heading`}
      data-testid="foundation-memory-card"
      className="foundation-memory-card"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 0.3fr) minmax(0, 1fr)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        className="foundation-memory-card__intro"
        style={{
          background: 'var(--ink)',
          color: '#fff',
          padding: 'clamp(18px, 2.4vw, 24px)',
          display: 'grid',
          alignContent: 'space-between',
          gap: 18,
        }}
      >
        <div>
          <p style={{ ...eyebrowStyle, color: 'var(--gold-soft)', marginBottom: 10 }}>
            Memory card
          </p>
          <h3
            id={`m${moduleNumber}-memory-card-heading`}
            style={{
              margin: 0,
              fontSize: 'clamp(1.375rem, 2vw, 1.75rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Keep the rule, not the chapter.
          </h3>
        </div>
        <p style={{ margin: 0, color: 'var(--on-dark-70)', fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 650 }}>
          Say this from memory before the next module, then use it once on real work.
        </p>
      </div>

      <div
        className="foundation-memory-card__body"
        style={{
          display: 'grid',
          gap: 12,
          padding: 'clamp(18px, 2.4vw, 24px)',
        }}
      >
        <div
          className="foundation-memory-card__items"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {memoryItems.map((item) => (
            <div
              key={item.label}
              className="foundation-memory-card__item"
              style={{
                display: 'grid',
                alignContent: 'start',
                gap: 7,
                border: '1px solid var(--ink-a10)',
                borderRadius: 14,
                background: 'var(--cream)',
                padding: '13px 14px',
                minHeight: 124,
              }}
            >
              <p style={{ ...eyebrowStyle, color: 'var(--gold-deep)', marginBottom: 0 }}>
                {item.label}
              </p>
              <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.38, fontWeight: 760 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div
          className="foundation-memory-card__footer"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 12,
            alignItems: 'center',
            border: '1px solid var(--ink-a10)',
            borderRadius: 14,
            background: 'var(--cream-2)',
            padding: '12px 14px',
          }}
        >
          <div>
            <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 5 }}>
              Proof to show
            </p>
            <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.35, fontWeight: 760 }}>
              {proof}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={remembered}
            onClick={toggleRemembered}
            style={{
              minHeight: 44,
              border: '1px solid',
              borderColor: remembered ? 'var(--ink)' : 'var(--ink-a10)',
              borderRadius: 12,
              background: remembered ? 'var(--ink)' : '#fff',
              color: remembered ? '#fff' : 'var(--ink)',
              padding: '0 16px',
              fontFamily: FONT_INTER,
              fontSize: '0.75rem',
              fontWeight: 850,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {remembered ? 'Remembered' : 'I can say this from memory'}
          </button>
        </div>
      </div>
    </section>
  );
}
