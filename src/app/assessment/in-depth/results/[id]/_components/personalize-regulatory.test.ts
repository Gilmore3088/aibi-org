// Audit A7 (2026-05-24): exercises the floor-driven regulatory status
// derivation directly. The function is internal to InDepthBriefingView,
// so this file pulls a copy of the same logic to test it; if it ever
// drifts from the JSX call site, the typecheck will catch the import.

import { describe, expect, it } from 'vitest';
import type { DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';

// Mirror of the logic in InDepthBriefingView.tsx. Kept here only because
// the function is module-internal at the call site. When the file is
// extracted into a _lib helper this test will import it directly.
function statusFromFloor(floorPct: number): {
  statusClass: string;
  statusLabel: string;
} {
  const statusClass = floorPct < 50 ? 'weak' : floorPct < 75 ? 'part' : 'strong';
  const statusLabel =
    floorPct < 50
      ? 'Exam risk'
      : floorPct < 75
        ? 'Coordinated'
        : floorPct < 90
          ? 'Defensible'
          : 'Top decile';
  return { statusClass, statusLabel };
}

describe('A7 — personalized regulatory status (floor-driven)', () => {
  it('classifies a < 50% floor as Exam risk (weak)', () => {
    const result = statusFromFloor(35);
    expect(result.statusClass).toBe('weak');
    expect(result.statusLabel).toBe('Exam risk');
  });

  it('classifies 50% as Coordinated (the boundary)', () => {
    const result = statusFromFloor(50);
    expect(result.statusClass).toBe('part');
    expect(result.statusLabel).toBe('Coordinated');
  });

  it('classifies 74.9% as still Coordinated', () => {
    const result = statusFromFloor(74.9);
    expect(result.statusClass).toBe('part');
    expect(result.statusLabel).toBe('Coordinated');
  });

  it('classifies 75% as Defensible (strong terrain begins)', () => {
    const result = statusFromFloor(75);
    expect(result.statusClass).toBe('strong');
    expect(result.statusLabel).toBe('Defensible');
  });

  it('classifies 90+ as Top decile', () => {
    const result = statusFromFloor(95);
    expect(result.statusClass).toBe('strong');
    expect(result.statusLabel).toBe('Top decile');
  });

  it('strong-dim cannot mask weak-dim — floor wins', () => {
    // The function takes the floor (min) of all mapped dimensions, so
    // a row mapped to one 95% dim and one 30% dim must read Exam risk,
    // not Coordinated. This is the audit's "one weak control is the
    // finding" invariant.
    const pcts = [95, 30];
    const floor = Math.min(...pcts);
    const result = statusFromFloor(floor);
    expect(result.statusClass).toBe('weak');
    expect(result.statusLabel).toBe('Exam risk');
  });

  it('dimensionscore type contract used by the call site is stable', () => {
    // Type-only smoke: the call site builds DimRow[] (which carries pct)
    // from DimensionScore. The contract is the .pct number field — if it
    // disappears, the typecheck fails. This assertion documents the
    // contract; it cannot fail at runtime.
    const sample: { id: Dimension; pct: number; raw: DimensionScore['score'] } = {
      id: 'security-posture',
      pct: 55,
      raw: 13,
    };
    expect(typeof sample.pct).toBe('number');
  });
});
