import { describe, expect, it } from 'vitest';
import { emailIsOperator, parseOperatorAllowlist } from './isOperator';

describe('parseOperatorAllowlist', () => {
  it('returns empty set for undefined / empty', () => {
    expect(parseOperatorAllowlist(undefined).size).toBe(0);
    expect(parseOperatorAllowlist('').size).toBe(0);
    expect(parseOperatorAllowlist('  ,  ,').size).toBe(0);
  });

  it('lower-cases and trims entries', () => {
    const set = parseOperatorAllowlist('Ops@Example.com, Founder@Example.COM ');
    expect(set.has('ops@example.com')).toBe(true);
    expect(set.has('founder@example.com')).toBe(true);
    expect(set.size).toBe(2);
  });
});

describe('emailIsOperator', () => {
  const allow = parseOperatorAllowlist('ops@example.com,founder@example.com');

  it('returns false for null / undefined / empty allowlist', () => {
    expect(emailIsOperator(null, allow)).toBe(false);
    expect(emailIsOperator(undefined, allow)).toBe(false);
    expect(emailIsOperator('ops@example.com', new Set())).toBe(false);
  });

  it('matches case-insensitively', () => {
    expect(emailIsOperator('OPS@example.com', allow)).toBe(true);
    expect(emailIsOperator('  founder@example.com  ', allow)).toBe(true);
  });

  it('rejects non-allow-listed emails', () => {
    expect(emailIsOperator('intruder@example.com', allow)).toBe(false);
  });
});
