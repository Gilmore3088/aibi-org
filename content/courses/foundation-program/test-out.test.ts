import { describe, expect, it } from 'vitest';
import { FOUNDATION_MICRO_MODULES } from './micro-modules';
import { ROLE_PATHS } from './role-paths';
import {
  TEST_OUT_CHECKS,
  getTestOutCheck,
  gradeTestOut,
  isTestOutEligible,
} from './test-out';
import type { LearnerRole } from '@/types/course';

const ALL_ROLES: readonly LearnerRole[] = [
  ...(Object.keys(ROLE_PATHS) as LearnerRole[]),
  'other',
];

describe('test-out content contract', () => {
  it('authors checks only for the Awareness ramp (modules 1-4)', () => {
    const moduleNumbers = TEST_OUT_CHECKS.map((check) => check.moduleNumber);
    expect(moduleNumbers).toEqual([1, 2, 3, 4]);
    for (const moduleNumber of moduleNumbers) {
      const mod = FOUNDATION_MICRO_MODULES.find((m) => m.number === moduleNumber);
      expect(mod?.pillar, `module ${moduleNumber} pillar`).toBe('awareness');
    }
  });

  it('gives every check exactly 3 questions with exactly one correct option each', () => {
    for (const check of TEST_OUT_CHECKS) {
      expect(check.questions.length, `module ${check.moduleNumber}`).toBe(3);
      for (const question of check.questions) {
        const correct = question.options.filter((option) => option.correct);
        expect(correct.length, `${question.id} correct options`).toBe(1);
        expect(question.options.length, `${question.id} options`).toBeGreaterThanOrEqual(3);
        const ids = question.options.map((option) => option.id);
        expect(new Set(ids).size, `${question.id} option ids unique`).toBe(ids.length);
      }
    }
  });

  it('keeps certificate-critical modules out of test-out for every role', () => {
    // The Final Packet (18) and all later-pillar modules must never be
    // skippable; eligibility is authored checks (1-4) only.
    for (const role of ALL_ROLES) {
      for (let moduleNumber = 5; moduleNumber <= 18; moduleNumber++) {
        expect(
          isTestOutEligible(moduleNumber, role),
          `module ${moduleNumber} for ${role}`,
        ).toBe(false);
      }
    }
  });

  it('makes the Awareness ramp eligible for every role, including "other"', () => {
    for (const role of ALL_ROLES) {
      for (let moduleNumber = 1; moduleNumber <= 4; moduleNumber++) {
        expect(
          isTestOutEligible(moduleNumber, role),
          `module ${moduleNumber} for ${role}`,
        ).toBe(true);
      }
    }
  });

  it('grades a pass only when every answer is correct', () => {
    const check = getTestOutCheck(1);
    expect(check).not.toBeNull();

    const perfect: Record<string, string> = {};
    for (const question of check!.questions) {
      perfect[question.id] = question.options.find((option) => option.correct)!.id;
    }
    expect(gradeTestOut(1, perfect)).toEqual({ passed: true, correctCount: 3, total: 3 });

    const oneWrong = { ...perfect };
    const firstQuestion = check!.questions[0];
    oneWrong[firstQuestion.id] = firstQuestion.options.find((option) => !option.correct)!.id;
    expect(gradeTestOut(1, oneWrong)).toEqual({ passed: false, correctCount: 2, total: 3 });

    expect(gradeTestOut(99, perfect).passed).toBe(false);
  });
});
