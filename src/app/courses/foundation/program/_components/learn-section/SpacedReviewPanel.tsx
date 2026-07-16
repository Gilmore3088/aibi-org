'use client';

import { useEffect, useState } from 'react';
import type { ArtifactFirstMeta } from '@content/courses/foundation-program';
import type { FoundationLabBrief } from '@content/courses/foundation-program/lab-first';
import { FONT_INTER, dispatchLearningSignal, eyebrowStyle } from './shared';

export function SpacedReviewPanel({
  currentBrief,
  previous,
  older,
  previousBrief,
  olderBrief,
  moduleNumber,
}: {
  readonly currentBrief: FoundationLabBrief;
  readonly previous: ArtifactFirstMeta | undefined;
  readonly older: ArtifactFirstMeta | undefined;
  readonly previousBrief: FoundationLabBrief | undefined;
  readonly olderBrief: FoundationLabBrief | undefined;
  readonly moduleNumber: number;
}) {
  const storageKey = `foundation-spaced-review-${moduleNumber}`;
  const [retrieved, setRetrieved] = useState(false);

  useEffect(() => {
    try {
      setRetrieved(window.localStorage.getItem(storageKey) === 'retrieved');
    } catch {
      setRetrieved(false);
    }
  }, [storageKey]);

  function toggleRetrieved() {
    setRetrieved((currentValue) => {
      const nextValue = !currentValue;
      try {
        if (nextValue) {
          window.localStorage.setItem(storageKey, 'retrieved');
        } else {
          window.localStorage.removeItem(storageKey);
        }
      } catch {
        // Retrieval state is only a local learning cue.
      }
      dispatchLearningSignal(moduleNumber, 'spaced-review', nextValue);
      return nextValue;
    });
  }

  const reviewItems = [
    previous
      ? {
          label: 'Last module',
          title: `Module ${previous.module}: ${previous.saved}`,
          body: previousBrief?.learningLoop.transferPrompt ?? previous.mustProve,
        }
      : undefined,
    older
      ? {
          label: 'Earlier skill',
          title: `Module ${older.module}: ${older.saved}`,
          body: olderBrief?.learningLoop.feedbackCue ?? older.mustProve,
        }
      : undefined,
    {
      label: 'Today',
      title: currentBrief.outcome,
      body: 'Notice what changes before opening the lab.',
    },
  ].filter((item): item is { label: string; title: string; body: string } => Boolean(item));

  return (
    <section
      aria-labelledby={`m${moduleNumber}-spaced-review-heading`}
      data-testid="foundation-spaced-review"
      className="foundation-spaced-review"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(210px, 0.28fr) minmax(0, 1fr)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        className="foundation-spaced-review__intro"
        style={{
          background: 'var(--cream)',
          borderRight: '1px solid var(--ink-a10)',
          padding: 'clamp(18px, 2.4vw, 24px)',
          display: 'grid',
          alignContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Spaced review</p>
          <h3
            id={`m${moduleNumber}-spaced-review-heading`}
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Bring back the last skill before you add this one.
          </h3>
        </div>
        <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 675 }}>
          Spacing works when you retrieve without rereading.
        </p>
      </div>

      <div
        className="foundation-spaced-review__body"
        style={{
          display: 'grid',
          gap: 12,
          padding: 'clamp(18px, 2.4vw, 24px)',
        }}
      >
        <div
          className="foundation-spaced-review__items"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${reviewItems.length}, minmax(0, 1fr))`,
            gap: 10,
          }}
        >
          {reviewItems.map((item) => (
            <div
              key={item.label}
              className="foundation-spaced-review__item"
              style={{
                display: 'grid',
                alignContent: 'start',
                gap: 8,
                border: '1px solid var(--ink-a10)',
                borderRadius: 14,
                background: item.label === 'Today' ? 'var(--cream-2)' : 'var(--cream)',
                padding: '13px 14px',
                minHeight: 144,
              }}
            >
              <p style={{ ...eyebrowStyle, color: item.label === 'Today' ? 'var(--gold-deep)' : 'var(--slate-500)', marginBottom: 0 }}>
                {item.label}
              </p>
              <h4 style={{ margin: 0, color: 'var(--ink)', fontSize: '0.9375rem', lineHeight: 1.25, fontWeight: 850 }}>
                {item.title}
              </h4>
              <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: '0.8125rem', lineHeight: 1.4, fontWeight: 650 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div
          className="foundation-spaced-review__footer"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 12,
            alignItems: 'center',
            border: '1px solid var(--ink-a10)',
            borderRadius: 14,
            background: 'var(--cream)',
            padding: '12px 14px',
          }}
        >
          <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.4, fontWeight: 725 }}>
            Say the prior rule out loud, then compare it to today&apos;s model.
          </p>
          <button
            type="button"
            aria-pressed={retrieved}
            onClick={toggleRetrieved}
            style={{
              minHeight: 44,
              border: '1px solid',
              borderColor: retrieved ? 'var(--ink)' : 'var(--ink-a10)',
              borderRadius: 12,
              background: retrieved ? 'var(--ink)' : '#fff',
              color: retrieved ? '#fff' : 'var(--ink)',
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
            {retrieved ? 'Remembered' : 'I remember these'}
          </button>
        </div>
      </div>
    </section>
  );
}
