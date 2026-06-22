import { describe, expect, it } from 'vitest';
import {
  FOUNDATION_MICRO_MODULES,
} from '../../courses/foundation-program/micro-modules';
import { FOUNDATION_MODULE_COUNT } from '../../courses/foundation-program/course-config';
import { FOUNDATION_RECOMMENDATIONS } from './foundation-recommendations';

describe('FOUNDATION_RECOMMENDATIONS', () => {
  it('uses the current 18-module Foundation ladder and titles', () => {
    const moduleTitles = new Map(
      FOUNDATION_MICRO_MODULES.map((module) => [module.number, module.title]),
    );
    const recommended = new Set<number>();

    expect(FOUNDATION_MODULE_COUNT).toBe(18);

    for (const refs of Object.values(FOUNDATION_RECOMMENDATIONS)) {
      expect(refs).toHaveLength(3);

      for (const ref of refs) {
        recommended.add(ref.number);
        expect(ref.number).toBeGreaterThanOrEqual(1);
        expect(ref.number).toBeLessThanOrEqual(FOUNDATION_MODULE_COUNT);
        expect(ref.title).toBe(moduleTitles.get(ref.number));
        expect(ref.why).toMatch(/\S/);
      }
    }

    expect(recommended.has(13), 'recommends the skill builder module').toBe(true);
    expect(recommended.has(17), 'recommends the workflow kit module').toBe(true);
    expect(recommended.has(18), 'recommends the final packet module').toBe(true);
  });
});
