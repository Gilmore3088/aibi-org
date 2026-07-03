'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  FOUNDATION_FINAL_MODULE_NUMBER,
  getArtifactFirst,
  type ArtifactFirstMeta,
  type Section,
} from '@content/courses/foundation-program';
import {
  getFoundationLabBrief,
  getFoundationRoleTransfer,
  getFoundationWorkedExample,
  type FoundationLabBrief,
  type FoundationRoleTransfer,
  type FoundationWorkedExample,
} from '@content/courses/foundation-program/lab-first';
import { MarkdownRenderer } from '@/components/lms/MarkdownRenderer';
import { KnowledgeCheck } from './KnowledgeCheck';
import type { LearnerRole } from '@/types/course';

interface LearnSectionProps {
  readonly sections: readonly Section[];
  readonly keyTakeaways?: readonly string[];
  readonly moduleNumber: number;
  readonly learnerRole?: LearnerRole;
  /**
   * 'preview' renders the same Understand content on the public Module 1
   * preview: no in-course anchors (the lab/submit tabs don't exist there)
   * and the reference drawer starts open so visitors see real material.
   */
  readonly variant?: 'course' | 'preview';
}

const FONT_INTER = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const eyebrowStyle: CSSProperties = {
  fontFamily: FONT_INTER,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function dispatchLearningSignal(
  moduleNumber: number,
  signal: string,
  active: boolean,
  extraDetail?: Record<string, unknown>,
) {
  window.dispatchEvent(
    new CustomEvent('foundation-learning-signal-updated', {
      detail: { moduleNumber, signal, active, ...extraDetail },
    }),
  );
}

function totalReferenceMinutes(sections: readonly Section[]): number {
  return sections.reduce((sum, section) => {
    const subsectionText = section.subsections?.map((sub) => sub.content).join(' ') ?? '';
    return sum + estimateReadingTime(`${section.content} ${subsectionText}`);
  }, 0);
}

function stripMarkdownForPreview(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function previewText(content: string, maxLength = 150): string {
  const firstParagraph =
    content
      .split(/\n{2,}/)
      .map(stripMarkdownForPreview)
      .find(Boolean) ?? stripMarkdownForPreview(content);

  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  const truncated = firstParagraph.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 80 ? lastSpace : maxLength).trim()}...`;
}

function StepNumber({ index }: { readonly index: number }) {
  return (
    <span
      className="foundation-step-number"
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        width: 28,
        height: 28,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ink)',
        color: 'var(--cream)',
        fontSize: 12,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        flex: '0 0 auto',
      }}
    >
      {index + 1}
    </span>
  );
}

function MemoryCardPanel({
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
              fontSize: 'clamp(22px, 2vw, 28px)',
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Keep the rule, not the chapter.
          </h3>
        </div>
        <p style={{ margin: 0, color: 'var(--on-dark-70)', fontSize: 14, lineHeight: 1.45, fontWeight: 650 }}>
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
              <p style={{ margin: 0, color: 'var(--ink)', fontSize: 14, lineHeight: 1.38, fontWeight: 760 }}>
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
            <p style={{ margin: 0, color: 'var(--ink)', fontSize: 14, lineHeight: 1.35, fontWeight: 760 }}>
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
              fontSize: 12,
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

function PacketContinuityPanel({
  current,
  previous,
  next,
  moduleNumber,
}: {
  readonly current: ArtifactFirstMeta | undefined;
  readonly previous: ArtifactFirstMeta | undefined;
  readonly next: ArtifactFirstMeta | undefined;
  readonly moduleNumber: number;
}) {
  const items = [
    {
      label: moduleNumber === 1 ? 'Start with work' : 'Remember',
      title: previous ? `Module ${previous.module}: ${previous.saved}` : 'One real task from this week',
      body: previous
        ? 'Before the lab, recall what you saved and name one rule you still need to apply.'
        : 'Choose a realistic, non-sensitive task so the course starts from work you actually recognize.',
    },
    {
      label: 'Build today',
      title: current?.saved ?? 'This module artifact',
      body: current
        ? current.mustProve
        : 'Produce one inspected artifact before moving to the next module.',
    },
    {
      label: next ? 'Carry forward' : 'Use after course',
      title: next ? `Module ${next.module}: ${next.saved}` : 'Your complete Foundation Packet',
      body: next
        ? 'The artifact you save here becomes context for the next module, not a one-off exercise.'
        : 'Use the packet as evidence of safe, reviewable AI practice in your role.',
    },
  ] as const;

  return (
    <details
      aria-labelledby={`m${moduleNumber}-continuity-heading`}
      data-testid="foundation-packet-continuity"
      style={{
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        background: 'var(--cream)',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          padding: '18px clamp(20px, 2.6vw, 26px)',
          display: 'flex',
          gap: 16,
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          cursor: 'pointer',
          listStyle: 'none',
        }}
      >
        <div>
          <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Packet connection</p>
          <h3
            id={`m${moduleNumber}-continuity-heading`}
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontSize: 'clamp(20px, 2vw, 26px)',
              lineHeight: 1.12,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Need the course thread? Open the packet context.
          </h3>
        </div>
        <span
          style={{
            color: 'var(--slate-500)',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Optional
        </span>
      </summary>

      <div
        className="foundation-continuity__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.label}
            style={{
              padding: 'clamp(18px, 2.4vw, 24px)',
              borderLeft: index === 0 ? 'none' : '1px solid var(--ink-a10)',
              background: index === 1 ? '#fff' : 'transparent',
            }}
          >
            <p style={{ ...eyebrowStyle, color: index === 1 ? 'var(--gold-deep)' : 'var(--slate-500)', marginBottom: 10 }}>
              {item.label}
            </p>
            <h4
              style={{
                margin: '0 0 8px',
                color: 'var(--ink)',
                fontSize: 16,
                lineHeight: 1.25,
                fontWeight: 850,
                letterSpacing: '-0.01em',
              }}
            >
              {item.title}
            </h4>
            <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: 14, lineHeight: 1.5, fontWeight: 600 }}>
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}

function WorkedExamplePanel({
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
            fontSize: 'clamp(20px, 2vw, 26px)',
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
                  fontSize: 17,
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
                  fontSize: 15,
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

function SelfExplanationPanel({
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
            fontSize: 'clamp(20px, 2vw, 26px)',
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
                  fontSize: 13,
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
          <p style={{ margin: 0, color: 'var(--ink)', fontSize: 15, lineHeight: 1.5, fontWeight: 775 }}>
            {activeLens.prompt}
          </p>
          <p style={{ margin: '12px 0 0', color: 'var(--slate-600)', fontSize: 14, lineHeight: 1.5, fontWeight: 650 }}>
            {activeLens.feedback} In this example: {example.why}
          </p>
        </div>
      </div>
    </section>
  );
}

function RetrievalWarmupPanel({
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
            fontSize: 'clamp(21px, 2vw, 28px)',
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          Answer before you read.
        </h3>
        <p style={{ margin: '12px 0 0', color: 'var(--on-dark-70)', fontSize: 14, lineHeight: 1.55 }}>
          A quick retrieval rep before the lab.
        </p>
      </div>

      <div style={{ padding: 'clamp(20px, 2.6vw, 28px)' }}>
        <p style={{ margin: '0 0 12px', color: 'var(--ink)', fontSize: 17, lineHeight: 1.45, fontWeight: 800 }}>
          {brief.learningLoop.recallPrompt}
        </p>
        <label
          htmlFor={`m${moduleNumber}-retrieval-note`}
          style={{
            display: 'block',
            color: 'var(--slate-500)',
            fontSize: 12,
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
            fontSize: 15,
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
              fontSize: 13,
              fontWeight: 850,
              cursor: hasDraft ? 'pointer' : 'not-allowed',
            }}
          >
            Compare with model
          </button>
          <span style={{ color: 'var(--slate-500)', fontSize: 13, lineHeight: 1.4, fontWeight: 650 }}>
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
                  <span style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.45, fontWeight: 725 }}>
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

function SpacedReviewPanel({
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
              fontSize: 'clamp(20px, 2vw, 26px)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Bring back the last skill before you add this one.
          </h3>
        </div>
        <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: 14, lineHeight: 1.45, fontWeight: 675 }}>
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
              <h4 style={{ margin: 0, color: 'var(--ink)', fontSize: 15, lineHeight: 1.25, fontWeight: 850 }}>
                {item.title}
              </h4>
              <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: 13, lineHeight: 1.4, fontWeight: 650 }}>
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
          <p style={{ margin: 0, color: 'var(--ink)', fontSize: 14, lineHeight: 1.4, fontWeight: 725 }}>
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
              fontSize: 12,
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

function ReadinessCheckPanel({
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
            fontSize: 'clamp(20px, 2vw, 26px)',
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
                  fontSize: 13,
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
            fontSize: 15,
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
                fontSize: 13,
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
                fontSize: 13,
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
              fontSize: 13,
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
                  fontSize: 14,
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
                  fontSize: 11,
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
                fontSize: 14,
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
                    fontSize: 12,
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
              <span style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.45, fontWeight: 700 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function _RetrievalBridgePanel({
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
            fontSize: 16,
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
            fontSize: 15,
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
            fontSize: 14,
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

function RoleTransferPanel({
  transfer,
  moduleNumber,
}: {
  readonly transfer: FoundationRoleTransfer;
  readonly moduleNumber: number;
}) {
  const roleDescriptor =
    transfer.roleLabel === 'IT / InfoSec' ? transfer.roleLabel : transfer.roleLabel.toLowerCase();
  const headline =
    transfer.roleLabel === 'Your role'
      ? 'Apply this to your work.'
      : `Apply this to ${roleDescriptor} work.`;
  const items = [
    {
      label: 'Use this on',
      body: transfer.roleContext,
    },
    {
      label: 'Do the move',
      body: transfer.transferMove,
    },
    {
      label: 'Proof to save',
      body: transfer.proofToSave,
    },
  ] as const;

  return (
    <section
      aria-labelledby={`m${moduleNumber}-role-transfer-heading`}
      data-testid="foundation-role-transfer"
      className="foundation-role-transfer"
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
          background: 'var(--cream-2)',
          borderRight: '1px solid var(--ink-a10)',
          padding: 'clamp(18px, 2.4vw, 24px)',
        }}
      >
        <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Role transfer</p>
        <h3
          id={`m${moduleNumber}-role-transfer-heading`}
          style={{
            margin: 0,
            color: 'var(--ink)',
            fontSize: 'clamp(20px, 2vw, 26px)',
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          {headline}
        </h3>
      </div>

      <div
        className="foundation-role-transfer__items"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.label}
            className="foundation-role-transfer__item"
            style={{
              display: 'grid',
              gridTemplateColumns: '132px minmax(0, 1fr)',
              gap: 18,
              alignItems: 'start',
              padding: 'clamp(18px, 2.2vw, 24px)',
              borderTop: index === 0 ? 'none' : '1px solid var(--ink-a10)',
            }}
          >
            <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 10 }}>
              {item.label}
            </p>
            <p style={{ margin: 0, color: 'var(--ink)', fontSize: 15, lineHeight: 1.5, fontWeight: 725 }}>
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PracticeCoachPanel({
  brief,
  workedExample,
  roleTransfer,
  moduleNumber,
}: {
  readonly brief: FoundationLabBrief;
  readonly workedExample: FoundationWorkedExample | undefined;
  readonly roleTransfer: FoundationRoleTransfer | undefined;
  readonly moduleNumber: number;
}) {
  type CoachTab = {
    readonly id: string;
    readonly label: string;
    readonly cue: string;
  };
  const tabs: readonly CoachTab[] = [
    { id: 'decide', label: 'Decide', cue: 'Make one safe-use decision before seeing the worked example.' },
    ...(workedExample
      ? [
          { id: 'contrast', label: 'Contrast', cue: 'Now study one weak-vs-strong example and compare it to your decision.' },
          { id: 'explain', label: 'Explain', cue: 'Name why the stronger version works so the rule sticks.' },
        ]
      : []),
    ...(roleTransfer
      ? [{ id: 'transfer', label: 'Use at work', cue: 'Connect the pattern to work from your role.' }]
      : []),
    { id: 'ready', label: 'Ready', cue: 'Check whether you can produce the artifact without rereading.' },
  ];
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [visitedTabs, setVisitedTabs] = useState<ReadonlySet<string>>(() => new Set([tabs[0].id]));
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === active.id));
  const previousTab = activeIndex > 0 ? tabs[activeIndex - 1] : undefined;
  const nextTab = activeIndex < tabs.length - 1 ? tabs[activeIndex + 1] : undefined;
  const visitedCount = tabs.filter((tab) => visitedTabs.has(tab.id)).length;

  function openTab(tabId: string) {
    setActiveTab(tabId);
    setVisitedTabs((previous) => {
      const next = new Set(previous);
      next.add(tabId);
      return next;
    });
  }

  return (
    <section
      aria-labelledby={`m${moduleNumber}-practice-coach-heading`}
      data-testid="foundation-practice-coach"
      style={{
        display: 'grid',
        gap: 12,
      }}
    >
      <div
        style={{
          border: '1px solid var(--ink-a10)',
          borderRadius: 18,
          background: 'var(--cream)',
          padding: '18px clamp(20px, 2.6vw, 26px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.72fr) minmax(320px, 0.28fr)',
          gap: 18,
          alignItems: 'end',
        }}
        className="foundation-practice-coach__header"
      >
        <div>
          <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Practice coach</p>
          <h3
            id={`m${moduleNumber}-practice-coach-heading`}
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontSize: 'clamp(21px, 2vw, 28px)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Make a decision, compare the example, then use the lab.
          </h3>
        </div>
        <div
          role="tablist"
          aria-label="Practice coach views"
          className="foundation-practice-coach__tabs"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
            gap: 8,
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === active.id;
            const isVisited = visitedTabs.has(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`m${moduleNumber}-coach-${tab.id}`}
                id={`m${moduleNumber}-coach-${tab.id}-tab`}
                onClick={() => openTab(tab.id)}
                style={{
                  border: '1px solid',
                  borderColor: isActive ? 'var(--ink)' : 'var(--ink-a10)',
                  borderRadius: 12,
                  background: isActive ? 'var(--ink)' : isVisited ? 'var(--cream)' : '#fff',
                  color: isActive ? '#fff' : 'var(--ink)',
                  padding: '11px 10px',
                  minHeight: 44,
                  fontFamily: FONT_INTER,
                  fontSize: 13,
                  lineHeight: 1.15,
                  fontWeight: 850,
                  cursor: 'pointer',
                  boxShadow: isVisited && !isActive ? 'inset 0 -3px 0 var(--gold-a20)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="foundation-practice-coach__cue"
        aria-live="polite"
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          gap: 12,
          alignItems: 'center',
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
          background: '#fff',
          padding: '12px 14px',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 32,
            padding: '0 11px',
            borderRadius: 999,
            background: 'var(--ink)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Rep {activeIndex + 1}/{tabs.length}
        </span>
        <p style={{ margin: 0, color: 'var(--ink)', fontSize: 14, lineHeight: 1.35, fontWeight: 760 }}>
          {active.cue}
        </p>
        <span
          style={{
            color: 'var(--slate-500)',
            fontSize: 10,
            fontWeight: 850,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {visitedCount}/{tabs.length} opened
        </span>
      </div>

      <div
        id={`m${moduleNumber}-coach-${active.id}`}
        role="tabpanel"
        aria-labelledby={`m${moduleNumber}-coach-${active.id}-tab`}
      >
        {active.id === 'contrast' && workedExample ? (
          <WorkedExamplePanel example={workedExample} moduleNumber={moduleNumber} />
        ) : null}
        {active.id === 'explain' && workedExample ? (
          <SelfExplanationPanel brief={brief} example={workedExample} moduleNumber={moduleNumber} />
        ) : null}
        {active.id === 'decide' ? (
          <section data-testid="foundation-decision-drill">
            <KnowledgeCheck
              kicker="Decision drill"
              prompt={brief.decisionDrill.prompt}
              options={brief.decisionDrill.options}
              transferCue={brief.learningLoop.transferPrompt}
              nextHref="#st-sandbox"
            />
          </section>
        ) : null}
        {active.id === 'transfer' && roleTransfer ? (
          <RoleTransferPanel transfer={roleTransfer} moduleNumber={moduleNumber} />
        ) : null}
        {active.id === 'ready' ? (
          <ReadinessCheckPanel brief={brief} moduleNumber={moduleNumber} />
        ) : null}
      </div>

      <div
        className="foundation-practice-coach__footer"
        aria-label="Practice coach progress"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 12,
          alignItems: 'center',
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
          background: '#fff',
          padding: '12px 14px',
        }}
      >
        <p
          aria-live="polite"
          style={{
            margin: 0,
            color: 'var(--slate-500)',
            fontSize: 14,
            lineHeight: 1.3,
            fontWeight: 750,
          }}
        >
          Step {activeIndex + 1} of {tabs.length} · {visitedCount}/{tabs.length} opened
        </p>
        <div
          className="foundation-practice-coach__footer-actions"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {previousTab ? (
            <button
              type="button"
              onClick={() => openTab(previousTab.id)}
              style={{
                minHeight: 44,
                border: '1px solid var(--ink-a10)',
                borderRadius: 12,
                background: 'var(--cream)',
                color: 'var(--ink)',
                padding: '0 16px',
                fontFamily: FONT_INTER,
                fontSize: 14,
                lineHeight: 1.1,
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          ) : null}
          {nextTab ? (
            <button
              type="button"
              onClick={() => openTab(nextTab.id)}
              style={{
                minHeight: 44,
                border: '1px solid var(--ink)',
                borderRadius: 12,
                background: 'var(--ink)',
                color: '#fff',
                padding: '0 18px',
                fontFamily: FONT_INTER,
                fontSize: 14,
                lineHeight: 1.1,
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Next: {nextTab.label}
            </button>
          ) : (
            <a
              href="#st-sandbox"
              style={{
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--ink)',
                borderRadius: 12,
                background: 'var(--ink)',
                color: '#fff',
                padding: '0 18px',
                fontFamily: FONT_INTER,
                fontSize: 14,
                lineHeight: 1.1,
                fontWeight: 850,
                textDecoration: 'none',
              }}
            >
              Open AiBI Lab
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function QualityGatePanel({
  brief,
  keyTakeaways,
  moduleNumber,
}: {
  readonly brief: FoundationLabBrief;
  readonly keyTakeaways?: readonly string[];
  readonly moduleNumber: number;
}) {
  const tabs = [
    {
      id: 'review',
      label: 'Review',
      eyebrow: 'Before submit',
      heading: 'Check the artifact before it leaves the lab.',
      items: brief.reviewChecklist,
    },
    {
      id: 'signals',
      label: 'Signals',
      eyebrow: 'Manager-ready',
      heading: 'Make the proof visible to someone else.',
      items: brief.qualitySignals,
    },
    ...(keyTakeaways && keyTakeaways.length > 0
      ? [
          {
            id: 'takeaways',
            label: 'Takeaways',
            eyebrow: 'Keep',
            heading: 'Carry these points into the artifact.',
            items: keyTakeaways.slice(0, 3),
          },
        ]
      : []),
  ] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('review');
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section
      aria-labelledby={`m${moduleNumber}-quality-gate-heading`}
      data-testid="foundation-quality-gate"
      className="foundation-quality-gate"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 0.34fr) minmax(0, 1fr)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        background: '#fff',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          background: 'var(--cream-2)',
          borderRight: '1px solid var(--ink-a10)',
          padding: 'clamp(18px, 2.4vw, 24px)',
        }}
      >
        <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Quality gate</p>
        <h3
          id={`m${moduleNumber}-quality-gate-heading`}
          style={{
            margin: 0,
            color: 'var(--ink)',
            fontSize: 'clamp(20px, 2vw, 26px)',
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          One rubric before you submit.
        </h3>
      </div>

      <div style={{ padding: 'clamp(18px, 2.4vw, 24px)' }}>
        <div
          role="tablist"
          aria-label="Quality gate views"
          className="foundation-quality-gate__tabs"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
            gap: 8,
            marginBottom: 16,
          }}
        >
          {tabs.map((tab) => {
            const isActive = active.id === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`m${moduleNumber}-quality-${tab.id}`}
                id={`m${moduleNumber}-quality-${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  border: '1px solid',
                  borderColor: isActive ? 'var(--ink)' : 'var(--ink-a10)',
                  borderRadius: 12,
                  background: isActive ? 'var(--ink)' : 'var(--cream)',
                  color: isActive ? '#fff' : 'var(--ink)',
                  padding: '11px 10px',
                  fontFamily: FONT_INTER,
                  fontSize: 13,
                  lineHeight: 1.15,
                  fontWeight: 850,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`m${moduleNumber}-quality-${active.id}`}
          role="tabpanel"
          aria-labelledby={`m${moduleNumber}-quality-${active.id}-tab`}
          style={{
            border: '1px solid var(--ink-a10)',
            borderRadius: 14,
            background: 'var(--cream)',
            padding: '16px 18px',
          }}
        >
          <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 8 }}>
            {active.eyebrow}
          </p>
          <h4 style={{ margin: '0 0 12px', color: 'var(--ink)', fontSize: 17, lineHeight: 1.2, fontWeight: 850 }}>
            {active.heading}
          </h4>
          <ul style={{ display: 'grid', gap: 9, margin: 0, padding: 0, listStyle: 'none' }}>
            {active.items.map((item) => (
              <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: active.id === 'signals' ? 'var(--ink)' : 'var(--gold)',
                    marginTop: 8,
                    flex: '0 0 auto',
                  }}
                />
                <span style={{ color: 'var(--ink)', fontSize: 15, lineHeight: 1.45, fontWeight: 650 }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function LearnSection({
  sections,
  keyTakeaways,
  moduleNumber,
  learnerRole = 'other',
  variant = 'course',
}: LearnSectionProps) {
  const isPreview = variant === 'preview';
  const brief = getFoundationLabBrief(moduleNumber);
  const currentArtifact = getArtifactFirst(moduleNumber);
  const previousArtifact = moduleNumber > 1 ? getArtifactFirst(moduleNumber - 1) : undefined;
  const olderArtifact = moduleNumber > 2 ? getArtifactFirst(moduleNumber - 2) : undefined;
  const nextArtifact =
    moduleNumber < FOUNDATION_FINAL_MODULE_NUMBER
      ? getArtifactFirst(moduleNumber + 1)
      : undefined;
  const previousBrief = moduleNumber > 1 ? getFoundationLabBrief(moduleNumber - 1) : undefined;
  const olderBrief = moduleNumber > 2 ? getFoundationLabBrief(moduleNumber - 2) : undefined;
  const workedExample = getFoundationWorkedExample(moduleNumber);
  const roleTransfer = getFoundationRoleTransfer(moduleNumber, learnerRole);
  const minutes = totalReferenceMinutes(sections);

  if (!brief) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {sections.map((section) => (
          <details
            key={section.id}
            style={{
              border: '1px solid var(--ink-a10)',
              borderRadius: 16,
              background: 'var(--cream)',
              overflow: 'hidden',
            }}
          >
            <summary
              style={{
                padding: '18px 22px',
                cursor: 'pointer',
                fontFamily: FONT_INTER,
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              {section.title}
            </summary>
            <div style={{ padding: '0 24px 24px' }}>
              <MarkdownRenderer content={section.content} />
            </div>
          </details>
        ))}
      </div>
    );
  }

  const understandItems = [
    {
      label: 'Guardrail',
      body: currentArtifact?.mustProve ?? brief.qualitySignals[0],
    },
    {
      label: 'Model',
      body: brief.visualModel.join(' -> '),
    },
  ] as const;

  if (moduleNumber > 0) {
    return (
      <div style={{ display: 'grid', gap: 12, fontFamily: FONT_INTER }}>
        <section
          aria-labelledby={`m${moduleNumber}-guided-understand-heading`}
          data-testid="foundation-guided-understand"
          className="foundation-guided-understand"
          style={{
            border: '1px solid var(--ink-a10)',
            borderRadius: 18,
            background: '#fff',
            boxShadow: 'var(--shadow-soft)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 18,
              alignItems: 'center',
              padding: 'clamp(18px, 2.6vw, 26px)',
            }}
            className="foundation-guided-understand__brief"
          >
            <div>
              <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Start with this</p>
              <h3
                id={`m${moduleNumber}-guided-understand-heading`}
                style={{
                  margin: 0,
                  color: 'var(--ink)',
                  fontSize: 'clamp(24px, 2.4vw, 34px)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  fontWeight: 875,
                }}
              >
                {brief.concept}
              </h3>
            </div>
            {!isPreview && (
              <a
                href="#st-sandbox"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 44,
                  borderRadius: 12,
                  background: 'var(--ink)',
                  color: '#fff',
                  padding: '0 16px',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 875,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Try it
              </a>
            )}
          </div>

          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${understandItems.length}, minmax(0, 1fr))`,
              gap: 0,
              margin: 0,
              borderTop: '1px solid var(--ink-a10)',
              background: 'var(--cream-2)',
            }}
            className="foundation-guided-understand__facts"
          >
            {understandItems.map((item, index) => (
              <div
                key={item.label}
                style={{
                  padding: '16px 18px',
                  borderLeft: index === 0 ? 'none' : '1px solid var(--ink-a10)',
                }}
              >
                <dt style={{ ...eyebrowStyle, color: index === 0 ? 'var(--gold-deep)' : 'var(--slate-500)', marginBottom: 7 }}>
                  {item.label}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    color: 'var(--ink)',
                    fontSize: 15,
                    lineHeight: 1.42,
                    fontWeight: 730,
                  }}
                >
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: workedExample ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr',
            gap: 10,
          }}
          className="foundation-guided-understand__drawers"
        >
          {workedExample && (
            <details
              data-testid="foundation-quick-example"
              open
              style={{
                border: '1px solid var(--ink-a10)',
                borderRadius: 14,
                background: 'var(--cream)',
                overflow: 'hidden',
              }}
            >
              <summary
                style={{
                  padding: '15px 18px',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'baseline',
                }}
              >
                <span style={{ ...eyebrowStyle }}>Example</span>
                <span style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.3, fontWeight: 850 }}>
                  Weak vs. better
                </span>
              </summary>
              <div style={{ borderTop: '1px solid var(--ink-a10)', padding: 18, background: '#fff' }}>
                <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: 14, lineHeight: 1.45, fontWeight: 650 }}>
                  <strong>{workedExample.weakLabel}:</strong> {workedExample.weak}
                </p>
                <p style={{ margin: '12px 0 0', color: 'var(--ink)', fontSize: 14, lineHeight: 1.45, fontWeight: 740 }}>
                  <strong>{workedExample.strongLabel}:</strong> {workedExample.strong}
                </p>
              </div>
            </details>
          )}

          <details
            id={`m${moduleNumber}-reference-drawer`}
            data-testid="foundation-reference-drawer"
            className="foundation-reference-drawer"
            open={isPreview || undefined}
            style={{
              border: '1px solid var(--ink-a10)',
              borderRadius: 14,
              background: 'var(--cream)',
              overflow: 'hidden',
            }}
          >
            <summary
              className="foundation-reference-summary"
              style={{
                padding: '15px 18px',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                cursor: 'pointer',
                listStyle: 'none',
              }}
            >
              <span style={{ ...eyebrowStyle }}>Reference</span>
              <span style={{ color: 'var(--slate-500)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {minutes} min optional
              </span>
            </summary>
            <div
              data-testid="foundation-reference-map"
              className="foundation-reference-map"
              style={{
                display: 'grid',
                gap: 10,
                borderTop: '1px solid var(--ink-a10)',
                padding: 14,
                background: '#fff',
              }}
            >
              {keyTakeaways && keyTakeaways.length > 0 && (
                <ul style={{ display: 'grid', gap: 7, margin: 0, padding: 0, listStyle: 'none' }}>
                  {keyTakeaways.slice(0, 3).map((item) => (
                    <li key={item} style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.4, fontWeight: 700 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {sections.map((section) => (
                <details
                  key={section.id}
                  style={{
                    borderTop: '1px solid var(--ink-a10)',
                    paddingTop: 10,
                  }}
                >
                  <summary
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      color: 'var(--ink)',
                      fontSize: 15,
                      fontWeight: 850,
                      lineHeight: 1.25,
                    }}
                  >
                    <span>{section.title}</span>
                    <span style={{ color: 'var(--slate-500)', fontSize: 11, fontWeight: 850, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      Open
                    </span>
                  </summary>
                  <div style={{ padding: '10px 0 4px' }}>
                    <MarkdownRenderer content={section.content} />
                    {section.tryThis && (
                      <p style={{ margin: '12px 0 0', color: 'var(--ink)', fontSize: 14, lineHeight: 1.5, fontWeight: 750 }}>
                        Try: {section.tryThis}
                      </p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </details>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              .foundation-guided-understand summary::-webkit-details-marker,
              .foundation-guided-understand__drawers summary::-webkit-details-marker {
                display: none;
              }
              .foundation-guided-understand {
                box-shadow: none !important;
              }
              @media (max-width: 760px) {
                .foundation-guided-understand__brief,
                .foundation-guided-understand__facts,
                .foundation-guided-understand__drawers {
                  grid-template-columns: 1fr !important;
                }
                .foundation-guided-understand__brief a {
                  width: 100% !important;
                }
                .foundation-guided-understand__facts > div {
                  border-left: none !important;
                  border-top: 1px solid var(--ink-a10) !important;
                }
                .foundation-guided-understand__facts > div:first-child {
                  border-top: none !important;
                }
              }
            `,
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 22, fontFamily: FONT_INTER }}>
      <RetrievalWarmupPanel brief={brief} moduleNumber={moduleNumber} />

      {moduleNumber > 1 ? (
        <SpacedReviewPanel
          currentBrief={brief}
          previous={previousArtifact}
          older={olderArtifact}
          previousBrief={previousBrief}
          olderBrief={olderBrief}
          moduleNumber={moduleNumber}
        />
      ) : null}

      <section
        aria-labelledby={`m${moduleNumber}-lab-first-heading`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 0.32fr) minmax(0, 1fr)',
          gap: 0,
          border: '1px solid var(--ink-a10)',
          borderRadius: 18,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: 'var(--shadow-soft)',
        }}
        className="foundation-lab-brief"
      >
        <div className="foundation-lab-brief__task" style={{ padding: 'clamp(18px, 2.4vw, 24px)' }}>
          <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Compare model</p>
          <h3
            className="foundation-lab-brief__title"
            id={`m${moduleNumber}-lab-first-heading`}
            style={{
              margin: '0 0 10px',
              color: 'var(--ink)',
              fontSize: 'clamp(21px, 2vw, 28px)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Check your answer against the sequence.
          </h3>
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--slate-600)',
              fontSize: 14,
              lineHeight: 1.45,
              fontWeight: 650,
            }}
          >
            Use the model to spot what you missed, then practice with the sample banking data.
          </p>

          <div
            className="foundation-lab-brief__actions"
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <a
              href="#st-sandbox"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 42,
                padding: '10px 16px',
                borderRadius: 999,
                background: 'var(--ink)',
                color: '#fff',
                fontFamily: FONT_INTER,
                fontSize: 13,
                fontWeight: 850,
                textDecoration: 'none',
              }}
            >
              Open AiBI Lab
            </a>
            <a
              href="#st-submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 42,
                padding: '10px 16px',
                borderRadius: 999,
                border: '1px solid var(--ink-a10)',
                background: 'var(--cream)',
                color: 'var(--ink)',
                fontFamily: FONT_INTER,
                fontSize: 13,
                fontWeight: 850,
                textDecoration: 'none',
              }}
            >
              Submit artifact
            </a>
          </div>
        </div>

        <div
          className="foundation-lab-brief__model"
          style={{
            background: 'var(--cream-2)',
            borderLeft: '1px solid var(--ink-a10)',
            padding: 'clamp(18px, 2.4vw, 24px)',
            display: 'grid',
            alignContent: 'center',
          }}
        >
          <ol
            className="foundation-lab-brief__model-list"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))',
              gap: 10,
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {brief.visualModel.map((item, index) => (
              <li
                key={item}
                className="foundation-lab-brief__model-step"
                style={{
                  display: 'grid',
                  gap: 10,
                  alignItems: 'start',
                  padding: '13px 14px',
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 14,
                  background: '#fff',
                  minHeight: 112,
                }}
              >
                <StepNumber index={index} />
                <span style={{ color: 'var(--ink)', fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}>
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PracticeCoachPanel
        brief={brief}
        workedExample={workedExample}
        roleTransfer={roleTransfer}
        moduleNumber={moduleNumber}
      />

      <details
        data-testid="foundation-optional-study-aids"
        className="foundation-optional-study-aids"
        style={{
          border: '1px solid var(--ink-a10)',
          borderRadius: 18,
          background: 'var(--cream)',
          overflow: 'hidden',
        }}
      >
        <summary
          style={{
            padding: '16px clamp(18px, 2.4vw, 24px)',
            display: 'flex',
            gap: 14,
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            cursor: 'pointer',
            listStyle: 'none',
          }}
        >
          <div>
            <p className="foundation-drawer-kicker" style={{ ...eyebrowStyle, marginBottom: 6 }}>Optional support</p>
            <h3
              className="foundation-drawer-title"
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontSize: 'clamp(19px, 1.8vw, 24px)',
                lineHeight: 1.12,
                letterSpacing: '-0.01em',
                fontWeight: 850,
              }}
            >
              Memory card, packet context, and rubric.
            </h3>
          </div>
          <span
            style={{
              color: 'var(--slate-500)',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Support
          </span>
        </summary>
        <div
          style={{
            display: 'grid',
            gap: 12,
            borderTop: '1px solid var(--ink-a10)',
            padding: '14px clamp(14px, 2vw, 18px) 18px',
          }}
        >
          <MemoryCardPanel
            brief={brief}
            current={currentArtifact}
            moduleNumber={moduleNumber}
          />
          <PacketContinuityPanel
            current={currentArtifact}
            previous={previousArtifact}
            next={nextArtifact}
            moduleNumber={moduleNumber}
          />
          <QualityGatePanel brief={brief} keyTakeaways={keyTakeaways} moduleNumber={moduleNumber} />
        </div>
      </details>

      <section aria-labelledby={`m${moduleNumber}-reference-heading`}>
        <details
          id={`m${moduleNumber}-reference-drawer`}
          data-testid="foundation-reference-drawer"
          className="foundation-reference-drawer"
          style={{
            border: '1px solid var(--ink-a10)',
            borderRadius: 18,
            background: 'var(--cream)',
            overflow: 'hidden',
          }}
        >
          <summary
            className="foundation-reference-summary"
            style={{
              padding: '16px clamp(18px, 2.4vw, 24px)',
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              cursor: 'pointer',
              listStyle: 'none',
            }}
          >
            <h3
              className="foundation-drawer-title"
              id={`m${moduleNumber}-reference-heading`}
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontSize: 'clamp(19px, 1.8vw, 24px)',
                lineHeight: 1.2,
                fontWeight: 850,
                letterSpacing: '-0.01em',
              }}
            >
              Reference: {brief.referenceLabel}
            </h3>
            <span style={{ color: 'var(--slate-500)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {minutes} min optional
            </span>
          </summary>

          <div
            style={{
              display: 'grid',
              gap: 10,
              borderTop: '1px solid var(--ink-a10)',
              padding: '14px clamp(14px, 2vw, 18px) 18px',
            }}
          >
            {sections.length > 0 && (
              <div
                data-testid="foundation-reference-map"
                className="foundation-reference-map"
                style={{
                  display: 'grid',
                  gap: 12,
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 16,
                  background: '#fff',
                  padding: '16px clamp(16px, 2vw, 20px)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <p style={{ ...eyebrowStyle, marginBottom: 6 }}>Reference map</p>
                    <h4
                      style={{
                        margin: 0,
                        color: 'var(--ink)',
                        fontSize: 'clamp(18px, 1.6vw, 22px)',
                        lineHeight: 1.15,
                        fontWeight: 850,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Open only what helps your lab work.
                    </h4>
                  </div>
                  <span
                    style={{
                      color: 'var(--slate-500)',
                      fontSize: 12,
                      lineHeight: 1.2,
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Targeted study
                  </span>
                </div>

                <ol
                  style={{
                    display: 'grid',
                    gap: 0,
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                  }}
                >
                  {sections.map((section, index) => {
                    const sectionMinutes = estimateReadingTime(
                      `${section.content} ${section.subsections?.map((sub) => sub.content).join(' ') ?? ''}`,
                    );
                    return (
                      <li
                        key={section.id}
                        className="foundation-reference-map__item"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 0.58fr) minmax(220px, 0.42fr)',
                          gap: 18,
                          padding: '14px 0',
                          borderTop: index === 0 ? 'none' : '1px solid var(--ink-a10)',
                        }}
                      >
                        <div>
                          <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 6 }}>
                            {String(index + 1).padStart(2, '0')} · {sectionMinutes} min
                          </p>
                          <h5
                            style={{
                              margin: '0 0 7px',
                              color: 'var(--ink)',
                              fontSize: 16,
                              lineHeight: 1.25,
                              fontWeight: 850,
                            }}
                          >
                            {section.title}
                          </h5>
                          <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: 14, lineHeight: 1.45, fontWeight: 650 }}>
                            {previewText(section.content)}
                          </p>
                        </div>
                        <div
                          style={{
                            borderLeft: '1px solid var(--ink-a10)',
                            paddingLeft: 18,
                          }}
                          className="foundation-reference-map__practice"
                        >
                          <p style={{ ...eyebrowStyle, color: 'var(--gold-deep)', marginBottom: 6 }}>
                            Practice hook
                          </p>
                          <p style={{ margin: 0, color: 'var(--ink)', fontSize: 14, lineHeight: 1.45, fontWeight: 750 }}>
                            {section.tryThis
                              ? previewText(section.tryThis, 130)
                              : 'Open if you need more detail before the lab.'}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {sections.map((section, index) => {
              const sectionMinutes =
                estimateReadingTime(
                  `${section.content} ${section.subsections?.map((sub) => sub.content).join(' ') ?? ''}`,
                );
              return (
                <details
                  key={section.id}
                  style={{
                    border: '1px solid var(--ink-a10)',
                    borderRadius: 16,
                    background: '#fff',
                    overflow: 'hidden',
                  }}
                >
                  <summary
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 20px',
                      cursor: 'pointer',
                      color: 'var(--ink)',
                      fontSize: 16,
                      fontWeight: 800,
                      lineHeight: 1.3,
                    }}
                  >
                    <span style={{ color: 'var(--gold-deep)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{section.title}</span>
                    <span
                      style={{
                        color: 'var(--slate-500)',
                        fontSize: 11,
                        fontWeight: 750,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sectionMinutes} min
                    </span>
                  </summary>
                  <div style={{ padding: '0 22px 24px', color: 'var(--ink)' }}>
                    <MarkdownRenderer content={section.content} />

                    {section.tryThis && (
                      <aside
                        aria-label="Try this practice prompt"
                        style={{
                          marginTop: 18,
                          borderLeft: '3px solid var(--gold)',
                          background: 'var(--cream-2)',
                          padding: '14px 18px',
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                        }}
                      >
                        <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Try this</p>
                        <p style={{ margin: 0, color: 'var(--ink)', fontSize: 15, lineHeight: 1.6 }}>
                          {section.tryThis}
                        </p>
                      </aside>
                    )}

                    {section.subsections && section.subsections.length > 0 && (
                      <div style={{ marginTop: 24, display: 'grid', gap: 20 }}>
                        {section.subsections.map((sub) => (
                          <section key={sub.id}>
                            <h4 style={{ margin: '0 0 10px', color: 'var(--ink)', fontSize: 16, fontWeight: 800 }}>
                              {sub.title}
                            </h4>
                            <MarkdownRenderer content={sub.content} />
                          </section>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </details>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            [data-testid="foundation-packet-continuity"] summary::-webkit-details-marker {
              display: none;
            }
            [data-testid="foundation-optional-study-aids"] summary::-webkit-details-marker,
            [data-testid="foundation-reference-drawer"] summary::-webkit-details-marker {
              display: none;
            }
            @media (max-width: 640px) {
              .foundation-lab-brief {
                border-radius: 18px !important;
                box-shadow: none !important;
              }
              .foundation-lab-brief__task,
              .foundation-lab-brief__model {
                padding: 16px !important;
              }
              .foundation-lab-brief__title {
                font-size: 25px !important;
                line-height: 1.08 !important;
                margin-bottom: 12px !important;
              }
              .foundation-lab-brief__actions {
                margin: 0 0 12px !important;
                display: grid !important;
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 8px !important;
              }
              .foundation-lab-brief__actions a {
                min-height: 44px !important;
                padding: 9px 8px !important;
                font-size: 12px !important;
              }
              .foundation-lab-brief__model-list {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 8px !important;
              }
              .foundation-lab-brief__model-step {
                align-items: flex-start !important;
                gap: 8px !important;
                padding: 10px !important;
                border: 1px solid var(--ink-a10) !important;
                border-radius: 12px !important;
                background: #fff !important;
                min-height: 86px !important;
              }
              .foundation-lab-brief__model-step span:last-child {
                font-size: 13px !important;
                line-height: 1.2 !important;
              }
              .foundation-step-number {
                width: 22px !important;
                height: 22px !important;
                font-size: 10px !important;
              }
              .foundation-retrieval-bridge__label {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 10px !important;
                padding: 10px 12px !important;
              }
              .foundation-retrieval-bridge__label p {
                font-size: 10px !important;
                letter-spacing: 0.13em !important;
              }
              .foundation-retrieval-bridge__label h3 {
                font-size: 13px !important;
              }
              .foundation-retrieval-bridge__prompt {
                padding: 12px !important;
              }
              .foundation-retrieval-bridge__prompt p:first-child {
                font-size: 10px !important;
                letter-spacing: 0.13em !important;
              }
              .foundation-retrieval-bridge__body {
                display: -webkit-box !important;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
              .foundation-retrieval-bridge__use {
                display: none !important;
              }
              .foundation-optional-study-aids > summary,
              .foundation-reference-drawer > summary {
                padding: 10px 12px !important;
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) auto !important;
                gap: 8px !important;
                align-items: center !important;
              }
              .foundation-optional-study-aids > summary h3,
              .foundation-reference-drawer > summary h3 {
                display: none !important;
              }
              .foundation-reference-map {
                padding: 14px !important;
              }
              .foundation-reference-map__item {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
              }
              .foundation-reference-map__practice {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10) !important;
                padding-left: 0 !important;
                padding-top: 10px !important;
              }
              .foundation-drawer-kicker {
                margin-bottom: 0 !important;
                font-size: 10px !important;
                letter-spacing: 0.13em !important;
              }
              .foundation-reference-summary::before {
                content: 'Reference';
                font-family: ${FONT_INTER};
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 0.13em;
                text-transform: uppercase;
                color: var(--gold-deep);
              }
              .foundation-practice-coach__header {
                padding: 14px !important;
                gap: 12px !important;
              }
              .foundation-practice-coach__header h3 {
                font-size: 18px !important;
                line-height: 1.12 !important;
              }
              .foundation-practice-coach__tabs {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                gap: 6px !important;
              }
              .foundation-practice-coach__tabs button {
                padding: 9px 6px !important;
                font-size: 11px !important;
                border-radius: 10px !important;
              }
              .foundation-practice-coach__cue {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
                padding: 12px !important;
              }
              .foundation-practice-coach__cue > span {
                justify-self: start !important;
              }
              .foundation-practice-coach__footer {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
                padding: 12px !important;
              }
              .foundation-practice-coach__footer-actions {
                justify-content: stretch !important;
              }
              .foundation-practice-coach__footer-actions > * {
                flex: 1 1 100%;
                min-height: 44px !important;
              }
              .foundation-readiness-check__action {
                display: grid !important;
                grid-template-columns: 1fr !important;
              }
              .foundation-readiness-check__action > a,
              .foundation-readiness-check__action > button {
                width: 100% !important;
              }
              .foundation-memory-card {
                grid-template-columns: 1fr !important;
                border-radius: 14px !important;
              }
              .foundation-memory-card__intro,
              .foundation-memory-card__body {
                padding: 16px !important;
              }
              .foundation-memory-card__items {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
              .foundation-memory-card__item {
                min-height: auto !important;
                grid-template-columns: 76px minmax(0, 1fr) !important;
                gap: 8px !important;
                padding: 11px 12px !important;
              }
              .foundation-memory-card__footer {
                grid-template-columns: 1fr !important;
              }
              .foundation-memory-card__footer button {
                width: 100% !important;
              }
              .foundation-spaced-review {
                grid-template-columns: 1fr !important;
                border-radius: 14px !important;
              }
              .foundation-spaced-review__intro,
              .foundation-spaced-review__body {
                padding: 16px !important;
              }
              .foundation-spaced-review__intro {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10) !important;
              }
              .foundation-spaced-review__items,
              .foundation-spaced-review__footer {
                grid-template-columns: 1fr !important;
              }
              .foundation-spaced-review__item {
                min-height: auto !important;
              }
              .foundation-spaced-review__footer button {
                width: 100% !important;
              }
              .foundation-retrieval-warmup {
                border-radius: 14px !important;
              }
              .foundation-retrieval-warmup > div:first-child {
                display: none !important;
              }
              .foundation-retrieval-warmup > div:last-child {
                padding: 16px !important;
              }
              .foundation-retrieval-warmup textarea {
                min-height: 68px !important;
              }
            }
            @media (max-width: 900px) {
              .foundation-lab-brief,
              .foundation-practice-coach__header,
              .foundation-continuity__grid,
              .foundation-worked-example__grid,
              .foundation-readiness-check,
              .foundation-readiness-check__buttons,
              .foundation-retrieval-bridge,
              .foundation-role-transfer,
              .foundation-role-transfer__items,
              .foundation-retrieval-warmup,
              .foundation-spaced-review,
              .foundation-spaced-review__items,
              .foundation-spaced-review__footer,
              .foundation-self-explanation,
              .foundation-self-explanation__buttons,
              .foundation-quality-gate,
              .foundation-quality-gate__tabs {
                grid-template-columns: 1fr !important;
              }
              .foundation-practice-coach__footer {
                grid-template-columns: 1fr !important;
              }
              .foundation-practice-coach__tabs {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              .foundation-lab-brief > div:last-child {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-continuity__grid > div {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-continuity__grid > div:first-child {
                border-top: none !important;
              }
              .foundation-worked-example__grid > div {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-worked-example__grid > div:first-child {
                border-top: none !important;
              }
              .foundation-readiness-check > div:last-child {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-retrieval-bridge__use {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10) !important;
              }
              .foundation-spaced-review__intro {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10) !important;
              }
              .foundation-role-transfer > div:first-child {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10);
              }
              .foundation-role-transfer__items > div {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-role-transfer__items > div:first-child {
                border-top: none !important;
              }
              .foundation-role-transfer__item {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
              .foundation-self-explanation > div:first-child {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10);
              }
              .foundation-quality-gate > div:first-child {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10);
              }
            }
          `,
        }}
      />
    </div>
  );
}
