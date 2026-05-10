import { describe, it, expect } from 'vitest';
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
