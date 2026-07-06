'use client';

// OutputExample — collapsible card rendering one exemplary AI output.
// Shows role + platform badge, the output text (the artifact), and quality
// callouts. Collapsed by default. Mockup chrome: cream surface with ink type,
// the output itself sits on the ink slab to feel like a verbatim AI response.
// Pillar / role / platform colors retired — all badges share the slate
// hairline treatment, identity carried by label only.

import { useState } from 'react';
import type { OutputExample } from '@content/courses/foundation-program/output-examples';
import {
  OUTPUT_PLATFORM_META,
  OUTPUT_ROLE_META,
} from '@content/courses/foundation-program/output-examples';
import { MarkdownRenderer } from '@/components/lms/MarkdownRenderer';

interface OutputExampleProps {
  readonly example: OutputExample;
}

const fontStack = 'Inter, ui-sans-serif, system-ui, sans-serif';

const eyebrowOnInk: React.CSSProperties = {
  fontFamily: fontStack,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-soft)',
};

const eyebrowOnCream: React.CSSProperties = {
  fontFamily: fontStack,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

const badge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: 999,
  border: '1px solid var(--ink-a15)',
  background: 'var(--cream)',
  color: 'var(--slate-600)',
  fontFamily: fontStack,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
};

export function OutputExampleCard({ example }: OutputExampleProps) {
  const [expanded, setExpanded] = useState(false);

  const platformMeta = OUTPUT_PLATFORM_META[example.platform];
  const roleMeta = OUTPUT_ROLE_META[example.role];

  return (
    <article
      aria-label={example.title}
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
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        style={{
          width: '100%',
          textAlign: 'left',
          background: expanded ? 'var(--cream-2)' : 'var(--cream)',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          border: 'none',
          cursor: 'pointer',
          transition: 'background var(--t-fast) var(--ease)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            marginTop: 6,
            flexShrink: 0,
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="12"
            height="12"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{
              color: 'var(--gold-deep)',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform var(--t-fast) var(--ease)',
            }}
          >
            <path
              fillRule="evenodd"
              d="M7.293 4.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span style={badge}>{roleMeta.label}</span>
            <span style={badge}>{platformMeta.label}</span>
            {example.skillUsed && (
              <span
                style={{
                  fontFamily: fontStack,
                  fontSize: '0.8125rem',
                  color: 'var(--slate-500)',
                  maxWidth: 320,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {example.skillUsed}
              </span>
            )}
          </div>

          <h3
            style={{
              fontFamily: fontStack,
              fontSize: '1.0625rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            {example.title}
          </h3>
        </div>
      </button>

      {expanded && (
        <div style={{ background: 'var(--cream)' }}>
          {/* The artifact — output rendered on ink slab to evoke a real AI surface */}
          <div style={{ padding: '24px 24px 8px' }}>
            <div style={{ ...eyebrowOnCream, marginBottom: 12 }}>AI output</div>
            <div
              style={{
                background: 'var(--ink)',
                color: 'var(--cream)',
                border: '1px solid var(--ink)',
                borderRadius: 16,
                padding: '22px 24px',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <MarkdownRenderer content={example.outputText} />
            </div>
          </div>

          <div style={{ padding: '16px 24px 8px' }}>
            <div
              style={{
                borderLeft: '3px solid var(--gold)',
                paddingLeft: 16,
                paddingTop: 4,
                paddingBottom: 4,
              }}
            >
              <div style={{ ...eyebrowOnCream, marginBottom: 12 }}>
                What makes this effective
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
                {example.whatMakesItEffective.map((marker) => (
                  <li key={marker.heading}>
                    <span
                      style={{
                        fontFamily: fontStack,
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'var(--ink)',
                      }}
                    >
                      {marker.heading}
                    </span>
                    <p
                      style={{
                        fontFamily: fontStack,
                        fontSize: '1rem',
                        color: 'var(--slate-600)',
                        lineHeight: 1.6,
                        margin: '4px 0 0',
                      }}
                    >
                      {marker.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ padding: '16px 24px 24px' }}>
            <div
              style={{
                background: 'var(--cream-2)',
                border: '1px solid var(--ink-a10)',
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div style={{ ...eyebrowOnInk, color: 'var(--slate-500)', marginBottom: 12 }}>
                What to notice
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {example.qualityMarkers.map((marker, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontFamily: fontStack,
                      fontSize: '1rem',
                      color: 'var(--ink)',
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        marginTop: 8,
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: 'var(--gold)',
                      }}
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
