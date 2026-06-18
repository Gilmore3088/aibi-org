'use client';

// LearnSection — interactive Learn tab with collapsible sections, key
// takeaways, and reading time. Mockup chrome: cream surface, ink type,
// gold accent on active/eyebrow, slate metadata. Leads with the artifact —
// the key-takeaways card surfaces what the learner walks away with.

import { useState } from 'react';
import type { Section } from '@content/courses/foundation-program';
import { MarkdownRenderer } from '@/components/lms/MarkdownRenderer';

interface LearnSectionProps {
  readonly sections: readonly Section[];
  readonly keyTakeaways?: readonly string[];
  readonly moduleNumber: number;
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

export function LearnSection({ sections, keyTakeaways }: LearnSectionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      {/* Key takeaways — the artifact the Learn tab produces */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div
          style={{
            marginBottom: 24,
            background: 'var(--cream-2)',
            border: '1px solid var(--ink-a10)',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <p style={{ ...eyebrowStyle, marginBottom: 12 }}>
            After this module
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {keyTakeaways.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: 'var(--gold)',
                    marginTop: 8,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                    fontSize: 16,
                    color: 'var(--ink)',
                    lineHeight: 1.6,
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mini TOC */}
      <nav
        aria-label="Section navigation"
        style={{
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {sections.map((section, idx) => {
          const active = idx === openIndex;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setOpenIndex(idx)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: '1px solid',
                borderColor: active ? 'var(--gold)' : 'var(--ink-a10)',
                background: active ? 'var(--gold)' : 'var(--cream)',
                color: active ? 'var(--ink)' : 'var(--slate-600)',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                transition: 'background var(--t-fast) var(--ease), color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
              }}
            >
              {idx + 1}. {section.title.length > 30 ? section.title.slice(0, 30) + '…' : section.title}
            </button>
          );
        })}
      </nav>

      {/* Collapsible sections */}
      <div style={{ display: 'grid', gap: 12 }}>
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
              style={{
                border: '1px solid var(--ink-a10)',
                borderRadius: 16,
                overflow: 'hidden',
                background: 'var(--cream)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '18px 22px',
                  textAlign: 'left',
                  background: isOpen ? 'var(--cream-2)' : 'var(--cream)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background var(--t-fast) var(--ease)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                      fontSize: 12,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color: isOpen ? 'var(--gold-deep)' : 'var(--slate-500)',
                      flexShrink: 0,
                    }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {section.title}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span
                    style={{
                      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--slate-500)',
                    }}
                  >
                    {totalReadTime} min read
                  </span>
                  <svg
                    width="16"
                    height="16"
                    style={{
                      color: 'var(--gold-deep)',
                      transition: 'transform var(--t-fast) var(--ease)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: '22px 26px 28px', background: 'var(--cream)' }}>
                  <MarkdownRenderer content={section.content} />

                  {section.tryThis && (
                    <aside
                      aria-label="Try this practice prompt"
                      style={{
                        marginTop: 20,
                        borderLeft: '3px solid var(--gold)',
                        background: 'var(--cream-2)',
                        padding: '14px 20px',
                        borderTopRightRadius: 12,
                        borderBottomRightRadius: 12,
                      }}
                    >
                      <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Try this</p>
                      <p
                        style={{
                          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                          fontSize: 15,
                          color: 'var(--ink)',
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {section.tryThis}
                      </p>
                    </aside>
                  )}

                  {section.subsections && section.subsections.length > 0 && (
                    <div
                      style={{
                        marginTop: 24,
                        borderLeft: '2px solid var(--ink-a10)',
                        paddingLeft: 20,
                        display: 'grid',
                        gap: 24,
                      }}
                    >
                      {section.subsections.map((sub) => (
                        <div key={sub.id}>
                          <h4
                            style={{
                              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                              fontSize: 16,
                              fontWeight: 700,
                              color: 'var(--ink)',
                              marginBottom: 12,
                            }}
                          >
                            {sub.title}
                          </h4>
                          <MarkdownRenderer content={sub.content} />
                        </div>
                      ))}
                    </div>
                  )}

                  {idx < sections.length - 1 && (
                    <div
                      style={{
                        marginTop: 24,
                        paddingTop: 16,
                        borderTop: '1px solid var(--ink-a10)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(idx + 1)}
                        style={{
                          ...eyebrowStyle,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--gold-deep)',
                        }}
                      >
                        Next: {sections[idx + 1].title}
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {idx === sections.length - 1 && (
                    <div
                      style={{
                        marginTop: 24,
                        paddingTop: 16,
                        borderTop: '1px solid var(--ink-a10)',
                      }}
                    >
                      <p style={{ ...eyebrowStyle, color: 'var(--slate-500)' }}>
                        Reading complete. Switch to the Try it tab to try it with AI.
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
