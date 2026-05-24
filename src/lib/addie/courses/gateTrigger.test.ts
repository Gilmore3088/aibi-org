// gateTrigger — unit tests for the gate-fire predicate.

import { describe, it, expect } from 'vitest';
import {
  shouldTriggerGate,
  GATE_TRIGGER_MODULE_ID,
  GATE_TRIGGER_LESSON_ID,
} from './gateTrigger';

describe('shouldTriggerGate', () => {
  it('fires on m3 / m3.5 completion (Set state)', () => {
    expect(
      shouldTriggerGate('m3', 'm3.5', {
        completedLessonIds: new Set(['m3.1', 'm3.2', 'm3.3', 'm3.4', 'm3.5']),
      })
    ).toBe(true);
  });

  it('fires on m3 / m3.5 completion (Array state)', () => {
    expect(
      shouldTriggerGate('m3', 'm3.5', {
        completedLessonIds: ['m3.5'],
      })
    ).toBe(true);
  });

  it('does not fire when m3.5 is not yet marked complete', () => {
    expect(
      shouldTriggerGate('m3', 'm3.5', {
        completedLessonIds: new Set(['m3.1', 'm3.2', 'm3.3', 'm3.4']),
      })
    ).toBe(false);
  });

  it('does not fire on earlier m3 lessons', () => {
    const state = { completedLessonIds: new Set(['m3.1']) };
    expect(shouldTriggerGate('m3', 'm3.1', state)).toBe(false);
    expect(shouldTriggerGate('m3', 'm3.2', state)).toBe(false);
    expect(shouldTriggerGate('m3', 'm3.4', state)).toBe(false);
  });

  it('does not fire on other modules', () => {
    const state = { completedLessonIds: new Set(['m0.2', 'm1.4', 'm2.4']) };
    expect(shouldTriggerGate('m0', 'm0.2', state)).toBe(false);
    expect(shouldTriggerGate('m1', 'm1.4', state)).toBe(false);
    expect(shouldTriggerGate('m2', 'm2.4', state)).toBe(false);
  });

  it('exports stable trigger constants', () => {
    expect(GATE_TRIGGER_MODULE_ID).toBe('m3');
    expect(GATE_TRIGGER_LESSON_ID).toBe('m3.5');
  });
});
