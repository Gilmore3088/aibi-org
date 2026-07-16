'use client';

import { useState } from 'react';
import type { ArtifactFirstMeta } from '@content/courses/foundation-program';
import type { FoundationLabBrief } from '@content/courses/foundation-program/lab-first';
import { FONT_INTER, dispatchLearningSignal, eyebrowStyle } from './shared';

export function RetrievalWarmupPanel({
  brief,
  moduleNumber,
}: {
  readonly brief: FoundationLabBrief;
  readonly moduleNumber: number;
}) {
  const [draft, setDraft] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const hasDraft = draft.trim().length > 0;
  const memoryStorageKey = `foundation-memory-card-${moduleNumber}`;
  const comparePoints = [
    brief.visualModel[0],
    brief.visualModel[brief.visualModel.length - 1],
    brief.reviewChecklist[0],
  ].filter(Boolean);

  function compareWithModel() {
    if (!hasDraft) return;
    setShowFeedback(true);
    try {
      window.localStorage.setItem(memoryStorageKey, 'remembered');
    } catch {
      // Retrieval state is helpful evidence, but the module can continue without storage.
    }
    dispatchLearningSignal(moduleNumber, 'memory-card', true);
  }

  return (
    <section
      aria-labelledby={`m${moduleNumber}-retrieval-heading`}
      data-testid="foundation-retrieval-warmup"
      className="foundation-retrieval-warmup"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 0.34fr) minmax(0, 1fr)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          background: 'var(--ink)',
          color: '#fff',
          padding: 'clamp(20px, 2.6vw, 28px)',
        }}
      >
        <p style={{ ...eyebrowStyle, color: 'var(--gold-soft)', marginBottom: 10 }}>
          Recall first
        </p>
        <h3
          id={`m${moduleNumber}-retrieval-heading`}
          style={{
            margin: 0,
            fontSize: 'clamp(1.3125rem, 2vw, 1.75rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          Answer before you read.
        </h3>
        <p style={{ margin: '12px 0 0', color: 'var(--on-dark-70)', fontSize: '0.875rem', lineHeight: 1.55 }}>
          A quick retrieval rep before the lab.
        </p>
      </div>

      <div style={{ padding: 'clamp(20px, 2.6vw, 28px)' }}>
        <p style={{ margin: '0 0 12px', color: 'var(--ink)', fontSize: '1.0625rem', lineHeight: 1.45, fontWeight: 800 }}>
          {brief.learningLoop.recallPrompt}
        </p>
        <label
          htmlFor={`m${moduleNumber}-retrieval-note`}
          style={{
            display: 'block',
            color: 'var(--slate-500)',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Your answer
        </label>
        <textarea
          id={`m${moduleNumber}-retrieval-note`}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (showFeedback) {
              setShowFeedback(false);
            }
          }}
          rows={3}
          placeholder="Write one or two bullets from memory."
          style={{
            width: '100%',
            resize: 'vertical',
            minHeight: 92,
            border: '1px solid var(--ink-a10)',
            borderRadius: 14,
            background: 'var(--cream)',
            color: 'var(--ink)',
            fontFamily: FONT_INTER,
            fontSize: '0.9375rem',
            lineHeight: 1.45,
            fontWeight: 600,
            padding: '14px 16px',
            outlineColor: 'var(--gold)',
          }}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          <button
            type="button"
            onClick={compareWithModel}
            disabled={!hasDraft}
            style={{
              border: '1px solid',
              borderColor: hasDraft ? 'var(--ink)' : 'var(--ink-a10)',
              borderRadius: 999,
              background: hasDraft ? 'var(--ink)' : 'var(--cream)',
              color: hasDraft ? '#fff' : 'var(--slate-500)',
              padding: '11px 16px',
              fontFamily: FONT_INTER,
              fontSize: '0.8125rem',
              fontWeight: 850,
              cursor: hasDraft ? 'pointer' : 'not-allowed',
            }}
          >
            Compare with model
          </button>
          <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem', lineHeight: 1.4, fontWeight: 650 }}>
            Private note. Nothing saves here.
          </span>
        </div>

        {showFeedback && (
          <div
            aria-live="polite"
            style={{
              marginTop: 16,
              border: '1px solid var(--gold-a20)',
              borderRadius: 14,
              background: 'var(--cream-2)',
              padding: '14px 16px',
            }}
          >
            <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Compare against</p>
            <ul style={{ display: 'grid', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
              {comparePoints.map((point) => (
                <li key={point} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: 'var(--gold)',
                      marginTop: 8,
                      flex: '0 0 auto',
                    }}
                  />
                  <span style={{ color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 725 }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export function _RetrievalBridgePanel({
  brief,
  current,
  previous,
  moduleNumber,
}: {
  readonly brief: FoundationLabBrief;
  readonly current: ArtifactFirstMeta | undefined;
  readonly previous: ArtifactFirstMeta | undefined;
  readonly moduleNumber: number;
}) {
  const retrieveTitle = previous
    ? `Module ${String(previous.module).padStart(2, '0')}`
    : 'Start here';
  const retrieveBody = previous
    ? previous.saved
    : 'Choose one real, low-risk task you already do.';
  const carryBody = current
    ? current.mustProve
    : brief.learningLoop.feedbackCue;

  return (
    <section
      aria-label="Before the lab retrieval practice"
      data-testid="foundation-retrieval-bridge"
      className="foundation-retrieval-bridge"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(128px, 0.18fr) minmax(0, 1fr) minmax(190px, 0.24fr)',
        alignItems: 'stretch',
        borderTop: '1px solid var(--ink-a10)',
        borderBottom: '1px solid var(--ink-a10)',
        background: 'rgba(255,255,255,0.42)',
      }}
    >
      <div
        className="foundation-retrieval-bridge__label"
        style={{
          display: 'grid',
          gap: 8,
          alignContent: 'center',
          padding: 'clamp(14px, 1.8vw, 18px)',
          background: 'var(--ink)',
        }}
      >
        <p style={{ ...eyebrowStyle, color: 'var(--gold-soft)', marginBottom: 0 }}>
          Before lab
        </p>
        <h3
          style={{
            margin: 0,
            color: '#fff',
            fontSize: '1rem',
            lineHeight: 1.15,
            fontWeight: 850,
            letterSpacing: '-0.01em',
          }}
        >
          Remember first.
        </h3>
      </div>

      <div
        className="foundation-retrieval-bridge__prompt"
        style={{
          display: 'grid',
          gap: 7,
          alignContent: 'center',
          padding: 'clamp(14px, 1.8vw, 18px)',
        }}
      >
        <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 0 }}>
          {moduleNumber === 1 ? 'Anchor' : `Remember ${retrieveTitle}`}
        </p>
        <p
          className="foundation-retrieval-bridge__body"
          style={{
            margin: 0,
            color: 'var(--ink)',
            fontSize: '0.9375rem',
            lineHeight: 1.38,
            fontWeight: 750,
          }}
        >
          {retrieveBody} Then answer: {brief.learningLoop.recallPrompt}
        </p>
      </div>

      <div
        className="foundation-retrieval-bridge__use"
        style={{
          display: 'grid',
          gap: 7,
          alignContent: 'center',
          padding: 'clamp(14px, 1.8vw, 18px)',
          borderLeft: '1px solid var(--ink-a10)',
          background: 'var(--cream-2)',
        }}
      >
        <p style={{ ...eyebrowStyle, marginBottom: 0 }}>Save next</p>
        <p
          className="foundation-retrieval-bridge__body"
          style={{
            margin: 0,
            color: 'var(--ink)',
            fontSize: '0.875rem',
            lineHeight: 1.35,
            fontWeight: 750,
          }}
        >
          {current?.saved ?? carryBody}
        </p>
      </div>
    </section>
  );
}
