import { describe, expect, it } from 'vitest';
import { EMAIL_RE, isValidEmail } from './validate';

describe('email validate', () => {
  it('accepts well-formed addresses', () => {
    for (const e of ['a@b.co', 'user.name@bank.example.com', 'x+y@z.io']) {
      expect(isValidEmail(e)).toBe(true);
      expect(EMAIL_RE.test(e)).toBe(true);
    }
  });
  it('rejects malformed addresses and trims', () => {
    for (const e of ['', 'no-at', 'a@b', 'a b@c.com', '@c.com', 'a@.com']) {
      expect(isValidEmail(e)).toBe(false);
    }
    expect(isValidEmail('  a@b.co  ')).toBe(true);
  });
});
