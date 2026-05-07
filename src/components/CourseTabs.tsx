'use client';

// CourseTabs — shared three-tab layout for course content: Learn / Practice / Apply.
// Used by AiBI-Practitioner modules, AiBI-S weeks, and AiBI-L sessions.
// Tab state persists in sessionStorage so refreshing keeps the learner's place.

import { useState, useEffect, type ReactNode } from 'react';

interface Tab {
  readonly id: string;
  readonly label: string;
  readonly sublabel: string;
}

const TABS: readonly Tab[] = [
  { id: 'learn', label: 'Learn', sublabel: 'Read the material' },
  { id: 'practice', label: 'Practice', sublabel: 'Try it with AI' },
  { id: 'apply', label: 'Apply', sublabel: 'Complete activities' },
] as const;

interface CourseTabsProps {
  readonly storagePrefix: string;
  readonly segmentNumber: number;
  readonly accentColor?: string;
  readonly learnContent: ReactNode;
  readonly practiceContent: ReactNode | null;
  readonly applyContent: ReactNode;
}

export function CourseTabs({
  storagePrefix,
  segmentNumber,
  accentColor = 'var(--color-terra)',
  learnContent,
  practiceContent,
  applyContent,
}: CourseTabsProps) {
  const storageKey = `${storagePrefix}${segmentNumber}-tab`;
  const [activeTab, setActiveTab] = useState('learn');

  // Restore tab from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved && TABS.some((t) => t.id === saved)) {
      setActiveTab(saved);
    }
  }, [storageKey]);

  function selectTab(tabId: string) {
    setActiveTab(tabId);
    sessionStorage.setItem(storageKey, tabId);
    // Scroll to top of content area
    window.scrollTo({ top: 280, behavior: 'smooth' });
  }

  // Filter tabs: hide Practice if no sandbox content
  const visibleTabs = practiceContent
    ? TABS
    : TABS.filter((t) => t.id !== 'practice');

  return (
    <div>
      {/* Tab bar — sticky below module header */}
      <div
        className="sticky top-[120px] z-30 bg-[color:var(--color-linen)] border-b border-[color:var(--color-ink)]/10 mb-6"
        role="tablist"
        aria-label="Course sections"
      >
        <div className="flex gap-0">
          {visibleTabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => selectTab(tab.id)}
                className={[
                  'flex-1 py-4 px-4 text-center transition-all duration-200 relative',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-t-[2px]',
                  isActive
                    ? 'bg-[color:var(--color-parch)]'
                    : 'hover:bg-[color:var(--color-parch)]/50',
                ].join(' ')}
                style={{
                  focusRingColor: accentColor,
                } as React.CSSProperties}
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
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

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
