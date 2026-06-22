import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Supabase migration hygiene', () => {
  it('keeps valid numeric migration versions unique', () => {
    const files = readdirSync(resolve(process.cwd(), 'supabase/migrations'))
      .filter((file) => file.endsWith('.sql'));
    const versions = new Map<string, string[]>();

    for (const file of files) {
      const match = /^(\d+)_/.exec(file);
      if (!match) continue;
      const version = match[1];
      versions.set(version, [...(versions.get(version) ?? []), file]);
    }

    const duplicates = [...versions.entries()]
      .filter(([, matches]) => matches.length > 1)
      .map(([version, matches]) => `${version}: ${matches.join(', ')}`);

    expect(duplicates).toEqual([]);
  });
});
