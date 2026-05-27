'use client';

// ToolGuideFilter — top-of-page filter that lets a banker pick a workflow
// ("drafting", "summarizing", "scenario-building", "chat") and dims platforms
// that don't fit. Filter is a reveal, not a gate — every platform stays in
// the DOM so jump-anchors and accordion content remain reachable.

import { useState, useMemo, useCallback, useEffect } from 'react';

export type UseCaseFilter =
  | 'all'
  | 'drafting'
  | 'summarizing'
  | 'scenario-building'
  | 'chat';

interface ToolGuideFilterProps {
  // platformId -> set of use-case tags it supports
  readonly platformTags: Readonly<Record<string, readonly UseCaseFilter[]>>;
}

const OPTIONS: ReadonlyArray<{ readonly value: UseCaseFilter; readonly label: string }> = [
  { value: 'all', label: 'Everything' },
  { value: 'drafting', label: 'Drafting' },
  { value: 'summarizing', label: 'Summarizing' },
  { value: 'scenario-building', label: 'Scenario building' },
  { value: 'chat', label: 'Chat / Q&A' },
];

export function ToolGuideFilter({ platformTags }: ToolGuideFilterProps) {
  const [active, setActive] = useState<UseCaseFilter>('all');

  // Build the platform->matches map outside render
  const matches = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const [platformId, tags] of Object.entries(platformTags)) {
      result[platformId] = active === 'all' || tags.includes(active);
    }
    return result;
  }, [platformTags, active]);

  // Apply dim/undim by toggling data-attribute on the sibling sections.
  // The page server-renders each section with data-platform-id; the filter
  // simply toggles a class on document.body the sections read via CSS.
  useEffect(() => {
    const root = document.querySelector('[data-tool-guides-root]');
    if (!root) return;
    const sections = root.querySelectorAll<HTMLElement>('[data-platform-id]');
    sections.forEach((node) => {
      const id = node.dataset.platformId ?? '';
      const visible = matches[id] ?? true;
      node.style.opacity = visible ? '1' : '0.32';
      node.style.transition = 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }, [matches]);

  const onSelect = useCallback((value: UseCaseFilter) => setActive(value), []);

  return (
    <section
      aria-label="Filter platforms by workflow"
      style={{
        background: 'var(--cream-2)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 24,
        padding: 22,
        marginBottom: 40,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 12px',
        }}
      >
        Filter by what you&rsquo;re trying to do
      </p>
      <div
        role="radiogroup"
        aria-label="Workflow filter"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
      >
        {OPTIONS.map((opt) => {
          const isActive = active === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(opt.value)}
              style={{
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 999,
                border: '1px solid',
                borderColor: isActive ? 'var(--ink)' : 'var(--ink-a10)',
                background: isActive ? 'var(--ink)' : '#FFFFFF',
                color: isActive ? 'var(--cream)' : 'var(--ink)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 120ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
