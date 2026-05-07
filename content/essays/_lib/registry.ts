/**
 * Essay registry — single source of truth for every published essay.
 *
 * Adding an essay:
 *   1. Create `content/essays/<slug>.mdx` with `export const meta`.
 *   2. Add an entry to ESSAYS below: `{ slug, importer: () => import('../<slug>.mdx') }`.
 *   3. The /research/[slug] page resolves any registered slug automatically.
 *
 * Why an explicit registry instead of fs scanning:
 *   - Static analysis catches typos in slug references.
 *   - Next.js bundling stays predictable.
 *   - Frontmatter type-checks at registry-load time.
 */

import type { EssayMeta } from "./types";

export interface EssayModule {
  readonly meta: EssayMeta;
  readonly default: React.ComponentType;
}

export interface EssayEntry {
  readonly slug: string;
  readonly importer: () => Promise<EssayModule>;
}

export const ESSAYS: readonly EssayEntry[] = [
  {
    slug: "the-ai-use-case-inventory",
    importer: () => import("../the-ai-use-case-inventory.mdx"),
  },
  // Phase 07 migration adds the rest:
  //   { slug: "six-ways-ai-fails-in-banking", importer: () => import("../six-ways-ai-fails-in-banking.mdx") },
  //   { slug: "ai-governance-without-the-jargon", importer: () => import("../ai-governance-without-the-jargon.mdx") },
  //   { slug: "the-skill-not-the-prompt", importer: () => import("../the-skill-not-the-prompt.mdx") },
  //   { slug: "what-your-efficiency-ratio-is-hiding", importer: () => import("../what-your-efficiency-ratio-is-hiding.mdx") },
  //   { slug: "members-will-switch", importer: () => import("../members-will-switch.mdx") },
  //   { slug: "the-widening-ai-gap", importer: () => import("../the-widening-ai-gap.mdx") },
] as const;

export async function loadEssay(slug: string): Promise<EssayModule | null> {
  const entry = ESSAYS.find((e) => e.slug === slug);
  if (!entry) return null;
  return entry.importer();
}

/** Returns metadata for all non-draft essays, newest-first by date. */
export async function listEssayMeta(): Promise<readonly EssayMeta[]> {
  const all = await Promise.all(ESSAYS.map((e) => e.importer().then((m) => m.meta)));
  return all
    .filter((m) => !m.draft)
    .slice()
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      return b.date.localeCompare(a.date);
    });
}
