import { describe, expect, it, beforeEach } from 'vitest';
import { signAnonSessionId, verifyAnonSessionCookie } from './anonSession';

describe('anonSession HMAC', () => {
  beforeEach(() => {
    process.env.ANON_SESSION_COOKIE_SECRET = 'test-secret-1234567890';
  });

  it('round-trips a valid uuid', () => {
    const uuid = '12345678-1234-1234-1234-123456789012';
    const signed = signAnonSessionId(uuid);
    expect(verifyAnonSessionCookie(signed)).toBe(uuid);
  });

  it('rejects a tampered uuid', () => {
    const uuid = '12345678-1234-1234-1234-123456789012';
    const signed = signAnonSessionId(uuid);
    const tampered = signed.replace(uuid, '99999999-1234-1234-1234-123456789012');
    expect(verifyAnonSessionCookie(tampered)).toBeNull();
  });

  it('rejects a malformed uuid', () => {
    expect(verifyAnonSessionCookie('not-a-uuid.abc')).toBeNull();
  });

  it('rejects an unsigned value', () => {
    expect(verifyAnonSessionCookie('12345678-1234-1234-1234-123456789012')).toBeNull();
  });

  it('returns null for empty', () => {
    expect(verifyAnonSessionCookie(null)).toBeNull();
    expect(verifyAnonSessionCookie(undefined)).toBeNull();
    expect(verifyAnonSessionCookie('')).toBeNull();
  });
});
