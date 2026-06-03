// Sync Foundation course sandbox sample data into public/ so the browser
// can fetch it.
//
// The AIPracticeSandbox component (src/components/AIPracticeSandbox.tsx)
// fetches sample data at runtime from `/sandbox-data/<product>/<module>/<id>.<ext>`,
// which Next.js serves from `public/`. The canonical content, however, lives
// in `content/sandbox-data/` alongside its TypeScript config. Without this
// sync every module of the paid course shows "Error loading sample data."
// (the foundation-cx audit found this 404 on all 12 modules).
//
// This script copies ONLY the learner-facing data files (.md / .csv) into
// public/, leaving the .ts config/index files behind. It is idempotent and
// runs automatically on `predev` and `prebuild`.
//
// Usage: node scripts/sync-sandbox-data.mjs

import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const SRC_DIR = resolve(process.cwd(), 'content/sandbox-data');
const OUT_DIR = resolve(process.cwd(), 'public/sandbox-data');
const DATA_EXTENSIONS = new Set(['.md', '.csv']);

async function collectDataFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectDataFiles(full)));
    } else if (DATA_EXTENSIONS.has(extOf(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function extOf(name) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

async function main() {
  try {
    await stat(SRC_DIR);
  } catch {
    console.error(`[sync-sandbox-data] source not found: ${SRC_DIR}`);
    process.exit(1);
  }

  // Start clean so deleted source files don't linger in public/.
  await rm(OUT_DIR, { recursive: true, force: true });

  const files = await collectDataFiles(SRC_DIR);
  for (const file of files) {
    const rel = relative(SRC_DIR, file);
    const dest = join(OUT_DIR, rel);
    await mkdir(dirname(dest), { recursive: true });
    await cp(file, dest);
  }

  console.log(`[sync-sandbox-data] copied ${files.length} data file(s) to public/sandbox-data`);
}

main().catch((err) => {
  console.error('[sync-sandbox-data] failed:', err);
  process.exit(1);
});
