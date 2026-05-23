import { describe, expect, it } from 'vitest';
import { isValidEmail, normalizeEmail } from './service';

describe('email helpers', () => {
  it('accepts simple addresses', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('first.last+tag@bank-cu.example.com')).toBe(true);
  });

  it('rejects obvious garbage', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(' ')).toBe(false);
    expect(isValidEmail('no-at-sign')).toBe(false);
    expect(isValidEmail('two@@signs.com')).toBe(false);
    expect(isValidEmail('no-domain@')).toBe(false);
    expect(isValidEmail('@no-local.com')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(42)).toBe(false);
  });

  it('rejects overly long addresses', () => {
    const long = 'a'.repeat(250) + '@b.co';
    expect(isValidEmail(long)).toBe(false);
  });

  it('normalizes to lowercase + trims', () => {
    expect(normalizeEmail('  Foo@Example.COM ')).toBe('foo@example.com');
  });
});
