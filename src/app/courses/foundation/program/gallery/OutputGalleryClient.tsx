'use client';

// OutputGalleryClient — reference gallery of exemplary AI output examples.
//
// 2026-05-27 (audit §12): redesigned to lead with the artifacts.
// Top of page is a mosaic of artifact tiles (real snippets, role + title).
// Tapping a tile filters the gallery to that role and scrolls to the
// expanded card. Filter strip stays available for direct navigation.
// Expanded OutputExampleCard list lives below.

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { PromptRole } from '@content/courses/foundation-program/prompt-library';
import {
  OUTPUT_EXAMPLES,
  OUTPUT_ROLE_META,
  GALLERY_ROLE_OPTIONS,
  filterOutputExamples,
} from '@content/courses/foundation-program/output-examples';
import { OutputExampleCard } from '../_components/OutputExample';

type RoleFilter = PromptRole | 'all';

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const ROLE_FILTER_OPTIONS: readonly { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  ...GALLERY_ROLE_OPTIONS.map((role) => ({
    value: role,
    label: OUTPUT_ROLE_META[role].label,
  })),
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const kickerStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const sectionHeadingStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};

const headlineStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontWeight: 800,
  fontSize: 'clamp(2rem, 4vw, 3rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.025em',
  margin: '12px 0 12px',
  color: 'var(--ink)',
};

const ledeStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '1.0625rem',
  lineHeight: 1.6,
  color: 'var(--slate-600)',
  margin: 0,
  maxWidth: '60ch',
};

const tileStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  textAlign: 'left',
  padding: '18px 18px 16px',
  borderRadius: 16,
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  cursor: 'pointer',
  transition:
    'transform var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
  fontFamily: INTER_STACK,
  boxShadow: 'var(--shadow-soft)',
};

const tileActiveStyle: CSSProperties = {
  ...tileStyle,
  borderColor: 'var(--ink)',
  boxShadow: 'var(--shadow-feature)',
};

const tileRoleStyle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

const tileTitleStyle: CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  lineHeight: 1.3,
  color: 'var(--ink)',
  margin: 0,
};

const tileSnippetStyle: CSSProperties = {
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  color: 'var(--slate-600)',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
};

function pillStyle(isActive: boolean): CSSProperties {
  return {
    padding: '8px 14px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    borderRadius: 999,
    cursor: 'pointer',
    fontFamily: INTER_STACK,
    transition:
      'background-color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease)',
    background: isActive ? 'var(--ink)' : 'transparent',
    color: isActive ? 'var(--cream)' : 'var(--ink)',
    border: isActive ? '1px solid var(--ink)' : '1px solid var(--ink-a10)',
  };
}

// ---------------------------------------------------------------------------
// Helper — strip markdown noise to surface a readable snippet for the mosaic
// ---------------------------------------------------------------------------

function snippetFor(text: string): string {
  const cleaned = text
    .replace(/^#+\s.*$/gm, '')           // headings
    .replace(/^[-*]\s\[[ x]\]\s/gm, '')  // checklist bullets
    .replace(/^[-*]\s/gm, '')            // list bullets
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // bold
    .replace(/`([^`]+)`/g, '$1')         // inline code
    .replace(/^---+$/gm, '')             // hr
    .replace(/\[PROVIDE\]/g, '—')        // placeholder tokens
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 24)
    .slice(0, 2)
    .join(' ');
  return cleaned.length > 240 ? `${cleaned.slice(0, 240).trimEnd()}…` : cleaned;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OutputGalleryClient() {
  const [activeRole, setActiveRole] = useState<RoleFilter>('all');
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [pendingScroll, setPendingScroll] = useState(false);

  const filtered = useMemo(() => {
    return filterOutputExamples(activeRole === 'all' ? undefined : activeRole);
  }, [activeRole]);

  const totalCount = OUTPUT_EXAMPLES.length;

  // Mosaic — show every example as a teaser tile. Cap at 12 to keep the
  // top of the page scannable; the full list lives below the filter.
  const mosaic = useMemo(() => OUTPUT_EXAMPLES.slice(0, 12), []);

  // Scroll to results after a tile click (after filter takes effect)
  useEffect(() => {
    if (!pendingScroll) return;
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPendingScroll(false);
  }, [pendingScroll]);

  const handleTileClick = useCallback((role: PromptRole) => {
    setActiveRole(role);
    setPendingScroll(true);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Header — short, lets the mosaic speak */}
      <header>
        <p style={kickerStyle}>Reference · Exemplary outputs</p>
        <h1 style={headlineStyle}>Output gallery</h1>
        <p style={ledeStyle}>
          Sample banking outputs across six departments — the same quality your
          final packet is evaluated against. Tap a tile to expand its full text,
          prompt, and the markers that make it effective.
        </p>
      </header>

      {/* Mosaic — leads with the artifacts */}
      <section aria-label="Artifact preview mosaic">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 16,
          }}
        >
          <span style={sectionHeadingStyle}>The work, at a glance</span>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-a10)' }} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          {mosaic.map((example) => {
            const meta = OUTPUT_ROLE_META[example.role];
            const isActive =
              activeRole !== 'all' && activeRole === example.role;
            return (
              <button
                key={example.id}
                type="button"
                onClick={() => handleTileClick(example.role)}
                style={isActive ? tileActiveStyle : tileStyle}
                aria-label={`Filter to ${meta.label}: ${example.title}`}
              >
                <span style={tileRoleStyle}>{meta.label}</span>
                <h3 style={tileTitleStyle}>{example.title}</h3>
                <p style={tileSnippetStyle}>{snippetFor(example.outputText)}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter strip — secondary to the mosaic */}
      <section
        ref={resultsRef}
        aria-label="Filter and full examples"
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <div
          role="group"
          aria-label="Filter by role"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <span style={sectionHeadingStyle}>Filter</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ROLE_FILTER_OPTIONS.map((opt) => {
              const isActive = activeRole === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActiveRole(opt.value)}
                  aria-pressed={isActive}
                  style={pillStyle(isActive)}
                >
                  {opt.label.toUpperCase()}
                </button>
              );
            })}
          </div>
          <span
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
              marginLeft: 'auto',
            }}
          >
            {filtered.length} of {totalCount}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              borderRadius: 16,
              background: 'var(--cream-2)',
              border: '1px dashed var(--ink-a10)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--slate-600)',
                margin: 0,
              }}
            >
              No examples match the selected filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((example) => (
              <OutputExampleCard key={example.id} example={example} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
