import { describe, expect, it } from 'vitest';
import { scanForPII } from './pii-scanner';

describe('scanForPII', () => {
  it('allows normal banking scenario numbers and regulatory references', () => {
    expect(scanForPII(
      'Review BSA 1020.220 for accounts opened before 2022. Q1 deposits were $4,200 and APY was 4.50%.',
    )).toEqual({ safe: true });
  });

  it.each([
    ['ssn', 'Customer wrote SSN 123-45-6789 on the form.'],
    ['ssn', 'Customer wrote 123 45 6789 on the intake sheet.'],
    ['ssn', 'The application lists 123.45.6789 as the identifier.'],
    ['email', 'Send the note to borrower@example.com.'],
    ['phone', 'Call the member at (206) 555-0147 today.'],
    ['date_of_birth', 'DOB: 03/14/1982'],
    ['address', 'Mail the notice to 123 Main Street.'],
    ['masked_identifier', 'Account ending in 4321 has a dispute.'],
    ['account_number', 'Member ID M-0087423 called about the complaint.'],
    ['person_name', 'From: Sarah Mitchell, requesting help with a debit card issue.'],
  ] as const)('flags %s evidence', (kind, text) => {
    const result = scanForPII(text);

    expect(result.safe).toBe(false);
    expect(result.kind).toBe(kind);
    expect(result.reason).toBeTruthy();
  });
});
