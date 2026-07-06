import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOTS = [
  'content/courses/foundation-program',
  'content/assessments/v2',
  'src/app/courses',
  'src/app/assessment/in-depth',
  'src/app/api/courses',
  'src/lib/lms',
  'src/lib/toolbox',
] as const;

const SKIP_PATTERNS = [
  /\.test\.[tj]sx?$/,
  /content\/courses\/foundation-program\/output-examples\.ts$/,
] as const;

// Unsupported outcome claims. Pre-launch there is no learner-outcome data, so
// learner-facing copy must never state measured peer results or fixed
// time-savings numbers. Frame outcomes as goals the learner can measure
// against their own baseline instead.
const FABRICATED_OUTCOME_PATTERNS = [
  /automate an average of/i,
  /average of \d+ workflows/i,
  /peerBenchmark/,
  /from 45 minutes to (under )?15/i,
  /who complete AiBI-Foundation (automate|implement|report)/i,
] as const;

const STALE_FOUNDATION_PATTERNS = [
  /m9-final-capstone/,
  /9\.capstone/,
  /Module 9 capstone/i,
  /Module 9 narrative/i,
  /Final Capstone Application/,
  /Capstone summary/i,
  /capstone deliverable/i,
  /capstone submission/i,
  /interactive capstone/i,
  /Capstone workflow/i,
  /Skill used for capstone/i,
  /four-item package/i,
  /12-module/i,
  /12 modules/i,
  /Twelve real/i,
  /all 12 artifacts/i,
] as const;

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) return listSourceFiles(full);
    if (!/\.[tj]sx?$/.test(full) && !/\.mdx$/.test(full)) return [];
    return [full];
  });
}

describe('Foundation course copy hygiene', () => {
  it('keeps old 12-module and Module 9 capstone language out of learner-facing code', () => {
    const repoRoot = process.cwd();
    const matches: string[] = [];

    for (const root of ROOTS) {
      const files = listSourceFiles(resolve(repoRoot, root));
      for (const file of files) {
        const rel = relative(repoRoot, file);
        if (SKIP_PATTERNS.some((pattern) => pattern.test(rel))) continue;
        const source = readFileSync(file, 'utf8');
        for (const pattern of STALE_FOUNDATION_PATTERNS) {
          if (pattern.test(source)) {
            matches.push(`${rel}: ${pattern}`);
          }
        }
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps fabricated outcome statistics out of learner-facing code', () => {
    const repoRoot = process.cwd();
    const matches: string[] = [];

    for (const root of ROOTS) {
      const files = listSourceFiles(resolve(repoRoot, root));
      for (const file of files) {
        const rel = relative(repoRoot, file);
        if (SKIP_PATTERNS.some((pattern) => pattern.test(rel))) continue;
        const source = readFileSync(file, 'utf8');
        for (const pattern of FABRICATED_OUTCOME_PATTERNS) {
          if (pattern.test(source)) {
            matches.push(`${rel}: ${pattern}`);
          }
        }
      }
    }

    expect(matches).toEqual([]);
  });
});
