'use client';

// ModuleTabs — focused phase workspace for Understand / Try / Build / Save.
// Keeps the learner in one active phase instead of exposing the full module
// as a long scroll document. Hash links from older in-page controls still
// switch phases so existing affordances keep working.

import { useCallback, useState, useEffect, type ReactNode } from 'react';
import { migrateStorageKey } from '@/lib/storage/migrate';

interface Tab {
  readonly id: string;
  readonly label: string;
  readonly sublabel: string;
}

const TABS: readonly Tab[] = [
  {
    id: 'learn',
    label: 'Understand',
    sublabel: 'Goal + guardrail',
  },
  {
    id: 'practice',
    label: 'Try',
    sublabel: 'One small rep',
  },
  {
    id: 'apply',
    label: 'Build',
    sublabel: 'Create the asset',
  },
  {
    id: 'save',
    label: 'Save',
    sublabel: 'Packet proof',
  },
] as const;

const NO_PRACTICE_TABS = TABS.filter((t) => t.id !== 'practice');

const HASH_TO_TAB: Readonly<Record<string, string>> = {
  '#st-takeaway': 'learn',
  '#st-sandbox': 'practice',
  '#st-submit': 'apply',
  '#st-saved': 'save',
  '#st-packet': 'save',
};

const TAB_TO_HASH: Readonly<Record<string, string>> = {
  learn: '#st-takeaway',
  practice: '#st-sandbox',
  apply: '#st-submit',
  save: '#st-saved',
};

function scrollToPhaseTarget(hash: string, behavior: ScrollBehavior = 'smooth') {
  const run = (scrollBehavior: ScrollBehavior) => {
    const target = document.getElementById(hash.slice(1));
    const top = target ? target.getBoundingClientRect().top + window.scrollY - 160 : 280;
    window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior });
  };
  window.setTimeout(() => run(behavior), 0);
  window.setTimeout(() => run('auto'), 260);
}

interface ModuleTabsProps {
  readonly moduleNumber: number;
  readonly accentColor?: string;
  readonly learnContent: ReactNode;
  readonly practiceContent: ReactNode | null;
  readonly applyContent: ReactNode;
  readonly saveContent?: ReactNode;
}

export function ModuleTabs({
  moduleNumber,
  accentColor = 'var(--gold)',
  learnContent,
  practiceContent,
  applyContent,
  saveContent,
}: ModuleTabsProps) {
  const storageKey = `foundations-m${moduleNumber}-tab`;
  const legacyStorageKey = `aibi-p-m${moduleNumber}-tab`;
  const [activeTab, setActiveTab] = useState('learn');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const visibleTabs = practiceContent ? TABS : NO_PRACTICE_TABS;

  const activateTab = useCallback(
    (tabId: string, opts?: { readonly updateHash?: boolean; readonly scroll?: boolean }) => {
      const safeTabId = visibleTabs.some((t) => t.id === tabId) ? tabId : 'learn';
      setActiveTab(safeTabId);
      sessionStorage.setItem(storageKey, safeTabId);

      if (opts?.updateHash) {
        const nextHash = TAB_TO_HASH[safeTabId] ?? '#st-takeaway';
        if (window.location.hash !== nextHash) {
          window.history.replaceState(null, '', nextHash);
        }
      }

      if (opts?.scroll !== false) {
        const nextHash = TAB_TO_HASH[safeTabId] ?? '#st-takeaway';
        scrollToPhaseTarget(nextHash);
      }
    },
    [storageKey, visibleTabs],
  );

  const activateAnchor = useCallback(
    (hash: string, opts?: { readonly updateHash?: boolean; readonly scroll?: boolean }) => {
      const tabId = HASH_TO_TAB[hash];
      if (tabId) {
        activateTab(tabId, opts);
      }
    },
    [activateTab],
  );

  // Restore tab from sessionStorage. Migrate the 2026-05-09 rename in
  // place so learners with in-flight state don't lose their tab choice.
  useEffect(() => {
    migrateStorageKey(sessionStorage, legacyStorageKey, storageKey);
    const tabFromHash = HASH_TO_TAB[window.location.hash];
    if (tabFromHash && visibleTabs.some((t) => t.id === tabFromHash)) {
      setActiveTab(tabFromHash);
      sessionStorage.setItem(storageKey, tabFromHash);
      scrollToPhaseTarget(window.location.hash, 'auto');
      return;
    }
    const saved = sessionStorage.getItem(storageKey);
    if (saved && visibleTabs.some((t) => t.id === saved)) {
      setActiveTab(saved);
      return;
    }
    if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? 'learn');
    }
  }, [activeTab, storageKey, legacyStorageKey, visibleTabs]);

  useEffect(() => {
    const hash = TAB_TO_HASH[activeTab] ?? '#st-takeaway';
    window.dispatchEvent(
      new CustomEvent('foundation-module-phase-active', {
        detail: { id: hash.slice(1), hash, tabId: activeTab },
      }),
    );
    if (window.location.hash === hash) {
      scrollToPhaseTarget(hash, 'auto');
    }
  }, [activeTab]);

  useEffect(() => {
    function handleHashChange() {
      activateAnchor(window.location.hash, { updateHash: false });
    }

    function handlePhaseSelect(event: Event) {
      const detail = (event as CustomEvent<{ id?: string; hash?: string }>).detail;
      const hash = detail?.hash ?? (detail?.id ? `#${detail.id}` : '');
      activateAnchor(hash, { updateHash: true });
    }

    function handleAnchorClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href^="#st-"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const hash = anchor.getAttribute('href') ?? '';
      if (!HASH_TO_TAB[hash]) return;
      event.preventDefault();
      activateAnchor(hash, { updateHash: true });
    }

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('foundation-module-phase-select', handlePhaseSelect);
    document.addEventListener('click', handleAnchorClick, true);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('foundation-module-phase-select', handlePhaseSelect);
      document.removeEventListener('click', handleAnchorClick, true);
    };
  }, [activateAnchor]);

  function selectTab(tabId: string) {
    activateTab(tabId, { updateHash: true });
  }

  const activeIndex = Math.max(0, visibleTabs.findIndex((t) => t.id === activeTab));
  const active = visibleTabs[activeIndex] ?? visibleTabs[0] ?? TABS[0];

  return (
    <div>
      {/* Tab pill rail */}
      <div
        role="tablist"
        aria-label="Module sections"
        className="foundation-module-tabs__rail"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))`,
          gap: 8,
          padding: 6,
          marginBottom: 20,
          background: 'var(--cream-2)',
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
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
              onPointerDown={(event) => {
                if (event.button === 0) {
                  selectTab(tab.id);
                }
              }}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectTab(tab.id);
                }
              }}
              onMouseEnter={() => setHoverId(tab.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(tab.id)}
              onBlur={() => setHoverId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                minHeight: 48,
                padding: '10px 12px',
                background: bg,
                color: fg,
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
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

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
      >
        {active.id === 'learn' && learnContent}
        {active.id === 'practice' && practiceContent}
        {active.id === 'apply' && applyContent}
        {active.id === 'save' && (saveContent ?? applyContent)}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 760px) {
              .foundation-module-tabs__rail {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
            }
            @media (max-width: 520px) {
              [role="tablist"][aria-label="Module sections"] {
                display: grid !important;
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                width: 100% !important;
                border-radius: 16px !important;
              }
              [role="tablist"][aria-label="Module sections"] button {
                justify-content: flex-start !important;
                border-radius: 12px !important;
                min-height: 48px !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}
