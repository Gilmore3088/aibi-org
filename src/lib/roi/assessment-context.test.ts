import { describe, expect, it } from 'vitest';
import {
  buildRoiAssessmentHref,
  calculateRoiContext,
  parseRoiAssessmentContext,
} from './assessment-context';

describe('ROI assessment context', () => {
  it('builds a compact assessment URL from calculator inputs', () => {
    const href = buildRoiAssessmentHref('/assessment/take', {
      fte: 50,
      costPerFTE: 85_000,
      loHours: 2,
      hiHours: 5,
    });

    expect(href).toBe(
      '/assessment/take?roi=calculator&roi_fte=50&roi_cost=85000&roi_lo=2&roi_hi=5',
    );
  });

  it('preserves existing query params and hash when adding ROI context', () => {
    const href = buildRoiAssessmentHref('/assessment/take?utm_source=partner#start', {
      fte: 12,
      costPerFTE: 70_000,
      loHours: 1,
      hiHours: 3,
    });

    expect(href).toBe(
      '/assessment/take?utm_source=partner&roi=calculator&roi_fte=12&roi_cost=70000&roi_lo=1&roi_hi=3#start',
    );
  });

  it('does not rewrite non-site links', () => {
    const href = 'mailto:hello@aibankinginstitute.com?subject=ROI';
    expect(buildRoiAssessmentHref(href, {
      fte: 50,
      costPerFTE: 85_000,
      loHours: 2,
      hiHours: 5,
    })).toBe(href);
  });

  it('parses and recalculates bounded ROI context from URL params', () => {
    const context = parseRoiAssessmentContext(
      new URLSearchParams('roi=calculator&roi_fte=50&roi_cost=85000&roi_lo=2&roi_hi=5'),
    );

    expect(context).toMatchObject({
      fte: 50,
      costPerFTE: 85_000,
      loHours: 2,
      hiHours: 5,
      hoursPerYear: 8750,
      payrollRecaptured: '8.4',
    });
    expect(context?.mid).toBeCloseTo(357_572.12, 2);
  });

  it('returns null without a complete ROI source marker', () => {
    expect(parseRoiAssessmentContext(new URLSearchParams('roi_fte=50'))).toBeNull();
    expect(parseRoiAssessmentContext(new URLSearchParams('roi=calculator&roi_fte=50'))).toBeNull();
  });

  it('normalizes inverted hour ranges', () => {
    const context = calculateRoiContext({
      fte: 10,
      costPerFTE: 100_000,
      loHours: 8,
      hiHours: 3,
    });

    expect(context.loHours).toBe(8);
    expect(context.hiHours).toBe(8);
  });
});
