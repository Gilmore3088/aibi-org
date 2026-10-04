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

describe('exam question bank has no answer-length tell', () => {
  const stats = examQuestions.map((q) => {
    const lengths = q.options.map((o) => o.label.length);
    const correct = q.options.find((o) => o.key === q.correctKey)!.label.length;
    return { longest: correct === Math.max(...lengths), shortest: correct === Math.min(...lengths) };
  });

  it('every question has its correct key among its options', () => {
    for (const q of examQuestions) {
      expect(q.options.some((o) => o.key === q.correctKey)).toBe(true);
    }
  });

  it('the correct answer is rarely the longest option', () => {
    // Was 39 of 40 before the 2026-09-30 rewrite; "pick the longest" passed.
    expect(stats.filter((s) => s.longest).length / stats.length).toBeLessThanOrEqual(0.4);
  });

  it('the correct answer is rarely the shortest option either', () => {
    expect(stats.filter((s) => s.shortest).length / stats.length).toBeLessThanOrEqual(0.4);
  });
});
