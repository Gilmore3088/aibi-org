import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sitemap from './sitemap';

// Every URL we ask search engines to index must declare its own canonical.
// The root layout used to default `canonical: '/'`, which Next resolves against
// the site root only, so any page without its own canonical pointed at the
// homepage (17 sitemap URLs were affected). This test finds the route file for
// each sitemap URL and fails if it never mentions `alternates`.

const APP_DIR = join(__dirname);

function findPageFile(segments: string[], dir = APP_DIR): string | null {
  if (segments.length === 0) {
    const file = join(dir, 'page.tsx');
    return existsSync(file) ? file : null;
  }
  const [head, ...rest] = segments;
  const entries = readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
  const exact = entries.find((e) => e.name === head);
  if (exact) {
    const hit = findPageFile(rest, join(dir, exact.name));
    if (hit) return hit;
  }
  for (const e of entries) {
    if (/^\[[^\]]+\]$/.test(e.name)) {
      const hit = findPageFile(rest, join(dir, e.name));
      if (hit) return hit;
    }
  }
  return null;
}

describe('canonical coverage', () => {
  it('every sitemap URL resolves to a route that sets its own canonical', async () => {
    const entries = await sitemap();
    const missing: string[] = [];
    for (const entry of entries) {
      const path = new URL(entry.url).pathname;
      const segments = path.split('/').filter(Boolean);
      const file = findPageFile(segments);
      if (!file) {
        missing.push(`${path} (no page.tsx found)`);
        continue;
      }
      if (!readFileSync(file, 'utf8').includes('alternates')) missing.push(path);
    }
    expect(missing).toEqual([]);
  });
});
