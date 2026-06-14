import { describe, it, expect } from 'vitest';
import { isAutoTrustableType } from './trusted-device';

// Guards the auto-trust allowlist used by /auth/callback. The dominant risk is
// a SILENT re-lock: generateMagicLink emits type `email`, so `email` MUST be
// trustable, while `recovery` MUST NOT (a password reset must never mint trust).
describe('isAutoTrustableType', () => {
  it.each(['signup', 'magiclink', 'email'])('auto-trusts verified-email type %s', (t) => {
    expect(isAutoTrustableType(t)).toBe(true);
  });

  it.each(['recovery', 'invite', 'email_change', 'reauthentication', 'phone_change', ''])(
    'never auto-trusts %s',
    (t) => {
      expect(isAutoTrustableType(t)).toBe(false);
    },
  );

  it('never auto-trusts null/undefined (fail closed)', () => {
    expect(isAutoTrustableType(null)).toBe(false);
    expect(isAutoTrustableType(undefined)).toBe(false);
  });
});
