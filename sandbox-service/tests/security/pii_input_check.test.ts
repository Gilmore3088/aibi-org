/**
 * §14.4 — PII pre-check.
 *
 * Pattern-based check at sandbox-service/src/exercises/piiCheck.ts. Banker
 * reflex of pasting an SSN / card / routing / account number into a slot is
 * caught before the prompt is assembled.
 */

import { describe, expect, it } from 'vitest';
import { piiCheck } from '../../src/exercises/piiCheck';

describe('§14.4 PII pre-check', () => {
  it('detects SSN with dashes', () => {
    expect(piiCheck('Customer: John Doe, SSN 123-45-6789, applying for...').hits).toContain('SSN');
  });

  it('detects a 16-digit Luhn-valid card number', () => {
    // 4111 1111 1111 1111 is a canonical Visa test number (Luhn-valid).
    expect(piiCheck('Card on file 4111-1111-1111-1111 expires 12/29').hits).toContain('card');
  });

  it('detects an ABA-valid routing number', () => {
    // 021000021 — JPMorgan Chase NY routing (public, Luhn-style ABA-valid).
    expect(piiCheck('Routing 021000021, account 0001234').hits).toContain('routing');
  });

  it('detects a probable account number (10–17 digits, not Luhn/ABA)', () => {
    expect(piiCheck('Account: 12345678901234').hits).toContain('account');
  });

  it('returns empty for clean banker text', () => {
    expect(
      piiCheck('Reg E requires error-resolution notice within 10 business days.').hits,
    ).toEqual([]);
  });

  it('returns empty for the empty string', () => {
    expect(piiCheck('').hits).toEqual([]);
  });
});
