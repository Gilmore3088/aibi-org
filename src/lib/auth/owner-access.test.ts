import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isOwnerEmail, listOwnerEmails } from './owner-access';

describe('owner-access', () => {
  const originalEnv = process.env.OWNER_EMAILS;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.OWNER_EMAILS;
    } else {
      process.env.OWNER_EMAILS = originalEnv;
    }
  });

  describe('default fallback (no OWNER_EMAILS set)', () => {
    beforeEach(() => {
      delete process.env.OWNER_EMAILS;
    });

    it('includes the default owner email', () => {
      expect(isOwnerEmail('jlgilmore2@gmail.com')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(isOwnerEmail('JLGilmore2@Gmail.com')).toBe(true);
    });

    it('rejects non-owner emails', () => {
      expect(isOwnerEmail('attacker@example.com')).toBe(false);
    });
  });

  describe('null/undefined/empty handling', () => {
    it('rejects null', () => {
      expect(isOwnerEmail(null)).toBe(false);
    });
    it('rejects undefined', () => {
      expect(isOwnerEmail(undefined)).toBe(false);
    });
    it('rejects empty string', () => {
      expect(isOwnerEmail('')).toBe(false);
    });
  });

  describe('OWNER_EMAILS env var', () => {
    it('parses comma-separated list', () => {
      process.env.OWNER_EMAILS = 'a@example.com,b@example.com,c@example.com';
      expect(isOwnerEmail('a@example.com')).toBe(true);
      expect(isOwnerEmail('b@example.com')).toBe(true);
      expect(isOwnerEmail('c@example.com')).toBe(true);
      expect(isOwnerEmail('d@example.com')).toBe(false);
    });

    it('trims whitespace', () => {
      process.env.OWNER_EMAILS = '  spaced@example.com  ,  another@example.com  ';
      expect(isOwnerEmail('spaced@example.com')).toBe(true);
      expect(isOwnerEmail('another@example.com')).toBe(true);
    });

    it('overrides the default — default email no longer privileged', () => {
      process.env.OWNER_EMAILS = 'someone-else@example.com';
      expect(isOwnerEmail('jlgilmore2@gmail.com')).toBe(false);
      expect(isOwnerEmail('someone-else@example.com')).toBe(true);
    });

    it('treats empty string as "use default"', () => {
      process.env.OWNER_EMAILS = '';
      expect(isOwnerEmail('jlgilmore2@gmail.com')).toBe(true);
    });

    it('treats whitespace-only string as "use default"', () => {
      process.env.OWNER_EMAILS = '   ';
      expect(isOwnerEmail('jlgilmore2@gmail.com')).toBe(true);
    });
  });

  describe('listOwnerEmails', () => {
    it('returns the default when env is unset', () => {
      delete process.env.OWNER_EMAILS;
      expect(listOwnerEmails()).toContain('jlgilmore2@gmail.com');
    });

    it('returns the env-configured list when set', () => {
      process.env.OWNER_EMAILS = 'a@example.com,b@example.com';
      const list = listOwnerEmails();
      expect(list).toContain('a@example.com');
      expect(list).toContain('b@example.com');
      expect(list).not.toContain('jlgilmore2@gmail.com');
    });
  });
});
