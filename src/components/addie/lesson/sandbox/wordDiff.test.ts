import { describe, it, expect } from 'vitest';
import { diffWords } from './wordDiff';

describe('diffWords', () => {
  it('marks identical strings as all-same', () => {
    const { left, right } = diffWords('hello world', 'hello world');
    const uniqueL = left.filter((t) => t.tag === 'unique');
    const uniqueR = right.filter((t) => t.tag === 'unique');
    expect(uniqueL.length).toBe(0);
    expect(uniqueR.length).toBe(0);
  });

  it('flags words that only appear on one side', () => {
    const { left, right } = diffWords(
      'the bank pays interest monthly',
      'the credit union pays interest annually',
    );
    expect(left.find((t) => t.text === 'bank')?.tag).toBe('unique');
    expect(left.find((t) => t.text === 'monthly')?.tag).toBe('unique');
    expect(right.find((t) => t.text === 'credit')?.tag).toBe('unique');
    expect(right.find((t) => t.text === 'union')?.tag).toBe('unique');
    expect(right.find((t) => t.text === 'annually')?.tag).toBe('unique');
    expect(left.find((t) => t.text === 'pays')?.tag).toBe('same');
    expect(right.find((t) => t.text === 'pays')?.tag).toBe('same');
  });

  it('preserves whitespace tokens between words', () => {
    const { left } = diffWords('a b c', 'a c');
    const joined = left.map((t) => t.text).join('');
    expect(joined).toBe('a b c');
  });

  it('handles empty inputs', () => {
    const { left, right } = diffWords('', '');
    expect(left).toEqual([]);
    expect(right).toEqual([]);
  });
});
