/**
 * Briefings registry — filesystem-discovered, unlike the hand-registered
 * essay registry it extends.
 *
 * Every file matching `content/briefings/<YYYY-MM-DD>-<slug>.mdx` is a
 * published briefing. Publishing is therefore a pure content change (one MDX
 * file + any claims-registry entries), which is what makes the pulse
 * auto-merge guard enforceable: the guard can require that a pulse PR touches
 * nothing but this directory and the claims registry.
 *
 * Each MDX file must `export const meta: EssayMeta` whose `date` and `slug`
 * match the filename — mismatches throw at build/render time, so a typo can
 * never publish under the wrong URL or date.
 *
 * The feed merges LEGACY_ESSAYS (the six bespoke TSX articles under
 * /resources/<slug>) so the briefings index is the one complete, dated,
 * newest-first list of everything editorial.
 */

import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { EssayMeta } from "@content/essays/_lib/types";
import { LEGACY_ESSAYS } from "@content/essays/_lib/registry";

export interface BriefingModule {
  readonly meta: EssayMeta;
  readonly default: React.ComponentType;
}

const BRIEFINGS_DIR = join(process.cwd(), "content/briefings");
const FILENAME = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.mdx$/;

/** All briefing MDX filenames, discovered from disk. Server-side only. */
function briefingFiles(): readonly string[] {
  try {
    return readdirSync(BRIEFINGS_DIR).filter((f) => FILENAME.test(f));
  } catch {
    return [];
  }
}

/**
 * Dynamic import with a static directory prefix and a static `.mdx` suffix,
 * so both webpack (next build) and vite (vitest) bundle exactly the MDX
 * context — `_lib` and any non-MDX files never enter it.
 */
async function importBriefing(file: string): Promise<BriefingModule> {
  const name = file.replace(/\.mdx$/, "");
  const mod = (await import(`../${name}.mdx`)) as BriefingModule;
  const m = FILENAME.exec(file);
  if (!m) throw new Error(`[briefings] bad filename: ${file}`);
  const [, date, slug] = m;
  if (mod.meta.date !== date || mod.meta.slug !== slug) {
    throw new Error(
      `[briefings] ${file}: meta mismatch (meta.date=${mod.meta.date}, meta.slug=${mod.meta.slug}) — filename must be <meta.date>-<meta.slug>.mdx`,
    );
  }
  return mod;
}

export async function loadBriefing(slug: string): Promise<BriefingModule | null> {
  const file = briefingFiles().find((f) => FILENAME.exec(f)?.[2] === slug);
  if (!file) return null;
  return importBriefing(file);
}

/**
 * Metadata + href for every briefing AND legacy essay, newest-first.
 * Briefings live at /briefings/<slug>; legacy essays keep their
 * /resources/<slug> homes.
 */
export async function listAllBriefings(): Promise<
  readonly (EssayMeta & { readonly href: string })[]
> {
  const mdx = await Promise.all(
    briefingFiles().map(async (f) => {
      const mod = await importBriefing(f);
      return { ...mod.meta, href: `/briefings/${mod.meta.slug}` };
    }),
  );
  const legacy = LEGACY_ESSAYS.map((m) => ({ ...m, href: m.legacyHref }));
  return [...mdx, ...legacy]
    .filter((m) => !m.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}
