import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeProduct, dbReadValues, dbWriteValue } from './normalize';

describe('normalizeProduct', () => {
  it('collapses legacy aibi-p to canonical foundation', () => {
    expect(normalizeProduct('aibi-p')).toBe('foundation');
  });

  it('passes canonical foundation through unchanged', () => {
    expect(normalizeProduct('foundation')).toBe('foundation');
  });

  it('passes other canonical slugs through unchanged', () => {
    expect(normalizeProduct('aibi-s')).toBe('aibi-s');
    expect(normalizeProduct('aibi-l')).toBe('aibi-l');
    expect(normalizeProduct('toolbox-only')).toBe('toolbox-only');
  });

  it('returns null for nullish input', () => {
    expect(normalizeProduct(null)).toBeNull();
    expect(normalizeProduct(undefined)).toBeNull();
  });

  it('returns null for unknown slugs', () => {
    expect(normalizeProduct('unknown')).toBeNull();
    expect(normalizeProduct('')).toBeNull();
    expect(normalizeProduct('AIBI-P')).toBeNull(); // case-sensitive
  });
});

describe('dbReadValues', () => {
  it('returns the dual-read list for foundation', () => {
    expect(dbReadValues('foundation')).toEqual(['aibi-p', 'foundation']);
  });

  it('returns single-value list for non-renamed products', () => {
    expect(dbReadValues('aibi-s')).toEqual(['aibi-s']);
    expect(dbReadValues('aibi-l')).toEqual(['aibi-l']);
    expect(dbReadValues('toolbox-only')).toEqual(['toolbox-only']);
  });
});

describe('dbWriteValue', () => {
  it('always returns the canonical slug', () => {
    expect(dbWriteValue('foundation')).toBe('foundation');
    expect(dbWriteValue('aibi-s')).toBe('aibi-s');
  });
});

// Regression guard: if a future change re-introduces a literal
// `['aibi-p', 'foundation']` array anywhere in src/ (instead of routing
// through dbReadValues('foundation')), this test fails. The shim is the
// single source of truth for the dual-read window — see normalize.ts header
// for why the shim cannot be removed.
describe('shim-wiring guard', () => {
  const REPO_SRC = path.resolve(__dirname, '../..');
  const ALLOWED_FILES = new Set([
    path.join(REPO_SRC, 'lib/products/normalize.ts'),
    path.join(REPO_SRC, 'lib/products/normalize.test.ts'),
  ]);

  function listSourceFiles(dir: string, acc: string[] = []): string[] {
    for (const name of fs.readdirSync(dir)) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        listSourceFiles(full, acc);
      } else if (/\.(ts|tsx)$/.test(name)) {
        acc.push(full);
      }
    }
    return acc;
  }

  it('no production source file uses a literal dual-read array', () => {
    const files = listSourceFiles(REPO_SRC).filter((f) => !ALLOWED_FILES.has(f));
    // Match both single- and double-quoted variants with flexible internal spacing.
    const pattern = /\[\s*['"]aibi-p['"]\s*,\s*['"]foundation['"]\s*\]/;
    const offenders: string[] = [];
    for (const f of files) {
      const text = fs.readFileSync(f, 'utf8');
      if (pattern.test(text)) {
        offenders.push(path.relative(REPO_SRC, f));
      }
    }
    expect(offenders).toEqual([]);
  });
});
