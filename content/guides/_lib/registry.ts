/**
 * Guides registry — filesystem-discovered, same pattern as briefings.
 *
 * Every `content/guides/<slug>.mdx` is a published guide (unless
 * `meta.draft`). Publishing a guide is a pure content change: one MDX file,
 * plus claims-registry entries for any statistic or regulatory citation it
 * introduces (scripts/check-claims.mjs scans this directory).
 *
 * `meta.slug` must match the filename; a mismatch throws at build/render
 * time so a typo can never publish under the wrong URL.
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { GuideMeta } from './types';

export interface GuideModule {
  readonly meta: GuideMeta;
  readonly default: React.ComponentType;
}

const GUIDES_DIR = join(process.cwd(), 'content/guides');
const FILENAME = /^([a-z0-9-]+)\.mdx$/;

function guideFiles(): readonly string[] {
  try {
    return readdirSync(GUIDES_DIR).filter((f) => FILENAME.test(f));
  } catch {
    return [];
  }
}

async function importGuide(file: string): Promise<GuideModule> {
  const name = file.replace(/\.mdx$/, '');
  const mod = (await import(`../${name}.mdx`)) as GuideModule;
  if (mod.meta.slug !== name) {
    throw new Error(
      `[guides] ${file}: meta.slug is "${mod.meta.slug}" — filename must be <meta.slug>.mdx`,
    );
  }
  return mod;
}

export async function loadGuide(slug: string): Promise<GuideModule | null> {
  if (!FILENAME.test(`${slug}.mdx`)) return null;
  const file = guideFiles().find((f) => f === `${slug}.mdx`);
  if (!file) return null;
  const mod = await importGuide(file);
  return mod.meta.draft ? null : mod;
}

/** Every published guide's meta, sorted by title. */
export async function listGuides(): Promise<readonly GuideMeta[]> {
  const mods = await Promise.all(guideFiles().map(importGuide));
  return mods
    .map((m) => m.meta)
    .filter((m) => !m.draft)
    .sort((a, b) => a.title.localeCompare(b.title));
}
