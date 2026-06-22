import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const LEGACY_DUPLICATE_VERSIONS = new Map([
  [
    '00011',
    [
      '00011_activity_responses_12_modules.sql',
      '00011_readiness_dimension_columns.sql',
    ],
  ],
]);

describe('Supabase migration hygiene', () => {
  it('does not introduce new duplicate numeric migration versions', () => {
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
      .filter(([version, matches]) => {
        const allowed = LEGACY_DUPLICATE_VERSIONS.get(version);
        return !allowed || allowed.join('|') !== matches.sort().join('|');
      })
      .map(([version, matches]) => `${version}: ${matches.join(', ')}`);

    expect(duplicates).toEqual([]);
  });

  it('keeps the latest Toolbox access helper aligned to paid launch products', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/00048_paid_toolbox_access_helper.sql'),
      'utf8',
    );

    for (const product of [
      'foundation',
      'foundations',
      'aibi-p',
      'aibi-s',
      'aibi-l',
      'toolbox-only',
      'in-depth-assessment',
    ]) {
      expect(migration).toContain(`'${product}'`);
    }
    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.has_toolbox_access');
  });
});
