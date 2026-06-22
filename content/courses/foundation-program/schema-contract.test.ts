import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOUNDATION_FINAL_MODULE_NUMBER } from './course-config';

describe('Foundation course persistence schema contract', () => {
  it('keeps activity_responses wide enough for the final micro-module', () => {
    expect(FOUNDATION_FINAL_MODULE_NUMBER).toBe(18);

    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/00047_foundation_18_module_activity_responses.sql'),
      'utf8',
    );

    expect(migration).toContain(
      `CHECK (module_number BETWEEN 1 AND ${FOUNDATION_FINAL_MODULE_NUMBER})`,
    );
  });
});
