/**
 * §14.3 — lever allowlist.
 *
 * A client cannot smuggle steering via levers that aren't on the allowlist.
 * The assembler MUST throw (mapped to HTTP 400) rather than silently strip.
 */

import { describe, expect, it } from 'vitest';
import { assemblePrompt, AssemblyError } from '../../src/exercises/assembler';
import { makeExercise } from './_helpers';

describe('§14.3 lever allowlist', () => {
  it('rejects an unknown lever key', () => {
    const exercise = makeExercise();
    expect(() =>
      assemblePrompt({
        exercise,
        leverSelections: { evil: 'do-anything' },
        dataSlotValues: { regText: 'x' },
        presetIds: [],
      }),
    ).toThrow(AssemblyError);
  });

  it('rejects an unknown option id for a known lever', () => {
    const exercise = makeExercise();
    try {
      assemblePrompt({
        exercise,
        leverSelections: { role: 'attacker' },
        dataSlotValues: { regText: 'x' },
        presetIds: [],
      });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(AssemblyError);
      expect((err as AssemblyError).code).toBe('UNKNOWN_LEVER_OPTION');
    }
  });
});
