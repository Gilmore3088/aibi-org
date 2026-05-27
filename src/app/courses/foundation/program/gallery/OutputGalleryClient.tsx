'use client';

// OutputGalleryClient — filterable gallery of exemplary AI output examples
// Allows filtering by banking role. Renders OutputExampleCard for each result.

import { useState, useMemo } from 'react';
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

const ROLE_FILTER_OPTIONS: readonly { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  ...GALLERY_ROLE_OPTIONS.map((role) => ({
    value: role,
    label: OUTPUT_ROLE_META[role].label,
  })),
];

const filterCardStyle: CSSProperties = {
  background: 'var(--cream-2)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 24,
  padding: 20,
  boxShadow: 'var(--shadow-soft)',
};

const kickerStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: '0 0 12px',
};

function pillStyle(isActive: boolean): CSSProperties {
  return {
    padding: '8px 14px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    borderRadius: 999,
    cursor: 'pointer',
    transition:
      'background-color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease), color var(--t-fast) var(--ease)',
    background: isActive ? 'var(--ink)' : 'transparent',
    color: isActive ? 'var(--cream-2)' : 'var(--ink)',
    border: isActive ? '1px solid var(--ink)' : '1px solid var(--ink-a10)',
  };
}

export function OutputGalleryClient() {
  const [activeRole, setActiveRole] = useState<RoleFilter>('all');

  const filtered = useMemo(() => {
    return filterOutputExamples(activeRole === 'all' ? undefined : activeRole);
  }, [activeRole]);

  const totalCount = OUTPUT_EXAMPLES.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Role filter pills */}
      <div
        style={filterCardStyle}
        role="group"
        aria-label="Filter by role"
      >
        <p style={kickerStyle}>Filter by role</p>
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

        <p
          style={{
            marginTop: 14,
            fontSize: 13,
            color: 'var(--slate-500)',
            margin: '14px 0 0',
          }}
        >
          Showing {filtered.length} of {totalCount} examples
        </p>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ fontSize: 14, color: 'var(--slate-500)', margin: 0 }}>
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
    </div>
  );
}
