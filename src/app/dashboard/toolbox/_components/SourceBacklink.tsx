// src/app/dashboard/toolbox/_components/SourceBacklink.tsx
//
// Plan F Task 6: small caption rendered under each My Toolbox row that
// links a saved skill back to its origin (course module or library entry).

import Link from 'next/link';
import type { ToolboxSource } from '@/lib/toolbox/types';

const COURSE_REF_PATTERN = /^aibi-p\/module-(\d+)\/[^/]+$/;
const LIBRARY_REF_PATTERN = /^library:([0-9a-f-]{36})@/i;
const COOKBOOK_REF_PATTERN = /^cookbook:([^#]+)#step-(\d+)$/;

interface SourceBacklinkProps {
  readonly source?: ToolboxSource;
  readonly sourceRef?: string;
  readonly librarySlugMap: Readonly<Record<string, string>>;
}

interface BacklinkTarget {
  readonly label: string;
  readonly href: string;
}

function resolveTarget(
  source: ToolboxSource,
  sourceRef: string,
  librarySlugMap: Readonly<Record<string, string>>
): BacklinkTarget | null {
  if (source === 'course') {
    const match = COURSE_REF_PATTERN.exec(sourceRef);
    if (!match) return null;
    const moduleNumber = match[1];
    return {
      label: `AiBI-Practitioner · Module ${moduleNumber}`,
      href: `/courses/aibi-p/${moduleNumber}`,
    };
  }
  // Cookbook branch must precede the library branch: a cookbook source_ref
  // (`cookbook:<slug>#step-<n>`) is not library-prefixed, but keeping this
  // ordering explicit prevents a future edit from reversing it.
  const cookbookMatch = COOKBOOK_REF_PATTERN.exec(sourceRef);
  if (cookbookMatch) {
    const [, slug, step] = cookbookMatch;
    return {
      label: `Cookbook recipe · step ${step}`,
      href: `/dashboard/toolbox/cookbook/${slug}`,
    };
  }
  if (source === 'library' || source === 'forked') {
    const match = LIBRARY_REF_PATTERN.exec(sourceRef);
    if (!match) return null;
    const slug = librarySlugMap[match[1]];
    if (!slug) return null;
    return {
      label: 'Library entry',
      href: `/dashboard/toolbox/library/${slug}`,
    };
  }
  return null;
}

export function SourceBacklink({
  source,
  sourceRef,
  librarySlugMap,
}: SourceBacklinkProps): JSX.Element | null {
  if (!source || !sourceRef) return null;
  const target = resolveTarget(source, sourceRef, librarySlugMap);
  if (!target) return null;

  return (
    <Link
      href={target.href}
      className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-terra)]"
    >
      {target.label}
    </Link>
  );
}
