'use client';

// FilteredSection — renders its children only when they contain at least one
// artifact that matches the active filter. Used to hide entire catalog
// sections when no items within them pass the filter.
//
// Usage:
//   <FilteredSection anyMatch={items.some(i => artifactMatchesFilter(i.tags, filter))}>
//     ...section JSX...
//   </FilteredSection>
//
// Because the page is a server component, we can't call useFilter() there.
// Instead the server component pre-computes a `matchKeys` list and passes it
// as a prop; the client wrapper reads the live filter and compares.

import type { ReactNode } from 'react';
import { useFilter, artifactMatchesFilter, type ArtifactTags } from './GuidedFilter';

interface FilteredSectionProps {
  /** Tags for every artifact in this section, keyed by a stable string. */
  artifactTags: Record<string, ArtifactTags>;
  children: ReactNode;
}

export function FilteredSection({ artifactTags, children }: FilteredSectionProps) {
  const { filter } = useFilter();

  const hasMatch = Object.values(artifactTags).some((tags) =>
    artifactMatchesFilter(tags, filter)
  );

  if (!hasMatch) return null;
  return <>{children}</>;
}

// ─── FilteredCard ─────────────────────────────────────────────────────────────
// Hides an individual card when its tags don't match. Wraps a single card's
// outer div so nothing inside changes.

interface FilteredCardProps {
  tags: ArtifactTags;
  children: ReactNode;
}

export function FilteredCard({ tags, children }: FilteredCardProps) {
  const { filter } = useFilter();
  if (!artifactMatchesFilter(tags, filter)) return null;
  return <>{children}</>;
}
