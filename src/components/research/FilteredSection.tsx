'use client';

// FilteredSection — renders its children when at least one artifact matches,
// or shows a compact "No matches in [section]" one-liner when a filter is
// active but nothing in this section qualifies.
//
// When no filter is active (isFilterEmpty), always renders children.

import type { ReactNode } from 'react';
import { useFilter, artifactMatchesFilter, type ArtifactTags } from './GuidedFilter';

interface FilteredSectionProps {
  /** Tags for every artifact in this section, keyed by a stable string. */
  artifactTags: Record<string, ArtifactTags>;
  /** Human-readable section name shown in the empty-state one-liner. */
  sectionName: string;
  children: ReactNode;
}

export function FilteredSection({ artifactTags, sectionName, children }: FilteredSectionProps) {
  const { filter } = useFilter();

  // When no filter chips are selected, always show everything.
  const filterActive =
    filter.roles.size > 0 || filter.problems.size > 0 || filter.formats.size > 0;

  if (!filterActive) return <>{children}</>;

  const hasMatch = Object.values(artifactTags).some((tags) =>
    artifactMatchesFilter(tags, filter)
  );

  if (!hasMatch) {
    return (
      <div className="mk-guided-empty-section" role="status" aria-live="polite">
        No matches in <span className="mk-guided-empty-section-name">{sectionName}</span>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── FilteredCard ─────────────────────────────────────────────────────────────
// Hides an individual card when its tags don't match the active filter.

interface FilteredCardProps {
  tags: ArtifactTags;
  children: ReactNode;
}

export function FilteredCard({ tags, children }: FilteredCardProps) {
  const { filter } = useFilter();
  if (!artifactMatchesFilter(tags, filter)) return null;
  return <>{children}</>;
}
