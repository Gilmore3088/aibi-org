import { describe, expect, it } from 'vitest';
import { redactEmail } from './redact';

describe('redactEmail', () => {
  it('keeps enough context for log correlation without exposing the address', () => {
    expect(redactEmail('alex@example.com')).toBe('al***@example.com');
    expect(redactEmail('a@example.com')).toBe('a***@example.com');
  });

  it('does not echo malformed input', () => {
    expect(redactEmail('not-an-email')).toBe('[redacted-email]');
    expect(redactEmail('@example.com')).toBe('[redacted-email]');
  });
});
