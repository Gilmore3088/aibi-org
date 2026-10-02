import { describe, expect, it } from 'vitest';
import { detect, sanitize } from './detect';

const kinds = (text: string) => detect(text).map((f) => [f.kind, f.text]);

describe('detect', () => {
  it('finds every identifier in the homepage example prompt', () => {
    const text =
      'write a quick reply to John Smith — he’s furious we charged him 3 overdraft fees in one day on account 0042871. dob 04/12/1981, ssn •••–••–4829, cell (555) 123-4567. balance is $83.17. wants them reversed';
    expect(kinds(text)).toEqual([
      ['name', 'John Smith'],
      ['account', '0042871'],
      ['dob', '04/12/1981'],
      ['ssn', '•••–••–4829'],
      ['phone', '(555) 123-4567'],
      ['amount', '$83.17'],
    ]);
  });

  it('catches plain and labelled SSNs', () => {
    expect(kinds('SSN 123-45-6789')).toEqual([['ssn', '123-45-6789']]);
    expect(kinds('social security number: 123456789')).toEqual([['ssn', '123456789']]);
  });

  it('flags card numbers only when they pass the Luhn check', () => {
    expect(kinds('card 4111 1111 1111 1111 declined')).toEqual([['card', '4111 1111 1111 1111']]);
    expect(detect('reference 4111 1111 1111 1112').filter((f) => f.kind === 'card')).toEqual([]);
  });

  it('finds routing numbers, emails and street addresses', () => {
    expect(kinds('routing number 021000021')).toEqual([['routing', '021000021']]);
    expect(kinds('send it to jane.doe@example.com')).toEqual([['email', 'jane.doe@example.com']]);
    expect(kinds('she lives at 1200 Main Street now')).toEqual([['address', '1200 Main Street']]);
  });

  it('only treats capitalised words as names after a cue', () => {
    expect(kinds('Draft a reply for Maria Lopez about her loan')).toEqual([['name', 'Maria Lopez']]);
    expect(kinds('Mrs. Okafor called twice')).toEqual([['name', 'Okafor']]);
    expect(detect('Summarize the Interagency Guidance for the Board').filter((f) => f.kind === 'name')).toEqual([]);
    expect(detect('Write a memo for Retail Operations').filter((f) => f.kind === 'name')).toEqual([]);
  });

  it('returns nothing for a clean, placeholder-based prompt', () => {
    expect(
      detect('Write a short reply to [customer name] about [number] overdraft fees. Source: our fee policy.'),
    ).toEqual([]);
  });
});

describe('sanitize', () => {
  it('templates what the task needs and marks the rest for removal', () => {
    const out = sanitize('reply to John Smith on account 0042871, dob 04/12/1981');
    expect(out).toBe('reply to [customer name] on account [account number], dob [remove — not needed]');
  });
});
