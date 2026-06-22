import { describe, it, expect } from 'vitest';
import { parseAdminEmails, isAdminEmail } from './access';

// The admin gate protects PII-bearing /admin surfaces. The dominant risk is a
// FALSE OPEN: a misconfigured/empty allowlist, or a null session email, must
// never grant access. These tests pin the fail-closed contract.

describe('parseAdminEmails', () => {
  it('returns [] for unset/empty input (fail-closed)', () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
    expect(parseAdminEmails(null)).toEqual([]);
    expect(parseAdminEmails('')).toEqual([]);
    expect(parseAdminEmails('   ')).toEqual([]);
  });

  it('splits on commas, whitespace, and newlines', () => {
    expect(parseAdminEmails('a@x.com, b@x.com\nc@x.com d@x.com')).toEqual([
      'a@x.com',
      'b@x.com',
      'c@x.com',
      'd@x.com',
    ]);
  });

  it('lowercases and dedupes', () => {
    expect(parseAdminEmails('Admin@X.com, admin@x.com')).toEqual(['admin@x.com']);
  });

  it('canonicalizes Gmail aliases to one entry', () => {
    expect(parseAdminEmails('jane.doe+ops@gmail.com, janedoe@gmail.com')).toEqual([
      'janedoe@gmail.com',
    ]);
  });
});

describe('isAdminEmail', () => {
  const allow = 'owner@aibankinginstitute.com, ops@aibankinginstitute.com';

  it('allows an exact allowlisted email', () => {
    expect(isAdminEmail('owner@aibankinginstitute.com', allow)).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isAdminEmail('Owner@AIBankingInstitute.com', allow)).toBe(true);
  });

  it('matches a Gmail alias against the canonical allowlist entry', () => {
    expect(isAdminEmail('admin+test@gmail.com', 'admin@gmail.com')).toBe(true);
    expect(isAdminEmail('a.d.m.i.n@gmail.com', 'admin@gmail.com')).toBe(true);
  });

  it('denies a non-allowlisted email', () => {
    expect(isAdminEmail('stranger@evil.com', allow)).toBe(false);
  });

  it('fails closed on null/undefined/empty email', () => {
    expect(isAdminEmail(null, allow)).toBe(false);
    expect(isAdminEmail(undefined, allow)).toBe(false);
    expect(isAdminEmail('', allow)).toBe(false);
    expect(isAdminEmail('   ', allow)).toBe(false);
  });

  it('fails closed when the allowlist is empty/unset', () => {
    expect(isAdminEmail('owner@aibankinginstitute.com', '')).toBe(false);
    expect(isAdminEmail('owner@aibankinginstitute.com', undefined)).toBe(false);
  });
});
