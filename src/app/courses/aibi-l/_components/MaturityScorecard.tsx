'use client';

import { useState, useCallback } from 'react';

const DIMENSIONS = [
  {
    name: 'Strategic Clarity',
    question:
      'Does leadership have a stated AI vision with prioritized use cases?',
  },
  {
    name: 'Governance Readiness',
    question:
      'Are there policies, an AI use case inventory, and examiner-ready documentation?',
  },
  {
    name: 'Talent and Skills',
    question:
      'Has staff been trained? Are there internal AI champions?',
  },
  {
    name: 'Technology Foundation',
    question:
      'Is the technology stack AI-ready with viable integrations?',
  },
  {
    name: 'Data Readiness',
    question:
      'Is data classified, accessible, and governed?',
  },
  {
    name: 'Culture and Change Management',
    question:
      'Is leadership supportive with appetite for experimentation?',
  },
] as const;

const SCORE_LABELS = ['Beginning', 'Developing', 'Established', 'Advanced', 'Leading'] as const;

const DIMENSION_COUNT = DIMENSIONS.length;
const MAX_SCORE = DIMENSION_COUNT * 5;

type MaturityLevel = 'Advanced' | 'Developing' | 'Early' | 'Starting';

interface MaturityInfo {
  readonly level: MaturityLevel;
  readonly interpretation: string;
  readonly opacity: string;
}

function getMaturityInfo(total: number): MaturityInfo {
  if (total >= 25) {
    return {
      level: 'Advanced',
      interpretation:
        'Your institution has strong AI foundations. Session 3 will model aggressive efficiency targets.',
      opacity: 'opacity-100',
    };
  }
  if (total >= 19) {
    return {
      level: 'Developing',
      interpretation:
        'You have meaningful progress. Session 3 will focus on accelerating what works.',
      opacity: 'opacity-60',
    };
  }
  if (total >= 13) {
    return {
      level: 'Early',
      interpretation:
        'You are building the foundation. Session 3 will model conservative, defensible targets.',
      opacity: 'opacity-100',
    };
  }
  return {
    level: 'Starting',
    interpretation:
      'You are at the beginning. Session 3 will show what a phased approach looks like.',
    opacity: 'opacity-100',
  };
}

function DimensionRow({
  name,
  question,
  value,
  onChange,
}: {
  readonly name: string;
  readonly question: string;
  readonly value: number;
  readonly onChange: (score: number) => void;
}) {
  return (
    <div className="py-6 border-b border-[color:var(--color-cobalt)]/10 last:border-b-0">
      <div className="mb-1">
        <span className="font-serif text-lg text-[color:var(--color-ink)]">
          {name}
        </span>
      </div>
      <p className="font-serif italic text-sm text-[color:var(--color-slate)] mb-4">
        {question}
      </p>

      <div
        role="radiogroup"
        aria-label={`${name} score`}
        className="flex items-center gap-2"
      >
        {SCORE_LABELS.map((label, index) => {
          const score = index + 1;
          const isSelected = value === score;

          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${score} - ${label}`}
              onClick={() => onChange(score)}
              className={`
                flex flex-col items-center justify-center
                min-w-[4rem] px-3 py-2
                rounded-sm border transition-colors
                focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2
                ${
                  isSelected
                    ? 'bg-[color:var(--color-cobalt)] border-[color:var(--color-cobalt)] text-[color:var(--color-linen)]'
                    : 'bg-[color:var(--color-linen)] border-[color:var(--color-cobalt)]/20 text-[color:var(--color-ink)] hover:border-[color:var(--color-cobalt)]/50'
                }
              `}
            >
              <span className="font-mono text-base tabular-nums leading-none mb-1">
                {score}
              </span>
              <span className="font-sans text-[9px] uppercase tracking-[0.1em] font-semibold leading-none">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DimensionBar({
  name,
  score,
}: {
  readonly name: string;
  readonly score: number;
}) {
  const percentage = (score / 5) * 100;

  return (
    <div className="flex items-center gap-4">
      <span className="font-sans text-xs text-[color:var(--color-slate)] w-[11rem] shrink-0 text-right">
        {name}
      </span>
      <div className="flex-1 h-2 bg-[color:var(--color-cobalt)]/10 rounded-sm overflow-hidden">
        <div
          className="h-full bg-[color:var(--color-cobalt)] transition-all duration-300 rounded-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums text-[color:var(--color-ink)] w-6 text-right">
        {score}
      </span>
    </div>
  );
}

export default function MaturityScorecard() {
  const [scores, setScores] = useState<number[]>(
    () => Array.from({ length: DIMENSION_COUNT }, () => 0)
  );

  const handleScore = useCallback((dimensionIndex: number, score: number) => {
    setScores((prev) => {
      const next = [...prev];
      next[dimensionIndex] = score;
      return next;
    });
  }, []);

  const allScored = scores.every((s) => s > 0);
  const total = scores.reduce((sum, s) => sum + s, 0);
  const maturity = allScored ? getMaturityInfo(total) : null;

  return (
    <section
      className="bg-[color:var(--color-parch)] border border-[color:var(--color-cobalt)]/15 rounded-sm"
      aria-labelledby="scorecard-heading"
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-4 sm:px-10 sm:pt-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-cobalt)]">
            Workshop Activity
          </span>
          <div className="h-px flex-1 bg-[color:var(--color-cobalt)]/15" aria-hidden="true" />
        </div>
        <h2
          id="scorecard-heading"
          className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-2"
        >
          AI Maturity Scorecard
        </h2>
        <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">
          Score your institution across six dimensions. Be candid — this is a
          diagnostic tool, not a performance review.
        </p>
      </div>

      {/* Dimensions */}
      <div className="px-8 sm:px-10">
        {DIMENSIONS.map((dim, i) => (
          <DimensionRow
            key={dim.name}
            name={dim.name}
            question={dim.question}
            value={scores[i]}
            onChange={(score) => handleScore(i, score)}
          />
        ))}
      </div>

      {/* Score summary — visible only when all dimensions scored */}
      {allScored && maturity && (
        <div className="px-8 pb-8 pt-6 sm:px-10 sm:pb-10 mt-4 border-t border-[color:var(--color-cobalt)]/10">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-4xl tabular-nums text-[color:var(--color-cobalt)]">
              {total}
            </span>
            <span className="font-mono text-lg tabular-nums text-[color:var(--color-slate)]">
              / {MAX_SCORE}
            </span>
            <span
              className={`
                ml-auto font-sans text-[11px] uppercase font-semibold tracking-[1.2px]
                px-3 py-1 rounded-sm border
                ${
                  maturity.level === 'Advanced' || maturity.level === 'Developing'
                    ? `text-[color:var(--color-cobalt)] border-[color:var(--color-cobalt)]/30 ${
                        maturity.level === 'Developing' ? 'opacity-60' : ''
                      }`
                    : 'text-[color:var(--color-slate)] border-[color:var(--color-slate)]/30'
                }
              `}
            >
              {maturity.level}
            </span>
          </div>

          {/* Dimension breakdown bars */}
          <div className="space-y-3 mb-6">
            {DIMENSIONS.map((dim, i) => (
              <DimensionBar key={dim.name} name={dim.name} score={scores[i]} />
            ))}
          </div>

          {/* Interpretation */}
          <p className="font-serif italic text-sm text-[color:var(--color-slate)] leading-relaxed border-t border-[color:var(--color-cobalt)]/10 pt-4">
            {maturity.interpretation}
          </p>
        </div>
      )}
    </section>
  );
}
