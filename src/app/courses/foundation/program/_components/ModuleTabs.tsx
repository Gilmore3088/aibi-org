'use client';

// ModuleTabs — three-tab layout for module content: Learn / Practice / Apply.
// Breaks the long single-scroll module page into focused phases.
// Tab state persists in sessionStorage so refreshing keeps the learner's place.
// Mockup pill chrome: gold for active, slate for inactive, ink fill on hover.

import { useState, useEffect, type ReactNode } from 'react';
import { migrateStorageKey } from '@/lib/storage/migrate';

interface Tab {
  readonly id: string;
  readonly label: string;
  readonly sublabel: string;
}

const TABS: readonly Tab[] = [
  { id: 'learn', label: 'Learn it', sublabel: 'Read the material' },
  { id: 'practice', label: 'Try it', sublabel: 'Try it with AI' },
  { id: 'apply', label: 'Use it', sublabel: 'Complete activities' },
] as const;

interface ModuleTabsProps {
  readonly moduleNumber: number;
  readonly accentColor?: string;
  readonly learnContent: ReactNode;
  readonly practiceContent: ReactNode | null;
  readonly applyContent: ReactNode;
}

export function ModuleTabs({
  moduleNumber,
  accentColor = 'var(--gold)',
  learnContent,
  practiceContent,
  applyContent,
}: ModuleTabsProps) {
  const storageKey = `foundations-m${moduleNumber}-tab`;
  const legacyStorageKey = `aibi-p-m${moduleNumber}-tab`;
  const [activeTab, setActiveTab] = useState('learn');
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Restore tab from sessionStorage. Migrate the 2026-05-09 rename in
  // place so learners with in-flight state don't lose their tab choice.
  useEffect(() => {
    migrateStorageKey(sessionStorage, legacyStorageKey, storageKey);
    const saved = sessionStorage.getItem(storageKey);
    if (saved && TABS.some((t) => t.id === saved)) {
      setActiveTab(saved);
    }
  }, [storageKey, legacyStorageKey]);

  function selectTab(tabId: string) {
    setActiveTab(tabId);
    sessionStorage.setItem(storageKey, tabId);
    window.scrollTo({ top: 280, behavior: 'smooth' });
  }

  // Filter tabs: hide Practice if no sandbox content
  const visibleTabs = practiceContent
    ? TABS
    : TABS.filter((t) => t.id !== 'practice');

  return (
    <div>
      {/* Tab pill rail */}
      <div
        role="tablist"
        aria-label="Module sections"
        style={{
          display: 'inline-flex',
          gap: 8,
          padding: 6,
          marginBottom: 32,
          background: 'var(--cream-2)',
          border: '1px solid var(--ink-a10)',
          borderRadius: 999,
        }}
      >
        {visibleTabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const isHover = hoverId === tab.id && !isActive;

          const bg = isActive
            ? accentColor
            : isHover
              ? 'var(--ink)'
              : 'transparent';
          const fg = isActive
            ? 'var(--ink)'
            : isHover
              ? 'var(--cream)'
              : 'var(--slate-600)';
          const numFg = isActive
            ? 'var(--ink)'
            : isHover
              ? 'var(--gold-soft)'
              : 'var(--slate-400)';

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => selectTab(tab.id)}
              onMouseEnter={() => setHoverId(tab.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(tab.id)}
              onBlur={() => setHoverId(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px',
                background: bg,
                color: fg,
                border: 'none',
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                transition: 'background var(--t-fast) var(--ease), color var(--t-fast) var(--ease)',
              }}
            >
              <span
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 700,
                  fontSize: 11,
                  color: numFg,
                }}
                aria-hidden="true"
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active tab sublabel — small editorial line */}
      <p
        style={{
          margin: '0 0 24px',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 13,
          color: 'var(--slate-500)',
          letterSpacing: '0.04em',
        }}
      >
        {visibleTabs.find((t) => t.id === activeTab)?.sublabel}
      </p>

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'learn' && learnContent}
        {activeTab === 'practice' && practiceContent}
        {activeTab === 'apply' && applyContent}
      </div>
    </div>
  );
}
