'use client';

// GuidedFilter — compact facet-picker for /research.
//
// UI: three trigger buttons (Role · Problem · Format). Each opens a popover
// on desktop (≥768px) or a full-width bottom drawer on mobile (<768px).
// Selected chips appear as removable gold pills above the catalog.
// No selection → show everything (default behavior preserved).
//
// WCAG: button[aria-expanded] + panel[role="dialog"][aria-labelledby] +
// focus trap when open + Esc closes + click-outside dismisses.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

// ─── Tag types ───────────────────────────────────────────────────────────────

export type RoleTag =
  | 'BSA'
  | 'Lending'
  | 'Compliance'
  | 'Marketing'
  | 'Operations'
  | 'IT/Executive';

export type ProblemTag =
  | 'Write safer staff comms'
  | 'Speed up loan-file review'
  | 'Prep for an audit'
  | 'Get an AI policy started'
  | 'Improve customer comms'
  | 'Decide which AI tools to allow';

export type FormatTag =
  | 'Cheatsheet'
  | 'Reference card'
  | 'Policy starter'
  | 'Sample report'
  | 'Playbook'
  | 'Template';

export type AnyTag = RoleTag | ProblemTag | FormatTag;

export type TagFacet = 'role' | 'problem' | 'format';

export interface ArtifactTags {
  roles: RoleTag[];
  problems: ProblemTag[];
  format: FormatTag;
}

// ─── Chip lists ──────────────────────────────────────────────────────────────

export const ROLE_CHIPS: RoleTag[] = [
  'BSA',
  'Lending',
  'Compliance',
  'Marketing',
  'Operations',
  'IT/Executive',
];

export const PROBLEM_CHIPS: ProblemTag[] = [
  'Write safer staff comms',
  'Speed up loan-file review',
  'Prep for an audit',
  'Get an AI policy started',
  'Improve customer comms',
  'Decide which AI tools to allow',
];

export const FORMAT_CHIPS: FormatTag[] = [
  'Cheatsheet',
  'Reference card',
  'Policy starter',
  'Sample report',
  'Playbook',
  'Template',
];

// ─── Filter state ─────────────────────────────────────────────────────────────

export interface FilterState {
  roles: Set<RoleTag>;
  problems: Set<ProblemTag>;
  formats: Set<FormatTag>;
}

function emptyFilter(): FilterState {
  return { roles: new Set(), problems: new Set(), formats: new Set() };
}

function isFilterEmpty(f: FilterState): boolean {
  return f.roles.size === 0 && f.problems.size === 0 && f.formats.size === 0;
}

