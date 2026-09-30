import { describe, expect, it } from 'vitest';
import { examQuestions } from '@content/exams/foundation-program/questions';
import { shuffleOptions } from './useExam';

// Deterministic PRNG so the test is stable.
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('exam option shuffling', () => {
  it('keeps every option and its key, only changing order', () => {
    const q = examQuestions[0];
    const shuffled = shuffleOptions(q, seeded(7));
    expect([...shuffled.options].sort((x, y) => x.key.localeCompare(y.key))).toEqual(
      [...q.options].sort((x, y) => x.key.localeCompare(y.key)),
    );
    expect(shuffled.correctKey).toBe(q.correctKey);
  });

  it('does not let "always pick the same position" pass the exam', () => {
    const random = seeded(2026);
    for (let position = 0; position < 4; position += 1) {
      const correctAtPosition = examQuestions.filter((q) => {
        const shuffled = shuffleOptions(q, random);
        return shuffled.options[position]?.key === q.correctKey;
      }).length;
      // Before shuffling, always picking "b" scored ~90% ("Advanced").
      // A fixed-position guess should now sit near chance (25%).
      expect(correctAtPosition / examQuestions.length).toBeLessThan(0.5);
    }
  });
});
