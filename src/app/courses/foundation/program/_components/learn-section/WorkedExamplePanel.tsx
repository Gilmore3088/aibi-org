'use client';

import { useState } from 'react';
import type {
  FoundationLabBrief,
  FoundationWorkedExample,
} from '@content/courses/foundation-program/lab-first';
import { FONT_INTER, eyebrowStyle } from './shared';

export function WorkedExamplePanel({
  example,
  moduleNumber,
}: {
  readonly example: FoundationWorkedExample;
  readonly moduleNumber: number;
}) {
  const panels = [
    {
      label: example.weakLabel,
      title: 'What to avoid',
      body: example.weak,
      tone: 'weak',
    },
    {
      label: example.strongLabel,
      title: 'What good looks like',
      body: example.strong,
      tone: 'strong',
    },
  ] as const;

  return (
    <section
      aria-labelledby={`m${moduleNumber}-worked-example-heading`}
      data-testid="foundation-worked-example"
      style={{
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          padding: '20px clamp(20px, 2.6vw, 28px)',
          borderBottom: '1px solid var(--ink-a10)',
          background: 'var(--cream)',
        }}
      >
        <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Worked example</p>
        <h3
          id={`m${moduleNumber}-worked-example-heading`}
          style={{
            margin: 0,
            color: 'var(--ink)',
            fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          Study one contrast before you practice.
        </h3>
      </div>

      <div
        className="foundation-worked-example__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        }}
      >
        {panels.map((panel, index) => {
          const isStrong = panel.tone === 'strong';
          return (
            <div
              key={panel.label}
              style={{
                padding: 'clamp(18px, 2.4vw, 24px)',
                borderLeft: index === 0 ? 'none' : '1px solid var(--ink-a10)',
                background: isStrong ? 'var(--cream-2)' : '#fff',
              }}
            >
              <p style={{ ...eyebrowStyle, color: isStrong ? 'var(--gold-deep)' : 'var(--slate-500)', marginBottom: 10 }}>
                {panel.label}
              </p>
              <h4
                style={{
                  margin: '0 0 10px',
                  color: 'var(--ink)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  fontWeight: 850,
                }}
              >
                {panel.title}
              </h4>
              <p
                style={{
                  margin: 0,
                  color: isStrong ? 'var(--ink)' : 'var(--slate-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.55,
                  fontWeight: 650,
                }}
              >
                {panel.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SelfExplanationPanel({
  brief,
  example,
  moduleNumber,
}: {
  readonly brief: FoundationLabBrief;
  readonly example: FoundationWorkedExample;
  readonly moduleNumber: number;
}) {
  const lenses = [
    {
      id: 'safety',
      label: 'Safety',
      prompt: brief.reviewChecklist[0],
      feedback: 'Find the boundary that keeps the work reviewable before it leaves the learner.',
    },
    {
      id: 'structure',
      label: 'Structure',
      prompt: brief.visualModel.join(' → '),
      feedback: 'Find the visible sequence that turns a vague request into a repeatable workflow.',
    },
    {
      id: 'transfer',
      label: 'Use at work',
      prompt: brief.qualitySignals[0],
      feedback: 'Find the cue that makes the example useful after this module, not just correct once.',
    },
  ] as const;
  const [selectedLens, setSelectedLens] = useState<(typeof lenses)[number]['id']>('safety');
  const activeLens = lenses.find((lens) => lens.id === selectedLens) ?? lenses[0];

  return (
    <section
      aria-labelledby={`m${moduleNumber}-self-explain-heading`}
      data-testid="foundation-self-explanation"
      className="foundation-self-explanation"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 0.34fr) minmax(0, 1fr)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div
        style={{
          background: 'var(--cream-2)',
          borderRight: '1px solid var(--ink-a10)',
          padding: 'clamp(18px, 2.4vw, 24px)',
        }}
      >
        <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Self-explain</p>
        <h3
          id={`m${moduleNumber}-self-explain-heading`}
          style={{
            margin: 0,
            color: 'var(--ink)',
            fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          Name why the better version works.
        </h3>
      </div>

      <div style={{ padding: 'clamp(18px, 2.4vw, 24px)' }}>
        <div
          role="group"
          aria-label="Choose a lens for explaining the worked example"
          className="foundation-self-explanation__buttons"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 8,
            marginBottom: 14,
          }}
        >
          {lenses.map((lens) => {
            const isActive = selectedLens === lens.id;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => setSelectedLens(lens.id)}
                aria-pressed={isActive}
                style={{
                  border: '1px solid',
                  borderColor: isActive ? 'var(--ink)' : 'var(--ink-a10)',
                  borderRadius: 12,
                  background: isActive ? 'var(--ink)' : 'var(--cream)',
                  color: isActive ? '#fff' : 'var(--ink)',
                  padding: '11px 10px',
                  fontFamily: FONT_INTER,
                  fontSize: '0.8125rem',
                  lineHeight: 1.15,
                  fontWeight: 850,
                  cursor: 'pointer',
                }}
              >
                {lens.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            border: '1px solid var(--ink-a10)',
            borderRadius: 14,
            background: 'var(--cream)',
            padding: '16px 18px',
          }}
        >
          <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 8 }}>
            Look for
          </p>
          <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.9375rem', lineHeight: 1.5, fontWeight: 775 }}>
            {activeLens.prompt}
          </p>
          <p style={{ margin: '12px 0 0', color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 650 }}>
            {activeLens.feedback} In this example: {example.why}
          </p>
        </div>
      </div>
    </section>
  );
}
