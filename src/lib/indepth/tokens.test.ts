import { describe, it, expect } from 'vitest';
import { generateInviteToken, isValidInviteToken } from './tokens';

describe('invite tokens', () => {
  it('generates 32+ char base64url tokens', () => {
    const t = generateInviteToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{32,}$/);
  });

  it('isValidInviteToken accepts generated tokens', () => {
    const t = generateInviteToken();
    expect(isValidInviteToken(t)).toBe(true);
  });

  it('isValidInviteToken rejects empty / short / suspicious strings', () => {
    expect(isValidInviteToken('')).toBe(false);
    expect(isValidInviteToken('short')).toBe(false);
    expect(isValidInviteToken('x'.repeat(100) + '!?')).toBe(false);
  });

  it('two generated tokens are different (statistically)', () => {
    const t1 = generateInviteToken();
    const t2 = generateInviteToken();
    expect(t1).not.toBe(t2);
  });

  it('isValidInviteToken handles non-string input safely', () => {
    expect(isValidInviteToken(undefined as unknown as string)).toBe(false);
    expect(isValidInviteToken(null as unknown as string)).toBe(false);
    expect(isValidInviteToken(42 as unknown as string)).toBe(false);
  });
});
