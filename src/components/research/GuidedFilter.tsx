'use client';

// GuidedFilter — "What are you trying to do?" guided selector for /research.
//
// Renders three chip rows (role / problem / format). Selected chips are
// removable pills above the results. "Clear all filters" link when any chip
// is active. No selection → show all (default catalog behavior preserved).
//
// Filter state lives here; downstream sections receive a `hidden` prop
// derived from FilterContext. The page passes each artifact's tags as a
// data-attribute pattern — sections use the exported `useFilter` hook to
// decide visibility.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
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
        next.roles.has(t) ? next.roles.delete(t) : next.roles.add(t);
      } else if (facet === 'problem') {
        const t = tag as ProblemTag;
        next.problems.has(t) ? next.problems.delete(t) : next.problems.add(t);
      } else {
        const t = tag as FormatTag;
        next.formats.has(t) ? next.formats.delete(t) : next.formats.add(t);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setFilter(emptyFilter()), []);

  const value = useMemo(() => ({ filter, toggle, clear }), [filter, toggle, clear]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

// ─── Chip button ─────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export function GuidedFilter() {
  const { filter, toggle, clear } = useFilter();

  const activePills: { label: string; facet: TagFacet; tag: AnyTag }[] = [
    ...Array.from(filter.roles).map((t) => ({ label: t, facet: 'role' as TagFacet, tag: t as AnyTag })),
    ...Array.from(filter.problems).map((t) => ({ label: t, facet: 'problem' as TagFacet, tag: t as AnyTag })),
    ...Array.from(filter.formats).map((t) => ({ label: t, facet: 'format' as TagFacet, tag: t as AnyTag })),
  ];

  const hasActive = activePills.length > 0;

  return (
    <section className="mk-guided-filter" aria-label="Filter resources by role, problem, or format">
      <div className="mk-container">
        <div className="mk-guided-filter-inner">

          <div className="mk-guided-filter-header">
            <span className="mk-guided-kicker">What are you trying to do?</span>
            <p className="mk-guided-hint">
              Select one or more to filter the library below. No selection shows everything.
            </p>
          </div>

          {/* Row: By role */}
          <div className="mk-guided-row">
            <span className="mk-guided-row-label" id="filter-role-label">By role</span>
            <div className="mk-guided-chips" role="group" aria-labelledby="filter-role-label">
              {ROLE_CHIPS.map((chip) => (
                <ChipButton
                  key={chip}
                  label={chip}
                  selected={filter.roles.has(chip)}
                  onClick={() => toggle('role', chip)}
                />
              ))}
            </div>
          </div>

          {/* Row: By problem */}
          <div className="mk-guided-row">
            <span className="mk-guided-row-label" id="filter-problem-label">By problem</span>
            <div className="mk-guided-chips" role="group" aria-labelledby="filter-problem-label">
              {PROBLEM_CHIPS.map((chip) => (
                <ChipButton
                  key={chip}
                  label={chip}
                  selected={filter.problems.has(chip)}
                  onClick={() => toggle('problem', chip)}
                />
              ))}
            </div>
          </div>

          {/* Row: By format */}
          <div className="mk-guided-row">
            <span className="mk-guided-row-label" id="filter-format-label">By format</span>
            <div className="mk-guided-chips" role="group" aria-labelledby="filter-format-label">
              {FORMAT_CHIPS.map((chip) => (
                <ChipButton
                  key={chip}
                  label={chip}
                  selected={filter.formats.has(chip)}
                  onClick={() => toggle('format', chip)}
                />
              ))}
            </div>
          </div>

          {/* Active pills + clear */}
          {hasActive && (
            <div className="mk-guided-active-row" role="status" aria-live="polite" aria-label="Active filters">
              <span className="mk-guided-active-label">Showing:</span>
              <div className="mk-guided-active-pills">
                {activePills.map(({ label, facet, tag }) => (
                  <ActivePill key={`${facet}-${label}`} label={label} facet={facet} tag={tag} toggle={toggle} />
                ))}
              </div>
              <button type="button" onClick={clear} className="mk-guided-clear">
                Clear all filters
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
