import { describe, expect, it } from 'vitest';
import { isSupportAdminEmail, parseAdminSupportEmails } from './admin';

describe('support admin allowlist', () => {
  it('parses a comma-separated allowlist', () => {
    expect(parseAdminSupportEmails(' hello@aibankinginstitute.com, Ops@Example.com ,,')).toEqual([
      'hello@aibankinginstitute.com',
      'ops@example.com',
    ]);
  });

  it('matches admin emails case-insensitively', () => {
    expect(
      isSupportAdminEmail('HELLO@aibankinginstitute.com', ['hello@aibankinginstitute.com']),
    ).toBe(true);
    expect(isSupportAdminEmail('buyer@example.com', ['hello@aibankinginstitute.com'])).toBe(false);
  });
});
