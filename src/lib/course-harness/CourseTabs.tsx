'use client';

// Generic course tabs — data-driven, any length.
// Replaces the old positional learn/practice/apply signature with a Tab[] array.

import { useState, useEffect } from 'react';
import type { TabDef } from './types';

interface CourseTabsProps {
  readonly tabs: readonly TabDef[];
  readonly storageKey: string;          // unique per course+segment, e.g., 'aibi-p-m3'
  readonly accentColor?: string;         // CSS var (defaults to terra)
  readonly initialTabId?: string;        // optional override of default (first enabled)
}

export function CourseTabs({
  tabs,
  storageKey,
  accentColor = 'var(--color-terra)',
  initialTabId,
}: CourseTabsProps) {
  const firstEnabled = tabs.find((t) => !t.disabled)?.id;
  const [activeTab, setActiveTab] = useState(initialTabId ?? firstEnabled ?? tabs[0]?.id);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
    if (saved && tabs.some((t) => t.id === saved && !t.disabled)) {
      setActiveTab(saved);
    }
  }, [storageKey, tabs]);

  function selectTab(tabId: string) {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, tabId);
      window.scrollTo({ top: 280, behavior: 'smooth' });
    }
  }

  if (tabs.length === 0) return null;

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div>
      <div
        className="sticky top-[120px] z-30 bg-[color:var(--color-linen)] border-b border-[color:var(--color-ink)]/10 mb-6"
        role="tablist"
        aria-label="Course sections"
      >
        <div className="flex gap-0">
          {tabs.map((tab, idx) => {
            const isActive = active.id === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                disabled={tab.disabled}
                onClick={() => selectTab(tab.id)}
                className={[
                  'flex-1 py-4 px-4 text-center transition-all duration-200 relative',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-t-[2px]',
                  tab.disabled ? 'opacity-30 cursor-not-allowed' : '',
                  isActive
                    ? 'bg-[color:var(--color-parch)]'
                    : 'hover:bg-[color:var(--color-parch)]/50',
                ].join(' ')}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span
                    className="font-mono text-sm tabular-nums"
                    style={{ color: isActive ? accentColor : 'var(--color-ink)', opacity: isActive ? 1 : 0.3 }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className="font-serif-sc text-sm uppercase tracking-[0.12em]"
                    style={{ color: isActive ? accentColor : 'var(--color-ink)', opacity: isActive ? 1 : 0.6 }}
                  >
                    {tab.label}
                  </span>
                </div>
                <p
                  className="font-sans text-[10px] text-[color:var(--color-slate)]"
                  style={{ opacity: isActive ? 1 : 0.5 }}
                >
                  {tab.sublabel}
                </p>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: accentColor }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`}>
        {active.content}
      </div>
    </div>
  );
}
