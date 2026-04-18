'use client';

// LearnSection — interactive Learn tab with collapsible sections,
// key takeaways, and reading time. Replaces the static content dump.

import { useState } from 'react';
import type { Section } from '@content/courses/aibi-p';
import { MarkdownRenderer } from './MarkdownRenderer';

interface LearnSectionProps {
  readonly sections: readonly Section[];
  readonly keyTakeaways?: readonly string[];
  readonly moduleNumber: number;
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function LearnSection({ sections, keyTakeaways }: LearnSectionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      {/* Key takeaways */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="mb-6 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-5">
          <p className="font-serif-sc text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] mb-3">
            After this module
          </p>
          <ul className="space-y-2">
            {keyTakeaways.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-terra)] mt-1.5 shrink-0" aria-hidden="true" />
                <span className="font-sans text-sm text-[color:var(--color-ink)]/80 leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mini TOC */}
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Section navigation">
        {sections.map((section, idx) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setOpenIndex(idx)}
            className={[
              'px-3 py-1.5 rounded-[2px] font-sans text-xs transition-all',
              idx === openIndex
                ? 'bg-[color:var(--color-terra)] text-[color:var(--color-linen)]'
                : 'bg-[color:var(--color-parch)] text-[color:var(--color-ink)]/70 hover:bg-[color:var(--color-parch-dark)]',
            ].join(' ')}
          >
            {idx + 1}. {section.title.length > 30 ? section.title.slice(0, 30) + '...' : section.title}
          </button>
        ))}
      </nav>

      {/* Collapsible sections */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const isOpen = idx === openIndex;
          const readTime = estimateReadingTime(section.content);
          const allSubContent = section.subsections
            ? section.subsections.map((s) => s.content).join(' ')
            : '';
          const totalReadTime = readTime + (allSubContent ? estimateReadingTime(allSubContent) : 0);

          return (
            <div
              key={section.id}
              className="border border-[color:var(--color-ink)]/10 rounded-[3px] overflow-hidden"
            >
              {/* Section header — always visible */}
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
                className={[
                  'w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors',
                  isOpen
                    ? 'bg-[color:var(--color-parch)]'
                    : 'bg-[color:var(--color-linen)] hover:bg-[color:var(--color-parch)]/50',
                ].join(' ')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[10px] text-[color:var(--color-terra)] tabular-nums shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-snug truncate">
                    {section.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[9px] text-[color:var(--color-slate)] uppercase tracking-wider hidden sm:block">
                    {totalReadTime} min read
                  </span>
                  <svg
                    className="w-4 h-4 text-[color:var(--color-terra)] transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              {/* Section content — collapsible */}
              {isOpen && (
                <div className="px-5 py-6 bg-[color:var(--color-linen)]">
                  <MarkdownRenderer content={section.content} />

                  {/* Subsections */}
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-6 space-y-6 border-l-2 border-[color:var(--color-parch-dark)] pl-5">
                      {section.subsections.map((sub) => (
                        <div key={sub.id}>
                          <h4 className="font-serif text-base font-semibold text-[color:var(--color-ink)] mb-3">
                            {sub.title}
                          </h4>
                          <MarkdownRenderer content={sub.content} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next section prompt */}
                  {idx < sections.length - 1 && (
                    <div className="mt-6 pt-4 border-t border-[color:var(--color-ink)]/10">
                      <button
                        type="button"
                        onClick={() => setOpenIndex(idx + 1)}
                        className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] hover:opacity-70 transition-opacity flex items-center gap-2"
                      >
                        Next: {sections[idx + 1].title}
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Last section — prompt to go to Practice */}
                  {idx === sections.length - 1 && (
                    <div className="mt-6 pt-4 border-t border-[color:var(--color-ink)]/10">
                      <p className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-slate)]">
                        Reading complete. Switch to the Practice tab to try it with AI.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
