/**
 * Essay registry — single source of truth for every published essay.
 *
 * Two arrays:
 *   ESSAYS         essays migrated to MDX (live at /research/<slug>)
 *   LEGACY_ESSAYS  metadata-only stubs for essays still rendered as
 *                  bespoke pages at /resources/<slug>; the archive
 *                  links to those URLs until migration completes.
 *
 * Adding an essay:
 *   1. Create `content/essays/<slug>.mdx` with `export const meta`.
 *   2. Move entry from LEGACY_ESSAYS to ESSAYS, adding the importer.
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

// The MDX system demo essay (`the-ai-use-case-inventory.mdx`) is intentionally
// NOT registered here. It exists in the repo to demonstrate the MDX content
// pattern — registering it would publish it as a real essay, but it contains
// fabricated specifics ("five regional examiners", invented sample sizes)
// drafted before any real essay content was provided. Add a real essay file +
// register it here when actual content is ready.
export const ESSAYS: readonly EssayEntry[] = [] as const;

/**
 * Essays still living as bespoke pages at /resources/<slug>.
 * Listed in the archive with /resources/<slug> hrefs.
 * Migration moves each entry into ESSAYS with an MDX importer.
 */
export const LEGACY_ESSAYS: readonly (EssayMeta & { readonly legacyHref: string })[] = [
  {
    slug: "ai-governance-without-the-jargon",
    title: "AI governance without the jargon.",
    dek: "Five regulatory frameworks govern AI use at community banks today. Here is what each one actually means for your daily work — no law degree required.",
    date: "2026-04-12",
    category: "Governance",
    readMinutes: 14,
    author: "James Gilmore",
    legacyHref: "/resources/ai-governance-without-the-jargon",
  },
  {
    slug: "six-ways-ai-fails-in-banking",
    title: "Six ways AI fails in banking — and what to do about each one.",
    dek: "The AIEOG AI Lexicon defines hallucination as factually incorrect output presented with apparent confidence. Six patterns surface specifically in banking.",
    date: "2026-04-08",
    category: "Risk & controls",
    readMinutes: 16,
    author: "James Gilmore",
    legacyHref: "/resources/six-ways-ai-fails-in-banking",
  },
  {
    slug: "the-skill-not-the-prompt",
    title: "The skill, not the prompt.",
    dek: "Prompting is a one-time act. A skill is a persistent, repeatable, institution-grade instruction. Here is why the distinction matters for community banks.",
    date: "2026-04-04",
    category: "Practitioner work",
    readMinutes: 13,
    author: "James Gilmore",
    legacyHref: "/resources/the-skill-not-the-prompt",
  },
  {
    slug: "what-your-efficiency-ratio-is-hiding",
    title: "What your efficiency ratio is hiding.",
    dek: "Community banks run at ~65% efficiency vs. ~55.7% industry-wide. The gap isn't capability — it's where the capability lives. AI is the lever that surfaces both.",
    date: "2026-03-27",
    category: "Member impact",
    readMinutes: 11,
    author: "James Gilmore",
    legacyHref: "/resources/what-your-efficiency-ratio-is-hiding",
  },
  {
    slug: "members-will-switch",
    title: "Members will switch. The question is to whom.",
    dek: "84% would switch FIs for AI-driven financial insights. 76% would switch for a better digital experience. Reading the consumer survey data against community-bank retention.",
    date: "2026-03-21",
    category: "Member impact",
    readMinutes: 9,
    author: "James Gilmore",
    legacyHref: "/resources/members-will-switch",
  },
  {
    slug: "the-widening-ai-gap",
    title: "The widening AI gap.",
    dek: "Top-25 banks moved from \"AI exploration\" to \"AI deployment\" in 2025. Community institutions are still in deck-review. The gap isn't time — it's posture.",
    date: "2026-03-14",
    category: "Examiner trends",
    readMinutes: 8,
    author: "James Gilmore",
    legacyHref: "/resources/the-widening-ai-gap",
  },
] as const;

export async function loadEssay(slug: string): Promise<EssayModule | null> {
  const entry = ESSAYS.find((e) => e.slug === slug);
  if (!entry) return null;
  return entry.importer();
}

/**
 * Returns metadata + href for every essay (MDX + legacy), newest-first.
 * Each item is shaped for consumption by <EssayArchive>.
 */
export async function listAllEssays(): Promise<
  readonly (EssayMeta & { readonly href: string })[]
> {
  const mdxMeta = await Promise.all(
    ESSAYS.map(async (e) => {
      const m = await e.importer();
      return { ...m.meta, href: `/research/${m.meta.slug}` };
    }),
  );
  const legacy = LEGACY_ESSAYS.map((m) => ({ ...m, href: m.legacyHref }));
  return [...mdxMeta, ...legacy]
    .filter((m) => !m.draft)
    .slice()
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      return b.date.localeCompare(a.date);
    });
}

/** Returns metadata for all non-draft essays, newest-first by date. */
export async function listEssayMeta(): Promise<readonly EssayMeta[]> {
  const all = await listAllEssays();
  return all;
}
