import { describe, expect, it } from 'vitest';
import { isNonDeliverableEmail } from './deliverability';

describe('isNonDeliverableEmail', () => {
  it('flags reserved .test fixture addresses', () => {
    expect(isNonDeliverableEmail('e2e+persona-7@aibankinginstitute.test')).toBe(true);
  });

  it('flags example.com and examplebank.com placeholder domains', () => {
    expect(isNonDeliverableEmail('buyer@example.com')).toBe(true);
    expect(isNonDeliverableEmail('ops@examplebank.com')).toBe(true);
  });

  it('is case- and whitespace-insensitive', () => {
    expect(isNonDeliverableEmail('  Buyer@Example.COM  ')).toBe(true);
  });

  it('allows a normal deliverable address', () => {
    expect(isNonDeliverableEmail('lender@communitybank.com')).toBe(false);
  });

  it('does not flag malformed or empty input', () => {
    expect(isNonDeliverableEmail('')).toBe(false);
    expect(isNonDeliverableEmail('not-an-email')).toBe(false);
    expect(isNonDeliverableEmail('trailing@')).toBe(false);
  });
});