/** Returns true if the artifact matches the active filter (or if no filter is active). */
export function artifactMatchesFilter(tags: ArtifactTags, filter: FilterState): boolean {
  if (isFilterEmpty(filter)) return true;

  const roleMatch =
    filter.roles.size === 0 || tags.roles.some((r) => filter.roles.has(r));
  const problemMatch =
    filter.problems.size === 0 || tags.problems.some((p) => filter.problems.has(p));
  const formatMatch =
    filter.formats.size === 0 || filter.formats.has(tags.format);

  return roleMatch && problemMatch && formatMatch;
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface FilterContextValue {
  filter: FilterState;
  toggle: (facet: TagFacet, tag: AnyTag) => void;
  clear: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used inside GuidedFilterProvider');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function GuidedFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterState>(emptyFilter);

  const toggle = useCallback((facet: TagFacet, tag: AnyTag) => {
    setFilter((prev) => {
      const next: FilterState = {
        roles: new Set(prev.roles),
        problems: new Set(prev.problems),
        formats: new Set(prev.formats),
      };
      if (facet === 'role') {
        const t = tag as RoleTag;
        if (next.roles.has(t)) next.roles.delete(t);
        else next.roles.add(t);
      } else if (facet === 'problem') {
        const t = tag as ProblemTag;
        if (next.problems.has(t)) next.problems.delete(t);
        else next.problems.add(t);
      } else {
        const t = tag as FormatTag;
        if (next.formats.has(t)) next.formats.delete(t);
        else next.formats.add(t);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setFilter(emptyFilter()), []);

  const value = useMemo(() => ({ filter, toggle, clear }), [filter, toggle, clear]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

// ─── Focus trap hook ──────────────────────────────────────────────────────────

function useFocusTrap(panelRef: React.MutableRefObject<HTMLElement | null>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    panel.addEventListener('keydown', handleKeyDown);
    return () => panel.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, panelRef]);
}

// ─── Chip button (inside popover/drawer) ──────────────────────────────────────

interface ChipButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function ChipButton({ label, selected, onClick }: ChipButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`mk-guided-chip${selected ? ' mk-guided-chip--active' : ''}`}
    >
      {label}
    </button>
  );
}

// ─── Active pill (removable) ─────────────────────────────────────────────────

interface ActivePillProps {
  label: string;
  facet: TagFacet;
  tag: AnyTag;
  toggle: (facet: TagFacet, tag: AnyTag) => void;
}

function ActivePill({ label, facet, tag, toggle }: ActivePillProps) {
  return (
    <button
      type="button"
      onClick={() => toggle(facet, tag)}
      className="mk-guided-active-pill"
      aria-label={`Remove filter: ${label}`}
    >
      {label}
      <span className="mk-guided-pill-x" aria-hidden="true">
        &times;
      </span>
    </button>
  );
}

// ─── Facet popover/drawer ────────────────────────────────────────────────────

interface FacetPanelProps {
  facet: TagFacet;
  labelId: string;
  chips: readonly AnyTag[];
  selectedSet: Set<AnyTag>;
  onToggle: (tag: AnyTag) => void;
  onClose: () => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
}

function FacetPanel({
  facet,
  labelId,
  chips,
  selectedSet,
  onToggle,
  onClose,
  triggerRef,
}: FacetPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(panelRef, true);

  // Close on Esc
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      onClose();
      triggerRef.current?.focus();
    }
  }

  // Click-outside dismiss
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  const facetLabel = facet === 'role' ? 'By role' : facet === 'problem' ? 'By problem' : 'By format';

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      className={`mk-guided-panel mk-guided-panel--${facet}`}
      onKeyDown={handleKeyDown}
    >
      <div className="mk-guided-panel-header">
        <span id={labelId} className="mk-guided-panel-title">{facetLabel}</span>
        <button
          type="button"
          onClick={() => { onClose(); triggerRef.current?.focus(); }}
          className="mk-guided-panel-close"
          aria-label="Close filter panel"
        >
          &times;
        </button>
      </div>
      <div className="mk-guided-chips mk-guided-panel-chips" role="group" aria-label={facetLabel}>
        {chips.map((chip) => (
          <ChipButton
            key={chip}
            label={chip}
            selected={selectedSet.has(chip)}
            onClick={() => onToggle(chip)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GuidedFilter() {
  const { filter, toggle, clear } = useFilter();
  const [openFacet, setOpenFacet] = useState<TagFacet | null>(null);

  const roleTriggerRef = useRef<HTMLButtonElement | null>(null);
  const problemTriggerRef = useRef<HTMLButtonElement | null>(null);
  const formatTriggerRef = useRef<HTMLButtonElement | null>(null);

  function openPanel(facet: TagFacet) {
    setOpenFacet((prev) => (prev === facet ? null : facet));
  }

  function closePanel() {
    setOpenFacet(null);
  }

  const activePills: { label: string; facet: TagFacet; tag: AnyTag }[] = [
    ...Array.from(filter.roles).map((t) => ({ label: t, facet: 'role' as TagFacet, tag: t as AnyTag })),
    ...Array.from(filter.problems).map((t) => ({ label: t, facet: 'problem' as TagFacet, tag: t as AnyTag })),
    ...Array.from(filter.formats).map((t) => ({ label: t, facet: 'format' as TagFacet, tag: t as AnyTag })),
  ];

  const hasActive = activePills.length > 0;

  // Count active chips per facet for badge display
  const roleCount = filter.roles.size;
  const problemCount = filter.problems.size;
  const formatCount = filter.formats.size;

  const facetConfig: { facet: TagFacet; label: string; count: number; chips: readonly AnyTag[]; ref: React.MutableRefObject<HTMLButtonElement | null> }[] = [
    { facet: 'role', label: 'Role', count: roleCount, chips: ROLE_CHIPS, ref: roleTriggerRef },
    { facet: 'problem', label: 'Problem', count: problemCount, chips: PROBLEM_CHIPS, ref: problemTriggerRef },
    { facet: 'format', label: 'Format', count: formatCount, chips: FORMAT_CHIPS, ref: formatTriggerRef },
  ];

  return (
    <section
      className="mk-guided-filter"
      aria-label="Filter resources by role, problem, or format"
    >
      <div className="mk-container">
        <div className="mk-guided-filter-inner">

          {/* Trigger row — 3 buttons */}
          <div className="mk-guided-trigger-row">
            <span className="mk-guided-filter-label">Filter by:</span>
            <div className="mk-guided-trigger-buttons">
              {facetConfig.map(({ facet, label, count, chips, ref }) => {
                const isOpen = openFacet === facet;
                const panelLabelId = `filter-panel-${facet}-label`;
                const selectedSet = facet === 'role'
                  ? (filter.roles as Set<AnyTag>)
                  : facet === 'problem'
                    ? (filter.problems as Set<AnyTag>)
                    : (filter.formats as Set<AnyTag>);
                return (
                  <div key={facet} className="mk-guided-trigger-wrap">
                    <button
                      ref={ref}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`filter-panel-${facet}`}
                      onClick={() => openPanel(facet)}
                      className={`mk-guided-trigger${count > 0 ? ' mk-guided-trigger--active' : ''}${isOpen ? ' mk-guided-trigger--open' : ''}`}
                    >
                      {label}
                      {count > 0 && (
                        <span className="mk-guided-trigger-badge" aria-label={`${count} selected`}>
                          {count}
                        </span>
                      )}
                      <span className="mk-guided-trigger-caret" aria-hidden="true">
                        {isOpen ? '▴' : '▾'}
                      </span>
                    </button>
                    {isOpen && (
                      <div id={`filter-panel-${facet}`} className="mk-guided-panel-anchor">
                        <FacetPanel
                          facet={facet}
                          labelId={panelLabelId}
                          chips={chips}
                          selectedSet={selectedSet}
                          onToggle={(tag) => toggle(facet, tag)}
                          onClose={closePanel}
                          triggerRef={ref}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {hasActive && (
              <button type="button" onClick={clear} className="mk-guided-clear">
                Clear all
              </button>
            )}
          </div>

          {/* Active pills */}
          {hasActive && (
            <div
              className="mk-guided-active-row"
              role="status"
              aria-live="polite"
              aria-label="Active filters"
            >
              <span className="mk-guided-active-label">Showing:</span>
              <div className="mk-guided-active-pills">
                {activePills.map(({ label, facet, tag }) => (
                  <ActivePill
                    key={`${facet}-${label}`}
                    label={label}
                    facet={facet}
                    tag={tag}
                    toggle={toggle}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile drawer backdrop */}
      {openFacet && (
        <div
          className="mk-guided-backdrop"
          aria-hidden="true"
          onClick={closePanel}
        />
      )}
    </section>
  );
}
