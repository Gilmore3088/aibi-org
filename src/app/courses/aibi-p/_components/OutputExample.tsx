'use client';

// OutputExample — Collapsible card rendering one exemplary AI output
// Shows role badge, platform badge, the output text, and quality callouts.
// Collapsed by default; click header to expand.

import { useState } from 'react';
import type { OutputExample } from '@content/courses/aibi-p/output-examples';
import {
  OUTPUT_PLATFORM_META,
  OUTPUT_ROLE_META,
} from '@content/courses/aibi-p/output-examples';

interface OutputExampleProps {
  readonly example: OutputExample;
}

export function OutputExampleCard({ example }: OutputExampleProps) {
  const [expanded, setExpanded] = useState(false);

  const platformMeta = OUTPUT_PLATFORM_META[example.platform];
  const roleMeta = OUTPUT_ROLE_META[example.role];

  return (
    <article
      className="border border-[color:var(--color-parch-dark)] rounded-sm overflow-hidden"
      aria-label={example.title}
    >
      {/* Collapsible header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="w-full text-left bg-[color:var(--color-parch)] px-6 py-5 flex items-start gap-4 hover:bg-[color:var(--color-parch-dark)] transition-colors focus-visible:outline-2 focus-visible:outline-[color:var(--color-terra)]"
      >
        {/* Expand/collapse indicator */}
        <span
          className="mt-1 shrink-0 w-4 h-4 flex items-center justify-center"
          aria-hidden="true"
        >
          <svg
            className="w-3 h-3 text-[color:var(--color-terra)] transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 4.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>

        {/* Title and badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Role badge */}
            <span
              className="inline-flex items-center px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] font-bold rounded-sm"
              style={{
                color: roleMeta.colorVar,
                border: `1px solid ${roleMeta.colorVar}`,
                backgroundColor: 'transparent',
              }}
            >
              {roleMeta.label}
            </span>

            {/* Platform badge */}
            <span
              className="inline-flex items-center px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] rounded-sm"
              style={{
                color: platformMeta.colorVar,
                border: `1px solid ${platformMeta.colorVar}`,
                opacity: 0.8,
              }}
            >
              {platformMeta.label}
            </span>

            {/* Skill pill (if applicable) */}
            {example.skillUsed && (
              <span className="font-mono text-[9px] text-[color:var(--color-dust)] truncate max-w-xs">
                {example.skillUsed}
              </span>
            )}
          </div>

          <h3 className="font-serif text-base font-bold text-[color:var(--color-ink)] leading-snug">
            {example.title}
          </h3>
        </div>
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="bg-[color:var(--color-linen)]">
          {/* The actual output — styled as an institutional memo */}
          <div className="px-6 pt-6 pb-4">
            <div
              className="text-[10px] font-mono uppercase tracking-[0.25em] text-[color:var(--color-terra)] mb-3"
              aria-hidden="true"
            >
              AI Output
            </div>
            <div
              className="bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm p-5"
            >
              <pre
                className="font-serif text-sm text-[color:var(--color-ink)] leading-relaxed whitespace-pre-wrap break-words"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {example.outputText}
              </pre>
            </div>
          </div>

          {/* What makes it effective */}
          <div className="px-6 pb-4 pt-2">
            <div
              className="border-l-2 border-[color:var(--color-terra)] pl-4 py-1"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[color:var(--color-terra)] mb-3">
                What Makes This Effective
              </div>
              <ul className="space-y-3">
                {example.whatMakesItEffective.map((marker) => (
                  <li key={marker.heading}>
                    <span className="font-sans font-bold text-sm text-[color:var(--color-ink)]">
                      {marker.heading}
                    </span>
                    <p className="font-sans text-sm text-[color:var(--color-ink)]/80 leading-relaxed mt-0.5">
                      {marker.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quality markers — what the learner should notice */}
          <div className="px-6 pb-6 pt-2">
            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[color:var(--color-dust)] mb-3">
                What to Notice
              </div>
              <ul className="space-y-2">
                {example.qualityMarkers.map((marker, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 font-sans text-sm text-[color:var(--color-ink)]/80 leading-relaxed"
                  >
                    <span
                      className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-[color:var(--color-terra)]"
                      aria-hidden="true"
                    />
                    {marker}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
